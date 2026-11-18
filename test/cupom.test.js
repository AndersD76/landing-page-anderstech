// Cupom mexe no valor cobrado: erro aqui é dinheiro errado no Asaas ou curso
// liberado de graça. Testa a regra pura de ead/cupons.js, sem banco.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PERCENTUAIS, aplicaDesconto, avaliaCupom, validaNovoCupom,
  normalizaCodigo, codigoValido, geraCodigo,
} from '../ead/cupons.js';

const PRECOS = [197, 297, 397, 497];

test('desconto em centavos, sem resto de ponto flutuante', () => {
  assert.deepEqual(aplicaDesconto('397.00', 20), { valor_original: 397, desconto: 79.4, valor_final: 317.6 });
  assert.deepEqual(aplicaDesconto(197, 90), { valor_original: 197, desconto: 177.3, valor_final: 19.7 });
  assert.deepEqual(aplicaDesconto(497, 50), { valor_original: 497, desconto: 248.5, valor_final: 248.5 });
  assert.deepEqual(aplicaDesconto(297, 10), { valor_original: 297, desconto: 29.7, valor_final: 267.3 });
});

test('100% zera o valor e 0% mantém o preço', () => {
  for (const p of PRECOS) {
    assert.equal(aplicaDesconto(p, 100).valor_final, 0);
    assert.equal(aplicaDesconto(p, 0).valor_final, p);
  }
});

test('desconto + valor final sempre somam o preço original', () => {
  for (const p of PRECOS) for (const pct of PERCENTUAIS) {
    const v = aplicaDesconto(p, pct);
    assert.equal(Math.round((v.desconto + v.valor_final) * 100), Math.round(p * 100), `${pct}% de ${p}`);
  }
});

test('nenhum preço atual fica entre zero e o mínimo de cobrança do Asaas', () => {
  for (const p of PRECOS) for (const pct of PERCENTUAIS) {
    const f = aplicaDesconto(p, pct).valor_final;
    assert.ok(f === 0 || f >= 5, `${pct}% de ${p} daria R$ ${f}`);
  }
});

const base = { id: 1, ativo: true, percentual: 20, course_id: null, email: null, max_usos: null, usos: 0, valido_ate: null };

test('cupom válido passa', () => {
  assert.deepEqual(avaliaCupom(base, { courseId: 3, email: 'a@b.com' }), { ok: true });
});

test('cada motivo de recusa tem mensagem própria', () => {
  const casos = [
    [null, {}, /não encontrado/],
    [{ ...base, ativo: false }, {}, /desativado/],
    [{ ...base, valido_ate: '2026-01-01T23:59:59-03:00' }, { agora: new Date('2026-01-02T12:00:00-03:00') }, /expirou/],
    [{ ...base, course_id: 2 }, { courseId: 3 }, /não vale para este curso/],
    [{ ...base, email: 'fulano@empresa.com' }, { email: 'outro@empresa.com' }, /pessoal/],
    [{ ...base, max_usos: 3, usos: 3 }, {}, /limite de usos/],
    [base, { jaUsou: true }, /já usou/],
  ];
  for (const [cupom, ctx, msg] of casos) {
    const r = avaliaCupom(cupom, { courseId: 3, ...ctx });
    assert.equal(r.ok, false);
    assert.match(r.erro, msg);
  }
});

test('validade vale até o fim do dia e e-mail ignora caixa', () => {
  const k = { ...base, valido_ate: '2026-11-30T23:59:59-03:00', email: 'aluno@empresa.com' };
  assert.equal(avaliaCupom(k, { email: ' Aluno@Empresa.com ', agora: new Date('2026-11-30T22:00:00-03:00') }).ok, true);
  assert.equal(avaliaCupom(k, { email: 'aluno@empresa.com', agora: new Date('2026-12-01T00:00:01-03:00') }).ok, false);
});

test('curso certo e limite ainda não atingido passam', () => {
  assert.equal(avaliaCupom({ ...base, course_id: 3, max_usos: 2, usos: 1 }, { courseId: '3' }).ok, true);
});

test('painel só aceita os percentuais combinados', () => {
  for (const p of [10, 20, 50, 90, 100]) assert.equal(validaNovoCupom({ percentual: p }).percentual, p);
  for (const p of [0, 15, 30, 101, -10, 'abc', undefined]) assert.ok(validaNovoCupom({ percentual: p }).erro, `${p} deveria ser recusado`);
});

test('painel: código gerado quando vazio, normalizado quando informado', () => {
  assert.match(validaNovoCupom({ percentual: 50 }).codigo, /^AT50-[2-9A-HJKMNP-Z]{8}$/);
  assert.equal(validaNovoCupom({ percentual: 10, codigo: ' aluno 10 ' }).codigo, 'ALUNO10');
  assert.ok(validaNovoCupom({ percentual: 10, codigo: 'ab' }).erro);
  assert.ok(validaNovoCupom({ percentual: 10, codigo: 'com espaço/barra' }).erro);
});

test('painel: limite, validade e e-mail', () => {
  assert.equal(validaNovoCupom({ percentual: 20, max_usos: '' }).maxUsos, null);
  assert.equal(validaNovoCupom({ percentual: 20, max_usos: '5' }).maxUsos, 5);
  assert.ok(validaNovoCupom({ percentual: 20, max_usos: '0' }).erro);
  assert.ok(validaNovoCupom({ percentual: 20, max_usos: '1.5' }).erro);
  assert.equal(validaNovoCupom({ percentual: 20, valido_ate: '2026-12-31' }).validoAte.toISOString(), '2027-01-01T02:59:59.000Z');
  assert.ok(validaNovoCupom({ percentual: 20, valido_ate: '31/12/2026' }).erro);
  assert.equal(validaNovoCupom({ percentual: 20, email: ' Fulano@Empresa.COM ' }).email, 'fulano@empresa.com');
  assert.ok(validaNovoCupom({ percentual: 20, email: 'sem-arroba' }).erro);
});

test('código gerado não tem caractere ambíguo e não se repete', () => {
  const vistos = new Set();
  for (let i = 0; i < 500; i++) {
    const c = geraCodigo(20);
    assert.ok(codigoValido(c));
    assert.doesNotMatch(c.slice(5), /[01OIL]/);
    vistos.add(c);
  }
  assert.equal(vistos.size, 500);
  assert.equal(normalizaCodigo('  at20-abc '), 'AT20-ABC');
});
