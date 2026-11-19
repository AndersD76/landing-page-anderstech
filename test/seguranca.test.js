// ── Portão de segurança (Bloco 1) ────────────────────────────────────────────
// Sobe o servidor de verdade, em modo produção e SEM banco, e ataca de fora:
// rota protegida sem credencial, credencial errada, cabeçalhos, vazamento de
// arquivo, redirecionamento aberto, webhook sem token, limite de login.
// Sem banco, toda rota que passasse da autenticação responderia 503 — então
// 401/403 aqui prova que a barreira vem ANTES de qualquer acesso a dado.
//
// IDOR com dado real (aluno A lendo pedido do aluno B) exige banco: está
// coberto pela trava estática no fim deste arquivo, que confere que cada
// consulta de recurso do usuário filtra pelo id da sessão.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = 3900 + Math.floor(Math.random() * 90);
const BASE = `http://127.0.0.1:${PORTA}`;
let srv;

before(async () => {
  const env = { ...process.env, PORT: String(PORTA), NODE_ENV: 'production', SESSION_SECRET: 'teste-seguranca',
    ADMIN_KEY: 'chave-certa-de-teste', ASAAS_WEBHOOK_TOKEN: 'token-certo-de-teste-com-32-caracteres',
    CONVERSOES_FEED_USUARIO: 'feed', CONVERSOES_FEED_SENHA: 'senha-do-feed', SENTRY_DSN: '' };
  delete env.DATABASE_URL;
  delete env.RESEND_API_KEY;
  delete env.ASAAS_API_KEY;
  srv = spawn(process.execPath, ['server.js'], { cwd: RAIZ, env, stdio: 'ignore' });
  for (let i = 0; i < 600; i++) {
    try { if ((await fetch(BASE + '/robots.txt')).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('servidor não subiu');
});

after(() => { if (srv) srv.kill(); });

const req = (caminho, opts = {}) => fetch(BASE + caminho, { redirect: 'manual', ...opts });

test('cabeçalhos de segurança na página pública', async () => {
  const r = await req('/');
  const csp = r.headers.get('content-security-policy') || '';
  assert.match(csp, /frame-ancestors 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /script-src-attr 'none'/);
  assert.match(r.headers.get('strict-transport-security') || '', /max-age=\d{7,}/);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(r.headers.get('referrer-policy'));
  assert.match(r.headers.get('permissions-policy') || '', /camera=\(\)/);
  assert.equal(r.headers.get('x-powered-by'), null);
});

test('CORS: origem estranha não é refletida', async () => {
  const r = await req('/api/contact', { method: 'OPTIONS', headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'POST' } });
  assert.notEqual(r.headers.get('access-control-allow-origin'), 'https://evil.example');
});

const ADMIN = [
  ['GET', '/api/admin/stats'], ['GET', '/api/admin/leads'], ['GET', '/api/admin/leads/1'], ['PATCH', '/api/admin/leads/1'],
  ['GET', '/api/admin/trafego'], ['GET', '/api/admin/canais'], ['GET', '/api/admin/relatorio'], ['POST', '/api/admin/custos'],
  ['GET', '/api/admin/parceiros'], ['PATCH', '/api/admin/parceiros/1'], ['GET', '/api/admin/leads.csv'],
  ['GET', '/api/admin/cupons'], ['POST', '/api/admin/cupons'], ['PATCH', '/api/admin/cupons/1'],
  ['POST', '/api/admin/artifacts'], ['POST', '/api/admin/cases'], ['GET', '/api/admin/cases'], ['GET', '/api/admin/cases/x/pdf'],
  ['GET', '/api/admin/operacao/estado'], ['GET', '/api/admin/operacao/contas'], ['POST', '/api/admin/operacao/contas/sincronizar'],
  ['POST', '/api/admin/operacao/contas/iniciar-lote'], ['PATCH', '/api/admin/operacao/contas/x'], ['GET', '/api/admin/operacao/mensagens'],
  ['GET', '/api/admin/operacao/posts'], ['GET', '/api/admin/operacao/parceiros-alvo'], ['GET', '/api/admin/midia/1-campanhas.csv'],
  ['GET', '/api/admin/organico/visao'], ['GET', '/api/admin/organico/consultas'], ['GET', '/api/admin/organico/paginas'],
  ['POST', '/api/admin/organico/paginas/1/publicar'], ['GET', '/api/admin/organico/alvos'], ['GET', '/api/admin/organico/distribuicao'],
  ['GET', '/api/admin/organico/artigos'], ['POST', '/api/admin/organico/semear'],
];

test('admin: sem chave e com chave errada → 401, em todas as rotas', async () => {
  for (const [m, p] of ADMIN) {
    const sem = await req(p, { method: m, headers: { 'Content-Type': 'application/json' }, body: m === 'GET' ? undefined : '{}' });
    assert.equal(sem.status, 401, `${m} ${p} sem chave`);
    const errada = await req(p, { method: m, headers: { Authorization: 'Bearer chave-errada', 'Content-Type': 'application/json' }, body: m === 'GET' ? undefined : '{}' });
    assert.equal(errada.status, 401, `${m} ${p} chave errada`);
  }
  // Com a chave certa passa da barreira (e cai no 503 de "sem banco").
  const certa = await req('/api/admin/stats', { headers: { Authorization: 'Bearer chave-certa-de-teste' } });
  assert.equal(certa.status, 503);
});

const SESSAO = [
  ['GET', '/portal/api/me'], ['GET', '/portal/api/me/atas'], ['GET', '/portal/api/me/contratos'], ['GET', '/portal/api/me/pagamentos'],
  ['GET', '/portal/api/atas/1/pdf'], ['GET', '/uploads/arquivo.pdf'], ['GET', '/portal/api/clientes'], ['POST', '/portal/api/clientes'],
  ['DELETE', '/portal/api/eventos/1'], ['GET', '/portal/api/pagamentos'],
  ['GET', '/ead/api/me'], ['GET', '/ead/api/my-courses'], ['GET', '/ead/api/player/x'], ['GET', '/ead/api/lesson/1'],
  ['POST', '/ead/api/lesson/1/complete'], ['GET', '/ead/api/order/1/status'], ['GET', '/ead/api/my-orders'],
  ['POST', '/ead/api/checkout'], ['POST', '/ead/api/cupom'], ['PUT', '/ead/api/lesson/1/nota'], ['GET', '/ead/api/lesson/1/notas'],
  ['GET', '/ead/api/template/1'], ['POST', '/ead/api/quiz/x/submit'],
];

test('área logada: sem sessão nada passa (401/403/302 antes do banco)', async () => {
  for (const [m, p] of SESSAO) {
    const r = await req(p, { method: m, headers: { 'Content-Type': 'application/json' }, body: m === 'GET' ? undefined : '{}' });
    assert.ok([401, 403, 302].includes(r.status), `${m} ${p} respondeu ${r.status}`);
  }
});

test('webhook do Asaas: sem token e com token errado → 401', async () => {
  const corpo = JSON.stringify({ event: 'PAYMENT_RECEIVED', payment: { id: 'pay_x', externalReference: 'ead-order-1', value: 1 } });
  const sem = await req('/ead/api/webhook/asaas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: corpo });
  assert.equal(sem.status, 401);
  const errado = await req('/ead/api/webhook/asaas', { method: 'POST', headers: { 'Content-Type': 'application/json', 'asaas-access-token': 'x'.repeat(38) }, body: corpo });
  assert.equal(errado.status, 401);
});

test('feed de conversões exige senha', async () => {
  assert.equal((await req('/conversoes/google.csv')).status, 401);
  assert.equal((await req('/conversoes/microsoft.csv', { headers: { Authorization: 'Basic ' + Buffer.from('feed:errada').toString('base64') } })).status, 401);
});

test('link de parceiro não vira redirecionamento aberto', async () => {
  for (const para of ['//evil.example', 'https://evil.example', '/\\evil.example']) {
    const r = await req('/p/qualquer-123?para=' + encodeURIComponent(para));
    assert.equal(r.status, 302);
    assert.equal(r.headers.get('location'), '/');
  }
});

test('código-fonte, segredos e documentação interna não são servidos', async () => {
  for (const p of ['/server.js', '/package.json', '/.env', '/HANDOFF.md', '/config/empresa.js', '/growth/routes.js',
    '/migrations/018_crescimento.sql', '/docs', '/openapi.json', '/.git/config', '/data/pbqph-siac.json']) {
    const r = await req(p);
    assert.ok([404, 301].includes(r.status), `${p} respondeu ${r.status}`);
  }
});

test('preço vem do servidor: valor no corpo é ignorado', async () => {
  const r = await req('/api/consultoria/simular', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ servico: 'iso-9001', funcionarios: 10, cidade: '4314100', temProjeto: false, total: 1, base: 1, preco: 1 }) });
  const j = await r.json();
  assert.equal(r.status, 200);
  assert.equal(j.preco.total, 21600);   // 120 h × R$ 180, Passo Fundo, até 20 funcionários
});

test('login: limite de tentativas por IP', async () => {
  let ultimo;
  for (let i = 0; i < 11; i++) {
    ultimo = await req('/portal/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'a@b.com', senha: 'x' }) });
  }
  assert.equal(ultimo.status, 429);
});

// ── Trava estática de IDOR ───────────────────────────────────────────────────
// Cada rota que devolve recurso de um usuário precisa filtrar pelo id da
// sessão NA CONSULTA. Se alguém reescrever o handler e tirar o filtro, quebra.
function trecho(arquivo, rota, n = 2500) {
  const src = readFileSync(join(RAIZ, arquivo), 'utf8');
  const i = src.indexOf(rota);
  assert.ok(i >= 0, `rota ${rota} não encontrada em ${arquivo}`);
  return src.slice(i, i + n);
}

test('IDOR: consultas de recurso do usuário filtram pelo dono', () => {
  assert.match(trecho('ead/routes.js', "'/ead/api/order/:orderId/status'"), /user_id = \$\{userId\}/);
  assert.match(trecho('ead/routes.js', "'/ead/api/my-orders'"), /user_id = \$\{userId\}/);
  assert.match(trecho('ead/routes.js', "'/ead/api/lesson/:lessonId/notas'"), /user_id = \$\{userId\}/);
  assert.match(trecho('ead/routes.js', "'/ead/api/lesson/:lessonId/nota'"), /ead_enrollments[\s\S]*user_id = \$\{userId\}/);
  assert.match(trecho('ead/routes.js', "router.get('/ead/api/lesson/:lessonId'"), /ead_enrollments WHERE user_id = \$\{userId\}/);
  assert.match(trecho('portal/routes.js', "'/portal/api/atas/:id/pdf'"), /client_id = \$\{user\.id\}/);
  assert.match(trecho('portal/routes.js', "'/uploads/:filename'"), /dono\[0\]\.client_id !== user\.id/);
  assert.match(trecho('portal/routes.js', "'/portal/api/me/contratos'", 600), /client_id = \$\{/);
  assert.match(trecho('portal/routes.js', "'/portal/api/me/pagamentos'", 600), /client_id = \$\{/);
  // Pedido de consultoria: só com o token secreto, comparado em tempo constante.
  assert.match(trecho('consultoria/routes.js', 'async function pedidoComToken', 500), /timingSafeEqual/);
});

test('papel: rotas de administração do portal exigem requireAdmin', () => {
  const src = readFileSync(join(RAIZ, 'portal/routes.js'), 'utf8');
  const rotas = [...src.matchAll(/router\.(get|post|put|patch|delete)\('(\/portal\/api\/(?!me\b|me\/|atas\/:id\/pdf)[^']+)',\s*(\w+)/g)];
  assert.ok(rotas.length > 15);
  for (const [, metodo, rota, guarda] of rotas) assert.equal(guarda, 'requireAdmin', `${metodo.toUpperCase()} ${rota} usa ${guarda}`);
});

// ── Motor orgânico no ar (sem banco: sementes em memória) ────────────────────
test('motor orgânico: requisitos, hubs, iscas, dados, sitemap em índice e llms.txt', async () => {
  const r61 = await req('/norma-iso-9001/6-1');
  assert.equal(r61.status, 200);
  const h = await r61.text();
  assert.match(h, /<title>Requisito 6\.1 ISO 9001/);
  assert.match(h, /rel="canonical" href="https:\/\/anderstech\.net\/norma-iso-9001\/6-1"/);
  assert.match(h, /"@type":"FAQPage"/);
  assert.match(h, /data-isca="matriz-transicao-2015-2026"|data-isca="planilha-riscos-oportunidades"/);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
  assert.ok((h.match(/href="\/norma-iso-9001\//g) || []).length >= 3, 'links internos de saída');
  for (const p of ['/norma-iso-9001', '/guias', '/iscas', '/iscas/checklist-auditoria-interna', '/dados/pbqp-h', '/dados/pbqp-h/metodologia', '/autor/daniel-anders', '/sobre', '/politica-editorial']) {
    assert.equal((await req(p)).status, 200, p);
  }
  const idx = await (await req('/sitemap.xml')).text();
  assert.match(idx, /<sitemapindex/);
  assert.match(idx, /\/sitemaps\/motor-norma\.xml/);
  assert.match(await (await req('/sitemaps/motor-norma.xml')).text(), /norma-iso-9001\/9-3/);
  assert.match(await (await req('/llms.txt')).text(), /norma-iso-9001\/6-1/);
  const emb = await req('/embed/pbqp-h/uf');
  assert.match(emb.headers.get('content-security-policy') || '', /frame-ancestors \*/);
  assert.equal(emb.headers.get('x-frame-options'), null);
  // Fora do embed, continua proibido emoldurar.
  assert.match((await req('/dados/pbqp-h')).headers.get('content-security-policy') || '', /frame-ancestors 'self'/);
});

test('imagem de compartilhamento: PNG por página, e só de página que existe', async () => {
  const r = await req('/og/norma-iso-9001/6-1.png');
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'image/png');
  const b = Buffer.from(await r.arrayBuffer());
  assert.equal(b.subarray(1, 4).toString(), 'PNG');
  assert.equal((await req('/og/iso-9001-2026.png')).status, 200);
  assert.equal((await req('/og/titulo-inventado-por-alguem.png')).status, 404);
  assert.match(await (await req('/norma-iso-9001/6-1')).text(), /og:image" content="https:\/\/anderstech\.net\/og\/norma-iso-9001\/6-1\.png"/);
});
