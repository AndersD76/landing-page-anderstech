// Atribuição, conversões, regras de corte, parceiros e conferência de pagamento.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAtribuicao, canalDoToque, canalDe, scoreLead, atribuicaoDaRequisicao, codigoParceiroValido } from '../growth/atribuicao.js';
import { eventId, normalizaEmail, normalizaTelefone, csvGoogle, csvMicrosoft, horaBrasilia, payloadMeta, fbcDe, sha256 } from '../growth/conversoes.js';
import { decidir, relatorioMarkdown, METAS } from '../growth/regras.js';
import { pagamentoConfere } from '../growth/pagamento.js';
import { destinoSeguro, geraCodigoParceiro, parseCustosCsv } from '../growth/routes.js';

const toque = (extra = {}) => ({ ts: '2026-11-18T12:00:00.000Z', landing: '/iso-9001', ...extra });

test('atribuição: sem consentimento de marketing, identificador de clique é descartado', () => {
  const a = parseAtribuicao({ ft: toque({ gclid: 'Cj0KCQabc123' }), lt: toque({ msclkid: 'abc123def' }), mkt: 0 });
  assert.equal(a.mkt, false);
  assert.equal(a.ft.gclid, undefined);
  assert.equal(a.lt.msclkid, undefined);
  assert.equal(a.ft.landing, '/iso-9001');
});

test('atribuição: com marketing, mantém clique; lixo e entrada hostil não quebram', () => {
  const a = parseAtribuicao(encodeURIComponent(JSON.stringify({ ft: toque({ gclid: 'Cj0KCQabc123' }), mkt: 1, sid: 'abcdef1234567890' })));
  assert.equal(a.ft.gclid, 'Cj0KCQabc123');
  assert.deepEqual(a.lt, a.ft);               // sem último toque, vale o primeiro
  assert.equal(a.sid, 'abcdef1234567890');
  assert.equal(parseAtribuicao('{quebrado'), null);
  assert.equal(parseAtribuicao('x'.repeat(5000)), null);
  const h = parseAtribuicao({ ft: { landing: 'https://mal.com', referrer: 'javascript:alert(1)', gclid: '<script>' }, mkt: 1 });
  assert.equal(h, null);                      // nada aproveitável
});

test('canal: clique vence UTM, UTM vence referrer, parceiro vence tudo', () => {
  assert.equal(canalDoToque(toque({ gclid: 'abcd1234' })), 'google_ads');
  assert.equal(canalDoToque(toque({ gbraid: 'abcd1234' })), 'google_ads');
  assert.equal(canalDoToque(toque({ utm_source: 'google', utm_medium: 'cpc' })), 'google_ads');
  assert.equal(canalDoToque(toque({ msclkid: 'abcd1234' })), 'microsoft_ads');
  assert.equal(canalDoToque(toque({ utm_source: 'facebook', utm_medium: 'paid_social' })), 'meta_ads');
  assert.equal(canalDoToque(toque({ fbclid: 'abcd1234' })), 'social');
  assert.equal(canalDoToque(toque({ utm_medium: 'email', utm_campaign: 'outbound-pbqph-1' })), 'outbound');
  assert.equal(canalDoToque(toque({ referrer: 'https://www.google.com/' })), 'organico');
  assert.equal(canalDoToque(toque({ referrer: 'https://chatgpt.com/' })), 'assistente_ia');
  assert.equal(canalDoToque(toque({ referrer: 'https://www.linkedin.com/feed' })), 'social');
  assert.equal(canalDoToque(toque({ referrer: 'https://anderstech.net/blog' })), 'direto');
  assert.equal(canalDoToque(toque({ referrer: 'https://acisa.com.br/' })), 'referencia');
  const a = { ft: toque({ gclid: 'abcd1234' }), lt: toque() };
  assert.equal(canalDe(a, null), 'google_ads');            // voltou direto: vale o anúncio
  assert.equal(canalDe(a, 'contab-silva-123'), 'parceiro');
});

test('requisição: cookie at_attr vence o corpo; código de parceiro inválido é ignorado', () => {
  const cookie = 'x=1; at_attr=' + encodeURIComponent(JSON.stringify({ ft: toque({ utm_source: 'google', utm_medium: 'cpc' }), mkt: 1, sid: 'sessao12345678' })) + '; at_parceiro=../../etc';
  const o = atribuicaoDaRequisicao({ headers: { cookie }, body: { atrib: { ft: toque({ referrer: 'https://bing.com/' }) } } });
  assert.equal(o.canal, 'google_ads');
  assert.equal(o.parceiro_codigo, null);
  assert.equal(o.session_id, 'sessao12345678');
  assert.equal(o.atribuicao.sid, undefined);
  assert.equal(codigoParceiroValido('contab-silva-123'), true);
});

test('score: prazo, cargo, pedido e comportamento somam; teto 100', () => {
  const s = scoreLead({ prazo: 'agora', cargo: 'Sócio-diretor', canal: 'parceiro', source: 'contratar_pedido', paginas: ['/', '/contratar', '/iso-9001', '/blog/x'], funcionarios: 60, valor: 30000 });
  assert.equal(s.score, 100);
  assert.ok(s.motivos.includes('decide agora'));
  assert.equal(scoreLead({}).score, 0);
});

test('hash: normalização do Google remove ponto do gmail; telefone em E.164', () => {
  assert.equal(normalizaEmail(' Fulano.Tal@Gmail.com ', 'google'), 'fulanotal@gmail.com');
  assert.equal(normalizaEmail('fu.la+promo@googlemail.com', 'google'), 'fula@googlemail.com');
  assert.equal(normalizaEmail(' Fulano.Tal@Gmail.com ', 'meta'), 'fulano.tal@gmail.com');
  assert.equal(normalizaEmail('sem-arroba', 'google'), null);
  assert.equal(normalizaTelefone('(54) 99964-8368', 'google'), '+5554999648368');
  assert.equal(normalizaTelefone('(54) 99964-8368', 'meta'), '5554999648368');
  assert.equal(normalizaTelefone('123', 'meta'), null);
  assert.equal(sha256('a').length, 64);
});

test('feed Google/Microsoft: só linhas com clique, horário de Brasília, event_id como Order ID', () => {
  const conv = [
    { event_id: eventId('payment_succeeded', 'ead_order', 7), evento: 'payment_succeeded', ts: '2026-11-18T15:00:00Z', valor: '297.00', atribuicao: { ft: toque({ gclid: 'G1abc' }), lt: toque() } },
    { event_id: 'lead_captured:lead:9', evento: 'lead_captured', ts: '2026-11-18T15:00:00Z', valor: null, atribuicao: { ft: toque({ gbraid: 'B1abc' }), lt: toque({ msclkid: 'M1abc' }) } },
    { event_id: 'lead_captured:lead:10', evento: 'lead_captured', ts: '2026-11-18T15:00:00Z', valor: null, atribuicao: { ft: toque(), lt: toque() } },
  ];
  const g = csvGoogle(conv).trim().split('\r\n');
  assert.equal(g[0], 'Parameters:TimeZone=America/Sao_Paulo');
  assert.equal(g.length, 4);                                   // 2 cabeçalhos + 2 linhas com clique Google
  assert.equal(g[2], 'G1abc,,,Compra,2026-11-18 12:00:00,297.00,BRL,payment_succeeded:ead_order:7');
  assert.ok(g[3].startsWith(',B1abc,,Lead site,'));
  const m = csvMicrosoft(conv).trim().split('\r\n');
  assert.equal(m.length, 3);
  assert.ok(m[2].startsWith('M1abc,Lead site,2026-11-18 12:00:00'));
  assert.equal(horaBrasilia('2026-01-01T02:30:00Z'), '2025-12-31 23:30:00');
});

test('Meta CAPI: event_id para deduplicar, dados em hash, fbc no formato da Meta', () => {
  const c = { event_id: 'payment_succeeded:ead_order:7', evento: 'payment_succeeded', ts: '2026-11-18T15:00:00Z', valor: '297.00',
    atribuicao: { ft: toque(), lt: toque({ fbclid: 'IwAR123' }), ua: 'Mozilla/5.0' } };
  const p = payloadMeta(c, { email: 'A@B.com', telefone: '54 99964-8368' });
  const e = p.data[0];
  assert.equal(e.event_name, 'Purchase');
  assert.equal(e.event_id, c.event_id);
  assert.equal(e.action_source, 'website');
  assert.equal(e.user_data.client_user_agent, 'Mozilla/5.0');
  assert.equal(e.event_source_url, 'https://anderstech.net/iso-9001');
  // Sem agente do navegador, não finge ser evento de site.
  const s = payloadMeta({ ...c, atribuicao: { ft: toque(), lt: toque() } }, {}).data[0];
  assert.equal(s.action_source, 'system_generated');
  assert.equal(s.event_source_url, undefined);
  assert.deepEqual(e.user_data.em, [sha256('a@b.com')]);
  assert.deepEqual(e.user_data.ph, [sha256('5554999648368')]);
  assert.equal(e.user_data.fbc, `fb.1.${Date.parse('2026-11-18T12:00:00.000Z')}.IwAR123`);
  assert.deepEqual(e.custom_data, { value: 297, currency: 'BRL' });
  assert.equal(fbcDe({ ft: toque(), lt: toque() }), null);
});

test('regras de corte: D3 higiene, D7 pausa, D14 escala', () => {
  const max = METAS.cpl_max_consultoria;
  assert.equal(decidir({ dia: 3, custo: 2 * max, cliques: 20, impressoes: 500, leads: 0 }).acao, 'pausar');
  assert.equal(decidir({ dia: 3, custo: 50, cliques: 5, impressoes: 1200, leads: 0 }).acao, 'ajustar');   // CTR < 1%
  assert.equal(decidir({ dia: 7, custo: 200, cliques: 45, impressoes: 900, leads: 0 }).acao, 'pausar');
  assert.equal(decidir({ dia: 7, custo: 2000, cliques: 100, impressoes: 3000, leads: 3 }).acao, 'pausar'); // CPL 666 > 1,5×300
  assert.equal(decidir({ dia: 14, custo: 1000, cliques: 120, impressoes: 4000, leads: 6 }).acao, 'escalar'); // CPL 166
  assert.equal(decidir({ dia: 14, custo: 1500, cliques: 120, impressoes: 4000, leads: 4 }).acao, 'ajustar'); // CPL 375
  assert.equal(decidir({ dia: 7, custo: 150, cliques: 20, impressoes: 600, vendas: 2, tipo: 'ead' }).acao, 'manter');
  const md = relatorioMarkdown({ dia: 7, geradoEm: 'agora', campanhas: [{ canal: 'google_ads', campanha: 'c1', custo: 2000, cliques: 100, impressoes: 3000, leads: 3 }], canais: [{ canal: 'google_ads', leads: 3, vendas: 0, receita: 0, custo: 2000 }] });
  assert.match(md, /### Pausar\n\n- \*\*google_ads · c1\*\*/);
  assert.match(md, /\| google_ads \| 3 \| 0 \|/);
});

test('custos CSV: vírgula e ponto-e-vírgula, decimal brasileiro, linha ruim reportada', () => {
  const a = parseCustosCsv('dia,canal,campanha,custo,impressoes,cliques\n2026-11-20,google_ads,iso,48.30,612,9\nlixo,,,x');
  assert.equal(a.linhas.length, 1);
  assert.equal(a.linhas[0].custo, 48.3);
  assert.equal(a.erros.length, 1);
  const b = parseCustosCsv('dia;canal;campanha;custo\n2026-11-20;microsoft_ads;ead;"1.234,56"');
  assert.equal(b.linhas[0].custo, 1234.56);
  assert.equal(parseCustosCsv('a,b\n1,2').linhas.length, 0);
});

test('parceiro: destino só interno (sem redirecionamento aberto) e código válido', () => {
  assert.equal(destinoSeguro('/iso-9001'), '/iso-9001');
  assert.equal(destinoSeguro('//evil.com'), '/');
  assert.equal(destinoSeguro('https://evil.com'), '/');
  assert.equal(destinoSeguro('/\\evil.com'), '/');
  assert.equal(destinoSeguro(undefined), '/');
  for (let i = 0; i < 20; i++) assert.ok(codigoParceiroValido(geraCodigoParceiro('Contabilidade São João Ltda.')));
});

test('pagamento: só libera o que a API do Asaas confirma (status, referência, valor)', async () => {
  const api = (r) => async () => r;
  const ok = await pagamentoConfere({ id: 'pay_1' }, { referencia: 'ead-order-5', valorMinimo: '297.00' },
    api({ id: 'pay_1', status: 'RECEIVED', externalReference: 'ead-order-5', value: 297 }));
  assert.equal(ok.ok, true);
  const naoPago = await pagamentoConfere({ id: 'pay_1' }, { referencia: 'ead-order-5', valorMinimo: 297 },
    api({ id: 'pay_1', status: 'PENDING', externalReference: 'ead-order-5', value: 297 }));
  assert.equal(naoPago.ok, false);
  const outroPedido = await pagamentoConfere({ id: 'pay_1' }, { referencia: 'ead-order-5', valorMinimo: 297 },
    api({ id: 'pay_1', status: 'CONFIRMED', externalReference: 'ead-order-6', value: 297 }));
  assert.equal(outroPedido.ok, false);
  const aMenos = await pagamentoConfere({ id: 'pay_1' }, { referencia: 'ead-order-5', valorMinimo: 297 },
    api({ id: 'pay_1', status: 'CONFIRMED', externalReference: 'ead-order-5', value: 1 }));
  assert.equal(aMenos.ok, false);
  const parcela = await pagamentoConfere({ id: 'pay_2' }, { referencia: 'cons-pedido-3', installment: 'ins_9', valorMinimo: '2961.61' },
    api({ id: 'pay_2', status: 'CONFIRMED', installment: 'ins_9', value: 2961.61 }));
  assert.equal(parcela.ok, true);
  assert.equal((await pagamentoConfere({}, { referencia: 'x', valorMinimo: 1 }, api(null))).ok, false);
  await assert.rejects(pagamentoConfere({ id: 'p' }, { referencia: 'x', valorMinimo: 1 }, async () => { throw new Error('rede'); }));
});

test('anúncios: limites do Google Ads e só URL do próprio site', async () => {
  const { CAMPANHAS, SITELINKS, CALLOUTS, LIMITES } = await import('../growth/midia.js');
  const n = (s) => [...s].length;
  for (const k of CAMPANHAS) for (const g of k.grupos) {
    assert.ok(g.titulos.length >= 3 && g.titulos.length <= 15, g.nome);
    assert.ok(g.descricoes.length >= 2 && g.descricoes.length <= 4, g.nome);
    for (const t of g.titulos) assert.ok(n(t) <= LIMITES.titulo, `${g.nome}: ${t}`);
    for (const d of g.descricoes) assert.ok(n(d) <= LIMITES.descricao, `${g.nome}: ${d}`);
    for (const p of g.caminho) assert.ok(n(p) <= LIMITES.caminho, p);
    assert.match(g.url, /^https:\/\/anderstech\.net\//);
    // "Pague online" só pode entrar quando a venda da consultoria estiver ligada.
    for (const t of [...g.titulos, ...g.descricoes]) if (!k.nome.startsWith('ead')) assert.doesNotMatch(t, /pague online|pagamento online/i);
  }
  for (const s of SITELINKS) { assert.ok(n(s.texto) <= LIMITES.sitelink); assert.ok(n(s.d1) <= LIMITES.sitelinkDesc); assert.ok(n(s.d2) <= LIMITES.sitelinkDesc); }
  for (const c of CALLOUTS) assert.ok(n(c) <= LIMITES.callout, c);
});

test('WhatsApp: origem e rota saem da mensagem pré-preenchida', async () => {
  const { origemDaMensagem, assinaturaValida, mensagensDoPayload } = await import('../growth/whatsapp.js');
  assert.deepEqual(origemDaMensagem('Olá! Vim pela página ISO 9001:2026 (/iso-9001-2026) e quero planejar a transição.'), { origem: 'ISO 9001:2026', rota: '/iso-9001-2026' });
  assert.deepEqual(origemDaMensagem('Olá! Vim pela página Contratar. Quero ISO 9001'), { origem: 'Contratar', rota: null });
  assert.deepEqual(origemDaMensagem('oi, tudo bem?'), { origem: null, rota: null });
  const corpo = '{"a":1}';
  const crypto = await import('node:crypto');
  const sig = 'sha256=' + crypto.createHmac('sha256', 's3gr3d0').update(corpo).digest('hex');
  assert.equal(assinaturaValida(Buffer.from(corpo), sig, 's3gr3d0'), true);
  assert.equal(assinaturaValida(Buffer.from(corpo), 'sha256=00', 's3gr3d0'), false);
  const msgs = mensagensDoPayload({ entry: [{ changes: [{ value: { contacts: [{ wa_id: '55', profile: { name: 'Ana' } }], messages: [{ from: '55', id: 'x', type: 'text', text: { body: 'oi' }, timestamp: '1763500000' }] } }] }] });
  assert.equal(msgs[0].nome, 'Ana');
  assert.equal(msgs[0].texto, 'oi');
});

test('régua: lead da isca de transição não entra também na régua genérica', async () => {
  const { aoLeadIscaOrganica } = await import('../organico/iscas.js');
  let chamadas = 0;
  const sqlFalso = () => { chamadas++; return Promise.resolve([]); };
  process.env.REGUA_ATIVA = 'true';
  await aoLeadIscaOrganica(sqlFalso, { leadId: 1, source: 'isca_transicao_2026', email: 'a@b.com', optin: true });
  delete process.env.REGUA_ATIVA;
  assert.equal(chamadas, 0);
});

test('Google: conta de serviço assina o JWT, pede os dois escopos de leitura e reaproveita o token', async () => {
  const crypto = await import('node:crypto');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const chave = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const json = JSON.stringify({ type: 'service_account', client_email: 'leitor@projeto.iam.gserviceaccount.com', private_key: chave, token_uri: 'https://oauth2.googleapis.com/token' });
  const antes = { ...process.env };
  try {
    for (const k of ['GOOGLE_SERVICE_ACCOUNT_JSON', 'GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_OAUTH_REFRESH_TOKEN', 'GSC_ATIVO', 'GA4_PROPERTY_ID']) delete process.env[k];
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 = Buffer.from(json).toString('base64');
    const { contaServicoGoogle, googleTokenLeitura } = await import('../growth/integracoes.js');
    const { gscConfigurado, ga4Configurado } = await import('../organico/fontes.js');
    assert.equal(contaServicoGoogle().email, 'leitor@projeto.iam.gserviceaccount.com');
    assert.equal(gscConfigurado(), true, 'com a chave o Search Console liga sem GSC_ATIVO');
    assert.equal(ga4Configurado(), true, 'propriedade GA4 vem de config/empresa.js');

    let chamadas = 0, assercao = null;
    const fetchImpl = async (url, opt) => {
      chamadas++;
      const p = new URLSearchParams(opt.body);
      assert.equal(p.get('grant_type'), 'urn:ietf:params:oauth:grant-type:jwt-bearer');
      assercao = p.get('assertion');
      return { ok: true, json: async () => ({ access_token: 'tok-1', expires_in: 3600 }) };
    };
    assert.equal(await googleTokenLeitura({ fetchImpl }), 'tok-1');
    assert.equal(await googleTokenLeitura({ fetchImpl }), 'tok-1');
    assert.equal(chamadas, 1, 'token em cache até perto de expirar');

    const [cab, corpo, sig] = assercao.split('.');
    const dec = (s) => JSON.parse(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    assert.deepEqual(dec(cab), { alg: 'RS256', typ: 'JWT' });
    const c = dec(corpo);
    assert.equal(c.iss, 'leitor@projeto.iam.gserviceaccount.com');
    assert.equal(c.aud, 'https://oauth2.googleapis.com/token');
    assert.equal(c.exp - c.iat, 3600);
    assert.deepEqual(c.scope.split(' ').sort(), ['https://www.googleapis.com/auth/analytics.readonly', 'https://www.googleapis.com/auth/webmasters']);
    const ok = crypto.createVerify('RSA-SHA256').update(`${cab}.${corpo}`).verify(publicKey, Buffer.from(sig.replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
    assert.equal(ok, true, 'assinatura confere com a chave pública');

    process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 = '{ isto não é json';
    assert.equal(contaServicoGoogle(), null, 'chave quebrada desliga em vez de derrubar');
    assert.equal(gscConfigurado(), false);
  } finally {
    for (const k of Object.keys(process.env)) if (!(k in antes)) delete process.env[k];
    Object.assign(process.env, antes);
  }
});
