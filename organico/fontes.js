// ── Fontes externas do painel orgânico (cada uma liga com a sua credencial) ──
// Formatos conferidos na documentação oficial em 18/11/2026:
//   Search Console  POST webmasters/v3/sites/{site}/searchAnalytics/query
//                   PUT  webmasters/v3/sites/{site}/sitemaps/{feedpath}
//                   POST searchconsole.googleapis.com/v1/urlInspection/index:inspect
//                   escopo https://www.googleapis.com/auth/webmasters
//   Bing Webmaster  GET ssl.bing.com/webmaster/api.svc/json/GetQueryStats?siteUrl=&apikey=
//   GA4 Data API    POST analyticsdata.googleapis.com/v1beta/properties/{id}:runReport
//                   escopo https://www.googleapis.com/auth/analytics.readonly
//   IndexNow        POST api.indexnow.org/indexnow (até 10.000 URLs)
// O refresh token do Google (GOOGLE_OAUTH_*) precisa ter os escopos usados.

import { googleToken, googleOAuthConfigurado } from '../growth/integracoes.js';

const env = (n) => process.env[n] || '';
const SITE = 'https://anderstech.net';
export const GSC_SITE = () => env('GSC_SITE_URL') || 'sc-domain:anderstech.net';
const dia = (d) => new Date(d).toISOString().slice(0, 10);

export const gscConfigurado = () => googleOAuthConfigurado() && env('GSC_ATIVO') === 'true';
export const ga4Configurado = () => googleOAuthConfigurado() && !!env('GA4_PROPERTY_ID');
export const bingConfigurado = () => !!env('BING_WEBMASTER_API_KEY');
export const serpConfigurado = () => !!env('SERPAPI_KEY');

async function google(url, { method = 'GET', body, fetchImpl = fetch } = {}) {
  const token = await googleToken({ fetchImpl });
  const r = await fetchImpl(url, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const txt = await r.text();
  if (!r.ok) throw new Error(`${method} ${url.split('?')[0]}: HTTP ${r.status} ${txt.slice(0, 200)}`);
  return txt ? JSON.parse(txt) : {};
}

// Search Console: consultas × páginas × dispositivo, dia a dia (últimos `dias`).
export async function ingerirGsc(sql, { dias = 5 } = {}) {
  if (!gscConfigurado()) return { linhas: 0, motivo: 'desligado' };
  const fim = new Date(Date.now() - 2 * 86400_000), ini = new Date(fim.getTime() - (dias - 1) * 86400_000);
  let linhas = 0, startRow = 0;
  for (;;) {
    const j = await google(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE())}/searchAnalytics/query`, {
      method: 'POST', body: { startDate: dia(ini), endDate: dia(fim), dimensions: ['date', 'page', 'query', 'device'], rowLimit: 25000, startRow, dataState: 'all' },
    });
    const rows = j.rows || [];
    for (let i = 0; i < rows.length; i += 300) {
      const lote = rows.slice(i, i + 300).map(r => ({ d: r.keys[0], p: String(r.keys[1]).replace(SITE, '') || '/', q: r.keys[2], dv: r.keys[3], c: r.clicks, im: r.impressions, ctr: r.ctr, pos: r.position }));
      await sql`
        INSERT INTO seo_gsc (dia, pagina, consulta, dispositivo, cliques, impressoes, ctr, posicao)
        SELECT x.d::date, x.p, x.q, x.dv, x.c, x.im, x.ctr, x.pos FROM jsonb_to_recordset(${JSON.stringify(lote)}::jsonb)
          AS x(d TEXT, p TEXT, q TEXT, dv TEXT, c INT, im INT, ctr REAL, pos REAL)
        ON CONFLICT (dia, pagina, consulta, dispositivo) DO UPDATE SET cliques = EXCLUDED.cliques, impressoes = EXCLUDED.impressoes, ctr = EXCLUDED.ctr, posicao = EXCLUDED.posicao`;
    }
    linhas += rows.length;
    if (rows.length < 25000) break;
    startRow += 25000;
  }
  return { linhas };
}

export async function enviarSitemapGsc() {
  if (!gscConfigurado()) return { ok: false, motivo: 'desligado' };
  await google(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE())}/sitemaps/${encodeURIComponent(SITE + '/sitemap.xml')}`, { method: 'PUT' });
  return { ok: true };
}

// Inspeção de URL: status de indexação de uma amostra por dia (a cota é por
// propriedade; 60 por rodada fica longe dela).
export async function inspecionar(sql, urls) {
  if (!gscConfigurado()) return { inspecionadas: 0, motivo: 'desligado' };
  let n = 0;
  for (const u of urls.slice(0, 60)) {
    try {
      const j = await google('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { method: 'POST', body: { inspectionUrl: u, siteUrl: GSC_SITE(), languageCode: 'pt-BR' } });
      const s = (j.inspectionResult && j.inspectionResult.indexStatusResult) || {};
      await sql`
        INSERT INTO seo_indexacao (url, verdict, coverage, ultimo_rastreio, verificado_em)
        VALUES (${u}, ${s.verdict || null}, ${s.coverageState || null}, ${s.lastCrawlTime || null}, NOW())
        ON CONFLICT (url) DO UPDATE SET verdict = EXCLUDED.verdict, coverage = EXCLUDED.coverage, ultimo_rastreio = EXCLUDED.ultimo_rastreio, verificado_em = NOW()`;
      n++;
    } catch (err) { console.error('[gsc] inspeção:', err.message); break; }
  }
  return { inspecionadas: n };
}

// Bing: estatísticas por consulta (o Bing atualiza semanalmente).
export async function ingerirBing(sql) {
  if (!bingConfigurado()) return { linhas: 0, motivo: 'desligado' };
  const r = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/GetQueryStats?siteUrl=${encodeURIComponent(SITE + '/')}&apikey=${encodeURIComponent(env('BING_WEBMASTER_API_KEY'))}`);
  if (!r.ok) throw new Error('Bing GetQueryStats: HTTP ' + r.status);
  const j = await r.json();
  const rows = (j.d || j || []).map(x => {
    const ms = Number(String(x.Date || '').match(/\d{10,}/)?.[0] || 0);
    return { d: ms ? dia(ms) : null, q: x.Query, c: x.Clicks || 0, im: x.Impressions || 0, pos: x.AvgImpressionPosition || null };
  }).filter(x => x.d && x.q);
  for (const x of rows) {
    await sql`INSERT INTO seo_bing (dia, consulta, cliques, impressoes, posicao) VALUES (${x.d}, ${x.q}, ${x.c}, ${x.im}, ${x.pos})
              ON CONFLICT (dia, consulta) DO UPDATE SET cliques = EXCLUDED.cliques, impressoes = EXCLUDED.impressoes, posicao = EXCLUDED.posicao`;
  }
  return { linhas: rows.length };
}

// GA4: sessões e eventos-chave por canal e página de entrada.
export async function ingerirGa4(sql, { dias = 7 } = {}) {
  if (!ga4Configurado()) return { linhas: 0, motivo: 'desligado' };
  const j = await google(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(env('GA4_PROPERTY_ID'))}:runReport`, {
    method: 'POST', body: {
      dateRanges: [{ startDate: `${dias}daysAgo`, endDate: 'yesterday' }],
      dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }, { name: 'landingPage' }],
      metrics: [{ name: 'sessions' }, { name: 'keyEvents' }], limit: '10000',
    },
  });
  const rows = (j.rows || []).map(r => ({
    d: `${r.dimensionValues[0].value.slice(0, 4)}-${r.dimensionValues[0].value.slice(4, 6)}-${r.dimensionValues[0].value.slice(6, 8)}`,
    c: r.dimensionValues[1].value, l: (r.dimensionValues[2].value || '/').slice(0, 300),
    s: Number(r.metricValues[0].value || 0), k: Math.round(Number(r.metricValues[1].value || 0)),
  }));
  for (const x of rows) {
    await sql`INSERT INTO seo_ga4 (dia, canal, landing, sessoes, eventos_chave) VALUES (${x.d}, ${x.c}, ${x.l}, ${x.s}, ${x.k})
              ON CONFLICT (dia, canal, landing) DO UPDATE SET sessoes = EXCLUDED.sessoes, eventos_chave = EXCLUDED.eventos_chave`;
  }
  return { linhas: rows.length };
}

// SERP das 50 consultas prioritárias, semanal, via provedor de SERP (o Google
// não oferece API de SERP; raspar a busca viola os termos). Registra top 3, se
// há AI Overview e quem foi citado.
export async function checarSerp(sql, consultas) {
  if (!serpConfigurado()) return { checadas: 0, motivo: 'desligado' };
  let n = 0;
  for (const q of consultas.slice(0, 50)) {
    try {
      const r = await fetch(`https://serpapi.com/search.json?engine=google&hl=pt-br&gl=br&q=${encodeURIComponent(q)}&api_key=${encodeURIComponent(env('SERPAPI_KEY'))}`);
      if (!r.ok) continue;
      const j = await r.json();
      const org = j.organic_results || [];
      const nossa = org.find(o => String(o.link || '').includes('anderstech.net'));
      const aio = j.ai_overview || null;
      const citados = aio && Array.isArray(aio.references) ? aio.references.map(x => x.link).filter(Boolean).slice(0, 10) : [];
      await sql`
        INSERT INTO seo_serp (dia, consulta, posicao_nossa, top3, ai_overview, citados)
        VALUES (CURRENT_DATE, ${q}, ${nossa ? nossa.position : null}, ${JSON.stringify(org.slice(0, 3).map(o => ({ pos: o.position, url: o.link, titulo: o.title })))}::jsonb, ${!!aio}, ${JSON.stringify(citados)}::jsonb)
        ON CONFLICT (dia, consulta) DO UPDATE SET posicao_nossa = EXCLUDED.posicao_nossa, top3 = EXCLUDED.top3, ai_overview = EXCLUDED.ai_overview, citados = EXCLUDED.citados`;
      n++;
    } catch { /* uma consulta falhou: segue */ }
  }
  return { checadas: n };
}

// IndexNow: avisa Bing, Yandex e parceiros a cada publicação ou atualização.
export async function indexNow(urls) {
  const lista = [...new Set(urls)].map(u => (u.startsWith('http') ? u : SITE + u)).slice(0, 10000);
  if (!lista.length) return { enviadas: 0 };
  const key = env('INDEXNOW_KEY') || 'f6ba6a9696c4426b9a20bd3baa58e3ec';
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: 'anderstech.net', key, keyLocation: `${SITE}/${key}.txt`, urlList: lista }),
  });
  return { enviadas: lista.length, status: r.status };
}
