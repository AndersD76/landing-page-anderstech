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
    CREATE TABLE IF NOT EXISTS leads_gestao (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      empresa TEXT,
      email TEXT,
      telefone TEXT,
      interesse TEXT,
      mensagem TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

initDB().catch(console.error);

app.post('/api/contact', async (req, res) => {
  const { nome, empresa, email, telefone, interesse, mensagem } = req.body;

  if (!nome || (!email && !telefone)) {
    return res.status(400).json({ error: 'Nome e ao menos email ou telefone sao obrigatorios.' });
  }

  try {
    if (sql) {
      await sql`
        INSERT INTO leads_gestao (nome, empresa, email, telefone, interesse, mensagem)
        VALUES (${nome}, ${empresa}, ${email}, ${telefone}, ${interesse}, ${mensagem})
      `;
    }

    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.NOTIFY_EMAIL || 'danielanders76@gmail.com',
        subject: `[Anders Tech Gestao] Novo lead: ${nome}`,
        text: [
          `Nome: ${nome}`,
          `Empresa: ${empresa || '-'}`,
          `Email: ${email || '-'}`,
          `Telefone: ${telefone || '-'}`,
          `Interesse: ${interesse || '-'}`,
          `Mensagem: ${mensagem || '-'}`,
        ].join('\n'),
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Lead error:', err);
    res.status(500).json({ error: 'Erro ao processar. Tente via WhatsApp.' });
  }
});

app.use((req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Anders Tech running on :${PORT}`));
