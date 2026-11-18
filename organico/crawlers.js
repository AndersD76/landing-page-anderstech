// ── Monitor de crawlers (busca e IA) e de erros 5xx ──────────────────────────
// Conta acessos por robô e página (user-agent) e valida o IP contra as faixas
// que o provedor publica (Google, Bing, OpenAI, Perplexity — URLs conferidas em
// 18/11/2026). Agrega em memória e grava a cada 5 min em seo_crawlers.

const BOTS = [
  ['Googlebot', /Googlebot/i, 'google'], ['Bingbot', /bingbot/i, 'bing'],
  ['OAI-SearchBot', /OAI-SearchBot/i, 'openai-search'], ['ChatGPT-User', /ChatGPT-User/i, 'openai-user'], ['GPTBot', /GPTBot/i, 'openai-gpt'],
  ['Claude-SearchBot', /Claude-SearchBot/i, null], ['Claude-User', /Claude-User/i, null], ['ClaudeBot', /ClaudeBot/i, null],
  ['PerplexityBot', /PerplexityBot/i, 'perplexity'], ['Perplexity-User', /Perplexity-User/i, null],
  ['Applebot', /Applebot/i, null], ['DuckDuckBot', /DuckDuckBot/i, null], ['Amazonbot', /Amazonbot/i, null], ['YandexBot', /YandexBot/i, null],
];
const FAIXAS_URL = {
  google: 'https://developers.google.com/static/search/apis/ipranges/googlebot.json',
  bing: 'https://www.bing.com/toolbox/bingbot.json',
  'openai-search': 'https://openai.com/searchbot.json',
  'openai-user': 'https://openai.com/chatgpt-user.json',
  'openai-gpt': 'https://openai.com/gptbot.json',
  perplexity: 'https://www.perplexity.ai/perplexitybot.json',
};

export function identificarBot(ua) {
  for (const [nome, re, faixa] of BOTS) if (re.test(ua || '')) return { nome, faixa };
  return null;
}

// ── CIDR (IPv4 e IPv6) ──
function ipParaBigInt(ip) {
  if (ip.includes('.') && !ip.includes(':')) return { v: 4, n: ip.split('.').reduce((a, o) => (a << 8n) + BigInt(Number(o)), 0n) };
  let [cab, cauda] = ip.split('::');
  const a = cab ? cab.split(':') : [], b = cauda !== undefined ? (cauda ? cauda.split(':') : []) : [];
  const meio = Array(8 - a.length - b.length).fill('0');
  const partes = cauda !== undefined ? [...a, ...meio, ...b] : a;
  return { v: 6, n: partes.reduce((acc, h) => (acc << 16n) + BigInt(parseInt(h || '0', 16)), 0n) };
}
export function ipNaFaixa(ip, cidr) {
  try {
    const limpo = String(ip).replace(/^::ffff:/, '');
    const [rede, bits] = cidr.split('/');
    const a = ipParaBigInt(limpo), b = ipParaBigInt(rede);
    if (a.v !== b.v) return false;
    const total = a.v === 4 ? 32n : 128n;
    const m = BigInt(Number(bits));
    return (a.n >> (total - m)) === (b.n >> (total - m));
  } catch { return false; }
}

const faixas = new Map();
export async function carregarFaixas({ fetchImpl = fetch } = {}) {
  for (const [k, url] of Object.entries(FAIXAS_URL)) {
    try {
      const j = await (await fetchImpl(url)).json();
      faixas.set(k, (j.prefixes || []).map(p => p.ipv4Prefix || p.ipv6Prefix).filter(Boolean));
    } catch { /* provedor fora do ar: mantém o que tinha */ }
  }
  return faixas.size;
}
export function validarIp(faixa, ip) {
  const lista = faixas.get(faixa);
  return !!(lista && lista.some(c => ipNaFaixa(ip, c)));
}

// ── Agregação ──
const contagem = new Map();      // `${dia}|${bot}|${pagina}|${validado}` → hits
const erros5xx = new Map();      // `${dia}|${pagina}` → n
const hoje = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);

export function middleware(req, res, next) {
  if (req.method !== 'GET') return next();
  const bot = identificarBot(req.headers['user-agent']);
  const pagina = req.path.slice(0, 200);
  if (bot && !/^\/(assets|api|admin|portal)\//.test(pagina)) {
    const validado = bot.faixa ? validarIp(bot.faixa, req.ip) : false;
    const k = `${hoje()}|${bot.nome}|${pagina}|${validado}`;
    contagem.set(k, (contagem.get(k) || 0) + 1);
  }
  res.on('finish', () => {
    if (res.statusCode >= 500) { const k = `${hoje()}|${pagina}`; erros5xx.set(k, (erros5xx.get(k) || 0) + 1); }
  });
  next();
}

export function errosRecentes() { return [...erros5xx.entries()].map(([k, n]) => { const [d, p] = k.split('|'); return { dia: d, pagina: p, n }; }); }

export async function gravar(sql) {
  if (!sql || !contagem.size) return 0;
  const linhas = [...contagem.entries()].map(([k, h]) => { const [d, b, p, v] = k.split('|'); return { d, b, p, v: v === 'true', h }; });
  contagem.clear();
  await sql`
    INSERT INTO seo_crawlers (dia, bot, pagina, validado, hits)
    SELECT x.d::date, x.b, x.p, x.v, x.h FROM jsonb_to_recordset(${JSON.stringify(linhas)}::jsonb) AS x(d TEXT, b TEXT, p TEXT, v BOOLEAN, h INT)
    ON CONFLICT (dia, bot, pagina, validado) DO UPDATE SET hits = seo_crawlers.hits + EXCLUDED.hits`;
  return linhas.length;
}
