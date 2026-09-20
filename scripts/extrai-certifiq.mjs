// ── Extração do Certifiq (Inmetro) por organismo certificador ────────────────
// A consulta exige pelo menos um filtro entre número do certificado, empresa,
// organismo ou código NACE — UF sozinha não consulta. Enumerar pelos ~60
// organismos cobre a base inteira com ~60 requisições, que é o caminho menos
// agressivo disponível.
//
// Limite conhecido da fonte: o resultado traz apenas empresa, unidade de
// negócio, UF e padrão normativo. NÃO traz município. Qualquer eixo por cidade
// para ISO 9001 é impossível com este dado.
//
// Uso: node scripts/extrai-certifiq.mjs [idTipoAcreditacao]
//      1 = Qualidade (ISO 9001) · 3 = Ambiental (ISO 14001)

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'https://certifiq.inmetro.gov.br';
const ACREDITACAO = process.argv[2] || '1';
const SAIDA = process.env.SONDA_OUT || 'certifiq.json';
const PAUSA = Number(process.env.PAUSA || 1200); // cortesia com um servidor público

const navegador = await chromium.launch({ headless: true });
const pagina = await navegador.newPage({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
});

async function abrirFormulario() {
  await pagina.goto(`${BASE}/Consulta/ConsultaEmpresas`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await pagina.selectOption('#IdTipoAcreditacao', ACREDITACAO);
}

await abrirFormulario();

const organismos = (await pagina.$$eval('#IdOrganismo option', (os) =>
  os.map((o) => ({ id: o.value, nome: o.textContent.trim() })).filter((o) => o.id)
));
console.log(`organismos a varrer: ${organismos.length}`);

const linhas = [];
const falhas = [];

for (const [i, org] of organismos.entries()) {
  const rotulo = `[${i + 1}/${organismos.length}] ${org.nome.slice(0, 40)}`;
  try {
    await abrirFormulario();
    await pagina.selectOption('#IdOrganismo', org.id);
    // #Buscar e não o primeiro submit: o primeiro é #Exportar, escondido. O
    // nome do botão vai no corpo do POST e é o que o ASP.NET usa para rotear.
    await pagina.click('#Buscar', { noWaitAfter: true });
    await pagina.waitForSelector('#tableResultado tbody tr, .alert', { timeout: 180_000 });

    const achadas = await pagina.$$eval('#tableResultado tbody tr', (trs) =>
      trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => td.textContent.trim()))
    );
    for (const c of achadas) {
      if (c.length < 4) continue;
      linhas.push({ empresa: c[0], unidade: c[1], uf: c[2], norma: c[3], organismo: org.nome, organismo_id: org.id });
    }
    console.log(`${rotulo} → ${achadas.length}`);
  } catch (err) {
    falhas.push({ organismo: org.nome, erro: String(err).slice(0, 120) });
    console.log(`${rotulo} → FALHOU`);
  }
  await pagina.waitForTimeout(PAUSA);
  if (i % 10 === 9) writeFileSync(SAIDA, JSON.stringify({ parcial: true, linhas, falhas }, null, 2));
}

writeFileSync(SAIDA, JSON.stringify({ gerado_em: new Date().toISOString(), acreditacao: ACREDITACAO, total: linhas.length, falhas, linhas }, null, 2));

console.log(`\n═══ EXTRAÇÃO CONCLUÍDA ═══`);
console.log(`  linhas ........ ${linhas.length}`);
console.log(`  organismos .... ${organismos.length} (${falhas.length} falharam)`);
console.log(`  empresas ...... ${new Set(linhas.map((l) => l.empresa)).size}`);
console.log(`  UFs ........... ${new Set(linhas.map((l) => l.uf)).size}`);
console.log(`  mascaradas .... ${linhas.filter((l) => /^\*+$/.test(l.empresa)).length} (empresa optou por não divulgar)`);
console.log(`  salvo em ${SAIDA}`);

await navegador.close();
