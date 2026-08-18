import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { injectShared } from '../inject.js';
import { eadBoasVindas, eadMatriculaConfirmada } from '../emails.js';
import * as asaas from './asaas.js';
import { criarToken, consumirToken, emailReset } from '../db/senha.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// #49: dominio por ambiente. Sem isso, so era possivel exercitar pagamento em producao.
const APP_URL = process.env.APP_URL || 'https://anderstech.net';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const router = Router();

// ═══════════════════════════════════════════════════════════════════
// Launch promotion — data parametrizada em promo.js (env EAD_PROMO_FIM)
// ═══════════════════════════════════════════════════════════════════
import { PROMO, promoAtiva } from '../promo.js';

// ═══════════════════════════════════════════════════════════════════
// Database initialization
// ═══════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════
// Auth middleware
// ═══════════════════════════════════════════════════════════════════

function requireEadAuth(req, res, next) {
  if (!req.session?.eadUser) {
    if (req.path.startsWith('/ead/api/')) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    return res.redirect('/ead/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
}


// Rate limiting for registration
const regAttempts = new Map();
// #40: os Maps cresciam sem limite. Varredura periodica das janelas vencidas.
setInterval(() => {
  const agora = Date.now();
  for (const [m, janela] of [[regAttempts, 60 * 60_000], [loginAttempts, 15 * 60_000]]) {
    for (const [k, v] of m) if (agora - v.start > janela) m.delete(k);
  }
}, 10 * 60_000).unref();
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
    let enrolledSlugs = [];
    if (req.session?.eadUser) {
      const enr = await sql`SELECT c.slug FROM ead_enrollments e JOIN ead_courses c ON c.id = e.course_id WHERE e.user_id = ${req.session.eadUser.id} AND e.revogada_em IS NULL`;
      enrolledSlugs = enr.map(r => r.slug);
    }
    const result = courses.map(c => ({ ...c, promo_gratuito: promo, enrolled: enrolledSlugs.includes(c.slug) }));
    // #62: a pagina fazia uma chamada separada a /ead/api/promo so pela data.
    res.json({ courses: result, promo: promo ? { ativa: true, fim: PROMO.fim.toISOString(), label: PROMO.label } : { ativa: false } });
  } catch (err) {
    console.error('EAD courses error:', err);
    res.status(500).json({ error: 'Erro ao buscar cursos' });
  }
});

router.get('/ead/api/courses/:slug', async (req, res) => {
  if (!sql) return res.status(404).json({ error: 'Curso não encontrado' });
  try {
    const slug = req.params.slug;
    const courses = await sql`SELECT * FROM ead_courses WHERE slug = ${slug} AND ativo = true`;
    if (!courses.length) return res.status(404).json({ error: 'Curso não encontrado' });
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
      const enr = await sql`SELECT id FROM ead_enrollments WHERE user_id = ${req.session.eadUser.id} AND course_id = ${course.id} AND revogada_em IS NULL`;
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
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  if (senha.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  if (!sql) return res.status(500).json({ error: 'Banco de dados não configurado' });

  try {
    const existing = await sql`SELECT id FROM ead_users WHERE email = ${email.toLowerCase().trim()}`;
    if (existing.length) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const hash = await bcrypt.hash(senha, 10);
    const result = await sql`
      INSERT INTO ead_users (email, senha_hash, nome, telefone, empresa)
      VALUES (${email.toLowerCase().trim()}, ${hash}, ${nome.trim()}, ${telefone || null}, ${empresa || null})
      RETURNING id, email, nome
    `;

    const user = result[0];
    // #37: sem regenerate, o id de sessao anterior ao login seguia valido.
    await new Promise((ok, no) => req.session.regenerate(e => (e ? no(e) : ok())));
    req.session.eadUser = { id: user.id, email: user.email, nome: user.nome };

    if (resend) {
      try {
        await resend.emails.send({
          from: 'Anders Tech Cursos <noreply@anderstech.net>',
          to: user.email,
          subject: `${user.nome.split(' ')[0]}, bem-vindo aos Cursos Anders Tech`,
          html: eadBoasVindas({ nome: user.nome }),
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
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  if (!sql) return res.status(500).json({ error: 'Banco de dados não configurado' });

  try {
    const users = await sql`SELECT id, email, senha_hash, nome, ativo FROM ead_users WHERE email = ${email.toLowerCase().trim()}`;
    if (!users.length) return res.status(401).json({ error: 'Email ou senha incorretos' });
    const user = users[0];
    if (!user.ativo) return res.status(403).json({ error: 'Conta desativada.' });

    const valid = await bcrypt.compare(senha, user.senha_hash);
    if (!valid) return res.status(401).json({ error: 'Email ou senha incorretos' });

    await new Promise((ok, no) => req.session.regenerate(e => (e ? no(e) : ok())));
    req.session.eadUser = { id: user.id, email: user.email, nome: user.nome };
    res.json({ ok: true, user: req.session.eadUser });
  } catch (err) {
    console.error('EAD login error:', err);
    res.status(500).json({ error: 'Erro ao autenticar' });
  }
});

router.post('/ead/api/logout', (req, res) => {
  // #45: antes so apagava a propriedade; o id de sessao seguia valido 24h.
  req.session.destroy(() => res.json({ ok: true }));
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
      JOIN ead_enrollments e ON e.course_id = c.id AND e.user_id = ${userId} AND e.revogada_em IS NULL
      ORDER BY e.created_at DESC
    `;
    res.json(courses);
  } catch (err) {
    console.error('EAD my-courses error:', err);
    res.status(500).json({ error: 'Erro ao buscar cursos' });
  }
});

router.get('/ead/api/player/:courseSlug', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(404).json({ error: 'Curso não encontrado' });
  try {
    const userId = req.session.eadUser.id;
    const slug = req.params.courseSlug;

    const courses = await sql`SELECT * FROM ead_courses WHERE slug = ${slug}`;
    if (!courses.length) return res.status(404).json({ error: 'Curso não encontrado' });
    const course = courses[0];

    const enrolled = await sql`SELECT id FROM ead_enrollments WHERE user_id = ${userId} AND course_id = ${course.id} AND revogada_em IS NULL`;
    if (!enrolled.length) return res.status(403).json({ error: 'Você não está matriculado neste curso' });

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
  if (!sql) return res.status(404).json({ error: 'Aula não encontrada' });
  try {
    const userId = req.session.eadUser.id;
    const lessonId = parseInt(req.params.lessonId, 10);

    const lessons = await sql`
      SELECT l.*, m.course_id, m.titulo AS module_titulo
      FROM ead_lessons l JOIN ead_modules m ON l.module_id = m.id
      WHERE l.id = ${lessonId}
    `;
    if (!lessons.length) return res.status(404).json({ error: 'Aula não encontrada' });
    const lesson = lessons[0];

    const enrolled = await sql`SELECT id FROM ead_enrollments WHERE user_id = ${userId} AND course_id = ${lesson.course_id} AND revogada_em IS NULL`;
    if (!enrolled.length) return res.status(403).json({ error: 'Você não está matriculado neste curso' });

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
  if (!sql) return res.status(500).json({ error: 'DB não configurado' });
  try {
    const userId = req.session.eadUser.id;
    const lessonId = parseInt(req.params.lessonId, 10);

    // #36: era a unica rota da familia sem checagem de matricula. Mesmo padrao
    // de GET /ead/api/lesson/:lessonId e /ead/api/template/:lessonId.
    const aula = await sql`
      SELECT l.id, m.course_id FROM ead_lessons l
      JOIN ead_modules m ON l.module_id = m.id WHERE l.id = ${lessonId}
    `;
    if (!aula.length) return res.status(404).json({ error: 'Aula não encontrada' });
    const matriculado = await sql`
      SELECT id FROM ead_enrollments
      WHERE user_id = ${userId} AND course_id = ${aula[0].course_id} AND revogada_em IS NULL
    `;
    if (!matriculado.length) return res.status(403).json({ error: 'Você não está matriculado neste curso' });

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
  if (!sql) return res.status(404).json({ error: 'Quiz não encontrado' });
  try {
    const userId = req.session.eadUser.id;
    const slug = req.params.courseSlug;
    const isFinal = req.query.final === '1';
    const moduleId = req.query.module ? parseInt(req.query.module, 10) : null;

    const courses = await sql`SELECT id, titulo FROM ead_courses WHERE slug = ${slug}`;
    if (!courses.length) return res.status(404).json({ error: 'Curso não encontrado' });
    const course = courses[0];

    const enrolled = await sql`SELECT id FROM ead_enrollments WHERE user_id = ${userId} AND course_id = ${course.id} AND revogada_em IS NULL`;
    if (!enrolled.length) return res.status(403).json({ error: 'Não matriculado' });

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
  if (!sql) return res.status(500).json({ error: 'DB não configurado' });
  try {
    const userId = req.session.eadUser.id;
    const slug = req.params.courseSlug;
    const { answers, isFinal, moduleId } = req.body;

    const courses = await sql`SELECT id FROM ead_courses WHERE slug = ${slug}`;
    if (!courses.length) return res.status(404).json({ error: 'Curso não encontrado' });
    const courseId = courses[0].id;

    // C4: checagem de matricula antes de processar quiz
    const enrolled = await sql`SELECT id FROM ead_enrollments WHERE user_id = ${userId} AND course_id = ${courseId} AND revogada_em IS NULL`;
    if (!enrolled.length) return res.status(403).json({ error: 'Você não está matriculado neste curso' });

    let questions;
    if (isFinal) {
      questions = await sql`SELECT id, resposta_correta, explicacao FROM ead_quiz_questions WHERE course_id = ${courseId} AND is_final = true ORDER BY id`;
    } else {
      const mod = await sql`SELECT id FROM ead_modules WHERE id = ${moduleId} AND course_id = ${courseId}`;
      if (!mod.length) return res.status(400).json({ error: 'Módulo não pertence a este curso' });
      questions = await sql`SELECT id, resposta_correta, explicacao FROM ead_quiz_questions WHERE module_id = ${moduleId} AND is_final = false ORDER BY id`;
    }

    // #32: sem isso, corpo sem `answers` derrubava a rota com 500.
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Respostas não enviadas' });
    }

    let correct = 0;
    const parciais = questions.map(q => ({
      questionId: q.id,
      correct: answers[String(q.id)] === q.resposta_correta,
      correctAnswer: q.resposta_correta,
      explicacao: q.explicacao,
    }));
    correct = parciais.filter(r => r.correct).length;

    const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    const passed = score >= 70;

    // #8: o gabarito foi removido para não permitir farm por tentativa, mas o
    // player continuou lendo `correctAnswer` e nenhuma alternativa era destacada.
    // Revela só a quem já passou — mantém o valor pedagógico sem abrir o farm.
    const results = parciais.map(r => passed
      ? r
      : { questionId: r.questionId, correct: r.correct, explicacao: r.explicacao });

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
        // #46: 4 bytes davam 2^32. 12 bytes tiram a enumeracao do horizonte.
        certificateCode = 'AT-' + crypto.randomBytes(12).toString('hex').toUpperCase();
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
// Template PDF download
// ═══════════════════════════════════════════════════════════════════

router.get('/ead/api/template/:lessonId', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'DB não configurado' });
  try {
    const userId = req.session.eadUser.id;
    const lessonId = parseInt(req.params.lessonId);

    // C5: checagem de matricula (mesmo padrao de GET /ead/api/lesson/:lessonId)
    const lessonCheck = await sql`
      SELECT l.id, m.course_id
      FROM ead_lessons l JOIN ead_modules m ON l.module_id = m.id
      WHERE l.id = ${lessonId}
    `;
    if (!lessonCheck.length) return res.status(404).json({ error: 'Aula não encontrada' });

    const enrolled = await sql`SELECT id FROM ead_enrollments WHERE user_id = ${userId} AND course_id = ${lessonCheck[0].course_id} AND revogada_em IS NULL`;
    if (!enrolled.length) return res.status(403).json({ error: 'Você não está matriculado neste curso' });

    const rows = await sql`
      SELECT l.titulo AS lesson_titulo, l.conteudo,
             m.titulo AS module_titulo, c.titulo AS course_titulo
      FROM ead_lessons l
      JOIN ead_modules m ON m.id = l.module_id
      JOIN ead_courses c ON c.id = m.course_id
      WHERE l.id = ${lessonId}
    `;
    if (!rows.length) return res.status(404).json({ error: 'Aula não encontrada' });
    const row = rows[0];

    const templateTitle = String(req.query.t || 'Template').substring(0, 120);
    const cleanTitle = templateTitle
      .replace(/^(download|baixar)[:\s]+/i, '')
      .replace(/^template:\s*/i, '')
      .trim() || 'Template';

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const safeFilename = cleanTitle.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').substring(0, 60) || 'template';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="template-${safeFilename}.pdf"`);
    doc.pipe(res);

    const NAVY = '#0b1730';
    const RED = '#c5383c';
    const GRAY = '#666666';
    const LIGHT = '#f4f5f7';
    const pw = doc.page.width - 100;

    doc.rect(0, 0, doc.page.width, 80).fill(NAVY);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#ffffff').text('ANDERS TECH', 50, 25);
    doc.fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.6)').text('Gestão com Tecnologia', 50, 45);
    doc.fillColor(RED).rect(50, 65, 60, 3).fill(RED);

    doc.moveDown(4);
    doc.fontSize(18).font('Helvetica-Bold').fillColor(NAVY).text(cleanTitle, 50, 100, { width: pw });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor(GRAY).text(`Curso: ${row.course_titulo}  |  Módulo: ${row.module_titulo}  |  Aula: ${row.lesson_titulo}`, 50, doc.y, { width: pw });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(50 + pw, doc.y).lineWidth(0.5).stroke('#e5e7eb');
    doc.moveDown(1);

    // matching sem acentos: titulos vem acentuados do conteudo ("Comparação", "Padronização")
    const t = cleanTitle.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const startY = doc.y;

    if (t.includes('checklist') || t.includes('check-list')) {
      const items = extractListItems(row.conteudo, cleanTitle);
      doc.fontSize(11).font('Helvetica').fillColor('#333');
      items.forEach((item, i) => {
        if (doc.y > 720) { doc.addPage(); }
        const y = doc.y;
        doc.rect(50, y, 14, 14).lineWidth(1).stroke(NAVY);
        doc.text(item, 72, y + 1, { width: pw - 22 });
        doc.moveDown(0.6);
      });
    } else if (t.includes('tabela comparativa') || t.includes('comparativo') || t.includes('comparacao')) {
      const cols = ['Aspecto', 'Antes / Versao anterior', 'Depois / Versao atual', 'Impacto'];
      drawTable(doc, cols, 8, pw, NAVY);
    } else if (t.includes('matriz') || t.includes('planilha')) {
      const cols = detectColumns(cleanTitle);
      drawTable(doc, cols, 10, pw, NAVY);
    } else if (t.includes('mapa') || t.includes('quadro')) {
      const items = extractListItems(row.conteudo, cleanTitle);
      doc.fontSize(11).font('Helvetica').fillColor('#333');
      items.forEach((item, i) => {
        if (doc.y > 720) { doc.addPage(); }
        doc.font('Helvetica-Bold').fillColor(NAVY).text(`${i + 1}. ${item}`, 50, doc.y, { width: pw });
        doc.moveDown(0.2);
        doc.font('Helvetica').fillColor(GRAY).text('Observações: ________________________________________________________', 66, doc.y, { width: pw - 16 });
        doc.moveDown(0.8);
      });
    } else if (t.includes('modelo') || t.includes('template') || t.includes('ficha')) {
      const fields = detectFields(cleanTitle);
      doc.fontSize(11).font('Helvetica');
      fields.forEach(f => {
        if (doc.y > 700) { doc.addPage(); }
        doc.font('Helvetica-Bold').fillColor(NAVY).text(f, 50, doc.y, { width: pw });
        doc.moveDown(0.3);
        doc.moveTo(50, doc.y).lineTo(50 + pw, doc.y).lineWidth(0.3).stroke('#ccc');
        doc.moveDown(0.2);
        doc.moveTo(50, doc.y).lineTo(50 + pw, doc.y).lineWidth(0.3).stroke('#ccc');
        doc.moveDown(0.8);
      });
    } else {
      const cols = detectColumns(cleanTitle);
      drawTable(doc, cols, 10, pw, NAVY);
    }

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#999').text(
        `Anders Tech  ·  ${cleanTitle}  ·  Página ${i + 1}/${pageCount}`,
        50, doc.page.height - 35, { width: pw, align: 'center' }
      );
    }

    doc.end();
  } catch (err) {
    console.error('EAD template error:', err);
    res.status(500).json({ error: 'Erro ao gerar template' });
  }
});

function extractListItems(conteudo, title) {
  if (!conteudo) return defaultItems();
  const items = [];
  const liMatches = conteudo.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
  liMatches.forEach(li => {
    const text = li.replace(/<[^>]+>/g, '').trim();
    if (text.length > 5 && text.length < 200) items.push(text);
  });
  const strongMatches = conteudo.match(/<strong>([\s\S]*?)<\/strong>/gi) || [];
  strongMatches.forEach(s => {
    const text = s.replace(/<[^>]+>/g, '').trim();
    if (text.length > 3 && text.length < 120 && !text.toLowerCase().includes('exemplo') && !text.toLowerCase().includes('importante')) {
      if (!items.includes(text)) items.push(text);
    }
  });
  if (items.length < 5) return defaultItems().concat(items).slice(0, 15);
  return items.slice(0, 20);
}

function defaultItems() {
  return [
    'Item 1: _______________________________________',
    'Item 2: _______________________________________',
    'Item 3: _______________________________________',
    'Item 4: _______________________________________',
    'Item 5: _______________________________________',
    'Item 6: _______________________________________',
    'Item 7: _______________________________________',
    'Item 8: _______________________________________',
  ];
}

function normalizeTitle(title) {
  return title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function detectColumns(title) {
  const t = normalizeTitle(title);
  if (t.includes('risco')) return ['Risco / Oportunidade', 'Probabilidade', 'Impacto', 'Ação preventiva', 'Responsável', 'Prazo'];
  if (t.includes('objetivo') || t.includes('5w2h')) return ['Objetivo', 'O que', 'Por que', 'Quem', 'Quando', 'Como', 'Indicador'];
  if (t.includes('processo')) return ['Processo', 'Entrada', 'Atividades', 'Saída', 'Indicador', 'Responsável'];
  if (t.includes('parte') && t.includes('interessada')) return ['Parte interessada', 'Tipo', 'Requisitos', 'Prioridade', 'Ação'];
  if (t.includes('contexto') || t.includes('swot')) return ['Fator', 'Interno/Externo', 'Descrição', 'Impacto no SGQ', 'Ação'];
  if (t.includes('auditoria') || t.includes('audit')) return ['Requisito', 'Evidência esperada', 'Conformidade', 'Observação'];
  if (t.includes('competencia') || t.includes('treinamento')) return ['Cargo/Função', 'Competência necessária', 'Atual', 'Gap', 'Ação'];
  if (t.includes('indicador')) return ['Indicador', 'Fórmula', 'Meta', 'Frequência', 'Responsável', 'Resultado'];
  if (t.includes('acao') || t.includes('corretiva') || t.includes('nao conformidade')) return ['NC #', 'Descrição', 'Causa raiz', 'Ação corretiva', 'Responsável', 'Prazo', 'Status'];
  if (t.includes('fornecedor')) return ['Fornecedor', 'Material/Serviço', 'Critério', 'Avaliação', 'Status'];
  if (t.includes('documento') || t.includes('registro')) return ['Documento', 'Código', 'Versão', 'Responsável', 'Local', 'Retenção'];
  if (t.includes('clausula') || t.includes('pdca')) return ['Cláusula', 'Requisito-chave', 'Fase PDCA', 'Aplicação na empresa'];
  if (t.includes('politica')) return ['Componente', 'Descrição', 'Alinhamento estratégico', 'Responsável'];
  if (t.includes('5s') || t.includes('senso')) return ['Senso', 'Ação', 'Local', 'Responsável', 'Prazo', 'Status'];
  if (t.includes('desperdicio') || t.includes('muda')) return ['Desperdício', 'Descrição', 'Onde ocorre', 'Impacto', 'Ação'];
  return ['Item', 'Descrição', 'Responsável', 'Prazo', 'Status'];
}

function detectFields(title) {
  const t = normalizeTitle(title);
  if (t.includes('politica')) return ['Empresa:', 'Missão:', 'Visão:', 'Política da Qualidade:', 'Objetivos:', 'Aprovação:', 'Data:'];
  if (t.includes('contexto') || t.includes('swot')) return ['Empresa:', 'Forças (Strengths):', 'Fraquezas (Weaknesses):', 'Oportunidades (Opportunities):', 'Ameaças (Threats):', 'Fatores internos relevantes:', 'Fatores externos relevantes:', 'Implicações para o SGQ:'];
  if (t.includes('processo') || t.includes('ficha')) return ['Nome do processo:', 'Responsável (dono):', 'Objetivo:', 'Entradas:', 'Saídas:', 'Recursos necessários:', 'Indicadores:', 'Riscos associados:', 'Interação com outros processos:'];
  if (t.includes('auditoria') || t.includes('audit')) return ['Auditoria #:', 'Data:', 'Auditor líder:', 'Equipe:', 'Escopo:', 'Critério:', 'Resumo das constatações:', 'Não conformidades:', 'Oportunidades de melhoria:', 'Conclusão:'];
  return ['Empresa:', 'Responsável:', 'Data:', 'Objetivo:', 'Descrição:', 'Observações:', 'Aprovação:'];
}

function drawTable(doc, cols, numRows, pageWidth, headerColor) {
  const colWidth = Math.floor(pageWidth / cols.length);
  const startX = 50;
  let y = doc.y;

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
  cols.forEach((col, i) => {
    doc.rect(startX + i * colWidth, y, colWidth, 22).fill(headerColor);
    doc.fillColor('#ffffff').text(col, startX + i * colWidth + 4, y + 6, { width: colWidth - 8 });
  });
  doc.fillColor('#333');
  y += 22;

  doc.font('Helvetica').fontSize(9);
  for (let r = 0; r < numRows; r++) {
    if (y > 720) { doc.addPage(); y = 50; }
    const bg = r % 2 === 0 ? '#ffffff' : '#f8fafc';
    cols.forEach((_, i) => {
      doc.rect(startX + i * colWidth, y, colWidth, 28).fill(bg).stroke('#e5e7eb');
    });
    y += 28;
  }
  doc.y = y + 10;
}

// ═══════════════════════════════════════════════════════════════════
// Certificate PDF
// ═══════════════════════════════════════════════════════════════════

// #46: endpoint publico que devolve nome de pessoa. Limitador brando torna a
// sondagem cara sem atrapalhar quem so quer conferir um certificado.
const certAttempts = new Map();
setInterval(() => {
  const agora = Date.now();
  for (const [k, v] of certAttempts) if (agora - v.start > 60_000) certAttempts.delete(k);
}, 5 * 60_000).unref();

function certRateLimit(req, res, next) {
  const k = req.ip;
  const agora = Date.now();
  const e = certAttempts.get(k);
  if (e && agora - e.start < 60_000) {
    if (e.count >= 20) return res.status(429).json({ error: 'Muitas consultas. Aguarde um minuto.' });
    e.count++;
  } else certAttempts.set(k, { start: agora, count: 1 });
  next();
}

router.get('/ead/api/certificate/:code', certRateLimit, async (req, res) => {
  if (!sql) return res.status(500).json({ error: 'DB não configurado' });
  try {
    const code = req.params.code;
    const certs = await sql`
      SELECT cert.*, u.nome AS aluno_nome, c.titulo AS curso_titulo, c.carga_horaria
      FROM ead_certificates cert
      JOIN ead_users u ON u.id = cert.user_id
      JOIN ead_courses c ON c.id = cert.course_id
      WHERE cert.code = ${code}
    `;
    if (!certs.length) return res.status(404).json({ error: 'Certificado não encontrado' });
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
    doc.fontSize(10).fillColor('#666').text('Gestão com Tecnologia · Qualidade & Conformidade', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(28).font('Helvetica-Bold').fillColor('#0b1730').text('CERTIFICADO DE CONCLUSÃO', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(12).font('Helvetica').fillColor('#333').text('Certificamos que', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#0b1730').text(cert.aluno_nome, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').fillColor('#333').text('concluiu com aproveitamento o curso', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#c5383c').text(cert.curso_titulo, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').fillColor('#333').text(`com carga horária de ${cert.carga_horaria}`, { align: 'center' });
    doc.moveDown(2);

    const dataFormatada = new Date(cert.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.fontSize(11).fillColor('#333').text(`Passo Fundo, ${dataFormatada}`, { align: 'center' });
    doc.moveDown(2);

    doc.moveTo(200, doc.y).lineTo(400, doc.y).stroke('#333');
    doc.moveDown(0.3);
    doc.fontSize(10).text('Daniel Anders', { align: 'center' });
    doc.fontSize(9).fillColor('#666').text('Anders Tech · Consultor de Qualidade', { align: 'center' });

    doc.moveDown(1.5);
    doc.fontSize(8).fillColor('#999').text(`Código de verificação: ${cert.code}`, { align: 'center' });
    doc.text('Verifique em: ' + APP_URL.replace(/^https?:\/\//, '') + '/ead/certificado/' + cert.code, { align: 'center' });

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
  if (!sql) return res.status(503).json({ error: 'Serviço temporariamente indisponível' });
  if (!asaas.asaasConfigurado()) {
    // Fail-closed: sem chave, recusar em vez de liberar grátis.
    console.error('ASAAS_API_KEY não configurada — checkout recusado');
    return res.status(503).json({ error: 'Pagamento não configurado. Entre em contato com o suporte.' });
  }

  try {
    const userId = req.session.eadUser.id;
    const { courseSlug, metodo, cpfCnpj } = req.body;

    const courses = await sql`SELECT * FROM ead_courses WHERE slug = ${courseSlug} AND ativo = true`;
    if (!courses.length) return res.status(404).json({ error: 'Curso não encontrado' });
    const course = courses[0];

    const jaMatriculado = await sql`
      SELECT id FROM ead_enrollments
      WHERE user_id = ${userId} AND course_id = ${course.id} AND revogada_em IS NULL
    `;
    if (jaMatriculado.length) {
      return res.json({ ok: true, status: 'aprovado', redirect: '/ead/player/' + courseSlug });
    }

    const users = await sql`SELECT id, nome, email, telefone, cpf_cnpj, asaas_customer_id FROM ead_users WHERE id = ${userId}`;
    if (!users.length) return res.status(404).json({ error: 'Usuário não encontrado' });
    const user = users[0];

    let doc = user.cpf_cnpj || asaas.normalizaDoc(cpfCnpj);
    if (!doc) return res.status(400).json({ error: 'CPF ou CNPJ é obrigatório', precisaDocumento: true });
    if (!asaas.docValido(doc)) return res.status(400).json({ error: 'CPF ou CNPJ inválido', precisaDocumento: true });
    doc = asaas.normalizaDoc(doc);

    let customerId = user.asaas_customer_id;
    if (!customerId) {
      const cliente = await asaas.criarCliente({ nome: user.nome, email: user.email, cpfCnpj: doc, telefone: user.telefone });
      customerId = cliente.id;
      await sql`UPDATE ead_users SET asaas_customer_id = ${customerId}, cpf_cnpj = ${doc} WHERE id = ${userId}`;
    } else if (!user.cpf_cnpj) {
      await sql`UPDATE ead_users SET cpf_cnpj = ${doc} WHERE id = ${userId}`;
    }

    const metodoInterno = metodo === 'pix' ? 'pix' : 'cartao';

    // Reaproveita cobrança pendente em vez de criar outra a cada tentativa.
    const pendente = await sql`
      SELECT id, metodo, asaas_invoice_url, pix_qr_code, pix_qr_code_base64
      FROM ead_orders
      WHERE user_id = ${userId} AND course_id = ${course.id} AND status = 'pendente'
        AND metodo = ${metodoInterno} AND asaas_payment_id IS NOT NULL
      ORDER BY created_at DESC LIMIT 1
    `;
    if (pendente.length) {
      const o = pendente[0];
      if (o.metodo === 'pix' && o.pix_qr_code) {
        return res.json({ ok: true, status: 'pix_pending', orderId: o.id, qr_code: o.pix_qr_code, qr_code_base64: o.pix_qr_code_base64 });
      }
      if (o.metodo === 'cartao' && o.asaas_invoice_url) {
        return res.json({ ok: true, status: 'redirect', init_point: o.asaas_invoice_url, orderId: o.id });
      }
    }

    const order = await sql`
      INSERT INTO ead_orders (user_id, course_id, valor, metodo, status)
      VALUES (${userId}, ${course.id}, ${course.preco}, ${metodoInterno}, 'pendente') RETURNING id
    `;
    const orderId = order[0].id;

    // O valor cobrado vem SEMPRE do banco, nunca do corpo da requisição.
    const cobranca = await asaas.criarCobranca({
      customerId,
      valor: course.preco,
      descricao: `Curso: ${course.titulo}`,
      orderId,
      billingType: metodo === 'pix' ? 'PIX' : 'CREDIT_CARD',
    });

    if (metodoInterno === 'pix') {
      const qr = await asaas.obterQrCodePix(cobranca.id);
      await sql`
        UPDATE ead_orders
        SET asaas_payment_id = ${String(cobranca.id)}, asaas_invoice_url = ${cobranca.invoiceUrl || null},
            pix_qr_code = ${qr.payload || null}, pix_qr_code_base64 = ${qr.encodedImage || null}
        WHERE id = ${orderId}
      `;
      return res.json({
        ok: true, status: 'pix_pending', orderId,
        qr_code: qr.payload, qr_code_base64: qr.encodedImage, expira_em: qr.expirationDate || null,
      });
    }

    await sql`
      UPDATE ead_orders SET asaas_payment_id = ${String(cobranca.id)}, asaas_invoice_url = ${cobranca.invoiceUrl || null}
      WHERE id = ${orderId}
    `;
    return res.json({ ok: true, status: 'redirect', init_point: cobranca.invoiceUrl, orderId });
  } catch (err) {
    console.error('EAD checkout error:', err.message);
    res.status(502).json({ error: 'Não foi possível iniciar o pagamento. Tente novamente.' });
  }
});

// ── Webhook do Asaas ──────────────────────────────────────────────────────────
// Autenticado pelo token configurado no painel, enviado no header asaas-access-token.
router.post('/ead/api/webhook/asaas', async (req, res) => {
  const segredo = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!segredo) {
    console.error('ASAAS_WEBHOOK_TOKEN não configurado — webhook rejeitado (fail-closed)');
    return res.sendStatus(503);
  }

  const a = Buffer.from(String(req.headers['asaas-access-token'] || ''), 'utf8');
  const b = Buffer.from(segredo, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.error('Webhook Asaas: token inválido');
    return res.sendStatus(401);
  }

  if (!sql) return res.sendStatus(503);

  try {
    const { event, payment } = req.body || {};
    const ref = payment?.externalReference;
    if (!event || !ref || !ref.startsWith('ead-order-')) return res.sendStatus(200);

    const orderId = parseInt(ref.replace('ead-order-', ''), 10);
    if (!Number.isInteger(orderId)) return res.sendStatus(200);

    const { status, libera, revoga } = asaas.traduzEvento(event);
    if (!status) return res.sendStatus(200);

    const orders = await sql`SELECT * FROM ead_orders WHERE id = ${orderId}`;
    if (!orders.length) return res.sendStatus(200);
    const order = orders[0];

    if (libera) {
      if (order.status === 'aprovado') return res.sendStatus(200);
      await sql.transaction([
        sql`UPDATE ead_orders SET status = 'aprovado', asaas_payment_id = ${String(payment.id)}, paid_at = NOW() WHERE id = ${orderId}`,
        sql`INSERT INTO ead_enrollments (user_id, course_id, order_id) VALUES (${order.user_id}, ${order.course_id}, ${orderId})
            ON CONFLICT (user_id, course_id) DO UPDATE SET revogada_em = NULL, revogada_motivo = NULL`,
      ]);
      await avisaMatricula(order);
    } else if (revoga) {
      await sql.transaction([
        sql`UPDATE ead_orders SET status = ${status} WHERE id = ${orderId}`,
        sql`UPDATE ead_enrollments SET revogada_em = NOW(), revogada_motivo = ${event}
            WHERE user_id = ${order.user_id} AND course_id = ${order.course_id}`,
      ]);
      console.warn(`Matrícula revogada: pedido #${orderId}, evento ${event}`);
    } else {
      await sql`UPDATE ead_orders SET status = ${status} WHERE id = ${orderId}`;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('EAD webhook error:', err);
    res.sendStatus(500);
  }
});

async function avisaMatricula(order) {
  if (!resend) return;
  try {
    const [users, courses] = await Promise.all([
      sql`SELECT nome, email FROM ead_users WHERE id = ${order.user_id}`,
      sql`SELECT titulo FROM ead_courses WHERE id = ${order.course_id}`,
    ]);
    if (!users.length || !courses.length) return;
    await resend.emails.send({
      from: 'Anders Tech Cursos <noreply@anderstech.net>',
      to: users[0].email,
      subject: `Matrícula confirmada: ${courses[0].titulo}`,
      html: eadMatriculaConfirmada({ nome: users[0].nome, curso: courses[0].titulo }),
    });
  } catch (_) { /* falha de e-mail não invalida a matrícula */ }
}

router.get('/ead/api/order/:orderId/status', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(503).json({ error: 'Serviço temporariamente indisponível' });
  try {
    const orderId = parseInt(req.params.orderId, 10);
    const userId = req.session.eadUser.id;
    const orders = await sql`
      SELECT status, metodo, pix_qr_code, pix_qr_code_base64, asaas_invoice_url
      FROM ead_orders WHERE id = ${orderId} AND user_id = ${userId}
    `;
    if (!orders.length) return res.status(404).json({ error: 'Pedido não encontrado' });
    const o = orders[0];
    const pend = o.status === 'pendente';
    res.json({
      status: o.status, metodo: o.metodo,
      qr_code: pend ? o.pix_qr_code : null,
      qr_code_base64: pend ? o.pix_qr_code_base64 : null,
      invoice_url: pend ? o.asaas_invoice_url : null,
    });
  } catch (err) {
    console.error('EAD order status error:', err);
    res.status(500).json({ error: 'Erro ao consultar pedido' });
  }
});

router.get('/ead/api/my-orders', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(503).json({ error: 'Serviço temporariamente indisponível' });
  try {
    const userId = req.session.eadUser.id;
    const orders = await sql`
      SELECT o.id, o.valor, o.metodo, o.status, o.created_at, o.paid_at, c.titulo AS curso
      FROM ead_orders o JOIN ead_courses c ON c.id = o.course_id
      WHERE o.user_id = ${userId} ORDER BY o.created_at DESC LIMIT 100
    `;
    res.json(orders);
  } catch (err) {
    console.error('EAD my-orders error:', err);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// ── Recuperação de senha (#71) ────────────────────────────────────────────────
// Resposta idêntica para e-mail existente e inexistente: o endpoint não pode
// virar oráculo de enumeração de contas.
router.post('/ead/api/esqueci-senha', loginRateLimit, async (req, res) => {
  const generico = { ok: true, message: 'Se o e-mail estiver cadastrado, enviaremos o link em instantes.' };
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    if (!email) return res.json(generico);
    const users = await sql`SELECT id, nome, email FROM ead_users WHERE email = ${email}`;
    if (users.length && resend) {
      const token = await criarToken(sql, 'ead', users[0].id);
      const link = `${APP_URL}/ead/redefinir-senha?token=${token}`;
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

router.post('/ead/api/redefinir-senha', loginRateLimit, async (req, res) => {
  try {
    const r = await consumirToken(sql, 'ead', req.body?.token, req.body?.senha, 'ead_users');
    if (!r.ok) return res.status(400).json({ error: r.erro });
    res.json({ ok: true });
  } catch (err) {
    console.error('Redefinir senha error:', err);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

// ── Anotações da aula (#60) ───────────────────────────────────────────────────
// Antes só existiam no localStorage do navegador.
router.put('/ead/api/lesson/:lessonId/nota', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(503).json({ error: 'Serviço temporariamente indisponível' });
  try {
    const userId = req.session.eadUser.id;
    const lessonId = parseInt(req.params.lessonId, 10);
    const idx = parseInt(req.body?.idx, 10) || 0;
    const conteudo = String(req.body?.conteudo ?? '').slice(0, 20000);

    const aula = await sql`
      SELECT l.id, m.course_id FROM ead_lessons l
      JOIN ead_modules m ON l.module_id = m.id WHERE l.id = ${lessonId}
    `;
    if (!aula.length) return res.status(404).json({ error: 'Aula não encontrada' });
    const mat = await sql`
      SELECT id FROM ead_enrollments
      WHERE user_id = ${userId} AND course_id = ${aula[0].course_id} AND revogada_em IS NULL
    `;
    if (!mat.length) return res.status(403).json({ error: 'Você não está matriculado neste curso' });

    await sql`
      INSERT INTO ead_notes (user_id, lesson_id, idx, conteudo, updated_at)
      VALUES (${userId}, ${lessonId}, ${idx}, ${conteudo}, NOW())
      ON CONFLICT (user_id, lesson_id, idx) DO UPDATE SET conteudo = EXCLUDED.conteudo, updated_at = NOW()
    `;
    res.json({ ok: true });
  } catch (err) {
    console.error('EAD nota error:', err);
    res.status(500).json({ error: 'Erro ao salvar anotação' });
  }
});

router.get('/ead/api/lesson/:lessonId/notas', requireEadAuth, async (req, res) => {
  if (!sql) return res.status(503).json({ error: 'Serviço temporariamente indisponível' });
  try {
    const userId = req.session.eadUser.id;
    const lessonId = parseInt(req.params.lessonId, 10);
    const notas = await sql`
      SELECT idx, conteudo FROM ead_notes WHERE user_id = ${userId} AND lesson_id = ${lessonId}
    `;
    res.json(notas);
  } catch (err) {
    console.error('EAD notas error:', err);
    res.status(500).json({ error: 'Erro ao buscar anotações' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// Page serving
// ═══════════════════════════════════════════════════════════════════

function sendEadPage(filename, req, res) {
  try {
    const filePath = join(__dirname, 'pages', filename);
    if (!existsSync(filePath)) return false;
    const html = readFileSync(filePath, 'utf8');
    res.type('html').send(injectShared(html, req.path));
    return true;
  } catch { return false; }
}

router.get('/ead', (req, res) => res.redirect('/ead/cursos'));
router.get('/ead/cursos', (req, res) => { if (!sendEadPage('cursos.html', req, res)) res.redirect('/'); });
// #65: as 4 paginas de curso tinham o MESMO <title>, sem description, sem
// canonical, sem Open Graph e sem conteudo no HTML — tudo vinha por JS. Sao as
// paginas de produto: agora as tags saem prontas do servidor, com preco no
// schema Course/Offer (elegivel a rich result agora que o curso e pago).
router.get('/ead/curso/:slug', async (req, res) => {
  try {
    const filePath = join(__dirname, 'pages', 'curso-detail.html');
    if (!existsSync(filePath)) return res.redirect('/ead/cursos');
    let html = readFileSync(filePath, 'utf8');

    if (sql && /^[a-z0-9-]{2,80}$/.test(req.params.slug)) {
      const rows = await sql`
        SELECT titulo, subtitulo, descricao, objetivo, carga_horaria, preco, slug
        FROM ead_courses WHERE slug = ${req.params.slug} AND ativo = true
      `;
      // Curso inexistente devolvia 200 com o HTML generico — soft 404, que faria
      // o Google indexar qualquer /ead/curso/<qualquer-coisa>. Agora 404 de fato.
      if (!rows.length) {
        return res.status(404).type('html').send(injectShared(
          readFileSync(join(dirname(__dirname), 'pages', '404.html'), 'utf8'), req.path));
      }
      {
        const c = rows[0];
        const e = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const url = `${APP_URL}/ead/curso/${c.slug}`;
        const titulo = `${c.titulo} — Curso online | Anders Tech`;
        const desc = String(c.subtitulo || c.objetivo || c.descricao || '')
          .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 158);

        const schema = {
          '@context': 'https://schema.org', '@type': 'Course',
          name: c.titulo, description: desc, url,
          provider: { '@type': 'Organization', name: 'Anders Tech', url: APP_URL },
          inLanguage: 'pt-BR',
          offers: {
            '@type': 'Offer', price: Number(c.preco).toFixed(2), priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock', url, category: 'Paid',
          },
          hasCourseInstance: {
            '@type': 'CourseInstance', courseMode: 'online',
            courseWorkload: c.carga_horaria || undefined,
          },
        };

        const head = `<meta name="description" content="${e(desc)}">`
          + `<link rel="canonical" href="${url}">`
          + '<meta property="og:type" content="website">'
          + '<meta property="og:site_name" content="Anders Tech">'
          + `<meta property="og:title" content="${e(titulo)}">`
          + `<meta property="og:description" content="${e(desc)}">`
          + `<meta property="og:url" content="${url}">`
          + `<meta property="og:image" content="${APP_URL}/assets/og-image.png">`
          + '<meta name="twitter:card" content="summary_large_image">'
          + `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;

        html = html.replace(/<title>[^<]*<\/title>/, `<title>${e(titulo)}</title>`)
                   .replace('</head>', head + '</head>');
      }
    }
    res.type('html').send(injectShared(html, req.path));
  } catch (err) {
    console.error('EAD curso detail error:', err);
    res.redirect('/ead/cursos');
  }
});
router.get('/ead/login', (req, res) => {
  if (req.session?.eadUser) return res.redirect('/ead/meus-cursos');
  if (!sendEadPage('login.html', req, res)) res.redirect('/');
});
router.get('/ead/registro', (req, res) => {
  if (req.session?.eadUser) return res.redirect('/ead/meus-cursos');
  if (!sendEadPage('registro.html', req, res)) res.redirect('/');
});
router.get('/ead/meus-cursos', requireEadAuth, (req, res) => { if (!sendEadPage('meus-cursos.html', req, res)) res.redirect('/ead/cursos'); });
router.get('/ead/player/:slug', requireEadAuth, (req, res) => { if (!sendEadPage('player.html', req, res)) res.redirect('/ead/meus-cursos'); });
router.get('/ead/checkout/sucesso', requireEadAuth, (req, res) => { if (!sendEadPage('checkout-sucesso.html', req, res)) res.redirect('/ead/meus-cursos'); });
router.get('/ead/checkout/erro', requireEadAuth, (req, res) => { if (!sendEadPage('checkout-erro.html', req, res)) res.redirect('/ead/cursos'); });
router.get('/ead/checkout/pendente', requireEadAuth, (req, res) => { if (!sendEadPage('checkout-pendente.html', req, res)) res.redirect('/ead/meus-cursos'); });
router.get('/ead/checkout/:slug', requireEadAuth, (req, res) => { if (!sendEadPage('checkout.html', req, res)) res.redirect('/ead/cursos'); });
router.get('/ead/certificado/:code', async (req, res) => {
  try {
    const filePath = join(__dirname, 'pages', 'certificado.html');
    if (!existsSync(filePath)) return res.redirect('/ead/cursos');
    let html = readFileSync(filePath, 'utf8');
    // OG tags dinamicas: preview rico ao compartilhar nas redes sociais
    if (sql && /^[A-Za-z0-9-]{4,40}$/.test(req.params.code)) {
      try {
        const certs = await sql`
          SELECT u.nome AS nome, c.titulo AS curso
          FROM ead_certificates cert
          JOIN ead_users u ON u.id = cert.user_id
          JOIN ead_courses c ON c.id = cert.course_id
          WHERE cert.code = ${req.params.code}
        `;
        if (certs.length) {
          const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          const og = '<meta property="og:type" content="website">'
            + '<meta property="og:site_name" content="Anders Tech EAD">'
            + `<meta property="og:title" content="${esc(certs[0].nome)} concluiu: ${esc(certs[0].curso)}">`
            + '<meta property="og:description" content="Certificado verificável emitido pela Anders Tech — cursos de gestão da qualidade para a indústria. Comece o seu em anderstech.net/ead/cursos">'
            + `<meta property="og:url" content="${APP_URL}/ead/certificado/${encodeURIComponent(req.params.code)}">`
            + `<meta property="og:image" content="${APP_URL}/assets/logo-horizontal-transparent.png">`
            + '<meta name="twitter:card" content="summary">';
          html = html.replace('</head>', og + '</head>');
        }
      } catch { /* sem OG dinamica se a consulta falhar */ }
    }
    html = injectShared(html, req.path);
    res.type('html').send(html);
  } catch { res.redirect('/ead/cursos'); }
});

export { router as eadRouter };
