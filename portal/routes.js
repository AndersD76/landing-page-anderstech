import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import PDFDocument from 'pdfkit';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createReadStream } from 'fs';
import { portalWelcome } from '../emails.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ── Multer config ──
const upload = multer({ dest: join(projectRoot, 'uploads') });

// ── Router ──
const router = Router();

// ═══════════════════════════════════════════════════════════════════
// Database initialization
// ═══════════════════════════════════════════════════════════════════

async function initPortalDB() {
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS portal_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      nome TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cliente',
      empresa TEXT,
      telefone TEXT,
      cnpj TEXT,
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS contracts (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES portal_users(id),
      titulo TEXT NOT NULL,
      arquivo_path TEXT,
      valor_total NUMERIC(12,2),
      horas_contratadas NUMERIC(8,2),
      data_inicio DATE,
      data_fim DATE,
      status TEXT DEFAULT 'ativo',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES portal_users(id),
      contract_id INTEGER REFERENCES contracts(id),
      data DATE NOT NULL,
      tipo TEXT NOT NULL,
      descricao TEXT,
      horas NUMERIC(6,2) NOT NULL,
      valor_hora NUMERIC(8,2),
      observacoes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES portal_users(id),
      contract_id INTEGER REFERENCES contracts(id),
      valor NUMERIC(12,2) NOT NULL,
      data DATE NOT NULL,
      metodo TEXT,
      comprovante_path TEXT,
      observacoes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS atas (
      id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES events(id),
      client_id INTEGER REFERENCES portal_users(id),
      titulo TEXT NOT NULL,
      participantes TEXT,
      pauta TEXT,
      discussao TEXT,
      decisoes TEXT,
      proximos_passos TEXT,
      data DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log('Portal DB tables initialized');
}

// ═══════════════════════════════════════════════════════════════════
// Auth middleware
// ═══════════════════════════════════════════════════════════════════

function requireAuth(req, res, next) {
  if (!req.session?.portalUser) {
    // API requests get JSON error, page requests redirect
    if (req.path.startsWith('/portal/api/')) {
      return res.status(401).json({ error: 'Nao autenticado' });
    }
    return res.redirect('/portal');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session?.portalUser) {
    if (req.path.startsWith('/portal/api/')) {
      return res.status(401).json({ error: 'Nao autenticado' });
    }
    return res.redirect('/portal');
  }
  if (req.session.portalUser.role !== 'admin') {
    if (req.path.startsWith('/portal/api/')) {
      return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }
    return res.redirect('/portal/cliente');
  }
  next();
}

// ═══════════════════════════════════════════════════════════════════
// Auth routes
// ═══════════════════════════════════════════════════════════════════

router.post('/portal/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha sao obrigatorios' });
  }
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });

  try {
    const users = await sql`
      SELECT id, email, senha_hash, nome, role, empresa, ativo
      FROM portal_users WHERE email = ${email.toLowerCase().trim()}
    `;
    if (!users.length) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = users[0];
    if (!user.ativo) {
      return res.status(403).json({ error: 'Conta desativada. Entre em contato com o administrador.' });
    }

    const valid = await bcrypt.compare(senha, user.senha_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    req.session.portalUser = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      empresa: user.empresa,
    };

    res.json({
      ok: true,
      user: req.session.portalUser,
      redirect: user.role === 'admin' ? '/portal/admin' : '/portal/cliente',
    });
  } catch (err) {
    console.error('Portal login error:', err);
    res.status(500).json({ error: 'Erro ao autenticar' });
  }
});

router.post('/portal/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// ═══════════════════════════════════════════════════════════════════
// Admin API — Clients
// ═══════════════════════════════════════════════════════════════════

router.get('/portal/api/clients', requireAdmin, async (req, res) => {
  if (!sql) return res.json([]);
  try {
    const clients = await sql`
      SELECT id, email, nome, role, empresa, telefone, cnpj, ativo, created_at
      FROM portal_users WHERE role = 'cliente' ORDER BY created_at DESC
    `;
    res.json(clients);
  } catch (err) {
    console.error('Portal clients list error:', err);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

router.post('/portal/api/clients', requireAdmin, async (req, res) => {
  const { email, nome, empresa, telefone, cnpj } = req.body;
  if (!email || !nome) {
    return res.status(400).json({ error: 'Email e nome sao obrigatorios' });
  }
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });

  try {
    // Generate random password
    const rawPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase();
    const hash = await bcrypt.hash(rawPassword, 10);

    const result = await sql`
      INSERT INTO portal_users (email, senha_hash, nome, role, empresa, telefone, cnpj)
      VALUES (${email.toLowerCase().trim()}, ${hash}, ${nome}, 'cliente', ${empresa || null}, ${telefone || null}, ${cnpj || null})
      RETURNING id, email, nome, empresa, telefone, cnpj, ativo, created_at
    `;

    if (resend) {
      try {
        await resend.emails.send({
          from: 'Anders Tech <noreply@anderstech.net>',
          to: email.toLowerCase().trim(),
          subject: `${nome.split(' ')[0]}, bem-vindo ao Portal Anders Tech`,
          html: portalWelcome({ nome, email: email.toLowerCase().trim(), senhaTemporaria: rawPassword }),
        });
      } catch (emailErr) {
        console.error('Welcome email error:', emailErr);
      }
    }

    res.json({
      ...result[0],
      senha_temporaria: rawPassword,
    });
  } catch (err) {
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return res.status(409).json({ error: 'Email ja cadastrado' });
    }
    console.error('Portal client create error:', err);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

router.get('/portal/api/clients/:id', requireAdmin, async (req, res) => {
  if (!sql) return res.status(404).json({ error: 'Cliente nao encontrado' });
  try {
    const id = parseInt(req.params.id, 10);
    const [clients, contracts, eventsAgg, paymentsAgg] = await Promise.all([
      sql`SELECT id, email, nome, role, empresa, telefone, cnpj, ativo, created_at FROM portal_users WHERE id = ${id}`,
      sql`SELECT * FROM contracts WHERE client_id = ${id} ORDER BY created_at DESC`,
      sql`SELECT COUNT(*)::int AS total_events, COALESCE(SUM(horas), 0)::numeric AS total_horas FROM events WHERE client_id = ${id}`,
      sql`SELECT COALESCE(SUM(valor), 0)::numeric AS total_pago FROM payments WHERE client_id = ${id}`,
    ]);

    if (!clients.length) return res.status(404).json({ error: 'Cliente nao encontrado' });

    res.json({
      ...clients[0],
      contracts,
      summary: {
        total_events: eventsAgg[0]?.total_events || 0,
        total_horas: Number(eventsAgg[0]?.total_horas || 0),
        total_pago: Number(paymentsAgg[0]?.total_pago || 0),
      },
    });
  } catch (err) {
    console.error('Portal client detail error:', err);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

router.put('/portal/api/clients/:id', requireAdmin, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });
  try {
    const id = parseInt(req.params.id, 10);
    const { nome, empresa, telefone, cnpj, ativo } = req.body;

    const result = await sql`
      UPDATE portal_users
      SET
        nome = COALESCE(${nome ?? null}, nome),
        empresa = COALESCE(${empresa ?? null}, empresa),
        telefone = COALESCE(${telefone ?? null}, telefone),
        cnpj = COALESCE(${cnpj ?? null}, cnpj),
        ativo = COALESCE(${ativo ?? null}, ativo)
      WHERE id = ${id}
      RETURNING id, email, nome, role, empresa, telefone, cnpj, ativo, created_at
    `;

    if (!result.length) return res.status(404).json({ error: 'Cliente nao encontrado' });
    res.json(result[0]);
  } catch (err) {
    console.error('Portal client update error:', err);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Admin API — Contracts
// ═══════════════════════════════════════════════════════════════════

router.post('/portal/api/contracts', requireAdmin, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });
  try {
    const { client_id, titulo, valor_total, horas_contratadas, data_inicio, data_fim, status } = req.body;
    if (!client_id || !titulo) {
      return res.status(400).json({ error: 'client_id e titulo sao obrigatorios' });
    }

    const result = await sql`
      INSERT INTO contracts (client_id, titulo, valor_total, horas_contratadas, data_inicio, data_fim, status)
      VALUES (${client_id}, ${titulo}, ${valor_total || null}, ${horas_contratadas || null}, ${data_inicio || null}, ${data_fim || null}, ${status || 'ativo'})
      RETURNING *
    `;
    res.json(result[0]);
  } catch (err) {
    console.error('Portal contract create error:', err);
    res.status(500).json({ error: 'Erro ao criar contrato' });
  }
});

router.post('/portal/api/contracts/:id/upload', requireAdmin, upload.single('arquivo'), async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });
  try {
    const id = parseInt(req.params.id, 10);
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const filePath = `/uploads/${req.file.filename}`;
    const result = await sql`
      UPDATE contracts SET arquivo_path = ${filePath} WHERE id = ${id} RETURNING *
    `;
    if (!result.length) return res.status(404).json({ error: 'Contrato nao encontrado' });
    res.json(result[0]);
  } catch (err) {
    console.error('Portal contract upload error:', err);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Admin API — Events
// ═══════════════════════════════════════════════════════════════════

router.get('/portal/api/events', requireAdmin, async (req, res) => {
  if (!sql) return res.json([]);
  try {
    const { client_id, contract_id } = req.query;
    let events;
    if (client_id && contract_id) {
      events = await sql`SELECT e.*, pu.nome AS client_nome FROM events e LEFT JOIN portal_users pu ON pu.id = e.client_id WHERE e.client_id = ${parseInt(client_id, 10)} AND e.contract_id = ${parseInt(contract_id, 10)} ORDER BY e.data DESC`;
    } else if (client_id) {
      events = await sql`SELECT e.*, pu.nome AS client_nome FROM events e LEFT JOIN portal_users pu ON pu.id = e.client_id WHERE e.client_id = ${parseInt(client_id, 10)} ORDER BY e.data DESC`;
    } else if (contract_id) {
      events = await sql`SELECT e.*, pu.nome AS client_nome FROM events e LEFT JOIN portal_users pu ON pu.id = e.client_id WHERE e.contract_id = ${parseInt(contract_id, 10)} ORDER BY e.data DESC`;
    } else {
      events = await sql`SELECT e.*, pu.nome AS client_nome FROM events e LEFT JOIN portal_users pu ON pu.id = e.client_id ORDER BY e.data DESC`;
    }
    res.json(events);
  } catch (err) {
    console.error('Portal events list error:', err);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

router.post('/portal/api/events', requireAdmin, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });
  try {
    const { client_id, contract_id, data, tipo, descricao, horas, valor_hora, observacoes } = req.body;
    if (!client_id || !data || !tipo || !horas) {
      return res.status(400).json({ error: 'client_id, data, tipo e horas sao obrigatorios' });
    }

    const result = await sql`
      INSERT INTO events (client_id, contract_id, data, tipo, descricao, horas, valor_hora, observacoes)
      VALUES (${client_id}, ${contract_id || null}, ${data}, ${tipo}, ${descricao || null}, ${horas}, ${valor_hora || null}, ${observacoes || null})
      RETURNING *
    `;
    res.json(result[0]);
  } catch (err) {
    console.error('Portal event create error:', err);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

router.put('/portal/api/events/:id', requireAdmin, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });
  try {
    const id = parseInt(req.params.id, 10);
    const { data, tipo, descricao, horas, valor_hora, observacoes } = req.body;

    const result = await sql`
      UPDATE events
      SET
        data = COALESCE(${data ?? null}, data),
        tipo = COALESCE(${tipo ?? null}, tipo),
        descricao = COALESCE(${descricao ?? null}, descricao),
        horas = COALESCE(${horas ?? null}, horas),
        valor_hora = COALESCE(${valor_hora ?? null}, valor_hora),
        observacoes = COALESCE(${observacoes ?? null}, observacoes)
      WHERE id = ${id}
      RETURNING *
    `;
    if (!result.length) return res.status(404).json({ error: 'Evento nao encontrado' });
    res.json(result[0]);
  } catch (err) {
    console.error('Portal event update error:', err);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Admin API — Payments
// ═══════════════════════════════════════════════════════════════════

router.get('/portal/api/payments', requireAdmin, async (req, res) => {
  if (!sql) return res.json([]);
  try {
    const { client_id } = req.query;
    let payments;
    if (client_id) {
      payments = await sql`SELECT p.*, pu.nome AS client_nome FROM payments p LEFT JOIN portal_users pu ON pu.id = p.client_id WHERE p.client_id = ${parseInt(client_id, 10)} ORDER BY p.data DESC`;
    } else {
      payments = await sql`SELECT p.*, pu.nome AS client_nome FROM payments p LEFT JOIN portal_users pu ON pu.id = p.client_id ORDER BY p.data DESC`;
    }
    res.json(payments);
  } catch (err) {
    console.error('Portal payments list error:', err);
    res.status(500).json({ error: 'Erro ao buscar pagamentos' });
  }
});

router.post('/portal/api/payments', requireAdmin, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });
  try {
    const { client_id, contract_id, valor, data, metodo, observacoes } = req.body;
    if (!client_id || !valor || !data) {
      return res.status(400).json({ error: 'client_id, valor e data sao obrigatorios' });
    }

    const result = await sql`
      INSERT INTO payments (client_id, contract_id, valor, data, metodo, observacoes)
      VALUES (${client_id}, ${contract_id || null}, ${valor}, ${data}, ${metodo || null}, ${observacoes || null})
      RETURNING *
    `;
    res.json(result[0]);
  } catch (err) {
    console.error('Portal payment create error:', err);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Admin API — Atas
// ═══════════════════════════════════════════════════════════════════

router.post('/portal/api/atas', requireAdmin, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });
  try {
    const { event_id, client_id, titulo, participantes, pauta, discussao, decisoes, proximos_passos, data } = req.body;
    if (!client_id || !titulo || !data) {
      return res.status(400).json({ error: 'client_id, titulo e data sao obrigatorios' });
    }

    const result = await sql`
      INSERT INTO atas (event_id, client_id, titulo, participantes, pauta, discussao, decisoes, proximos_passos, data)
      VALUES (${event_id || null}, ${client_id}, ${titulo}, ${participantes || null}, ${pauta || null}, ${discussao || null}, ${decisoes || null}, ${proximos_passos || null}, ${data})
      RETURNING *
    `;
    res.json(result[0]);
  } catch (err) {
    console.error('Portal ata create error:', err);
    res.status(500).json({ error: 'Erro ao criar ata' });
  }
});

router.get('/portal/api/atas/:id', requireAdmin, async (req, res) => {
  if (!sql) return res.status(404).json({ error: 'Ata nao encontrada' });
  try {
    const id = parseInt(req.params.id, 10);
    const atas = await sql`SELECT a.*, pu.nome AS client_nome FROM atas a LEFT JOIN portal_users pu ON pu.id = a.client_id WHERE a.id = ${id}`;
    if (!atas.length) return res.status(404).json({ error: 'Ata nao encontrada' });
    res.json(atas[0]);
  } catch (err) {
    console.error('Portal ata detail error:', err);
    res.status(500).json({ error: 'Erro ao buscar ata' });
  }
});

router.put('/portal/api/atas/:id', requireAdmin, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });
  try {
    const id = parseInt(req.params.id, 10);
    const { titulo, participantes, pauta, discussao, decisoes, proximos_passos } = req.body;

    const result = await sql`
      UPDATE atas
      SET
        titulo = COALESCE(${titulo ?? null}, titulo),
        participantes = COALESCE(${participantes ?? null}, participantes),
        pauta = COALESCE(${pauta ?? null}, pauta),
        discussao = COALESCE(${discussao ?? null}, discussao),
        decisoes = COALESCE(${decisoes ?? null}, decisoes),
        proximos_passos = COALESCE(${proximos_passos ?? null}, proximos_passos)
      WHERE id = ${id}
      RETURNING *
    `;
    if (!result.length) return res.status(404).json({ error: 'Ata nao encontrada' });
    res.json(result[0]);
  } catch (err) {
    console.error('Portal ata update error:', err);
    res.status(500).json({ error: 'Erro ao atualizar ata' });
  }
});

router.get('/portal/api/atas/:id/pdf', requireAuth, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });
  try {
    const id = parseInt(req.params.id, 10);
    const user = req.session.portalUser;

    // Clients can only download their own atas
    let atas;
    if (user.role === 'admin') {
      atas = await sql`SELECT a.*, pu.nome AS client_nome, pu.empresa AS client_empresa FROM atas a LEFT JOIN portal_users pu ON pu.id = a.client_id WHERE a.id = ${id}`;
    } else {
      atas = await sql`SELECT a.*, pu.nome AS client_nome, pu.empresa AS client_empresa FROM atas a LEFT JOIN portal_users pu ON pu.id = a.client_id WHERE a.id = ${id} AND a.client_id = ${user.id}`;
    }

    if (!atas.length) return res.status(404).json({ error: 'Ata nao encontrada' });
    const ata = atas[0];

    // Generate PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="ata-${id}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('Anders Tech', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Gestao com Tecnologia', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#2563eb');
    doc.moveDown(1);

    // Title
    doc.fontSize(16).font('Helvetica-Bold').text(`Ata: ${ata.titulo}`);
    doc.moveDown(0.5);

    // Metadata
    doc.fontSize(10).font('Helvetica')
      .text(`Data: ${ata.data}`)
      .text(`Cliente: ${ata.client_nome || 'N/A'}${ata.client_empresa ? ` - ${ata.client_empresa}` : ''}`)
      .text(`Participantes: ${ata.participantes || 'N/A'}`);
    doc.moveDown(1);

    // Sections
    const sections = [
      { label: 'Pauta', value: ata.pauta },
      { label: 'Discussao', value: ata.discussao },
      { label: 'Decisoes', value: ata.decisoes },
      { label: 'Proximos Passos', value: ata.proximos_passos },
    ];

    for (const section of sections) {
      if (section.value) {
        doc.fontSize(12).font('Helvetica-Bold').text(section.label);
        doc.fontSize(10).font('Helvetica').text(section.value);
        doc.moveDown(0.8);
      }
    }

    // Footer
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb');
    doc.moveDown(0.5);
    doc.fontSize(8).font('Helvetica').fillColor('#6b7280')
      .text(`Documento gerado automaticamente por Anders Tech Portal em ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('Portal ata PDF error:', err);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Admin API — Dashboard
// ═══════════════════════════════════════════════════════════════════

router.get('/portal/api/dashboard', requireAdmin, async (req, res) => {
  if (!sql) return res.json({ total_clients: 0, total_hours: 0, total_revenue: 0, pending_value: 0 });
  try {
    const [clientsR, hoursR, paymentsR, contractsR] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM portal_users WHERE role = 'cliente' AND ativo = true`,
      sql`SELECT COALESCE(SUM(horas), 0)::numeric AS total FROM events`,
      sql`SELECT COALESCE(SUM(valor), 0)::numeric AS total FROM payments`,
      sql`SELECT COALESCE(SUM(valor_total), 0)::numeric AS total FROM contracts WHERE status = 'ativo'`,
    ]);

    const totalRevenue = Number(paymentsR[0]?.total || 0);
    const totalContracts = Number(contractsR[0]?.total || 0);

    res.json({
      total_clients: clientsR[0]?.count || 0,
      total_hours: Number(hoursR[0]?.total || 0),
      total_revenue: totalRevenue,
      pending_value: totalContracts - totalRevenue,
    });
  } catch (err) {
    console.error('Portal dashboard error:', err);
    res.status(500).json({ error: 'Erro ao buscar estatisticas' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Client API — My data
// ═══════════════════════════════════════════════════════════════════

router.get('/portal/api/me', requireAuth, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });
  try {
    const user = req.session.portalUser;
    const result = await sql`
      SELECT id, email, nome, role, empresa, telefone, cnpj, created_at
      FROM portal_users WHERE id = ${user.id}
    `;
    if (!result.length) return res.status(404).json({ error: 'Usuario nao encontrado' });
    res.json(result[0]);
  } catch (err) {
    console.error('Portal me error:', err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

router.get('/portal/api/me/contracts', requireAuth, async (req, res) => {
  if (!sql) return res.json([]);
  try {
    const clientId = req.session.portalUser.id;
    const contracts = await sql`SELECT * FROM contracts WHERE client_id = ${clientId} ORDER BY created_at DESC`;
    res.json(contracts);
  } catch (err) {
    console.error('Portal me contracts error:', err);
    res.status(500).json({ error: 'Erro ao buscar contratos' });
  }
});

router.get('/portal/api/me/events', requireAuth, async (req, res) => {
  if (!sql) return res.json([]);
  try {
    const clientId = req.session.portalUser.id;
    const events = await sql`SELECT * FROM events WHERE client_id = ${clientId} ORDER BY data DESC`;
    res.json(events);
  } catch (err) {
    console.error('Portal me events error:', err);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

router.get('/portal/api/me/payments', requireAuth, async (req, res) => {
  if (!sql) return res.json([]);
  try {
    const clientId = req.session.portalUser.id;
    const payments = await sql`SELECT * FROM payments WHERE client_id = ${clientId} ORDER BY data DESC`;
    res.json(payments);
  } catch (err) {
    console.error('Portal me payments error:', err);
    res.status(500).json({ error: 'Erro ao buscar pagamentos' });
  }
});

router.get('/portal/api/me/atas', requireAuth, async (req, res) => {
  if (!sql) return res.json([]);
  try {
    const clientId = req.session.portalUser.id;
    const atas = await sql`SELECT * FROM atas WHERE client_id = ${clientId} ORDER BY data DESC`;
    res.json(atas);
  } catch (err) {
    console.error('Portal me atas error:', err);
    res.status(500).json({ error: 'Erro ao buscar atas' });
  }
});

router.get('/portal/api/me/summary', requireAuth, async (req, res) => {
  if (!sql) return res.json({ total_horas: 0, total_pago: 0, total_pendente: 0 });
  try {
    const clientId = req.session.portalUser.id;
    const [hoursR, paymentsR, contractsR] = await Promise.all([
      sql`SELECT COALESCE(SUM(horas), 0)::numeric AS total FROM events WHERE client_id = ${clientId}`,
      sql`SELECT COALESCE(SUM(valor), 0)::numeric AS total FROM payments WHERE client_id = ${clientId}`,
      sql`SELECT COALESCE(SUM(valor_total), 0)::numeric AS total FROM contracts WHERE client_id = ${clientId} AND status = 'ativo'`,
    ]);

    const totalPago = Number(paymentsR[0]?.total || 0);
    const totalContracts = Number(contractsR[0]?.total || 0);

    res.json({
      total_horas: Number(hoursR[0]?.total || 0),
      total_pago: totalPago,
      total_pendente: totalContracts - totalPago,
    });
  } catch (err) {
    console.error('Portal me summary error:', err);
    res.status(500).json({ error: 'Erro ao buscar resumo' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Page serving routes
// ═══════════════════════════════════════════════════════════════════

router.get('/portal', (req, res) => {
  // If already logged in, redirect
  if (req.session?.portalUser) {
    return res.redirect(req.session.portalUser.role === 'admin' ? '/portal/admin' : '/portal/cliente');
  }
  res.sendFile(join(projectRoot, 'portal', 'login.html'));
});

router.get('/portal/admin', requireAdmin, (req, res) => {
  res.sendFile(join(projectRoot, 'portal', 'admin.html'));
});

router.get('/portal/cliente', requireAuth, (req, res) => {
  res.sendFile(join(projectRoot, 'portal', 'cliente.html'));
});

export { router, initPortalDB };
