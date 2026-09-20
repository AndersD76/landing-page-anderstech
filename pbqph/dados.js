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

// Gate do eixo de certificadora. Mais alto que o de município porque a página
// promete panorama nacional do organismo — com 5 certificados não há panorama.
export const GATE_ORGANISMO = 20;

let cacheOrganismos = null;

/**
 * Agrupa por organismo certificador. É o dado que ninguém compilou: o registro
 * oficial responde uma empresa por vez e não diz quantas cada OAC certifica,
 * nem onde.
 *
 * O eixo de SUBSETOR foi descartado de propósito: a fonte escreve o mesmo
 * subsetor de quatro formas ("Obras de Edificações", "Obras de Edifcações",
 * "Obras de Edficações", "Obras de Edificação") e consolidar isso seria
 * adivinhar qual foi a intenção — proibido pela regra 3 do CLAUDE.md.
 */
export function organismos() {
  if (cacheOrganismos) return cacheOrganismos;
  const d = dados();
  const mapa = new Map();

  // Agrupa por SLUG, não pelo nome: a fonte escreve o mesmo organismo de duas
  // formas ("CSC LA" com 59 certificados e "CSC-LA" com 2). Agrupar por nome
  // criava duas entidades disputando a mesma URL — uma acima do gate e outra
  // abaixo, e a de baixo vazava para o sitemap. Unificar hífen e espaço é
  // normalização, não adivinhação: nenhuma letra muda.
  const variantes = new Map();
  for (const r of d.registros) {
    if (!r.organismo) continue;
    const chave = slugOrganismo(r.organismo);
    if (!chave) continue;
    if (!mapa.has(chave)) mapa.set(chave, { nome: r.organismo, slug: chave, empresas: [] });
    mapa.get(chave).empresas.push(r);

    // A grafia exibida é a mais frequente, não a primeira que apareceu.
    if (!variantes.has(chave)) variantes.set(chave, new Map());
    const v = variantes.get(chave);
    v.set(r.organismo, (v.get(r.organismo) || 0) + 1);
  }
  for (const [chave, v] of variantes) {
    mapa.get(chave).nome = [...v.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  const em12meses = new Date();
  em12meses.setUTCFullYear(em12meses.getUTCFullYear() + 1);

  cacheOrganismos = [...mapa.values()]
    .map((o) => {
      o.empresas.sort((a, b) => a.validade.localeCompare(b.validade));
      const niveis = { A: 0, B: 0 };
      for (const e of o.empresas) if (niveis[e.nivel] !== undefined) niveis[e.nivel]++;
      const ufsAtendidas = new Map();
      for (const e of o.empresas) ufsAtendidas.set(e.uf, (ufsAtendidas.get(e.uf) || 0) + 1);
      return {
        ...o,
        total: o.empresas.length,
        nivelA: niveis.A,
        nivelB: niveis.B,
        ufs: [...ufsAtendidas.entries()].sort((a, b) => b[1] - a[1]),
        municipios: new Set(o.empresas.map((e) => `${e.uf}/${e.municipio_slug}`)).size,
        vencendo12m: o.empresas.filter((e) => new Date(e.validade) <= em12meses).length,
        publicavel: o.empresas.length >= GATE_ORGANISMO,
      };
    })
    .sort((a, b) => b.total - a.total);

  return cacheOrganismos;
}

function slugOrganismo(nome) {
  return String(nome)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function organismo(slugBuscado) {
  const alvo = String(slugBuscado || '').toLowerCase();
  return organismos().find((o) => o.slug === alvo) || null;
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
  urls.push(['/pbqp-h/certificadoras', lastmod, 'weekly', '0.7']);
  for (const o of organismos().filter((x) => x.publicavel)) {
    urls.push([`/pbqp-h/certificadoras/${o.slug}`, lastmod, 'monthly', '0.6']);
  }
  return urls;
}

export { GATE_MUNICIPIO };
