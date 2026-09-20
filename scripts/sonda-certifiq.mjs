// ── Sonda: o que a consulta do Certifiq devolve ──────────────────────────────
// O Certifiq (Inmetro) é o registro público dos certificados ISO 9001 e ISO
// 14001 emitidos no Brasil. Não tem API nem download: o formulário é ASP.NET
// com antiforgery + estado de sessão, e POST direto por HTTP devolve 302 para
// página de erro (testado com cookie e token pareados).
//
// Esta sonda responde duas perguntas antes de qualquer extração em massa:
//   1. o resultado traz MUNICÍPIO? sem isso o eixo por cidade não existe;
//   2. quantas linhas vêm por organismo, e há paginação?
//
// Também escuta a rede: se houver um JSON por trás, a extração definitiva
// dispensa o navegador — foi o que aconteceu no SiAC.
//
// Uso: node scripts/sonda-certifiq.mjs [idOrganismo]

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'https://certifiq.inmetro.gov.br';
const ORGANISMO = process.argv[2] || '45'; // 45 = ABNT, o maior
const SAIDA = process.env.SONDA_OUT || 'sonda-certifiq.json';

const navegador = await chromium.launch({ headless: true });
const pagina = await navegador.newPage({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
});

const chamadas = [];
pagina.on('response', async (resp) => {
  const req = resp.request();
  if (!['xhr', 'fetch'].includes(req.resourceType())) return;
  chamadas.push({ metodo: req.method(), url: resp.url(), status: resp.status(), body: (req.postData() || '').slice(0, 200) });
});

console.log('abrindo consulta…');
await pagina.goto(`${BASE}/Consulta/ConsultaEmpresas`, { waitUntil: 'domcontentloaded', timeout: 90_000 });

// 1 = Organismo de Certificação de Sistemas de Gestão da Qualidade (ISO 9001)
await pagina.selectOption('#IdTipoAcreditacao', '1');

// O padrão normativo é cascata, mas NÃO é filtro obrigatório: a validação do
// formulário (Scripts/app/ConsultaEmpresas.js) exige apenas um entre número do
// certificado, empresa, organismo ou código NACE. Se a cascata não popular,
// seguimos sem ela em vez de travar a sonda.
let normas = [];
try {
  await pagina.waitForFunction(() => document.querySelectorAll('#IdPadraoNormativo option').length > 1, { timeout: 8_000 });
  normas = await pagina.$$eval('#IdPadraoNormativo option', (os) => os.map((o) => ({ v: o.value, t: o.textContent.trim() })));
  console.log('padrões normativos:', normas.map((n) => `${n.v}=${n.t}`).join(' | '));
} catch {
  console.log('padrão normativo não populou — seguindo sem esse filtro');
}

await pagina.selectOption('#IdOrganismo', ORGANISMO);
const nomeOrg = await pagina.$eval('#IdOrganismo', (s) => s.options[s.selectedIndex].textContent.trim());
console.log('organismo:', nomeOrg);

// #Buscar, não o primeiro submit da página: o primeiro é #Exportar, que nasce
// com display:none. O nome do botão (BuscarEmpresasCertificadas) vai no corpo
// do POST e é o que faz o ASP.NET escolher a ação — era isso que faltava no
// POST cru por HTTP, que devolvia 302 para a página de erro.
// Consulta de organismo grande (ABNT) leva minutos: o clique não espera a
// navegação, quem espera é o seletor do resultado, com prazo próprio.
console.log('enviando…');
const t0 = Date.now();
await pagina.click('#Buscar', { noWaitAfter: true });
try {
  await pagina.waitForSelector('#tableResultado tbody tr, .alert-danger, .alert', { timeout: 300_000 });
} catch {
  console.log('AVISO: nem resultado nem aviso apareceram em 5 min');
}
console.log(`  resposta em ${Math.round((Date.now() - t0) / 1000)}s`);

const diagnostico = await pagina.evaluate(() => {
  const tabela = document.querySelector('#tableResultado') || document.querySelector('table');
  if (!tabela) return { achou: false, texto: document.body.innerText.slice(0, 400) };
  const th = Array.from(tabela.querySelectorAll('thead th')).map((e) => e.textContent.trim());
  const trs = Array.from(tabela.querySelectorAll('tbody tr'));
  const amostra = trs.slice(0, 3).map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => td.textContent.trim()));
  const paginacao = document.querySelector('.dataTables_info');
  return { achou: true, colunas: th, linhas: trs.length, amostra, info: paginacao ? paginacao.textContent.trim() : null };
});

console.log('\n=== resultado ===');
if (!diagnostico.achou) {
  console.log('  NENHUMA TABELA. Texto da página:', diagnostico.texto);
} else {
  console.log('  colunas:', diagnostico.colunas);
  console.log('  linhas nesta página:', diagnostico.linhas);
  console.log('  paginação:', diagnostico.info || '—');
  for (const l of diagnostico.amostra) console.log('   ', l.map((v) => v.slice(0, 30)));
  const temMunicipio = diagnostico.colunas.some((c) => /munic|cidade/i.test(c));
  console.log(`\n  MUNICÍPIO no resultado: ${temMunicipio ? 'SIM' : 'NÃO — eixo por cidade não existe nesta base'}`);
}

console.log('\n=== chamadas XHR/fetch ===');
for (const c of chamadas) console.log(`  ${c.metodo} ${c.status} ${c.url.slice(0, 120)}`);

writeFileSync(SAIDA, JSON.stringify({ organismo: nomeOrg, normas, diagnostico, chamadas }, null, 2));
console.log(`\nsalvo em ${SAIDA}`);

await navegador.close();
