#!/usr/bin/env node
// ── Otimização das imagens de marca ──────────────────────────────────────────
// Os dois logos eram PNG de 1831×859 (214 KB e 92 KB) servidos num espaço de
// ~192×90. O Lighthouse media 293 KiB de desperdício, e era o que separava o
// LCP do celular (2,7 s) do alvo de 2 s: num 4G throttled esses bytes disputam
// banda com as fontes, que são o que realmente pinta o texto do hero.
//
// Gera derivadas no tamanho real de render (1x e 2x), em PNG com paleta e em
// WebP, e MEDE as duas. A referência só vira <picture> se o WebP realmente
// ganhar — ver "Por que não tem WebP", no fim deste comentário.
//
//   node scripts/optimize-images.mjs            aplica
//   node scripts/optimize-images.mjs --check    só relata, não escreve
//
// Idempotente: antes de aplicar, desfaz a forma que a rodada anterior escreveu.
// Trocar de estratégia e rodar de novo corrige o que estava lá, em vez de
// deixar as duas formas convivendo.
//
// POR QUE NÃO TEM WEBP NOS LOGOS
// WebP compensa em fotografia. Estes logos são arte chapada com transparência,
// e aí o PNG com paleta ganha de longe — medido nesta máquina:
//     png paleta        2,5 KB
//     webp lossy q88   14,4 KB
//     webp lossless    18,5 KB
// A perda da quantização é imperceptível: comparando cada derivada com o
// original, ambas compostas sobre o navy real da nav, o erro médio ficou em
// 0,26–0,55 de 255, concentrado nas bordas de antialiasing. Publicar um
// <source type="image/webp"> maior que o próprio fallback seria piorar de
// propósito, então o script não publica. Se um dia entrar uma foto aqui, o
// WebP vence sozinho e o <picture> aparece sem ninguém mexer no código.

import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, statSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(RAIZ, 'assets');
const CHECAR = process.argv.includes('--check');

// Altura de render: 90px no cabeçalho da home, 80px na nav das subpáginas.
// Usamos a maior — 90 em 1x, 180 em 2x. A largura sai da proporção do original.
const ALVOS = [
  { base: 'logo-horizontal-white', alturas: { '1x': 90, '2x': 180 } },
  { base: 'logo-horizontal-transparent', alturas: { '1x': 90, '2x': 180 } },
];

const ORCAMENTO_BYTES = 30 * 1024;   // os dois logos somados, no que a página baixa

const kb = b => (b / 1024).toFixed(1) + ' KB';
const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function gerar(alvo) {
  const origem = join(ASSETS, alvo.base + '.png');
  if (!existsSync(origem)) throw new Error('não encontrei ' + origem);

  const meta = await sharp(origem).metadata();
  const saidas = [];

  for (const [densidade, altura] of Object.entries(alvo.alturas)) {
    const largura = Math.round(altura * (meta.width / meta.height));
    const redim = () => sharp(origem).resize({ height: altura, fit: 'inside', withoutEnlargement: true });

    const bufPng = await redim().png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toBuffer();
    const bufWebp = await redim().webp({ quality: 88, effort: 6, alphaQuality: 100 }).toBuffer();
    const webpVence = bufWebp.length < bufPng.length;

    if (!CHECAR) {
      writeFileSync(join(ASSETS, `${alvo.base}-${densidade}.png`), bufPng);
      const caminhoWebp = join(ASSETS, `${alvo.base}-${densidade}.webp`);
      if (webpVence) writeFileSync(caminhoWebp, bufWebp);
      else if (existsSync(caminhoWebp)) unlinkSync(caminhoWebp);
    }

    saidas.push({ densidade, largura, altura, png: bufPng.length, webp: bufWebp.length, webpVence });
  }

  return { origem, meta, saidas, webpVence: saidas.every(s => s.webpVence) };
}

// ── Reescrita das referências ────────────────────────────────────────────────
// Preserva todos os atributos existentes (class, style, alt, fetchpriority,
// decoding, loading...). Só troca src e acrescenta srcset.
function montarReferencia(tagImg, base, webpVence, dim) {
  // width/height diziam 320x80 (razão 4,0) enquanto o arquivo real é 2,13.
  // O atributo é a dica de proporção que o navegador usa para reservar espaço
  // antes da imagem chegar — errado, ele reserva a caixa errada.
  const semAntigos = tagImg
    .replace(/\s+src="[^"]*"/, '')
    .replace(/\s+srcset="[^"]*"/, '')
    .replace(/\s+width="[^"]*"/, '')
    .replace(/\s+height="[^"]*"/, '')
    .replace(/\s*\/?>$/, '')
    .replace(/^<img/, `<img width="${dim.largura}" height="${dim.altura}"`);
  const img = `${semAntigos} src="/assets/${base}-1x.png"`
    + ` srcset="/assets/${base}-1x.png 1x, /assets/${base}-2x.png 2x">`;
  if (!webpVence) return img;
  return '<picture>'
    + `<source type="image/webp" srcset="/assets/${base}-1x.webp 1x, /assets/${base}-2x.webp 2x">`
    + img
    + '</picture>';
}

// Devolve qualquer forma já aplicada ao <img> simples apontando para o original.
function normalizar(html, base) {
  const b = esc(base);
  const rePicture = new RegExp(`<picture><source[^>]*${b}-[^>]*>(<img[^>]*>)</picture>`, 'g');
  html = html.replace(rePicture, (_m, img) => img);
  const reImg = new RegExp(`<img[^>]*src="/?assets/${b}-1x\\.png"[^>]*>`, 'g');
  return html.replace(reImg, m => m
    .replace(new RegExp(`src="/?assets/${b}-1x\\.png"`), `src="/assets/${base}.png"`)
    .replace(/\s+srcset="[^"]*"/, ''));
}

function reescreverHtml(caminho, bases, vitorias, dims) {
  const original = readFileSync(caminho, 'utf8');
  let html = original;
  for (const base of bases) {
    html = normalizar(html, base);
    const re = new RegExp(`<img[^>]*src="/?assets/${esc(base)}\\.png"[^>]*>`, 'g');
    html = html.replace(re, m => montarReferencia(m, base, vitorias[base], dims[base]));
  }
  if (html !== original && !CHECAR) writeFileSync(caminho, html);
  return html !== original;
}

function arquivosQueReferenciam(bases) {
  // git ls-files: só o versionado — não varre node_modules nem lixo local.
  const versionados = execSync('git ls-files', { cwd: RAIZ, encoding: 'utf8' }).split('\n').filter(Boolean);
  return versionados.filter(f => {
    if (!/\.(html|js|css)$/.test(f)) return false;
    if (f.startsWith('scripts/')) return false;
    const caminho = join(RAIZ, f);
    if (!existsSync(caminho)) return false;
    const txt = readFileSync(caminho, 'utf8');
    return bases.some(b => txt.includes(`assets/${b}.png`) || txt.includes(`assets/${b}-1x.png`));
  });
}

// ── Execução ─────────────────────────────────────────────────────────────────
console.log(CHECAR ? '── modo --check: nada será escrito ──\n' : '── otimizando imagens de marca ──\n');

const vitorias = {};
const dims = {};   // dimensões da derivada 1x, para o atributo de proporção
let totalOriginal = 0;
let totalBaixado = 0;   // o que o navegador realmente pega: a derivada 2x escolhida

for (const alvo of ALVOS) {
  const { origem, meta, saidas, webpVence } = await gerar(alvo);
  vitorias[alvo.base] = webpVence;
  dims[alvo.base] = saidas.find(s => s.densidade === '1x');
  totalOriginal += statSync(origem).size;

  console.log(`${alvo.base}.png`);
  console.log(`  original      ${meta.width}x${meta.height}  ${kb(statSync(origem).size)}`);
  for (const s of saidas) {
    const marca = t => (s.webpVence ? t === 'webp' : t === 'png') ? ' ← publicado' : '';
    console.log(`  png  ${s.densidade}  ${String(s.largura + 'x' + s.altura).padStart(9)}  ${kb(s.png).padStart(8)}${marca('png')}`);
    console.log(`  webp ${s.densidade}  ${String(s.largura + 'x' + s.altura).padStart(9)}  ${kb(s.webp).padStart(8)}${marca('webp')}`);
    if (s.densidade === '2x') totalBaixado += s.webpVence ? s.webp : s.png;
  }
  console.log(`  → formato escolhido: ${webpVence ? 'WebP com <picture>' : 'PNG com paleta (WebP perdeu)'}\n`);
}

const bases = ALVOS.map(a => a.base);
const arquivos = arquivosQueReferenciam(bases);
console.log(`referências em ${arquivos.length} arquivo(s) versionado(s):`);

let alterados = 0;
const manuais = [];
for (const f of arquivos) {
  if (!f.endsWith('.html')) { manuais.push(f); console.log(`  ${f}  — JS: não é <img> em HTML, editar à mão`); continue; }
  const mudou = reescreverHtml(join(RAIZ, f), bases, vitorias, dims);
  if (mudou) alterados++;
  console.log(`  ${f}  ${mudou ? '→ atualizado' : '(já estava ok)'}`);
}

console.log(`\n${alterados} arquivo(s) HTML alterado(s)${manuais.length ? `, ${manuais.length} JS para conferir à mão` : ''}.`);
console.log(`\nOriginais somados:              ${kb(totalOriginal)}`);
console.log(`O que a página baixa agora (2x): ${kb(totalBaixado)}`);
console.log(`Orçamento ${kb(ORCAMENTO_BYTES)}  →  ${totalBaixado < ORCAMENTO_BYTES ? 'DENTRO' : 'ESTOUROU'}`);

if (totalBaixado >= ORCAMENTO_BYTES) process.exitCode = 1;
