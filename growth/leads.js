// ── Caixa única de leads ─────────────────────────────────────────────────────
// Toda origem (formulário, isca, pedido de consultoria, checkout do EAD,
// "seja parceiro") cai na mesma tabela `leads`, com atribuição, canal e score.
// Antes só o formulário de contato gravava lead; quem pedia contratação ou
// começava a comprar um curso só existia na tabela do pedido.
//
// Sem resposta automática ao lead: decisão do Anders (ele atende pessoalmente).
// O que esta peça faz é o lead chegar ordenado e com contexto.

import { atribuicaoDaRequisicao, scoreLead, canalDe } from './atribuicao.js';
import { registrarConversao } from './conversoes.js';

/** Páginas vistas na sessão (só existe se a pessoa consentiu a análise). */
export async function paginasDaSessao(sql, sessionId) {
  if (!sql || !sessionId) return [];
  try {
    const rows = await sql`
      SELECT props->>'path' AS path FROM telemetry_events
       WHERE session_id = ${sessionId} AND event = 'page_view'
       ORDER BY ts LIMIT 40`;
    return rows.map(r => r.path).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Atribuição de um lead: cookie at_attr quando houve consentimento; sem ele,
 * a mesma informação que o formulário já mandava (UTM em memória + página de
 * entrada), sem identificador de clique.
 */
export function origemDoLead(req, dados = {}) {
  const o = atribuicaoDaRequisicao(req);
  if (!o.atribuicao) {
    const t = {};
    if (dados.landing_page && String(dados.landing_page).startsWith('/')) t.landing = dados.landing_page;
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) if (dados[k]) t[k] = dados[k];
    if (Object.keys(t).length) {
      t.ts = new Date().toISOString();
      o.atribuicao = { ft: t, lt: t, mkt: false };
      o.canal = canalDe(o.atribuicao, o.parceiro_codigo);
    }
  }
  return o;
}

/**
 * Grava um lead vindo de qualquer origem que não seja o formulário de contato
 * (pedido de consultoria, checkout do EAD, cadastro de parceiro) e registra a
 * conversão lead_captured. Nunca lança.
 */
export async function registrarLeadDeOrigem(sql, { req, origem, source, nome, empresa, email, telefone, cargo, interesse, mensagem, refTipo, refId, funcionarios, valor }) {
  if (!sql) return null;
  try {
    const o = origem || origemDoLead(req, {});
    const paginas = await paginasDaSessao(sql, o.session_id);
    const { score, motivos } = scoreLead({ cargo, canal: o.canal, source, paginas, funcionarios, valor });
    const landing = o.atribuicao && (o.atribuicao.ft && o.atribuicao.ft.landing) || null;
    const lt = (o.atribuicao && o.atribuicao.lt) || {};
    const rows = await sql`
      INSERT INTO leads (nome, empresa, email, telefone, cargo, interesse, mensagem, source, landing_page,
                         utm_source, utm_medium, utm_campaign, utm_content, utm_term,
                         atribuicao, canal, consent_marketing, parceiro_codigo, score, score_motivos, session_id, ref_tipo, ref_id)
      VALUES (${nome || null}, ${empresa || null}, ${email || null}, ${telefone || null}, ${cargo || null},
              ${interesse || null}, ${mensagem || null}, ${source}, ${landing},
              ${lt.utm_source || null}, ${lt.utm_medium || null}, ${lt.utm_campaign || null}, ${lt.utm_content || null}, ${lt.utm_term || null},
              ${o.atribuicao ? JSON.stringify(o.atribuicao) : null}::jsonb, ${o.canal}, ${o.consent_marketing},
              ${o.parceiro_codigo}, ${score}, ${JSON.stringify(motivos)}::jsonb, ${o.session_id}, ${refTipo || null}, ${refId || null})
      RETURNING id`;
    const leadId = rows[0] && rows[0].id;
    if (leadId) {
      await registrarConversao(sql, { evento: 'lead_captured', refTipo: 'lead', refId: leadId, origem: o });
      if (o.parceiro_codigo) await registrarConversao(sql, { evento: 'partner_referred', refTipo: 'lead', refId: leadId, origem: o });
    }
    return { leadId, score, motivos, paginas, origem: o };
  } catch (err) {
    console.error(`[leads] falha ao gravar lead de ${source}:`, err.message);
    return null;
  }
}

/** Mesmo lead, outro desfecho: pedido pago vira "ganho" na fila. */
export async function marcarLeadGanho(sql, refTipo, refId) {
  if (!sql) return;
  try {
    await sql`UPDATE leads SET status = 'ganho', updated_at = NOW()
               WHERE ref_tipo = ${refTipo} AND ref_id = ${refId} AND status IS DISTINCT FROM 'ganho'`;
  } catch (err) {
    console.error('[leads] falha ao marcar ganho:', err.message);
  }
}
