import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizar, normalizarLote, personId, EVENTOS } from '../telemetry.js';

test('só os nomes literais passam', () => {
  for (const nome of ['page_view', 'cta_whatsapp_click', 'form_submit', 'case_view', 'artifact_scan', 'identify']) {
    assert.ok(EVENTOS.has(nome), `${nome} deveria ser evento válido`);
    assert.ok(normalizar({ event: nome }), `${nome} deveria normalizar`);
  }
  for (const lixo of ['pageview', 'PAGE_VIEW', 'whatsapp_click', 'contact', '', null]) {
    assert.equal(normalizar({ event: lixo }), null, `${lixo} não deveria passar`);
  }
});

test('props nunca carregam PII — o contato vive em leads, não aqui', () => {
  const e = normalizar({
    event: 'identify',
    props: { email: 'a@b.com', telefone: '54999999999', nome: 'Anders', cpf: '000', tem_email: true, path: '/' },
  });
  assert.deepEqual(e.props, { tem_email: true, path: '/' });
});

test('person_id é derivado, estável e insensível a formatação', () => {
  const a = personId('Anders@Exemplo.com.BR');
  const b = personId('  anders@exemplo.com.br ');
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{32}$/);
  assert.notEqual(a, personId('outro@exemplo.com'));
  assert.equal(personId('(54) 99964-8368'), personId('5499964 8368'));
  assert.equal(personId(''), null);
});

test('e-mail/telefone viram person_id e não sobrevivem no evento', () => {
  const e = normalizar({ event: 'identify', email: 'a@b.com' });
  assert.equal(e.person_id, personId('a@b.com'));
  assert.equal(e.email, undefined);
  assert.equal(e.telefone, undefined);
});

test('relógio do cliente não polui a série: futuro e passado remoto são descartados', () => {
  const futuro = normalizar({ event: 'page_view', ts: '2099-01-01T00:00:00.000Z' });
  assert.ok(Date.parse(futuro.ts) <= Date.now() + 1000);

  const antigo = normalizar({ event: 'page_view', ts: '2001-01-01T00:00:00.000Z' });
  assert.ok(Date.parse(antigo.ts) > Date.now() - 60_000);

  // Dentro da janela o ts do cliente é preservado — é o que mantém a ORDEM de
  // uma fila que só foi despachada depois do consentimento.
  const recente = new Date(Date.now() - 30_000).toISOString();
  assert.equal(normalizar({ event: 'page_view', ts: recente }).ts, recente);
});

test('anonymous_id fora do formato é descartado, não confiado', () => {
  assert.equal(normalizar({ event: 'page_view', anonymous_id: 'curto' }).anonymous_id, null);
  assert.equal(normalizar({ event: 'page_view', anonymous_id: "'; DROP TABLE--" }).anonymous_id, null);
  const ok = '11111111-2222-3333-4444-555555555555';
  assert.equal(normalizar({ event: 'page_view', anonymous_id: ok }).anonymous_id, ok);
});

test('lote preserva a ordem do funil e corta o excesso', () => {
  const funil = ['page_view', 'cta_whatsapp_click', 'form_submit', 'identify'];
  assert.deepEqual(normalizarLote(funil.map(event => ({ event }))).map(e => e.event), funil);

  const gigante = Array.from({ length: 50 }, () => ({ event: 'page_view' }));
  assert.equal(normalizarLote(gigante).length, 20);

  assert.deepEqual(normalizarLote('não é lista'), []);
  assert.deepEqual(normalizarLote(null), []);
});

test('UTM é truncada, nunca rejeitada em silêncio pelo banco', () => {
  const e = normalizar({ event: 'page_view', utm_campaign: 'x'.repeat(500) });
  assert.equal(e.utm_campaign.length, 120);
});
