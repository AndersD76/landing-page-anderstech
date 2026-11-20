// ── Mensageria: outbound, régua e tarefas ────────────────────────────────────
// Uma fila só (`mensagens`). O conteúdo é montado NA HORA DO ENVIO a partir da
// chave do modelo, e a condição é conferida no último instante: se o pedido já
// foi pago, o lembrete de checkout não sai; se a pessoa pediu para sair, nada sai.
//
// DESLIGADO POR PADRÃO. Em 21/09/2026 o Anders não quis resposta automática nem
// régua; em 20/11/2026 decidiu ligar régua e outbound (o outbound só sai para a
// empresa que ele iniciar em /admin/operacao). Envia só com:
//   OUTBOUND_ATIVO=true + OUTBOUND_REMETENTE  (domínio secundário verificado no Resend)
//   REGUA_ATIVA=true                          (isca, checkout abandonado, cobrança vencida, indicação)
// Toda mensagem: 1 objetivo, 1 CTA, UTM, clique rastreado e descadastro em 1 clique
// (link + cabeçalho List-Unsubscribe-Post, RFC 8058).

import crypto from 'node:crypto';
import { layout, esc } from '../emails.js';
import { EMPRESA } from '../config/empresa.js';

const SITE = 'https://anderstech.net';
const flag = (n) => process.env[n] === 'true';
export const outboundAtivo = () => flag('OUTBOUND_ATIVO') && !!process.env.OUTBOUND_REMETENTE;
export const reguaAtiva = () => flag('REGUA_ATIVA');

const HORA = 3600_000, DIA = 24 * HORA;

// ── Utilidades ──
function token() { return crypto.randomBytes(18).toString('hex'); }
export const normEmail = (e) => (e ? String(e).trim().toLowerCase() : null);

// Próximo horário comercial em Brasília (seg–sex, 8h–18h) a partir de `ms`.
export function janelaComercial(ms) {
  const BR = -3 * HORA;
  let d = new Date(ms + BR);
  for (let i = 0; i < 14; i++) {
    const dow = d.getUTCDay(), h = d.getUTCHours();
    if (dow >= 1 && dow <= 5 && h >= 8 && h < 18) return d.getTime() - BR;
    if (dow >= 1 && dow <= 5 && h < 8) { d.setUTCHours(8, 0, 0, 0); continue; }
    d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 8, 0, 0));
  }
  return ms;
}

// Link rastreado: /m/<token>?u=<caminho interno com UTM>.
function link(tok, caminho, campanha, conteudo) {
  const sep = caminho.includes('?') ? '&' : '?';
  const destino = `${caminho}${sep}utm_source=anderstech&utm_medium=email&utm_campaign=${campanha}&utm_content=${conteudo}`;
  return `${SITE}/m/${tok}?u=${encodeURIComponent(destino)}`;
}

function rodape(tok) {
  return `<hr class="divider"><p style="font-size:12px;color:#8190ac">Você recebeu esta mensagem de ${esc(EMPRESA.nome)} (CNPJ ${esc(EMPRESA.cnpj)}). `
    + `<a href="${SITE}/sair/${tok}" style="color:#8190ac">Não quero mais receber</a> — um clique e pronto.</p>`;
}

const corpo = (tok, html) => layout(`<div class="body">${html}${rodape(tok)}</div>`);
const btn = (href, txt) => `<a href="${href}" class="cta">${esc(txt)}</a>`;

// ── Modelos ──
// Cada modelo: assunto(p), html(tok, p). `p` são os params gravados na fila.
const mes = (iso) => iso ? new Date(iso + 'T12:00:00-03:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'em breve';

export const MODELOS = {
  // Outbound PBQP-H — segmento A (renovação nos próximos 12 meses), B (vencido no
  // snapshot) e C (estável). Três e-mails; o toque 3 é tarefa (ligação/LinkedIn).
  'out-a-1': {
    assunto: (p) => `PBQP-H da ${p.empresa} vence em ${mes(p.validade)}`,
    html: (t, p) => `<p>Olá.</p><p>Pelo cadastro público do SiAC, o certificado PBQP-H da <b>${esc(p.empresa)}</b> vence em ${mes(p.validade)}. Faço consultoria de PBQP-H e ISO 9001 a partir de Passo Fundo, a ${esc(p.km)} km de vocês, e acompanho a renovação do começo ao fim.</p><p>O preço sai na hora pelo porte da empresa:</p>${btn(link(t, '/contratar?servico=pbqp-h', 'outbound-pbqph-' + p.segmento, 'e1'), 'Ver o preço da renovação')}<p>Quem cuida disso aí?<br>Daniel Anders · ${esc(EMPRESA.whatsappFormatado)}</p>`,
  },
  'out-a-2': {
    assunto: (p) => `Re: PBQP-H da ${p.empresa}`,
    html: (t, p) => `<p>A renovação costuma travar em dois pontos: evidência de controle na obra e auditoria interna feita às pressas. Posso olhar os dois com vocês antes da certificadora.</p><p>Montei um panorama do PBQP-H por cidade com os dados oficiais do SiAC:</p>${btn(link(t, '/pbqp-h/construtoras/' + String(p.uf || 'rs').toLowerCase(), 'outbound-pbqph-' + p.segmento, 'e2'), 'Ver o panorama')}<p>Daniel</p>`,
  },
  'out-a-4': {
    assunto: (p) => `Re: PBQP-H da ${p.empresa}`,
    html: (t, p) => `<p>Último contato meu sobre isso, para não lotar sua caixa. Se a renovação já está encaminhada, ótimo. Se ficar apertada, é só responder este e-mail ou chamar no WhatsApp:</p>${btn(link(t, '/contratar?servico=pbqp-h', 'outbound-pbqph-' + p.segmento, 'e4'), 'Ver o preço')}<p>Daniel</p>`,
  },
  'out-b-1': {
    assunto: (p) => `PBQP-H da ${p.empresa}: renovado?`,
    html: (t, p) => `<p>Olá.</p><p>No cadastro do SiAC que consultei, o PBQP-H da <b>${esc(p.empresa)}</b> aparecia com validade em ${mes(p.validade)}. Se já renovaram, desconsidere. Se a renovação ficou parada, consigo retomar com vocês a partir de Passo Fundo (${esc(p.km)} km).</p>${btn(link(t, '/contratar?servico=pbqp-h', 'outbound-pbqph-b', 'e1'), 'Ver o preço da retomada')}<p>Daniel Anders · ${esc(EMPRESA.whatsappFormatado)}</p>`,
  },
  'out-c-1': {
    assunto: (p) => `Manutenção do PBQP-H na ${p.empresa}`,
    html: (t, p) => `<p>Olá.</p><p>A <b>${esc(p.empresa)}</b> tem PBQP-H vigente até ${mes(p.validade)}. Entre uma auditoria e outra o sistema costuma esfriar. Faço a manutenção mensal, 16 h por mês, com o preço na hora:</p>${btn(link(t, '/contratar?servico=manutencao-sgq', 'outbound-pbqph-c', 'e1'), 'Ver o preço da manutenção')}<p>Daniel Anders · ${esc(EMPRESA.whatsappFormatado)}</p>`,
  },

  // Régua da isca de transição ISO 9001:2026 (o 1º e-mail, com o resultado, sai
  // na hora pelo /api/contact). Mais 4, terminando na oferta.
  'isca-2026-2': {
    assunto: () => 'O ponto da ISO 9001:2026 que mais reprova na transição',
    html: (t, p) => `<p>${p.nome ? esc(p.nome) + ', o' : 'O'} ajuste mais esquecido da versão 2026 é o 6.1: riscos e oportunidades viraram três requisitos (levantar, agir nos riscos, agir nas oportunidades). Oportunidade tem plano próprio, não é "risco positivo".</p>${btn(link(t, '/iso-9001-2026', 'regua-isca-2026', 'm2'), 'Ver as mudanças requisito a requisito')}`,
  },
  'isca-2026-3': {
    assunto: () => 'Pergunte isto à sua certificadora esta semana',
    html: (t) => `<p>Três perguntas: quando vocês estarão acreditados para a ISO 9001:2026? Em qual auditoria fazemos a transição? Ela pode ser remota? Pelo cronograma oficial, as decisões de acreditação vão até 30/09/2027 e a transição pode ser remota.</p>${btn(link(t, '/iso-9001-2026', 'regua-isca-2026', 'm3'), 'Ver o cronograma oficial')}`,
  },
  'isca-2026-4': {
    assunto: () => 'Refaça o diagnóstico depois dos ajustes',
    html: (t, p) => `<p>Seu diagnóstico abre com as mesmas respostas. Depois de cada ajuste, atualize e veja o percentual subir. Mande o link para a diretoria: é a forma mais rápida de alinhar o que falta.</p>${btn(p.url ? `${SITE}/m/${t}?u=${encodeURIComponent(String(p.url).replace(/^https?:\/\/[^/]+/, '') + '&utm_source=anderstech&utm_medium=email&utm_campaign=regua-isca-2026&utm_content=m4')}` : link(t, '/transicao-iso-9001-2026', 'regua-isca-2026', 'm4'), 'Abrir meu diagnóstico')}`,
  },
  'isca-2026-5': {
    assunto: () => 'Quer ajuda para fechar as lacunas da transição?',
    html: (t) => `<p>Se fizer sentido ter alguém do lado para fechar as lacunas antes da auditoria, o preço da consultoria sai na hora pelo porte e pela cidade da empresa. Atendo presencialmente a até 300 km de Passo Fundo.</p>${btn(link(t, '/contratar?servico=iso-9001', 'regua-isca-2026', 'm5'), 'Ver o preço')}<p>Daniel Anders · ${esc(EMPRESA.whatsappFormatado)}</p>`,
  },

  // Régua das iscas do motor orgânico (5 e-mails do cluster, terminando na oferta).
  // Só para quem marcou o opt-in de marketing (organico/iscas.js).
  'org-1': {
    assunto: (p) => `${p.nome ? p.nome + ', o' : 'O'} primeiro passo depois do material`,
    html: (t, p) => `<p>Obrigado por baixar o material. O primeiro passo é aplicar num processo só, não na empresa inteira: escolha o que mais gera retrabalho ou reclamação e comece por ele.</p>${btn(link(t, p.pilar || '/iso-9001', 'regua-isca-' + (p.isca || 'org'), 'm1'), 'Ver o guia completo')}`,
  },
  'org-2': {
    assunto: () => 'O erro que mais aparece em auditoria',
    html: (t, p) => `<p>Em auditoria, o que mais derruba empresa não é falta de documento: é documento que não bate com a rotina. Antes da auditoria, confira se o que está escrito é o que o chão de fábrica faz.</p>${btn(link(t, '/norma-iso-9001', 'regua-isca-' + (p.isca || 'org'), 'm2'), 'Ver os requisitos explicados')}`,
  },
  'org-3': {
    assunto: () => 'Como medir se o ajuste funcionou',
    html: (t, p) => `<p>Todo ajuste precisa de um número antes e depois: reclamações por mês, retrabalho, prazo. Sem isso, não dá para mostrar eficácia ao auditor nem à diretoria.</p>${btn(link(t, '/transicao-iso-9001-2026', 'regua-isca-' + (p.isca || 'org'), 'm3'), 'Fazer o diagnóstico grátis')}`,
  },
  'org-4': {
    assunto: () => 'Um exemplo prático, passo a passo',
    html: (t, p) => `<p>Veja o requisito correspondente explicado com o que o auditor pede como evidência e os erros mais comuns:</p>${btn(link(t, p.pilar || '/norma-iso-9001', 'regua-isca-' + (p.isca || 'org'), 'm4'), 'Ver o exemplo')}`,
  },
  'org-5': {
    assunto: () => 'Quer ajuda para aplicar na sua empresa?',
    html: (t, p) => `<p>Se fizer sentido ter alguém do lado, o preço da consultoria sai na hora pelo porte e pela cidade da empresa. Atendo presencialmente a até 300 km de Passo Fundo.</p>${btn(link(t, p.comercial || '/contratar', 'regua-isca-' + (p.isca || 'org'), 'm5'), 'Ver o preço')}<p>Daniel Anders · ${esc(EMPRESA.whatsappFormatado)}</p>`,
  },

  // Checkout abandonado (1 h e 24 h) e cobrança vencida.
  'checkout-1h': {
    assunto: (p) => `Seu pedido ficou pela metade: ${p.produto}`,
    html: (t, p) => `<p>O pagamento de <b>${esc(p.produto)}</b> ainda não foi concluído. O link da cobrança continua valendo:</p>${p.fatura ? btn(p.fatura, 'Concluir o pagamento') : btn(link(t, p.voltar || '/', 'regua-checkout', '1h'), 'Voltar ao pedido')}<p>Se travou em alguma etapa, responda este e-mail.</p>`,
  },
  'checkout-24h': {
    assunto: (p) => `Ainda quer ${p.produto}?`,
    html: (t, p) => `<p>Passando só para lembrar do pedido de <b>${esc(p.produto)}</b>. Se mudou de ideia, tudo bem, este é o último lembrete.</p>${p.fatura ? btn(p.fatura, 'Concluir o pagamento') : btn(link(t, p.voltar || '/', 'regua-checkout', '24h'), 'Voltar ao pedido')}`,
  },
  'cobranca-vencida': {
    assunto: (p) => `Pagamento não identificado: ${p.produto}`,
    html: (t, p) => `<p>A cobrança de <b>${esc(p.produto)}</b> venceu sem pagamento identificado. Se já pagou, desconsidere. Se quiser outra forma de pagamento, responda este e-mail.</p>${p.fatura ? btn(p.fatura, 'Ver a cobrança') : ''}`,
  },
  'indicacao-45d': {
    assunto: () => 'Uma pergunta rápida sobre a consultoria',
    html: (t) => `<p>Faz pouco mais de um mês que começamos. Se o trabalho está ajudando, uma indicação para outra empresa que precise de ISO 9001 ou PBQP-H faz muita diferença para mim.</p>${btn(link(t, '/', 'regua-indicacao', 'm1'), 'Mandar o site para quem precisa')}<p>E se algo não está bom, me conte respondendo este e-mail.</p>`,
  },
};

export const SEQ_OUTBOUND = {
  A: [['out-a-1', 0], ['out-a-2', 3], ['tarefa-ligacao', 7], ['out-a-4', 11]],
  B: [['out-b-1', 0], ['out-a-2', 3], ['tarefa-ligacao', 7], ['out-a-4', 11]],
  C: [['out-c-1', 0], ['tarefa-ligacao', 7], ['out-a-4', 11]],
};
export const SEQ_ISCA_2026 = [['isca-2026-2', 2], ['isca-2026-3', 5], ['isca-2026-4', 9], ['isca-2026-5', 14]];

export function renderizar(chave, tok, params) {
  const m = MODELOS[chave];
  if (!m) return null;
  return { assunto: m.assunto(params), html: corpo(tok, m.html(tok, params)) };
}

// ── Fila ──
export async function agendar(sql, { tipo, chave, refTipo = null, refId = null, email = null, params = {}, quando }) {
  const tok = token();
  await sql`
    INSERT INTO mensagens (tipo, chave, ref_tipo, ref_id, email, params, token, agendada_para)
    VALUES (${tipo}, ${chave}, ${refTipo}, ${refId == null ? null : String(refId)}, ${normEmail(email)}, ${JSON.stringify(params)}::jsonb, ${tok}, ${new Date(quando).toISOString()})`;
  return tok;
}

export async function cancelarPorRef(sql, refTipo, refId, motivo = 'cancelada') {
  await sql`UPDATE mensagens SET status = ${motivo} WHERE ref_tipo = ${refTipo} AND ref_id = ${String(refId)} AND status = 'agendada'`;
}

export async function suprimir(sql, email, motivo) {
  const e = normEmail(email);
  if (!e) return;
  await sql`INSERT INTO supressao (email, motivo) VALUES (${e}, ${motivo}) ON CONFLICT (email) DO NOTHING`;
  await sql`UPDATE mensagens SET status = 'cancelada' WHERE email = ${e} AND status = 'agendada' AND tipo <> 'tarefa'`;
  await sql`UPDATE leads SET email_optout = TRUE WHERE lower(email) = ${e}`;
  await sql`UPDATE outbound_contas SET status = 'sair' WHERE lower(email) = ${e}`;
}

// Condição conferida na hora do envio. false = a mensagem perdeu o sentido.
async function aindaFazSentido(sql, m) {
  if (m.ref_tipo === 'ead_order') {
    const r = await sql`SELECT status FROM ead_orders WHERE id = ${parseInt(m.ref_id, 10)}`;
    return m.chave === 'cobranca-vencida' ? r[0]?.status === 'vencido' : r[0]?.status === 'pendente';
  }
  if (m.ref_tipo === 'consultoria_pedido') {
    const r = await sql`SELECT status FROM consultoria_pedidos WHERE id = ${parseInt(m.ref_id, 10)}`;
    if (m.chave === 'indicacao-45d') return r[0]?.status === 'aprovado';
    return m.chave === 'cobranca-vencida' ? r[0]?.status === 'vencido' : r[0]?.status === 'pendente';
  }
  if (m.ref_tipo === 'lead') {
    const r = await sql`SELECT status, email_optout, optin_marketing FROM leads WHERE id = ${parseInt(m.ref_id, 10)}`;
    return !!r[0] && r[0].optin_marketing && !r[0].email_optout && ['novo', 'contatado', null].includes(r[0].status);
  }
  if (m.ref_tipo === 'outbound') {
    const r = await sql`SELECT status FROM outbound_contas WHERE cnpj = ${m.ref_id}`;
    return r[0]?.status === 'em_sequencia';
  }
  return true;
}

/**
 * Envia o que está vencido na fila. Tipos: 'outbound' (janela comercial, limite
 * diário, remetente do domínio secundário) e 'regua'. 'tarefa' nunca é enviada:
 * aparece no painel para o Daniel fazer (ligação, LinkedIn).
 */
export async function processarFila(sql, resend, { agora = Date.now() } = {}) {
  if (!sql || !resend) return { enviadas: 0 };
  const tipos = [];
  if (outboundAtivo()) tipos.push('outbound');
  if (reguaAtiva()) tipos.push('regua');
  if (!tipos.length) return { enviadas: 0, motivo: 'desligado' };

  const limite = parseInt(process.env.OUTBOUND_LIMITE_DIA, 10) || 40;
  const hoje = await sql`SELECT COUNT(*)::int AS n FROM mensagens WHERE tipo = 'outbound' AND status = 'enviada' AND enviada_em > date_trunc('day', NOW() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'`;
  let folgaOutbound = Math.max(0, limite - hoje[0].n);
  const dentroDaJanela = janelaComercial(agora) === agora;

  const fila = await sql`
    SELECT * FROM mensagens WHERE status = 'agendada' AND tipo = ANY(${tipos}) AND agendada_para <= ${new Date(agora).toISOString()}
     ORDER BY agendada_para LIMIT 25`;
  let enviadas = 0;
  for (const m of fila) {
    if (m.tipo === 'outbound' && (!dentroDaJanela || folgaOutbound <= 0)) continue;
    try {
      const sup = m.email ? await sql`SELECT 1 FROM supressao WHERE email = ${m.email}` : [];
      if (!m.email || sup.length) { await sql`UPDATE mensagens SET status = 'suprimida' WHERE id = ${m.id}`; continue; }
      if (!(await aindaFazSentido(sql, m))) { await sql`UPDATE mensagens SET status = 'sem_sentido' WHERE id = ${m.id}`; continue; }
      const r = renderizar(m.chave, m.token, m.params || {});
      if (!r) { await sql`UPDATE mensagens SET status = 'erro', erro = 'modelo inexistente' WHERE id = ${m.id}`; continue; }
      const from = m.tipo === 'outbound' ? process.env.OUTBOUND_REMETENTE : `Daniel Anders · Anders Tech <${EMPRESA.emailRemetente}>`;
      // 20/11/2026: os textos pedem "responda este e-mail", mas a régua saía de
      // noreply@ sem replyTo (resposta perdida) e o outbound só tinha replyTo se a
      // variável existisse. Agora a resposta sempre cai na caixa do Daniel.
      const replyTo = (m.tipo === 'outbound' ? process.env.OUTBOUND_RESPONDER_PARA : process.env.REGUA_RESPONDER_PARA) || EMPRESA.email;
      await resend.emails.send({
        from, to: m.email, subject: r.assunto, html: r.html, replyTo,
        headers: { 'List-Unsubscribe': `<${SITE}/sair/${m.token}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      });
      await sql`UPDATE mensagens SET status = 'enviada', enviada_em = NOW() WHERE id = ${m.id}`;
      if (m.tipo === 'outbound') folgaOutbound--;
      enviadas++;
    } catch (err) {
      await sql`UPDATE mensagens SET status = 'erro', erro = ${String(err.message).slice(0, 300)} WHERE id = ${m.id}`;
    }
  }
  return { enviadas };
}

// ── Gatilhos chamados pelo resto do app (só agendam se a régua estiver ligada) ──
export async function aoLeadIsca(sql, { leadId, email, nome, url, optin = false }) {
  if (!sql || !reguaAtiva() || !email || !optin) return;
  for (const [chave, dias] of SEQ_ISCA_2026) {
    await agendar(sql, { tipo: 'regua', chave, refTipo: 'lead', refId: leadId, email, params: { nome, url }, quando: Date.now() + dias * DIA });
  }
}

export async function aoCheckout(sql, { refTipo, refId, email, produto, fatura, voltar }) {
  if (!sql || !reguaAtiva() || !email) return;
  for (const [chave, h] of [['checkout-1h', 1], ['checkout-24h', 24]]) {
    await agendar(sql, { tipo: 'regua', chave, refTipo, refId, email, params: { produto, fatura, voltar }, quando: Date.now() + h * HORA });
  }
}

export async function aoCobrancaVencida(sql, { refTipo, refId, email, produto, fatura }) {
  if (!sql || !reguaAtiva() || !email) return;
  await agendar(sql, { tipo: 'regua', chave: 'cobranca-vencida', refTipo, refId, email, params: { produto, fatura }, quando: Date.now() });
}

export async function aoConsultoriaPaga(sql, { refId, email }) {
  if (!sql || !reguaAtiva() || !email) return;
  await agendar(sql, { tipo: 'regua', chave: 'indicacao-45d', refTipo: 'consultoria_pedido', refId, email, quando: Date.now() + 45 * DIA });
}

// ── Outbound: contas a partir do dado próprio ──
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();

export function pontuarConta(r, km, hoje = new Date()) {
  let s = 0; const m = [];
  if (km <= 50) { s += 30; m.push('até 50 km'); } else if (km <= 100) { s += 25; m.push('51–100 km'); } else { s += 15; m.push('101–300 km'); }
  const mv = r.validade ? Math.round((new Date(r.validade + 'T12:00:00-03:00') - hoje) / (30.44 * DIA)) : null;
  let segmento = 'C';
  if (mv === null) m.push('sem validade');
  else if (mv < 0) { s += 15; segmento = 'B'; m.push(`validade vencida há ${-mv} mês(es)`); }
  else if (mv <= 6) { s += 30; segmento = 'A'; m.push(`vence em ${mv} mês(es)`); }
  else if (mv <= 12) { s += 20; segmento = 'A'; m.push(`vence em ${mv} meses`); }
  else { s += 5; m.push(`vence em ${mv} meses`); }
  if (r.nivel === 'A') { s += 10; m.push('nível A'); } else if (r.nivel === 'B') { s += 5; m.push('nível B'); }
  if (/Edifica/i.test(r.subsetor || '')) { s += 5; m.push('edificações'); }
  return { score: s, motivos: m.join('; '), segmento };
}

export function montarContas(registros, municipiosDist, hoje = new Date()) {
  const kmPor = new Map(municipiosDist.map(m => [`${m.uf}|${norm(m.nome)}`, m.km]));
  const vistos = new Set(), contas = [];
  for (const r of registros) {
    const km = kmPor.get(`${r.uf}|${norm(r.municipio_titulo || r.municipio)}`);
    if (km === undefined || !r.cnpj || vistos.has(r.cnpj)) continue;
    vistos.add(r.cnpj);
    contas.push({ ...r, km, ...pontuarConta(r, km, hoje) });
  }
  return contas.sort((a, b) => b.score - a.score || a.km - b.km);
}

// Busca e-mail e telefone na base pública do SiAC (mesma fonte da carga
// mensal). O contato fica só no banco — nunca em página nem no repositório.
export async function contatosSiac({ fetchImpl = fetch } = {}) {
  const r = await fetchImpl('https://pbqp-h.cidades.gov.br/sistemas/siac/empresas-certificadas/?tabela=show', { headers: { 'User-Agent': 'AndersTechBot/1.0 (+https://anderstech.net)' } });
  const bruto = JSON.parse(Buffer.from(await r.arrayBuffer()).toString('latin1'));
  const mapa = new Map();
  for (const e of bruto) {
    const cnpj = String(e.cnpj || '').replace(/\D/g, '');
    if (!cnpj) continue;
    const email = String(e['e-mail'] || e.email || '').trim().toLowerCase().split(/[;, ]+/)[0] || null;
    mapa.set(cnpj, { email: /@/.test(email || '') ? email : null, telefone: String(e.telefone || '').trim() || null });
  }
  return mapa;
}

export async function sincronizarContas(sql, { registros, municipios, buscarContatos = true }) {
  const contas = montarContas(registros, municipios);
  let contatos = new Map();
  if (buscarContatos) { try { contatos = await contatosSiac(); } catch (err) { console.error('[outbound] contatos SiAC:', err.message); } }
  for (const c of contas) {
    const ct = contatos.get(String(c.cnpj).replace(/\D/g, '')) || {};
    await sql`
      INSERT INTO outbound_contas (cnpj, empresa, municipio, uf, km, nivel, subsetor, organismo, validade, segmento, score, motivos, email, telefone)
      VALUES (${c.cnpj}, ${c.empresa}, ${c.municipio_titulo || c.municipio}, ${c.uf}, ${c.km}, ${c.nivel}, ${c.subsetor}, ${c.organismo}, ${c.validade || null},
              ${c.segmento}, ${c.score}, ${c.motivos}, ${ct.email || null}, ${ct.telefone || null})
      ON CONFLICT (cnpj) DO UPDATE SET empresa = EXCLUDED.empresa, km = EXCLUDED.km, nivel = EXCLUDED.nivel, validade = EXCLUDED.validade,
        segmento = EXCLUDED.segmento, score = EXCLUDED.score, motivos = EXCLUDED.motivos,
        email = COALESCE(EXCLUDED.email, outbound_contas.email), telefone = COALESCE(EXCLUDED.telefone, outbound_contas.telefone), atualizado_em = NOW()`;
  }
  return { contas: contas.length, comEmail: [...contatos.values()].length ? contas.filter(c => (contatos.get(String(c.cnpj).replace(/\D/g, '')) || {}).email).length : null };
}

export async function iniciarSequencia(sql, cnpj) {
  const r = await sql`SELECT * FROM outbound_contas WHERE cnpj = ${cnpj}`;
  const c = r[0];
  if (!c) return { erro: 'conta não encontrada' };
  if (c.status !== 'novo') return { erro: `conta está "${c.status}"` };
  const e = normEmail(c.email);
  if (!e) return { erro: 'conta sem e-mail' };
  if ((await sql`SELECT 1 FROM supressao WHERE email = ${e}`).length) return { erro: 'e-mail na lista de supressão' };
  const seq = SEQ_OUTBOUND[c.segmento] || SEQ_OUTBOUND.C;
  const params = { empresa: c.empresa, validade: c.validade ? new Date(c.validade).toISOString().slice(0, 10) : null, km: c.km, uf: c.uf, segmento: (c.segmento || 'c').toLowerCase(), telefone: c.telefone };
  for (const [chave, dias] of seq) {
    await agendar(sql, {
      tipo: chave.startsWith('tarefa') ? 'tarefa' : 'outbound', chave, refTipo: 'outbound', refId: c.cnpj, email: e, params,
      quando: janelaComercial(Date.now() + dias * DIA),
    });
  }
  await sql`UPDATE outbound_contas SET status = 'em_sequencia', atualizado_em = NOW() WHERE cnpj = ${cnpj}`;
  return { ok: true, toques: seq.length };
}

export async function mudarStatusConta(sql, cnpj, status, nota) {
  const validos = ['novo', 'em_sequencia', 'respondeu', 'sair', 'cliente', 'descartado'];
  if (!validos.includes(status)) return { erro: 'status: ' + validos.join(', ') };
  const r = await sql`UPDATE outbound_contas SET status = ${status}, nota = COALESCE(${nota || null}, nota), atualizado_em = NOW() WHERE cnpj = ${cnpj} RETURNING email`;
  if (!r.length) return { erro: 'conta não encontrada' };
  if (status !== 'em_sequencia') await cancelarPorRef(sql, 'outbound', cnpj);
  if (status === 'sair') await suprimir(sql, r[0].email, 'pediu para sair (outbound)');
  return { ok: true };
}

// Roteiro da tarefa de ligação (toque 3), mostrado no painel.
export function roteiroLigacao(p) {
  return `Bom dia, aqui é o Daniel Anders, consultor de qualidade de Passo Fundo. Falo com quem cuida do PBQP-H da ${p.empresa}? `
    + `Liguei porque o certificado de vocês ${p.segmento === 'b' ? 'aparecia com validade em ' + mes(p.validade) : 'vence em ' + mes(p.validade)}, pelo cadastro público do SiAC. `
    + 'Eu faço a renovação do começo ao fim, presencial. Dois minutos agora, ou prefere que eu mande o preço por e-mail?';
}

export const OBJECOES = [
  ['Já temos consultor / fazemos internamente', 'Ótimo. Se precisarem de reforço na auditoria interna ou na reta final, o preço por hora está no site. Sem compromisso.'],
  ['Está caro / sem verba agora', 'O preço é por hora (R$ 180), calculado pelo porte e pela distância. Ver o valor no site leva 1 minuto, e a forma de pagamento a gente combina.'],
  ['A equipe não tem tempo, está toda em obra', 'Por isso o trabalho é presencial e em blocos: levanto as evidências com a equipe no canteiro, sem tirar ninguém da obra por dias.'],
  ['A transição da ISO é só em 2029', 'O prazo final é 30/09/2029, mas a transição tem de caber numa auditoria até lá, e a agenda das certificadoras enche em 2028 e 2029. O diagnóstico grátis leva 5 minutos.'],
  ['A certificadora já nos orienta', 'A certificadora não pode prestar consultoria para quem ela audita: é regra de imparcialidade. Ela aponta a não conformidade; resolver é com a empresa.'],
];
