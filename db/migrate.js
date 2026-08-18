// ── Migrações versionadas (achado #16) ─────────────────────────────────────────
// Substitui o DDL espalhado em três `initXDB()` que rodavam no boot com
// `CREATE TABLE IF NOT EXISTS`. Aquele mecanismo nunca propagava coluna nova:
// `IF NOT EXISTS` pula a instrução inteira quando a tabela já existe, então
// qualquer ALTER ficava só no código e nunca chegava à produção.
//
// Cada arquivo em migrations/ roda uma vez, em ordem de nome, e fica registrado
// em schema_migrations. Instruções de um mesmo arquivo vão numa transação: ou o
// arquivo aplica inteiro, ou não aplica.

import { readdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(dirname(__dirname), 'migrations');

// Divide o arquivo em instruções. Cobre DDL simples (CREATE/ALTER/INDEX), que é
// tudo o que este projeto usa. Blocos DO $$ ... $$ exigiriam parser próprio —
// se algum dia forem necessários, tratar aqui explicitamente.
function parseStatements(sqlText) {
  return sqlText
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);
}

export function listMigrations() {
  return readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()
    .map(file => ({
      version: file.replace(/\.sql$/, ''),
      statements: parseStatements(readFileSync(join(MIGRATIONS_DIR, file), 'utf8')),
    }));
}

export async function runMigrations(sql) {
  if (!sql) {
    console.warn('[migrate] DATABASE_URL ausente — migrações ignoradas');
    return { applied: [], skipped: true };
  }

  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // #24: expoe PORTAL_ADMIN_EMAIL as migracoes, para o bootstrap de admin
  // acontecer por configuracao em vez de INSERT manual nao documentado.
  if (process.env.PORTAL_ADMIN_EMAIL) {
    await sql`SELECT set_config('app.admin_email', ${process.env.PORTAL_ADMIN_EMAIL.toLowerCase().trim()}, false)`;
  }

  const done = new Set((await sql`SELECT version FROM schema_migrations`).map(r => r.version));
  const applied = [];

  for (const { version, statements } of listMigrations()) {
    if (done.has(version)) continue;
    // Um arquivo = uma transação. O INSERT no controle entra na mesma transação,
    // então não existe migração aplicada sem registro nem registro sem migração.
    await sql.transaction([
      ...statements.map(st => sql.query(st)),
      sql.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]),
    ]);
    applied.push(version);
    console.log(`[migrate] aplicada: ${version} (${statements.length} instruções)`);
  }

  if (!applied.length) console.log('[migrate] schema já atualizado');
  return { applied, skipped: false };
}
