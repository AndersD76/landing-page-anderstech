// ── Livro de conversões e envio às plataformas de anúncio ───────────────────
// Toda conversão (lead, início de checkout, pagamento, indicação de parceiro)
// nasce PRIMEIRO na tabela `conversoes`, no banco do próprio site. As
// plataformas são destino adicional, nunca a única cópia — o mesmo padrão da
// telemetria (telemetry_events → serviço central por INSERT ... SELECT).
//
// Compra só entra aqui pelo webhook do provedor de pagamento (ead/routes.js e
// consultoria/routes.js), nunca pelo navegador.
//
// Envio:
//   Google Ads e Microsoft Ads → feed CSV de conversão offline por clique
//     (GET /conversoes/<plataforma>.csv, com senha). A plataforma busca o
//     arquivo em agenda ou o Anders sobe à mão. Não exige token de
//     desenvolvedor nem OAuth, que são semanas de aprovação para uma conta nova.
//   Meta → Conversions API (push), só com META_PIXEL_ID + META_CAPI_TOKEN.
//     Com META_TEST_EVENT_CODE, tudo vai como evento de teste.
// Nos três casos, só sai conversão de quem deu consentimento de marketing.

import crypto from 'crypto';

export const EVENTOS = ['lead_captured', 'checkout_started', 'payment_succeeded', 'partner_referred'];

// Nome da conversão como deve ser criado nas plataformas (LANCAMENTO.md).
export const NOME_CONVERSAO = {
  lead_captured: 'Lead site',
  checkout_started: 'Checkout iniciado',
  payment_succeeded: 'Compra',
  partner_referred: 'Indicação de parceiro',
};

const META_EVENTO = {
  lead_captured: 'Lead',
  checkout_started: 'InitiateCheckout',
  payment_succeeded: 'Purchase',
  partner_referred: 'Lead',
};

export function eventId(evento, refTipo, refId) {
  return `${evento}:${refTipo}:${refId}`;
}

/**
 * Grava a conversão. Idempotente pelo event_id: o webhook do Asaas reenvia, a
 * parcela 2 de 12 chega como "paga" de novo — nada disso duplica.
 * Nunca lança: falha aqui não pode derrubar lead nem pagamento.
 */
export async function registrarConversao(sql, { evento, refTipo, refId, valor = null, ts = null, origem = {} }) {
  if (!sql || !EVENTOS.includes(evento) || !refTipo || !Number.isInteger(Number(refId))) return false;
  try {
    const rows = await sql`
      INSERT INTO conversoes (event_id, evento, ref_tipo, ref_id, ts, valor, canal, atribuicao, parceiro_codigo, consent_marketing)
      VALUES (${eventId(evento, refTipo, refId)}, ${evento}, ${refTipo}, ${Number(refId)},
              ${ts || new Date().toISOString()}, ${valor}, ${origem.canal || null},
              ${origem.atribuicao ? JSON.stringify(origem.atribuicao) : null}::jsonb,
              ${origem.parceiro_codigo || null}, ${!!origem.consent_marketing})
      ON CONFLICT (event_id) DO NOTHING
      RETURNING id`;
    return rows.length > 0;
  } catch (err) {
    console.error(`[conversoes] falha ao registrar ${evento} ${refTipo}#${refId}:`, err.message);
    return false;
  }
}

// ── Normalização e hash (regras das plataformas) ─────────────────────────────
export function sha256(v) {
  return crypto.createHash('sha256').update(String(v), 'utf8').digest('hex');
}

// Google (Data Manager, "formatting"): minúsculas, sem espaços; em
// gmail.com/googlemail.com remove os pontos e o sufixo "+..." da parte local.
// Meta: só minúsculas e sem espaços.
export function normalizaEmail(email, plataforma) {
  if (!email) return null;
  let e = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(e)) return null;
  if (plataforma === 'google') {
    const [local, dominio] = e.split('@');
    if (dominio === 'gmail.com' || dominio === 'googlemail.com') e = local.replace(/\+.*$/, '').replace(/\./g, '') + '@' + dominio;
  }
  return e;
}

// Telefone brasileiro: dígitos com DDI 55. Google quer E.164 (+55...);
// Meta quer só dígitos com DDI, sem "+".
export function normalizaTelefone(tel, plataforma) {
  if (!tel) return null;
  let d = String(tel).replace(/\D/g, '');
  if (d.length === 10 || d.length === 11) d = '55' + d;
  if (!/^55\d{10,11}$/.test(d)) return null;
  return plataforma === 'google' ? '+' + d : d;
}

// ── CSV de conversão offline ─────────────────────────────────────────────────
function csvCampo(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Horário de Brasília sem depender do fuso do servidor (Railway roda em UTC).
// O Brasil não tem horário de verão desde 2019: UTC-3 fixo.
export function horaBrasilia(iso) {
  const d = new Date(new Date(iso).getTime() - 3 * 3600 * 1000);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Linhas no formato de importação de conversões off-line por clique.
 * `conversoes` vem com o clique já resolvido (gclid/gbraid/wbraid/msclkid) e
 * só inclui quem consentiu.
 * Formato conferido na documentação oficial — ver aquisicao/LANCAMENTO.md.
 */
export function csvGoogle(conversoes) {
  const linhas = [
    'Parameters:TimeZone=America/Sao_Paulo',
    'Google Click ID,GBRAID,WBRAID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID',
  ];
  for (const c of conversoes) {
    const a = c.atribuicao && (c.atribuicao.lt || c.atribuicao.ft) || {};
    const ft = c.atribuicao && c.atribuicao.ft || {};
    const gclid = a.gclid || ft.gclid || '';
    const gbraid = gclid ? '' : (a.gbraid || ft.gbraid || '');
    const wbraid = gclid || gbraid ? '' : (a.wbraid || ft.wbraid || '');
    if (!gclid && !gbraid && !wbraid) continue;
    linhas.push([gclid, gbraid, wbraid, NOME_CONVERSAO[c.evento], horaBrasilia(c.ts),
      c.valor != null ? Number(c.valor).toFixed(2) : '', 'BRL', c.event_id].map(csvCampo).join(','));
  }
  return linhas.join('\r\n') + '\r\n';
}

export function csvMicrosoft(conversoes) {
  const linhas = [
    'Parameters:TimeZone=America/Sao_Paulo',
    'Microsoft Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency',
  ];
  for (const c of conversoes) {
    const a = c.atribuicao && (c.atribuicao.lt || c.atribuicao.ft) || {};
    const ft = c.atribuicao && c.atribuicao.ft || {};
    const msclkid = a.msclkid || ft.msclkid;
    if (!msclkid) continue;
    linhas.push([msclkid, NOME_CONVERSAO[c.evento], horaBrasilia(c.ts),
      c.valor != null ? Number(c.valor).toFixed(2) : '', 'BRL'].map(csvCampo).join(','));
  }
  return linhas.join('\r\n') + '\r\n';
}

// ── Meta Conversions API ─────────────────────────────────────────────────────
export function metaConfigurada() {
  return !!(process.env.META_PIXEL_ID && process.env.META_CAPI_TOKEN);
}

// fbc = fb.1.<ms da chegada>.<fbclid> — formato documentado pela Meta.
export function fbcDe(atribuicao) {
  const t = atribuicao && (atribuicao.lt && atribuicao.lt.fbclid ? atribuicao.lt : atribuicao.ft);
  if (!t || !t.fbclid) return null;
  const ms = Date.parse(t.ts) || Date.now();
  return `fb.1.${ms}.${t.fbclid}`;
}

export function payloadMeta(c, contato = {}) {
  const user_data = {};
  const em = normalizaEmail(contato.email, 'meta');
  const ph = normalizaTelefone(contato.telefone, 'meta');
  if (em) user_data.em = [sha256(em)];
  if (ph) user_data.ph = [sha256(ph)];
  const fbc = fbcDe(c.atribuicao);
  if (fbc) user_data.fbc = fbc;
  const landing = c.atribuicao && c.atribuicao.lt && c.atribuicao.lt.landing;
  // Evento "website" exige event_source_url e client_user_agent. Sem o agente
  // do navegador gravado (lead antigo, pedido sem cookie), o evento é
  // declarado como gerado pelo sistema — que é o que ele de fato é.
  const ua = c.atribuicao && c.atribuicao.ua;
  if (ua) user_data.client_user_agent = ua;
  const evento = {
    event_name: META_EVENTO[c.evento],
    event_time: Math.floor(new Date(c.ts).getTime() / 1000),
    event_id: c.event_id,
    action_source: ua ? 'website' : 'system_generated',
    ...(ua ? { event_source_url: 'https://anderstech.net' + (landing || '/') } : {}),
    user_data,
  };
  if (c.valor != null) evento.custom_data = { value: Number(c.valor), currency: 'BRL' };
  const corpo = { data: [evento] };
  if (process.env.META_TEST_EVENT_CODE) corpo.test_event_code = process.env.META_TEST_EVENT_CODE;
  return corpo;
}

// v27.0 lançada em 04/11/2026 (changelog da Graph API, conferido em 18/11/2026).
const META_VERSAO = process.env.META_GRAPH_VERSION || 'v27.0';

/**
 * Envia à Meta o que ainda não foi enviado. Roda em intervalo (server.js).
 * Sem credencial: não faz nada — a conversão continua no livro local.
 */
export async function despacharMeta(sql, contatoDe, { fetchImpl = fetch } = {}) {
  if (!sql || !metaConfigurada()) return { enviados: 0, motivo: 'sem credencial' };
  const pend = await sql`
    SELECT * FROM conversoes
     WHERE consent_marketing = TRUE AND NOT (envios ? 'meta')
       AND ts > NOW() - INTERVAL '7 days'
     ORDER BY ts LIMIT 50`;
  let enviados = 0;
  for (const c of pend) {
    let resultado;
    try {
      const contato = await contatoDe(c);
      const r = await fetchImpl(`https://graph.facebook.com/${META_VERSAO}/${process.env.META_PIXEL_ID}/events?access_token=${encodeURIComponent(process.env.META_CAPI_TOKEN)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadMeta(c, contato)),
      });
      resultado = { ok: r.ok, status: r.status, em: new Date().toISOString(), teste: !!process.env.META_TEST_EVENT_CODE };
      if (r.ok) enviados++;
    } catch (err) {
      resultado = { ok: false, erro: String(err.message).slice(0, 200), em: new Date().toISOString() };
    }
    // Falha também é registrada: sem isso o mesmo evento seria tentado para sempre.
    await sql`UPDATE conversoes SET envios = envios || ${JSON.stringify({ meta: resultado })}::jsonb WHERE id = ${c.id}`;
  }
  return { enviados };
}

/** Busca e-mail e telefone da origem da conversão, para o hash da Meta. */
export function contatoDaConversao(sql) {
  return async (c) => {
    if (c.ref_tipo === 'lead') {
      const r = await sql`SELECT email, telefone FROM leads WHERE id = ${c.ref_id}`;
      return r[0] || {};
    }
    if (c.ref_tipo === 'ead_order') {
      const r = await sql`SELECT u.email, u.telefone FROM ead_orders o JOIN ead_users u ON u.id = o.user_id WHERE o.id = ${c.ref_id}`;
      return r[0] || {};
    }
    if (c.ref_tipo === 'consultoria_pedido') {
      const r = await sql`SELECT email, telefone FROM consultoria_pedidos WHERE id = ${c.ref_id}`;
      return r[0] || {};
    }
    return {};
  };
}
