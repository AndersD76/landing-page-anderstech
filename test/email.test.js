// Cliente do Resend que não falha calado (config/email.js). Em 20/11/2026 o
// domínio estava "Failed" no Resend e todo envio era recusado sem deixar rastro.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { blindar, criarResend } from '../config/email.js';

const calado = async (fn) => { const o = console.error; console.error = () => {}; try { return await fn(); } finally { console.error = o; } };

test('recusa do Resend vira erro com o motivo', async () => {
  const c = blindar({ emails: { send: async () => ({ data: null, error: { name: 'validation_error', message: 'The anderstech.net domain is not verified.' } }) } });
  await calado(() => assert.rejects(
    c.emails.send({ from: 'Anders Tech <noreply@anderstech.net>', to: 'x@teste.test', subject: 's', html: 'h' }),
    /Resend recusou o envio.*domain is not verified/,
  ));
});

test('envio aceito devolve o retorno do Resend', async () => {
  const c = blindar({ emails: { send: async () => ({ data: { id: 'abc' }, error: null }) } });
  assert.deepEqual(await c.emails.send({ from: 'a', to: 'b', subject: 'c', html: 'd' }), { data: { id: 'abc' }, error: null });
});

test('sem chave não há cliente', () => {
  assert.equal(criarResend(''), null);
});

test('nenhum arquivo cria cliente do Resend sem a blindagem', () => {
  let saida = '';
  try {
    saida = execSync('git grep -n "new Resend(" -- "*.js" "*.mjs" ":!config/email.js"', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    if (e.status !== 1) throw e; // git grep sai com 1 quando não acha nada: é o esperado
  }
  const achados = saida.trim().split('\n').filter(Boolean);
  assert.deepEqual(achados, []);
});
