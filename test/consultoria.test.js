// Preço de consultoria vendida no site: erro aqui é contrato de R$ 20 mil com
// valor errado. Os exemplos são os que o Anders aprovou em 18/11/2026.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { calculaPreco, opcoesPagamento, opcaoEscolhida, SERVICOS } from '../consultoria/preco.js';
import { clausulas, contratoHTML, contratadaCompleta, CONTRATO_VERSAO } from '../consultoria/contrato.js';
import { validaContratante, vendaAtiva } from '../consultoria/routes.js';

const DIST = JSON.parse(readFileSync(new URL('../data/distancias-passo-fundo.json', import.meta.url), 'utf8'));

test('tabela de distâncias: Passo Fundo a 0 km, nada acima de 300 km, sem cidade repetida', () => {
  const m = DIST.municipios;
  assert.ok(m.length > 400, `só ${m.length} municípios`);
  assert.equal(m.find((x) => x.ibge === '4314100').km, 0);
  assert.ok(m.every((x) => Number.isInteger(x.km) && x.km >= 0 && x.km <= 300));
  assert.equal(new Set(m.map((x) => x.ibge)).size, m.length);
  // referências conhecidas por estrada (com folga): Marau ~30, Porto Alegre ~290
  const km = (nome) => m.find((x) => x.nome === nome && x.uf === 'RS')?.km;
  assert.ok(km('Marau') < 50 && km('Carazinho') < 51);
  assert.ok(km('Porto Alegre') > 250 && km('Porto Alegre') <= 300);
  assert.equal(km('Pelotas'), undefined, 'Pelotas fica a mais de 300 km');
});

test('contrato genérico: 12 cláusulas, sem dado de pedido inventado', () => {
  assert.equal(clausulas(null).length, 12);
  const h = contratoHTML(null);
  assert.match(h, /resumo do pedido/);
  assert.doesNotMatch(h, /undefined|null|NaN/);
  assert.match(CONTRATO_VERSAO, /^\d{4}-\d{2}-\d{2}$/);
});

test('contrato preenchido traz cliente, serviço, composição do preço e registro do aceite', () => {
  const pr = calculaPreco({ servico: 'iso-9001', funcionarios: 60, km: 120, temProjeto: true });
  const op = opcaoEscolhida(pr, 'boleto', 12);
  const p = {
    contratante: { razaoSocial: 'Metalúrgica Teste Ltda', cnpj: '11.222.333/0001-81', endereco: 'Rua A, 1, Centro', cidade: 'Cruz Alta', uf: 'RS', cep: '98000-000', representante: 'Ana Teste', cargo: 'Diretora', cpf: '529.982.247-25', email: 'ana@teste.test', telefone: '(55) 99999-0000' },
    pedido: { id: 7, servicoNome: pr.nome, tipo: pr.tipo, horas: pr.horas, horasTotais: pr.horasTotais, meses: null, base: pr.base, acrescimos: pr.acrescimos, total: pr.total, funcionarios: 60, km: 120, perguntaProjeto: true, temProjeto: true, metodo: 'boleto', parcelas: 12, valorParcela: op.valorParcela, totalPago: op.total, versao: CONTRATO_VERSAO, aceiteEm: '2026-11-18T13:00:00Z', aceiteIp: '200.1.2.3', pagoEm: '2026-11-18T13:05:00Z' },
  };
  const h = contratoHTML(p);
  for (const esperado of ['Metalúrgica Teste Ltda', '11.222.333/0001-81', 'Implantação da ISO 9001', 'R$ 31.320,00', '12 parcelas de R$ 2.961,61', 'IP 200.1.2.3', 'pedido nº 7', '18/11/2026, 10:00']) {
    assert.ok(h.includes(esperado), `faltou: ${esperado}`);
  }
  assert.doesNotMatch(h, /resumo do pedido|undefined|NaN/);
});

test('CPF de quem assina pela Anders Tech: só no contrato do pedido, nunca na página pública', async () => {
  const { EMPRESA } = await import('../config/empresa.js');
  const antes = EMPRESA.cpfRepresentante;
  try {
    EMPRESA.cpfRepresentante = '111.444.777-35';
    assert.ok(!contratoHTML(null).includes('111.444.777-35'), 'CPF apareceu no modelo público');
    assert.match(contratoHTML(null), /CPF informado no contrato enviado após o pagamento/);
    const p = { contratante: { razaoSocial: 'X Ltda', cnpj: '1', endereco: 'R', cidade: 'C', uf: 'RS', cep: '9', representante: 'Y', cargo: 'Z', cpf: '2', email: 'e', telefone: 't' }, pedido: { id: 1, servicoNome: 'S', tipo: 'horas', horas: 1, horasTotais: 1, base: 180, acrescimos: [], total: 180, metodo: 'pix', parcelas: 1, valorParcela: 180, totalPago: 180, versao: CONTRATO_VERSAO, aceiteEm: '2026-11-18T13:00:00Z', aceiteIp: '1.1.1.1', pagoEm: '2026-11-18T13:05:00Z' } };
    assert.ok(clausulas(p).some((cl) => JSON.stringify(cl).includes('111.444.777-35')), 'CPF faltou no contrato do pedido');
  } finally { EMPRESA.cpfRepresentante = antes; }
});

test('venda desligada enquanto faltar dado da CONTRATADA no contrato', () => {
  if (!contratadaCompleta()) assert.equal(vendaAtiva(), false);
});

test('dados do contratante: valida e normaliza, recusa o inválido', () => {
  const ok = {
    empresa: { razaoSocial: '  Metalúrgica  Teste Ltda ', cnpj: '11.222.333/0001-81', endereco: 'Rua A, 100, Centro', cep: '98000-000' },
    representante: { nome: 'Ana Teste', cargo: 'Diretora', cpf: '529.982.247-25' },
    email: 'Ana@Teste.TEST', telefone: '(55) 99999-0000',
  };
  const d = validaContratante(ok);
  assert.equal(d.erro, undefined);
  assert.equal(d.razaoSocial, 'Metalúrgica Teste Ltda');
  assert.equal(d.cnpj, '11222333000181');
  assert.equal(d.email, 'ana@teste.test');
  const casos = [
    [{ empresa: { ...ok.empresa, cnpj: '11.222.333/0001-80' } }, /CNPJ/],
    [{ empresa: { ...ok.empresa, cnpj: '529.982.247-25' } }, /CNPJ/],
    [{ empresa: { ...ok.empresa, cep: '123' } }, /CEP/],
    [{ representante: { ...ok.representante, nome: 'Ana' } }, /nome completo/],
    [{ representante: { ...ok.representante, cpf: '123.456.789-00' } }, /CPF/],
    [{ email: 'sem-arroba' }, /E-mail/],
    [{ telefone: '9999' }, /Telefone/],
  ];
  for (const [extra, msg] of casos) assert.match(validaContratante({ ...ok, ...extra }).erro || '', msg);
});

const base = { servico: 'iso-9001', funcionarios: 10, km: 0 };

test('horas aprovadas pelo Anders × R$ 180', () => {
  const esperado = {
    'iso-9001': 21600, 'pbqp-h': 21600, 'mapeamento-processos': 14400,
    'planejamento-estrategico': 10800, inovacao: 10800, 'presenca-digital': 10800,
    '5s': 7200, 'controles-financeiros': 7200, 'indicadores-financeiros': 7200,
    'custos-preco-venda': 7200, 'planejamento-financeiro': 7200, 'compras-estoques': 7200,
    'plano-de-negocio': 7200, 'rotinas-operacionais': 3600, 'auditoria-interna': 2880,
  };
  for (const [servico, valor] of Object.entries(esperado)) {
    assert.equal(calculaPreco({ ...base, servico }).total, valor, servico);
  }
  assert.equal(SERVICOS.length, 16);
});

test('exemplo aprovado: ISO 9001, 60 func., 120 km, com projeto = +45% = R$ 31.320', () => {
  const p = calculaPreco({ servico: 'iso-9001', funcionarios: 60, km: 120, temProjeto: true });
  assert.equal(p.pctTotal, 45);
  assert.equal(p.total, 31320);
  assert.deepEqual(p.acrescimos.map((a) => a.pct), [10, 15, 20]);
});

test('faixas de funcionários nas bordas', () => {
  const pct = (funcionarios) => calculaPreco({ ...base, funcionarios }).pctTotal;
  assert.equal(pct(1), 0); assert.equal(pct(20), 0);
  assert.equal(pct(21), 5); assert.equal(pct(50), 5);
  assert.equal(pct(51), 10); assert.equal(pct(100), 10);
  assert.equal(pct(101), 15); assert.equal(pct(5000), 15);
});

test('faixas de distância nas bordas, e acima de 300 km não atende', () => {
  const pct = (km) => calculaPreco({ ...base, km }).pctTotal;
  assert.equal(pct(0), 0); assert.equal(pct(50), 0); assert.equal(pct(50.4), 0);
  assert.equal(pct(51), 5); assert.equal(pct(100), 5);
  assert.equal(pct(101), 15); assert.equal(pct(300), 15);
  const fora = calculaPreco({ ...base, km: 301 });
  assert.equal(fora.foraDaArea, true);
  assert.ok(fora.erro);
});

test('+20% de projeto só vale para ISO 9001 e PBQP-H', () => {
  assert.equal(calculaPreco({ ...base, temProjeto: true }).pctTotal, 20);
  assert.equal(calculaPreco({ ...base, servico: 'pbqp-h', temProjeto: true }).pctTotal, 20);
  for (const servico of ['5s', 'auditoria-interna', 'manutencao-sgq', 'plano-de-negocio']) {
    assert.equal(calculaPreco({ ...base, servico, meses: 6, temProjeto: true }).pctTotal, 0, servico);
  }
  // só true conta: "sim" vindo de formulário não pode virar acréscimo por acaso
  assert.equal(calculaPreco({ ...base, temProjeto: 'false' }).pctTotal, 0);
});

test('entrada inválida vira erro, não preço', () => {
  for (const extra of [{ servico: 'iso-14001' }, { funcionarios: 0 }, { funcionarios: 2.5 }, { funcionarios: '' }, { km: '' }, { km: null }, { km: 'abc' }]) {
    assert.ok(calculaPreco({ ...base, ...extra }).erro, JSON.stringify(extra));
  }
});

test('manutenção: 6 ou 12 meses, parcelas iguais sem juros em qualquer meio', () => {
  const p6 = calculaPreco({ servico: 'manutencao-sgq', funcionarios: 10, km: 0, meses: 6 });
  assert.equal(p6.total, 17280);
  const p12 = calculaPreco({ servico: 'manutencao-sgq', funcionarios: 30, km: 80, meses: 12 });
  assert.equal(p12.total, 34560 * 1.10);
  assert.ok(calculaPreco({ servico: 'manutencao-sgq', funcionarios: 10, km: 0, meses: 3 }).erro);
  const ops = opcoesPagamento(p6);
  assert.deepEqual(ops.map((o) => o.metodo).sort(), ['boleto', 'cartao', 'pix']);
  for (const o of ops) {
    assert.equal(o.parcelas, 6); assert.equal(o.valorParcela, 2880); assert.equal(o.total, 17280); assert.equal(o.juros, false);
  }
});

test('projeto: Pix só à vista; cartão e boleto 1x sem juros, 2x–12x com 2% a.m. (Price)', () => {
  const p = calculaPreco(base); // R$ 21.600
  const ops = opcoesPagamento(p);
  assert.deepEqual(ops.filter((o) => o.metodo === 'pix').map((o) => o.parcelas), [1]);
  assert.equal(opcaoEscolhida(p, 'cartao', 1).total, 21600);
  assert.equal(opcaoEscolhida(p, 'boleto', 1).juros, false);
  // exemplo mostrado ao Anders: 12 × R$ 2.042,49
  const doze = opcaoEscolhida(p, 'cartao', 12);
  assert.equal(doze.valorParcela, 2042.49);
  assert.equal(doze.total, 24509.88);
  assert.deepEqual(opcaoEscolhida(p, 'boleto', 12), { ...doze, metodo: 'boleto' });
  assert.equal(opcaoEscolhida(p, 'pix', 2), null);
  assert.equal(opcaoEscolhida(p, 'cartao', 13), null);
});

test('total parcelado cresce com o número de parcelas e nunca fica abaixo do à vista', () => {
  const p = calculaPreco({ servico: 'auditoria-interna', funcionarios: 10, km: 0 });
  let anterior = p.total;
  for (let n = 2; n <= 12; n++) {
    const o = opcaoEscolhida(p, 'cartao', n);
    assert.ok(o.total > anterior, `${n}x`);
    assert.equal(Math.round(o.valorParcela * n * 100), Math.round(o.total * 100));
    anterior = o.total;
  }
});
