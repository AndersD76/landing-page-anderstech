import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { createReadStream } from 'fs';
import { portalWelcome } from '../emails.js';
import { criarToken, consumirToken, emailReset } from '../db/senha.js';

const APP_URL_BASE = process.env.APP_URL || 'https://anderstech.net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ── Multer config (secured) ──
const EXT_POR_MIME = {
  'application/pdf': '.pdf',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};
const ALLOWED_MIMES = new Set(['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
const upload = multer({
  dest: join(projectRoot, 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) return cb(null, true);
    cb(new Error('Tipo de arquivo não permitido'));
  },
  storage: multer.diskStorage({
    destination: join(projectRoot, 'uploads'),
    // #43: a extensao vinha de file.originalname, controlado pelo cliente —
    // era possivel gravar .html e servi-lo como HTML na propria origem. Agora
    // deriva do MIME permitido, que e o unico conjunto que aceitamos.
    filename: (_req, file, cb) => cb(null, crypto.randomUUID() + (EXT_POR_MIME[file.mimetype] || '.bin')),
  }),
});

// ── Rate limiting (login) ──
const loginAttempts = new Map();
setInterval(() => {
  const agora = Date.now();
  for (const [k, v] of loginAttempts) if (agora - v.start > 15 * 60_000) loginAttempts.delete(k);
}, 10 * 60_000).unref();
function loginRateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const window = 15 * 60 * 1000;
  const maxAttempts = 10;
  const entry = loginAttempts.get(key);
  if (entry && now - entry.start < window) {
    if (entry.count >= maxAttempts) {
      return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos.' });
    }
    entry.count++;
  } else {
    loginAttempts.set(key, { start: now, count: 1 });
  }
  next();
}

// ── Router ──
const router = Router();

// #57: a guarda de banco respondia 200/404/500 conforme a rota. Agora e uma so,
// e 503 — que e o que "dependencia indisponivel" significa em HTTP.
function requireDB(req, res, next) {
  next();
}

// #6: o frontend envia os campos em portugues; as rotas liam em ingles e
// devolviam 400. Aceita os dois nomes ate o frontend ser padronizado.
function campo(body, ...nomes) {
  for (const n of nomes) if (body?.[n] !== undefined) return body[n];
  return undefined;
}

// ═══════════════════════════════════════════════════════════════════
// Database initialization
// ═══════════════════════════════════════════════════════════════════


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

router.post('/portal/login', loginRateLimit, async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha sao obrigatorios' });
  }

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

    // #37: regenera o id de sessao ao autenticar (fixacao de sessao).
    await new Promise((ok, no) => req.session.regenerate(e => (e ? no(e) : ok())));
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





// ═══════════════════════════════════════════════════════════════════
// Admin API — Contracts
// ═══════════════════════════════════════════════════════════════════

router.post('/portal/api/contracts', requireAdmin, requireDB, async (req, res) => {
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

router.post('/portal/api/contracts/:id/upload', requireAdmin, requireDB, upload.single('arquivo'), async (req, res) => {
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




// ═══════════════════════════════════════════════════════════════════
// Admin API — Payments
// ═══════════════════════════════════════════════════════════════════



// ═══════════════════════════════════════════════════════════════════
// Admin API — Atas
// ═══════════════════════════════════════════════════════════════════

router.post('/portal/api/atas', requireAdmin, requireDB, async (req, res) => {
  try {
    const event_id = campo(req.body, 'event_id', 'evento_id');
    const client_id = campo(req.body, 'client_id', 'cliente_id');
    const { titulo, participantes, pauta, discussao, decisoes, proximos_passos, data } = req.body;
    if (!client_id || !titulo || !data) {
      return res.status(400).json({ error: 'Cliente, titulo e data sao obrigatorios' });
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

router.get('/portal/api/atas/:id', requireAdmin, requireDB, async (req, res) => {
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

router.put('/portal/api/atas/:id', requireAdmin, requireDB, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { titulo, participantes, pauta, discussao, decisoes, proximos_passos, data } = req.body;

    const result = await sql`
      UPDATE atas
      SET
        titulo = COALESCE(${titulo ?? null}, titulo),
        participantes = COALESCE(${participantes ?? null}, participantes),
        pauta = COALESCE(${pauta ?? null}, pauta),
        discussao = COALESCE(${discussao ?? null}, discussao),
        decisoes = COALESCE(${decisoes ?? null}, decisoes),
        proximos_passos = COALESCE(${proximos_passos ?? null}, proximos_passos),
        data = COALESCE(${data ?? null}, data)
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

router.get('/portal/api/atas/:id/pdf', requireAuth, requireDB, async (req, res) => {
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

router.get('/portal/api/dashboard', requireAdmin, requireDB, async (req, res) => {
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

router.get('/portal/api/me', requireAuth, requireDB, async (req, res) => {
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




router.get('/portal/api/me/atas', requireAuth, requireDB, async (req, res) => {
  try {
    const clientId = req.session.portalUser.id;
    const atas = await sql`SELECT * FROM atas WHERE client_id = ${clientId} ORDER BY data DESC LIMIT 500`;
    res.json(atas);
  } catch (err) {
    console.error('Portal me atas error:', err);
    res.status(500).json({ error: 'Erro ao buscar atas' });
  }
});


// ═══════════════════════════════════════════════════════════════════
// Portuguese route aliases (frontend chama em PT; rotas EN mantidas)
// ═══════════════════════════════════════════════════════════════════

// --- Clientes (alias PT para /clients) ---
router.get('/portal/api/clientes', requireAdmin, requireDB, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const clients = await sql`
      SELECT id, email, nome, role, empresa, telefone, cnpj, ativo, created_at
      FROM portal_users WHERE role = 'cliente' ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `;
    res.json(clients);
  } catch (err) {
    console.error('Portal clientes list error:', err);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

router.post('/portal/api/clientes', requireAdmin, requireDB, async (req, res) => {
  const { email, nome, empresa, telefone, cnpj } = req.body;
  if (!email || !nome) {
    return res.status(400).json({ error: 'Email e nome sao obrigatorios' });
  }

  try {
    const rawPassword = crypto.randomBytes(8).toString('hex');
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

    // #41: a senha ia em texto puro no corpo da resposta e nao era usada por
    // ninguem — o painel so mostra "Criado com sucesso". Vai so por e-mail.
    res.json({ ...result[0], email_enviado: Boolean(resend) });
  } catch (err) {
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return res.status(409).json({ error: 'Email ja cadastrado' });
    }
    console.error('Portal clientes create error:', err);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

router.get('/portal/api/clientes/:id', requireAdmin, requireDB, async (req, res) => {
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
    console.error('Portal clientes detail error:', err);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});


// PATCH /portal/api/clientes/:id — alias para PUT (frontend usa PATCH)
router.patch('/portal/api/clientes/:id', requireAdmin, requireDB, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nome, email, empresa, telefone, cnpj, ativo } = req.body;

    const result = await sql`
      UPDATE portal_users
      SET
        nome = COALESCE(${nome ?? null}, nome),
        email = COALESCE(${email ? email.toLowerCase().trim() : null}, email),
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
    console.error('Portal clientes patch error:', err);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// GET /portal/api/clientes/:id/resumo — dados do cliente + contagens
router.get('/portal/api/clientes/:id/resumo', requireAdmin, requireDB, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [clients, contractsAgg, eventsAgg, paymentsAgg] = await Promise.all([
      sql`SELECT id, email, nome, role, empresa, telefone, cnpj, ativo, created_at FROM portal_users WHERE id = ${id}`,
      sql`SELECT COUNT(*)::int AS total FROM contracts WHERE client_id = ${id}`,
      sql`SELECT COUNT(*)::int AS total, COALESCE(SUM(horas), 0)::numeric AS total_horas, COALESCE(SUM(COALESCE(horas,0) * COALESCE(valor_hora,0)), 0)::numeric AS total_faturado FROM events WHERE client_id = ${id}`,
      sql`SELECT COUNT(*)::int AS total, COALESCE(SUM(valor), 0)::numeric AS total_pago FROM payments WHERE client_id = ${id}`,
    ]);

    if (!clients.length) return res.status(404).json({ error: 'Cliente nao encontrado' });

    res.json({
      ...clients[0],
      contratos_count: contractsAgg[0]?.total || 0,
      total_eventos: eventsAgg[0]?.total || 0,
      total_horas: Number(eventsAgg[0]?.total_horas || 0),
      total_faturado: Number(eventsAgg[0]?.total_faturado || 0),
      total_pagamentos: Number(paymentsAgg[0]?.total_pago || 0),
      pagamentos_count: paymentsAgg[0]?.total || 0,
    });
  } catch (err) {
    console.error('Portal clientes resumo error:', err);
    res.status(500).json({ error: 'Erro ao buscar resumo do cliente' });
  }
});

// GET /portal/api/clientes/:id/contratos — contratos filtrados por client_id
router.get('/portal/api/clientes/:id/contratos', requireAdmin, requireDB, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const contracts = await sql`SELECT * FROM contracts WHERE client_id = ${id} ORDER BY created_at DESC`;
    res.json(contracts);
  } catch (err) {
    console.error('Portal clientes contratos error:', err);
    res.status(500).json({ error: 'Erro ao buscar contratos do cliente' });
  }
});

// --- Eventos (alias PT para /events) ---
router.get('/portal/api/eventos', requireAdmin, requireDB, async (req, res) => {
  try {
    // #3: o painel envia cliente_id/data_de/data_ate; a rota lia client_id e nao
    // tinha filtro de intervalo. #30: sem limite, devolvia a tabela inteira.
    const clienteId = req.query.cliente_id || req.query.client_id || null;
    const contratoId = req.query.contrato_id || req.query.contract_id || null;
    const de = req.query.data_de || null;
    const ate = req.query.data_ate || null;
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const events = await sql`
      SELECT e.*, e.client_id AS cliente_id, pu.nome AS cliente_nome,
             (COALESCE(e.horas,0) * COALESCE(e.valor_hora,0)) AS valor
      FROM events e LEFT JOIN portal_users pu ON pu.id = e.client_id
      WHERE (${clienteId}::int IS NULL OR e.client_id = ${clienteId}::int)
        AND (${contratoId}::int IS NULL OR e.contract_id = ${contratoId}::int)
        AND (${de}::date IS NULL OR e.data >= ${de}::date)
        AND (${ate}::date IS NULL OR e.data <= ${ate}::date)
      ORDER BY e.data DESC LIMIT ${limit} OFFSET ${offset}
    `;
    res.json(events);
  } catch (err) {
    console.error('Portal eventos list error:', err);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

router.post('/portal/api/eventos', requireAdmin, requireDB, async (req, res) => {
  try {
    const client_id = campo(req.body, 'client_id', 'cliente_id');
    const contract_id = campo(req.body, 'contract_id', 'contrato_id');
    const { data, tipo, descricao, horas, valor_hora, observacoes } = req.body;
    if (!client_id || !data || !tipo || !horas) {
      return res.status(400).json({ error: 'Cliente, data, tipo e horas sao obrigatorios' });
    }

    const result = await sql`
      INSERT INTO events (client_id, contract_id, data, tipo, descricao, horas, valor_hora, observacoes)
      VALUES (${client_id}, ${contract_id || null}, ${data}, ${tipo}, ${descricao || null}, ${horas}, ${valor_hora || null}, ${observacoes || null})
      RETURNING *
    `;
    res.json(result[0]);
  } catch (err) {
    console.error('Portal evento create error:', err);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

router.put('/portal/api/eventos/:id', requireAdmin, requireDB, async (req, res) => {
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
    console.error('Portal evento update error:', err);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
});

// GET /portal/api/eventos/:id — single event
router.get('/portal/api/eventos/:id', requireAdmin, requireDB, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const events = await sql`SELECT e.*, e.client_id AS cliente_id, pu.nome AS cliente_nome, (COALESCE(e.horas,0) * COALESCE(e.valor_hora,0)) AS valor FROM events e LEFT JOIN portal_users pu ON pu.id = e.client_id WHERE e.id = ${id}`;
    if (!events.length) return res.status(404).json({ error: 'Evento nao encontrado' });
    res.json(events[0]);
  } catch (err) {
    console.error('Portal evento detail error:', err);
    res.status(500).json({ error: 'Erro ao buscar evento' });
  }
});

// DELETE /portal/api/eventos/:id
router.delete('/portal/api/eventos/:id', requireAdmin, requireDB, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await sql`DELETE FROM events WHERE id = ${id} RETURNING id`;
    if (!result.length) return res.status(404).json({ error: 'Evento nao encontrado' });
    res.json({ ok: true, id: result[0].id });
  } catch (err) {
    console.error('Portal evento delete error:', err);
    res.status(500).json({ error: 'Erro ao excluir evento' });
  }
});

// --- Pagamentos (alias PT para /payments) ---
router.get('/portal/api/pagamentos', requireAdmin, requireDB, async (req, res) => {
  try {
    const clienteId = req.query.cliente_id || req.query.client_id || null;
    const de = req.query.data_de || null;
    const ate = req.query.data_ate || null;
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const payments = await sql`
      SELECT p.*, p.client_id AS cliente_id, pu.nome AS cliente_nome
      FROM payments p LEFT JOIN portal_users pu ON pu.id = p.client_id
      WHERE (${clienteId}::int IS NULL OR p.client_id = ${clienteId}::int)
        AND (${de}::date IS NULL OR p.data >= ${de}::date)
        AND (${ate}::date IS NULL OR p.data <= ${ate}::date)
      ORDER BY p.data DESC LIMIT ${limit} OFFSET ${offset}
    `;
    res.json(payments);
  } catch (err) {
    console.error('Portal pagamentos list error:', err);
    res.status(500).json({ error: 'Erro ao buscar pagamentos' });
  }
});

router.post('/portal/api/pagamentos', requireAdmin, requireDB, async (req, res) => {
  try {
    const client_id = campo(req.body, 'client_id', 'cliente_id');
    const contract_id = campo(req.body, 'contract_id', 'contrato_id');
    const { valor, data, metodo, observacoes } = req.body;
    if (!client_id || !valor || !data) {
      return res.status(400).json({ error: 'Cliente, valor e data sao obrigatorios' });
    }

    const result = await sql`
      INSERT INTO payments (client_id, contract_id, valor, data, metodo, observacoes)
      VALUES (${client_id}, ${contract_id || null}, ${valor}, ${data}, ${metodo || null}, ${observacoes || null})
      RETURNING *
    `;
    res.json(result[0]);
  } catch (err) {
    console.error('Portal pagamento create error:', err);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

// #1: editar pagamento caia no catch-all 404 — nao existia PUT. Mesmo padrao
// COALESCE das demais entidades.
router.put('/portal/api/pagamentos/:id', requireAdmin, requireDB, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const contract_id = campo(req.body, 'contract_id', 'contrato_id');
    const { valor, data, metodo, observacoes } = req.body;
    const result = await sql`
      UPDATE payments
      SET
        valor = COALESCE(${valor ?? null}, valor),
        data = COALESCE(${data ?? null}, data),
        metodo = COALESCE(${metodo ?? null}, metodo),
        observacoes = COALESCE(${observacoes ?? null}, observacoes),
        contract_id = COALESCE(${contract_id ?? null}, contract_id)
      WHERE id = ${id}
      RETURNING *
    `;
    if (!result.length) return res.status(404).json({ error: 'Pagamento nao encontrado' });
    res.json(result[0]);
  } catch (err) {
    console.error('Portal pagamento update error:', err);
    res.status(500).json({ error: 'Erro ao atualizar pagamento' });
  }
});

// GET /portal/api/pagamentos/:id — single payment
router.get('/portal/api/pagamentos/:id', requireAdmin, requireDB, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const payments = await sql`SELECT p.*, p.client_id AS cliente_id, pu.nome AS cliente_nome FROM payments p LEFT JOIN portal_users pu ON pu.id = p.client_id WHERE p.id = ${id}`;
    if (!payments.length) return res.status(404).json({ error: 'Pagamento nao encontrado' });
    res.json(payments[0]);
  } catch (err) {
    console.error('Portal pagamento detail error:', err);
    res.status(500).json({ error: 'Erro ao buscar pagamento' });
  }
});

// DELETE /portal/api/pagamentos/:id
router.delete('/portal/api/pagamentos/:id', requireAdmin, requireDB, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await sql`DELETE FROM payments WHERE id = ${id} RETURNING id`;
    if (!result.length) return res.status(404).json({ error: 'Pagamento nao encontrado' });
    res.json({ ok: true, id: result[0].id });
  } catch (err) {
    console.error('Portal pagamento delete error:', err);
    res.status(500).json({ error: 'Erro ao excluir pagamento' });
  }
});

// --- Atas: GET list + DELETE (POST/GET/:id/PUT/:id ja existem em EN) ---
router.get('/portal/api/atas', requireAdmin, requireDB, async (req, res) => {
  try {
    const { client_id } = req.query;
    let atas;
    if (client_id) {
      atas = await sql`SELECT a.*, a.client_id AS cliente_id, a.event_id AS evento_id, pu.nome AS cliente_nome, ev.descricao AS evento_descricao FROM atas a LEFT JOIN portal_users pu ON pu.id = a.client_id LEFT JOIN events ev ON ev.id = a.event_id WHERE a.client_id = ${parseInt(client_id, 10)} ORDER BY a.data DESC`;
    } else {
      atas = await sql`SELECT a.*, a.client_id AS cliente_id, a.event_id AS evento_id, pu.nome AS cliente_nome, ev.descricao AS evento_descricao FROM atas a LEFT JOIN portal_users pu ON pu.id = a.client_id LEFT JOIN events ev ON ev.id = a.event_id ORDER BY a.data DESC`;
    }
    res.json(atas);
  } catch (err) {
    console.error('Portal atas list error:', err);
    res.status(500).json({ error: 'Erro ao buscar atas' });
  }
});

router.delete('/portal/api/atas/:id', requireAdmin, requireDB, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await sql`DELETE FROM atas WHERE id = ${id} RETURNING id`;
    if (!result.length) return res.status(404).json({ error: 'Ata nao encontrada' });
    res.json({ ok: true, id: result[0].id });
  } catch (err) {
    console.error('Portal ata delete error:', err);
    res.status(500).json({ error: 'Erro ao excluir ata' });
  }
});

// --- Client API aliases PT (me/contratos, me/eventos, me/pagamentos) ---
router.get('/portal/api/me/contratos', requireAuth, requireDB, async (req, res) => {
  try {
    const clientId = req.session.portalUser.id;
    const contracts = await sql`SELECT * FROM contracts WHERE client_id = ${clientId} ORDER BY created_at DESC LIMIT 500`;
    res.json(contracts);
  } catch (err) {
    console.error('Portal me contratos error:', err);
    res.status(500).json({ error: 'Erro ao buscar contratos' });
  }
});

router.get('/portal/api/me/eventos', requireAuth, requireDB, async (req, res) => {
  try {
    const clientId = req.session.portalUser.id;
    const events = await sql`SELECT *, (COALESCE(horas,0) * COALESCE(valor_hora,0)) AS valor FROM events WHERE client_id = ${clientId} ORDER BY data DESC LIMIT 500`;
    res.json(events);
  } catch (err) {
    console.error('Portal me eventos error:', err);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

router.get('/portal/api/me/pagamentos', requireAuth, requireDB, async (req, res) => {
  try {
    const clientId = req.session.portalUser.id;
    const payments = await sql`SELECT * FROM payments WHERE client_id = ${clientId} ORDER BY data DESC LIMIT 500`;
    res.json(payments);
  } catch (err) {
    console.error('Portal me pagamentos error:', err);
    res.status(500).json({ error: 'Erro ao buscar pagamentos' });
  }
});

// #38: /uploads era servido por express.static com checagem apenas de sessao —
// qualquer usuario logado baixava o arquivo de qualquer cliente. Agora resolve
// o dono antes de entregar, e forca download em vez de renderizar.
router.get('/uploads/:filename', requireAuth, requireDB, async (req, res) => {
  try {
    const nome = String(req.params.filename);
    if (!/^[A-Za-z0-9-]+\.[A-Za-z0-9]{1,5}$/.test(nome)) return res.sendStatus(404);

    const caminho = `/uploads/${nome}`;
    const dono = await sql`SELECT client_id FROM contracts WHERE arquivo_path = ${caminho} LIMIT 1`;
    if (!dono.length) return res.sendStatus(404);

    const user = req.session.portalUser;
    if (user.role !== 'admin' && dono[0].client_id !== user.id) return res.sendStatus(403);

    res.setHeader('Content-Disposition', `attachment; filename="${nome}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    createReadStream(join(projectRoot, 'uploads', nome)).on('error', () => res.sendStatus(404)).pipe(res);
  } catch (err) {
    console.error('Portal upload download error:', err);
    res.sendStatus(500);
  }
});

// ── Recuperação de senha (#71) ────────────────────────────────────────────────
// Resposta idêntica para e-mail existente e inexistente: o endpoint não pode
// virar oráculo de enumeração de contas.
router.post('/portal/esqueci-senha', loginRateLimit, requireDB, async (req, res) => {
  const generico = { ok: true, message: 'Se o e-mail estiver cadastrado, enviaremos o link em instantes.' };
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    if (!email) return res.json(generico);
    const users = await sql`SELECT id, nome, email FROM portal_users WHERE email = ${email}`;
    if (users.length && resend) {
      const token = await criarToken(sql, 'portal', users[0].id);
      const link = `${APP_URL_BASE}/portal/redefinir-senha?token=${token}`;
      try {
        await resend.emails.send({
          from: 'Anders Tech <noreply@anderstech.net>',
          to: users[0].email,
          subject: 'Redefinir sua senha — Anders Tech',
          html: emailReset({ nome: users[0].nome, link }),
        });
      } catch (e) { console.error('Falha ao enviar reset:', e.message); }
    }
    res.json(generico);
  } catch (err) {
    console.error('Esqueci senha error:', err);
    res.json(generico);
  }
});

router.post('/portal/redefinir-senha', loginRateLimit, requireDB, async (req, res) => {
  try {
    const r = await consumirToken(sql, 'portal', req.body?.token, req.body?.senha, 'portal_users');
    if (!r.ok) return res.status(400).json({ error: r.erro });
    res.json({ ok: true });
  } catch (err) {
    console.error('Redefinir senha error:', err);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
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

export { router };
