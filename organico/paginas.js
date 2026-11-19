// ── Páginas do motor orgânico: template, portão de qualidade e links ─────────
// Conteúdo no banco (seo_paginas). Toda página passa pelo portão antes de
// publicar; o resultado fica gravado em `qualidade` e aparece no painel.
// Os requisitos da ISO 9001 (organico/normas.js) são semeados daqui no boot.

import { REQUISITOS, paginaDoRequisito, slugRequisito } from './normas.js';
import { CLUSTERS } from './taxonomia.js';
import { blocoIsca, barraIscaCelular, iscaInfo } from './iscas.js';
import { TERMOS_BY_SLUG } from '../glossario/terms.js';

const SITE = 'https://anderstech.net';
const AUTOR = { nome: 'Daniel Anders', cargo: 'Engenheiro Eletricista e Consultor ISO 9001, consultor desde 2004', url: '/autor/daniel-anders' };

export function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const PARADAS = new Set('a o as os de da do das dos e em no na nos nas um uma para por com sem que se ao aos ou como mais menos sobre entre the iso'.split(' '));
export const tokens = (s) => semAcento(s).replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(t => t.length > 1 && !PARADAS.has(t));
const palavras = (s) => String(s || '').split(/\s+/).filter(Boolean).length;

// ── Estado em memória (recarregado do banco) ──
let estado = { paginas: new Map(), links: new Map(), entrada: new Map(), html: new Map() };

export function caminho(p) { return '/' + p.slug; }
export function paginasPublicadas() { return [...estado.paginas.values()]; }
export function pagina(slug) { return estado.paginas.get(slug) || null; }

function textoDaPagina(p) {
  const c = p.corpo || {};
  return [p.titulo, p.h1, p.resposta, ...(c.secoes || []).flatMap(s => [s.titulo, s.texto, ...(s.lista || [])]), ...(p.faq || []).flatMap(f => [f.p, f.r])].filter(Boolean).join(' ');
}

// ── TF-IDF + cosseno: similaridade entre páginas (portão e motor de links) ──
export function vetores(paginas) {
  const docs = paginas.map(p => tokens(textoDaPagina(p)));
  const df = new Map();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) || 0) + 1);
  const N = docs.length || 1;
  return docs.map(d => {
    const tf = new Map();
    for (const t of d) tf.set(t, (tf.get(t) || 0) + 1);
    const v = new Map();
    let norma = 0;
    for (const [t, f] of tf) { const w = (f / d.length) * Math.log(1 + N / (df.get(t) || 1)); v.set(t, w); norma += w * w; }
    return { v, norma: Math.sqrt(norma) || 1 };
  });
}
export function cosseno(a, b) {
  let s = 0;
  const [m, n] = a.v.size < b.v.size ? [a, b] : [b, a];
  for (const [t, w] of m.v) { const x = n.v.get(t); if (x) s += w * x; }
  return s / (a.norma * b.norma);
}

// Motor de links: até 5 vizinhos por similaridade (mesmo cluster primeiro) +
// requisito anterior/seguinte nas páginas de norma. Zero página órfã: todas
// também entram no hub do tipo.
export function calcularLinks(paginas) {
  const vs = vetores(paginas);
  const links = new Map(), entrada = new Map(), maxSim = new Map();
  paginas.forEach((p, i) => {
    const cand = paginas.map((q, j) => [q, j === i ? -1 : cosseno(vs[i], vs[j]) + (q.cluster === p.cluster ? 0.15 : 0)]).filter(([, s]) => s > 0);
    cand.sort((a, b) => b[1] - a[1]);
    const escolhidos = cand.slice(0, 5).map(([q]) => q.slug);
    if (p.tipo === 'norma') {
      const k = REQUISITOS.findIndex(r => p.slug.endsWith('/' + slugRequisito(r.n)));
      for (const d of [k - 1, k + 1]) if (REQUISITOS[d]) { const s = 'norma-iso-9001/' + slugRequisito(REQUISITOS[d].n); if (!escolhidos.includes(s)) escolhidos.push(s); }
    }
    links.set(p.slug, escolhidos);
    // Similaridade pura (sem o bônus de cluster), para o portão.
    let max = 0;
    paginas.forEach((q, j) => { if (j !== i) max = Math.max(max, cosseno(vs[i], vs[j])); });
    maxSim.set(p.slug, max);
  });
  for (const [de, para] of links) for (const s of para) entrada.set(s, (entrada.get(s) || 0) + 1);
  for (const p of paginas) entrada.set(p.slug, (entrada.get(p.slug) || 0) + 1); // hub do tipo
  return { links, entrada, maxSim, vs };
}

// ── Portão de qualidade ──
export function portao(p, ctx = {}) {
  const checks = [];
  const add = (nome, ok, detalhe) => checks.push({ nome, ok: !!ok, detalhe });
  const nResp = palavras(p.resposta);
  add('resposta_direta_40_60', nResp >= 40 && nResp <= 60, `${nResp} palavras`);
  const duas = String(p.resposta || '').split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
  const alvo = tokens(p.consulta);
  const cobre = alvo.filter(t => tokens(duas).includes(t)).length;
  add('responde_nas_2_primeiras_frases', alvo.length === 0 || cobre / alvo.length >= 0.6, `${cobre}/${alvo.length} termos da consulta`);
  add('valor_proprio', !!(p.valor_proprio && p.valor_proprio.length > 20), p.valor_proprio ? 'declarado' : 'ausente');
  const fontes = (p.fontes || []).filter(f => f && f.url);
  add('fontes_oficiais', fontes.length >= 1, `${fontes.length} fonte(s)`);
  const sim = ctx.maxSim != null ? ctx.maxSim : 0;
  add('similaridade_abaixo_0_8', sim < 0.8, `máx. ${sim.toFixed(2)}`);
  const tit = String(p.titulo || '');
  const consultaNoInicio = alvo.length === 0 || tokens(tit.slice(0, 40)).filter(t => alvo.includes(t)).length >= Math.min(2, alvo.length);
  add('title_60_consulta_primeiro', tit.length <= 60 && consultaNoInicio, `${tit.length} caracteres`);
  const d = String(p.descricao || '');
  add('description_155', d.length >= 70 && d.length <= 155, `${d.length} caracteres`);
  add('links_saida_3', (ctx.saida || 0) >= 3, `${ctx.saida || 0}`);
  add('links_entrada_3', (ctx.entrada || 0) >= 3, `${ctx.entrada || 0}`);
  add('isca_presente', !!iscaInfo(p.isca || (CLUSTERS[p.cluster] || {}).isca), p.isca || 'do cluster');
  const nCorpo = palavras(textoDaPagina(p));
  const faixa = { norma: [250, 1600], glossario: [150, 900], satelite: [400, 2200], modelo: [250, 1500], pilar: [900, 4000] }[p.tipo] || [250, 2500];
  add('tamanho_pela_intencao', nCorpo >= faixa[0] && nCorpo <= faixa[1], `${nCorpo} palavras (${faixa[0]}–${faixa[1]})`);
  add('jsonld_valido', (() => { try { jsonLd(p).forEach(j => JSON.parse(j)); return true; } catch { return false; } })(), 'Article + FAQPage');
  return { aprovada: checks.every(c => c.ok), checks, avaliada_em: new Date().toISOString() };
}

// ── JSON-LD fiel ao conteúdo visível ──
export function jsonLd(p) {
  const url = SITE + caminho(p);
  const art = {
    '@context': 'https://schema.org', '@type': 'Article', headline: p.h1 || p.titulo, description: p.descricao,
    inLanguage: 'pt-BR', mainEntityOfPage: url,
    datePublished: (p.publicado_em ? new Date(p.publicado_em) : new Date()).toISOString().slice(0, 10),
    dateModified: (p.revisado_em ? new Date(p.revisado_em) : new Date()).toISOString().slice(0, 10),
    author: { '@type': 'Person', name: AUTOR.nome, url: SITE + AUTOR.url, jobTitle: 'Engenheiro Eletricista e Consultor ISO 9001' },
    publisher: { '@type': 'Organization', name: 'Anders Tech', url: SITE + '/' },
    ...(p.fontes && p.fontes.length ? { citation: p.fontes.map(f => f.url).filter(Boolean) } : {}),
  };
  const out = [JSON.stringify(art)];
  if (p.faq && p.faq.length) {
    out.push(JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faq.map(f => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })) }));
  }
  return out;
}

const dataBR = (d) => new Date(d || Date.now()).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

// ── Template (todos os tipos): H1, resposta direta, sumário, corpo, isca no
// meio e no fim, FAQ, autor e data, fontes, links, CTA do produto ──
export function renderizar(p, { links = [], titulosPorSlug = new Map() } = {}) {
  const url = SITE + caminho(p);
  const cluster = CLUSTERS[p.cluster] || CLUSTERS['iso-9001'];
  const iscaId = p.isca || cluster.isca;
  const secoes = (p.corpo && p.corpo.secoes) || [];
  const ancora = (i) => 's' + (i + 1);
  const htmlSecao = (s, i) => `<section id="${ancora(i)}"><h2>${esc(s.titulo)}</h2>`
    + (s.texto ? `<p>${esc(s.texto)}</p>` : '')
    + (s.lista ? `<ul>${s.lista.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '')
    + (s.passos ? `<ol>${s.passos.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : '')
    + (s.tabela ? `<div style="overflow-x:auto"><table class="mo-tab"><thead><tr>${s.tabela.cabecalho.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${s.tabela.linhas.map(l => `<tr>${l.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '')
    + '</section>';
  const meio = Math.min(2, secoes.length);
  const glossario = ((p.corpo && p.corpo.glossario) || []).filter(s => TERMOS_BY_SLUG.has(s));
  const ia = p.origem === 'llm' ? 'Rascunho produzido com auxílio de IA a partir das fontes listadas e aprovado pelo portão de qualidade do site.' : 'Conteúdo produzido com auxílio de IA e publicado sob responsabilidade do autor.';
  const migalhas = p.tipo === 'norma'
    ? [['Início', '/'], ['Requisitos da ISO 9001', '/norma-iso-9001'], [p.h1 || p.titulo, caminho(p)]]
    : [['Início', '/'], ['Guias', '/guias'], [p.h1 || p.titulo, caminho(p)]];
  const breadcrumbLd = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: migalhas.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + u })) });
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.titulo)} — Anders Tech</title><meta name="description" content="${esc(p.descricao)}"><meta name="author" content="${AUTOR.nome}">
<meta name="robots" content="index, follow"><link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(p.titulo)}"><meta property="og:description" content="${esc(p.descricao)}"><meta property="og:type" content="article"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/og/${p.slug}.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta property="og:locale" content="pt_BR">
<meta name="at-page-type" content="${esc(p.tipo)}"><meta name="at-cluster" content="${esc(p.cluster)}"><meta name="at-consulta" content="${esc(p.consulta)}">
<link rel="stylesheet" href="/styles.css"><link rel="icon" href="/assets/favicon.png" type="image/png">
${jsonLd(p).map(j => `<script type="application/ld+json">${j}</script>`).join('')}<script type="application/ld+json">${breadcrumbLd}</script>
<style>.mo-hero{background:#0b1730;color:#fff;padding:clamp(36px,6vw,64px) 16px clamp(28px,4vw,44px)}.mo-hero .wrap,.mo-main{max-width:840px;margin:0 auto}
.mo-hero h1{font-family:var(--ff-display,system-ui);font-size:clamp(1.6rem,4vw,2.3rem);line-height:1.15;color:#fff;margin:8px 0 12px}.mo-mig{font-size:.8rem;color:#b9c8e4}.mo-mig a{color:#b9c8e4}
.mo-autor{font-size:.85rem;color:#b9c8e4}.mo-autor a{color:#fff}.mo-resp{background:#12233f;border-left:4px solid #FE0000;padding:14px 16px;color:#e6ecf7;line-height:1.65;margin-top:14px}
.mo-main{padding:28px 16px 64px;color:#16233f;line-height:1.72}.mo-main h2{font-family:var(--ff-display,system-ui);font-size:1.35rem;color:#0b1730;margin:32px 0 10px}
.mo-main ul,.mo-main ol{padding-left:22px}.mo-sum{background:#f4f6fa;border:1px solid #e1e6ef;padding:12px 16px;border-radius:6px;font-size:.92rem}
.mo-tab{width:100%;border-collapse:collapse;font-size:.92rem}.mo-tab th{background:#0b1730;color:#fff;text-align:left;padding:8px}.mo-tab td{padding:8px;border-bottom:1px solid #e1e6ef}
.mo-faq details{border:1px solid #e1e6ef;border-radius:6px;padding:10px 14px;margin-bottom:8px;background:#fff}.mo-faq summary{font-weight:600;cursor:pointer}
.mo-fonte{font-size:.84rem;color:#5b6577}.mo-cta{background:#0b1730;color:#fff;border-radius:8px;padding:20px;margin-top:28px}.mo-cta a{color:#fff;font-weight:700}</style>
</head><body><div id="shared-nav"></div><main>
<section class="mo-hero"><div class="wrap"><nav class="mo-mig" aria-label="Você está em">${migalhas.map(([n, u], i) => i < migalhas.length - 1 ? `<a href="${u}">${esc(n)}</a> › ` : esc(n)).join('')}</nav>
<h1>${esc(p.h1 || p.titulo)}</h1><div class="mo-autor">Por <a href="${AUTOR.url}">${AUTOR.nome}</a>, ${esc(AUTOR.cargo)} · atualizado em ${dataBR(p.revisado_em)}</div>
<p class="mo-resp">${esc(p.resposta)}</p></div></section>
<div class="mo-main">
${secoes.length > 2 ? `<nav class="mo-sum" aria-label="Sumário"><b>Nesta página:</b> ${secoes.map((s, i) => `<a href="#${ancora(i)}">${esc(s.titulo)}</a>`).join(' · ')}</nav>` : ''}
${secoes.slice(0, meio).map(htmlSecao).join('')}
${blocoIsca(iscaId, 'meio')}
${secoes.slice(meio).map((s, i) => htmlSecao(s, i + meio)).join('')}
${glossario.length ? `<p><b>Termos do glossário:</b> ${glossario.map(s => `<a href="/glossario/${s}">${esc(TERMOS_BY_SLUG.get(s).termo)}</a>`).join(' · ')}</p>` : ''}
${p.faq && p.faq.length ? `<h2>Perguntas frequentes</h2><div class="mo-faq">${p.faq.map(f => `<details><summary>${esc(f.p)}</summary><p>${esc(f.r)}</p></details>`).join('')}</div>` : ''}
${links.length ? `<h2>Leia também</h2><ul>${links.map(s => `<li><a href="/${s}">${esc(titulosPorSlug.get(s) || s)}</a></li>`).join('')}</ul>` : ''}
<p><a href="${cluster.pilar}">Guia completo: ${esc(cluster.nome)}</a></p>
${blocoIsca(iscaId, 'fim')}
<div class="mo-cta"><b>Precisa aplicar isso na sua empresa?</b><br>O preço da consultoria sai na hora pelo porte e pela cidade: <a href="${cluster.comercial}" data-cta-produto="${esc(p.slug)}">ver o preço</a>. Atendimento presencial a até 300 km de Passo Fundo.</div>
${p.fontes && p.fontes.length ? `<h2>Fontes</h2><ul class="mo-fonte">${p.fontes.map(f => `<li><a href="${esc(f.url)}" rel="noopener" target="_blank">${esc(f.nome)}</a>${f.data ? ` (${esc(f.data)})` : ''}</li>`).join('')}</ul>` : ''}
<p class="mo-fonte">${ia} <a href="/politica-editorial">Política editorial</a>. Viu um erro? <a href="https://wa.me/5554999648368?text=${encodeURIComponent('Olá! Vim pela página ' + (p.h1 || p.titulo) + ' (/' + p.slug + ') e encontrei um erro')}">Avise o autor</a>.</p>
</div></main><div id="shared-footer"></div>${barraIscaCelular(iscaId)}</body></html>`;
}

// ── Carga: banco + sementes (requisitos) ──
export function sementes() { return REQUISITOS.map(paginaDoRequisito); }

export async function recarregar(sql) {
  let doBanco = [];
  if (sql) {
    try {
      // Sementes entram no banco (idempotente): o painel enxerga e o portão grava.
      for (const s of sementes()) {
        await sql`
          INSERT INTO seo_paginas (slug, tipo, cluster, consulta, titulo, descricao, h1, resposta, corpo, faq, fontes, valor_proprio, isca, origem, status)
          VALUES (${s.slug}, ${s.tipo}, ${s.cluster}, ${s.consulta}, ${s.titulo}, ${s.descricao}, ${s.h1}, ${s.resposta}, ${JSON.stringify(s.corpo)}::jsonb,
                  ${JSON.stringify(s.faq)}::jsonb, ${JSON.stringify(s.fontes)}::jsonb, ${s.valor_proprio}, ${s.isca || null}, ${s.origem}, 'aprovada')
          ON CONFLICT (slug) DO UPDATE SET titulo = EXCLUDED.titulo, descricao = EXCLUDED.descricao, h1 = EXCLUDED.h1, resposta = EXCLUDED.resposta,
            corpo = EXCLUDED.corpo, faq = EXCLUDED.faq, fontes = EXCLUDED.fontes, valor_proprio = EXCLUDED.valor_proprio
          WHERE seo_paginas.origem = 'manual'`;
      }
      doBanco = await sql`SELECT * FROM seo_paginas WHERE status IN ('publicada', 'aprovada')`;
    } catch (err) {
      console.error('[organico] carga do banco:', err.message);
    }
  }
  const base = doBanco.length ? doBanco : sementes().map(s => ({ ...s, status: 'aprovada' }));
  const { links, entrada, maxSim } = calcularLinks(base);
  const publicadas = new Map();
  const resultados = [];
  for (const p of base) {
    const q = portao(p, { saida: (links.get(p.slug) || []).length, entrada: entrada.get(p.slug) || 0, maxSim: maxSim.get(p.slug) || 0 });
    resultados.push({ slug: p.slug, ...q });
    // Página manual que passa no portão publica direto; a produzida por IA
    // aprovada espera a onda semanal (organico/producao.js).
    const publica = q.aprovada && (p.status === 'publicada' || p.origem === 'manual');
    if (publica) publicadas.set(p.slug, p);
    if (sql) {
      try {
        await sql`UPDATE seo_paginas SET qualidade = ${JSON.stringify(q)}::jsonb,
                    status = ${publica ? 'publicada' : (q.aprovada ? p.status : 'revisao')},
                    publicado_em = CASE WHEN ${publica} AND publicado_em IS NULL THEN NOW() ELSE publicado_em END
                  WHERE slug = ${p.slug}`;
      } catch { /* banco fora: segue com a memória */ }
    }
  }
  estado = { paginas: publicadas, links, entrada, html: new Map() };
  return { publicadas: publicadas.size, avaliadas: resultados.length, reprovadas: resultados.filter(r => !r.aprovada) };
}

export function htmlDaPagina(slug) {
  if (estado.html.has(slug)) return estado.html.get(slug);
  const p = estado.paginas.get(slug);
  if (!p) return null;
  const titulos = new Map([...estado.paginas.values()].map(q => [q.slug, q.h1 || q.titulo]));
  const links = (estado.links.get(slug) || []).filter(s => estado.paginas.has(s));
  const html = renderizar(p, { links, titulosPorSlug: titulos });
  estado.html.set(slug, html);
  return html;
}

// URLs do motor para o sitemap (com lastmod real).
export function urlsMotor() {
  return [...estado.paginas.values()].map(p => [caminho(p), new Date(p.revisado_em || Date.now()).toISOString().slice(0, 10), 'monthly', '0.7', p.tipo]);
}
