// ── Fumaça E2E (Playwright) — fluxos que dão dinheiro ───────────────────────
// Sobe o servidor local (sem banco), abre cada fluxo em desktop e celular e
// FALHA se houver erro no console da página (CSP bloqueando script conta) ou
// se o fluxo não chegar ao fim.
//
// Uso: node scripts/fumaca-e2e.mjs        (precisa de: npx playwright install chromium)
// No CI: job "e2e" em .github/workflows/ci.yml.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium, devices } from 'playwright';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = 3800 + Math.floor(Math.random() * 90);
const BASE = `http://127.0.0.1:${PORTA}`;

const env = { ...process.env, PORT: String(PORTA), NODE_ENV: 'development', TELEMETRY_ENABLED: 'false' };
delete env.DATABASE_URL; delete env.RESEND_API_KEY; delete env.ASAAS_API_KEY;
const srv = spawn(process.execPath, ['server.js'], { cwd: RAIZ, env, stdio: 'ignore' });

async function esperarServidor() {
  for (let i = 0; i < 600; i++) {
    try { if ((await fetch(BASE + '/robots.txt')).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('servidor não subiu');
}

const FLUXOS = [
  ['home + banner de cookies granular', async (p) => {
    await p.goto(BASE + '/');
    await p.locator('#ckBanner').waitFor({ state: 'visible' });
    await p.click('#ckPick');
    await p.locator('#ckOpts').waitFor({ state: 'visible' });
    if (await p.isChecked('#ckA') || await p.isChecked('#ckM')) throw new Error('opção de cookie pré-marcada');
    await p.check('#ckA');
    await p.click('#ckSave');
    const v = await p.evaluate(() => [localStorage.getItem('at_cookie_consent'), localStorage.getItem('at_consent_mkt')]);
    if (v[0] !== '1' || v[1] !== '0') throw new Error('consentimento gravado errado: ' + v);
  }],
  ['atribuição: gclid só com consentimento de marketing', async (p) => {
    await p.goto(BASE + '/iso-9001?utm_source=google&utm_medium=cpc&gclid=TesteGclid123');
    await p.locator('#ckBanner').waitFor({ state: 'visible' });
    await p.click('#ckYes');
    await p.waitForTimeout(150);
    const c = await p.evaluate(() => decodeURIComponent((document.cookie.match(/at_attr=([^;]*)/) || [])[1] || ''));
    if (!c.includes('TesteGclid123')) throw new Error('gclid não foi gravado com consentimento: ' + c);
  }],
  ['pilar ISO 9001:2026', async (p) => {
    await p.goto(BASE + '/iso-9001-2026');
    await p.getByRole('heading', { level: 1 }).filter({ hasText: 'ISO 9001:2026' }).waitFor();
    if (!(await p.content()).includes('30/09/2029')) throw new Error('prazo final ausente');
  }],
  ['isca: diagnóstico de transição até o resultado compartilhável', async (p) => {
    await p.goto(BASE + '/transicao-iso-9001-2026');
    const respostas = 'SPNNPNSNNP';   // 2+1+0+0+1+0+2+0+0+1 = 7 de 20 = 35%
    for (let i = 0; i < 10; i++) await p.check(`input[name="q${i}"][value="${respostas[i]}"]`);
    await p.selectOption('#aud', '2');
    await p.click('button.dg-btn');
    await p.locator('.dg-nota').waitFor();
    const nota = await p.textContent('.dg-nota');
    if (nota.trim() !== '35%') throw new Error('nota inesperada: ' + nota);
    if (!p.url().includes('?r=SPNNPNSNNP2')) throw new Error('URL de resultado não gravada: ' + p.url());
    await p.goto(BASE + '/transicao-iso-9001-2026?r=SPNNPNSNNP2');
    await p.locator('.dg-nota').waitFor();
  }],
  ['contratar: preço calculado na hora', async (p) => {
    await p.goto(BASE + '/contratar?servico=iso-9001');
    await p.waitForFunction(() => /21\.600/.test(document.body.innerText), null, { timeout: 8000 }).catch(() => {});
    const txt = await p.evaluate(() => document.body.innerText);
    if (!/R\$\s?[\d.]+,\d{2}|R\$\s?[\d.]+/.test(txt)) throw new Error('nenhum preço na tela');
  }],
  ['requisito da ISO 9001 com isca no meio e no fim', async (p) => {
    await p.goto(BASE + '/norma-iso-9001/9-3');
    await p.getByRole('heading', { level: 1 }).waitFor();
    const n = await p.locator('aside.at-isca').count();
    if (n < 2) throw new Error('isca no meio e no fim: encontrei ' + n);
  }],
  ['isca em PDF: prévia sem cadastro e pedido por e-mail', async (p) => {
    await p.goto(BASE + '/iscas/checklist-auditoria-interna');
    await p.locator('#fi').waitFor();
    if (await p.isChecked('#fOptin')) throw new Error('opt-in de marketing pré-marcado');
    await p.fill('#fEmail', 'fumaca@exemplo.com.br');
    await p.click('#fi button[type=submit]');
    await p.waitForFunction(() => /PDF foi|Não foi|Informe/.test(document.getElementById('fMsg').textContent), null, { timeout: 8000 });
  }],
  ['seja parceiro: aceite das regras é obrigatório', async (p) => {
    await p.goto(BASE + '/seja-parceiro');
    await p.fill('#nome', 'Teste Fumaça');
    await p.fill('#email', 'fumaca@exemplo.com.br');
    await p.click('.sp-btn');
    await p.waitForFunction(() => /regras/.test(document.getElementById('msg').textContent), null, { timeout: 5000 });
  }],
];

const PERFIS = [['desktop', { viewport: { width: 1280, height: 860 } }], ['celular', devices['iPhone 13']]];

let falhas = 0;
try {
  await esperarServidor();
  const browser = await chromium.launch();
  for (const [perfil, opcoes] of PERFIS) {
    for (const [nome, fluxo] of FLUXOS) {
      const ctx = await browser.newContext(opcoes);
      const p = await ctx.newPage();
      const erros = [];
      p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
      p.on('pageerror', e => erros.push(String(e)));
      try {
        await fluxo(p);
        // Sem banco, rotas de API respondem 503 de propósito, e validação responde
        // 400 — o navegador loga as duas como 'Failed to load resource'. Não é erro de página.
        const reais = erros.filter(e => !/Failed to load resource: the server responded with a status of (400|503)/.test(e));
        if (reais.length) throw new Error('erro no console: ' + reais.join(' | '));
        console.log(`✔ [${perfil}] ${nome}`);
      } catch (e) {
        falhas++;
        console.log(`✖ [${perfil}] ${nome}: ${e.message}`);
      }
      await ctx.close();
    }
  }
  await browser.close();
} finally {
  srv.kill();
}
console.log(falhas ? `${falhas} falha(s)` : 'fumaça ok');
process.exit(falhas ? 1 : 0);
