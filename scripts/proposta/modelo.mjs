// ── Modelo de proposta comercial da Anders Tech (HTML → PDF) ─────────────────
// Criado em 23/11/2026; identidade do CLAUDE.md §5 (navy, vermelho, Poppins,
// diamante). Revisado no mesmo dia a pedido do Anders: a primeira versão abria
// com preço e com uma tabela de 30 linhas e era "difícil de entender".
// Ordem de leitura agora: o que o cliente recebe → como vamos trabalhar →
// cronograma → sistema incluído → investimento → partes e contrato.
// Sem QR: o Anders não quer medir acesso. Dados do cliente ficam FORA do repo.

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const moeda = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const horas = (h) => Number(h).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' h';
export const data = (iso) => { const [a, m, d] = String(iso).split('-'); return `${d}/${m}/${a}`; };
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const dataExtenso = (iso) => { const [a, m, d] = String(iso).split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${a}`; };
const ROTULO_TIPO = { consultoria: 'Consultoria', treinamento: 'Treinamento', auditoria: 'Auditoria' };

// Totais derivados do cronograma: a tabela de investimento nunca é digitada à mão.
export function calcular(d) {
  const porTipo = {};
  for (const f of d.cronograma) for (const i of f.itens) porTipo[i.tipo] = (porTipo[i.tipo] || 0) + i.horas;
  const linhas = Object.keys(ROTULO_TIPO).filter((t) => porTipo[t]).map((t) => ({
    tipo: t, descricao: ROTULO_TIPO[t], horas: porTipo[t], valor: porTipo[t] * d.investimento.valorHora,
  }));
  const totalHoras = linhas.reduce((s, l) => s + l.horas, 0);
  const total = linhas.reduce((s, l) => s + l.valor, 0);
  const av = d.pagamento.avista;
  const avista = av ? Math.round(total * (1 - av.descontoPct / 100) * 100) / 100 : null;
  return { linhas, totalHoras, total, avista };
}

const losango = (cls = '') => `<span class="losango ${cls}"></span>`;
const secao = (num, rotulo, titulo) => `<div class="secao">${losango()}<span>${esc(num)} · ${esc(rotulo)}</span></div><h2>${esc(titulo)}</h2>`;
const nomeCliente = (d) => d.contratante.fantasia || d.contratante.razaoSocial;

function capa(d, c, r) {
  return `
<section class="capa">
  <div class="capa-deco" aria-hidden="true"><i></i><i></i><i></i></div>
  <header class="capa-topo">
    <img class="capa-logo" src="${r.logoBranco}" alt="Anders Tech">
    <div class="capa-num"><small>Proposta nº</small>${esc(d.numero)}</div>
  </header>
  <div class="capa-meio">
    <div class="tag">${losango('branco')} Proposta de consultoria</div>
    <h1>${esc(d.titulo)}</h1>
    <div class="capa-norma">${esc(d.norma)}</div>
    <p class="capa-para">Preparada para <b>${esc(d.contratante.razaoSocial)}</b><br>${esc(d.contratante.cidade)}</p>
  </div>
  <div class="capa-meta">
    <div><small>Data</small>${data(d.data)}</div>
    <div><small>Válida até</small>${data(d.validade)}</div>
    <div><small>Consultor</small>${esc(d.consultor.nome)}</div>
  </div>
</section>`;
}

function resumo(d, c) {
  const tiles = [
    [horas(c.totalHoras), 'de trabalho presencial na empresa'],
    [`${d.resultado.prazoMeses} meses`, 'até a auditoria de certificação'],
    [`${d.cronograma.length} etapas`, 'do treinamento à certificação'],
    [d.prismabiz ? d.prismabiz.nome : '—', 'sistema da qualidade incluído'],
  ];
  return `
<section class="pagina">
  ${secao('01', 'Resumo', `O que a ${nomeCliente(d)} vai receber`)}
  <div class="tiles">${tiles.map(([v, s]) => `<div class="tile"><b>${esc(v)}</b><span>${esc(s)}</span></div>`).join('')}</div>
  <ul class="entregas">${(d.entregas || []).map((e) => `<li>${losango()}<span>${esc(e)}</span></li>`).join('')}</ul>
  ${d.nota ? `<div class="nota"><b>${esc(d.nota.titulo)}</b><p>${esc(d.nota.texto)}</p></div>` : ''}
</section>`;
}

function etapas(d) {
  return `
<section class="pagina quebra">
  ${secao('02', 'Como vamos trabalhar', `${d.cronograma.length} etapas, do treinamento à certificação`)}
  <div class="etapas">${d.cronograma.map((f, i) => `
    <div class="etapa">
      <div class="etapa-n">${String(i + 1).padStart(2, '0')}</div>
      <div class="etapa-txt">
        <div class="etapa-tit">${esc(f.fase)} <span>${horas(f.itens.reduce((s, x) => s + x.horas, 0))}</span></div>
        <p>${esc(f.descricao || '')}</p>
      </div>
    </div>`).join('')}
  </div>
  <p class="mini">Os encontros são presenciais, na empresa, com agenda ${esc(d.agenda)} O cronograma detalhado, atividade por atividade, está nas próximas páginas.</p>
</section>`;
}

function cronograma(d, c) {
  const blocos = d.cronograma.map((f, fi) => {
    const sub = f.itens.reduce((s, i) => s + i.horas, 0);
    return `<tbody class="fase"><tr class="fase-tit"><td><span class="fase-n">${String(fi + 1).padStart(2, '0')}</span>${esc(f.fase)}</td><td class="h">${horas(sub)}</td></tr>
      ${f.itens.map((i) => `<tr><td>${esc(i.atividade)}${i.tipo === 'auditoria' ? ' <em>(auditoria)</em>' : ''}</td><td class="h">${horas(i.horas)}</td></tr>`).join('')}
    </tbody>`;
  }).join('');
  return `
<section class="pagina quebra">
  ${secao('03', 'Cronograma detalhado', 'Atividade por atividade')}
  <table class="crono">
    <thead><tr><th>Atividade</th><th class="h">Horas</th></tr></thead>
    ${blocos}
    <tfoot><tr><td>Total</td><td class="h">${horas(c.totalHoras)}</td></tr></tfoot>
  </table>
</section>`;
}

function prisma(d) {
  const x = d.prismabiz;
  if (!x) return '';
  return `
<section class="pagina quebra">
  ${secao('04', 'Sistema incluído', x.titulo)}
  <p class="prisma-lead">${esc(x.oQueE)}</p>
  <h3>Onde cada requisito da ISO 9001 fica no sistema</h3>
  <table class="req"><thead><tr><th>Requisito</th><th>No ${esc(x.nome)}</th></tr></thead>
    <tbody>${x.requisitos.map(([r, m]) => `<tr><td>${esc(r)}</td><td>${esc(m)}</td></tr>`).join('')}</tbody></table>
  <div class="duas prisma-fim">
    <div><h3>O que muda na prática</h3><p>${esc(x.naPratica)}</p></div>
    <div class="licenca"><small>Licença vitalícia incluída</small><b>Plano ${esc(x.licenca.plano)}</b><p>${esc(x.licenca.texto)}</p>
      <div class="ref">Valor de referência hoje: ${moeda(x.licenca.valorMensal)} por mês</div></div>
  </div>
</section>`;
}

function investimento(d, c) {
  const p = d.pagamento, av = p.avista, k = d.consultor;
  return `
<section class="pagina quebra">
  ${secao('05', 'Investimento', 'Valores e forma de pagamento')}
  <p class="lead">Valor das ${horas(c.totalHoras)} de trabalho presencial, com o ${esc(d.prismabiz ? d.prismabiz.nome : 'sistema')} incluído.</p>
  <table class="inv">
    <thead><tr><th>Descrição</th><th class="n">Valor hora</th><th class="n">Horas</th><th class="n">Valor total</th></tr></thead>
    <tbody>${c.linhas.map((l) => `<tr><td>${esc(l.descricao)}</td><td class="n">${moeda(d.investimento.valorHora)}</td><td class="n">${horas(l.horas)}</td><td class="n">${moeda(l.valor)}</td></tr>`).join('')}</tbody>
    <tfoot><tr><td>Total</td><td></td><td class="n">${horas(c.totalHoras)}</td><td class="n">${moeda(c.total)}</td></tr></tfoot>
  </table>
  <h3>Formas de pagamento</h3>
  <div class="pag">
    ${p.parcelado ? `<div class="pag-op">
      <div class="pag-tit">a) ${esc(p.parcelado.titulo)}</div>
      <table class="parc"><thead><tr><th>Parcela</th><th>Vencimento</th><th class="n">Valor</th></tr></thead>
      <tbody>${p.parcelado.parcelas.map((x, i) => `<tr><td>${i + 1}ª</td><td>${data(x.vencimento)}</td><td class="n">${moeda(x.valor)}</td></tr>`).join('')}</tbody></table>
      ${p.parcelado.observacao ? `<p class="mini">${esc(p.parcelado.observacao)}</p>` : ''}
    </div>` : ''}
    ${av ? `<div class="pag-op pag-avista">
      <div class="pag-tit">b) À vista, com ${esc(av.descontoPct)}% de ${esc(av.rotulo)}</div>
      <div class="de">De ${moeda(c.total)} por</div>
      <div class="por">${moeda(c.avista)}</div>
      <div class="ate">Condição válida até ${data(av.ate)}</div>
    </div>` : ''}
  </div>
  <div class="validade">${losango()}<span>Esta proposta é válida até <b>${dataExtenso(d.validade)}</b>.</span></div>
  <div class="consultor">
    <div class="cons-av">${esc(k.nome.split(' ').map((x) => x[0]).slice(0, 2).join(''))}</div>
    <div><small>Consultor responsável</small><b>${esc(k.nome)}</b><p>${esc(k.cargo)}${k.cvUrl ? ` · <a href="${esc(k.cvUrl)}">ver currículo</a>` : ''}</p></div>
  </div>
</section>`;
}

function contrato(d) {
  const k = d.contrato, a = d.contratado, b = d.contratante;
  const card = (titulo, p, campos) => `<div class="parte"><div class="parte-tit">${esc(titulo)}</div>
    <div class="parte-nome">${esc(p.razaoSocial)}</div>
    <dl>${campos.filter(([, v]) => v).map(([kk, v]) => `<dt>${esc(kk)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>`;
  const cl = (c) => `<div class="cl"><p><b>${esc(c.rotulo)}:</b> ${esc(c.texto)}</p>
    ${c.itens ? `<ol class="alin">${c.itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>` : ''}
    ${c.paragrafo ? `<p><b>Parágrafo único:</b> ${esc(c.paragrafo)}</p>` : ''}</div>`;
  const assin = (titulo, nome, doc) => `<div class="assin"><div class="linha"></div><b>${esc(titulo)}</b><span>${esc(nome || 'Nome:')}</span><span>${esc(doc || 'CPF:')}</span></div>`;
  return `
<section class="pagina quebra contrato">
  ${secao('06', 'Contrato', k.titulo)}
  <div class="partes">
    ${card('Contratante', b, [['CNPJ', b.cnpj], ['Endereço', [b.endereco, b.cidade].filter(Boolean).join(', ')], ['Contato', b.contato], ['Telefone', b.telefone], ['E-mail', b.email]])}
    ${card('Contratado', a, [['CNPJ', a.cnpj], ['Endereço', `${a.endereco}, ${a.cidade}`], ['Consultor', a.consultor], ['Telefone', a.telefone], ['E-mail', a.email]])}
  </div>
  <p>${esc(k.preambulo.filter((p) => !p.rotulo).map((p) => p.texto).join(' '))}</p>
  ${k.secoes.map((s) => `<div class="sec-contrato"><h4>${esc(s.titulo)}</h4>${s.clausulas.map(cl).join('')}</div>`).join('')}
  <p>${esc(k.fecho)}</p>
  <p class="local">${esc(k.localData)}</p>
  <div class="assinaturas">
    ${assin('Contratante', b.razaoSocial, `CNPJ ${b.cnpj}`)}
    ${assin('Contratado', a.razaoSocial, `CNPJ ${a.cnpj}`)}
    ${assin('Testemunha 1')}
    ${assin('Testemunha 2')}
  </div>
</section>`;
}

const CSS = `
@page{size:A4;margin:18mm 20mm 24mm 20mm}
@page:first{margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'Poppins';font-size:9.6pt;line-height:1.55;color:#16233f}
b,strong{font-weight:600}
em{font-style:normal;color:#8190ac}
a{color:#203864}
.losango{display:inline-block;width:2.1mm;height:2.1mm;background:#FE0000;transform:rotate(45deg);flex:none}
.losango.branco{background:#fff}

/* Capa */
.capa{position:relative;width:210mm;height:297mm;background:#0b1730;color:#fff;overflow:hidden;page-break-after:always}
.capa-deco i{position:absolute;border:1.2pt solid rgba(185,200,228,.13);transform:rotate(45deg)}
.capa-deco i:nth-child(1){width:150mm;height:150mm;right:-62mm;top:52mm}
.capa-deco i:nth-child(2){width:96mm;height:96mm;right:-20mm;top:80mm;border-color:rgba(254,0,0,.55)}
.capa-deco i:nth-child(3){width:40mm;height:40mm;right:38mm;top:212mm;background:#12233f;border:0}
.capa-topo{position:absolute;left:20mm;right:20mm;top:20mm;display:flex;justify-content:space-between;align-items:flex-start}
.capa-logo{width:58mm}
.capa-num{text-align:right;font-weight:600;font-size:10pt}
.capa-num small{display:block;font-weight:400;font-size:7.5pt;color:#b9c8e4;letter-spacing:.12em;text-transform:uppercase}
.capa-meio{position:absolute;left:20mm;width:130mm;top:88mm}
.tag{display:inline-flex;align-items:center;gap:3mm;font-size:8pt;font-weight:600;letter-spacing:.16em;text-transform:uppercase;background:#FE0000;padding:2mm 4mm}
.capa h1{font-size:28pt;line-height:1.14;font-weight:600;margin-top:9mm}
.capa-norma{display:inline-block;margin-top:6mm;font-size:15pt;font-weight:700;border-bottom:2.5pt solid #FE0000;padding-bottom:1.5mm}
.capa-para{margin-top:12mm;font-size:10.5pt;line-height:1.55;color:#b9c8e4}
.capa-para b{color:#fff;font-weight:600}
.capa-meta{position:absolute;left:20mm;right:20mm;bottom:36mm;display:grid;grid-template-columns:repeat(3,1fr);border-top:.6pt solid rgba(185,200,228,.3);padding-top:5mm}
.capa-meta div{font-size:10.5pt;font-weight:600}
.capa-meta small{display:block;font-size:7pt;font-weight:400;color:#b9c8e4;letter-spacing:.12em;text-transform:uppercase;margin-bottom:1mm}

/* Estrutura */
.quebra{page-break-before:always}
.secao{display:flex;align-items:center;gap:3mm;font-size:7.6pt;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#FE0000}
h2{font-size:18pt;line-height:1.2;font-weight:600;color:#0b1730;margin:2mm 0 7mm}
h3{font-size:10.5pt;font-weight:600;color:#0b1730;margin:7mm 0 2.5mm}
h4{font-size:8.6pt;font-weight:600;color:#0b1730;letter-spacing:.08em;text-transform:uppercase;margin:4.5mm 0 1.5mm}
p{margin-bottom:2.2mm}
.mini{font-size:8.2pt;color:#46577a;margin-top:5mm}
.lead{font-size:10pt;color:#16233f;margin-bottom:4mm}
.duas{display:grid;grid-template-columns:1fr 1fr;gap:8mm}

/* 01 Resumo */
.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-bottom:8mm}
.tile{background:#0b1730;color:#fff;padding:5mm 4.5mm;border-bottom:1.2mm solid #FE0000}
.tile b{display:block;font-size:16pt;line-height:1.15;font-weight:600}
.tile span{display:block;font-size:7.8pt;color:#b9c8e4;margin-top:1.5mm;line-height:1.35}
.entregas{list-style:none}
.entregas li{display:flex;gap:4mm;align-items:flex-start;font-size:10.6pt;line-height:1.5;padding:3.4mm 0;border-bottom:.5pt solid #dfe5ee}
.entregas li .losango{margin-top:2.2mm}
.nota{margin-top:9mm;background:#F4F6FA;border-left:1.2mm solid #FE0000;padding:5mm 6mm}
.nota b{color:#0b1730;font-size:10pt}
.nota p{font-size:9pt;color:#46577a;margin:1.5mm 0 0}

/* 02 Etapas */
.etapas{display:flex;flex-direction:column;gap:3.5mm}
.etapa{display:flex;gap:5mm;align-items:stretch;background:#F4F6FA;padding:4.5mm 5mm;break-inside:avoid}
.etapa-n{flex:none;width:12mm;height:12mm;display:flex;align-items:center;justify-content:center;background:#0b1730;color:#fff;font-weight:700;font-size:11pt;border-bottom:1mm solid #FE0000}
.etapa-tit{font-weight:600;font-size:11pt;color:#0b1730;display:flex;justify-content:space-between;gap:4mm}
.etapa-tit span{font-size:9pt;color:#203864;white-space:nowrap}
.etapa p{font-size:9.4pt;color:#46577a;margin:1mm 0 0}

/* Tabelas */
table{width:100%;border-collapse:collapse}
th{font-size:7.2pt;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:#0b1730;text-align:left;padding:2.2mm 3.5mm}
td{padding:1.9mm 3.5mm;border-bottom:.5pt solid #dfe5ee;vertical-align:top}
thead{display:table-header-group}
tr{break-inside:avoid}
.h,.n{text-align:right;white-space:nowrap}
.crono{font-size:9pt}
.crono .fase{break-inside:avoid}
.fase-tit td{background:#F4F6FA;font-weight:600;color:#0b1730;border-bottom:.6pt solid #C9D2E0;padding-top:2.6mm}
.fase-n{display:inline-block;width:8mm;color:#FE0000;font-weight:700}
tfoot td{font-weight:700;color:#0b1730;border-top:1.2pt solid #0b1730;border-bottom:0;padding-top:2.4mm}

/* 04 PrismaBiz */
.req{font-size:7.8pt;line-height:1.3;margin-bottom:1mm}
.req td:first-child{width:46%;font-weight:500;color:#0b1730}
.req td{padding:.75mm 3.5mm}
.prisma-fim{break-inside:avoid}
.prisma-fim h3{margin-top:4mm}
.prisma-lead{font-size:9.2pt;margin-bottom:2mm}
.licenca{background:#0b1730;color:#fff;padding:4.5mm 5mm;margin-top:4mm}
.licenca small{display:block;font-size:7pt;letter-spacing:.12em;text-transform:uppercase;color:#b9c8e4}
.licenca b{display:block;font-size:13pt;margin:1mm 0 2mm}
.licenca p{font-size:8.6pt;color:#dfe6f3}
.licenca .ref{font-size:8.4pt;font-weight:600;border-top:.6pt solid rgba(185,200,228,.3);padding-top:2mm;margin-top:2mm}

/* 05 Investimento */
.inv{font-size:9.6pt}
.pag{display:grid;grid-template-columns:1.2fr 1fr;gap:7mm;align-items:start}
.pag-tit{font-weight:600;color:#0b1730;margin-bottom:2.5mm}
.parc{font-size:8.8pt}
.parc td{padding:1.3mm 3.5mm}
.pag-avista{background:#0b1730;color:#fff;padding:6mm}
.pag-avista .pag-tit{color:#fff}
.de{font-size:9pt;color:#b9c8e4;margin-top:3mm}
.por{font-size:24pt;font-weight:700;line-height:1.15;margin:1mm 0 4mm}
.ate{display:inline-block;font-size:8.4pt;font-weight:600;background:#FE0000;padding:1.8mm 3.5mm}
.validade{display:flex;align-items:center;gap:3mm;margin-top:8mm;font-size:9.6pt;padding:3.5mm 5mm;background:#F4F6FA}
.consultor{display:flex;gap:5mm;align-items:center;margin-top:5mm;border:.6pt solid #dfe5ee;padding:4.5mm 5mm;break-inside:avoid}
.cons-av{width:13mm;height:13mm;flex:none;display:flex;align-items:center;justify-content:center;background:#0b1730;color:#fff;font-weight:700;font-size:11pt;border-bottom:1mm solid #FE0000}
.consultor small{display:block;font-size:7pt;letter-spacing:.12em;text-transform:uppercase;color:#8190ac}
.consultor b{display:block;font-size:11pt;color:#0b1730}
.consultor p{margin:0;color:#46577a;font-size:9pt}

/* 06 Contrato */
.partes{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-bottom:6mm;text-align:left}
.parte{background:#F4F6FA;padding:4mm 5mm;border-left:1.2mm solid #203864}
.parte-tit{font-size:7pt;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#FE0000}
.parte-nome{font-weight:600;font-size:9pt;line-height:1.3;color:#0b1730;margin:1mm 0 2mm}
.parte dl{display:grid;grid-template-columns:17mm 1fr;gap:.6mm 2mm;font-size:7.8pt}
.parte dt{color:#8190ac}
.parte dd{overflow-wrap:anywhere}
.contrato{font-size:8.8pt;text-align:justify}
.contrato .cl,.sec-contrato{break-inside:avoid}
.alin{list-style:lower-alpha;padding-left:6mm;margin:-1mm 0 2mm}
.alin li{margin-bottom:.6mm}
.local{margin-top:4mm;font-weight:600;color:#0b1730}
.assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:13mm 10mm;margin-top:15mm;break-inside:avoid;text-align:left}
.assin .linha{border-top:.7pt solid #0b1730;margin-bottom:1.5mm}
.assin b{display:block;font-size:7.4pt;letter-spacing:.12em;text-transform:uppercase;color:#0b1730}
.assin span{display:block;font-size:7.8pt;color:#46577a}
`;

export function htmlProposta(d, r) {
  const c = calcular(d);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Proposta ${esc(d.numero)}</title>
<style>${r.fontesCss}${CSS}</style></head><body>
${capa(d, c, r)}
${resumo(d, c)}
${etapas(d)}
${cronograma(d, c)}
${prisma(d)}
${investimento(d, c)}
${contrato(d)}
</body></html>`;
}

// Rodapé de uma linha, desenhado pelo Chromium em toda página (também sobre a
// capa navy, por isso a cor cinza-azulada, que lê nos dois fundos).
export function rodapeTemplate(d, r) {
  return `<style>${r.fontesCssRodape}
html,body{margin:0;padding:0}
.rod{position:relative;width:210mm;height:24mm;font-family:'Poppins';font-size:7.4pt;color:#8190ac;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.fil{position:absolute;left:20mm;right:20mm;bottom:15mm;border-top:.5pt solid #C9D2E0}
.l,.r{position:absolute;bottom:9.5mm;white-space:nowrap;line-height:1}
.l{left:20mm}.r{right:20mm}
.los{display:inline-block;width:1.7mm;height:1.7mm;background:#FE0000;transform:rotate(45deg);margin-right:2mm;position:relative;top:-.2mm}
b{font-weight:600;letter-spacing:.08em}
</style>
<div class="rod"><div class="fil"></div>
<div class="l"><span class="los"></span><b>ANDERS TECH</b> · Proposta ${esc(d.numero)}</div>
<div class="r">anderstech.net · ${esc(d.contratado.telefone)} · página <span class="pageNumber"></span> de <span class="totalPages"></span></div></div>`;
}
