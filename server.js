import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { notifyNewLead, autoReplyContact, checklistDelivery } from './emails.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

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

app.use((req, res) => {
  const clean = req.path.replace(/\/$/, '') || '/';
  if (clean === '/blog') {
    return res.sendFile(join(__dirname, 'blog', 'index.html'));
  }
  const blogMatch = clean.match(/^\/blog\/(.+)$/);
  if (blogMatch) {
    const file = join(__dirname, 'blog', blogMatch[1] + '.html');
    return res.sendFile(file, err => { if (err) res.sendFile(join(__dirname, 'index.html')); });
  }
  if (clean !== '/') {
    const page = join(__dirname, 'pages', clean.slice(1) + '.html');
    return res.sendFile(page, err => { if (err) res.sendFile(join(__dirname, 'index.html')); });
  }
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Anders Tech running on :${PORT}`));
