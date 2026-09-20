// ── Quantas páginas o Certifiq sustenta acima do gate ────────────────────────
// Lê a extração de scripts/extrai-certifiq.mjs e conta os eixos possíveis.
// O eixo por município NÃO entra: a consulta do Certifiq devolve apenas
// empresa, unidade de negócio, UF e padrão normativo.
//
// Uso: node scripts/conta-certifiq.mjs <arquivo.json>

import { readFileSync } from 'fs';

const arquivo = process.argv[2] || 'certifiq.json';
const { linhas = [] } = JSON.parse(readFileSync(arquivo, 'utf8'));

const GATE_ORGANISMO = Number(process.env.GATE_ORGANISMO || 20);
const GATE_UF_NORMA = Number(process.env.GATE_UF_NORMA || 10);

function conta(lista, chave) {
  const m = new Map();
  for (const r of lista) {
    const k = chave(r);
    if (!k) continue;
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

const mascaradas = linhas.filter((l) => /^\*+$/.test(l.empresa));
const publicas = linhas.filter((l) => !/^\*+$/.test(l.empresa));

console.log('═══ BASE CERTIFIQ ═══');
console.log(`  linhas ................ ${linhas.length}`);
console.log(`  nominais .............. ${publicas.length}`);
console.log(`  mascaradas (********) . ${mascaradas.length}  ← empresa optou por não divulgar`);
console.log(`  empresas distintas .... ${new Set(publicas.map((l) => l.empresa)).size}`);
console.log(`  UFs ................... ${new Set(linhas.map((l) => l.uf)).size}`);
console.log(`  normas ................ ${new Set(linhas.map((l) => l.norma)).size}`);

// Página por organismo: quantos certificados ativos, em quais UFs. É o dado
// que ninguém compilou — o Certifiq só responde uma consulta por vez.
const porOrganismo = conta(linhas, (l) => l.organismo);
const orgPassam = porOrganismo.filter(([, n]) => n >= GATE_ORGANISMO);
console.log(`\n═══ EIXO organismo certificador (gate ≥ ${GATE_ORGANISMO}) ═══`);
console.log(`  ${orgPassam.length} passam, de ${porOrganismo.length}`);
console.log(`  top: ${porOrganismo.slice(0, 6).map(([o, n]) => `${o.slice(0, 22)} (${n})`).join(', ')}`);

const porUf = conta(linhas, (l) => l.uf);
console.log(`\n═══ DISTRIBUIÇÃO POR UF ═══`);
console.log(`  ${porUf.slice(0, 10).map(([u, n]) => `${u}:${n}`).join('  ')}`);
for (const uf of ['RS', 'SC', 'PR']) {
  const n = porUf.find(([u]) => u === uf);
  console.log(`  ${uf}: ${n ? n[1] : 0}`);
}

let ufNorma = 0;
for (const [uf] of porUf) {
  const c = conta(linhas.filter((l) => l.uf === uf), (l) => l.norma);
  ufNorma += c.filter(([, n]) => n >= GATE_UF_NORMA).length;
}
console.log(`\n═══ EIXO UF × norma (gate ≥ ${GATE_UF_NORMA}) ═══`);
console.log(`  ${ufNorma} combinações passam`);

console.log(`\n═══ TOTAL DE PÁGINAS POSSÍVEIS (Certifiq) ═══`);
console.log(`  ${orgPassam.length + ufNorma}`);
console.log('  eixo por município: IMPOSSÍVEL — a fonte não devolve cidade');
