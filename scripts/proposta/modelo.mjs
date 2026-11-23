// ── Modelo de proposta comercial da Anders Tech (HTML → PDF) ─────────────────
// 23/11/2026, terceira versão. O Anders pediu o modelo "baseado no site" e
// recusou a primeira (identidade de artefato com Poppins: "layout diferente do
// site, uma bosta"). Agora é o site impresso: Space Grotesk / Inter / Space Mono,
// tokens do styles.css, capa = hero (degradê, grade, losango, marcas "+"),
// cabeçalho de seção "01 / NOME" + etiqueta mono com losango, cartões de borda fina.
// Ordem de leitura: o que o cliente recebe → como vamos trabalhar → cronograma
// → sistema incluído → investimento → contrato. Preço só na seção de investimento.
// Sem QR. Dados do cliente ficam FORA do repositório.

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const moeda = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const horas = (h) => Number(h).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' h';
export const data = (iso) => { const [a, m, d] = String(iso).split('-'); return `${d}/${m}/${a}`; };
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const dataExtenso = (iso) => { const [a, m, d] = String(iso).split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${a}`; };
const ROTULO_TIPO = { consultoria: 'Consultoria', treinamento: 'Treinamento', auditoria: 'Auditoria' };

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

const cliente = (d) => d.contratante.fantasia || d.contratante.razaoSocial;
const cidadeMono = (d) => String(d.contratante.cidade || '').replace('/', ' · ');
const tag = (txt, cls = '') => `<span class="tag ${cls}">${esc(txt)}</span>`;
const cab = (num, indice, rotulo, titulo, sub) => `
  <header class="sec-head">
    <div class="sec-index"><b>${esc(num)}</b> / ${esc(indice)}</div>
    <div class="sec-title">${tag(rotulo)}<h2>${esc(titulo)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div>
  </header>`;

function capa(d, c, r) {
  const meta = [['Proposta nº', d.numero], ['Data', data(d.data)], ['Válida até', data(d.validade)], ['Consultor', d.consultor.nome]];
  return `
<section class="capa">
  <div class="capa-bg"><i class="g1"></i><i class="grid"></i><i class="dmd-big"></i></div>
  <div class="bp"><i class="tk tl"></i><i class="tk tr"></i><i class="tk bl"></i><i class="tk br"></i></div>
  <img class="capa-logo" src="${r.logoBranco}" alt="Anders Tech">
  <div class="capa-copy">
    <div class="hero-meta">${tag('Proposta de consultoria', 'light')}<span class="mrow">${esc(d.norma)}</span><span class="mrow">${esc(cidadeMono(d))}</span></div>
    <h1><span class="blk">Implantação da</span><em class="blk">${esc(d.norma)}</em><span class="blk red">na ${esc(cliente(d))}</span></h1>
    <p class="hero-sub">${esc(d.titulo)} para a <b>${esc(d.contratante.razaoSocial)}</b>, da preparação da equipe até a auditoria de certificação.</p>
  </div>
  <div class="readout">
    <div class="readout-h"><span>Resumo da proposta</span><span class="dmd"></span></div>
    <div class="readout-g">${meta.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
  </div>
</section>`;
}

function resumo(d, c) {
  const stats = [
    ['Carga horária', horas(c.totalHoras), 'de trabalho presencial na empresa'],
    ['Prazo', `${d.resultado.prazoMeses} meses`, 'até a auditoria de certificação'],
    ['Método', `${d.cronograma.length} etapas`, 'do treinamento à certificação'],
    ['Sistema', d.prismabiz ? d.prismabiz.nome : '—', 'licença vitalícia incluída'],
  ];
  return `
<section class="pg">
  ${cab('01', 'Resumo', 'O que vocês recebem', `O que a ${cliente(d)} vai receber`)}
  <div class="stats">${stats.map(([k, v, s]) => `<div class="stat">${tag(k, 'muted')}<b>${esc(v)}</b><span>${esc(s)}</span></div>`).join('')}</div>
  <ul class="lista">${(d.entregas || []).map((e) => `<li><span class="dmd"></span><span>${esc(e)}</span></li>`).join('')}</ul>
  ${d.nota ? `<div class="callout"><b>${esc(d.nota.titulo)}</b><p>${esc(d.nota.texto)}</p></div>` : ''}
</section>`;
}

function etapas(d) {
  return `
<section class="pg quebra">
  ${cab('02', 'Como funciona', 'Do treinamento à certificação', `${d.cronograma.length} etapas, no ritmo da produção`)}
  <div class="escuro">
    <div class="steps">${d.cronograma.map((f, i) => `
      <article class="step${i === d.cronograma.length - 1 && d.cronograma.length % 2 ? ' wide' : ''}">
        <span class="step-n">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(f.fase)}</h3>
        <p>${esc(f.descricao || '')}</p>
        <div class="step-out">Carga: ${horas(f.itens.reduce((s, x) => s + x.horas, 0))}</div>
      </article>`).join('')}
    </div>
  </div>
  <p class="nota-rodape">Encontros presenciais na empresa, com agenda ${esc(d.agenda)} O cronograma detalhado, atividade por atividade, vem a seguir.</p>
</section>`;
}

function cronograma(d, c) {
  const blocos = d.cronograma.map((f, fi) => `
    <tbody class="fase"><tr class="fase-tit"><td><span class="fase-n">${String(fi + 1).padStart(2, '0')}</span>${esc(f.fase)}</td><td class="h">${horas(f.itens.reduce((s, i) => s + i.horas, 0))}</td></tr>
      ${f.itens.map((i) => `<tr><td>${esc(i.atividade)}${i.tipo === 'auditoria' ? ' <em>· auditoria</em>' : ''}</td><td class="h">${horas(i.horas)}</td></tr>`).join('')}
    </tbody>`).join('');
  return `
<section class="pg quebra">
  ${cab('03', 'Cronograma', 'Atividade por atividade', 'Cronograma detalhado')}
  <table class="tb crono"><thead><tr><th>Atividade</th><th class="h">Horas</th></tr></thead>${blocos}
    <tfoot><tr><td>Total</td><td class="h">${horas(c.totalHoras)}</td></tr></tfoot></table>
</section>`;
}

function prisma(d) {
  const x = d.prismabiz;
  if (!x) return '';
  return `
<section class="pg quebra">
  ${cab('04', 'Sistema', 'Incluído na proposta', x.titulo)}
  <p class="lead lead-prisma">${esc(x.oQueE)}</p>
  <table class="tb req"><thead><tr><th>Requisito da ISO 9001</th><th>Onde fica no ${esc(x.nome)}</th></tr></thead>
    <tbody>${x.requisitos.map(([r, m]) => `<tr><td>${esc(r)}</td><td>${esc(m)}</td></tr>`).join('')}</tbody></table>
  <div class="duas prisma-fim">
    <div class="card">${tag('Na prática', 'muted')}<p>${esc(x.naPratica)}</p></div>
    <div class="card navy">${tag('Licença vitalícia', 'light')}<b>Plano ${esc(x.licenca.plano)}</b><p>${esc(x.licenca.texto)}</p>
      <div class="ref">Valor de referência hoje: ${moeda(x.licenca.valorMensal)} por mês</div></div>
  </div>
</section>`;
}

function investimento(d, c) {
  const p = d.pagamento, av = p.avista, k = d.consultor;
  return `
<section class="pg quebra">
  ${cab('05', 'Investimento', 'Valores e pagamento', 'Investimento', `${horas(c.totalHoras)} de trabalho presencial, com o ${d.prismabiz ? d.prismabiz.nome : 'sistema'} incluído.`)}
  <table class="tb inv"><thead><tr><th>Descrição</th><th class="n">Valor hora</th><th class="n">Horas</th><th class="n">Valor total</th></tr></thead>
    <tbody>${c.linhas.map((l) => `<tr><td>${esc(l.descricao)}</td><td class="n">${moeda(d.investimento.valorHora)}</td><td class="n">${horas(l.horas)}</td><td class="n">${moeda(l.valor)}</td></tr>`).join('')}</tbody>
    <tfoot><tr><td>Total</td><td></td><td class="n">${horas(c.totalHoras)}</td><td class="n">${moeda(c.total)}</td></tr></tfoot></table>
  <div class="opcoes">
    ${p.parcelado ? `<div class="card op">
      <div class="op-h"><span class="num">1</span><b>${esc(p.parcelado.titulo)}</b></div>
      <table class="tb parc"><thead><tr><th>Parcela</th><th>Vencimento</th><th class="n">Valor</th></tr></thead>
        <tbody>${p.parcelado.parcelas.map((x, i) => `<tr><td>${i + 1}ª</td><td>${data(x.vencimento)}</td><td class="n">${moeda(x.valor)}</td></tr>`).join('')}</tbody></table>
      ${p.parcelado.observacao ? `<p class="mini">${esc(p.parcelado.observacao)}</p>` : ''}
    </div>` : ''}
    ${av ? `<div class="card navy op">
      <div class="op-h"><span class="num">2</span><b>À vista, com ${esc(av.descontoPct)}% de ${esc(av.rotulo)}</b></div>
      <div class="de">De ${moeda(c.total)} por</div>
      <div class="por">${moeda(c.avista)}</div>
      <span class="ate">Condição válida até ${data(av.ate)}</span>
    </div>` : ''}
  </div>
  <div class="validade">${tag('Validade', 'muted')}<span>Esta proposta vale até <b>${dataExtenso(d.validade)}</b>.</span></div>
  <div class="card consultor">
    <div class="cons-av">${esc(k.nome.split(' ').map((x) => x[0]).slice(0, 2).join(''))}</div>
    <div>${tag('Consultor responsável', 'muted')}<b>${esc(k.nome)}</b><p>${esc(k.cargo)}${k.cvUrl ? ` · <a href="${esc(k.cvUrl)}">ver currículo</a>` : ''}</p></div>
  </div>
</section>`;
}

function contrato(d) {
  const k = d.contrato, a = d.contratado, b = d.contratante;
  const parte = (titulo, p, campos) => `<div class="card parte">${tag(titulo)}<b>${esc(p.razaoSocial)}</b>
    <dl>${campos.filter(([, v]) => v).map(([kk, v]) => `<dt>${esc(kk)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>`;
  const cl = (c) => `<div class="cl"><p><b>${esc(c.rotulo)}.</b> ${esc(c.texto)}</p>
    ${c.itens ? `<ol class="alin">${c.itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>` : ''}
    ${c.paragrafo ? `<p><b>Parágrafo único.</b> ${esc(c.paragrafo)}</p>` : ''}</div>`;
  const assin = (titulo, nome, doc) => `<div class="assin"><i></i>${tag(titulo, 'muted')}<span>${esc(nome || 'Nome:')}</span><span>${esc(doc || 'CPF:')}</span></div>`;
  return `
<section class="pg quebra contrato">
  ${cab('06', 'Contrato', 'Prestação de serviços', k.titulo)}
  <div class="duas partes">
    ${parte('Contratante', b, [['CNPJ', b.cnpj], ['Endereço', [b.endereco, b.cidade].filter(Boolean).join(', ')], ['Contato', b.contato], ['Telefone', b.telefone], ['E-mail', b.email]])}
    ${parte('Contratado', a, [['CNPJ', a.cnpj], ['Endereço', `${a.endereco}, ${a.cidade}`], ['Consultor', a.consultor], ['Telefone', a.telefone], ['E-mail', a.email]])}
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
  <div class="assinatura-marca"><div class="wm">anders<b>tech</b></div><div class="wm-tag">Gestão com tecnologia · Qualidade &amp; conformidade para a indústria</div></div>
</section>`;
}

// Tokens e componentes copiados do styles.css do site (nomes iguais onde dá).
const CSS = `
@page{size:A4;margin:20mm 20mm 24mm 20mm}
@page:first{margin:0}
:root{--navy:#203864;--navy-700:#2b4a82;--navy-900:#12233f;--navy-950:#0b1730;--red:#FE0000;--red-accent:#ff6a6a;
--paper:#F4F6FA;--ink:#16233f;--ink-soft:#46577a;--ink-mute:#8190ac;--line:rgba(32,56,100,.14);--line-soft:rgba(32,56,100,.08);
--on-navy-soft:#b9c8e4;--on-navy-mute:#7589ad;--line-navy:rgba(255,255,255,.14);
--ff-display:"Space Grotesk",sans-serif;--ff-body:"Inter",sans-serif;--ff-mono:"Space Mono",monospace}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:var(--ff-body);font-size:9.6pt;line-height:1.6;color:var(--ink)}
b,strong{font-weight:600}
em{font-style:normal}
a{color:var(--navy)}
h1,h2,h3,h4{font-family:var(--ff-display);font-weight:600;line-height:1.04;letter-spacing:-.025em;color:var(--navy)}
.tag{display:inline-flex;align-items:center;gap:2.4mm;font-family:var(--ff-mono);font-size:7pt;letter-spacing:.18em;text-transform:uppercase;color:var(--red);white-space:nowrap}
.tag::before{content:"";width:1.8mm;height:1.8mm;background:var(--red);transform:rotate(45deg);flex:none}
.tag.muted{color:var(--ink-mute)}.tag.muted::before{background:var(--ink-mute)}
.tag.light{color:var(--red-accent)}.tag.light::before{background:var(--red-accent)}
.dmd{display:inline-block;width:2mm;height:2mm;background:var(--red);transform:rotate(45deg);flex:none}

/* Capa = hero do site */
.capa{position:relative;width:210mm;height:297mm;overflow:hidden;color:#fff;background:var(--navy-950);page-break-after:always}
.capa-bg i{position:absolute;inset:0}
.capa-bg .g1{background:radial-gradient(80% 70% at 8% 4%,#2c4d8c 0%,rgba(44,77,140,0) 52%),radial-gradient(70% 90% at 102% 102%,#16294c 0%,rgba(22,41,76,0) 55%),linear-gradient(160deg,var(--navy) 0%,var(--navy-900) 58%,var(--navy-950) 100%)}
.capa-bg .grid{opacity:.5;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:12mm 12mm;-webkit-mask-image:radial-gradient(120% 100% at 30% 0%,#000 30%,transparent 78%);mask-image:radial-gradient(120% 100% at 30% 0%,#000 30%,transparent 78%)}
.capa-bg .dmd-big{inset:auto;top:118mm;right:-34mm;width:132mm;height:132mm;transform:translateY(-50%) rotate(45deg);border:1px solid rgba(185,200,228,.14)}
.capa-bg .dmd-big::before{content:"";position:absolute;inset:12%;border:1px solid rgba(254,0,0,.28)}
.capa-bg .dmd-big::after{content:"";position:absolute;inset:30%;border:1px solid rgba(185,200,228,.1)}
.bp{position:absolute;left:8mm;right:8mm;top:8mm;bottom:28mm;border:1px solid var(--line-navy)}
.tk{position:absolute;width:3mm;height:3mm}
.tk::before,.tk::after{content:"";position:absolute;background:var(--red)}
.tk::before{left:50%;top:0;width:1px;height:100%}.tk::after{top:50%;left:0;height:1px;width:100%}
.tk.tl{top:-1.5mm;left:-1.5mm}.tk.tr{top:-1.5mm;right:-1.5mm}.tk.bl{bottom:-1.5mm;left:-1.5mm}.tk.br{bottom:-1.5mm;right:-1.5mm}
.capa-logo{position:absolute;left:20mm;top:22mm;width:50mm}
.capa-copy{position:absolute;left:20mm;right:20mm;top:76mm}
.hero-meta{display:flex;gap:5mm;align-items:center;flex-wrap:wrap;margin-bottom:9mm}
.hero-meta .mrow{font-family:var(--ff-mono);font-size:6.8pt;letter-spacing:.14em;color:var(--on-navy-mute);text-transform:uppercase;display:flex;align-items:center;gap:2.4mm}
.hero-meta .mrow::before{content:"";width:5mm;height:1px;background:var(--line-navy)}
.capa h1{color:#fff;font-size:44pt;font-weight:500;line-height:.98;letter-spacing:-.04em}
.capa h1 .blk{display:block}
.capa h1 em{color:transparent;-webkit-text-stroke:1.2px rgba(255,255,255,.6)}
.capa h1 .red{color:var(--red)}
.hero-sub{margin-top:9mm;max-width:128mm;font-size:12pt;line-height:1.55;color:var(--on-navy-soft)}
.hero-sub b{color:#fff;font-weight:600}
.readout{position:absolute;left:20mm;right:20mm;bottom:40mm;border:1px solid var(--line-navy);background:rgba(255,255,255,.03);padding:5mm 6mm 5.5mm}
.readout-h{display:flex;align-items:center;justify-content:space-between;font-family:var(--ff-mono);font-size:6.8pt;letter-spacing:.16em;text-transform:uppercase;color:var(--on-navy-mute);padding-bottom:3.5mm;border-bottom:1px solid var(--line-navy)}
.readout-g{display:grid;grid-template-columns:1.25fr 1fr 1fr 1fr;gap:5mm;padding-top:4mm}
.readout-g small{display:block;font-family:var(--ff-mono);font-size:6.4pt;letter-spacing:.14em;text-transform:uppercase;color:var(--on-navy-mute);margin-bottom:1.2mm}
.readout-g b{font-family:var(--ff-display);font-size:11pt;font-weight:600;letter-spacing:-.01em;white-space:nowrap}

/* Páginas internas */
.quebra{page-break-before:always}
.sec-head{display:grid;grid-template-columns:auto 1fr;gap:8mm;align-items:end;margin-bottom:9mm;text-align:left}
.sec-index{font-family:var(--ff-mono);font-size:7.4pt;color:var(--ink-mute);letter-spacing:.1em;text-transform:uppercase;padding-bottom:1.5mm;white-space:nowrap}
.sec-index b{color:var(--red);font-weight:700}
.sec-title .tag{margin-bottom:3.5mm}
.sec-title h2{font-size:25pt}
.sec-title p{margin-top:3mm;font-size:10.5pt;color:var(--ink-soft)}
.lead{font-size:9.8pt;color:var(--ink-soft);margin-bottom:6mm}
.mini{font-size:7.8pt;color:var(--ink-mute);margin-top:3mm}
.duas{display:grid;grid-template-columns:1fr 1fr;gap:5mm}
.card{background:#fff;border:1px solid var(--line);padding:6mm}
.card.navy{background:var(--navy-950);border-color:var(--navy-950);color:#fff}

.stats{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);margin-bottom:8mm}
.stat{padding:5mm 4.5mm;border-right:1px solid var(--line)}
.stat:last-child{border-right:0}
.stat b{display:block;font-family:var(--ff-display);font-size:19pt;font-weight:600;letter-spacing:-.03em;color:var(--navy);margin:3mm 0 1mm;white-space:nowrap}
.stat span{display:block;font-size:8pt;color:var(--ink-soft);line-height:1.4}
.lista{list-style:none}
.lista li{display:flex;gap:4mm;align-items:flex-start;font-size:10.4pt;color:var(--ink-soft);padding:3.2mm 0;border-bottom:1px solid var(--line-soft)}
.lista li .dmd{margin-top:2.2mm}
.callout{margin-top:9mm;border-left:3px solid var(--navy);padding:1mm 0 1mm 6mm}
.callout b{font-family:var(--ff-display);font-size:12pt;color:var(--navy)}
.callout p{font-size:9.2pt;color:var(--ink-soft);margin-top:1.5mm}

.escuro{background:var(--navy-950);padding:7mm}
.steps{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.step{border:1px solid var(--line-navy);background:rgba(255,255,255,.03);padding:5.5mm 5.5mm 4.5mm;break-inside:avoid;display:flex;flex-direction:column}
.step.wide{grid-column:1/-1}
.step-n{font-family:var(--ff-mono);font-size:8pt;color:var(--red-accent);letter-spacing:.1em}
.step h3{color:#fff;font-size:13pt;margin:2.5mm 0 2mm}
.step p{font-size:8.8pt;color:var(--on-navy-soft);line-height:1.55;flex:1}
.step-out{margin-top:4mm;padding-top:3mm;border-top:1px solid var(--line-navy);font-family:var(--ff-mono);font-size:7pt;letter-spacing:.06em;color:var(--on-navy-mute)}
.nota-rodape{font-size:8.4pt;color:var(--ink-mute);margin-top:5mm}

.tb{width:100%;border-collapse:collapse}
.tb th{font-family:var(--ff-mono);font-size:6.6pt;font-weight:400;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute);text-align:left;padding:2.4mm 3mm;border-bottom:1px solid var(--navy);background:var(--paper)}
.tb td{padding:2mm 3mm;border-bottom:1px solid var(--line-soft);vertical-align:top}
.tb thead{display:table-header-group}
.tb tr{break-inside:avoid}
.tb .h,.tb .n{text-align:right;white-space:nowrap}
.tb tfoot td{font-family:var(--ff-display);font-weight:600;font-size:10.5pt;color:var(--navy);border-top:1px solid var(--navy);border-bottom:0;padding-top:3mm}
.crono{font-size:9pt}
.crono .fase{break-inside:avoid}
.crono em{color:var(--ink-mute)}
.fase-tit td{font-family:var(--ff-display);font-weight:600;font-size:10.2pt;color:var(--navy);padding-top:4mm;border-bottom:1px solid var(--line)}
.fase-n{display:inline-block;width:9mm;font-family:var(--ff-mono);font-size:7.6pt;font-weight:700;color:var(--red)}
.req{font-size:7.7pt;line-height:1.3;margin-bottom:5mm}
.req td{padding:.85mm 3mm}
.req th{padding:1.8mm 3mm}
.req td:first-child{width:46%;color:var(--navy);font-weight:500}
.lead-prisma{font-size:9pt;line-height:1.5;margin-bottom:5mm}
.prisma-fim{break-inside:avoid}
.prisma-fim .card{padding:5mm}
.prisma-fim .card p{font-size:8.4pt;line-height:1.5;color:var(--ink-soft);margin-top:2.5mm}
.card.navy b{display:block;font-family:var(--ff-display);font-size:15pt;margin:3mm 0 1.5mm}
.card.navy p{color:var(--on-navy-soft) !important;margin-top:0 !important}
.card.navy .ref{margin-top:3.5mm;padding-top:3mm;border-top:1px solid var(--line-navy);font-family:var(--ff-mono);font-size:7pt;letter-spacing:.04em;color:#fff}

.inv{font-size:9.6pt;margin-bottom:7mm}
.opcoes{display:grid;grid-template-columns:1.15fr 1fr;gap:5mm;align-items:start}
.op-h{display:flex;align-items:center;gap:3mm;margin-bottom:4mm}
.op-h b{font-family:var(--ff-display);font-size:11pt;color:var(--navy);line-height:1.2}
.card.navy .op-h b{color:#fff;margin:0;font-size:11pt}
.num{width:6.5mm;height:6.5mm;border-radius:50%;background:var(--navy);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-family:var(--ff-display);font-weight:700;font-size:8.5pt;flex:none}
.card.navy .num{background:var(--red)}
.parc{font-size:8.6pt}
.parc td{padding:1.3mm 3mm}
.de{font-size:9pt;color:var(--on-navy-soft);margin-top:2mm}
.por{font-family:var(--ff-display);font-size:28pt;font-weight:600;letter-spacing:-.03em;line-height:1.1;margin:1mm 0 5mm}
.ate{display:inline-block;font-family:var(--ff-mono);font-size:7pt;letter-spacing:.08em;text-transform:uppercase;background:var(--red);padding:2mm 3.5mm}
.validade{display:flex;align-items:center;gap:5mm;margin-top:7mm;padding:4mm 5mm;background:var(--paper);font-size:9.6pt}
.consultor{display:flex;gap:5mm;align-items:center;margin-top:5mm;break-inside:avoid}
.cons-av{width:14mm;height:14mm;flex:none;display:flex;align-items:center;justify-content:center;background:var(--navy-950);color:#fff;font-family:var(--ff-display);font-weight:700;font-size:12pt;border-bottom:1mm solid var(--red)}
.consultor b{display:block;font-family:var(--ff-display);font-size:12pt;color:var(--navy);margin-top:1.5mm}
.consultor p{font-size:8.8pt;color:var(--ink-soft)}

.contrato{font-size:8.8pt;color:var(--ink);text-align:justify}
.partes{margin-bottom:7mm;text-align:left}
.parte b{display:block;font-family:var(--ff-display);font-size:10pt;color:var(--navy);line-height:1.25;margin:3mm 0 2.5mm}
.parte dl{display:grid;grid-template-columns:17mm 1fr;gap:.8mm 2mm;font-size:7.8pt}
.parte dt{font-family:var(--ff-mono);font-size:6.6pt;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute);padding-top:.3mm}
.parte dd{color:var(--ink-soft);overflow-wrap:anywhere}
.contrato p{margin-bottom:2.2mm}
.contrato h4{font-family:var(--ff-mono);font-size:7.2pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--navy);margin:5mm 0 2mm}
.contrato .cl,.sec-contrato{break-inside:avoid}
.alin{list-style:lower-alpha;padding-left:6mm;margin:-1mm 0 2.2mm}
.alin li{margin-bottom:.7mm}
.local{margin-top:4mm;font-family:var(--ff-display);font-weight:600;color:var(--navy)}
.assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:14mm 10mm;margin-top:16mm;break-inside:avoid;text-align:left}
.assin i{display:block;border-top:1px solid var(--navy);margin-bottom:2mm}
.assin span{display:block;font-size:7.8pt;color:var(--ink-soft);margin-top:.5mm}
.assinatura-marca{margin-top:14mm;padding-top:6mm;border-top:1px solid var(--line);break-inside:avoid;text-align:left}
.wm{font-family:var(--ff-display);font-weight:700;font-size:26pt;letter-spacing:-.05em;line-height:.9;color:var(--navy-950)}
.wm b{color:var(--red);font-weight:700}
.wm-tag{font-family:var(--ff-mono);font-size:6.8pt;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-mute);margin-top:2.5mm}
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

// Rodapé como a barra inferior do site (.footer-bot): Space Mono, marcas "+"
// vermelhas nas pontas da linha. Sai em toda página, também sobre a capa
// navy — por isso a cor é a "mute", que lê nos dois fundos.
export function rodapeTemplate(d, r) {
  return `<style>${r.fontesCssRodape}
html,body{margin:0;padding:0}
.rod{position:relative;width:210mm;height:24mm;font-family:'Space Mono',monospace;font-size:6.4pt;letter-spacing:.1em;text-transform:uppercase;color:#8190ac;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.fil{position:absolute;left:20mm;right:20mm;bottom:14.5mm;height:0;border-top:1px solid rgba(129,144,172,.35)}
.tk{position:absolute;bottom:13.4mm;width:2.4mm;height:2.4mm}
.tk::before,.tk::after{content:"";position:absolute;background:#FE0000}
.tk::before{left:50%;top:0;width:1px;height:100%}.tk::after{top:50%;left:0;height:1px;width:100%}
.tl{left:18.8mm}.tr{right:18.8mm}
.l,.r{position:absolute;bottom:9mm;white-space:nowrap;line-height:1}
.l{left:20mm}.r{right:20mm}
b{color:#FE0000;font-weight:700}
</style>
<div class="rod"><div class="fil"></div><i class="tk tl"></i><i class="tk tr"></i>
<div class="l">Anders <b>Tech</b> · Proposta ${esc(d.numero)}</div>
<div class="r">anderstech.net · ${esc(d.contratado.telefone)} · <span class="pageNumber"></span>/<span class="totalPages"></span></div></div>`;
}
