/**
 * Master seed script — runs all course seeds.
 * Usage: node ead/seed.js
 * Requires DATABASE_URL in .env
 */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { seedCourse1 } from './seed-course1.js';
import { seedCourse2 } from './seed-course2.js';
import { seedCourse3 } from './seed-course3.js';
import { seedCourse4 } from './seed-course4.js';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('Seeding EAD courses...\n');

  const existing = await sql`SELECT COUNT(*)::int AS count FROM ead_courses`;
  if (existing[0].count > 0) {
    console.log(`Ja existem ${existing[0].count} cursos no banco. Limpando...`);
    await sql`DELETE FROM ead_quiz_attempts`;
    await sql`DELETE FROM ead_certificates`;
    await sql`DELETE FROM ead_progress`;
    await sql`DELETE FROM ead_enrollments`;
    await sql`DELETE FROM ead_orders`;
    await sql`DELETE FROM ead_quiz_questions`;
    await sql`DELETE FROM ead_lessons`;
    await sql`DELETE FROM ead_modules`;
    await sql`DELETE FROM ead_courses`;
    console.log('Dados anteriores removidos.\n');
  }

  console.log('[1/4] ISO 9001:2015 — Interpretacao dos Requisitos');
  await seedCourse1(sql);
  console.log('  OK\n');

  console.log('[2/4] Auditor Interno ISO 9001:2015');
  await seedCourse2(sql);
  console.log('  OK\n');

  console.log('[3/4] Gestão de Processos e Indicadores');
  await seedCourse3(sql);
  console.log('  OK\n');

  console.log('[4/4] 5S na Prática Industrial');
  await seedCourse4(sql);
  console.log('  OK\n');

  const stats = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM ead_courses) AS cursos,
      (SELECT COUNT(*)::int FROM ead_modules) AS modulos,
      (SELECT COUNT(*)::int FROM ead_lessons) AS aulas,
      (SELECT COUNT(*)::int FROM ead_quiz_questions) AS questoes
  `;
  console.log('=== Seed completo ===');
  console.log(`Cursos: ${stats[0].cursos}`);
  console.log(`Modulos: ${stats[0].modulos}`);
  console.log(`Aulas: ${stats[0].aulas}`);
  console.log(`Questoes: ${stats[0].questoes}`);
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
