import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

const transporter = process.env.SMTP_USER
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

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

  const { nome, empresa, email, telefone, interesse, mensagem, source, utm_source, utm_medium, utm_campaign, website } = req.body;

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
        await sql`INSERT INTO lead_events (lead_id, event_type, payload) VALUES (${leadId}, 'form_submit', ${JSON.stringify({ source, interesse })}::jsonb)`;
      }
    }

    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.NOTIFY_EMAIL || 'danielanders76@gmail.com',
        subject: `[Anders Tech] Novo lead: ${nome}${empresa ? ` — ${empresa}` : ''}`,
        text: [
          `NOVO LEAD #${leadId || '—'}`,
          `━━━━━━━━━━━━━━━━━━━━━━`,
          `Nome: ${nome}`,
          `Empresa: ${empresa || '—'}`,
          `Email: ${email || '—'}`,
          `Telefone: ${telefone || '—'}`,
          `Interesse: ${interesse || '—'}`,
          `Fonte: ${source || 'site_form'}`,
          `UTM: ${utm_source || '—'} / ${utm_medium || '—'} / ${utm_campaign || '—'}`,
          ``,
          `Mensagem:`,
          mensagem || '(sem mensagem)',
        ].join('\n'),
      });
    }

    console.log(`Lead #${leadId}: ${nome} (${interesse})`);
    res.json({ ok: true, id: leadId });
  } catch (err) {
    console.error('Lead error:', err);
    res.status(500).json({ error: 'Erro ao processar. Tente via WhatsApp.' });
  }
});

app.use((req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Anders Tech running on :${PORT}`));
