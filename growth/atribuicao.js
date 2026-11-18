// ── Atribuição: de onde veio quem virou lead ou pagou ────────────────────────
// Antes desta peça o lead guardava só utm_* e a página de entrada, e o pedido
// (EAD e consultoria) não guardava nada. Sem o identificador de clique
// (gclid, msclkid...) nenhuma venda pode voltar para a plataforma de anúncio,
// e sem isso o lance automático otimiza no escuro e o CAC não fecha.
//
// Fonte: o cookie first-party `at_attr`, escrito por telemetry-client.js SÓ com
// consentimento de análise; os identificadores de clique entram nele SÓ com
// consentimento de marketing. O servidor nunca cria atribuição por conta
// própria — lê o que o navegador consentiu em guardar.
//
// Módulo puro (sem banco, sem Express) para os testes cobrirem cada regra.

export const CLIDS = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid', 'li_fat_id'];
const UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const RE_CLID = /^[A-Za-z0-9_.\-~]{4,300}$/;
const RE_PARCEIRO = /^[a-z0-9-]{3,32}$/;

function txt(v, max) {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[\u0000-\u001f]/g, '').trim();
  return s ? s.slice(0, max) : null;
}

// Um "toque" é a chegada de uma visita: quando, por qual página, vindo de onde.
function limpaToque(t) {
  if (!t || typeof t !== 'object') return null;
  const out = {};
  const ts = Date.parse(t.ts);
  if (!Number.isNaN(ts)) out.ts = new Date(ts).toISOString();
  const landing = txt(t.landing, 300);
  if (landing && landing.startsWith('/')) out.landing = landing;
  const ref = txt(t.referrer, 300);
  if (ref && /^https?:\/\//i.test(ref)) out.referrer = ref;
  for (const k of UTMS) {
    const v = txt(t[k], 120);
    if (v) out[k] = v;
  }
  for (const k of CLIDS) {
    const v = txt(t[k], 300);
    if (v && RE_CLID.test(v)) out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Normaliza a atribuição vinda do cookie (string JSON, codificada ou não) ou de
 * um objeto. Nunca lança: dado de navegador é hostil por definição.
 * @returns {{ft: object|null, lt: object|null, mkt: boolean} | null}
 */
export function parseAtribuicao(raw) {
  if (!raw) return null;
  let obj = raw;
  if (typeof raw === 'string') {
    if (raw.length > 4096) return null;
    try {
      obj = JSON.parse(raw.trim().startsWith('{') ? raw : decodeURIComponent(raw));
    } catch {
      return null;
    }
  }
  if (!obj || typeof obj !== 'object') return null;
  const mkt = obj.mkt === 1 || obj.mkt === true || obj.mkt === '1';
  let ft = limpaToque(obj.ft);
  let lt = limpaToque(obj.lt);
  // Sem consentimento de marketing, identificador de clique não é guardado nem
  // que o cookie traga um (cookie antigo, edição manual): a regra vale aqui
  // também, não só no navegador.
  if (!mkt) {
    for (const t of [ft, lt]) if (t) for (const k of CLIDS) delete t[k];
  }
  if (!ft && !lt) return null;
  if (!ft) ft = lt;
  if (!lt) lt = ft;
  const sid = txt(obj.sid, 64);
  return { ft, lt, mkt, ...(sid && /^[A-Za-z0-9-]{8,64}$/.test(sid) ? { sid } : {}) };
}

export function lerCookie(header, nome) {
  if (!header) return null;
  for (const parte of String(header).split(';')) {
    const i = parte.indexOf('=');
    if (i < 0) continue;
    if (parte.slice(0, i).trim() === nome) return parte.slice(i + 1).trim();
  }
  return null;
}

export function codigoParceiroValido(v) {
  return typeof v === 'string' && RE_PARCEIRO.test(v);
}

const BUSCADORES = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex|search\.brave|baidu)\./i;
const ASSISTENTES = /(^|\.)(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|copilot\.microsoft\.com|gemini\.google\.com)$/i;
const SOCIAIS = /(^|\.)(facebook|instagram|linkedin|lnkd|youtube|t\.co|twitter|x)\.(com|in)$/i;
const PAGO = /^(cpc|ppc|paid|paid_search|paidsearch|paid_social|ads?)$/i;

function host(url) {
  try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
}

// Canal de um toque. A ordem importa: identificador de clique é prova mais
// forte que UTM (UTM qualquer um digita), e UTM é mais forte que referrer.
export function canalDoToque(t) {
  if (!t) return 'direto';
  const src = String(t.utm_source || '').toLowerCase();
  const med = String(t.utm_medium || '').toLowerCase();
  const camp = String(t.utm_campaign || '').toLowerCase();

  if (t.gclid || t.gbraid || t.wbraid || (src === 'google' && PAGO.test(med))) return 'google_ads';
  if (t.msclkid || ((src === 'bing' || src === 'microsoft') && PAGO.test(med))) return 'microsoft_ads';
  if (t.li_fat_id || (src === 'linkedin' && PAGO.test(med))) return 'linkedin_ads';
  if (PAGO.test(med) && /^(facebook|instagram|meta|fb|ig)$/.test(src)) return 'meta_ads';
  if (med === 'email') return camp.startsWith('outbound') ? 'outbound' : 'email';
  if (med === 'parceiro') return 'parceiro';
  if (med === 'whatsapp') return 'whatsapp';
  if (med === 'artifact') return 'artifact';
  if (med === 'qr') return 'qr';
  if (med === 'social' || t.fbclid) return 'social';
  if (src || med) return 'outros_utm';

  const h = host(t.referrer);
  if (!h || h.endsWith('anderstech.net')) return 'direto';
  if (ASSISTENTES.test(h)) return 'assistente_ia';
  if (BUSCADORES.test(h)) return 'organico';
  if (SOCIAIS.test(h)) return 'social';
  return 'referencia';
}

// Canal do lead/pedido: parceiro vence (é ele quem recebe pela indicação);
// depois o último toque que não seja "direto" — quem voltou digitando o
// endereço depois de clicar num anúncio continua sendo venda do anúncio.
export function canalDe(atribuicao, parceiroCodigo) {
  if (parceiroCodigo) return 'parceiro';
  if (!atribuicao) return 'direto';
  const lt = canalDoToque(atribuicao.lt);
  if (lt !== 'direto') return lt;
  return canalDoToque(atribuicao.ft);
}

/**
 * Tudo o que um handler precisa gravar, lido de uma requisição Express.
 * O corpo pode trazer `atrib` (o mesmo objeto do cookie) para quem chegou sem
 * cookie gravado ainda — o cookie, quando existe, vence.
 */
export function atribuicaoDaRequisicao(req) {
  const cookie = lerCookie(req.headers && req.headers.cookie, 'at_attr');
  const atribuicao = parseAtribuicao(cookie) || parseAtribuicao(req.body && req.body.atrib);
  const parc = lerCookie(req.headers && req.headers.cookie, 'at_parceiro');
  const parceiro_codigo = codigoParceiroValido(parc) ? parc : null;
  const sessao = (atribuicao && atribuicao.sid) || txt(req.body && req.body.session_id, 64);
  if (atribuicao) delete atribuicao.sid;   // a sessão vai em coluna própria
  // Agente do navegador: a Meta exige em evento de site. Só com consentimento
  // de marketing, porque só serve para isso.
  if (atribuicao && atribuicao.mkt) {
    const ua = txt(req.headers && req.headers['user-agent'], 300);
    if (ua) atribuicao.ua = ua;
  }
  return {
    atribuicao,
    canal: canalDe(atribuicao, parceiro_codigo),
    consent_marketing: !!(atribuicao && atribuicao.mkt),
    parceiro_codigo,
    session_id: sessao && /^[A-Za-z0-9-]{8,64}$/.test(sessao) ? sessao : null,
  };
}

// ── Score do lead ────────────────────────────────────────────────────────────
// Simples de propósito: serve para ordenar a fila do Anders, não para prever.
// Cada peso tem um motivo escrito; mexer num peso é decisão comercial.
const CARGO_DECISOR = /(s[óo]ci|dono|propriet|diretor|ceo|presidente|gerente|coordenador|respons[áa]vel|engenheir|qualidade)/i;

export function scoreLead({ prazo, cargo, canal, source, paginas = [], funcionarios, valor } = {}) {
  let s = 0;
  const motivos = [];
  if (prazo === 'agora') { s += 30; motivos.push('decide agora'); }
  else if (prazo === '90_dias') { s += 15; motivos.push('decide em 90 dias'); }
  if (cargo && CARGO_DECISOR.test(cargo)) { s += 15; motivos.push('cargo decisor'); }
  if (source === 'contratar_pedido') { s += 35; motivos.push('pediu contratação com preço'); }
  else if (source === 'ead_checkout') { s += 10; motivos.push('iniciou compra de curso'); }
  else if (source === 'parceiro_cadastro') { s += 5; motivos.push('quer ser parceiro'); }
  else if (source === 'isca_transicao_2026') { s += 10; motivos.push('fez o diagnóstico de transição 2026'); }
  if (canal === 'parceiro') { s += 15; motivos.push('indicado por parceiro'); }
  else if (canal === 'google_ads' || canal === 'microsoft_ads') { s += 5; motivos.push('veio de busca paga'); }
  const n = Number(funcionarios);
  if (n >= 21) { s += 10; motivos.push('mais de 20 funcionários'); }
  const vistas = new Set(paginas);
  if ([...vistas].some(p => /^\/(contratar|quanto-custa)/.test(p))) { s += 10; motivos.push('viu preço'); }
  if (vistas.size >= 4) { s += 5; motivos.push(`${vistas.size} páginas na visita`); }
  if (Number(valor) >= 5000) { s += 10; motivos.push('pedido acima de R$ 5 mil'); }
  return { score: Math.min(s, 100), motivos };
}
