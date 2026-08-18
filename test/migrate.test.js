import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listMigrations, runMigrations } from '../db/migrate.js';

test('migrações são lidas em ordem e sem instrução vazia', () => {
  const m = listMigrations();
  assert.ok(m.length >= 6);
  assert.deepEqual([...m].map(x => x.version).sort(), m.map(x => x.version));
  for (const mig of m) {
    assert.ok(mig.statements.length > 0, `${mig.version} sem instruções`);
    for (const st of mig.statements) assert.ok(st.trim().length > 0);
  }
});

test('baseline é idempotente: só IF NOT EXISTS', () => {
  const base = listMigrations().find(m => m.version === '001_baseline');
  for (const st of base.statements) {
    assert.match(st, /IF NOT EXISTS/i, `não idempotente: ${st.slice(0, 60)}`);
  }
});

test('sem DATABASE_URL, o runner não quebra', async () => {
  const r = await runMigrations(null);
  assert.equal(r.skipped, true);
});
