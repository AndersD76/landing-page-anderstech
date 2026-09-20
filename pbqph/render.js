// ── Páginas do PBQP-H por município ──────────────────────────────────────────
// Uma página por cidade, com o dado daquela cidade: quem está qualificado, em
// que nível, por qual organismo e até quando. É a exceção autorizada à regra 4
// do CLAUDE.md — e ela só se sustenta porque cada página traz número e lista
// próprios. Cidade abaixo do gate sai com noindex e fora do sitemap.
//
// Enquadramento deliberado: PANORAMA da qualificação na cidade, não lista de
// prospecção. O leitor alvo é quem procura construtora qualificada ou quer
// saber onde sua empresa está nesse mapa. Contato das empresas nunca aparece.

import { EMPRESA, waLink } from '../config/empresa.js';
import { formataDataBR, GATE_MUNICIPIO } from './normaliza.js';
import { municipio as buscaMunicipio, municipiosDaUf, ufs, dados } from './dados.js';

const SITE = 'https://anderstech.net';

const UF_NOME = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
  MG: 'Minas Gerais', MS: 'Mato Grosso do Sul', MT: 'Mato Grosso', PA: 'Pará',
  PB: 'Paraíba', PE: 'Pernambuco', PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul',
  SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins',
};

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const CSS = `
:root{--navy:#203864;--navy-950:#0b1730;--red:#FE0000;--red-600:#d80a0a;--paper:#F4F6FA;--white:#fff;--ink:#16233f;--ink-soft:#46577a;--ink-mute:#8190ac;--line:rgba(32,56,100,.14);--on-navy:#fff;--on-navy-soft:#b9c8e4;--ff-display:"Space Grotesk",system-ui,sans-serif;--ff-body:"Inter",system-ui,-apple-system,sans-serif;--ff-mono:"Space Mono",ui-monospace,monospace;--ease:cubic-bezier(.22,.61,.36,1)}
*,*::before,*::after{box-sizing:border-box}*{margin:0}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{font-family:var(--ff-body);background:var(--paper);color:var(--ink);line-height:1.7;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}::selection{background:var(--red);color:#fff}
.hero{background:var(--navy);color:var(--on-navy);padding:clamp(44px,7vw,80px) clamp(22px,5vw,80px) clamp(36px,5vw,56px)}
.hero .wrap{max-width:1040px;margin:0 auto}
.crumbs{font-family:var(--ff-mono);font-size:.74rem;color:var(--on-navy-soft);letter-spacing:.04em;margin-bottom:16px}
.crumbs a:hover{color:#fff;text-decoration:underline}
.hero .tag{font-family:var(--ff-mono);font-size:.74rem;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px}
.hero h1{font-family:var(--ff-display);font-size:clamp(1.6rem,4.2vw,2.45rem);font-weight:700;line-height:1.14;letter-spacing:-.03em;color:#fff;margin-bottom:14px}
.hero .lead{font-size:1.05rem;color:var(--on-navy-soft);max-width:680px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-top:30px}
.stat{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:16px 18px}
.stat b{display:block;font-family:var(--ff-display);font-size:1.9rem;font-weight:700;color:#fff;line-height:1.1}
.stat span{font-family:var(--ff-mono);font-size:.7rem;text-transform:uppercase;letter-spacing:.09em;color:var(--on-navy-soft)}
.content{max-width:1040px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(22px,5vw,80px)}
.content h2{font-family:var(--ff-display);font-size:clamp(1.2rem,2.5vw,1.45rem);font-weight:700;color:var(--navy);margin:36px 0 14px;padding-bottom:8px;border-bottom:2px solid var(--line)}
.content h2:first-child{margin-top:0}
.content p{margin-bottom:16px;font-size:1.01rem}
.content strong{color:var(--navy);font-weight:600}
.fonte{font-family:var(--ff-mono);font-size:.76rem;color:var(--ink-mute);border-left:3px solid var(--line);padding:6px 0 6px 12px;margin:18px 0 26px}
.fonte a{color:var(--ink-soft);text-decoration:underline}
.tabela-wrap{overflow-x:auto;background:var(--white);border:1px solid var(--line);border-radius:10px}
table{width:100%;border-collapse:collapse;font-size:.93rem;min-width:680px}
thead th{background:var(--paper);font-family:var(--ff-mono);font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-soft);text-align:left;padding:11px 14px;border-bottom:2px solid var(--line);white-space:nowrap}
tbody td{padding:11px 14px;border-bottom:1px solid var(--line);vertical-align:top}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover{background:#fafbfd}
.emp{font-weight:600;color:var(--navy)}
.cnpj{font-family:var(--ff-mono);font-size:.78rem;color:var(--ink-mute);display:block;margin-top:2px}
.nv{display:inline-block;font-family:var(--ff-mono);font-weight:700;font-size:.72rem;padding:3px 9px;border-radius:999px}
.nv-A{background:rgba(32,56,100,.1);color:var(--navy)}
.nv-B{background:rgba(254,0,0,.08);color:var(--red-600)}
.vence{white-space:nowrap;font-variant-numeric:tabular-nums}
.vence.perto{color:var(--red-600);font-weight:600}
.grid-links{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;list-style:none;padding:0}
.grid-links a{display:block;background:var(--white);border:1px solid var(--line);border-radius:8px;padding:12px 16px;font-size:.93rem;transition:border-color .2s var(--ease)}
.grid-links a:hover{border-color:var(--red)}
.grid-links b{display:block;font-weight:600;color:var(--ink)}
.grid-links span{font-family:var(--ff-mono);font-size:.74rem;color:var(--ink-mute)}
.aviso{background:#fff8e6;border:1px solid #f0d9a0;border-radius:8px;padding:14px 18px;font-size:.93rem;color:#7a5c12;margin:18px 0}
.cta-section{background:var(--navy);color:var(--on-navy);padding:clamp(40px,6vw,68px) clamp(22px,5vw,80px);text-align:center}
.cta-section .wrap{max-width:760px;margin:0 auto}
.cta-section h2{font-family:var(--ff-display);font-size:clamp(1.3rem,3vw,1.75rem);font-weight:700;color:#fff;margin-bottom:12px}
.cta-section p{color:var(--on-navy-soft);margin-bottom:26px}
.btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--ff-display);font-weight:600;font-size:.95rem;padding:14px 32px;border-radius:6px;transition:all .2s var(--ease)}
.btn-red{background:var(--red);color:#fff}.btn-red:hover{background:var(--red-600)}
@media(max-width:600px){.stat b{font-size:1.5rem}}
`;

function head({ title, desc, path, jsonLd, noindex }) {
  const url = SITE + path;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta name="author" content="Anders Tech" />
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}" />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:image" content="${SITE}/assets/og-image.png" />
<meta property="og:site_name" content="Anders Tech" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<link rel="stylesheet" href="/styles.css">
<link rel="icon" href="/assets/favicon.png" type="image/png" />
${jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
<style>${CSS}</style>
</head>
<body>
<div id="shared-nav"></div>
`;
}

const FOOT = `<div id="shared-footer"></div>
</body>
</html>`;

function carimbo() {
  const d = dados();
  const quando = d.carregadoEm ? formataDataBR(new Date(d.carregadoEm)) : null;
  return `<p class="fonte">Fonte: <a href="https://pbqp-h.cidades.gov.br/sistemas/siac/empresas-certificadas/" rel="nofollow noopener" target="_blank">SiAC / PBQP-H — Ministério das Cidades</a>${quando ? ` · dados de ${esc(quando)}` : ''}. Consideramos apenas certificados vigentes na data da carga; registro sem data de validade na origem fica de fora.</p>`;
}

function migalhas(itens) {
  return `<div class="crumbs">${itens.map((i, n) => (i.url ? `<a href="${i.url}">${esc(i.nome)}</a>` : esc(i.nome)) + (n < itens.length - 1 ? ' / ' : '')).join('')}</div>`;
}

function breadcrumbLd(itens) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((i, n) => ({
      '@type': 'ListItem', position: n + 1, name: i.nome, ...(i.url ? { item: SITE + i.url } : {}),
    })),
  };
}

function ctaWhats(mensagem) {
  return `<section class="cta-section"><div class="wrap">
<h2>Sua construtora precisa do PBQP-H?</h2>
<p>Implantação e manutenção do SiAC nível A ou B, conduzidas com a sua equipe. Diagnóstico inicial sem compromisso.</p>
<a class="btn btn-red" href="${waLink(mensagem)}" target="_blank" rel="noopener"><span>Falar no WhatsApp</span></a>
</div></section>`;
}

function linhaEmpresa(e, limite) {
  const validade = new Date(e.validade);
  const perto = validade <= limite;
  return `<tr>
<td><span class="emp">${esc(e.empresa)}</span>${e.cnpj ? `<span class="cnpj">${esc(e.cnpj)}</span>` : ''}</td>
<td><span class="nv nv-${esc(e.nivel || '')}">${esc(e.nivel || '—')}</span></td>
<td>${esc(e.subsetor || '—')}</td>
<td class="vence${perto ? ' perto' : ''}">${esc(formataDataBR(validade) || '—')}</td>
<td>${esc(e.organismo || '—')}</td>
</tr>`;
}

// ── Página do município ──────────────────────────────────────────────────────
export function renderMunicipio(uf, slug) {
  const m = buscaMunicipio(uf, slug);
  if (!m) return null;

  const UF = m.uf;
  const ufNome = UF_NOME[UF] || UF;
  const path = `/pbqp-h/construtoras/${UF.toLowerCase()}/${m.slug}`;
  const nome = m.titulo;

  // Título e descrição carregam os números desta cidade: duas páginas nunca
  // ficam com o mesmo texto, que é o teste da regra.
  const title = `${m.total} construtora${m.total > 1 ? 's' : ''} com PBQP-H em ${nome} (${UF}) — lista e validade | Anders Tech`;
  const desc = `${m.total} empresa${m.total > 1 ? 's' : ''} com certificação SiAC/PBQP-H vigente em ${nome}/${UF}: ${m.nivelA} no nível A e ${m.nivelB} no nível B, por ${m.organismos} organismo${m.organismos > 1 ? 's' : ''} certificador${m.organismos > 1 ? 'es' : ''}. ${m.vencendo12m} vencem nos próximos 12 meses.`;

  const itens = [
    { nome: 'Início', url: '/' },
    { nome: 'PBQP-H', url: '/pbqp-h' },
    { nome: 'Construtoras', url: '/pbqp-h/construtoras' },
    { nome: ufNome, url: `/pbqp-h/construtoras/${UF.toLowerCase()}` },
    { nome },
  ];

  const limite = new Date();
  limite.setUTCFullYear(limite.getUTCFullYear() + 1);

  const vizinhas = municipiosDaUf(UF).filter((o) => o.slug !== m.slug && o.publicavel).slice(0, 8);

  const jsonLd = [
    breadcrumbLd(itens),
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `Construtoras com PBQP-H vigente em ${nome}/${UF}`,
      description: desc,
      url: SITE + path,
      isBasedOn: 'https://pbqp-h.cidades.gov.br/sistemas/siac/empresas-certificadas/',
      creator: { '@type': 'Organization', name: 'Anders Tech', url: SITE },
      spatialCoverage: { '@type': 'Place', name: `${nome}, ${ufNome}, Brasil` },
      ...(dados().carregadoEm ? { dateModified: dados().carregadoEm.slice(0, 10) } : {}),
    },
  ];

  const leitura = m.vencendo12m > 0
    ? `Das <strong>${m.total}</strong> empresas com PBQP-H vigente em ${esc(nome)}, <strong>${m.vencendo12m}</strong> têm certificado vencendo nos próximos 12 meses — a manutenção exige auditoria antes dessa data.`
    : `As <strong>${m.total}</strong> empresas com PBQP-H vigente em ${esc(nome)} têm certificado válido por mais de 12 meses.`;

  return head({ title, desc, path, jsonLd, noindex: !m.publicavel }) + `
<section class="hero"><div class="wrap">
${migalhas(itens)}
<div class="tag">SiAC · ${esc(UF)}</div>
<h1>Construtoras com PBQP-H em ${esc(nome)}</h1>
<p class="lead">Quem está qualificado no SiAC em ${esc(nome)}/${esc(UF)}, em que nível, por qual organismo certificador e até quando vale o certificado.</p>
<div class="stats">
<div class="stat"><b>${m.total}</b><span>Empresas vigentes</span></div>
<div class="stat"><b>${m.nivelA}</b><span>Nível A</span></div>
<div class="stat"><b>${m.nivelB}</b><span>Nível B</span></div>
<div class="stat"><b>${m.vencendo12m}</b><span>Vencem em 12 meses</span></div>
</div>
</div></section>

<div class="content">
${!m.publicavel ? `<div class="aviso"><strong>Amostra pequena.</strong> ${esc(nome)} tem menos de ${GATE_MUNICIPIO} empresas qualificadas, então esta página não entra na busca — o número é baixo demais para sustentar uma leitura confiável do município.</div>` : ''}
<p>${leitura}</p>
${carimbo()}

<h2>Empresas qualificadas em ${esc(nome)}</h2>
<div class="tabela-wrap"><table>
<thead><tr><th>Empresa</th><th>Nível</th><th>Subsetor</th><th>Validade</th><th>Organismo</th></tr></thead>
<tbody>${m.empresas.map((e) => linhaEmpresa(e, limite)).join('')}</tbody>
</table></div>

<h2>O que o nível significa</h2>
<p>No SiAC, o <strong>nível A</strong> indica atendimento pleno aos requisitos do sistema de gestão da qualidade da construção; o <strong>nível B</strong> indica atendimento parcial, em etapa de evolução. A qualificação é exigida em financiamento habitacional e em boa parte das licitações públicas de obra.</p>
<p>Entenda o programa em <a href="/pbqp-h"><strong>PBQP-H: o que é e como qualificar sua construtora</strong></a> e veja o que compõe o custo em <a href="/quanto-custa-pbqp-h">quanto custa o PBQP-H</a>.</p>

${vizinhas.length ? `<h2>Outras cidades de ${esc(ufNome)}</h2>
<ul class="grid-links">${vizinhas.map((o) => `<li><a href="/pbqp-h/construtoras/${o.uf.toLowerCase()}/${o.slug}"><b>${esc(o.titulo)}</b><span>${o.total} empresa${o.total > 1 ? 's' : ''}</span></a></li>`).join('')}</ul>` : ''}
</div>

${ctaWhats(`Olá! Vim pela página de construtoras com PBQP-H em ${nome}/${UF} e quero falar sobre a qualificação da minha construtora.`)}
` + FOOT;
}

// ── Página da UF ─────────────────────────────────────────────────────────────
export function renderUf(uf) {
  const UF = String(uf).toUpperCase();
  const lista = municipiosDaUf(UF);
  if (!lista.length) return null;

  const ufNome = UF_NOME[UF] || UF;
  const path = `/pbqp-h/construtoras/${UF.toLowerCase()}`;
  const total = lista.reduce((s, m) => s + m.total, 0);
  const publicaveis = lista.filter((m) => m.publicavel);
  const vencendo = lista.reduce((s, m) => s + m.vencendo12m, 0);
  const nivelA = lista.reduce((s, m) => s + m.nivelA, 0);

  const title = `Construtoras com PBQP-H em ${ufNome}: ${total} empresas em ${lista.length} cidades | Anders Tech`;
  const desc = `${total} empresas com certificação SiAC/PBQP-H vigente em ${ufNome}, distribuídas em ${lista.length} municípios. ${nivelA} estão no nível A e ${vencendo} vencem nos próximos 12 meses.`;

  const itens = [
    { nome: 'Início', url: '/' },
    { nome: 'PBQP-H', url: '/pbqp-h' },
    { nome: 'Construtoras', url: '/pbqp-h/construtoras' },
    { nome: ufNome },
  ];

  return head({ title, desc, path, jsonLd: [breadcrumbLd(itens)], noindex: false }) + `
<section class="hero"><div class="wrap">
${migalhas(itens)}
<div class="tag">SiAC · ${esc(UF)}</div>
<h1>Construtoras com PBQP-H em ${esc(ufNome)}</h1>
<p class="lead">Distribuição da qualificação SiAC pelos municípios de ${esc(ufNome)}, com nível e vencimento.</p>
<div class="stats">
<div class="stat"><b>${total}</b><span>Empresas vigentes</span></div>
<div class="stat"><b>${lista.length}</b><span>Municípios</span></div>
<div class="stat"><b>${nivelA}</b><span>Nível A</span></div>
<div class="stat"><b>${vencendo}</b><span>Vencem em 12 meses</span></div>
</div>
</div></section>

<div class="content">
<p>Em ${esc(ufNome)}, <strong>${total}</strong> empresas mantêm certificação PBQP-H vigente. <strong>${publicaveis.length}</strong> municípios concentram ${GATE_MUNICIPIO} ou mais empresas e têm página própria abaixo.</p>
${carimbo()}
<h2>Municípios</h2>
<ul class="grid-links">${lista.filter((m) => m.publicavel).map((m) => `<li><a href="/pbqp-h/construtoras/${m.uf.toLowerCase()}/${m.slug}"><b>${esc(m.titulo)}</b><span>${m.total} empresa${m.total > 1 ? 's' : ''} · ${m.nivelA} nível A</span></a></li>`).join('')}</ul>
${lista.length > publicaveis.length ? `<p style="margin-top:18px;font-size:.93rem;color:var(--ink-mute)">Outros ${lista.length - publicaveis.length} municípios de ${esc(ufNome)} têm menos de ${GATE_MUNICIPIO} empresas qualificadas e não recebem página própria.</p>` : ''}
</div>

${ctaWhats(`Olá! Vim pela página de construtoras com PBQP-H em ${ufNome} e quero falar sobre a qualificação da minha construtora.`)}
` + FOOT;
}

// ── Hub nacional ─────────────────────────────────────────────────────────────
export function renderHub() {
  const lista = ufs();
  const d = dados();
  const path = '/pbqp-h/construtoras';
  const totalCidades = d.publicaveis.length;

  const title = `Construtoras com PBQP-H no Brasil: ${d.totalVigentes} empresas qualificadas por cidade | Anders Tech`;
  const desc = `Panorama da qualificação SiAC/PBQP-H no Brasil: ${d.totalVigentes} empresas com certificado vigente, em ${lista.length} estados e ${totalCidades} cidades com página própria.`;

  const itens = [
    { nome: 'Início', url: '/' },
    { nome: 'PBQP-H', url: '/pbqp-h' },
    { nome: 'Construtoras' },
  ];

  return head({ title, desc, path, jsonLd: [breadcrumbLd(itens)], noindex: false }) + `
<section class="hero"><div class="wrap">
${migalhas(itens)}
<div class="tag">SiAC · Brasil</div>
<h1>Quem tem PBQP-H, por cidade</h1>
<p class="lead">O registro oficial do SiAC responde uma empresa por vez. Aqui ele está agregado: quantas construtoras qualificadas existem em cada estado e cidade, em que nível e com que vencimento.</p>
<div class="stats">
<div class="stat"><b>${d.totalVigentes}</b><span>Empresas vigentes</span></div>
<div class="stat"><b>${lista.length}</b><span>Estados</span></div>
<div class="stat"><b>${totalCidades}</b><span>Cidades com página</span></div>
</div>
</div></section>

<div class="content">
<p>A qualificação no <a href="/pbqp-h"><strong>PBQP-H</strong></a> é exigida em financiamento habitacional e em boa parte das licitações públicas de obra. O registro é público, mas só permite consulta empresa por empresa — não existe visão por cidade. Esta é ela.</p>
${carimbo()}
<h2>Estados</h2>
<ul class="grid-links">${lista.map((u) => `<li><a href="/pbqp-h/construtoras/${u.uf.toLowerCase()}"><b>${esc(UF_NOME[u.uf] || u.uf)}</b><span>${u.total} empresas · ${u.publicaveis} cidade${u.publicaveis === 1 ? '' : 's'}</span></a></li>`).join('')}</ul>
</div>

${ctaWhats('Olá! Vim pela página de construtoras com PBQP-H e quero falar sobre a qualificação da minha construtora.')}
` + FOOT;
}

export { EMPRESA };
