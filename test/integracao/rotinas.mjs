// Teste de integração (npm run test:integracao). Rotinas sem HTTP, no PGlite: onda, oportunidades, linha de base, alertas,
// resumo, fila de envio e integrações (APIs externas simuladas).
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const imp = (p) => import(pathToFileURL(join(raiz, p)).href);
const { neon } = await import('@neondatabase/serverless');   // → adaptador PGlite (gancho)
const sql = neon('x');
const { runMigrations } = await imp('db/migrate.js');
await runMigrations(sql);
const ok = (m) => console.log('ok  ' + m);

const jobs = await imp('organico/jobs.js');
const pag = await imp('organico/paginas.js');
await jobs.semear(sql);
await pag.recarregar(sql);
ok('semear + recarregar');

// Onda: uma página "llm" aprovada vira publicada, com distribuição.
const s = pag.sementes()[0];
await sql`INSERT INTO seo_paginas (slug, tipo, cluster, consulta, titulo, descricao, h1, resposta, corpo, faq, fontes, valor_proprio, origem, status)
  VALUES ('guia/teste-onda', 'satelite', ${s.cluster}, ${s.consulta + ' exemplo'}, ${'Teste de onda: ' + s.titulo.slice(0, 40)}, ${s.descricao}, ${s.h1 + ' (teste)'}, ${s.resposta},
          ${JSON.stringify({ secoes: [...s.corpo.secoes, { titulo: 'Passo a passo', texto: 'x '.repeat(300) }] })}::jsonb, ${JSON.stringify(s.faq)}::jsonb, ${JSON.stringify(s.fontes)}::jsonb, ${s.valor_proprio}, 'llm', 'aprovada')`;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url) => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' });
const onda = await jobs.publicarOnda(sql);
const dist = await sql`SELECT canal FROM distribuicao WHERE pagina_slug = 'guia/teste-onda'`;
const st = (await sql`SELECT status, onda FROM seo_paginas WHERE slug = 'guia/teste-onda'`)[0];
console.log('    onda:', JSON.stringify(onda), 'status:', st.status, 'distribuição:', dist.map(d => d.canal).join(','));
assert.ok(st.onda, 'página ganhou número de onda');
ok('onda semanal publicou/avaliou a página produzida e ' + (dist.length ? 'gerou post + roteiro' : 'a página caiu no portão (revisão)'));

// Avaliação de onda velha: menos de 50% indexada pausa o tipo.
await sql`UPDATE seo_ondas SET publicada_em = NOW() - INTERVAL '30 days'`;
await jobs.avaliarOndas(sql);
assert.equal((await sql`SELECT COUNT(*)::int n FROM seo_fila WHERE tipo = 'pausa_tipo' AND status = 'aberta'`)[0].n, 1);
ok('onda abaixo de 50% indexada em 21 dias pausa o tipo');

// Oportunidades e frescor a partir do Search Console.
for (let d = 1; d <= 50; d++) {
  const dia = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
  await sql`INSERT INTO seo_gsc (dia, pagina, consulta, dispositivo, cliques, impressoes, ctr, posicao) VALUES (${dia}, '/norma-iso-9001/6-1', 'requisito 6.1 iso 9001', 'MOBILE', ${d > 28 ? 3 : 0}, 20, 0, 8)`;
}
const op = await jobs.oportunidades(sql);
const fila = await sql`SELECT tipo FROM seo_fila WHERE alvo = '/norma-iso-9001/6-1'`;
assert.ok(fila.some(f => f.tipo === 'reforcar')); assert.ok(fila.some(f => f.tipo === 'reescrever_title')); assert.ok(fila.some(f => f.tipo === 'atualizar'));
ok(`oportunidades: reforçar, reescrever title, atualizar (+${op.novas_do_gsc} consulta nova do GSC)`);

const base = await jobs.linhaDeBase(sql);
assert.ok(base.consultas_no_mapa >= 5000);
ok('linha de base gravada: ' + Object.keys(base).length + ' métricas');

let enviados = [];
const enviar = async (assunto, html) => enviados.push(assunto);
await sql`INSERT INTO telemetry_events (event, props, ts) SELECT 'isca_vista', '{"isca_id":"checklist-auditoria-interna"}'::jsonb, NOW() FROM generate_series(1, 25)`;
const al = await jobs.alertas(sql, enviar);
assert.ok(al.some(a => /checklist-auditoria-interna/.test(a)));
assert.equal(enviados.length, 1);
const al2 = await jobs.alertas(sql, enviar);
assert.equal(al2.length, 0, 'alerta não repete');
ok('alertas: isca com zero conversão, e-mail enviado uma vez');
await jobs.resumoSemanal(sql, enviar);
assert.equal(enviados.length, 2);
ok('resumo semanal montado e enviado');

// Fila de envio com Resend falso e régua ligada.
const men = await imp('growth/mensageria.js');
process.env.REGUA_ATIVA = 'true';
const [lead] = await sql`INSERT INTO leads (email, status, optin_marketing) VALUES ('fila@teste.test', 'novo', TRUE) RETURNING id`;
await men.agendar(sql, { tipo: 'regua', chave: 'isca-2026-2', refTipo: 'lead', refId: lead.id, email: 'fila@teste.test', params: { nome: 'Ana' }, quando: Date.now() - 1000 });
await men.agendar(sql, { tipo: 'regua', chave: 'isca-2026-3', refTipo: 'lead', refId: lead.id, email: 'sup@teste.test', quando: Date.now() - 1000 });
await men.suprimir(sql, 'sup@teste.test', 'teste');
const mandados = [];
const resendFalso = { emails: { send: async (m) => { mandados.push(m); return { id: 'x' }; } } };
await men.processarFila(sql, resendFalso);
assert.equal(mandados.length, 1);
assert.match(mandados[0].headers['List-Unsubscribe'], /\/sair\/[a-f0-9]{36}>/);
assert.equal(mandados[0].headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
assert.match(decodeURIComponent(mandados[0].html), /utm_campaign=regua-isca-2026/);
assert.ok(mandados[0].replyTo && mandados[0].replyTo.includes('@') && !/noreply/.test(mandados[0].replyTo), 'resposta da régua iria para o noreply');
ok('fila: envia com descadastro em 1 clique e UTM; suprimido não recebe');

// Integrações com APIs simuladas.
const integ = await imp('growth/integracoes.js');
const conv = await imp('growth/conversoes.js');
Object.assign(process.env, { GOOGLE_OAUTH_CLIENT_ID: 'c', GOOGLE_OAUTH_CLIENT_SECRET: 's', GOOGLE_OAUTH_REFRESH_TOKEN: 'r', GOOGLE_ADS_CUSTOMER_ID: '123-456-7890', GOOGLE_CONVERSAO_LEAD: '999', MS_UET_TAG_ID: 't', MS_UET_TOKEN: 'k', GOOGLE_ADS_DEVELOPER_TOKEN: 'd' });
await conv.registrarConversao(sql, { evento: 'lead_captured', refTipo: 'lead', refId: lead.id, origem: { canal: 'google_ads', consent_marketing: true, atribuicao: { ft: { gclid: 'G1', msclkid: 'M-1' }, lt: { gclid: 'G1', msclkid: 'M-1' } } } });
const chamadas = [];
const fetchFalso = async (url, o = {}) => { chamadas.push({ url, corpo: o.body }); if (String(url).includes('oauth2')) return { ok: true, json: async () => ({ access_token: 'T', expires_in: 3600 }) };
  if (String(url).includes('searchStream')) return { ok: true, json: async () => [{ results: [{ segments: { date: '2026-11-17' }, campaign: { id: '123' }, metrics: { costMicros: '45670000', impressions: '800', clicks: '20' } }] }] };
  return { ok: true, status: 200, text: async () => '{}', json: async () => ({}) }; };
const contatoDe = conv.contatoDaConversao(sql);
await integ.despacharGoogle(sql, contatoDe, { fetchImpl: fetchFalso });
const dm = JSON.parse(chamadas.find(c => c.url.includes('datamanager')).corpo);
assert.equal(dm.destinations[0].operatingAccount.accountId, '1234567890');
assert.equal(dm.events[0].adIdentifiers.gclid, 'G1');
assert.equal(dm.events[0].userData.userIdentifiers[0].emailAddress.length, 64);
await integ.despacharMicrosoft(sql, contatoDe, { fetchImpl: fetchFalso });
const uet = JSON.parse(chamadas.find(c => c.url.includes('capi.uet')).corpo);
assert.equal(uet.data[0].userData.msclkid, 'M1');
const envios = (await sql`SELECT envios FROM conversoes WHERE ref_id = ${lead.id}`)[0].envios;
assert.ok(envios.google.ok && envios.microsoft.ok);
const custo = await integ.importarCustoGoogleAds(sql, { fetchImpl: fetchFalso });
assert.equal(custo.linhas, 1);
assert.equal(Number((await sql`SELECT custo FROM custos_midia WHERE campanha = '123' AND dia = '2026-11-17'`)[0].custo), 45.67);
ok('Google Data Manager, Microsoft UET e custo do Google Ads (simulados) gravam no banco');
globalThis.fetch = realFetch;
console.log('\nROTINAS OK NO POSTGRES (PGlite)');
