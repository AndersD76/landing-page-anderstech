// ── Imagem de Open Graph por página (1200 × 630, PNG) ─────────────────────────
// Identidade de artefato (CLAUDE.md §5): navy #0b1730, acento vermelho, diamante,
// Poppins. Renderizado com resvg a partir das fontes do próprio repositório
// (sem fonte do sistema: o resultado é igual em dev e no Railway). Cache em
// memória: o título só muda num deploy ou numa onda.

import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const FONTES = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'fonts');
const cache = new Map();

const esc = (t) => String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Quebra o título em até 4 linhas de ~26 caracteres (Poppins Bold a 64 px).
export function quebrar(texto, max = 26, linhas = 4) {
  const out = [];
  let atual = '';
  for (const p of String(texto).split(/\s+/)) {
    if ((atual + ' ' + p).trim().length > max && atual) { out.push(atual); atual = p; } else atual = (atual + ' ' + p).trim();
  }
  if (atual) out.push(atual);
  if (out.length > linhas) { out.length = linhas; out[linhas - 1] = out[linhas - 1].replace(/\s*\S*$/, '') + '…'; }
  return out;
}

export function svgOg({ titulo, rotulo = 'anderstech.net' }) {
  const ls = quebrar(titulo);
  const y0 = 300 - (ls.length - 1) * 38;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#0b1730"/>
<rect x="0" y="0" width="14" height="630" fill="#FE0000"/>
<rect x="1040" y="70" width="70" height="70" fill="#FE0000" transform="rotate(45 1075 105)"/>
<text x="90" y="120" font-family="Poppins" font-weight="600" font-size="28" fill="#b9c8e4" letter-spacing="3">ANDERS TECH · ISO 9001 E PBQP-H</text>
${ls.map((l, i) => `<text x="90" y="${y0 + i * 76}" font-family="Poppins" font-weight="700" font-size="64" fill="#ffffff">${esc(l)}</text>`).join('\n')}
<rect x="90" y="530" width="40" height="40" fill="#FE0000" transform="rotate(45 110 550)"/>
<text x="150" y="562" font-family="Poppins" font-weight="400" font-size="30" fill="#b9c8e4">${esc(rotulo)}</text>
</svg>`;
}

export function pngOg(chave, dados) {
  if (cache.has(chave)) return cache.get(chave);
  const png = new Resvg(svgOg(dados), {
    font: { fontFiles: ['Poppins-Bold.ttf', 'Poppins-SemiBold.ttf', 'Poppins-Regular.ttf'].map(f => join(FONTES, f)), loadSystemFonts: false, defaultFontFamily: 'Poppins' },
    fitTo: { mode: 'width', value: 1200 },
  }).render().asPng();
  if (cache.size > 400) cache.delete(cache.keys().next().value);
  cache.set(chave, png);
  return png;
}
