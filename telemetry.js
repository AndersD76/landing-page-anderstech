// ── Adaptador de telemetria ──────────────────────────────────────────────────
// O serviço central de telemetria ainda não está no ar. Este módulo é a única
// porta de saída de evento do site: hoje ele grava em telemetry_events (Neon
// deste repo), no mesmo schema do serviço central. Quando o central subir, a
// troca acontece SÓ na função `entregar()` — o resto do site não muda.
//
// TROCA FUTURA (documentada no HANDOFF):
//   1. definir TELEMETRY_ENDPOINT e TELEMETRY_KEY no Railway;
//   2. em `entregar()`, trocar o INSERT por POST no endpoint, com a mesma
//      lista de eventos normalizados que a função já recebe;
//   3. migrar o histórico com o INSERT ... SELECT de migrations/009_telemetria.sql.
// O contrato HTTP do serviço central não foi definido ainda — por isso NÃO há
// implementação chutada aqui. A função recebe os eventos já normalizados e
// validados; falta só o transporte.

import crypto from 'crypto';

export const APP = 'anderstech';

// Nomes literais. Evento fora desta lista é descartado — nome divergente é a
// forma mais barata de inutilizar uma base de eventos.
export const EVENTOS = new Set([
  'page_view',
  'cta_whatsapp_click',
  'form_submit',
  'case_view',
  'artifact_scan',
  'identify',
]);

// Flag própria, independente do NODE_ENV que liga o GA4: a telemetria roda em
// dev E em produção. O gate de consentimento (LGPD) é aplicado no cliente,
// antes de qualquer envio — ver telemetry-client.js.
export const ATIVA = process.env.TELEMETRY_ENABLED !== 'false';

const MAX_LOTE = 20;           // eventos por requisição
const MAX_TEXTO = 200;         // caracteres por campo de texto
const MAX_PROPS_BYTES = 4096;  // props serializada
const JANELA_TS_MS = 24 * 60 * 60 * 1000;

// Chaves que nunca podem entrar em props: telemetria não é lugar de PII. O dado
// de contato já vive em `leads`, com base legal própria.
const CHAVES_PII = /^(email|e_?mail|telefone|phone|celular|whatsapp|cpf|cnpj|nome|name|senha|password|token)$/i;

function texto(v, max = MAX_TEXTO) {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

// person_id é derivado, nunca o contato em claro: o mesmo e-mail sempre gera o
// mesmo id, o que permite costurar a jornada sem guardar PII na tabela.
export function personId(valor) {
  const norm = String(valor || '').trim().toLowerCase().replace(/[\s()-]/g, '');
  if (!norm) return null;
  return crypto.createHash('sha256').update('anderstech:' + norm).digest('hex').slice(0, 32);
}

function limparProps(props) {
  if (!props || typeof props !== 'object' || Array.isArray(props)) return {};
  const limpo = {};
  for (const [k, v] of Object.entries(props)) {
    if (CHAVES_PII.test(k)) continue;
    if (v === null || v === undefined) continue;
    if (typeof v === 'string') { const t = texto(v); if (t) limpo[k] = t; }
    else if (typeof v === 'number' && Number.isFinite(v)) limpo[k] = v;
    else if (typeof v === 'boolean') limpo[k] = v;
  }
  let json = JSON.stringify(limpo);
  if (json.length > MAX_PROPS_BYTES) return { _truncado: true };
  return limpo;
}

// Relógio do cliente não é confiável: aceita o ts enviado (preserva a ORDEM dos
// eventos de um lote que só foi despachado depois do consentimento), mas rejeita
// futuro e passado remoto, que só poluiriam a série temporal.
function carimbo(ts) {
  const agora = Date.now();
  const t = ts ? Date.parse(ts) : NaN;
  if (!Number.isFinite(t) || t > agora + 60_000 || t < agora - JANELA_TS_MS) {
    return new Date(agora).toISOString();
  }
  return new Date(t).toISOString();
}

export function normalizar(bruto) {
  if (!bruto || typeof bruto !== 'object') return null;
  const event = texto(bruto.event, 60);
  if (!event || !EVENTOS.has(event)) return null;

  const anonymous_id = /^[A-Za-z0-9_-]{8,64}$/.test(String(bruto.anonymous_id || ''))
    ? String(bruto.anonymous_id)
    : null;

  return {
    ts: carimbo(bruto.ts),
    app: APP,
    event,
    anonymous_id,
    person_id: bruto.email || bruto.telefone ? personId(bruto.email || bruto.telefone) : null,
    utm_source: texto(bruto.utm_source, 120),
    utm_medium: texto(bruto.utm_medium, 120),
    utm_campaign: texto(bruto.utm_campaign, 120),
    utm_content: texto(bruto.utm_content, 120),
    props: limparProps(bruto.props),
  };
}

export function normalizarLote(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.slice(0, MAX_LOTE).map(normalizar).filter(Boolean);
}

// ── Ponto único de saída ─────────────────────────────────────────────────────
// Recebe eventos já normalizados. Trocar o corpo daqui = trocar de adaptador.
async function entregar(sql, eventos) {
  if (!sql) {
    // Dev sem DATABASE_URL: não silencia, para o evento aparecer no terminal e
    // dar para conferir ordem e UTM sem banco nenhum.
    for (const e of eventos) {
      console.log(`[telemetria] ${e.event} anon=${e.anonymous_id || '-'} utm=${e.utm_source || '-'}/${e.utm_medium || '-'} props=${JSON.stringify(e.props)}`);
    }
    return eventos.length;
  }
  for (const e of eventos) {
    await sql`
      INSERT INTO telemetry_events (ts, app, event, anonymous_id, person_id, utm_source, utm_medium, utm_campaign, utm_content, props)
      VALUES (${e.ts}, ${e.app}, ${e.event}, ${e.anonymous_id}, ${e.person_id}, ${e.utm_source}, ${e.utm_medium}, ${e.utm_campaign}, ${e.utm_content}, ${JSON.stringify(e.props)}::jsonb)
    `;
  }
  return eventos.length;
}

// Costura anônimo → identificado: quando a pessoa se identifica, os eventos que
// ela já tinha gerado como anônima ganham o person_id retroativamente. Sem isso
// o funil sempre começa no formulário, nunca na primeira visita.
async function vincularPessoa(sql, anonymousId, pid) {
  if (!sql || !anonymousId || !pid) return 0;
  const r = await sql`
    UPDATE telemetry_events SET person_id = ${pid}
    WHERE anonymous_id = ${anonymousId} AND person_id IS NULL
  `;
  return r.count ?? 0;
}

export async function registrar(sql, brutos) {
  if (!ATIVA) return { gravados: 0, desativada: true };
  const eventos = normalizarLote(brutos);
  if (!eventos.length) return { gravados: 0 };

  const gravados = await entregar(sql, eventos);

  const ident = eventos.find(e => e.event === 'identify' && e.person_id);
  if (ident) await vincularPessoa(sql, ident.anonymous_id, ident.person_id);

  return { gravados };
}
