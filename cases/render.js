// ── Renderer HTML de case (versão web indexável) ────────────────────────────
// Gera HTML para /cases/<slug>. O injectShared adiciona nav, footer, telemetria.
// JSON-LD Article com mainEntityOfPage + publisher.

import { EMPRESA, waLink } from '../config/empresa.js';

export function renderCase(c) {
  const metricas = Array.isArray(c.metricas) ? c.metricas : [];
  const temDepoimento = c.depoimento_texto && c.depoimento_texto.trim();

  const metricasHTML = metricas.length ? `
    <div class="case-metricas">
      ${metricas.map(m => `
        <div class="case-metrica">
          <span class="case-metrica-valor">${esc(m.valor)}</span>
          <span class="case-metrica-label">${esc(m.label)}</span>
        </div>
      `).join('')}
    </div>` : '';

  const depoimentoHTML = temDepoimento ? `
    <blockquote class="case-depoimento">
      <p>"${esc(c.depoimento_texto)}"</p>
      ${c.depoimento_autor ? `<cite>— ${esc(c.depoimento_autor)}${c.depoimento_cargo ? `, ${esc(c.depoimento_cargo)}` : ''}</cite>` : ''}
    </blockquote>` : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Case: ${c.cliente} — ${c.servico}`,
    description: c.problema.slice(0, 160),
    author: {
      '@type': 'Person',
      name: 'Daniel Anders',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Anders Tech',
      url: EMPRESA.dominio,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${EMPRESA.dominio}/cases/${c.slug}`,
    },
    datePublished: c.criado_em ? new Date(c.criado_em).toISOString().slice(0, 10) : undefined,
    dateModified: c.atualizado_em ? new Date(c.atualizado_em).toISOString().slice(0, 10) : undefined,
  };

  const ctaTexto = `Olá! Vi o case ${c.cliente} e quero saber como ter resultados parecidos.`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Case: ${esc(c.cliente)} — ${esc(c.servico)} | Anders Tech</title>
  <meta name="description" content="${esc(c.problema.slice(0, 155))}">
  <link rel="canonical" href="${EMPRESA.dominio}/cases/${c.slug}">
  <meta property="og:title" content="Case: ${esc(c.cliente)} — ${esc(c.servico)}">
  <meta property="og:description" content="${esc(c.problema.slice(0, 155))}">
  <meta property="og:url" content="${EMPRESA.dominio}/cases/${c.slug}">
  <meta property="og:type" content="article">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <link rel="stylesheet" href="/styles.css">
  <style>
    .case-hero {
      background: var(--navy, #0b1730);
      color: #fff;
      padding: 3rem 1.5rem 2rem;
    }
    .case-hero .case-tag {
      display: inline-block;
      font-size: .75rem;
      color: var(--red-600, #d80a0a);
      text-transform: uppercase;
      letter-spacing: .08em;
      font-weight: 600;
      margin-bottom: .5rem;
    }
    .case-hero h1 {
      font-size: clamp(1.5rem, 4vw, 2.2rem);
      font-weight: 700;
      margin: 0 0 .5rem;
    }
    .case-hero .case-meta {
      font-size: .85rem;
      color: #b9c8e4;
    }
    .case-body {
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    .case-section { margin-bottom: 2rem; }
    .case-section h2 {
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: var(--navy, #0b1730);
      margin-bottom: .5rem;
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    .case-section h2::before {
      content: '';
      display: inline-block;
      width: 8px; height: 8px;
      background: var(--red-600, #d80a0a);
      transform: rotate(45deg);
      flex-shrink: 0;
    }
    .case-section p {
      font-size: .95rem;
      line-height: 1.7;
      color: #333;
    }
    .case-metricas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }
    .case-metrica {
      background: var(--bg-card, #f4f6fa);
      border-radius: 8px;
      padding: 1.2rem 1rem;
      text-align: center;
    }
    .case-metrica-valor {
      display: block;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--red-600, #d80a0a);
      line-height: 1.1;
    }
    .case-metrica-label {
      display: block;
      font-size: .75rem;
      color: var(--navy-soft, #46577a);
      margin-top: .3rem;
    }
    .case-depoimento {
      border-left: 3px solid var(--red-600, #d80a0a);
      padding: 1rem 1.5rem;
      margin: 2rem 0;
      background: var(--bg-card, #f4f6fa);
      border-radius: 0 8px 8px 0;
    }
    .case-depoimento p {
      font-size: .95rem;
      font-style: italic;
      color: var(--navy, #0b1730);
      margin: 0 0 .5rem;
    }
    .case-depoimento cite {
      font-size: .8rem;
      color: var(--navy-soft, #46577a);
      font-style: normal;
    }
    .case-cta {
      text-align: center;
      padding: 2rem 1.5rem 3rem;
    }
    .case-cta .btn-wa {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      background: #25d366;
      color: #fff;
      padding: .8rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      transition: background .2s;
    }
    .case-cta .btn-wa:hover { background: #1da851; }
  </style>
</head>
<body>
  <div id="shared-nav"></div>

  <section class="case-hero">
    <div style="max-width:720px;margin:0 auto">
      <span class="case-tag">${esc(c.segmento)} · ${esc(c.servico)}</span>
      <h1>${esc(c.cliente)}</h1>
      <p class="case-meta">Case de consultoria — Anders Tech</p>
    </div>
  </section>

  <article class="case-body">
    <section class="case-section">
      <h2>O problema</h2>
      <p>${esc(c.problema)}</p>
    </section>

    <section class="case-section">
      <h2>O que foi feito</h2>
      <p>${esc(c.solucao)}</p>
    </section>

    <section class="case-section">
      <h2>Resultado</h2>
      <p>${esc(c.resultado)}</p>
      ${metricasHTML}
    </section>

    ${depoimentoHTML}
  </article>

  <div class="case-cta">
    <p style="margin-bottom:1rem;color:var(--navy-soft,#46577a);">Quer resultados parecidos?</p>
    <a href="${waLink(ctaTexto)}" class="btn-wa" data-wa="case-${esc(c.slug)}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.12 1.52 5.857L0 24l6.335-1.652A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.875 0-3.615-.525-5.1-1.44l-.36-.225-3.765.99.99-3.63-.24-.375A9.7 9.7 0 012.25 12 9.75 9.75 0 0112 2.25 9.75 9.75 0 0121.75 12 9.75 9.75 0 0112 21.75z"/></svg>
      Falar com Anders
    </a>
  </div>

  <script>
    if (typeof window.__telemetry === 'function') {
      window.__telemetry('case_view', { slug: '${c.slug}' });
    }
  </script>

  <div id="shared-footer"></div>
</body>
</html>`;
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
