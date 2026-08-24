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

// ── Sitemap dinâmico (antes do static para vencer o arquivo físico, se existir) ──
let sitemapCache = null;
app.get('/sitemap.xml', (req, res) => {
  if (!sitemapCache) sitemapCache = buildSitemap();
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
    if (/\.(js|css|png|jpg|jpeg|webp|avif|svg|woff2?)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    }
  },
};
// #64: `express.static(__dirname)` publicava o projeto inteiro — /server.js,
// /portal/routes.js, /package-lock.json e /HANDOFF.md respondiam 200 com o
// conteudo real. Agora so os recursos que as paginas realmente carregam.
const ARQUIVOS_PUBLICOS = new Set([
  '/styles.css', '/app.js', '/robots.txt', '/favicon.ico',
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

const STATUS_LEAD = ['novo', 'contatado', 'qualificado', 'proposta', 'ganho', 'perdido'];

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

  const { nome, empresa, email, telefone, interesse, mensagem, source, utm_source, utm_medium, utm_campaign, website, roiData } = req.body;

  if (website) return res.json({ ok: true });

  if (!nome || (!email && !telefone)) {
    return res.status(400).json({ error: 'Nome e ao menos email ou telefone são obrigatórios.' });
  }

  try {
    let leadId = null;
    if (sql) {
      const result = await sql`
        INSERT INTO leads (nome, empresa, email, telefone, interesse, mensagem, source, utm_source, utm_medium, utm_campaign)
        VALUES (${nome}, ${empresa || null}, ${email || null}, ${telefone || null}, ${interesse || null}, ${mensagem || null}, ${source || 'site_form'}, ${utm_source || null}, ${utm_medium || null}, ${utm_campaign || null})
        RETURNING id
      `;
      leadId = result[0]?.id;
      if (leadId) {
        const eventPayload = roiData ? { source, interesse, roiData } : { source, interesse };
        await sql`INSERT INTO lead_events (lead_id, event_type, payload) VALUES (${leadId}, 'form_submit', ${JSON.stringify(eventPayload)}::jsonb)`;
      }
    }

    if (resend) {
      await resend.emails.send({
        from: 'Anders Tech <noreply@anderstech.net>',
        to: process.env.NOTIFY_EMAIL || 'danielanders76@gmail.com',
        subject: `[Anders Tech] Novo lead: ${nome}${empresa ? ` — ${empresa}` : ''}`,
        html: notifyNewLead({ nome, empresa, email, telefone, interesse, mensagem, source, leadId, roiData }),
      });

      if (email) {
        const isChecklist = source === 'lead_magnet_checklist';
        await resend.emails.send({
          from: 'Daniel Anders · Anders Tech <noreply@anderstech.net>',
          to: email,
          subject: isChecklist
            ? `${nome.split(' ')[0]}, seu Checklist ISO 9001 está aqui`
            : `${nome.split(' ')[0]}, recebemos sua mensagem — Anders Tech`,
          html: isChecklist
            ? checklistDelivery({ nome })
            : autoReplyContact({ nome, interesse }),
        });
      }
    }

    console.log(`Lead #${leadId} (${interesse})`);
    res.json({ ok: true, id: leadId });
  } catch (err) {
    console.error('Lead error:', err);
    res.status(500).json({ error: 'Erro ao processar. Tente via WhatsApp.' });
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
