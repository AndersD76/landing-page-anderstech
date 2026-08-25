import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASES, DEPOIMENTOS, READOUT, casesPublicados, depoimentosPublicados, readoutPublicado, pendencias } from '../config/prova.js';

test('nada é publicado enquanto o Anders não autorizar', () => {
  assert.equal(casesPublicados().length, 0);
  assert.equal(depoimentosPublicados().length, 0);
  assert.equal(pendencias().cases, CASES.length);
  assert.equal(pendencias().depoimentos, DEPOIMENTOS.length);
});

test('publicado: true com [PREENCHER] sobrando NÃO vai ao ar', () => {
  // A trava que impede meio case vazar por descuido. Testa sobre uma cópia:
  // o módulo é compartilhado e mutá-lo contaminaria os outros testes.
  const meio = { ...CASES[0], publicado: true, cliente: 'Metalúrgica Exemplo', segmento: 'Metalúrgica · RS' };
  const original = CASES.length;
  CASES.push(meio);
  try {
    assert.equal(casesPublicados().length, 0, 'case incompleto não pode ser publicado');
  } finally {
    CASES.length = original;
  }
});

test('case completo e autorizado aparece', () => {
  const completo = {
    publicado: true,
    slug: 'exemplo',
    cliente: 'Metalúrgica Exemplo',
    segmento: 'Metalúrgica · RS',
    servico: 'ISO 9001',
    problema: 'Cliente passou a exigir certificação.',
    resultado: 'Certificada na primeira auditoria.',
    imagem: '',
  };
  const original = CASES.length;
  CASES.push(completo);
  try {
    const pub = casesPublicados();
    assert.equal(pub.length, 1);
    assert.equal(pub[0].cliente, 'Metalúrgica Exemplo');
  } finally {
    CASES.length = original;
  }
});

test('todo slot declara os campos que o render espera', () => {
  const obrigatorios = ['publicado', 'slug', 'cliente', 'segmento', 'servico', 'problema', 'resultado', 'imagem'];
  for (const c of CASES) {
    for (const campo of obrigatorios) {
      assert.ok(campo in c, `slot de case sem o campo ${campo}`);
    }
  }
  for (const d of DEPOIMENTOS) {
    for (const campo of ['publicado', 'texto', 'autor', 'cargo', 'imagem']) {
      assert.ok(campo in d, `slot de depoimento sem o campo ${campo}`);
    }
  }
});

test('readout do hero está sob a mesma trava', () => {
  assert.equal(readoutPublicado(), null, 'não pode publicar sem autorização');

  const original = JSON.parse(JSON.stringify({ p: READOUT.publicado, r: READOUT.rotulo, m: READOUT.metricas }));
  try {
    READOUT.publicado = true;
    assert.equal(readoutPublicado(), null, 'publicado:true com [PREENCHER] não basta');

    READOUT.rotulo = 'Diagnóstico · amostra';
    READOUT.metricas = [{ label: 'Meses analisados', valor: '18', barra: 80, fonte: 'planilha X' }];
    assert.ok(readoutPublicado(), 'completo e autorizado deve publicar');

    // número sem fonte declarada é exatamente o que tirou os cases do ar
    READOUT.metricas = [{ label: 'Meses analisados', valor: '18', barra: 80, fonte: '' }];
    assert.equal(readoutPublicado(), null, 'métrica sem fonte não pode ir ao ar');
  } finally {
    READOUT.publicado = original.p;
    READOUT.rotulo = original.r;
    READOUT.metricas = original.m;
  }
});
