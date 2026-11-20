// Dados da empresa. Em 20/11/2026 o site publicava, em 29 arquivos, um CNPJ
// que não passa no dígito verificador (42.073.716/0001-80); o certo, do
// comprovante da Receita, é 42.073.416/0001-80.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { EMPRESA } from '../config/empresa.js';

function cnpjValido(cnpj) {
  const d = String(cnpj).replace(/\D/g, '');
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const dv = (base, pesos) => {
    const r = base.split('').reduce((t, x, i) => t + Number(x) * pesos[i], 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = dv(d.slice(0, 12), p1);
  const d2 = dv(d.slice(0, 12) + d1, [6, ...p1]);
  return d.endsWith(`${d1}${d2}`);
}

test('CNPJ da empresa passa no dígito verificador', () => {
  assert.ok(cnpjValido(EMPRESA.cnpj), `CNPJ inválido: ${EMPRESA.cnpj}`);
  assert.equal(cnpjValido('42.073.716/0001-80'), false, 'o validador não pega o CNPJ errado de antes');
});

test('nenhum arquivo publicado repete um CNPJ diferente do de config/empresa.js', () => {
  // AUDITORIA.md guarda o número antigo como registro histórico do achado;
  // data/ traz CNPJs de construtoras certificadas (PBQP-H), que são de terceiros.
  const saida = execSync('git grep -n -E "[0-9]{2}\\.[0-9]{3}\\.[0-9]{3}/[0-9]{4}-[0-9]{2}" -- . ":!AUDITORIA.md" ":!test/**" ":!data/**"', { encoding: 'utf8' }).trim();
  // 00.000.000/0000-00 é o placeholder do formulário de /contratar.
  const outros = saida.split('\n').filter((l) => l && !l.includes(EMPRESA.cnpj) && !l.includes('00.000.000/0000-00'));
  assert.deepEqual(outros, [], 'CNPJ diferente do oficial em:\n' + outros.join('\n'));
});
