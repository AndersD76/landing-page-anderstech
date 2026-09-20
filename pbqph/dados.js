// ── Acesso aos dados do PBQP-H ───────────────────────────────────────────────
// Produção lê do banco (tabela pbqph_empresas, carregada por
// scripts/carrega-siac.mjs). O snapshot versionado em data/pbqph-siac.json é o
// fallback — e não é luxo: sem ele, banco fora do ar viraria 500 em centenas de
// páginas indexadas, que é a pior coisa que pode acontecer com SEO.

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { agrupaPorMunicipio, GATE_MUNICIPIO } from './normaliza.js';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const SNAPSHOT = join(RAIZ, 'data', 'pbqph-siac.json');

let estado = null;

function monta(registros, carregadoEm, origem) {
  const municipios = agrupaPorMunicipio(registros);
  const porSlug = new Map();
  const porUf = new Map();

  for (const m of municipios) {
    porSlug.set(`${m.uf.toLowerCase()}/${m.slug}`, m);
    if (!porUf.has(m.uf)) porUf.set(m.uf, []);
    porUf.get(m.uf).push(m);
  }

  return {
    origem,
    carregadoEm,
    registros,
    municipios,
    porSlug,
    porUf,
    publicaveis: municipios.filter((m) => m.publicavel),
    totalVigentes: registros.length,
  };
}

function doSnapshot() {
  try {
    const snap = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
    return monta(snap.registros || [], snap.carregado_em, 'snapshot');
  } catch (err) {
    console.error('[pbqph] snapshot indisponível:', err.message);
    return monta([], null, 'vazio');
  }
}

/** Carrega do banco no boot; cai no snapshot se não houver banco ou linhas. */
export async function inicializar(sql) {
  if (sql) {
    try {
      const linhas = await sql`
        SELECT empresa, cnpj, uf, municipio, municipio_slug, nivel, subsetor, organismo,
               to_char(validade, 'YYYY-MM-DD') AS validade,
               to_char(emissao, 'YYYY-MM-DD') AS emissao
        FROM pbqph_empresas
      `;
      if (linhas.length) {
        const carga = await sql`SELECT to_char(MAX(carregado_em), 'YYYY-MM-DD"T"HH24:MI:SSZ') AS em FROM pbqph_cargas`;
        // O município de exibição não vive no banco: é derivado na carga.
        // Reaproveita o snapshot só para o acento, casando pelo slug.
        const acentos = new Map(doSnapshot().registros.map((r) => [`${r.uf}/${r.municipio_slug}`, r.municipio_titulo]));
        for (const l of linhas) {
          l.municipio_titulo = acentos.get(`${l.uf}/${l.municipio_slug}`) || l.municipio;
        }
        estado = monta(linhas, carga[0]?.em || null, 'banco');
        console.log(`[pbqph] ${linhas.length} registros do banco · ${estado.publicaveis.length} municípios publicáveis`);
        return estado;
      }
    } catch (err) {
      console.warn('[pbqph] banco indisponível, usando snapshot:', err.message);
    }
  }
  estado = doSnapshot();
  console.log(`[pbqph] ${estado.totalVigentes} registros do snapshot · ${estado.publicaveis.length} municípios publicáveis`);
  return estado;
}

export function dados() {
  if (!estado) estado = doSnapshot();
  return estado;
}

export function municipio(uf, slugMunicipio) {
  return dados().porSlug.get(`${String(uf).toLowerCase()}/${String(slugMunicipio).toLowerCase()}`) || null;
}

export function municipiosDaUf(uf) {
  return dados().porUf.get(String(uf).toUpperCase()) || [];
}

export function ufs() {
  return [...dados().porUf.entries()]
    .map(([uf, lista]) => ({
      uf,
      total: lista.reduce((s, m) => s + m.total, 0),
      municipios: lista.length,
      publicaveis: lista.filter((m) => m.publicavel).length,
    }))
    .sort((a, b) => b.total - a.total);
}

/** Só o que entra no sitemap: página abaixo do gate não é oferecida ao Google. */
export function urlsIndexaveis() {
  const d = dados();
  const lastmod = (d.carregadoEm || new Date().toISOString()).slice(0, 10);
  const urls = [['/pbqp-h/construtoras', lastmod, 'weekly', '0.8']];
  for (const [uf] of d.porUf) urls.push([`/pbqp-h/construtoras/${uf.toLowerCase()}`, lastmod, 'weekly', '0.7']);
  for (const m of d.publicaveis) {
    urls.push([`/pbqp-h/construtoras/${m.uf.toLowerCase()}/${m.slug}`, lastmod, 'monthly', '0.7']);
  }
  return urls;
}

export { GATE_MUNICIPIO };
