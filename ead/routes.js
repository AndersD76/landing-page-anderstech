import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const router = Router();

// ═══════════════════════════════════════════════════════════════════
// Launch promotion — free access for 30 days
// ═══════════════════════════════════════════════════════════════════
const PROMO = {
  ativa: true,
  fim: new Date('2026-07-29T23:59:59-03:00'),
  label: 'Lancamento — acesso gratuito',
  desc: 'Todos os cursos liberados gratuitamente ate 29/07/2026. Matricule-se agora e mantenha o acesso permanente.',
};
function promoAtiva() { return PROMO.ativa && new Date() < PROMO.fim; }

// ═══════════════════════════════════════════════════════════════════
// Database initialization
// ═══════════════════════════════════════════════════════════════════

async function initEadDB() {
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS ead_courses (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      titulo TEXT NOT NULL,
      subtitulo TEXT,
      descricao TEXT,
      carga_horaria TEXT,
      preco NUMERIC(10,2) NOT NULL,
      preco_original NUMERIC(10,2),
      imagem TEXT,
      publico TEXT,
      prerequisito TEXT,
      objetivo TEXT,
      ativo BOOLEAN DEFAULT true,
      ordem INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ead_modules (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES ead_courses(id) ON DELETE CASCADE,
      titulo TEXT NOT NULL,
      descricao TEXT,
      ordem INT NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ead_lessons (
      id SERIAL PRIMARY KEY,
      module_id INTEGER REFERENCES ead_modules(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      titulo TEXT NOT NULL,
      duracao TEXT,
      conteudo TEXT,
      entregavel_titulo TEXT,
      entregavel_url TEXT,
      ordem INT NOT NULL DEFAULT 0
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_ead_lessons_slug ON ead_lessons(slug)`;

  await sql`
    CREATE TABLE IF NOT EXISTS ead_quiz_questions (
      id SERIAL PRIMARY KEY,
      module_id INTEGER REFERENCES ead_modules(id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES ead_courses(id) ON DELETE CASCADE,
      pergunta TEXT NOT NULL,
      alternativas JSONB NOT NULL,
      resposta_correta INT NOT NULL,
      explicacao TEXT,
      is_final BOOLEAN DEFAULT false
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ead_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      nome TEXT NOT NULL,
      telefone TEXT,
      empresa TEXT,
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ead_orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES ead_users(id),
      course_id INTEGER REFERENCES ead_courses(id),
      valor NUMERIC(10,2) NOT NULL,
      metodo TEXT,
      status TEXT DEFAULT 'pendente',
      mp_preference_id TEXT,
      mp_payment_id TEXT,
      pix_qr_code TEXT,
      pix_qr_code_base64 TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      paid_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ead_enrollments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES ead_users(id),
      course_id INTEGER REFERENCES ead_courses(id),
      order_id INTEGER REFERENCES ead_orders(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, course_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ead_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES ead_users(id),
      lesson_id INTEGER REFERENCES ead_lessons(id),
      completed BOOLEAN DEFAULT false,
      completed_at TIMESTAMPTZ,
      UNIQUE(user_id, lesson_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ead_quiz_attempts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES ead_users(id),
      course_id INTEGER REFERENCES ead_courses(id),
      module_id INTEGER,
      is_final BOOLEAN DEFAULT false,
      score NUMERIC(5,2),
      total_questions INT,
      correct_answers INT,
      passed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ead_certificates (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES ead_users(id),
      course_id INTEGER REFERENCES ead_courses(id),
      code TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log('EAD DB tables initialized');
}

// ═══════════════════════════════════════════════════════════════════
// Auth middleware
// ═══════════════════════════════════════════════════════════════════

function requireEadAuth(req, res, next) {
  if (!req.session?.eadUser) {
    if (req.path.startsWith('/ead/api/')) {
      return res.status(401).json({ error: 'Nao autenticado' });
    }
    return res.redirect('/ead/login');
  }
  next();
}

function requireEadAdmin(req, res, next) {
  if (!req.session?.portalUser || req.session.portalUser.role !== 'admin') {
    if (req.path.startsWith('/ead/api/')) {
      return res.status(403).json({ error: 'Acesso restrito' });
    }
    return res.redirect('/ead/login');
  }
  next();
}

// Rate limiting for registration
const regAttempts = new Map();
function regRateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const window = 60 * 60 * 1000;
  const max = 5;
  const entry = regAttempts.get(key);
  if (entry && now - entry.start < window) {
    if (entry.count >= max) return res.status(429).json({ error: 'Muitas tentativas. Aguarde 1 hora.' });
    entry.count++;
  } else {
    regAttempts.set(key, { start: now, count: 1 });
  }
  next();
}

const loginAttempts = new Map();
function loginRateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const window = 15 * 60 * 1000;
  const max = 10;
  const entry = loginAttempts.get(key);
  if (entry && now - entry.start < window) {
    if (entry.count >= max) return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos.' });
    entry.count++;
  } else {
    loginAttempts.set(key, { start: now, count: 1 });
  }
  next();
}

// ═══════════════════════════════════════════════════════════════════
// Public: Course listing & detail
// ═══════════════════════════════════════════════════════════════════

router.get('/ead/api/promo', (req, res) => {
  if (promoAtiva()) {
    return res.json({ ativa: true, fim: PROMO.fim.toISOString(), label: PROMO.label, desc: PROMO.desc });
  }
  res.json({ ativa: false });
});

router.get('/ead/api/courses', async (req, res) => {
  if (!sql) return res.json([]);
  try {
    const courses = await sql`
      SELECT c.*,
        (SELECT COUNT(*)::int FROM ead_modules m WHERE m.course_id = c.id) AS total_modulos,
        (SELECT COUNT(*)::int FROM ead_lessons l JOIN ead_modules m ON l.module_id = m.id WHERE m.course_id = c.id) AS total_aulas
      FROM ead_courses c WHERE c.ativo = true ORDER BY c.ordem
    `;
    const promo = promoAtiva();
    const result = courses.map(c => ({ ...c, promo_gratuito: promo }));
    res.json(result);
  } catch (err) {
    console.error('EAD courses error:', err);
    res.status(500).json({ error: 'Erro ao buscar cursos' });
  }
});

router.get('/ead/api/courses/:slug', async (req, res) => {
  if (!sql) return res.status(404).json({ error: 'Curso nao encontrado' });
  try {
    const slug = req.params.slug;
    const courses = await sql`SELECT * FROM ead_courses WHERE slug = ${slug} AND ativo = true`;
    if (!courses.length) return res.status(404).json({ error: 'Curso nao encontrado' });
    const course = courses[0];

    const modules = await sql`
      SELECT m.*,
        (SELECT json_agg(json_build_object(
          'id', l.id, 'slug', l.slug, 'titulo', l.titulo, 'duracao', l.duracao, 'ordem', l.ordem,
          'entregavel_titulo', l.entregavel_titulo
        ) ORDER BY l.ordem) FROM ead_lessons l WHERE l.module_id = m.id) AS aulas
      FROM ead_modules m WHERE m.course_id = ${course.id} ORDER BY m.ordem
    `;

    let enrolled = false;
    if (req.session?.eadUser) {
      const enr = await sql`SELECT id FROM ead_enrollments WHERE user_id = ${req.session.eadUser.id} AND course_id = ${course.id}`;
      enrolled = enr.length > 0;
    }

    res.json({ ...course, modules, enrolled, promo_gratuito: promoAtiva() });
  } catch (err) {
    console.error('EAD course detail error:', err);
    res.status(500).json({ error: 'Erro ao buscar curso' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Auth: Register & Login
// ═══════════════════════════════════════════════════════════════════

router.post('/ead/api/register', regRateLimit, async (req, res) => {
  const { nome, email, senha, telefone, empresa } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha sao obrigatorios' });
  if (senha.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });

  try {
    const existing = await sql`SELECT id FROM ead_users WHERE email = ${email.toLowerCase().trim()}`;
    if (existing.length) return res.status(409).json({ error: 'Email ja cadastrado' });

    const hash = await bcrypt.hash(senha, 10);
    const result = await sql`
      INSERT INTO ead_users (email, senha_hash, nome, telefone, empresa)
      VALUES (${email.toLowerCase().trim()}, ${hash}, ${nome.trim()}, ${telefone || null}, ${empresa || null})
      RETURNING id, email, nome
    `;

    const user = result[0];
    req.session.eadUser = { id: user.id, email: user.email, nome: user.nome };

    if (resend) {
      try {
        await resend.emails.send({
          from: 'Anders Tech Cursos <noreply@anderstech.net>',
          to: user.email,
          subject: `${user.nome.split(' ')[0]}, bem-vindo aos Cursos Anders Tech`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <h2 style="color:#0b1730">Bem-vindo, ${user.nome.split(' ')[0]}!</h2>
            <p>Sua conta nos <strong>Cursos Anders Tech</strong> foi criada com sucesso.</p>
            <p>Acesse <a href="https://anderstech.net/ead/cursos">nossos cursos</a> e comece a aprender.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
            <p style="font-size:12px;color:#888">Anders Tech · anderstech.net</p>
          </div>`,
        });
      } catch (_) {}
    }

    res.json({ ok: true, user: req.session.eadUser });
  } catch (err) {
    console.error('EAD register error:', err);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

router.post('/ead/api/login', loginRateLimit, async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha sao obrigatorios' });
  if (!sql) return res.status(500).json({ error: 'Banco de dados nao configurado' });

  try {
    const users = await sql`SELECT id, email, senha_hash, nome, ativo FROM ead_users WHERE email = ${email.toLowerCase().trim()}`;
    if (!users.length) return res.status(401).json({ error: 'Email ou senha incorretos' });
    const user = users[0];
    if (!user.ativo) return res.status(403).json({ error: 'Conta desativada.' });

    const valid = await bcrypt.compare(senha, user.senha_hash);
    if (!valid) return res.status(401).json({ error: 'Email ou senha incorretos' });

    req.session.eadUser = { id: user.id, email: user.email, nome: user.nome };
    res.json({ ok: true, user: req.session.eadUser });
  } catch (err) {
    console.error('EAD login error:', err);
    res.status(500).json({ error: 'Erro ao autenticar' });
  }
});

router.post('/ead/api/logout', (req, res) => {
  delete req.session.eadUser;
  res.json({ ok: true });
});

router.get('/ead/api/me', requireEadAuth, (req, res) => {
  res.json(req.session.eadUser);
});

// ═══════════════════════════════════════════════════════════════════
// Student: My courses, progress, player
// ═══════════════════════════════════════════════════════════════════

router.get('/ead/api/my-courses', requireEadAuth, async (req, res) => {
  if (!sql) return res.json([]);
  try {
    const userId = req.session.eadUser.id;
    const courses = await sql`
      SELECT c.*, e.created_at AS enrolled_at,
        (SELECT COUNT(*)::int FROM ead_lessons l JOIN ead_modules m ON l.module_id = m.id WHERE m.course_id = c.id) AS total_aulas,
        (SELECT COUNT(*)::int FROM ead_progress p JOIN ead_lessons l ON p.lesson_id = l.id JOIN ead_modules m ON l.module_id = m.id WHERE m.course_id = c.id AND p.user_id = ${userId} AND p.completed = true) AS aulas_completas,
        (SELECT code FROM ead_certificates cert WHERE cert.user_id = ${userId} AND cert.course_id = c.id LIMIT 1) AS certificate_code
      FROM ead_courses c
      JOIN ead_enrollments e ON e.course_id = c.id AND e.user_id = ${userId}
      ORDER BY e.created_at DESC
    `;
    res.json(courses);
  } catch (err) {
    console.error('EAD my-courses error:', err);
    res.status(500).json({ error: 'Erro ao buscar cursos' });
  }
});

router.get('/ead/api/player/:courseSlug', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(404).json({ error: 'Curso nao encontrado' });
  try {
    const userId = req.session.eadUser.id;
    const slug = req.params.courseSlug;

    const courses = await sql`SELECT * FROM ead_courses WHERE slug = ${slug}`;
    if (!courses.length) return res.status(404).json({ error: 'Curso nao encontrado' });
    const course = courses[0];

    const enrolled = await sql`SELECT id FROM ead_enrollments WHERE user_id = ${userId} AND course_id = ${course.id}`;
    if (!enrolled.length) return res.status(403).json({ error: 'Voce nao esta matriculado neste curso' });

    const modules = await sql`
      SELECT m.*,
        (SELECT json_agg(json_build_object(
          'id', l.id, 'slug', l.slug, 'titulo', l.titulo, 'duracao', l.duracao, 'ordem', l.ordem,
          'entregavel_titulo', l.entregavel_titulo,
          'completed', COALESCE((SELECT p.completed FROM ead_progress p WHERE p.user_id = ${userId} AND p.lesson_id = l.id), false)
        ) ORDER BY l.ordem) FROM ead_lessons l WHERE l.module_id = m.id) AS aulas
      FROM ead_modules m WHERE m.course_id = ${course.id} ORDER BY m.ordem
    `;

    res.json({ course, modules });
  } catch (err) {
    console.error('EAD player error:', err);
    res.status(500).json({ error: 'Erro ao carregar curso' });
  }
});

router.get('/ead/api/lesson/:lessonId', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(404).json({ error: 'Aula nao encontrada' });
  try {
    const userId = req.session.eadUser.id;
    const lessonId = parseInt(req.params.lessonId, 10);

    const lessons = await sql`
      SELECT l.*, m.course_id, m.titulo AS module_titulo
      FROM ead_lessons l JOIN ead_modules m ON l.module_id = m.id
      WHERE l.id = ${lessonId}
    `;
    if (!lessons.length) return res.status(404).json({ error: 'Aula nao encontrada' });
    const lesson = lessons[0];

    const enrolled = await sql`SELECT id FROM ead_enrollments WHERE user_id = ${userId} AND course_id = ${lesson.course_id}`;
    if (!enrolled.length) return res.status(403).json({ error: 'Voce nao esta matriculado neste curso' });

    const progress = await sql`SELECT completed FROM ead_progress WHERE user_id = ${userId} AND lesson_id = ${lessonId}`;

    const nav = await sql`
      SELECT l.id, l.titulo, l.ordem, m.ordem AS module_ordem
      FROM ead_lessons l JOIN ead_modules m ON l.module_id = m.id
      WHERE m.course_id = ${lesson.course_id}
      ORDER BY m.ordem, l.ordem
    `;
    const idx = nav.findIndex(n => n.id === lessonId);
    const prev = idx > 0 ? nav[idx - 1] : null;
    const next = idx < nav.length - 1 ? nav[idx + 1] : null;

    res.json({
      ...lesson,
      completed: progress[0]?.completed || false,
      prev: prev ? { id: prev.id, titulo: prev.titulo } : null,
      next: next ? { id: next.id, titulo: next.titulo } : null,
    });
  } catch (err) {
    console.error('EAD lesson error:', err);
    res.status(500).json({ error: 'Erro ao carregar aula' });
  }
});

router.post('/ead/api/lesson/:lessonId/complete', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'DB nao configurado' });
  try {
    const userId = req.session.eadUser.id;
    const lessonId = parseInt(req.params.lessonId, 10);

    await sql`
      INSERT INTO ead_progress (user_id, lesson_id, completed, completed_at)
      VALUES (${userId}, ${lessonId}, true, NOW())
      ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = true, completed_at = NOW()
    `;
    res.json({ ok: true });
  } catch (err) {
    console.error('EAD complete error:', err);
    res.status(500).json({ error: 'Erro ao salvar progresso' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Quizzes
// ═══════════════════════════════════════════════════════════════════

router.get('/ead/api/quiz/:courseSlug', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(404).json({ error: 'Quiz nao encontrado' });
  try {
    const userId = req.session.eadUser.id;
    const slug = req.params.courseSlug;
    const isFinal = req.query.final === '1';
    const moduleId = req.query.module ? parseInt(req.query.module, 10) : null;

    const courses = await sql`SELECT id, titulo FROM ead_courses WHERE slug = ${slug}`;
    if (!courses.length) return res.status(404).json({ error: 'Curso nao encontrado' });
    const course = courses[0];

    const enrolled = await sql`SELECT id FROM ead_enrollments WHERE user_id = ${userId} AND course_id = ${course.id}`;
    if (!enrolled.length) return res.status(403).json({ error: 'Nao matriculado' });

    let questions;
    if (isFinal) {
      questions = await sql`SELECT id, pergunta, alternativas FROM ead_quiz_questions WHERE course_id = ${course.id} AND is_final = true ORDER BY id`;
    } else if (moduleId) {
      questions = await sql`SELECT id, pergunta, alternativas FROM ead_quiz_questions WHERE module_id = ${moduleId} AND is_final = false ORDER BY id`;
    } else {
      return res.status(400).json({ error: 'Especifique module ou final' });
    }

    res.json({ course: course.titulo, questions });
  } catch (err) {
    console.error('EAD quiz error:', err);
    res.status(500).json({ error: 'Erro ao carregar quiz' });
  }
});

router.post('/ead/api/quiz/:courseSlug/submit', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'DB nao configurado' });
  try {
    const userId = req.session.eadUser.id;
    const slug = req.params.courseSlug;
    const { answers, isFinal, moduleId } = req.body;

    const courses = await sql`SELECT id FROM ead_courses WHERE slug = ${slug}`;
    if (!courses.length) return res.status(404).json({ error: 'Curso nao encontrado' });
    const courseId = courses[0].id;

    let questions;
    if (isFinal) {
      questions = await sql`SELECT id, resposta_correta, explicacao FROM ead_quiz_questions WHERE course_id = ${courseId} AND is_final = true ORDER BY id`;
    } else {
      questions = await sql`SELECT id, resposta_correta, explicacao FROM ead_quiz_questions WHERE module_id = ${moduleId} AND is_final = false ORDER BY id`;
    }

    let correct = 0;
    const results = questions.map(q => {
      const userAnswer = answers[String(q.id)];
      const isCorrect = userAnswer === q.resposta_correta;
      if (isCorrect) correct++;
      return { questionId: q.id, correct: isCorrect, correctAnswer: q.resposta_correta, explicacao: q.explicacao };
    });

    const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    const passed = score >= 70;

    await sql`
      INSERT INTO ead_quiz_attempts (user_id, course_id, module_id, is_final, score, total_questions, correct_answers, passed)
      VALUES (${userId}, ${courseId}, ${moduleId || null}, ${!!isFinal}, ${score}, ${questions.length}, ${correct}, ${passed})
    `;

    let certificateCode = null;
    if (isFinal && passed) {
      const existing = await sql`SELECT code FROM ead_certificates WHERE user_id = ${userId} AND course_id = ${courseId}`;
      if (existing.length) {
        certificateCode = existing[0].code;
      } else {
        certificateCode = 'AT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        await sql`INSERT INTO ead_certificates (user_id, course_id, code) VALUES (${userId}, ${courseId}, ${certificateCode})`;
      }
    }

    res.json({ score, total: questions.length, correct, passed, results, certificateCode });
  } catch (err) {
    console.error('EAD quiz submit error:', err);
    res.status(500).json({ error: 'Erro ao processar quiz' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Certificate PDF
// ═══════════════════════════════════════════════════════════════════

router.get('/ead/api/certificate/:code', async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'DB nao configurado' });
  try {
    const code = req.params.code;
    const certs = await sql`
      SELECT cert.*, u.nome AS aluno_nome, c.titulo AS curso_titulo, c.carga_horaria
      FROM ead_certificates cert
      JOIN ead_users u ON u.id = cert.user_id
      JOIN ead_courses c ON c.id = cert.course_id
      WHERE cert.code = ${code}
    `;
    if (!certs.length) return res.status(404).json({ error: 'Certificado nao encontrado' });
    const cert = certs[0];

    if (req.query.format === 'json') {
      return res.json({ nome: cert.aluno_nome, curso: cert.curso_titulo, carga: cert.carga_horaria, code: cert.code, data: cert.created_at });
    }

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="certificado-${code}.pdf"`);
    doc.pipe(res);

    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).stroke('#0b1730');
    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).lineWidth(0.5).stroke('#c5383c');

    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica').fillColor('#0b1730').text('ANDERS TECH', { align: 'center' });
    doc.fontSize(10).fillColor('#666').text('Gestao com Tecnologia · Qualidade & Conformidade', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(28).font('Helvetica-Bold').fillColor('#0b1730').text('CERTIFICADO DE CONCLUSAO', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(12).font('Helvetica').fillColor('#333').text('Certificamos que', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#0b1730').text(cert.aluno_nome, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').fillColor('#333').text('concluiu com aproveitamento o curso', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#c5383c').text(cert.curso_titulo, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').fillColor('#333').text(`com carga horaria de ${cert.carga_horaria}`, { align: 'center' });
    doc.moveDown(2);

    const dataFormatada = new Date(cert.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.fontSize(11).fillColor('#333').text(`Passo Fundo, ${dataFormatada}`, { align: 'center' });
    doc.moveDown(2);

    doc.moveTo(200, doc.y).lineTo(400, doc.y).stroke('#333');
    doc.moveDown(0.3);
    doc.fontSize(10).text('Daniel Anders', { align: 'center' });
    doc.fontSize(9).fillColor('#666').text('Anders Tech · Consultor de Qualidade', { align: 'center' });

    doc.moveDown(1.5);
    doc.fontSize(8).fillColor('#999').text(`Codigo de verificacao: ${cert.code}`, { align: 'center' });
    doc.text('Verifique em: anderstech.net/ead/certificado/' + cert.code, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('EAD certificate error:', err);
    res.status(500).json({ error: 'Erro ao gerar certificado' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Checkout / Payment (Mercado Pago)
// ═══════════════════════════════════════════════════════════════════

router.post('/ead/api/checkout', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'DB nao configurado' });
  try {
    const userId = req.session.eadUser.id;
    const { courseSlug, metodo } = req.body;

    const courses = await sql`SELECT * FROM ead_courses WHERE slug = ${courseSlug} AND ativo = true`;
    if (!courses.length) return res.status(404).json({ error: 'Curso nao encontrado' });
    const course = courses[0];

    const existing = await sql`SELECT id FROM ead_enrollments WHERE user_id = ${userId} AND course_id = ${course.id}`;
    if (existing.length) return res.status(400).json({ error: 'Voce ja esta matriculado neste curso' });

    if (promoAtiva()) {
      const order = await sql`
        INSERT INTO ead_orders (user_id, course_id, valor, metodo, status, paid_at)
        VALUES (${userId}, ${course.id}, 0, 'promo_lancamento', 'aprovado', NOW()) RETURNING id
      `;
      await sql`INSERT INTO ead_enrollments (user_id, course_id, order_id) VALUES (${userId}, ${course.id}, ${order[0].id})`;
      return res.json({ ok: true, status: 'aprovado', redirect: '/ead/meus-cursos' });
    }

    const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_TOKEN) {
      const order = await sql`
        INSERT INTO ead_orders (user_id, course_id, valor, metodo, status, paid_at)
        VALUES (${userId}, ${course.id}, ${course.preco}, 'dev_free', 'aprovado', NOW()) RETURNING id
      `;
      await sql`INSERT INTO ead_enrollments (user_id, course_id, order_id) VALUES (${userId}, ${course.id}, ${order[0].id})`;
      return res.json({ ok: true, status: 'aprovado', redirect: '/ead/meus-cursos' });
    }

    if (metodo === 'pix') {
      const order = await sql`
        INSERT INTO ead_orders (user_id, course_id, valor, metodo, status)
        VALUES (${userId}, ${course.id}, ${course.preco}, 'pix', 'pendente') RETURNING id
      `;

      const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MP_TOKEN}`, 'X-Idempotency-Key': `ead-${order[0].id}` },
        body: JSON.stringify({
          transaction_amount: Number(course.preco),
          description: `Curso: ${course.titulo}`,
          payment_method_id: 'pix',
          payer: { email: req.session.eadUser.email },
          external_reference: `ead-order-${order[0].id}`,
          notification_url: `https://anderstech.net/ead/api/webhook/mp`,
        }),
      });
      const mpData = await mpRes.json();

      if (mpData.id) {
        await sql`UPDATE ead_orders SET mp_payment_id = ${String(mpData.id)}, pix_qr_code = ${mpData.point_of_interaction?.transaction_data?.qr_code || null}, pix_qr_code_base64 = ${mpData.point_of_interaction?.transaction_data?.qr_code_base64 || null} WHERE id = ${order[0].id}`;
        return res.json({
          ok: true, status: 'pix_pending', orderId: order[0].id,
          qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
          qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
        });
      } else {
        return res.status(500).json({ error: 'Erro ao gerar PIX', detail: mpData.message });
      }
    }

    // Credit card / Mercado Pago Checkout Pro
    const order = await sql`
      INSERT INTO ead_orders (user_id, course_id, valor, metodo, status)
      VALUES (${userId}, ${course.id}, ${course.preco}, 'checkout_pro', 'pendente') RETURNING id
    `;

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MP_TOKEN}` },
      body: JSON.stringify({
        items: [{ title: course.titulo, quantity: 1, unit_price: Number(course.preco), currency_id: 'BRL' }],
        payer: { email: req.session.eadUser.email },
        external_reference: `ead-order-${order[0].id}`,
        back_urls: {
          success: `https://anderstech.net/ead/checkout/sucesso?order=${order[0].id}`,
          failure: `https://anderstech.net/ead/checkout/erro?order=${order[0].id}`,
          pending: `https://anderstech.net/ead/checkout/pendente?order=${order[0].id}`,
        },
        auto_return: 'approved',
        notification_url: `https://anderstech.net/ead/api/webhook/mp`,
      }),
    });
    const mpData = await mpRes.json();

    if (mpData.id) {
      await sql`UPDATE ead_orders SET mp_preference_id = ${mpData.id} WHERE id = ${order[0].id}`;
      return res.json({ ok: true, status: 'redirect', init_point: mpData.init_point, orderId: order[0].id });
    }

    res.status(500).json({ error: 'Erro ao criar checkout' });
  } catch (err) {
    console.error('EAD checkout error:', err);
    res.status(500).json({ error: 'Erro no checkout' });
  }
});

// Mercado Pago webhook
router.post('/ead/api/webhook/mp', async (req, res) => {
  if (!sql) return res.sendStatus(200);
  try {
    const { type, data } = req.body;
    if (type !== 'payment' || !data?.id) return res.sendStatus(200);

    const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_TOKEN) return res.sendStatus(200);

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { 'Authorization': `Bearer ${MP_TOKEN}` },
    });
    const payment = await mpRes.json();

    if (!payment.external_reference?.startsWith('ead-order-')) return res.sendStatus(200);
    const orderId = parseInt(payment.external_reference.replace('ead-order-', ''), 10);

    if (payment.status === 'approved') {
      const orders = await sql`SELECT * FROM ead_orders WHERE id = ${orderId} AND status != 'aprovado'`;
      if (orders.length) {
        const order = orders[0];
        await sql`UPDATE ead_orders SET status = 'aprovado', mp_payment_id = ${String(payment.id)}, paid_at = NOW() WHERE id = ${orderId}`;
        await sql`INSERT INTO ead_enrollments (user_id, course_id, order_id) VALUES (${order.user_id}, ${order.course_id}, ${orderId}) ON CONFLICT DO NOTHING`;

        if (resend) {
          const users = await sql`SELECT nome, email FROM ead_users WHERE id = ${order.user_id}`;
          const courses = await sql`SELECT titulo FROM ead_courses WHERE id = ${order.course_id}`;
          if (users.length && courses.length) {
            try {
              await resend.emails.send({
                from: 'Anders Tech Cursos <noreply@anderstech.net>',
                to: users[0].email,
                subject: `Matricula confirmada: ${courses[0].titulo}`,
                html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
                  <h2 style="color:#0b1730">Pagamento confirmado!</h2>
                  <p>Ola, ${users[0].nome.split(' ')[0]}! Seu pagamento foi aprovado e voce ja tem acesso ao curso <strong>${courses[0].titulo}</strong>.</p>
                  <p><a href="https://anderstech.net/ead/meus-cursos" style="display:inline-block;padding:12px 24px;background:#c5383c;color:#fff;text-decoration:none;font-weight:bold">Acessar meus cursos</a></p>
                  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
                  <p style="font-size:12px;color:#888">Anders Tech · anderstech.net</p>
                </div>`,
              });
            } catch (_) {}
          }
        }
      }
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      await sql`UPDATE ead_orders SET status = ${payment.status} WHERE id = ${orderId}`;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('EAD webhook error:', err);
    res.sendStatus(200);
  }
});

// Check order status (polling from frontend)
router.get('/ead/api/order/:orderId/status', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'DB nao configurado' });
  try {
    const orderId = parseInt(req.params.orderId, 10);
    const userId = req.session.eadUser.id;
    const orders = await sql`SELECT status FROM ead_orders WHERE id = ${orderId} AND user_id = ${userId}`;
    if (!orders.length) return res.status(404).json({ error: 'Pedido nao encontrado' });
    res.json({ status: orders[0].status });
  } catch (err) {
    res.status(500).json({ error: 'Erro' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Page serving
// ═══════════════════════════════════════════════════════════════════

function injectShared(html, urlPath) {
  try {
    const serverModule = join(projectRoot, 'server.js');
    return html;
  } catch { return html; }
}

function sendEadPage(filename, res) {
  try {
    const filePath = join(__dirname, 'pages', filename);
    if (!existsSync(filePath)) return false;
    res.type('html').send(readFileSync(filePath, 'utf8'));
    return true;
  } catch { return false; }
}

router.get('/ead', (req, res) => res.redirect('/ead/cursos'));
router.get('/ead/cursos', (req, res) => { if (!sendEadPage('cursos.html', res)) res.redirect('/'); });
router.get('/ead/curso/:slug', (req, res) => { if (!sendEadPage('curso-detail.html', res)) res.redirect('/ead/cursos'); });
router.get('/ead/login', (req, res) => {
  if (req.session?.eadUser) return res.redirect('/ead/meus-cursos');
  if (!sendEadPage('login.html', res)) res.redirect('/');
});
router.get('/ead/registro', (req, res) => {
  if (req.session?.eadUser) return res.redirect('/ead/meus-cursos');
  if (!sendEadPage('registro.html', res)) res.redirect('/');
});
router.get('/ead/meus-cursos', requireEadAuth, (req, res) => { if (!sendEadPage('meus-cursos.html', res)) res.redirect('/ead/cursos'); });
router.get('/ead/player/:slug', requireEadAuth, (req, res) => { if (!sendEadPage('player.html', res)) res.redirect('/ead/meus-cursos'); });
router.get('/ead/checkout/:slug', requireEadAuth, (req, res) => { if (!sendEadPage('checkout.html', res)) res.redirect('/ead/cursos'); });
router.get('/ead/checkout/sucesso', requireEadAuth, (req, res) => { if (!sendEadPage('checkout-sucesso.html', res)) res.redirect('/ead/meus-cursos'); });
router.get('/ead/checkout/erro', requireEadAuth, (req, res) => { if (!sendEadPage('checkout-erro.html', res)) res.redirect('/ead/cursos'); });
router.get('/ead/checkout/pendente', requireEadAuth, (req, res) => { if (!sendEadPage('checkout-pendente.html', res)) res.redirect('/ead/meus-cursos'); });
router.get('/ead/certificado/:code', (req, res) => { if (!sendEadPage('certificado.html', res)) res.redirect('/ead/cursos'); });

export { router as eadRouter, initEadDB };
