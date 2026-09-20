// ── Sonda: de onde a tabela do SiAC busca o dado ─────────────────────────────
// A página de empresas certificadas do PBQP-H é um app React e o endpoint não
// aparece em lugar nenhum do bundle (testado: strings, rotas do WordPress, seis
// nomes prováveis de JSON). Com o navegador real dá para escutar a rede e
// descobrir a chamada — se for um GET simples, a extração definitiva dispensa
// Playwright e passa a ser um fetch.
//
// Uso: node scripts/sonda-siac.mjs

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const ALVO = 'https://pbqp-h.cidades.gov.br/sistemas/siac/empresas-certificadas/';
const SAIDA = process.env.SONDA_OUT || 'sonda-siac.json';

const navegador = await chromium.launch({ headless: true });
const contexto = await navegador.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
});
const pagina = await contexto.newPage();

const chamadas = [];
pagina.on('response', async (resp) => {
  const req = resp.request();
  if (!['xhr', 'fetch'].includes(req.resourceType())) return;
  const registro = {
    metodo: req.method(),
    url: resp.url(),
    status: resp.status(),
    tipo: resp.headers()['content-type'] || '',
    postData: req.postData() || null,
  };
  try {
    const corpo = await resp.text();
    registro.bytes = corpo.length;
    registro.amostra = corpo.slice(0, 600);
  } catch { registro.bytes = -1; }
  chamadas.push(registro);
});

console.log('abrindo', ALVO);
await pagina.goto(ALVO, { waitUntil: 'networkidle', timeout: 90_000 });

// A tabela é montada em JS; espera as linhas aparecerem em vez de dormir.
try {
  await pagina.waitForSelector('table.tabela-siac tbody tr', { timeout: 30_000 });
} catch {
  console.log('AVISO: nenhuma linha de tabela apareceu no prazo');
}

const linhas = await pagina.$$eval('table.tabela-siac tbody tr', (trs) =>
  trs.slice(0, 3).map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => td.textContent.trim()))
);
const cabecalhos = await pagina.$$eval('table.tabela-siac thead th', (ths) => ths.map((th) => th.textContent.trim()));
const totalLinhas = await pagina.$$eval('table.tabela-siac tbody tr', (trs) => trs.length);

console.log('\n=== chamadas XHR/fetch ===');
for (const c of chamadas) {
  console.log(`  ${c.metodo} ${c.status} ${c.bytes}b  ${c.url.slice(0, 130)}`);
  if (c.postData) console.log(`      body: ${c.postData.slice(0, 200)}`);
}
console.log('\n=== tabela ===');
console.log('  colunas:', cabecalhos);
console.log('  linhas na primeira página:', totalLinhas);
for (const l of linhas) console.log('   ', l.map((v) => v.slice(0, 28)));

writeFileSync(SAIDA, JSON.stringify({ chamadas, cabecalhos, linhas, totalLinhas }, null, 2));
console.log(`\nsalvo em ${SAIDA}`);

await navegador.close();
