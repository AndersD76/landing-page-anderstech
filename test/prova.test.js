import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASES, DEPOIMENTOS, READOUT, casesPublicados, depoimentosPublicados, readoutPublicado, pendencias } from '../config/prova.js';

// Molde de case incompleto. Os arrays do módulo nascem vazios — case só existe
// com cliente real autorizado —, então os testes montam o próprio cenário.
const CASE_MEIO = {
  publicado: true,
  slug: 'exemplo',
  cliente: 'Metalúrgica Exemplo',
  segmento: 'Metalúrgica · RS',
  servico: '[PREENCHER — aguardando autorização do cliente]',
  problema: '[PREENCHER — aguardando autorização do cliente]',
  resultado: '[PREENCHER — aguardando autorização do cliente]',
  imagem: '',
};

test('nada é publicado enquanto o Anders não autorizar', () => {
  assert.equal(casesPublicados().length, 0);
  assert.equal(depoimentosPublicados().length, 0);
  assert.equal(pendencias().cases, 0, 'array vazio não gera pendência');
  assert.equal(pendencias().depoimentos, 0);
});

test('publicado: true com [PREENCHER] sobrando NÃO vai ao ar', () => {
  // A trava que impede meio case vazar por descuido. Restaura o array no finally:
  // o módulo é compartilhado e mutá-lo contaminaria os outros testes.
  const original = CASES.length;
  CASES.push({ ...CASE_MEIO });
  try {
    assert.equal(casesPublicados().length, 0, 'case incompleto não pode ser publicado');
  } finally {
    CASES.length = original;
  }
});

test('campo vazio também barra a publicação', () => {
  const original = CASES.length;
  CASES.push({ ...CASE_MEIO, servico: 'ISO 9001', problema: 'Algo doía.', resultado: '   ' });
  try {
    assert.equal(casesPublicados().length, 0, 'espaço em branco não conta como preenchido');
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

test('todo item declara os campos que o render espera', () => {
  // Vale para o que for adicionado depois: o render acessa esses campos direto,
  // e um item sem eles quebraria a home em vez de simplesmente não publicar.
  const obrigatorios = ['publicado', 'slug', 'cliente', 'segmento', 'servico', 'problema', 'resultado', 'imagem'];
  for (const c of CASES) {
    for (const campo of obrigatorios) {
      assert.ok(campo in c, `case sem o campo ${campo}`);
    }
  }
  for (const d of DEPOIMENTOS) {
    for (const campo of ['publicado', 'texto', 'autor', 'cargo', 'imagem']) {
      assert.ok(campo in d, `depoimento sem o campo ${campo}`);
    }
  }
});

test('case completo adicionado depois passa na validação de campos', () => {
  // Guarda o contrato do molde documentado em config/prova.js: se alguém mudar
  // os campos exigidos sem atualizar o comentário, este teste cai.
  const original = CASES.length;
  CASES.push({
    publicado: true, slug: 'metalurgica-abc', cliente: 'Metalúrgica ABC',
    segmento: 'Metalúrgica', servico: 'ISO 9001', problema: 'Retrabalho alto.',
    resultado: 'Retrabalho a 3% em 6 meses.', imagem: '',
  });
  try {
    assert.equal(casesPublicados().length, 1, 'o molde documentado tem que publicar');
  } finally {
    CASES.length = original;
  }
});

test('readout do hero está sob a mesma trava', () => {
  assert.equal(readoutPublicado(), null, 'não pode publicar sem autorização');

  const original = JSON.parse(JSON.stringify({ p: READOUT.publicado, r: READOUT.rotulo, m: READOUT.metricas }));
  try {
    READOUT.publicado = true;
    assert.equal(readoutPublicado(), null, 'publicado:true sem rótulo nem métrica não basta');

    READOUT.rotulo = '[PREENCHER — aguardando autorização do cliente]';
    READOUT.metricas = [{ label: 'Meses analisados', valor: '18', barra: 80, fonte: 'planilha X' }];
    assert.equal(readoutPublicado(), null, 'rótulo com [PREENCHER] não passa');

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
