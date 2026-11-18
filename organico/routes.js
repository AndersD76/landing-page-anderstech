// ── Rotas do motor orgânico ──────────────────────────────────────────────────
// Públicas: requisitos da ISO 9001, hubs (requisitos, guias, iscas), páginas do
// banco (/guia, /modelo, /comparativo, /termo), iscas com PDF por e-mail,
// autor, sobre, política editorial, panorama de dados do PBQP-H (com gráfico
// incorporável e JSON) e sitemaps por tipo. Internas: /admin/organico e APIs.

import { Router } from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { injectShared } from '../inject.js';
import { htmlDaPagina, paginasPublicadas, caminho, esc, recarregar } from './paginas.js';
import { REQUISITOS, slugRequisito } from './normas.js';
import { ISCAS, iscaInfo, previa, pdfIsca } from './iscas.js';
import { CLUSTERS } from './taxonomia.js';
import { dados as dadosPbqph } from '../pbqph/dados.js';
import { validarContato, primeiroNome } from '../config/contato.js';
import { registrarLeadDeOrigem, origemDoLead } from '../growth/leads.js';
import { notifyNewLead, layout } from '../emails.js';
import { EMPRESA } from '../config/empresa.js';
import { aoLeadIscaOrganica } from './iscas.js';
import { gscConfigurado, ga4Configurado, bingConfigurado, serpConfigurado } from './fontes.js';
import { producaoAtiva } from './producao.js';
import { semear } from './jobs.js';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'admin');
const SITE = 'https://anderstech.net';

function pagina({ titulo, descricao, canonical, robots = 'index, follow', corpo, rota, jsonld = [], extraHead = '' }) {
  return injectShared(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titulo)} — Anders Tech</title><meta name="description" content="${esc(descricao)}"><meta name="robots" content="${robots}">
<link rel="canonical" href="${SITE}${canonical}"><meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(descricao)}"><meta property="og:url" content="${SITE}${canonical}"><meta property="og:image" content="${SITE}/assets/og-image.png">
<link rel="stylesheet" href="/styles.css"><link rel="icon" href="/assets/favicon.png" type="image/png">${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('')}${extraHead}
<style>.og-h{background:#0b1730;color:#fff;padding:clamp(36px,6vw,64px) 16px 36px}.og-h .w,.og-m{max-width:880px;margin:0 auto}.og-h h1{color:#fff;font-family:var(--ff-display,system-ui);font-size:clamp(1.6rem,4vw,2.3rem);margin-bottom:10px}.og-h p{color:#b9c8e4}
.og-m{padding:28px 16px 64px;line-height:1.7;color:#16233f}.og-m h2{color:#0b1730;font-size:1.3rem;margin:28px 0 10px}.og-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}
.og-card{display:block;border:1px solid #e1e6ef;border-radius:8px;padding:14px;background:#fff;text-decoration:none;color:#16233f}.og-card b{color:#0b1730}.og-tab{width:100%;border-collapse:collapse;font-size:.92rem}.og-tab td,.og-tab th{border-bottom:1px solid #e1e6ef;padding:7px;text-align:left}</style>
</head><body><div id="shared-nav"></div><main>${corpo}</main><div id="shared-footer"></div></body></html>`, rota);
}

// Gráfico de barras em SVG puro (sem JS), usado no panorama e no embed.
function barras(itens, { largura = 640, cor = '#203864' } = {}) {
  const max = Math.max(1, ...itens.map(i => i[1]));
  const h = 22, alt = itens.length * (h + 6) + 10;
  return `<svg viewBox="0 0 ${largura} ${alt}" width="100%" role="img" aria-label="Gráfico de barras" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;font-size:12px">`
    + itens.map(([rot, v], k) => { const y = 5 + k * (h + 6); const w = Math.round((largura - 170) * v / max); return `<text x="0" y="${y + 15}" fill="#16233f">${esc(rot)}</text><rect x="120" y="${y}" width="${w}" height="${h}" fill="${cor}" rx="2"/><text x="${126 + w}" y="${y + 15}" fill="#16233f">${v}</text>`; }).join('')
    + '</svg>';
}

function estatPbqph() {
  const d = dadosPbqph();
  const conta = (f) => { const m = new Map(); for (const r of d.registros) { const k = f(r); if (k) m.set(k, (m.get(k) || 0) + 1); } return [...m.entries()].sort((a, b) => b[1] - a[1]); };
  const agora = Date.now();
  const venc = new Map();
  for (const r of d.registros) {
    if (!r.validade) continue;
    const t = new Date(r.validade).getTime();
    if (t < agora || t > agora + 365 * 86400_000) continue;
    const k = r.validade.slice(0, 7);
    venc.set(k, (venc.get(k) || 0) + 1);
  }
  return {
    carregado: String(d.carregadoEm || '').slice(0, 10), total: d.totalVigentes,
    porUf: conta(r => r.uf), porNivel: conta(r => 'Nível ' + r.nivel), porOrganismo: conta(r => r.organismo).slice(0, 10),
    vencimentos: [...venc.entries()].sort(),
  };
}

export function router({ adminAuth, send404 }) {
  const r = Router();

  // ── Requisitos da ISO 9001 ──
  r.get('/norma-iso-9001', (req, res) => {
    const pubs = new Set(paginasPublicadas().map(p => p.slug));
    const lista = REQUISITOS.filter(x => pubs.has('norma-iso-9001/' + slugRequisito(x.n)));
    res.type('html').send(pagina({
      titulo: 'Requisitos da ISO 9001 Explicados, Um por Um', canonical: '/norma-iso-9001', rota: '/norma-iso-9001',
      descricao: `Os ${lista.length} requisitos da ISO 9001 explicados: o que pedem, que evidência o auditor cobra e o que muda na versão 2026.`,
      corpo: `<section class="og-h"><div class="w"><h1>Requisitos da ISO 9001 explicados, um por um</h1><p>O que cada requisito pede, que evidência o auditor cobra, os erros mais comuns e, quando houver, o que muda na ISO 9001:2026 (prazo final da transição: 30/09/2029).</p></div></section>
<div class="og-m"><div class="og-grid">${lista.map(x => `<a class="og-card" href="/norma-iso-9001/${slugRequisito(x.n)}"><b>${x.n} ${esc(x.titulo)}</b>${x.mudanca2026 ? '<br><small style="color:#d80a0a">muda na 2026</small>' : ''}</a>`).join('')}</div>
<p style="margin-top:20px">Veja também: <a href="/iso-9001-2026">ISO 9001:2026: o que muda</a> · <a href="/iscas">materiais gratuitos</a> · <a href="/glossario">glossário da qualidade</a>.</p></div>`,
      jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Requisitos da ISO 9001', url: SITE + '/norma-iso-9001', hasPart: lista.map(x => ({ '@type': 'Article', name: `Requisito ${x.n} ${x.titulo}`, url: `${SITE}/norma-iso-9001/${slugRequisito(x.n)}` })) }],
    }));
  });
  r.get('/norma-iso-9001/:n', (req, res) => {
    const h = /^[0-9-]{1,8}$/.test(req.params.n) ? htmlDaPagina('norma-iso-9001/' + req.params.n) : null;
    if (!h) return send404(res);
    res.set('Cache-Control', 'public, max-age=300').type('html').send(injectShared(h, '/norma-iso-9001/' + req.params.n));
  });

  // ── Páginas do banco por tipo ──
  for (const prefixo of ['guia', 'modelo', 'comparativo', 'termo', 'setor']) {
    r.get(`/${prefixo}/:slug`, (req, res) => {
      const slug = `${prefixo}/${String(req.params.slug || '')}`;
      const h = /^[a-z0-9-]{2,90}$/.test(req.params.slug) ? htmlDaPagina(slug) : null;
      if (!h) return send404(res);
      res.set('Cache-Control', 'public, max-age=300').type('html').send(injectShared(h, '/' + slug));
    });
  }
  r.get('/guias', (req, res) => {
    const pubs = paginasPublicadas();
    const porCluster = new Map();
    for (const p of pubs) { if (!porCluster.has(p.cluster)) porCluster.set(p.cluster, []); porCluster.get(p.cluster).push(p); }
    res.type('html').send(pagina({
      titulo: 'Guias de ISO 9001 e PBQP-H por Tema', canonical: '/guias', rota: '/guias',
      descricao: `${pubs.length} guias práticos de ISO 9001, transição 2026, auditoria e PBQP-H, organizados por tema, com material gratuito em cada um.`,
      corpo: `<section class="og-h"><div class="w"><h1>Guias de ISO 9001 e PBQP-H por tema</h1><p>Todas as páginas de referência do site, rastreáveis sem JavaScript.</p></div></section><div class="og-m">`
        + [...porCluster.entries()].map(([c, l]) => `<h2>${esc((CLUSTERS[c] || {}).nome || c)}</h2><ul>${l.map(p => `<li><a href="${caminho(p)}">${esc(p.h1 || p.titulo)}</a></li>`).join('')}</ul><p><a href="${(CLUSTERS[c] || {}).pilar || '/'}">Guia principal do tema →</a></p>`).join('')
        + '</div>',
    }));
  });

  // ── Iscas ──
  r.get('/iscas', (req, res) => {
    const lista = Object.keys(ISCAS).map(iscaInfo);
    res.type('html').send(pagina({
      titulo: 'Modelos, Checklists e Ferramentas Grátis de ISO 9001', canonical: '/iscas', rota: '/iscas',
      descricao: 'Checklists, modelos e ferramentas gratuitas de ISO 9001, transição 2026, auditoria interna e PBQP-H. Veja a prévia e receba o completo por e-mail.',
      corpo: `<section class="og-h"><div class="w"><h1>Modelos, checklists e ferramentas grátis</h1><p>Prévia na tela, material completo por e-mail.</p></div></section><div class="og-m"><div class="og-grid">${lista.map(i => `<a class="og-card" href="${i.url || '/iscas/' + i.id}" data-isca="${i.id}" data-isca-pos="hub"><b>${esc(i.titulo)}</b><br><small>${esc(i.resumo)}</small></a>`).join('')}</div></div>`,
    }));
  });
  r.get('/iscas/:id', (req, res) => {
    const i = iscaInfo(String(req.params.id));
    if (!i) return send404(res);
    if (i.url) return res.redirect(301, i.url);
    const c = CLUSTERS[i.cluster] || CLUSTERS['iso-9001'];
    const pv = previa(i.id);
    res.type('html').send(pagina({
      titulo: i.titulo.slice(0, 60), canonical: '/iscas/' + i.id, rota: '/iscas/' + i.id,
      descricao: `${i.resumo} Prévia grátis na tela e material completo em PDF por e-mail.`.slice(0, 155),
      extraHead: `<meta name="at-page-type" content="isca"><meta name="at-cluster" content="${esc(i.cluster)}"><meta name="at-consulta" content="${esc(i.titulo.toLowerCase())}">`,
      corpo: `<section class="og-h"><div class="w"><h1>${esc(i.titulo)}</h1><p>${esc(i.resumo)}</p></div></section>
<div class="og-m"><h2>Prévia</h2>${pv.map(s => `<h3 style="color:#203864">${esc(s.titulo)}</h3><ul>${s.itens.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`).join('')}
<form id="fi" data-isca="${esc(i.id)}" data-isca-pos="formulario" style="background:#f4f6fa;border-radius:8px;padding:18px;margin-top:20px" novalidate>
<h2 style="margin-top:0">Receber o material completo (PDF)</h2>
<div class="og-grid"><label>Nome<br><input id="fNome" autocomplete="name" style="width:100%;padding:9px"></label><label>E-mail *<br><input id="fEmail" type="email" autocomplete="email" style="width:100%;padding:9px"></label><label>Empresa<br><input id="fEmpresa" autocomplete="organization" style="width:100%;padding:9px"></label></div>
<label style="display:flex;gap:8px;margin-top:12px;font-size:.9rem"><input type="checkbox" id="fOptin"> <span>Quero receber, por e-mail, conteúdo sobre ${esc(c.nome.toLowerCase())} (no máximo 5 mensagens; descadastro em 1 clique).</span></label>
<input id="fWeb" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">
<button type="submit" style="margin-top:12px;background:#d80a0a;color:#fff;border:0;padding:12px 20px;border-radius:6px;font-weight:700;cursor:pointer">Receber o PDF</button>
<div id="fMsg" role="status" style="margin-top:10px"></div></form>
<p style="margin-top:20px">Precisa aplicar na empresa? <a href="${c.comercial}" data-cta-produto="${esc(i.id)}">Veja o preço da consultoria na hora</a> · <a href="${c.pilar}">Guia do tema</a></p></div>
<script>(function(){var f=document.getElementById('fi'),m=document.getElementById('fMsg');f.addEventListener('submit',function(e){e.preventDefault();var v=function(x){return document.getElementById(x).value};if(!v('fEmail')){m.textContent='Informe o e-mail.';return}m.textContent='Enviando…';
fetch('/api/iscas/${esc(i.id)}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:v('fNome'),email:v('fEmail'),empresa:v('fEmpresa'),website:v('fWeb'),optin_marketing:document.getElementById('fOptin').checked,atrib:window.anders&&window.anders.atrib?window.anders.atrib():null})})
.then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})}).then(function(x){if(!x.ok){m.textContent=x.j.error||'Não foi possível enviar.';return}m.textContent='Pronto: o PDF foi para o seu e-mail.';if(window.anders){window.anders.isca('isca_concluida','${esc(i.id)}');window.anders.isca('lead_capturado','${esc(i.id)}');window.anders.identify({email:v('fEmail')})}})
.catch(function(){m.textContent='Falha de conexão. Tente de novo.'})})})();</script>`,
    }));
  });
  r.post('/api/iscas/:id', async (req, res) => {
    const i = iscaInfo(String(req.params.id));
    if (!i || i.url) return res.status(404).json({ error: 'Material não encontrado' });
    if (req.body && req.body.website) return res.json({ ok: true });
    const v = validarContato({ ...req.body, source: 'isca_' + i.id, interesse: i.titulo });
    if (!v.ok || !v.dados.email) return res.status(400).json({ error: v.erro || 'Informe um e-mail válido.' });
    const d = v.dados;
    const optin = req.body.optin_marketing === true;
    const lead = await registrarLeadDeOrigem(sql, { req, origem: origemDoLead(req, d), source: 'isca_' + i.id, nome: d.nome, empresa: d.empresa, email: d.email, interesse: i.titulo });
    if (sql && lead && lead.leadId) {
      await sql`UPDATE leads SET optin_marketing = ${optin}, isca = ${i.id} WHERE id = ${lead.leadId}`;
      await aoLeadIscaOrganica(sql, { leadId: lead.leadId, source: 'isca_' + i.id, email: d.email, nome: primeiroNome(d.nome), optin }).catch(() => {});
    }
    if (resend) {
      try {
        const pdf = await pdfIsca(i.id);
        const c = CLUSTERS[i.cluster] || CLUSTERS['iso-9001'];
        await resend.emails.send({
          from: `Daniel Anders · Anders Tech <${EMPRESA.emailRemetente}>`, to: d.email, subject: `${i.titulo} (PDF)`,
          html: layout(`<div class="body"><h2>${primeiroNome(d.nome) ? esc(primeiroNome(d.nome)) + ', aqui' : 'Aqui'} está o material</h2><p>O <b>${esc(i.titulo)}</b> está em anexo.</p><p>Para ir além: <a href="${SITE}${c.pilar}?utm_source=anderstech&utm_medium=email&utm_campaign=isca-${i.id}">guia completo do tema</a>.</p></div>`),
          attachments: pdf ? [{ filename: `${i.id}.pdf`, content: pdf.toString('base64') }] : [],
        });
        await resend.emails.send({
          from: `Anders Tech <${EMPRESA.emailRemetente}>`, to: process.env.NOTIFY_EMAIL || EMPRESA.email,
          subject: `[Anders Tech] Lead de isca (${lead ? lead.score : '-'}): ${d.email} · ${i.id}`,
          html: notifyNewLead({ ...d, source: 'isca_' + i.id, leadId: lead && lead.leadId, canal: lead && lead.origem.canal, score: lead && lead.score, motivos: lead && lead.motivos, paginas: lead && lead.paginas }),
        });
      } catch (err) { console.error('[isca] envio:', err.message); }
    }
    res.json({ ok: true });
  });

  // ── Autor, sobre, política editorial ──
  r.get('/autor/daniel-anders', (req, res) => {
    res.type('html').send(pagina({
      titulo: 'Daniel Anders, Consultor ISO 9001 e PBQP-H', canonical: '/autor/daniel-anders', rota: '/autor/daniel-anders',
      descricao: 'Daniel Anders é engenheiro eletricista e consultor de ISO 9001 e PBQP-H desde 2004, em Passo Fundo/RS. Autor dos guias da Anders Tech.',
      corpo: `<section class="og-h"><div class="w"><h1>Daniel Anders</h1><p>Engenheiro eletricista · Consultor ISO 9001 e PBQP-H · desde 2004</p></div></section>
<div class="og-m"><img src="/assets/FOTO_PERFIL_NOVA.jpg" alt="Daniel Anders" width="200" height="200" loading="lazy" style="border-radius:8px;float:right;margin:0 0 12px 16px;max-width:40%">
<p>Daniel Anders atua como consultor desde 2004 e conduz a Anders Tech, em Passo Fundo (RS), com foco em ISO 9001 e PBQP-H para indústrias e construtoras a até 300 km da cidade.</p>
<p>É o autor responsável pelas páginas de referência do site: os <a href="/norma-iso-9001">requisitos da ISO 9001 explicados</a>, o <a href="/iso-9001-2026">guia da ISO 9001:2026</a>, o <a href="/dados/pbqp-h">panorama do PBQP-H</a> e o <a href="/glossario">glossário da qualidade</a>. Como o conteúdo é produzido está na <a href="/politica-editorial">política editorial</a>.</p>
<p>Contato: <a href="https://wa.me/5554999648368?text=${encodeURIComponent('Olá! Vim pela página Daniel Anders (/autor/daniel-anders)')}">WhatsApp</a> · <a href="/sobre">sobre a empresa</a></p></div>`,
      jsonld: [{ '@context': 'https://schema.org', '@type': 'Person', name: 'Daniel Anders', jobTitle: 'Engenheiro Eletricista e Consultor ISO 9001', description: 'Consultor desde 2004 em gestão da qualidade', image: SITE + '/assets/FOTO_PERFIL_NOVA.jpg', url: SITE + '/autor/daniel-anders', worksFor: { '@type': 'Organization', name: 'Anders Tech', url: SITE + '/' } }],
    }));
  });
  r.get('/sobre', (req, res) => {
    res.type('html').send(pagina({
      titulo: 'Sobre a Anders Tech: Consultoria em Passo Fundo/RS', canonical: '/sobre', rota: '/sobre',
      descricao: 'Anders Tech, consultoria em ISO 9001 e PBQP-H em Passo Fundo/RS. CNPJ, contato, área de atendimento e como trabalhamos.',
      corpo: `<section class="og-h"><div class="w"><h1>Sobre a Anders Tech</h1><p>Consultoria em gestão da qualidade para indústrias e construtoras.</p></div></section>
<div class="og-m"><table class="og-tab"><tr><th>Empresa</th><td>${esc(EMPRESA.razaoSocial || EMPRESA.nome)}</td></tr><tr><th>CNPJ</th><td>${esc(EMPRESA.cnpj)}</td></tr>
<tr><th>Sede</th><td>${esc(EMPRESA.endereco ? EMPRESA.endereco + ' — Passo Fundo/RS' : 'Passo Fundo/RS')}</td></tr><tr><th>Atendimento</th><td>Presencial a até 300 km de Passo Fundo pela estrada; cursos online para todo o Brasil</td></tr>
<tr><th>Contato</th><td>WhatsApp ${esc(EMPRESA.whatsappFormatado)}</td></tr><tr><th>Responsável</th><td><a href="/autor/daniel-anders">Daniel Anders</a>, engenheiro eletricista, consultor desde 2004</td></tr></table>
<h2>Como trabalhamos</h2><p>Preço por hora (R$ 180) com acréscimos claros de porte e distância, calculado na hora em <a href="/contratar">/contratar</a>. Nota fiscal em toda contratação.</p>
<p><a href="/politica-de-privacidade">Política de privacidade</a> · <a href="/politica-editorial">Política editorial</a> · <a href="/termos-de-uso">Termos de uso</a></p></div>`,
      jsonld: [{ '@context': 'https://schema.org', '@type': 'Organization', name: 'Anders Tech', url: SITE + '/', logo: SITE + '/assets/favicon.png', taxID: EMPRESA.cnpj, address: { '@type': 'PostalAddress', addressLocality: 'Passo Fundo', addressRegion: 'RS', addressCountry: 'BR' }, founder: { '@type': 'Person', name: 'Daniel Anders' } }],
    }));
  });
  r.get('/politica-editorial', (req, res) => {
    res.type('html').send(pagina({
      titulo: 'Política Editorial da Anders Tech', canonical: '/politica-editorial', rota: '/politica-editorial',
      descricao: 'Como as páginas da Anders Tech são produzidas: fontes oficiais, dado próprio, uso de IA, portão de qualidade e correções.',
      corpo: `<section class="og-h"><div class="w"><h1>Política editorial</h1><p>Como o conteúdo deste site é produzido e corrigido.</p></div></section>
<div class="og-m"><h2>Fontes</h2><p>Datas, prazos e números vêm de fonte oficial (ISO, Global ACI, SiAC/Ministério das Cidades), citada com data em cada página. Texto de norma não é reproduzido: é explicado com palavras próprias.</p>
<h2>Uso de inteligência artificial</h2><p>Parte das páginas é redigida com auxílio de IA, a partir de uma lista fechada de fatos verificados e do dado próprio do site. Toda página com essa origem traz o aviso no rodapé. O modelo é instruído a recusar o texto quando os fatos não bastam, em vez de completar com suposição.</p>
<h2>Portão de qualidade</h2><p>Antes de publicar, toda página passa por verificação automática: responde à busca nas duas primeiras frases, tem elemento próprio (exemplo, checklist, tabela ou dado), cita fonte, não repete outra página do site, tem título e descrição dentro do limite e links internos. A que não passa vai para revisão e não é publicada.</p>
<h2>Correções</h2><p>Encontrou um erro? Toda página tem um link para avisar o autor. A correção é feita e a data de atualização muda.</p>
<p>Responsável: <a href="/autor/daniel-anders">Daniel Anders</a>.</p></div>`,
    }));
  });

  // ── Panorama de dados do PBQP-H (ativo linkável) ──
  r.get('/dados/pbqp-h', (req, res) => {
    const e = estatPbqph();
    const embed = (g) => `<iframe src="${SITE}/embed/pbqp-h/${g}" width="100%" height="420" style="border:0" title="PBQP-H — Anders Tech" loading="lazy"></iframe>`;
    res.type('html').send(pagina({
      titulo: 'PBQP-H em Números: Empresas Certificadas por Estado', canonical: '/dados/pbqp-h', rota: '/dados/pbqp-h',
      descricao: `${e.total.toLocaleString('pt-BR')} registros de PBQP-H vigentes no Brasil (SiAC, ${e.carregado}): por estado, nível, certificadora e vencimentos. Gráficos para incorporar.`.slice(0, 155),
      corpo: `<section class="og-h"><div class="w"><h1>PBQP-H em números</h1><p>${e.total.toLocaleString('pt-BR')} registros de empresas com PBQP-H vigente no Brasil, pelo cadastro oficial do SiAC (carga de ${e.carregado}). Atualizado todo mês.</p></div></section>
<div class="og-m"><h2>Por estado</h2>${barras(e.porUf.slice(0, 15))}<p><small>Incorpore no seu site: <code>${esc(embed('uf'))}</code></small></p>
<h2>Por nível</h2>${barras(e.porNivel, { cor: '#d80a0a' })}
<h2>Certificadoras com mais registros</h2>${barras(e.porOrganismo)}
<h2>Vencimentos nos próximos 12 meses</h2>${barras(e.vencimentos)}<p><small>Incorpore: <code>${esc(embed('vencimentos'))}</code></small></p>
<p>Por cidade: <a href="/pbqp-h/construtoras">construtoras com PBQP-H por município</a> · <a href="/pbqp-h/certificadoras">por certificadora</a> · <a href="/dados/pbqp-h.json">dados agregados em JSON</a> · <a href="/dados/pbqp-h/metodologia">metodologia</a></p></div>`,
      jsonld: [{ '@context': 'https://schema.org', '@type': 'Dataset', name: 'PBQP-H: empresas com certificação vigente no Brasil', description: 'Contagem de registros vigentes no SiAC por estado, nível, certificadora e mês de vencimento, atualizada mensalmente.', url: SITE + '/dados/pbqp-h', creator: { '@type': 'Organization', name: 'Anders Tech' }, isBasedOn: 'https://pbqp-h.cidades.gov.br/sistemas/siac/empresas-certificadas/', spatialCoverage: 'Brasil', dateModified: e.carregado, isAccessibleForFree: true, distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: SITE + '/dados/pbqp-h.json' }] }],
    }));
  });
  r.get('/dados/pbqp-h.json', (req, res) => {
    const e = estatPbqph();
    res.set('Access-Control-Allow-Origin', '*').json({ fonte: 'SiAC/PBQP-H — Ministério das Cidades', compilacao: 'Anders Tech (anderstech.net/dados/pbqp-h)', carregado_em: e.carregado, total_vigentes: e.total, por_uf: Object.fromEntries(e.porUf), por_nivel: Object.fromEntries(e.porNivel), vencimentos_12m: Object.fromEntries(e.vencimentos) });
  });
  r.get('/dados/pbqp-h/metodologia', (req, res) => {
    const e = estatPbqph();
    res.type('html').send(pagina({
      titulo: 'Metodologia do Panorama PBQP-H', canonical: '/dados/pbqp-h/metodologia', rota: '/dados/pbqp-h/metodologia',
      descricao: 'De onde vêm os números do panorama do PBQP-H, o que conta como registro vigente, a frequência de atualização e os limites do dado.',
      corpo: `<section class="og-h"><div class="w"><h1>Metodologia do panorama PBQP-H</h1></div></section><div class="og-m">
<p><b>Fonte:</b> cadastro público de empresas certificadas do SiAC/PBQP-H (Ministério das Cidades), lido por carga automática mensal. Última carga: ${e.carregado}.</p>
<p><b>Registro vigente:</b> registro com data de validade futura na data da carga. Registro sem validade não conta. Uma empresa certificada em mais de um subsetor aparece uma vez por registro.</p>
<p><b>Páginas por cidade:</b> só existem para municípios com pelo menos 5 registros vigentes; abaixo disso, a página não é indexada.</p>
<p><b>O que não publicamos:</b> telefone e e-mail das empresas, mesmo presentes na fonte.</p>
<p><b>Limites:</b> o dado reflete o cadastro na data da carga; renovações e cancelamentos posteriores aparecem na carga seguinte.</p>
<p><a href="/dados/pbqp-h">Voltar ao panorama</a></p></div>`,
    }));
  });
  r.get('/embed/pbqp-h/:grafico', (req, res) => {
    const e = estatPbqph();
    const g = { uf: ['Registros de PBQP-H vigentes por estado', e.porUf.slice(0, 15)], vencimentos: ['PBQP-H: vencimentos nos próximos 12 meses', e.vencimentos], nivel: ['PBQP-H por nível', e.porNivel] }[req.params.grafico];
    if (!g) return send404(res);
    // Incorporável em qualquer site: libera o frame só nesta rota.
    res.removeHeader('X-Frame-Options');
    res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors *");
    res.type('html').send(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>${esc(g[0])}</title></head><body style="margin:0;font-family:system-ui,sans-serif;padding:12px"><b style="color:#0b1730">${esc(g[0])}</b>${barras(g[1])}<div style="font-size:12px;color:#46577a">Fonte: SiAC (${e.carregado}). Compilação: <a href="${SITE}/dados/pbqp-h?utm_source=embed&utm_medium=referral&utm_campaign=dados-pbqph" target="_blank" rel="noopener">Anders Tech</a></div></body></html>`);
  });

  // ── Admin ──
  r.get('/admin/organico', (req, res) => res.sendFile(join(ADMIN_DIR, 'organico.html')));
  const q = (f) => async (req, res) => { if (!sql) return res.status(503).json({ error: 'sem banco' }); try { res.json(await f(req)); } catch (e) { console.error('[admin organico]', e.message); res.status(500).json({ error: e.message }); } };
  r.get('/api/admin/organico/visao', adminAuth, q(async () => {
    const [base, porTipo, gscCluster, oport, semImp, crawl, ia, funil, top, anot, ondas, integra] = await Promise.all([
      sql`SELECT DISTINCT ON (metrica) metrica, valor, dia FROM seo_linha_base ORDER BY metrica, dia DESC`,
      sql`SELECT p.tipo, COUNT(*)::int AS paginas, COUNT(*) FILTER (WHERE p.status = 'publicada')::int AS publicadas, COUNT(*) FILTER (WHERE p.status = 'revisao')::int AS revisao,
                 COUNT(i.url) FILTER (WHERE i.verdict = 'PASS')::int AS indexadas
            FROM seo_paginas p LEFT JOIN seo_indexacao i ON i.url = ${SITE + '/'} || p.slug GROUP BY 1`,
      sql`SELECT pagina, SUM(impressoes)::int AS imp, SUM(cliques)::int AS cli, AVG(posicao)::float AS pos FROM seo_gsc WHERE dia > CURRENT_DATE - 28 GROUP BY 1 ORDER BY imp DESC LIMIT 200`,
      sql`SELECT id, tipo, alvo, motivo, created_at FROM seo_fila WHERE status = 'aberta' ORDER BY created_at DESC LIMIT 100`,
      sql`SELECT slug FROM seo_paginas p WHERE status = 'publicada' AND publicado_em < NOW() - INTERVAL '30 days' AND NOT EXISTS (SELECT 1 FROM seo_gsc g WHERE g.pagina = '/' || p.slug AND g.impressoes > 0) LIMIT 100`,
      sql`SELECT bot, validado, SUM(hits)::int AS hits, COUNT(DISTINCT pagina)::int AS paginas FROM seo_crawlers WHERE dia > CURRENT_DATE - 30 GROUP BY 1, 2 ORDER BY 3 DESC`,
      sql`SELECT COALESCE(atribuicao->'ft'->>'landing', '-') AS pagina, COUNT(*)::int AS leads FROM leads WHERE canal = 'assistente_ia' GROUP BY 1 ORDER BY 2 DESC LIMIT 20`,
      sql`SELECT props->>'isca_id' AS isca, event, COUNT(*)::int AS n FROM telemetry_events WHERE event IN ('isca_vista','isca_iniciada','isca_concluida','lead_capturado','cta_produto_clicado') AND ts > NOW() - INTERVAL '30 days' GROUP BY 1, 2`,
      sql`SELECT landing_page AS pagina, COUNT(*)::int AS leads FROM leads WHERE created_at > NOW() - INTERVAL '90 days' GROUP BY 1 ORDER BY 2 DESC LIMIT 20`,
      sql`SELECT ts, tipo, texto FROM seo_anotacoes WHERE tipo <> 'rotina' ORDER BY ts DESC LIMIT 50`,
      sql`SELECT * FROM seo_ondas ORDER BY publicada_em DESC LIMIT 20`,
      Promise.resolve({ gsc: gscConfigurado(), ga4: ga4Configurado(), bing: bingConfigurado(), serp: serpConfigurado(), llm: producaoAtiva() }),
    ]);
    const receita = await sql`SELECT COALESCE(atribuicao->'ft'->>'landing','-') AS pagina, COUNT(*)::int AS vendas, COALESCE(SUM(valor),0)::float AS receita FROM conversoes WHERE evento = 'payment_succeeded' GROUP BY 1 ORDER BY 3 DESC LIMIT 20`;
    const consultas = await sql`SELECT cluster, tipo_pagina, status, COUNT(*)::int AS n FROM seo_consultas WHERE fonte <> 'semente-ac' GROUP BY 1, 2, 3`;
    const serp = await sql`SELECT consulta, posicao_nossa, ai_overview, citados FROM seo_serp WHERE dia = (SELECT MAX(dia) FROM seo_serp) LIMIT 50`;
    return { base, porTipo, gscPaginas: gscCluster, oportunidades: oport, semImpressao: semImp, crawlers: crawl, leadsIA: ia, funilIscas: funil, topLeads: top, topReceita: receita, anotacoes: anot, ondas, integracoes: integra, consultas, serp };
  }));
  r.get('/api/admin/organico/consultas', adminAuth, q(async (req) => {
    const cl = String(req.query.cluster || '');
    return cl ? sql`SELECT * FROM seo_consultas WHERE cluster = ${cl} AND fonte <> 'semente-ac' ORDER BY prioridade DESC, id LIMIT 500`
      : sql`SELECT * FROM seo_consultas WHERE fonte <> 'semente-ac' ORDER BY prioridade DESC, id LIMIT 500`;
  }));
  r.get('/api/admin/organico/paginas', adminAuth, q(async (req) => sql`SELECT id, slug, tipo, cluster, consulta, titulo, status, origem, onda, qualidade, publicado_em FROM seo_paginas ORDER BY (status = 'revisao') DESC, id DESC LIMIT 500`));
  r.post('/api/admin/organico/paginas/:id/:acao', adminAuth, q(async (req) => {
    const st = { aprovar: 'aprovada', publicar: 'publicada', revisar: 'revisao', arquivar: 'arquivada' }[req.params.acao];
    if (!st) throw new Error('ação inválida');
    await sql`UPDATE seo_paginas SET status = ${st}, revisado_em = NOW() WHERE id = ${parseInt(req.params.id, 10)}`;
    return recarregar(sql);
  }));
  r.get('/api/admin/organico/alvos', adminAuth, q(async () => sql`SELECT * FROM alvos_link ORDER BY status, tipo, nome`));
  r.patch('/api/admin/organico/alvos/:id', adminAuth, q(async (req) => {
    const st = String((req.body || {}).status || '');
    if (!['novo', 'contatado', 'respondeu', 'link_obtido', 'sem_interesse'].includes(st)) throw new Error('status inválido');
    await sql`UPDATE alvos_link SET status = ${st}, nota = COALESCE(${(req.body || {}).nota || null}, nota), atualizado_em = NOW() WHERE id = ${parseInt(req.params.id, 10)}`;
    return { ok: true };
  }));
  r.get('/api/admin/organico/distribuicao', adminAuth, q(async () => sql`SELECT * FROM distribuicao ORDER BY status, created_at DESC LIMIT 300`));
  r.patch('/api/admin/organico/distribuicao/:id', adminAuth, q(async (req) => {
    const st = String((req.body || {}).status || '');
    if (!['pendente', 'aprovado', 'publicado', 'descartado'].includes(st)) throw new Error('status inválido');
    await sql`UPDATE distribuicao SET status = ${st} WHERE id = ${parseInt(req.params.id, 10)}`;
    return { ok: true };
  }));
  r.get('/api/admin/organico/artigos', adminAuth, q(async () => sql`SELECT * FROM artigos_convidado ORDER BY id`));
  r.post('/api/admin/organico/semear', adminAuth, q(async () => ({ ...(await semear(sql)), ...(await recarregar(sql)) })));
  r.post('/api/admin/organico/fila/:id/fechar', adminAuth, q(async (req) => { await sql`UPDATE seo_fila SET status = 'fechada' WHERE id = ${parseInt(req.params.id, 10)}`; return { ok: true }; }));

  return r;
}
