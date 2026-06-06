import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import session from 'express-session';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { notifyNewLead, autoReplyContact, checklistDelivery } from './emails.js';
import { router as portalRouter, initPortalDB } from './portal/routes.js';

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

app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'anderstech-dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
}));

const staticOpts = {
  maxAge: '7d',
  setHeaders(res, filePath) {
    if (/\.(js|css|png|jpg|jpeg|webp|avif|svg|woff2?)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    }
  },
};
app.use(express.static(__dirname, { ...staticOpts, index: false }));
app.use('/uploads', express.static(join(__dirname, 'uploads'), staticOpts));

// ── Google Analytics 4 (gtag.js) ──
const GTAG_HTML = '<script async src="https://www.googletagmanager.com/gtag/js?id=G-7XL5XVE6QZ"></script>'
  + '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-7XL5XVE6QZ");</script>';

// ── SSR nav/footer for sub-pages (SEO: Google sees full HTML) ──
const NAV_HTML = '<header class="nav solid" style="position:sticky;top:0;z-index:80"><div class="wrap"><div class="nav-inner">'
  + '<a href="/" class="brand" aria-label="Anders Tech">'
  + '<img src="/assets/logo-horizontal-transparent.png" alt="Anders Tech" style="height:60px;width:auto;object-fit:contain"></a>'
  + '<nav class="nav-links" aria-label="Principal">'
  + '<a href="/#servicos">Serviços</a><a href="/#diferencial">Diferencial</a><a href="/#sobre">Sobre</a><a href="/blog">Conteúdo</a><a href="/#contato">Contato</a></nav>'
  + '<div class="nav-cta"><a href="/portal" class="btn btn-out" style="padding:10px 18px;font-size:13px"><span>Portal</span></a><a href="/#contato" class="btn btn-red"><span>Agendar Conversa</span></a>'
  + '<button class="nav-toggle" id="navToggle" aria-label="Abrir menu" aria-expanded="false">'
  + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg></button>'
  + '</div></div></div></header>'
  + '<nav class="mobile-menu" id="mobileMenu" aria-label="Menu móvel">'
  + '<a href="/#servicos"><i>01</i> Serviços</a>'
  + '<a href="/#diferencial"><i>02</i> Diferencial</a>'
  + '<a href="/#sobre"><i>03</i> Sobre</a>'
  + '<a href="/blog"><i>04</i> Conteúdo</a>'
  + '<a href="/#contato"><i>05</i> Contato</a>'
  + '<a href="/#contato" class="btn btn-red btn-lg"><span>Agendar Conversa</span></a></nav>'
  + '<script>!function(){var t=document.getElementById("navToggle"),m=document.getElementById("mobileMenu");if(t&&m){t.addEventListener("click",function(){var o=m.classList.toggle("open");t.setAttribute("aria-expanded",String(o));document.body.style.overflow=o?"hidden":""});m.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){m.classList.remove("open");t.setAttribute("aria-expanded","false");document.body.style.overflow=""})})}}()</script>';
const FOOTER_HTML = '<footer class="footer"><div class="wrap footer-big">'
  + '<div class="fb-word">anders<b>tech</b></div>'
  + '<div class="fb-tag">GESTÃO COM TECNOLOGIA · QUALIDADE &amp; CONFORMIDADE PARA A INDÚSTRIA</div></div>'
  + '<div class="wrap footer-grid"><div class="footer-brand"><a href="/" class="brand">'
  + '<img src="/assets/logo-nav.png" alt="Anders Tech" class="logo-img" style="width:40px;height:40px;object-fit:contain;filter:brightness(10)">'
  + '<span class="wm" style="color:#fff">anders<b>tech</b></span></a>'
  + '<p style="margin-top:18px">Consultoria de qualidade e conformidade para a indústria. Diagnóstico baseado em dados.</p>'
  + '<div class="cnpj">CNPJ 42.073.716/0001-80</div></div>'
  + '<div class="footer-col"><h4>Navegação</h4><ul>'
  + '<li><a href="/#servicos">Serviços</a></li><li><a href="/#diferencial">Diferencial</a></li><li><a href="/#sobre">Sobre</a></li>'
  + '<li><a href="/blog">Conteúdo</a></li><li><a href="/#contato">Contato</a></li>'
  + '<li><a href="/calculadora-roi-certificacao">Calculadora ROI</a></li><li><a href="/checklist-iso-9001">Checklist ISO 9001</a></li></ul></div>'
  + '<div class="footer-col"><h4>Contato</h4><ul class="footer-contact"><li>Passo Fundo · Erechim · RS</li><li>danielanders76@gmail.com</li></ul>'
  + '<a href="https://andersdev.com.br" target="_blank" rel="noopener" class="footer-cross" style="display:inline-flex;align-items:center;gap:11px;margin-top:12px;padding:13px 18px;border:1px solid rgba(255,255,255,.14);color:#fff;font-size:14px">Software sob medida → andersdev.com.br</a></div></div>'
  + '<div class="wrap footer-bot"><p>© 2026 ANDERS TECH · TODOS OS DIREITOS RESERVADOS</p>'
  + '<div class="fl"><a href="/termos-de-uso">Termos</a><a href="/politica-de-privacidade">Privacidade</a>'
  + '<a href="https://anderstech.net"><b>anderstech.net</b></a><a href="https://andersdev.com.br" target="_blank" rel="noopener">andersdev.com.br</a></div></div></footer>';
const WA_FAB = '<a href="https://wa.me/5554999648368?text=Oi%2C%20vim%20pelo%20site%20da%20Anders%20Tech." target="_blank" rel="noopener" class="wa-fab" aria-label="WhatsApp" style="position:fixed;right:28px;bottom:28px;z-index:85;width:58px;height:58px;background:#25D366;display:grid;place-items:center;color:#fff;box-shadow:0 14px 32px rgba(37,211,102,.42);border-radius:50%">'
  + '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207z"/></svg></a>';

const SKIP_LINK = '<a href="#main-content" class="skip-link">Pular para o conteúdo</a>';

function injectShared(html) {
  return html
    .replace('</head>', GTAG_HTML + '</head>')
    .replace('<body>', '<body>' + SKIP_LINK)
    .replace('<div id="shared-nav"></div>', NAV_HTML)
    .replace('<div id="shared-footer"></div>', FOOTER_HTML + WA_FAB);
}

function sendPage(filePath, res) {
  try {
    const html = readFileSync(filePath, 'utf8');
    res.type('html').send(injectShared(html));
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

async function initDB() {
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      empresa TEXT,
      email TEXT,
      telefone TEXT,
      interesse TEXT,
      mensagem TEXT,
      source TEXT DEFAULT 'site_form',
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      status TEXT DEFAULT 'novo',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lead_events (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER REFERENCES leads(id),
      event_type TEXT NOT NULL,
      payload JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

initDB().catch(console.error);
initPortalDB().catch(console.error);

const rateLimit = new Map();
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
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
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

    console.log(`Lead #${leadId}: ${nome} (${interesse})`);
    res.json({ ok: true, id: leadId });
  } catch (err) {
    console.error('Lead error:', err);
    res.status(500).json({ error: 'Erro ao processar. Tente via WhatsApp.' });
  }
});

// ── Admin auth middleware ──
function adminAuth(req, res, next) {
  const key = process.env.ADMIN_KEY;
  if (!key) return next(); // dev mode: no key required
  const auth = req.headers.authorization;
  if (!auth || auth !== 'Bearer ' + key) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
}

// ── Admin: serve panel ──
app.get('/admin', (req, res) => res.sendFile(join(__dirname, 'admin', 'index.html')));

// ── Admin API routes ──
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  if (!sql) return res.json({ total: 0, this_month: 0, latest: null, by_source: [], by_interesse: [], by_status: [] });
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
  if (!sql) return res.json([]);
  try {
    const { status, interesse, source } = req.query;
    let leads;
    if (status && interesse) {
      leads = await sql`SELECT * FROM leads WHERE status = ${status} AND interesse = ${interesse} ORDER BY created_at DESC`;
    } else if (status) {
      leads = await sql`SELECT * FROM leads WHERE status = ${status} ORDER BY created_at DESC`;
    } else if (interesse) {
      leads = await sql`SELECT * FROM leads WHERE interesse = ${interesse} ORDER BY created_at DESC`;
    } else if (source) {
      leads = await sql`SELECT * FROM leads WHERE source = ${source} ORDER BY created_at DESC`;
    } else {
      leads = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
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
    const updates = [];

    if (status !== undefined) {
      await sql`UPDATE leads SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
      updates.push('status');
      await sql`INSERT INTO lead_events (lead_id, event_type, payload) VALUES (${id}, 'status_change', ${JSON.stringify({ status })}::jsonb)`;
    }
    if (notes !== undefined) {
      await sql`UPDATE leads SET notes = ${notes}, updated_at = NOW() WHERE id = ${id}`;
      updates.push('notes');
      await sql`INSERT INTO lead_events (lead_id, event_type, payload) VALUES (${id}, 'note_update', ${JSON.stringify({ notes: notes.slice(0, 200) })}::jsonb)`;
    }

    if (!updates.length) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    const updated = await sql`SELECT * FROM leads WHERE id = ${id}`;
    res.json(updated[0] || { ok: true });
  } catch (err) {
    console.error('Admin lead update error:', err);
    res.status(500).json({ error: 'Erro ao atualizar lead' });
  }
});

app.use(portalRouter);

app.use((req, res) => {
  const clean = req.path.replace(/\/$/, '') || '/';
  if (clean === '/blog') {
    if (sendPage(join(__dirname, 'blog', 'index.html'), res)) return;
  }
  const blogMatch = clean.match(/^\/blog\/(.+)$/);
  if (blogMatch) {
    if (sendPage(join(__dirname, 'blog', blogMatch[1] + '.html'), res)) return;
    return send404(res);
  }
  if (clean !== '/') {
    if (sendPage(join(__dirname, 'pages', clean.slice(1) + '.html'), res)) return;
    return send404(res);
  }
  sendPage(join(__dirname, 'index.html'), res);
});

app.listen(PORT, () => console.log(`Anders Tech running on :${PORT}`));
