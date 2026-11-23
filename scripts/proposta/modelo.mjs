// ── Modelo de proposta comercial da Anders Tech (HTML → PDF) ─────────────────
// Criado em 23/11/2026: o CLAUDE.md citava um gerador Python externo, que não
// existe. A identidade segue o CLAUDE.md §5 (navy, vermelho, Poppins, diamante)
// e o rodapé segue SPEC-RODAPE-ARTEFATOS.md (QR /r/<código> em toda página).
// Só layout: os dados de cada cliente ficam FORA do repositório (é público).

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

function capa(d, c, r) {
  const ct = d.contratante;
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
    <p class="capa-para">Preparada para <b>${esc(ct.razaoSocial)}</b><br>${esc(ct.cidade)}</p>
  </div>
  <div class="capa-meta">
    <div><small>Data</small>${data(d.data)}</div>
    <div><small>Válida até</small>${data(d.validade)}</div>
    <div><small>Carga horária</small>${horas(c.totalHoras)}</div>
    <div><small>Consultor</small>${esc(d.consultor.nome)}</div>
  </div>
  <div class="capa-base"></div>
</section>`;
}

function partes(d) {
  const card = (titulo, p, campos) => `<div class="parte"><div class="parte-tit">${esc(titulo)}</div>
    <div class="parte-nome">${esc(p.razaoSocial)}</div>
    <dl>${campos.filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>`;
  const a = d.contratado, b = d.contratante;
  return `<div class="partes">
    ${card('Contratado', a, [['Nome fantasia', a.fantasia], ['CNPJ', a.cnpj], ['Endereço', `${a.endereco}, ${a.cidade}`], ['Consultor', a.consultor], ['Telefone', a.telefone], ['E-mail', a.email]])}
    ${card('Contratante', b, [['CNPJ', b.cnpj], ['Endereço', [b.endereco, b.cidade].filter(Boolean).join(', ')], ['Contato', b.contato], ['Telefone', b.telefone], ['E-mail', b.email], ['Atividade', b.atividade]])}
  </div>`;
}

function resumo(d, c) {
  const av = d.pagamento.avista;
  const barras = c.linhas.map((l) => `<div class="barra"><span>${esc(l.descricao)}</span><i style="width:${(l.horas / c.totalHoras * 100).toFixed(1)}%"></i><b>${horas(l.horas)}</b></div>`).join('');
  return `
<section class="pagina">
  ${secao('01', 'Visão geral', 'O que esta proposta entrega')}
  <div class="kpis">
    <div class="kpi"><small>Carga horária</small><b>${horas(c.totalHoras)}</b><span>presenciais, in company</span></div>
    <div class="kpi"><small>Prazo até a certificação</small><b>${esc(d.resultado.prazoMeses)} meses</b><span>conforme cronograma</span></div>
    <div class="kpi"><small>Investimento</small><b>${moeda(c.total)}</b><span>${d.pagamento.parcelado ? `ou ${d.pagamento.parcelado.parcelas.length}× de ${moeda(d.pagamento.parcelado.parcelas[0].valor)}` : ''}</span></div>
    ${av ? `<div class="kpi kpi-red"><small>À vista até ${data(av.ate)}</small><b>${moeda(c.avista)}</b><span>${esc(av.descontoPct)}% de ${esc(av.rotulo)}</span></div>` : ''}
  </div>
  ${partes(d)}
  <div class="duas">
    <div>
      <h3>Escopo</h3>
      <p>${esc(d.escopo)}</p>
      <h3>Resultado esperado</h3>
      <p>${esc(d.resultado.texto)}</p>
    </div>
    <div>
      <h3>Solução proposta</h3>
      <div class="barras">${barras}</div>
      <p class="mini">Distribuição das ${horas(c.totalHoras)} conforme o cronograma das atividades.</p>
    </div>
  </div>
  ${d.nota ? `<div class="nota">${losango()}<div><b>${esc(d.nota.titulo)}</b><p>${esc(d.nota.texto)}</p></div></div>` : ''}
</section>`;
}

function cronograma(d, c) {
  const linhas = d.cronograma.map((f, fi) => {
    const sub = f.itens.reduce((s, i) => s + i.horas, 0);
    return `<tbody class="fase"><tr class="fase-tit"><td colspan="2"><span class="fase-n">${String(fi + 1).padStart(2, '0')}</span>${esc(f.fase)}</td><td class="h">${horas(sub)}</td></tr>
      ${f.itens.map((i) => `<tr><td>${esc(i.atividade)}</td><td><span class="chip chip-${esc(i.tipo)}">${esc(ROTULO_TIPO[i.tipo])}</span></td><td class="h">${horas(i.horas)}</td></tr>`).join('')}
    </tbody>`;
  }).join('');
  return `
<section class="pagina quebra">
  ${secao('02', 'Cronograma das atividades', `${d.cronograma.length} etapas, ${horas(c.totalHoras)}`)}
  <table class="crono">
    <thead><tr><th>Atividade</th><th>Tipo</th><th class="h">Horas</th></tr></thead>
    ${linhas}
    <tfoot><tr><td colspan="2">Total</td><td class="h">${horas(c.totalHoras)}</td></tr></tfoot>
  </table>
  <p class="mini">Agenda das assessorias: ${esc(d.agenda)}</p>
</section>`;
}

function investimento(d, c) {
  const p = d.pagamento, av = p.avista;
  return `
<section class="pagina quebra">
  ${secao('03', 'Investimento', 'Valores e forma de pagamento')}
  <table class="inv">
    <thead><tr><th>Descrição</th><th class="n">Valor hora</th><th class="n">Horas</th><th class="n">Valor total</th></tr></thead>
    <tbody>${c.linhas.map((l) => `<tr><td>${esc(l.descricao)}</td><td class="n">${moeda(d.investimento.valorHora)}</td><td class="n">${horas(l.horas)}</td><td class="n">${moeda(l.valor)}</td></tr>`).join('')}</tbody>
    <tfoot><tr><td>Total do investimento</td><td class="n">${moeda(d.investimento.valorHora)}</td><td class="n">${horas(c.totalHoras)}</td><td class="n">${moeda(c.total)}</td></tr></tfoot>
  </table>
  <div class="pag">
    ${p.parcelado ? `<div class="pag-op">
      <div class="pag-tit"><span>a)</span> ${esc(p.parcelado.titulo)}</div>
      <table class="parc"><thead><tr><th>Parcela</th><th>Vencimento</th><th class="n">Valor</th></tr></thead>
      <tbody>${p.parcelado.parcelas.map((x, i) => `<tr><td>${i + 1}</td><td>${data(x.vencimento)}</td><td class="n">${moeda(x.valor)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="2">Total</td><td class="n">${moeda(p.parcelado.parcelas.reduce((s, x) => s + x.valor, 0))}</td></tr></tfoot></table>
      ${p.parcelado.observacao ? `<p class="mini">${esc(p.parcelado.observacao)}</p>` : ''}
    </div>` : ''}
    ${av ? `<div class="pag-op pag-avista">
      <div class="pag-tit"><span>b)</span> À vista, com ${esc(av.descontoPct)}% de ${esc(av.rotulo)}</div>
      <div class="de">De ${moeda(c.total)}</div>
      <div class="por">${moeda(c.avista)}</div>
      <div class="ate">${losango('branco')} Condição válida até ${data(av.ate)}</div>
    </div>` : ''}
  </div>
  <div class="validade">${losango()}<span>Esta proposta é válida até <b>${dataExtenso(d.validade)}</b>.</span></div>
</section>`;
}

function prisma(d) {
  const x = d.prismabiz;
  if (!x) return '';
  return `
<section class="pagina quebra">
  ${secao('05', 'Sistema incluído', x.titulo)}
  <p class="lead">${esc(x.oQueE)}</p>
  <h3>Como o sistema apoia cada requisito da ISO 9001</h3>
  <table class="req"><thead><tr><th>Requisito</th><th>Onde fica no ${esc(x.nome)}</th></tr></thead>
    <tbody>${x.requisitos.map(([r, m]) => `<tr><td>${esc(r)}</td><td>${esc(m)}</td></tr>`).join('')}</tbody></table>
  <div class="duas prisma-fim">
    <div><h3>O que muda na prática</h3><p>${esc(x.naPratica)}</p></div>
    <div class="licenca"><small>Licença vitalícia incluída</small><b>Plano ${esc(x.licenca.plano)}</b><p>${esc(x.licenca.texto)}</p>
      <div class="ref">Valor de referência hoje: ${moeda(x.licenca.valorMensal)} por mês</div></div>
  </div>
</section>`;
}

function consultor(d) {
  const k = d.consultor;
  return `
<section class="pagina quebra-evitar">
  ${secao('04', 'Consultor designado', k.nome)}
  <div class="consultor">
    <div class="cons-av">${esc(k.nome.split(' ').map((p) => p[0]).slice(0, 2).join(''))}</div>
    <div><b>${esc(k.nome)}</b><p>${esc(k.cargo)}</p>
      ${k.cvUrl ? `<p class="mini">Currículo: <a href="${esc(k.cvUrl)}">abrir o currículo completo</a></p>` : ''}</div>
  </div>
</section>`;
}

function contrato(d) {
  const k = d.contrato;
  const cl = (c) => `<div class="cl"><p><b>${esc(c.rotulo)}:</b> ${esc(c.texto)}</p>
    ${c.itens ? `<ol class="alin">${c.itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>` : ''}
    ${c.paragrafo ? `<p><b>Parágrafo único:</b> ${esc(c.paragrafo)}</p>` : ''}</div>`;
  const assin = (titulo, nome, doc) => `<div class="assin"><div class="linha"></div><b>${esc(titulo)}</b>${nome ? `<span>${esc(nome)}</span>` : '<span>Nome:</span>'}${doc ? `<span>${esc(doc)}</span>` : '<span>CPF:</span>'}</div>`;
  return `
<section class="pagina quebra contrato">
  ${secao('06', 'Contrato', k.titulo)}
  ${k.preambulo.map((p) => `<p>${p.rotulo ? `<b>${esc(p.rotulo)}:</b> ` : ''}${esc(p.texto)}</p>`).join('')}
  ${k.secoes.map((s) => `<div class="sec-contrato"><h4>${esc(s.titulo)}</h4>${s.clausulas.map(cl).join('')}</div>`).join('')}
  <p>${esc(k.fecho)}</p>
  <p class="local">${esc(k.localData)}</p>
  <div class="assinaturas">
    ${assin('Contratante', d.contratante.razaoSocial, `CNPJ ${d.contratante.cnpj}`)}
    ${assin('Contratado', d.contratado.razaoSocial, `CNPJ ${d.contratado.cnpj}`)}
    ${assin('Testemunha 1')}
    ${assin('Testemunha 2')}
  </div>
</section>`;
}

// Rodapé da SPEC-RODAPE-ARTEFATOS.md (medidas a partir da base da página).
// Vem do footerTemplate do Chromium, que o desenha em TODA página, inclusive na
// capa (por isso a capa reserva uma faixa branca embaixo, .capa-base).
export function rodapeHtml(d, r) {
  const url = d.artefato.url;
  const legivel = url.replace(/^https?:\/\//, '');
  return `<div class="rod">
    <div class="rod-filete"></div>
    <div class="rod-l1"><span class="rod-los"></span>ANDERS TECH</div>
    <div class="rod-l2">Consultoria ISO 9001 · PBQP-H · Sebrae Unio</div>
    <div class="rod-l3">Passo Fundo/RS · anderstech.net · Proposta ${esc(d.numero)} · pág. <span class="pageNumber"></span>/<span class="totalPages"></span></div>
    <div class="rod-c1">${esc(d.artefato.legenda)}</div>
    <div class="rod-c2">aponte a câmera →</div>
    <div class="rod-c3">${esc(legivel)}</div>
    <div class="rod-qr">${r.qrSvg}</div>
  </div>`;
}

export const CSS_RODAPE = `
.rod{position:absolute;left:0;bottom:0;width:210mm;height:32mm;font-family:'Poppins';color:#0b1730;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.rod-filete{position:absolute;left:20mm;width:170mm;bottom:28mm;border-top:.5pt solid #C9D2E0}
.rod-l1,.rod-l2,.rod-l3,.rod-c1,.rod-c2,.rod-c3{position:absolute;white-space:nowrap;line-height:1}
.rod-l1{left:25mm;bottom:20mm;font-weight:600;font-size:8pt;letter-spacing:.1em}
.rod-los{position:absolute;left:-4.4mm;top:.2mm;width:2mm;height:2mm;background:#FE0000;transform:rotate(45deg)}
.rod-l2{left:20mm;bottom:15.5mm;font-size:7pt;color:#46577A}
.rod-l3{left:20mm;bottom:11.5mm;font-size:7pt;color:#46577A}
.rod-c1{right:44mm;bottom:18mm;font-weight:500;font-size:7pt}
.rod-c2{right:44mm;bottom:14mm;font-size:6.5pt;color:#46577A}
.rod-c3{right:44mm;bottom:9mm;font-size:6pt;color:#8190AC}
.rod-qr{position:absolute;left:170mm;bottom:5mm;width:20mm;height:20mm;background:#fff}
.rod-qr svg{width:20mm;height:20mm;display:block}
`;

const CSS = `
@page{size:A4;margin:16mm 20mm 34mm 20mm}
@page:first{margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'Poppins';font-size:9.2pt;line-height:1.5;color:#16233f}
b,strong{font-weight:600}
a{color:#203864}
.losango{display:inline-block;width:2.2mm;height:2.2mm;background:#FE0000;transform:rotate(45deg);flex:none}
.losango.branco{background:#fff}

/* Capa */
.capa{position:relative;width:210mm;height:297mm;background:#0b1730;color:#fff;overflow:hidden;page-break-after:always}
.capa-deco i{position:absolute;border:1.2pt solid rgba(185,200,228,.13);transform:rotate(45deg)}
.capa-deco i:nth-child(1){width:150mm;height:150mm;right:-62mm;top:52mm}
.capa-deco i:nth-child(2){width:96mm;height:96mm;right:-20mm;top:80mm;border-color:rgba(254,0,0,.55)}
.capa-deco i:nth-child(3){width:40mm;height:40mm;right:38mm;top:206mm;background:#12233f;border:0}
.capa-topo{position:absolute;left:20mm;right:20mm;top:20mm;display:flex;justify-content:space-between;align-items:flex-start}
.capa-logo{width:58mm}
.capa-num{text-align:right;font-weight:600;font-size:10pt;letter-spacing:.02em}
.capa-num small{display:block;font-weight:400;font-size:7.5pt;color:#b9c8e4;letter-spacing:.12em;text-transform:uppercase}
.capa-meio{position:absolute;left:20mm;width:128mm;top:86mm}
.tag{display:inline-flex;align-items:center;gap:3mm;font-size:8pt;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#fff;background:#FE0000;padding:2mm 4mm}
.capa h1{font-size:27pt;line-height:1.14;font-weight:600;margin-top:9mm;letter-spacing:-.01em}
.capa-norma{display:inline-block;margin-top:6mm;font-size:15pt;font-weight:700;color:#fff;border-bottom:2.5pt solid #FE0000;padding-bottom:1.5mm}
.capa-para{margin-top:12mm;font-size:10pt;line-height:1.55;color:#b9c8e4}
.capa-para b{color:#fff;font-weight:600}
.capa-meta{position:absolute;left:20mm;right:20mm;bottom:44mm;display:grid;grid-template-columns:repeat(4,1fr);border-top:.6pt solid rgba(185,200,228,.3);padding-top:5mm}
.capa-meta div{font-size:10pt;font-weight:600}
.capa-meta small{display:block;font-size:7pt;font-weight:400;color:#b9c8e4;letter-spacing:.12em;text-transform:uppercase;margin-bottom:1mm}
.capa-base{position:absolute;left:0;right:0;bottom:0;height:34mm;background:#fff}

/* Páginas internas */
.quebra{page-break-before:always}
.secao{display:flex;align-items:center;gap:3mm;font-size:7.5pt;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#FE0000}
h2{font-size:17pt;line-height:1.2;font-weight:600;color:#0b1730;margin:2mm 0 6mm}
h3{font-size:10pt;font-weight:600;color:#0b1730;margin:5mm 0 1.5mm}
h4{font-size:8.5pt;font-weight:600;color:#0b1730;letter-spacing:.08em;text-transform:uppercase;margin:4mm 0 1.5mm}
p{margin-bottom:2mm}
.mini{font-size:7.8pt;color:#46577a}
.lead{font-size:9.4pt;color:#16233f}
.duas{display:grid;grid-template-columns:1fr 1fr;gap:8mm}

.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-bottom:6mm}
.kpi{background:#0b1730;color:#fff;padding:4mm 4mm 3.5mm}
.kpi small{display:block;font-size:6.8pt;letter-spacing:.1em;text-transform:uppercase;color:#b9c8e4}
.kpi b{display:block;font-size:14.5pt;font-weight:600;margin:1.5mm 0 .5mm;white-space:nowrap}
.kpi span{font-size:7.2pt;color:#b9c8e4}
.kpi-red{background:#FE0000}
.kpi-red small,.kpi-red span{color:#fff}

.partes{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-bottom:2mm}
.parte{background:#F4F6FA;padding:4mm 5mm;border-left:1.2mm solid #203864}
.parte-tit{font-size:7pt;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#FE0000}
.parte-nome{font-weight:600;font-size:9.2pt;line-height:1.3;color:#0b1730;margin:1mm 0 2mm}
.parte dl{display:grid;grid-template-columns:23mm 1fr;gap:.6mm 2mm;font-size:7.8pt}
.parte dt{color:#8190ac}
.parte dd{color:#16233f;overflow-wrap:anywhere}

.barras{margin-top:2mm}
.barra{display:grid;grid-template-columns:24mm 1fr 14mm;align-items:center;gap:2mm;margin-bottom:2mm;font-size:8pt}
.barra i{display:block;height:3.2mm;background:#203864}
.barra:first-child i{background:#0b1730}
.barra:last-child i{background:#FE0000}
.barra b{text-align:right}

.nota{display:flex;gap:4mm;align-items:flex-start;margin-top:5mm;background:#fff;border:.6pt solid #C9D2E0;border-left:1.2mm solid #FE0000;padding:4mm 5mm}
.nota .losango{margin-top:1.4mm}
.nota b{color:#0b1730}
.nota p{font-size:8.4pt;color:#46577a;margin:1mm 0 0}

table{width:100%;border-collapse:collapse}
th{font-size:7pt;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:#0b1730;text-align:left;padding:2mm 3mm}
td{padding:1.6mm 3mm;border-bottom:.5pt solid #dfe5ee;vertical-align:top}
thead{display:table-header-group}
tr{break-inside:avoid}
.h,.n{text-align:right;white-space:nowrap}
.crono{font-size:8.2pt}
.crono .fase{break-inside:avoid}
.fase-tit td{background:#F4F6FA;font-weight:600;color:#0b1730;border-bottom:.6pt solid #C9D2E0;padding-top:2.2mm}
.fase-n{display:inline-block;width:8mm;color:#FE0000;font-weight:700}
.chip{display:inline-block;font-size:6.6pt;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:.3mm 2mm;white-space:nowrap}
.chip-consultoria{background:#e6ebf4;color:#203864}
.chip-treinamento{background:#0b1730;color:#fff}
.chip-auditoria{background:#ffe5e5;color:#c00000}
tfoot td{font-weight:700;color:#0b1730;border-top:1.2pt solid #0b1730;border-bottom:0;padding-top:2.2mm}

.inv{font-size:9pt;margin-bottom:7mm}
.pag{display:grid;grid-template-columns:1.25fr 1fr;gap:6mm;align-items:start}
.pag-tit{font-weight:600;color:#0b1730;margin-bottom:2mm}
.pag-tit span{color:#FE0000;font-weight:700;margin-right:1mm}
.parc{font-size:8.4pt}
.parc td{padding:1.2mm 3mm}
.pag-avista{background:#0b1730;color:#fff;padding:6mm}
.pag-avista .pag-tit{color:#fff}
.de{font-size:9pt;color:#b9c8e4;text-decoration:line-through;margin-top:3mm}
.por{font-size:24pt;font-weight:700;line-height:1.15;margin:1mm 0 4mm}
.ate{display:flex;align-items:center;gap:2.5mm;font-size:8.2pt;font-weight:600;background:#FE0000;padding:2mm 3mm}
.validade{display:flex;align-items:center;gap:3mm;margin-top:7mm;font-size:9pt;padding:3mm 4mm;background:#F4F6FA}

.req{font-size:7.7pt;line-height:1.35;margin-bottom:1mm}
.req td:first-child{width:46%;font-weight:500;color:#0b1730}
.req td{padding:.85mm 3mm}
.prisma-fim{break-inside:avoid}
.prisma-fim h3{margin-top:3mm}
.licenca{background:#0b1730;color:#fff;padding:4.5mm 5mm;margin-top:3mm}
.licenca small{display:block;font-size:7pt;letter-spacing:.12em;text-transform:uppercase;color:#b9c8e4}
.licenca b{display:block;font-size:13pt;margin:1mm 0 2mm}
.licenca p{font-size:8.2pt;color:#dfe6f3}
.licenca .ref{font-size:8pt;font-weight:600;border-top:.6pt solid rgba(185,200,228,.3);padding-top:2mm;margin-top:2mm}

.quebra-evitar{break-inside:avoid;margin-top:9mm}
.consultor{display:flex;gap:5mm;align-items:center;background:#F4F6FA;padding:5mm}
.cons-av{width:16mm;height:16mm;flex:none;display:flex;align-items:center;justify-content:center;background:#0b1730;color:#fff;font-weight:700;font-size:12pt;border-bottom:1.2mm solid #FE0000}
.consultor b{font-size:11pt;color:#0b1730}
.consultor p{margin:0;color:#46577a}

.contrato{font-size:8.4pt;text-align:justify}
.contrato .cl,.sec-contrato{break-inside:avoid}
.alin{list-style:lower-alpha;padding-left:6mm;margin:-1mm 0 2mm}
.alin li{margin-bottom:.6mm}
.local{margin-top:4mm;font-weight:600;color:#0b1730}
.assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:12mm 10mm;margin-top:14mm;break-inside:avoid;text-align:left}
.assin .linha{border-top:.7pt solid #0b1730;margin-bottom:1.5mm}
.assin b{display:block;font-size:7.4pt;letter-spacing:.12em;text-transform:uppercase;color:#0b1730}
.assin span{display:block;font-size:7.8pt;color:#46577a}
`;

export function htmlProposta(d, r) {
  const c = calcular(d);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Proposta ${esc(d.numero)}</title>
<style>${r.fontesCss}${CSS}${CSS_RODAPE}</style></head><body>
${capa(d, c, r)}
${resumo(d, c)}
${cronograma(d, c)}
${investimento(d, c)}
${consultor(d)}
${prisma(d)}
${contrato(d)}
</body></html>`;
}

export function rodapeTemplate(d, r) {
  // O footerTemplate do Chromium é um documento à parte: leva as próprias
  // fontes e zera a margem do corpo. 32 mm = margem inferior da página.
  return `<style>${r.fontesCssRodape}${CSS_RODAPE}html,body{margin:0;padding:0}.rodwrap{position:relative;width:210mm;height:32mm}</style>
<div class="rodwrap">${rodapeHtml(d, r, false)}</div>`;
}
