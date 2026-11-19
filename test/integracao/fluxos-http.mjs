// Teste de integração (npm run test:integracao). Sobe o servidor de verdade com o Neon trocado por PGlite e exercita, por HTTP,
// os fluxos novos: lead com atribuição, conversões, feed, custos, relatório,
// parceiro, isca, WhatsApp, régua, outbound e os painéis.
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { fileURLToPath } from 'node:url';
const aqui = fileURLToPath(new URL('.', import.meta.url));
const raiz = join(aqui, '..', '..');
const PORTA = 3990, B = `http://127.0.0.1:${PORTA}`, K = 'chave-admin-teste', SEG = 'segredo-app-whatsapp';
const env = { ...process.env, PORT: String(PORTA), NODE_ENV: 'development', DATABASE_URL: 'postgres://u:p@127.0.0.1:1/nada',
  ADMIN_KEY: K, CONVERSOES_FEED_USUARIO: 'feed', CONVERSOES_FEED_SENHA: 'senha', WHATSAPP_VERIFY_TOKEN: 'verifica', WHATSAPP_APP_SECRET: SEG,
  REGUA_ATIVA: 'true', MAPA_AUTOCOMPLETE: 'false', TELEMETRY_ENABLED: 'true' };
delete env.RESEND_API_KEY; delete env.ASAAS_API_KEY;
const srv = spawn(process.execPath, ['--import', pathToFileURL(join(aqui, 'registra.mjs')).href, 'server' + '.js'], { cwd: raiz, env, stdio: ['ignore', 'pipe', 'pipe'] });
let log = '';
srv.stdout.on('data', d => log += d); srv.stderr.on('data', d => log += d);
const H = { Authorization: 'Bearer ' + K, 'Content-Type': 'application/json' };
const get = (p, h = H) => fetch(B + p, { headers: h, redirect: 'manual' });
const post = (p, b, h = H) => fetch(B + p, { method: 'POST', headers: h, body: typeof b === 'string' ? b : JSON.stringify(b), redirect: 'manual' });
const ok = (m) => console.log('ok  ' + m);

try {
  for (let i = 0; i < 900; i++) { try { if ((await fetch(B + '/healthz')).ok) break; } catch {} await new Promise(r => setTimeout(r, 200)); }
  assert.deepEqual(await (await fetch(B + '/healthz')).json(), { status: 'ok', db: true });
  ok('servidor no PGlite, migrações 001–020 aplicadas');

  // espera a semeadura do motor orgânico
  let visao;
  for (let i = 0; i < 60; i++) {
    const r = await get('/api/admin/organico/visao');
    if (r.ok) { visao = await r.json(); const n = visao.consultas.reduce((s, x) => s + x.n, 0); if (n >= 5000 && visao.porTipo.some(t => t.tipo === 'norma' && t.publicadas >= 28)) break; }
    await new Promise(r => setTimeout(r, 1000));
  }
  const nConsultas = visao.consultas.reduce((s, x) => s + x.n, 0);
  assert.ok(nConsultas >= 5000, 'consultas no mapa: ' + nConsultas);
  ok(`mapa de buscas: ${nConsultas} consultas; normas publicadas: ${visao.porTipo.find(t => t.tipo === 'norma').publicadas}`);
  for (const p of ['/api/admin/organico/consultas', '/api/admin/organico/paginas', '/api/admin/organico/distribuicao']) assert.equal((await get(p)).status, 200, p);
  assert.equal((await (await get('/api/admin/organico/alvos')).json()).length, 104);
  assert.equal((await (await get('/api/admin/organico/artigos')).json()).length, 10);
  ok('painel orgânico: consultas, páginas, 104 alvos, 10 artigos, distribuição');

  // lead com atribuição de anúncio (consentimento de marketing)
  const attr = encodeURIComponent(JSON.stringify({ ft: { ts: new Date().toISOString(), landing: '/iso-9001-2026', utm_source: 'google', utm_medium: 'cpc', utm_campaign: '123', gclid: 'CjTesteGclid' }, mkt: 1, sid: 'sessaoteste12345' }));
  let r = await post('/api/contact', { email: 'qualidade@metal.test', nome: 'Ana', cargo: 'gerente da qualidade', prazo: 'agora', source: 'isca_transicao_2026', interesse: 'Transição', optin_marketing: true, isca_id: 'diagnostico-transicao-2026', diagnostico: { pct: 35, lacunas: 7, url: 'http://x/transicao-iso-9001-2026?r=SPNNPNSNNP2' } }, { 'Content-Type': 'application/json', Cookie: 'at_attr=' + attr });
  assert.equal(r.status, 200, await r.text());
  const leads = await (await get('/api/admin/leads')).json();
  const l = leads.find(x => x.email === 'qualidade@metal.test');
  assert.equal(l.canal, 'google_ads'); assert.ok(l.score >= 40); assert.equal(l.optin_marketing, true); assert.equal(l.atribuicao.ft.gclid, 'CjTesteGclid');
  ok(`lead gravado: canal ${l.canal}, score ${l.score}, opt-in ${l.optin_marketing}`);
  const csv = await (await get('/conversoes/google.csv', { Authorization: 'Basic ' + Buffer.from('feed:senha').toString('base64') })).text();
  assert.match(csv, /CjTesteGclid,,,Lead site,/);
  ok('feed do Google traz o gclid do lead');
  const regua = (await (await get('/api/admin/operacao/mensagens?tipo=regua')).json()).filter(m => m.ref_id === String(l.id));
  assert.equal(regua.length, 4);
  ok('régua da isca agendou 4 mensagens (opt-in marcado, REGUA_ATIVA)');

  r = await post('/api/admin/custos', { csv: 'dia,canal,campanha,custo,impressoes,cliques\n' + new Date().toISOString().slice(0, 10) + ',google_ads,123,250.00,900,30' });
  assert.equal(r.status, 200);
  const canais = await (await get('/api/admin/canais?dias=30')).json();
  const g = canais.canais.find(c => c.canal === 'google_ads');
  assert.equal(g.leads, 1); assert.equal(g.custo, 250); assert.equal(g.cpl, 250);
  const rel = await (await get('/api/admin/relatorio?dia=7')).text();
  assert.match(rel, /# Relatório de mídia — D7/);
  ok(`painel de canais (CPL R$ ${g.cpl}) e relatório D7`);

  // parceiro
  r = await post('/api/parceiros', { nome: 'Contabilidade Teste', email: 'contab@teste.test', tipo: 'contabilidade', aceite: true }, { 'Content-Type': 'application/json' });
  assert.equal(r.status, 200);
  const parc = (await (await get('/api/admin/parceiros')).json())[0];
  assert.equal((await fetch(B + '/api/admin/parceiros/' + parc.id, { method: 'PATCH', headers: H, body: JSON.stringify({ status: 'ativo' }) })).status, 200);
  r = await get('/p/' + parc.codigo + '?para=/iso-9001', {});
  assert.equal(r.status, 302);
  const ck = (r.headers.get('set-cookie') || '').match(/at_parceiro=[^;]+/)[0];
  r = await post('/api/contact', { email: 'indicado@empresa.test', source: 'site_form' }, { 'Content-Type': 'application/json', Cookie: ck });
  assert.equal(r.status, 200);
  const ind = (await (await get('/api/admin/leads')).json()).find(x => x.email === 'indicado@empresa.test');
  assert.equal(ind.canal, 'parceiro');
  const painel = await (await get('/parceiro/' + parc.token, {})).text();
  assert.match(painel, /<b>1<\/b>cliques no link/);
  ok('parceiro: cadastro, ativação, link /p/, cookie, lead atribuído e painel');

  // isca em PDF
  r = await post('/api/iscas/checklist-auditoria-interna', { email: 'aud@teste.test', optin_marketing: false }, { 'Content-Type': 'application/json' });
  assert.equal(r.status, 200);
  assert.ok((await (await get('/api/admin/leads')).json()).some(x => x.email === 'aud@teste.test' && x.source === 'isca_checklist-auditoria-interna'));
  ok('isca em PDF grava o lead');

  // WhatsApp
  assert.equal(await (await get('/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verifica&hub.challenge=42', {})).text(), '42');
  const corpo = JSON.stringify({ object: 'whatsapp_business_account', entry: [{ changes: [{ field: 'messages', value: { contacts: [{ wa_id: '5554988887777', profile: { name: 'Carlos' } }], messages: [{ from: '5554988887777', id: 'wamid.1', timestamp: '1763500000', type: 'text', text: { body: 'Olá! Vim pela página ISO 9001:2026 (/iso-9001-2026)' } }] } }] }] });
  assert.equal((await post('/api/whatsapp/webhook', corpo, { 'Content-Type': 'application/json', 'X-Hub-Signature-256': 'sha256=errada' })).status, 401);
  const sig = 'sha256=' + crypto.createHmac('sha256', SEG).update(corpo).digest('hex');
  assert.equal((await post('/api/whatsapp/webhook', corpo, { 'Content-Type': 'application/json', 'X-Hub-Signature-256': sig })).status, 200);
  const wa = (await (await get('/api/admin/leads')).json()).find(x => x.source === 'whatsapp_inbound');
  assert.equal(wa.landing_page, '/iso-9001-2026'); assert.equal(wa.nome, 'Carlos');
  ok('WhatsApp: verificação, assinatura recusada/aceita, lead com página de origem');

  // operação
  const est = await (await get('/api/admin/operacao/estado')).json();
  assert.equal(est.regua, true); assert.equal(est.outbound, false);
  assert.equal((await (await get('/api/admin/operacao/posts')).json()).length, 30);
  assert.equal((await (await get('/api/admin/operacao/parceiros-alvo')).json()).length, 50);
  assert.match(await (await get('/api/admin/midia/3-palavras.csv')).text(), /consultoria iso 9001,Exact/);
  ok('operação: estado, 30 posts, 50 parceiros-alvo, CSV de palavras');
  r = await post('/api/admin/operacao/contas/sincronizar', {});
  const sinc = await r.json();
  assert.equal(r.status, 200, JSON.stringify(sinc));
  assert.equal(sinc.contas, 143);
  ok(`outbound: ${sinc.contas} contas sincronizadas (${sinc.comEmail ?? 'sem'} com e-mail do SiAC)`);
  const contas = await (await get('/api/admin/operacao/contas')).json();
  const alvo = contas.find(c => c.email);
  if (alvo) {
    r = await post('/api/admin/operacao/contas/' + encodeURIComponent(alvo.cnpj) + '/iniciar', {});
    assert.equal(r.status, 200, await r.text());
    const tarefas = await (await get('/api/admin/operacao/mensagens?tipo=tarefa')).json();
    assert.ok(tarefas.some(t => t.ref_id === alvo.cnpj && /Daniel Anders/.test(t.roteiro)));
    assert.equal((await fetch(B + '/api/admin/operacao/contas/' + encodeURIComponent(alvo.cnpj), { method: 'PATCH', headers: H, body: JSON.stringify({ status: 'sair' }) })).status, 200);
    const depois = (await (await get('/api/admin/operacao/mensagens')).json()).filter(m => m.ref_id === alvo.cnpj && m.tipo === 'outbound');
    assert.ok(depois.every(m => m.status !== 'agendada'));
    ok('outbound: sequência iniciada (e-mails + tarefa de ligação) e cancelada ao marcar "sair"');
  } else ok('outbound: SiAC sem contatos nesta rodada — iniciar não testado');

  assert.equal((await post('/sair/' + 'f'.repeat(36), '', {})).status, 200);
  console.log('\nTODOS OS FLUXOS PASSARAM NO POSTGRES (PGlite)');
} catch (e) {
  console.error('FALHOU:', e.message);
  console.error(log.split('\n').filter(x => !/^\s*at /.test(x)).slice(-40).join('\n'));
  process.exitCode = 1;
} finally { srv.kill(); }
