// ── WhatsApp Cloud API: mensagem recebida vira lead (sem resposta automática) ─
// Só funciona se o número estiver na Cloud API (ou em coexistência com o app
// WhatsApp Business). Liga com WHATSAPP_VERIFY_TOKEN + WHATSAPP_APP_SECRET.
// Verificação: GET com hub.mode/hub.verify_token/hub.challenge. Assinatura:
// X-Hub-Signature-256 = "sha256=" + HMAC-SHA256(corpo cru, app secret).
// Nada é respondido ao cliente: o Daniel atende pelo próprio WhatsApp.

import crypto from 'node:crypto';
import { scoreLead } from './atribuicao.js';
import { registrarConversao } from './conversoes.js';

export function whatsappConfigurado() {
  return !!(process.env.WHATSAPP_VERIFY_TOKEN && process.env.WHATSAPP_APP_SECRET);
}

export function assinaturaValida(rawBody, cabecalho, segredo = process.env.WHATSAPP_APP_SECRET) {
  if (!rawBody || !cabecalho || !segredo) return false;
  const esperado = 'sha256=' + crypto.createHmac('sha256', segredo).update(rawBody).digest('hex');
  const a = Buffer.from(String(cabecalho)), b = Buffer.from(esperado);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// "Olá! Vim pela página ISO 9001:2026 (/iso-9001-2026)" → origem legível e rota.
export function origemDaMensagem(texto) {
  const t = String(texto || '');
  const m = t.match(/vim pel[ao] (?:p[áa]gina|e-?mail)\s+(.+?)(?:\s*\((\/[a-z0-9\-/]*)\))?[.!]?(?:\s|$)/i);
  return { origem: m ? m[1].trim().slice(0, 120) : null, rota: m && m[2] ? m[2] : null };
}

export function mensagensDoPayload(body) {
  const out = [];
  for (const entry of (body && body.entry) || []) {
    for (const ch of entry.changes || []) {
      const v = ch.value || {};
      const nomes = new Map((v.contacts || []).map(c => [c.wa_id, c.profile && c.profile.name]));
      for (const msg of v.messages || []) {
        out.push({
          id: msg.id, de: msg.from || null, usuario: msg.from_user_id || null,
          nome: nomes.get(msg.from) || null,
          texto: msg.type === 'text' ? (msg.text && msg.text.body) || '' : `[${msg.type}]`,
          ts: msg.timestamp ? new Date(Number(msg.timestamp) * 1000).toISOString() : new Date().toISOString(),
        });
      }
    }
  }
  return out;
}

/** Grava cada mensagem recebida: lead novo, ou evento no lead que já existe. */
export async function registrarRecebidas(sql, mensagens) {
  let novos = 0;
  for (const m of mensagens) {
    const fone = String(m.de || '').replace(/\D/g, '');
    const fim = fone.slice(-10);
    const existente = fim.length === 10
      ? await sql`SELECT id FROM leads WHERE right(regexp_replace(COALESCE(telefone, ''), '\\D', '', 'g'), 10) = ${fim} AND created_at > NOW() - INTERVAL '180 days' ORDER BY created_at DESC LIMIT 1`
      : [];
    if (existente.length) {
      await sql`INSERT INTO lead_events (lead_id, event_type, payload) VALUES (${existente[0].id}, 'whatsapp_inbound', ${JSON.stringify({ id: m.id, texto: m.texto.slice(0, 500) })}::jsonb)`;
      continue;
    }
    const { origem, rota } = origemDaMensagem(m.texto);
    const atribuicao = rota ? { ft: { ts: m.ts, landing: rota }, lt: { ts: m.ts, landing: rota }, mkt: false } : null;
    const { score, motivos } = scoreLead({ canal: 'whatsapp', source: 'whatsapp_inbound', paginas: rota ? [rota] : [] });
    const r = await sql`
      INSERT INTO leads (nome, telefone, mensagem, source, landing_page, interesse, atribuicao, canal, score, score_motivos)
      VALUES (${m.nome}, ${fone ? '+' + fone : null}, ${m.texto.slice(0, 4000)}, 'whatsapp_inbound', ${rota}, ${origem ? 'WhatsApp: ' + origem : 'WhatsApp'},
              ${atribuicao ? JSON.stringify(atribuicao) : null}::jsonb, 'whatsapp', ${score}, ${JSON.stringify(motivos)}::jsonb)
      RETURNING id`;
    if (r[0]) {
      novos++;
      await registrarConversao(sql, { evento: 'lead_captured', refTipo: 'lead', refId: r[0].id, origem: { canal: 'whatsapp', atribuicao } });
    }
  }
  return { novos };
}
