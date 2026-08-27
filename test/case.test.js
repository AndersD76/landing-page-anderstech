import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { validarCase, casePublicavel, slugValido } from '../cases/validate.js';

const CASO_COMPLETO = {
  slug: 'metalurgica-iso-9001',
  publicado: true,
  cliente: 'Metalúrgica ABC',
  segmento: 'Metalúrgica',
  servico: 'ISO 9001',
  problema: 'Perda de 15% por retrabalho.',
  solucao: 'Mapeamento de processos e implantação de controle estatístico.',
  resultado: 'Retrabalho caiu de 15% para 3% em 6 meses.',
  resultado_fonte: 'Relatório interno da qualidade, mar/2025',
  depoimento_texto: 'Mudou a forma como trabalhamos.',
  depoimento_autor: 'João Silva',
  depoimento_cargo: 'Diretor Industrial',
  depoimento_fonte: 'E-mail autorizado em 10/04/2025',
  metricas: [
    { label: 'Redução retrabalho', valor: '80%', fonte: 'Relatório interno, mar/2025' },
    { label: 'Prazo implantação', valor: '6 meses', fonte: 'Cronograma projeto' },
  ],
};

describe('validarCase', () => {
  test('case completo não tem erros', () => {
    const erros = validarCase(CASO_COMPLETO);
    assert.equal(erros.length, 0, `Erros inesperados: ${erros.join(', ')}`);
  });

  test('campo obrigatório vazio gera erro', () => {
    const erros = validarCase({ ...CASO_COMPLETO, cliente: '' });
    assert.ok(erros.some(e => e.includes('cliente')));
  });

  test('campo com [PREENCHER] gera erro', () => {
    const erros = validarCase({ ...CASO_COMPLETO, resultado: '[PREENCHER — aguardando]' });
    assert.ok(erros.some(e => e.includes('resultado') && e.includes('[PREENCHER]')));
  });

  test('depoimento sem fonte gera erro', () => {
    const erros = validarCase({ ...CASO_COMPLETO, depoimento_fonte: '' });
    assert.ok(erros.some(e => e.includes('depoimento') && e.includes('fonte')));
  });

  test('metrica sem fonte gera erro', () => {
    const caso = { ...CASO_COMPLETO, metricas: [{ label: 'X', valor: '10', fonte: '' }] };
    const erros = validarCase(caso);
    assert.ok(erros.some(e => e.includes('metricas[0].fonte')));
  });

  test('metrica com [PREENCHER] gera erro', () => {
    const caso = { ...CASO_COMPLETO, metricas: [{ label: 'X', valor: '10', fonte: '[PREENCHER]' }] };
    const erros = validarCase(caso);
    assert.ok(erros.some(e => e.includes('metricas[0].fonte') && e.includes('[PREENCHER]')));
  });

  test('case sem depoimento não exige depoimento_fonte', () => {
    const { depoimento_texto, depoimento_autor, depoimento_cargo, depoimento_fonte, ...semDep } = CASO_COMPLETO;
    const erros = validarCase(semDep);
    assert.equal(erros.length, 0);
  });
});

describe('casePublicavel', () => {
  test('case completo e publicado é publicável', () => {
    assert.ok(casePublicavel(CASO_COMPLETO));
  });

  test('case completo mas não publicado não é publicável', () => {
    assert.ok(!casePublicavel({ ...CASO_COMPLETO, publicado: false }));
  });

  test('case publicado com erro de validação não é publicável', () => {
    assert.ok(!casePublicavel({ ...CASO_COMPLETO, resultado_fonte: '' }));
  });
});

describe('slugValido', () => {
  test('slug normal é válido', () => assert.ok(slugValido('metalurgica-iso-9001')));
  test('slug curto demais é inválido', () => assert.ok(!slugValido('ab')));
  test('slug com caractere especial é inválido', () => assert.ok(!slugValido('case_1')));
  test('slug com maiúscula é inválido', () => assert.ok(!slugValido('Case-1')));
});
