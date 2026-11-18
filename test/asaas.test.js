// Testes do que mais dói se quebrar: validação de documento e tradução de
// evento de pagamento. Runner nativo (node --test), sem dependência nova.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docValido, normalizaDoc, traduzEvento, criarCobranca } from '../ead/asaas.js';

// Captura o que seria enviado ao Asaas, sem rede.
async function corpoEnviado(args) {
  const original = globalThis.fetch;
  const antes = process.env.ASAAS_API_KEY;
  process.env.ASAAS_API_KEY = 'chave-de-teste';
  let req;
  globalThis.fetch = async (url, opts) => { req = { url, opts, body: JSON.parse(opts.body) }; return { ok: true, json: async () => ({ id: 'pay_1' }) }; };
  try { await criarCobranca(args); } finally {
    globalThis.fetch = original;
    if (antes === undefined) delete process.env.ASAAS_API_KEY; else process.env.ASAAS_API_KEY = antes;
  }
  return req;
}

test('cobrança à vista manda value; referência padrão do EAD continua igual', async () => {
  const r = await corpoEnviado({ customerId: 'cus_1', valor: 197, descricao: 'Curso', orderId: 9, billingType: 'BOLETO' });
  assert.equal(r.body.value, 197);
  assert.equal(r.body.installmentCount, undefined);
  assert.equal(r.body.externalReference, 'ead-order-9');
  assert.equal(r.opts.headers['access-token-idempotency'], 'ead-order-9');
});

test('cobrança parcelada manda quantidade e valor da parcela, sem value', async () => {
  const r = await corpoEnviado({ customerId: 'cus_1', valor: 35539.32, parcelas: 12, valorParcela: 2961.61, descricao: 'Consultoria', billingType: 'CREDIT_CARD', referencia: 'cons-pedido-5' });
  assert.equal(r.body.installmentCount, 12);
  assert.equal(r.body.installmentValue, 2961.61);
  assert.equal(r.body.value, undefined);
  assert.equal(r.body.externalReference, 'cons-pedido-5');
  assert.equal(r.opts.headers['access-token-idempotency'], 'cons-pedido-5');
});

test('CPF: aceita válido, rejeita inválido e repetido', () => {
  assert.equal(docValido('52998224725'), true);
  assert.equal(docValido('529.982.247-25'), true, 'deve aceitar com máscara');
  assert.equal(docValido('12345678901'), false);
  assert.equal(docValido('11111111111'), false, 'dígitos repetidos não valem');
});

test('CNPJ: aceita válido, rejeita inválido', () => {
  assert.equal(docValido('11222333000181'), true);
  assert.equal(docValido('11222333000180'), false);
});

test('documento: comprimento fora de 11/14 é rejeitado', () => {
  for (const d of ['', '123', '1234567890123456']) assert.equal(docValido(d), false);
});

test('normalizaDoc remove máscara e trata nulo', () => {
  assert.equal(normalizaDoc('529.982.247-25'), '52998224725');
  assert.equal(normalizaDoc(null), '');
});

test('pagamento aprovado libera acesso', () => {
  for (const e of ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']) {
    const r = traduzEvento(e);
    assert.equal(r.status, 'aprovado');
    assert.equal(r.libera, true);
    assert.equal(r.revoga, false);
  }
});

test('estorno e chargeback revogam acesso', () => {
  for (const e of ['PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED', 'PAYMENT_DELETED']) {
    const r = traduzEvento(e);
    assert.equal(r.revoga, true, `${e} deveria revogar`);
    assert.equal(r.libera, false);
  }
});

test('evento desconhecido não vira estado', () => {
  const r = traduzEvento('EVENTO_QUE_NAO_EXISTE');
  assert.equal(r.status, null);
  assert.equal(r.libera, false);
  assert.equal(r.revoga, false);
});
