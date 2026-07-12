// ── Sitemap dinâmico ──
// Substitui o sitemap.xml estático: as URLs do glossário vêm de glossario/terms.js,
// então novos termos entram no sitemap automaticamente. Servido em /sitemap.xml (server.js).

import { TERMOS } from './glossario/terms.js';

const SITE = 'https://anderstech.net';
const GLOSSARIO_LASTMOD = '2026-07-12'; // atualizar quando termos forem revisados/adicionados

// [path, lastmod, changefreq, priority]
const CORE_URLS = [
  ['/', '2026-07-12', 'weekly', '1.0'],

  // Blog
  ['/blog', '2026-06-06', 'weekly', '0.8'],
  ['/blog/quanto-custa-certificacao-iso-9001', '2026-07-12', 'monthly', '0.8'],
  ['/blog/pbqp-h-o-que-e-para-que-serve', '2026-06-06', 'monthly', '0.8'],
  ['/blog/iso-9001-vale-a-pena-para-metalurgica', '2026-06-06', 'monthly', '0.8'],
  ['/blog/como-reduzir-retrabalho-na-producao', '2026-06-06', 'monthly', '0.8'],
  ['/blog/o-que-e-iso-9001', '2026-06-08', 'monthly', '0.9'],
  ['/blog/como-conseguir-certificacao-iso-9001', '2026-06-08', 'monthly', '0.9'],
  ['/blog/iso-9001-para-industrias', '2026-06-08', 'monthly', '0.8'],
  ['/blog/erros-certificacao-iso-9001', '2026-06-08', 'monthly', '0.8'],

  // SEO Regional
  ['/consultoria-iso-9001-passo-fundo', '2026-07-12', 'monthly', '0.9'],
  ['/consultoria-iso-9001-erechim', '2026-07-12', 'monthly', '0.9'],
  ['/consultoria-iso-9001-caxias-do-sul', '2026-07-12', 'monthly', '0.8'],
  ['/consultoria-iso-9001-porto-alegre', '2026-07-12', 'monthly', '0.8'],
  ['/consultoria-iso-9001-bento-goncalves', '2026-07-12', 'monthly', '0.8'],
  ['/consultoria-iso-9001-carazinho', '2026-07-12', 'monthly', '0.9'],
  ['/consultoria-iso-9001-marau', '2026-07-12', 'monthly', '0.9'],

  // SEO Setorial
  ['/iso-9001-metalurgica', '2026-06-06', 'monthly', '0.8'],
  ['/iso-9001-industria-alimenticia', '2026-06-06', 'monthly', '0.8'],
  ['/iso-9001-cooperativa-agricola', '2026-06-06', 'monthly', '0.8'],
  ['/iso-9001-construtora', '2026-06-06', 'monthly', '0.8'],
  ['/pbqp-h-construtora-residencial', '2026-06-06', 'monthly', '0.8'],
  ['/pbqp-h-construtora-grande-porte', '2026-06-06', 'monthly', '0.8'],

  // Decisão / custo (BOFU)
  ['/iso-9001-vale-a-pena', '2026-06-06', 'monthly', '0.7'],
  ['/quanto-custa-certificacao-iso', '2026-07-12', 'monthly', '0.9'],
  ['/quanto-custa-iso-14001', '2026-07-12', 'monthly', '0.8'],
  ['/quanto-custa-auditoria-interna', '2026-07-12', 'monthly', '0.8'],
  ['/quanto-custa-pbqp-h', '2026-07-12', 'monthly', '0.8'],
  ['/quanto-tempo-implantar-iso-9001', '2026-06-06', 'monthly', '0.7'],
  ['/diferenca-iso-9001-vs-bpm', '2026-06-06', 'monthly', '0.7'],

  // Ferramentas
  ['/calculadora-roi-certificacao', '2026-07-12', 'monthly', '0.7'],
  ['/checklist-iso-9001', '2026-06-06', 'monthly', '0.7'],

  // Cursos EAD
  ['/ead/cursos', '2026-06-29', 'weekly', '0.9'],
  ['/ead/curso/iso-9001-2015-interpretacao', '2026-06-29', 'monthly', '0.8'],
  ['/ead/curso/auditor-interno-iso-9001', '2026-06-29', 'monthly', '0.8'],
  ['/ead/curso/gestao-processos-indicadores', '2026-06-29', 'monthly', '0.8'],
  ['/ead/curso/5s-pratica-industrial', '2026-06-29', 'monthly', '0.8'],

  // Glossário (índice)
  ['/glossario', GLOSSARIO_LASTMOD, 'weekly', '0.8'],

  // Legal
  ['/termos-de-uso', '2026-06-06', 'yearly', '0.3'],
  ['/politica-de-privacidade', '2026-06-06', 'yearly', '0.3'],
];

export function buildSitemap() {
  const urls = [
    ...CORE_URLS,
    ...TERMOS.map(t => [`/glossario/${t.slug}`, GLOSSARIO_LASTMOD, 'monthly', '0.6']),
  ];
  const body = urls
    .map(([loc, lastmod, changefreq, priority]) =>
      `  <url><loc>${SITE}${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function sitemapUrlCount() {
  return CORE_URLS.length + TERMOS.length;
}
