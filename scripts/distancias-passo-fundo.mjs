// Gera data/distancias-passo-fundo.json: distância POR ESTRADA de Passo Fundo
// até cada município a até 300 km, usada no preço da consultoria (acréscimo por
// distância; acima de 300 km a Anders Tech não atende).
//
// Roda à mão, raramente (estrada não muda). Não roda no servidor.
//   node scripts/distancias-passo-fundo.mjs <municipios.csv>
//
// Fontes:
// - coordenadas: github.com/kelvins/municipios-brasileiros (csv/municipios.csv,
//   códigos IBGE + latitude/longitude da sede do município);
// - rota: OSRM (router.project-osrm.org), serviço público de rotas sobre o
//   OpenStreetMap. Só coordenadas públicas de cidades saem daqui.
//
// Filtro em duas etapas: linha reta ≤ 300 km (a estrada nunca é mais curta que a
// reta, então quem passa daí está fora de qualquer jeito) e, depois, estrada ≤ 300 km.

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(RAIZ, 'data', 'distancias-passo-fundo.json');
const IBGE_PASSO_FUNDO = '4314100';
const LIMITE_KM = 300;
const LOTE = 80; // o servidor público do OSRM limita a tabela a ~100 coordenadas
const UF = { 41: 'PR', 42: 'SC', 43: 'RS' };

const csv = process.argv[2];
if (!csv) {
  console.error('uso: node scripts/distancias-passo-fundo.mjs <municipios.csv>');
  process.exit(1);
}

const linhas = readFileSync(csv, 'utf8').trim().split(/\r?\n/);
const cab = linhas.shift().split(',');
const col = (n) => cab.indexOf(n);
const municipios = linhas.map((l) => {
  const c = l.split(',');
  return {
    ibge: c[col('codigo_ibge')],
    nome: c[col('nome')],
    lat: Number(c[col('latitude')]),
    lon: Number(c[col('longitude')]),
    uf: UF[c[col('codigo_uf')]] || null,
  };
});

const origem = municipios.find((m) => m.ibge === IBGE_PASSO_FUNDO);
if (!origem) throw new Error('Passo Fundo não está no CSV');

function retaKm(a, b) {
  const r = (g) => (g * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLon = r(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const candidatos = municipios.filter((m) => m.uf && retaKm(origem, m) <= LIMITE_KM);
console.log(`${candidatos.length} municípios a até ${LIMITE_KM} km em linha reta`);

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const resultado = [];
for (let i = 0; i < candidatos.length; i += LOTE) {
  const lote = candidatos.slice(i, i + LOTE);
  const coords = [origem, ...lote].map((m) => `${m.lon},${m.lat}`).join(';');
  const url = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=distance`;
  const r = await fetch(url, { headers: { 'User-Agent': 'distancias-passo-fundo/1.0' } });
  const d = await r.json();
  if (d.code !== 'Ok') throw new Error(`OSRM: ${d.code} ${d.message || ''}`);
  d.distances[0].slice(1).forEach((metros, j) => {
    const m = lote[j];
    if (metros == null) return console.warn(`sem rota: ${m.nome}/${m.uf}`);
    resultado.push({ ibge: m.ibge, nome: m.nome, uf: m.uf, km: Math.round(metros / 1000) });
  });
  console.log(`lote ${i / LOTE + 1}: ${lote.length} cidades`);
  await espera(1500); // servidor público: uma requisição por vez, sem pressa
}

const dentro = resultado.filter((m) => m.km <= LIMITE_KM)
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR') || a.uf.localeCompare(b.uf));

writeFileSync(SAIDA, JSON.stringify({
  origem: 'Passo Fundo/RS',
  limiteKm: LIMITE_KM,
  geradoEm: new Date().toISOString().slice(0, 10),
  fontes: ['github.com/kelvins/municipios-brasileiros', 'router.project-osrm.org (OpenStreetMap)'],
  municipios: dentro,
}, null, 0) + '\n');

console.log(`${dentro.length} municípios a até ${LIMITE_KM} km pela estrada → ${SAIDA}`);
