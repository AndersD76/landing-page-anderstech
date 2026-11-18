// ── Integrações por API com as plataformas (cada uma liga com sua credencial) ─
// Formatos conferidos na documentação oficial em 18/11/2026:
//   Google Data Manager API  POST https://datamanager.googleapis.com/v1/events:ingest
//                            escopo https://www.googleapis.com/auth/datamanager
//   Microsoft UET CAPI       POST https://capi.uet.microsoft.com/v1/{tagId}/events (Bearer)
//   Google Ads API v26       customers/{id}/googleAds:searchStream (escopo adwords)
// Sem credencial: nada sai; a conversão continua no livro local (`conversoes`).

import { sha256, normalizaEmail, normalizaTelefone } from './conversoes.js';

const env = (n) => process.env[n] || '';

// ── OAuth do Google (um refresh token com os escopos necessários) ──
let tokenCache = { valor: null, expira: 0 };
export function googleOAuthConfigurado() {
  return !!(env('GOOGLE_OAUTH_CLIENT_ID') && env('GOOGLE_OAUTH_CLIENT_SECRET') && env('GOOGLE_OAUTH_REFRESH_TOKEN'));
}
export async function googleToken({ fetchImpl = fetch } = {}) {
  if (tokenCache.valor && Date.now() < tokenCache.expira - 60_000) return tokenCache.valor;
  const r = await fetchImpl('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env('GOOGLE_OAUTH_CLIENT_ID'), client_secret: env('GOOGLE_OAUTH_CLIENT_SECRET'),
      refresh_token: env('GOOGLE_OAUTH_REFRESH_TOKEN'), grant_type: 'refresh_token',
    }),
  });
  const j = await r.json();
  if (!r.ok || !j.access_token) throw new Error('OAuth Google: ' + (j.error_description || j.error || r.status));
  tokenCache = { valor: j.access_token, expira: Date.now() + (j.expires_in || 3600) * 1000 };
  return tokenCache.valor;
}

// ── Google Data Manager: conversão off-line ──
const ACAO_GOOGLE = {
  lead_captured: 'GOOGLE_CONVERSAO_LEAD',
  checkout_started: 'GOOGLE_CONVERSAO_CHECKOUT',
  payment_succeeded: 'GOOGLE_CONVERSAO_COMPRA',
};
export function dataManagerConfigurado() {
  return googleOAuthConfigurado() && !!env('GOOGLE_ADS_CUSTOMER_ID') && !!(env('GOOGLE_CONVERSAO_LEAD') || env('GOOGLE_CONVERSAO_COMPRA'));
}

function toque(c) {
  const a = c.atribuicao || {};
  return { lt: a.lt || {}, ft: a.ft || {} };
}

export function eventoDataManager(c, contato = {}) {
  const { lt, ft } = toque(c);
  const ad = {};
  const gclid = lt.gclid || ft.gclid, gbraid = lt.gbraid || ft.gbraid, wbraid = lt.wbraid || ft.wbraid;
  if (gclid) ad.gclid = gclid; else if (wbraid) ad.wbraid = wbraid; else if (gbraid) ad.gbraid = gbraid;
  const ids = [];
  const em = normalizaEmail(contato.email, 'google');
  const ph = normalizaTelefone(contato.telefone, 'google');
  if (em) ids.push({ emailAddress: sha256(em) });
  if (ph) ids.push({ phoneNumber: sha256(ph) });
  if (!Object.keys(ad).length && !ids.length) return null;
  return {
    ...(Object.keys(ad).length ? { adIdentifiers: ad } : {}),
    ...(c.valor != null ? { conversionValue: Number(c.valor), currency: 'BRL' } : {}),
    eventTimestamp: new Date(c.ts).toISOString(),
    transactionId: c.event_id,
    eventSource: 'WEB',
    ...(ids.length ? { userData: { userIdentifiers: ids } } : {}),
  };
}

export function corpoDataManager(evento, eventos) {
  const destino = {
    operatingAccount: { accountType: 'GOOGLE_ADS', accountId: env('GOOGLE_ADS_CUSTOMER_ID').replace(/\D/g, '') },
    productDestinationId: env(ACAO_GOOGLE[evento]),
  };
  if (env('GOOGLE_ADS_LOGIN_CUSTOMER_ID')) destino.loginAccount = { accountType: 'GOOGLE_ADS', accountId: env('GOOGLE_ADS_LOGIN_CUSTOMER_ID').replace(/\D/g, '') };
  return {
    destinations: [destino],
    encoding: 'HEX',
    // Consentimento de marketing do banner cobre medir o anúncio (dado do
    // usuário), não personalizar anúncio.
    consent: { adUserData: 'CONSENT_GRANTED', adPersonalization: 'CONSENT_DENIED' },
    validateOnly: env('GOOGLE_DM_VALIDAR') === 'true',
    events: eventos,
  };
}

export async function despacharGoogle(sql, contatoDe, { fetchImpl = fetch } = {}) {
  if (!sql || !dataManagerConfigurado()) return { enviados: 0, motivo: 'sem credencial' };
  const token = await googleToken({ fetchImpl });
  let enviados = 0;
  for (const evento of Object.keys(ACAO_GOOGLE)) {
    if (!env(ACAO_GOOGLE[evento])) continue;
    const pend = await sql`
      SELECT * FROM conversoes WHERE consent_marketing = TRUE AND evento = ${evento} AND NOT (envios ? 'google')
         AND ts > NOW() - INTERVAL '89 days' ORDER BY ts LIMIT 200`;
    if (!pend.length) continue;
    const pares = [];
    for (const c of pend) {
      const ev = eventoDataManager(c, await contatoDe(c));
      pares.push([c, ev]);
    }
    const validos = pares.filter(([, ev]) => ev);
    let resultado = { ok: true, em: new Date().toISOString(), sem_identificador: true };
    if (validos.length) {
      const r = await fetchImpl('https://datamanager.googleapis.com/v1/events:ingest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(env('GOOGLE_CLOUD_PROJECT') ? { 'x-goog-user-project': env('GOOGLE_CLOUD_PROJECT') } : {}) },
        body: JSON.stringify(corpoDataManager(evento, validos.map(([, ev]) => ev))),
      });
      const txt = await r.text();
      resultado = { ok: r.ok, status: r.status, em: new Date().toISOString(), validacao: env('GOOGLE_DM_VALIDAR') === 'true', resposta: txt.slice(0, 300) };
      if (r.ok) enviados += validos.length;
    }
    // Em modo validação nada é marcado como enviado: a mesma leva vai de verdade depois.
    if (resultado.validacao) continue;
    for (const [c, ev] of pares) {
      await sql`UPDATE conversoes SET envios = envios || ${JSON.stringify({ google: ev ? resultado : { ok: false, motivo: 'sem identificador' } })}::jsonb WHERE id = ${c.id}`;
    }
  }
  return { enviados };
}

// ── Microsoft UET Conversions API ──
const NOME_UET = { lead_captured: 'lead', checkout_started: 'begin_checkout', payment_succeeded: 'purchase' };
export function uetConfigurado() { return !!(env('MS_UET_TAG_ID') && env('MS_UET_TOKEN')); }

export function eventoUet(c, contato = {}) {
  if (!NOME_UET[c.evento]) return null;
  const { lt, ft } = toque(c);
  const userData = {};
  const ms = lt.msclkid || ft.msclkid;
  if (ms) userData.msclkid = String(ms).replace(/-/g, '');
  const em = normalizaEmail(contato.email, 'meta');
  const ph = normalizaTelefone(contato.telefone, 'google');
  if (em) userData.em = sha256(em);
  if (ph) userData.ph = sha256(ph);
  if (c.atribuicao && c.atribuicao.ua) userData.clientUserAgent = c.atribuicao.ua;
  if (!userData.msclkid && !userData.em) return null;
  return {
    eventType: 'custom', eventId: c.event_id, eventName: NOME_UET[c.evento],
    eventTime: Math.floor(new Date(c.ts).getTime() / 1000), adStorageConsent: 'G', userData,
    ...(c.valor != null ? { customData: { value: Number(c.valor), currency: 'BRL', transactionId: c.event_id } } : {}),
  };
}

export async function despacharMicrosoft(sql, contatoDe, { fetchImpl = fetch } = {}) {
  if (!sql || !uetConfigurado()) return { enviados: 0, motivo: 'sem credencial' };
  const pend = await sql`
    SELECT * FROM conversoes WHERE consent_marketing = TRUE AND NOT (envios ? 'microsoft')
       AND ts > NOW() - INTERVAL '89 days' ORDER BY ts LIMIT 500`;
  const pares = [];
  for (const c of pend) pares.push([c, eventoUet(c, await contatoDe(c))]);
  const validos = pares.filter(([, ev]) => ev);
  let resultado = { ok: true, em: new Date().toISOString() };
  if (validos.length) {
    const r = await fetchImpl(`https://capi.uet.microsoft.com/v1/${encodeURIComponent(env('MS_UET_TAG_ID'))}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env('MS_UET_TOKEN')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: validos.map(([, ev]) => ev), continueOnValidationError: true }),
    });
    resultado = { ok: r.ok, status: r.status, em: new Date().toISOString(), resposta: (await r.text()).slice(0, 300) };
  }
  for (const [c, ev] of pares) {
    await sql`UPDATE conversoes SET envios = envios || ${JSON.stringify({ microsoft: ev ? resultado : { ok: false, motivo: 'sem identificador' } })}::jsonb WHERE id = ${c.id}`;
  }
  return { enviados: resultado.ok ? validos.length : 0 };
}

// ── Google Ads: custo diário por campanha ──
export function adsCustoConfigurado() { return googleOAuthConfigurado() && !!env('GOOGLE_ADS_DEVELOPER_TOKEN') && !!env('GOOGLE_ADS_CUSTOMER_ID'); }

export function linhasCustoAds(lotes) {
  const out = [];
  for (const lote of Array.isArray(lotes) ? lotes : [lotes]) {
    for (const r of (lote && lote.results) || []) {
      out.push({
        dia: r.segments && r.segments.date,
        campanha: String((r.campaign && r.campaign.id) || ''),
        custo: Number((r.metrics && r.metrics.costMicros) || 0) / 1e6,
        impressoes: Number((r.metrics && r.metrics.impressions) || 0),
        cliques: Number((r.metrics && r.metrics.clicks) || 0),
      });
    }
  }
  return out.filter(l => /^\d{4}-\d{2}-\d{2}$/.test(l.dia || ''));
}

export async function importarCustoGoogleAds(sql, { fetchImpl = fetch } = {}) {
  if (!sql || !adsCustoConfigurado()) return { linhas: 0, motivo: 'sem credencial' };
  const token = await googleToken({ fetchImpl });
  const cid = env('GOOGLE_ADS_CUSTOMER_ID').replace(/\D/g, '');
  const versao = env('GOOGLE_ADS_API_VERSION') || 'v26';
  const r = await fetchImpl(`https://googleads.googleapis.com/${versao}/customers/${cid}/googleAds:searchStream`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`, 'developer-token': env('GOOGLE_ADS_DEVELOPER_TOKEN'), 'Content-Type': 'application/json',
      ...(env('GOOGLE_ADS_LOGIN_CUSTOMER_ID') ? { 'login-customer-id': env('GOOGLE_ADS_LOGIN_CUSTOMER_ID').replace(/\D/g, '') } : {}),
    },
    body: JSON.stringify({ query: 'SELECT segments.date, campaign.id, metrics.cost_micros, metrics.impressions, metrics.clicks FROM campaign WHERE segments.date DURING LAST_7_DAYS' }),
  });
  if (!r.ok) throw new Error('Google Ads searchStream: HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const linhas = linhasCustoAds(await r.json());
  for (const l of linhas) {
    await sql`
      INSERT INTO custos_midia (dia, canal, campanha, custo, impressoes, cliques)
      VALUES (${l.dia}, 'google_ads', ${l.campanha}, ${l.custo}, ${l.impressoes}, ${l.cliques})
      ON CONFLICT (dia, canal, campanha) DO UPDATE SET custo = EXCLUDED.custo, impressoes = EXCLUDED.impressoes, cliques = EXCLUDED.cliques, importado_em = NOW()`;
  }
  return { linhas: linhas.length };
}
