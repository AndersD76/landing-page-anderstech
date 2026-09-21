import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'fs';
import { basename, dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { TERMOS } from '../glossario/terms.js';

// ── Por que este arquivo existe ──────────────────────────────────────────────
// Uma correção de acentuação em massa no texto atingiu também as URLs:
// "certificacao" virou "certificação" em 110 links, em 27 arquivos. Toda URL
// com acento dá 404 — inclusive o CANONICAL de 13 páginas, que passaram a dizer
// ao Google que a versão oficial delas era uma página inexistente (a de custo,
// a da calculadora, a política de privacidade...). Ninguém percebe olhando a
// página: o texto está certo, só o endereço quebrou.

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));

function htmls(dir) {
  const saida = [];
  (function walk(d) {
    for (const f of readdirSync(d)) {
      if (['node_modules', '.git', 'data'].includes(f)) continue;
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.html')) saida.push(p);
    }
  })(dir);
  return saida;
}

// Rotas que existem de verdade — é contra isto que o canonical é conferido.
function rotasConhecidas() {
  const rotas = new Set(['/', '/blog', '/glossario']);
  for (const f of readdirSync(join(RAIZ, 'pages'))) if (f.endsWith('.html')) rotas.add('/' + f.replace(/\.html$/, ''));
  for (const f of readdirSync(join(RAIZ, 'blog'))) if (f.endsWith('.html') && f !== 'index.html') rotas.add('/blog/' + f.replace(/\.html$/, ''));
  for (const t of TERMOS) rotas.add('/glossario/' + t.slug);
  return rotas;
}

const RE_URL_ACENTO = /(?:https:\/\/anderstech\.net)?(\/[a-z0-9\-/]*[À-ÿ][a-z0-9\-/À-ÿ]*)/g;
const CONTEXTO_URL = /canonical|og:url|href=|"url"|"item"|"@id"/;

test('nenhuma URL interna tem acento — toda URL com acento é 404', () => {
  const achados = [];
  for (const arq of htmls(RAIZ)) {
    readFileSync(arq, 'utf8').split('\n').forEach((linha, i) => {
      if (!CONTEXTO_URL.test(linha)) return;
      for (const m of linha.matchAll(RE_URL_ACENTO)) {
        achados.push(`${relative(RAIZ, arq)}:${i + 1}  ${m[1]}`);
      }
    });
  }
  assert.equal(achados.length, 0, `URLs com acento (dão 404):\n  ${achados.join('\n  ')}`);
});

test('todo canonical aponta para uma rota que existe', () => {
  const rotas = rotasConhecidas();
  const quebrados = [];
  for (const arq of [...htmls(join(RAIZ, 'pages')), ...htmls(join(RAIZ, 'blog'))]) {
    // Arquivo com prefixo _ é modelo (blog/_template.html, com {{SLUG}}) e não
    // é servido — responde 404 em produção.
    if (basename(arq).startsWith('_')) continue;
    const m = /<link rel="canonical" href="https:\/\/anderstech\.net([^"]*)"/.exec(readFileSync(arq, 'utf8'));
    if (!m) continue;
    const caminho = m[1].replace(/\/$/, '') || '/';
    if (!rotas.has(caminho)) quebrados.push(`${relative(RAIZ, arq)} → ${caminho}`);
  }
  assert.equal(quebrados.length, 0, `canonical apontando para rota inexistente:\n  ${quebrados.join('\n  ')}`);
});

test('og:url bate com o canonical da mesma página', () => {
  const divergentes = [];
  for (const arq of [...htmls(join(RAIZ, 'pages')), ...htmls(join(RAIZ, 'blog'))]) {
    const html = readFileSync(arq, 'utf8');
    const can = /<link rel="canonical" href="([^"]*)"/.exec(html);
    const og = /<meta property="og:url" content="([^"]*)"/.exec(html);
    if (!can || !og) continue;
    // O post consolidado aponta o canonical para a página de custo, de
    // propósito — o og:url dele segue a própria URL. Única exceção conhecida.
    if (arq.endsWith('quanto-custa-certificacao-iso-9001.html')) continue;
    if (can[1] !== og[1]) divergentes.push(`${relative(RAIZ, arq)}: canonical=${can[1]} og:url=${og[1]}`);
  }
  assert.equal(divergentes.length, 0, divergentes.join('\n  '));
});

// Sitemap e noindex não podem se contradizer: URL oferecida no sitemap com
// `noindex` na página aparece no Search Console como "Excluída pela tag noindex"
// — era o caso dos termos de uso e da política de privacidade.
test('nenhuma URL do sitemap aponta para página com noindex', async () => {
  const { buildSitemap } = await import('../sitemap.js');
  const { urlsIndexaveis } = await import('../pbqph/dados.js');
  const xml = buildSitemap([], urlsIndexaveis());
  const caminhos = [...xml.matchAll(/<loc>https:\/\/anderstech\.net([^<]*)<\/loc>/g)].map((m) => m[1] || '/');

  const conflitos = [];
  for (const c of caminhos) {
    let arq = null;
    if (c.startsWith('/blog/')) arq = join(RAIZ, 'blog', c.slice(6) + '.html');
    else if (!c.slice(1).includes('/') && c !== '/') arq = join(RAIZ, 'pages', c.slice(1) + '.html');
    if (!arq) continue;
    let html;
    try { html = readFileSync(arq, 'utf8'); } catch { continue; }
    if (/<meta name="robots" content="[^"]*noindex/i.test(html)) conflitos.push(c);
  }
  assert.equal(conflitos.length, 0, `no sitemap com noindex: ${conflitos.join(', ')}`);
});
