import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import crypto from 'crypto';
import { notifyNewLead, autoReplyContact, checklistDelivery } from './emails.js';
import { router as portalRouter } from './portal/routes.js';
import { eadRouter } from './ead/routes.js';
import { renderTermo, renderIndex as renderGlossarioIndex } from './glossario/render.js';
import { buildSitemap } from './sitemap.js';
import { runMigrations } from './db/migrate.js';
import { injectShared } from './inject.js';
import { registrar as registrarTelemetria, ATIVA as TELEMETRIA_ATIVA } from './telemetry.js';
import { validarContato, primeiroNome, identificacao } from './config/contato.js';
import { renderMunicipio, renderUf, renderHub } from './pbqph/render.js';
import { inicializar as inicializarPbqph, urlsIndexaveis as urlsIndexaveisPbqph } from './pbqph/dados.js';
import { validarCase, casePublicavel, slugValido } from './cases/validate.js';
import { gerarCasePDF } from './cases/pdf.js';
import { renderCase } from './cases/render.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.SENTRY_DSN) {
  import('@sentry/node').then(Sentry => {
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
    app.use(Sentry.expressErrorHandler());
    console.log('Sentry initialized');
  }).catch(() => {});
}

const IS_PROD = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // 'unsafe-inline' em scriptSrc/styleSrc: necessario porque o GA4 (gtag config),
      // o toggle de menu mobile, o CTA sticky e dezenas de paginas estaticas (blog/,
      // pages/, ead/, portal/) usam <script>/<style> inline injetados server-side sem
      // infra de nonce. Migrar para nonce-based CSP exigiria tocar 40+ arquivos HTML
      // (refatoracao grande, fora do escopo deste fix). 'unsafe-eval' NAO esta presente
      // — nenhum script do site usa eval/new Function, entao esse vetor ja esta fechado.
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://plausible.io"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://plausible.io", "https://www.google-analytics.com", "https://*.google-analytics.com", "https://*.analytics.google.com", "https://*.googletagmanager.com"],
      frameSrc: ["'self'", "https://app.heygen.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: IS_PROD ? 'https://anderstech.net' : true,
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.set('trust proxy', 1);

if (IS_PROD && !process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET must be set in production');
  process.exit(1);
}
const PgStore = pgSession(session);
app.use(session({
  store: process.env.DATABASE_URL
    ? new PgStore({ conString: process.env.DATABASE_URL, createTableIfMissing: true })
    : undefined, // sem DATABASE_URL (dev local) cai no MemoryStore
  secret: process.env.SESSION_SECRET || 'anderstech-dev-only',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    httpOnly: true,
    secure: IS_PROD,
  },
}));

// #66: toda pagina respondia 200 com e sem barra final — duas URLs, mesmo
// conteudo. Canonicaliza com 301 antes de qualquer rota.
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.length > 1 && req.path.endsWith('/')) {
    const q = req.originalUrl.slice(req.path.length);
    return res.redirect(301, req.path.replace(/\/+$/, '') + q);
  }
  if (req.method === 'GET' && (req.path === '/index.html' || req.path === '/index.htm')) {
    return res.redirect(301, '/');
  }
  next();
});

// O Sebraetec deixou de existir com esse nome — a plataforma do Sebrae se chama
// Unio. 301 (e nao 302) porque a mudanca e definitiva: transfere para /unio o
// que /sebraetec ja tinha de indexacao e backlink, em vez de comecar do zero.
const ROTAS_RENOMEADAS = new Map([
  ['/sebraetec', '/unio'],
]);

app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const destino = ROTAS_RENOMEADAS.get(req.path.toLowerCase());
  if (destino) {
    const q = req.originalUrl.slice(req.path.length);
    return res.redirect(301, destino + q);
  }
  next();
});

// ── Sitemap dinâmico (antes do static para vencer o arquivo físico, se existir) ──
let sitemapCache = null;
app.get('/sitemap.xml', async (req, res) => {
  if (!sitemapCache) {
    let casesUrls = [];
    if (sql) {
      try {
        const rows = await sql`SELECT slug, atualizado_em FROM cases WHERE publicado = TRUE`;
        casesUrls = rows.map(r => [
          `/cases/${r.slug}`,
          r.atualizado_em ? new Date(r.atualizado_em).toISOString().slice(0, 10) : '2026-08-27',
          'monthly',
          '0.7',
        ]);
      } catch {}
    }
    sitemapCache = buildSitemap(casesUrls, urlsIndexaveisPbqph());
  }
  res.type('application/xml').send(sitemapCache);
});

// ── Healthcheck (#74) — usado pelo Railway e por monitor externo ──
app.get('/healthz', async (req, res) => {
  if (!sql) return res.status(503).json({ status: 'sem banco', db: false });
  try {
    await sql`SELECT 1`;
    res.json({ status: 'ok', db: true });
  } catch (err) {
    console.error('Healthcheck falhou:', err);
    res.status(503).json({ status: 'banco indisponivel', db: false });
  }
});

const staticOpts = {
  maxAge: '7d',
  setHeaders(res, filePath) {
    // Fontes tem URL versionada (?v=N no @font-face), entao podem ser imutaveis:
    // trocar a fonte = mudar a versao, nao esperar cache expirar.
    if (/[\\/]fonts[\\/].*\.woff2?$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(js|css|png|jpg|jpeg|webp|avif|svg|woff2?)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    }
  },
};
// #64: `express.static(__dirname)` publicava o projeto inteiro — /server.js,
// /portal/routes.js, /package-lock.json e /HANDOFF.md respondiam 200 com o
// conteudo real. Agora so os recursos que as paginas realmente carregam.
const ARQUIVOS_PUBLICOS = new Set([
  '/styles.css', '/app.js', '/telemetry-client.js', '/robots.txt', '/favicon.ico',
  '/llms.txt', '/llms-full.txt',
]);
app.use('/assets', express.static(join(__dirname, 'assets'), staticOpts));
app.use('/treinamentos', express.static(join(__dirname, 'treinamentos'), staticOpts));
app.get(/^\/[A-Za-z0-9._-]+\.(css|js|txt|ico|png|webmanifest)$/, (req, res, next) => {
  // Arquivos soltos na raiz: whitelist explicita + os .txt de verificacao de
  // buscador, que precisam ficar acessiveis pelo nome exato que o servico exige.
  if (ARQUIVOS_PUBLICOS.has(req.path) || /^\/[a-z0-9]{32}\.txt$/.test(req.path)) {
    return res.sendFile(join(__dirname, req.path.slice(1)), { maxAge: '7d' }, err => err && next());
  }
  next();
});
// #38: /uploads deixou de ser diretorio estatico — agora e rota com verificacao
// de propriedade em portal/routes.js.

// ── injectShared importado de inject.js (compartilhado com ead/routes.js) ──

// #61: cada requisicao relia o arquivo do disco (readFileSync, sincrono, que
// bloqueia o event loop) e refazia as 6 substituicoes do injectShared. O
// conteudo so muda entre deploys, entao memoriza — mesmo padrao ja usado e
// validado no glossario. O Map morre no restart, que coincide com o deploy.
const pageCache = new Map();

function sendPage(filePath, res, urlPath) {
  try {
    const chave = urlPath || filePath;
    let html = pageCache.get(chave);
    if (!html) {
      html = injectShared(readFileSync(filePath, 'utf8'), urlPath);
      pageCache.set(chave, html);
    }
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
    res.type('html').send(html);
  } catch { return false; }
  return true;
}

function send404(res) {
  try {
    const html = readFileSync(join(__dirname, 'pages', '404.html'), 'utf8');
    res.status(404).type('html').send(injectShared(html));
  } catch {
    res.status(404).send('Página não encontrada');
  }
}

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;


// Migrações versionadas (#16). Falha em produção derruba o processo (#74b): é
// melhor o deploy falhar visivelmente do que subir com o schema errado.
runMigrations(sql).catch(err => {
  console.error('FATAL: falha ao aplicar migrações:', err);
  if (IS_PROD) process.exit(1);
});

// Carrega o PBQP-H na memória no boot. Cai no snapshot versionado se o banco
// não responder: centenas de páginas indexadas não podem virar 500 porque o
// Neon hibernou.
inicializarPbqph(sql).catch(err => console.error('[pbqph] falha ao inicializar:', err));

const STATUS_LEAD = ['novo', 'contatado', 'qualificado', 'proposta', 'ganho', 'perdido'];

// Rótulo legível do prazo de decisão, para o assunto do aviso e o corpo do
// e-mail. O banco guarda a chave; humano lê a frase.
const ROTULO_PRAZO = { agora: 'DECIDE AGORA', '90_dias': 'próximos 90 dias', avaliando: 'só avaliando' };

const rateLimit = new Map();
// #40: o Map crescia sem limite — entrada de IP nunca era removida.
setInterval(() => {
  const limite = Date.now() - 60_000;
  for (const [ip, hits] of rateLimit) {
    const vivos = hits.filter(t => t > limite);
    if (vivos.length) rateLimit.set(ip, vivos); else rateLimit.delete(ip);
  }
}, 5 * 60_000).unref();

function checkRate(ip) {
  const now = Date.now();
  const window = 60_000;
  const max = 5;
  const hits = (rateLimit.get(ip) || []).filter(t => now - t < window);
  if (hits.length >= max) return false;
  hits.push(now);
  rateLimit.set(ip, hits);
  return true;
}

app.post('/api/contact', async (req, res) => {
  // #39: o header e controlado pelo cliente — bastava rotacionar para burlar.
  // req.ip respeita o `trust proxy` configurado acima.
  const ip = req.ip;
  if (!checkRate(ip)) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde um minuto.' });
  }

  const { website, roiData } = req.body;

  // Honeypot: responde ok para o robô não descobrir que foi barrado.
  if (website) return res.json({ ok: true });

  // A validação saiu daqui para config/contato.js para poder ser testada com o
  // payload exato de cada tela. `nome` deixou de ser obrigatorio: era ele que
  // recusava 100% dos leads da calculadora de ROI e do pop-up de saida.
  const v = validarContato(req.body);
  if (!v.ok) {
    return res.status(400).json({ error: v.erro, campo: v.campo, ...(v.sugestao ? { sugestao: v.sugestao } : {}) });
  }
  const d = v.dados;

  let leadId = null;
  try {
    if (sql) {
      const result = await sql`
        INSERT INTO leads (nome, empresa, email, telefone, cargo, prazo, interesse, mensagem, source, landing_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term)
        VALUES (${d.nome}, ${d.empresa}, ${d.email}, ${d.telefone}, ${d.cargo}, ${d.prazo}, ${d.interesse}, ${d.mensagem}, ${d.source}, ${d.landing_page}, ${d.utm_source}, ${d.utm_medium}, ${d.utm_campaign}, ${d.utm_content}, ${d.utm_term})
        RETURNING id
      `;
      leadId = result[0]?.id;
      if (leadId) {
        const eventPayload = roiData
          ? { source: d.source, interesse: d.interesse, landing_page: d.landing_page, roiData }
          : { source: d.source, interesse: d.interesse, landing_page: d.landing_page };
        await sql`INSERT INTO lead_events (lead_id, event_type, payload) VALUES (${leadId}, 'form_submit', ${JSON.stringify(eventPayload)}::jsonb)`;
      }
    }
  } catch (err) {
    console.error('Lead error (gravação):', err);
    return res.status(500).json({ error: 'Erro ao processar. Tente via WhatsApp.' });
  }

  // Envio de e-mail fora do try da gravação. Antes os dois estavam no mesmo
  // bloco: falha do Resend com o lead JÁ salvo devolvia 500, a tela dizia "erro
  // ao enviar" e a pessoa reenviava — lead duplicado no banco.
  if (resend) {
    try {
      await resend.emails.send({
        from: 'Anders Tech <noreply@anderstech.net>',
        to: process.env.NOTIFY_EMAIL || 'danielanders76@gmail.com',
        // Assunto que já diz quem é e qual a urgência: é por ele que o Anders
        // decide o que abrir primeiro, sem entrar no painel.
        subject: `[Anders Tech] Novo lead: ${identificacao(d)}${d.empresa ? ` — ${d.empresa}` : ''}${d.prazo ? ` · ${ROTULO_PRAZO[d.prazo] || d.prazo}` : ''}`,
        html: notifyNewLead({ ...d, mensagem: d.mensagem, leadId, roiData }),
      });

      if (d.email) {
        const isChecklist = d.source === 'lead_magnet_checklist';
        const tratamento = primeiroNome(d.nome);
        await resend.emails.send({
          from: 'Daniel Anders · Anders Tech <noreply@anderstech.net>',
          to: d.email,
          subject: isChecklist
            ? `${tratamento ? tratamento + ', seu' : 'Seu'} Checklist ISO 9001 está aqui`
            : `${tratamento ? tratamento + ', recebemos' : 'Recebemos'} sua mensagem — Anders Tech`,
          html: isChecklist
            ? checklistDelivery({ nome: tratamento })
            : autoReplyContact({ nome: tratamento, interesse: d.interesse }),
        });
      }
    } catch (err) {
      // Lead está salvo. Aviso que falhou é problema de operação, não motivo
      // para dizer à pessoa que a mensagem dela não chegou.
      console.error(`Lead error (e-mail) — lead #${leadId} FOI gravado:`, err);
    }
  } else if (leadId) {
    console.warn(`[lead] RESEND_API_KEY ausente — lead #${leadId} gravado sem aviso ao dono`);
  }

  console.log(`Lead #${leadId} (${d.interesse || 'sem interesse'}) origem=${d.landing_page || '-'} utm=${d.utm_medium || '-'}`);
  res.json({ ok: true, id: leadId });
});

// ── Telemetria (FASE 1) ─────────────────────────────────────────────────────
// Limite proprio: /api/contact aceita 5/min porque lead e evento raro. Evento de
// telemetria e o oposto — uma navegacao normal ja gera varios —, entao usar o
// mesmo limitador cortaria dado legitimo.
const rateTelemetria = new Map();
setInterval(() => {
  const limite = Date.now() - 60_000;
  for (const [ip, hits] of rateTelemetria) {
    const vivos = hits.filter(t => t > limite);
    if (vivos.length) rateTelemetria.set(ip, vivos); else rateTelemetria.delete(ip);
  }
}, 5 * 60_000).unref();

function checkRateTelemetria(ip) {
  const now = Date.now();
  const hits = (rateTelemetria.get(ip) || []).filter(t => now - t < 60_000);
  if (hits.length >= 120) return false;
  hits.push(now);
  rateTelemetria.set(ip, hits);
  return true;
}

app.post('/api/telemetry', async (req, res) => {
  // 204 em tudo que nao e abuso: o cliente usa sendBeacon e nao le a resposta.
  // Falha de telemetria nunca pode virar erro visivel para quem esta navegando.
  if (!TELEMETRIA_ATIVA) return res.status(204).end();
  if (!checkRateTelemetria(req.ip)) return res.status(429).end();
  try {
    await registrarTelemetria(sql, req.body && req.body.events);
    res.status(204).end();
  } catch (err) {
    console.error('Telemetria error:', err);
    res.status(204).end();
  }
});

// ── Admin auth middleware ──
function adminAuth(req, res, next) {
  const key = process.env.ADMIN_KEY;
  if (!key) {
    if (IS_PROD) return res.status(503).json({ error: 'Admin não configurado' });
    return next();
  }
  const auth = req.headers.authorization;
  if (!auth || !timingSafeEqual(auth, 'Bearer ' + key)) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
}

// #47: era implementacao manual, com retorno antecipado que vazava o
// comprimento da chave. Comparar os digests normaliza o tamanho e usa a API
// nativa — a mesma que o webhook ja usa.
function timingSafeEqual(a, b) {
  const da = crypto.createHash('sha256').update(String(a)).digest();
  const db = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(da, db);
}

// ── Admin: serve panel ──
app.get('/admin', (req, res) => res.sendFile(join(__dirname, 'admin', 'index.html')));

// ── Admin API routes ──
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  if (!sql) return res.status(503).json({ error: 'Servico temporariamente indisponivel' });
  try {
    const [totalR, monthR, latestR, sourceR, interesseR, statusR] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM leads`,
      sql`SELECT COUNT(*)::int AS count FROM leads WHERE created_at >= date_trunc('month', NOW())`,
      sql`SELECT created_at FROM leads ORDER BY created_at DESC LIMIT 1`,
      sql`SELECT COALESCE(source, 'direto') AS source, COUNT(*)::int AS count FROM leads GROUP BY source ORDER BY count DESC`,
      sql`SELECT COALESCE(interesse, 'não informado') AS interesse, COUNT(*)::int AS count FROM leads GROUP BY interesse ORDER BY count DESC`,
      sql`SELECT COALESCE(status, 'novo') AS status, COUNT(*)::int AS count FROM leads GROUP BY status ORDER BY count DESC`,
    ]);
    res.json({
      total: totalR[0]?.count || 0,
      this_month: monthR[0]?.count || 0,
      latest: latestR[0]?.created_at || null,
      by_source: sourceR,
      by_interesse: interesseR,
      by_status: statusR,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

app.get('/api/admin/leads', adminAuth, async (req, res) => {
  if (!sql) return res.status(503).json({ error: 'Servico temporariamente indisponivel' });
  try {
    const { status, interesse, source } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    let leads;
    if (status && interesse) {
      leads = await sql`SELECT * FROM leads WHERE status = ${status} AND interesse = ${interesse} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    } else if (status) {
      leads = await sql`SELECT * FROM leads WHERE status = ${status} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    } else if (interesse) {
      leads = await sql`SELECT * FROM leads WHERE interesse = ${interesse} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    } else if (source) {
      leads = await sql`SELECT * FROM leads WHERE source = ${source} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    } else {
      leads = await sql`SELECT * FROM leads ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    }
    res.json(leads);
  } catch (err) {
    console.error('Admin leads error:', err);
    res.status(500).json({ error: 'Erro ao buscar leads' });
  }
});

app.get('/api/admin/leads/:id', adminAuth, async (req, res) => {
  if (!sql) return res.status(404).json({ error: 'Lead não encontrado' });
  try {
    const id = parseInt(req.params.id, 10);
    const [leads, events] = await Promise.all([
      sql`SELECT * FROM leads WHERE id = ${id}`,
      sql`SELECT * FROM lead_events WHERE lead_id = ${id} ORDER BY created_at DESC`,
    ]);
    if (!leads.length) return res.status(404).json({ error: 'Lead não encontrado' });
    res.json({ ...leads[0], events });
  } catch (err) {
    console.error('Admin lead detail error:', err);
    res.status(500).json({ error: 'Erro ao buscar lead' });
  }
});

app.patch('/api/admin/leads/:id', adminAuth, async (req, res) => {
  if (!sql) return res.status(404).json({ error: 'Banco de dados não configurado' });
  try {
    const id = parseInt(req.params.id, 10);
    const { status, notes } = req.body;

    if (status === undefined && notes === undefined) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    // #31: `notes: null` executava null.slice() e virava 500; `status` aceitava
    // qualquer string, poluindo o GROUP BY de /api/admin/stats.
    if (notes !== undefined && typeof notes !== 'string') {
      return res.status(400).json({ error: 'notes deve ser texto' });
    }
    if (status !== undefined && !STATUS_LEAD.includes(status)) {
      return res.status(400).json({ error: `status inválido. Use: ${STATUS_LEAD.join(', ')}` });
    }

    // UPDATE + INSERT (evento de auditoria) para cada campo alterado, atomicos:
    // se qualquer etapa falhar, nenhuma delas fica persistida (evita status
    // atualizado sem o evento correspondente, ou vice-versa).
    await sql.transaction((txn) => {
      const queries = [];
      if (status !== undefined) {
        queries.push(txn`UPDATE leads SET status = ${status}, updated_at = NOW() WHERE id = ${id}`);
        queries.push(txn`INSERT INTO lead_events (lead_id, event_type, payload) VALUES (${id}, 'status_change', ${JSON.stringify({ status })}::jsonb)`);
      }
      if (notes !== undefined) {
        queries.push(txn`UPDATE leads SET notes = ${notes}, updated_at = NOW() WHERE id = ${id}`);
        queries.push(txn`INSERT INTO lead_events (lead_id, event_type, payload) VALUES (${id}, 'note_update', ${JSON.stringify({ notes: notes.slice(0, 200) })}::jsonb)`);
      }
      return queries;
    });

    const updated = await sql`SELECT * FROM leads WHERE id = ${id}`;
    res.json(updated[0] || { ok: true });
  } catch (err) {
    console.error('Admin lead update error:', err);
    res.status(500).json({ error: 'Erro ao atualizar lead' });
  }
});

// ── Artifact links (FASE 4) — /r/:codigo ──
// Bots de preview (WhatsApp, Telegram, Facebook, LinkedIn) fazem fetch de toda
// URL compartilhada. Sem filtro, cada proposta enviada no zap geraria scan
// fantasma. O regex cobre os UAs conhecidos; bots desconhecidos passam (falso
// negativo é preferível a falso positivo que esconderia um scan real).
const BOT_PREVIEW_RE = /whatsapp|telegrambot|facebookexternalhit|facebot|linkedinbot|slackbot|twitterbot|discordbot|googlebot|bingbot/i;

const ARTIFACT_TIPOS = new Set(['p', 'c', 'r', 'e', 'a']);
const ARTIFACT_TIPO_NOME = { p: 'proposta', c: 'case', r: 'relatorio-auditoria', e: 'certificado-ead', a: 'apresentacao' };
const ARTIFACT_NOME_TIPO = Object.fromEntries(Object.entries(ARTIFACT_TIPO_NOME).map(([k, v]) => [v, k]));
const ARTIFACT_ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';
const ARTIFACT_CODIGO_RE = /^[pcrea][abcdefghjkmnpqrstuvwxyz23456789]{7}$/;

function gerarCodigo(tipo) {
  let codigo = tipo;
  for (let i = 0; i < 7; i++) {
    codigo += ARTIFACT_ALFABETO[crypto.randomInt(ARTIFACT_ALFABETO.length)];
  }
  return codigo;
}

app.get('/r/:codigo', async (req, res) => {
  const codigo = String(req.params.codigo || '').toLowerCase();
  if (!ARTIFACT_CODIGO_RE.test(codigo)) {
    return res.redirect(302, 'https://anderstech.net');
  }

  if (!sql) return res.redirect(302, 'https://anderstech.net');

  try {
    const rows = await sql`SELECT tipo, destino, label FROM artifact_links WHERE codigo = ${codigo}`;
    if (!rows.length) {
      return res.redirect(302, 'https://anderstech.net');
    }

    const { tipo, destino, label } = rows[0];
    const tipoNome = ARTIFACT_TIPO_NOME[tipo] || tipo;
    const ua = req.headers['user-agent'] || '';
    const isBot = BOT_PREVIEW_RE.test(ua);

    if (TELEMETRIA_ATIVA && !isBot) {
      registrarTelemetria(sql, [{
        event: 'artifact_scan',
        anonymous_id: null,
        props: { codigo, tipo: tipoNome, label: label || '' },
        utm_source: 'anderstech',
        utm_medium: 'artifact',
        utm_campaign: `${tipoNome}-${codigo}`,
      }]).catch(err => {
        console.error('[artifact_scan] falha ao registrar:', err.message);
      });
    }
    if (isBot) {
      console.log(`[artifact_scan] bot preview filtrado: ${ua.slice(0, 80)} codigo=${codigo}`);
    }

    const sep = destino.includes('?') ? '&' : '?';
    const redir = `${destino}${sep}utm_source=anderstech&utm_medium=artifact&utm_campaign=${encodeURIComponent(tipoNome)}-${codigo}`;
    res.redirect(302, redir);
  } catch (err) {
    console.error('[/r/:codigo] erro:', err.message);
    res.redirect(302, 'https://anderstech.net');
  }
});

app.post('/api/admin/artifacts', adminAuth, async (req, res) => {
  const { tipo, destino, label, criado_por } = req.body || {};
  if (!tipo || !destino) {
    return res.status(400).json({ error: 'tipo e destino são obrigatórios' });
  }

  const tipoChar = ARTIFACT_NOME_TIPO[tipo];
  if (!tipoChar) {
    return res.status(400).json({
      error: `tipo inválido: ${tipo}`,
      tipos_validos: Object.keys(ARTIFACT_NOME_TIPO),
    });
  }

  if (!sql) return res.status(503).json({ error: 'Banco indisponível' });

  try {
    let codigo;
    let tentativas = 0;
    while (tentativas < 5) {
      codigo = gerarCodigo(tipoChar);
      const existe = await sql`SELECT 1 FROM artifact_links WHERE codigo = ${codigo}`;
      if (!existe.length) break;
      tentativas++;
    }
    if (tentativas >= 5) {
      return res.status(500).json({ error: 'Falha ao gerar código único' });
    }

    await sql`
      INSERT INTO artifact_links (codigo, tipo, destino, label, criado_por)
      VALUES (${codigo}, ${tipoChar}, ${destino}, ${label || null}, ${criado_por || null})
    `;

    res.status(201).json({
      codigo,
      tipo: tipo,
      url_completa: `https://anderstech.net/r/${codigo}`,
      url_qr: `https://anderstech.net/r/${codigo}`,
    });
  } catch (err) {
    console.error('[POST /api/admin/artifacts] erro:', err.message);
    res.status(500).json({ error: 'Erro ao criar artefato' });
  }
});

// ── Cases (FASE 4) — gerador de case de 1 página ──
app.post('/api/admin/cases', adminAuth, async (req, res) => {
  const body = req.body || {};
  const { slug, cliente, segmento, servico, problema, solucao, resultado,
    resultado_fonte, depoimento_texto, depoimento_autor, depoimento_cargo,
    depoimento_fonte, metricas, publicado, criado_por } = body;

  if (!slug || !slugValido(slug)) {
    return res.status(400).json({ error: 'slug inválido (a-z, 0-9, hifens, 3-80 chars)' });
  }

  const erros = validarCase(body);
  if (erros.length) return res.status(400).json({ error: 'Validação falhou', erros });

  if (!sql) return res.status(503).json({ error: 'Banco indisponível' });

  try {
    const existe = await sql`SELECT 1 FROM cases WHERE slug = ${slug}`;
    if (existe.length) return res.status(409).json({ error: `slug '${slug}' já existe` });

    // cria artifact code automaticamente
    const tipoChar = 'c';
    let codigo;
    let tentativas = 0;
    while (tentativas < 5) {
      codigo = gerarCodigo(tipoChar);
      const dup = await sql`SELECT 1 FROM artifact_links WHERE codigo = ${codigo}`;
      if (!dup.length) break;
      tentativas++;
    }
    if (tentativas >= 5) {
      return res.status(500).json({ error: 'Falha ao gerar código de artefato' });
    }

    const destino = `${process.env.APP_URL || 'https://anderstech.net'}/cases/${slug}`;
    await sql`INSERT INTO artifact_links (codigo, tipo, destino, label, criado_por)
      VALUES (${codigo}, ${tipoChar}, ${destino}, ${`Case: ${cliente}`}, ${criado_por || null})`;

    await sql`INSERT INTO cases (slug, publicado, cliente, segmento, servico, problema, solucao,
        resultado, resultado_fonte, depoimento_texto, depoimento_autor, depoimento_cargo,
        depoimento_fonte, metricas, artifact_codigo)
      VALUES (${slug}, ${publicado === true}, ${cliente}, ${segmento}, ${servico},
        ${problema}, ${solucao}, ${resultado}, ${resultado_fonte},
        ${depoimento_texto || null}, ${depoimento_autor || null},
        ${depoimento_cargo || null}, ${depoimento_fonte || null},
        ${JSON.stringify(metricas || [])}, ${codigo})`;

    sitemapCache = null;

    res.status(201).json({
      slug,
      publicado: publicado === true,
      artifact_codigo: codigo,
      url_case: `${process.env.APP_URL || 'https://anderstech.net'}/cases/${slug}`,
      url_pdf: `${process.env.APP_URL || 'https://anderstech.net'}/api/admin/cases/${slug}/pdf`,
      url_artefato: `${process.env.APP_URL || 'https://anderstech.net'}/r/${codigo}`,
    });
  } catch (err) {
    console.error('[POST /api/admin/cases] erro:', err.message);
    res.status(500).json({ error: 'Erro ao criar case' });
  }
});

app.get('/api/admin/cases', adminAuth, async (req, res) => {
  if (!sql) return res.status(503).json({ error: 'Banco indisponível' });
  try {
    const cases = await sql`SELECT * FROM cases ORDER BY criado_em DESC`;
    res.json(cases);
  } catch (err) {
    console.error('[GET /api/admin/cases] erro:', err.message);
    res.status(500).json({ error: 'Erro ao buscar cases' });
  }
});

app.get('/api/admin/cases/:slug/pdf', adminAuth, async (req, res) => {
  if (!sql) return res.status(503).json({ error: 'Banco indisponível' });
  const slug = String(req.params.slug || '');
  if (!slugValido(slug)) return res.status(400).json({ error: 'slug inválido' });

  try {
    const rows = await sql`SELECT * FROM cases WHERE slug = ${slug}`;
    if (!rows.length) return res.status(404).json({ error: 'Case não encontrado' });

    const c = rows[0];
    if (typeof c.metricas === 'string') c.metricas = JSON.parse(c.metricas);

    const codigo = c.artifact_codigo || slug;
    const doc = gerarCasePDF(c, codigo);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="case-${slug}.pdf"`,
    });
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error('[GET /api/admin/cases/:slug/pdf] erro:', err.message);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});

// /cases/<slug> — versão web pública do case (só publicados)
const casesHtmlCache = new Map();
app.get('/cases/:slug', async (req, res) => {
  const slug = String(req.params.slug || '');
  if (!slugValido(slug)) return send404(res);

  let html = casesHtmlCache.get(slug);
  if (html) return res.type('html').send(html);

  if (!sql) return send404(res);
  try {
    const rows = await sql`SELECT * FROM cases WHERE slug = ${slug} AND publicado = TRUE`;
    if (!rows.length) return send404(res);

    const c = rows[0];
    if (typeof c.metricas === 'string') c.metricas = JSON.parse(c.metricas);

    if (!casePublicavel(c)) return send404(res);

    html = injectShared(renderCase(c), `/cases/${slug}`);
    casesHtmlCache.set(slug, html);

    if (TELEMETRIA_ATIVA) {
      registrarTelemetria(sql, [{
        event: 'case_view',
        anonymous_id: null,
        props: { slug },
      }]).catch(() => {});
    }

    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
    res.type('html').send(html);
  } catch (err) {
    console.error('[/cases/:slug] erro:', err.message);
    send404(res);
  }
});

app.use(portalRouter);
app.use(eadRouter);

// ── Glossário da Qualidade (SSR com cache em memória — conteúdo estático) ──
const glossarioCache = new Map();
app.get('/glossario', (req, res) => {
  let html = glossarioCache.get('__index__');
  if (!html) {
    html = injectShared(renderGlossarioIndex(), '/glossario');
    glossarioCache.set('__index__', html);
  }
  res.type('html').send(html);
});
app.get('/glossario/:slug', (req, res) => {
  const slug = String(req.params.slug || '');
  if (!/^[a-z0-9-]+$/.test(slug)) return send404(res);
  let html = glossarioCache.get(slug);
  if (!html) {
    const page = renderTermo(slug);
    if (!page) return send404(res);
    html = injectShared(page, '/glossario/' + slug);
    glossarioCache.set(slug, html);
  }
  res.type('html').send(html);
});

// ── PBQP-H por município (SSR com cache em memória) ──────────────────────────
// Os dados só mudam quando scripts/carrega-siac.mjs roda, então o cache morre
// no restart, igual ao glossário. Município abaixo do gate ainda responde, mas
// com noindex — quem chegou por um link vê o dado; o Google não indexa.
const pbqphCache = new Map();
function servePbqph(res, chave, gerar, rota) {
  let html = pbqphCache.get(chave);
  if (!html) {
    const page = gerar();
    if (!page) return send404(res);
    html = injectShared(page, rota);
    pbqphCache.set(chave, html);
  }
  res.type('html').send(html);
}

app.get('/pbqp-h/construtoras', (req, res) => {
  servePbqph(res, '__hub__', () => renderHub(), '/pbqp-h/construtoras');
});

app.get('/pbqp-h/construtoras/:uf', (req, res) => {
  const uf = String(req.params.uf || '').toLowerCase();
  if (!/^[a-z]{2}$/.test(uf)) return send404(res);
  servePbqph(res, `uf:${uf}`, () => renderUf(uf), `/pbqp-h/construtoras/${uf}`);
});

app.get('/pbqp-h/construtoras/:uf/:municipio', (req, res) => {
  const uf = String(req.params.uf || '').toLowerCase();
  const municipio = String(req.params.municipio || '').toLowerCase();
  if (!/^[a-z]{2}$/.test(uf) || !/^[a-z0-9-]+$/.test(municipio)) return send404(res);
  servePbqph(res, `m:${uf}/${municipio}`, () => renderMunicipio(uf, municipio), `/pbqp-h/construtoras/${uf}/${municipio}`);
});

function safePath(base, userInput) {
  const resolved = join(base, userInput);
  if (!resolved.startsWith(base)) return null;
  return resolved;
}

app.use((req, res) => {
  const clean = req.path.replace(/\/$/, '') || '/';
  if (/[<>"'`]|\.\./.test(clean)) return send404(res);
  if (clean === '/blog') {
    if (sendPage(join(__dirname, 'blog', 'index.html'), res, '/blog')) return;
  }
  const blogMatch = clean.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const file = safePath(join(__dirname, 'blog'), blogMatch[1] + '.html');
    if (file && sendPage(file, res, clean)) return;
    return send404(res);
  }
  if (clean !== '/') {
    const slug = clean.slice(1);
    if (!/^[a-z0-9-]+$/.test(slug)) return send404(res);
    const file = safePath(join(__dirname, 'pages'), slug + '.html');
    if (file && sendPage(file, res, clean)) return;
    return send404(res);
  }
  sendPage(join(__dirname, 'index.html'), res);
});

app.listen(PORT, () => console.log(`Anders Tech running on :${PORT}`));
