// ── Sonda: quantas páginas o SiAC sustenta acima do quality gate ─────────────
// A base inteira vem de um GET só (descoberto interceptando a rede do app
// React em scripts/sonda-siac.mjs) — sem sessão, sem token, sem navegador.
//
// Esta sonda NÃO gera página nenhuma: ela conta. Se o volume acima do gate não
// pagar o esforço, é melhor saber antes de escrever o gerador.
//
// Uso: node scripts/sonda-siac-conta.mjs [UF,UF,...]

import { writeFileSync } from 'fs';

const FONTE = 'https://pbqp-h.cidades.gov.br/sistemas/siac/empresas-certificadas/?tabela=show';
const UFS = (process.argv[2] || 'RS,SC,PR').split(',').map((s) => s.trim().toUpperCase());
const GATE = Number(process.env.GATE || 3);

// A base mistura codificação: parte dos registros vem com UTF-8 correto e parte
// com bytes latin-1 crus no mesmo arquivo. Sem isto, "OSÓRIO" vira "OS?RIO" e
// o mesmo município conta como dois.
function corrigeTexto(v) {
  if (typeof v !== 'string') return v;
  if (!/[À-ÿ�]/.test(v)) return v;
  try {
    const consertado = Buffer.from(v, 'latin1').toString('utf8');
    return consertado.includes('�') ? v : consertado;
  } catch { return v; }
}

function normalizaMunicipio(v) {
  return corrigeTexto(v || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    // A base traz o mesmo município com e sem a UF colada: "CURITIBA" e
    // "CURITIBA/PR" eram contados como duas cidades, e Curitiba aparecia duas
    // vezes no mesmo ranking.
    .replace(/[\s,/-]+[A-Za-z]{2}\.?$/, '')
    .replace(/\s+/g, ' ').trim().toUpperCase();
}

function parseData(br) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((br || '').trim());
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
}

const resp = await fetch(FONTE, { headers: { 'User-Agent': 'Mozilla/5.0' } });
if (!resp.ok) throw new Error(`fonte respondeu ${resp.status}`);
const bruto = await resp.json();

const hoje = new Date();
const em12meses = new Date(hoje.getFullYear() + 1, hoje.getMonth(), hoje.getDate());

const registros = bruto.map((r) => {
  const validade = parseData(r.validade);
  return {
    empresa: corrigeTexto(r.empresa),
    cnpj: r.cnpj || null,
    uf: (r.uf || '').trim().toUpperCase(),
    municipio: normalizaMunicipio(r.municipio),
    nivel: (r.nivel || '').trim().toUpperCase(),
    oc: (r.oc || '').trim(),
    sub: corrigeTexto(r.sub || ''),
    validade,
    vigente: !!validade && validade >= hoje && !String(r.suspensao || '').trim(),
    venceEm12m: !!validade && validade >= hoje && validade <= em12meses,
  };
});

const ufsValidas = new Set(registros.map((r) => r.uf).filter((uf) => /^[A-Z]{2}$/.test(uf)));

console.log('═══ BASE SiAC / PBQP-H ═══');
console.log(`  registros ............. ${registros.length}`);
console.log(`  vigentes .............. ${registros.filter((r) => r.vigente).length}`);
console.log(`  expirados ............. ${registros.filter((r) => !r.vigente).length}`);
console.log(`  UFs com sigla válida .. ${ufsValidas.size}`);
console.log(`  municípios distintos .. ${new Set(registros.map((r) => `${r.uf}/${r.municipio}`)).size}`);
console.log(`  organismos (OAC) ...... ${new Set(registros.map((r) => r.oc).filter(Boolean)).size}`);
console.log(`  subsetores ............ ${new Set(registros.map((r) => r.sub).filter(Boolean)).size}`);

function conta(lista, chave) {
  const m = new Map();
  for (const r of lista) {
    const k = chave(r);
    if (!k) continue;
    m.set(k, (m.get(k) || 0) + 1);
  }
  return m;
}

const vigentes = registros.filter((r) => r.vigente);
const relatorio = { gerado_em: hoje.toISOString(), gate: GATE, total: registros.length, vigentes: vigentes.length, eixos: {} };

// ── E4: município × PBQP-H ───────────────────────────────────────────────────
console.log(`\n═══ EIXO município × PBQP-H (gate ≥ ${GATE} vigentes) ═══`);
let totalMunicipios = 0;
for (const uf of UFS) {
  const naUf = vigentes.filter((r) => r.uf === uf);
  const porMun = conta(naUf, (r) => r.municipio);
  const passam = [...porMun.entries()].filter(([, n]) => n >= GATE).sort((a, b) => b[1] - a[1]);
  totalMunicipios += passam.length;
  console.log(`  ${uf}: ${naUf.length} vigentes · ${porMun.size} municípios · ${passam.length} passam no gate`);
  console.log(`      top: ${passam.slice(0, 6).map(([m, n]) => `${m} (${n})`).join(', ') || '—'}`);
  relatorio.eixos[`municipio_${uf}`] = { vigentes: naUf.length, municipios: porMun.size, passam: passam.length, lista: passam };
}

// ── Nacional, para dimensionar o teto real ───────────────────────────────────
const porMunBR = conta(vigentes, (r) => `${r.uf}/${r.municipio}`);
const passamBR = [...porMunBR.entries()].filter(([, n]) => n >= GATE);
console.log(`  BRASIL: ${passamBR.length} municípios passam no gate (de ${porMunBR.size})`);

// ── E3: organismo certificador ───────────────────────────────────────────────
const porOc = [...conta(vigentes, (r) => r.oc).entries()].sort((a, b) => b[1] - a[1]);
console.log(`\n═══ EIXO organismo certificador (gate ≥ 20) ═══`);
console.log(`  ${porOc.filter(([, n]) => n >= 20).length} organismos passam, de ${porOc.length}`);
console.log(`  top: ${porOc.slice(0, 6).map(([o, n]) => `${o} (${n})`).join(', ')}`);
relatorio.eixos.organismo = porOc;

// ── E2: UF × subsetor ────────────────────────────────────────────────────────
let combos = 0;
for (const uf of ufsValidas) {
  const porSub = conta(vigentes.filter((r) => r.uf === uf), (r) => r.sub);
  combos += [...porSub.values()].filter((n) => n >= 10).length;
}
console.log(`\n═══ EIXO UF × subsetor (gate ≥ 10) ═══`);
console.log(`  ${combos} combinações passam`);

// ── O dado que ninguém compilou ──────────────────────────────────────────────
const vencendo = vigentes.filter((r) => r.venceEm12m);
console.log(`\n═══ CERTIFICADOS VENCENDO EM 12 MESES ═══`);
console.log(`  Brasil: ${vencendo.length}`);
for (const uf of UFS) console.log(`  ${uf}: ${vencendo.filter((r) => r.uf === uf).length}`);
relatorio.vencendo_12m = vencendo.length;

// ── Veredito ─────────────────────────────────────────────────────────────────
const totalPaginas = totalMunicipios + porOc.filter(([, n]) => n >= 20).length + combos;
console.log(`\n═══ VEREDITO (${UFS.join('+')}) ═══`);
console.log(`  páginas acima do gate: ${totalPaginas}`);
console.log(`  critério de morte combinado: 150`);
console.log(`  ${totalPaginas >= 150 ? 'PASSA' : 'NÃO PASSA — não vale escrever o gerador só com esta base'}`);
relatorio.total_paginas = totalPaginas;

const saida = process.env.SONDA_OUT || 'sonda-siac-conta.json';
writeFileSync(saida, JSON.stringify(relatorio, null, 2));
console.log(`\nrelatório em ${saida}`);
