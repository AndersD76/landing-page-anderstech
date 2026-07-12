// ── Renderização SSR do Glossário da Qualidade ──
// Gera HTML completo (com placeholders shared-nav/shared-footer que o server injeta).
// Páginas: /glossario (índice por categoria) e /glossario/{slug} (termo com DefinedTerm schema).

import { TERMOS, TERMOS_BY_SLUG, CATEGORIAS, FERRAMENTAS_PB, PRISMABIZ_BASE } from './terms.js';

const SITE = 'https://anderstech.net';

const CSS = `
:root{--navy:#203864;--navy-950:#0b1730;--red:#FE0000;--red-600:#d80a0a;--paper:#F4F6FA;--white:#FFFFFF;--ink:#16233f;--ink-soft:#46577a;--ink-mute:#8190ac;--line:rgba(32,56,100,.14);--on-navy:#fff;--on-navy-soft:#b9c8e4;--ff-display:"Space Grotesk",system-ui,sans-serif;--ff-body:"Inter",system-ui,-apple-system,sans-serif;--ff-mono:"Space Mono",ui-monospace,monospace;--ease:cubic-bezier(.22,.61,.36,1)}
*,*::before,*::after{box-sizing:border-box}*{margin:0}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{font-family:var(--ff-body);background:var(--paper);color:var(--ink);line-height:1.72;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}::selection{background:var(--red);color:#fff}
.hero{background:var(--navy);color:var(--on-navy);padding:clamp(48px,8vw,88px) clamp(22px,5vw,80px) clamp(40px,6vw,64px)}
.hero .wrap{max-width:900px;margin:0 auto}
.hero .tag{font-family:var(--ff-mono);font-size:.75rem;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px}
.hero h1{font-family:var(--ff-display);font-size:clamp(1.7rem,4.5vw,2.6rem);font-weight:700;line-height:1.14;letter-spacing:-.03em;color:#fff;margin-bottom:16px}
.hero h1 span{color:var(--red)}
.hero .subtitle{font-size:1.08rem;color:var(--on-navy-soft);line-height:1.65;max-width:640px}
.content{max-width:900px;margin:0 auto;padding:clamp(36px,6vw,64px) clamp(22px,5vw,80px)}
.content h2{font-family:var(--ff-display);font-size:clamp(1.25rem,2.6vw,1.5rem);font-weight:700;letter-spacing:-.02em;color:var(--navy);margin-top:40px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--line)}
.content h2:first-child{margin-top:0}
.content p{margin-bottom:18px;font-size:1.02rem}
.content strong{color:var(--navy);font-weight:600}
.pratica-box{background:var(--white);border-left:4px solid var(--red);padding:22px 26px;margin:26px 0;border-radius:0 8px 8px 0}
.pratica-box .pb-title{font-family:var(--ff-mono);font-size:.72rem;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px}
.pratica-box p{margin-bottom:0;font-size:.98rem;color:var(--ink-soft)}
.tool-box{background:var(--white);border:1px solid var(--line);border-radius:8px;padding:22px 26px;margin:26px 0}
.tool-box .tb-title{font-family:var(--ff-mono);font-size:.72rem;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
.tool-box p{font-size:.95rem;color:var(--ink-soft);margin-bottom:12px}
.tool-box a.tb-link{display:inline-flex;align-items:center;gap:8px;font-family:var(--ff-display);font-weight:600;font-size:.92rem;color:var(--red)}
.tool-box a.tb-link:hover{color:var(--red-600);text-decoration:underline}
.rel-list{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0 8px;padding:0;list-style:none}
.rel-list a{display:inline-block;background:var(--white);border:1px solid var(--line);border-radius:999px;padding:7px 16px;font-size:.88rem;color:var(--ink-soft);transition:border-color .2s var(--ease),color .2s var(--ease)}
.rel-list a:hover{border-color:var(--red);color:var(--navy)}
.gl-cat{margin-bottom:36px}
.gl-cat h2{font-family:var(--ff-display);font-size:1.2rem;font-weight:700;color:var(--navy);margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--line)}
.gl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;list-style:none;padding:0}
.gl-grid a{display:block;background:var(--white);border:1px solid var(--line);border-radius:8px;padding:12px 16px;font-size:.93rem;font-weight:500;color:var(--ink);transition:border-color .2s var(--ease)}
.gl-grid a:hover{border-color:var(--red)}
.crumbs{font-family:var(--ff-mono);font-size:.75rem;color:var(--on-navy-soft);letter-spacing:.04em;margin-bottom:18px}
.crumbs a:hover{color:#fff;text-decoration:underline}
.cta-section{background:var(--navy);color:var(--on-navy);padding:clamp(44px,7vw,72px) clamp(22px,5vw,80px);text-align:center}
.cta-section .wrap{max-width:900px;margin:0 auto}
.cta-section h2{font-family:var(--ff-display);font-size:clamp(1.4rem,3.2vw,1.85rem);font-weight:700;color:#fff;margin-bottom:14px}
.cta-section p{color:var(--on-navy-soft);font-size:1.02rem;margin-bottom:28px;max-width:560px;margin-left:auto;margin-right:auto}
.cta-buttons{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--ff-display);font-weight:600;font-size:.95rem;padding:14px 32px;border-radius:6px;transition:all .2s var(--ease)}
.btn-red{background:var(--red);color:#fff}.btn-red:hover{background:var(--red-600)}
.btn-outline{background:transparent;color:var(--on-navy);border:1.5px solid rgba(255,255,255,.3)}.btn-outline:hover{border-color:#fff}
@media(max-width:600px){.cta-buttons{flex-direction:column;align-items:center}}
`;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function head({ title, desc, path, jsonLd }) {
  const url = SITE + path;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta name="author" content="Anders Tech" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${url}" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:image" content="${SITE}/assets/og-image.png" />
<meta property="og:site_name" content="Anders Tech" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${SITE}/assets/og-image.png" />
<link rel="stylesheet" href="/styles.css">
<link rel="icon" href="/assets/favicon.png" type="image/png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
${jsonLd.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
<style>${CSS}</style>
</head>
<body>
<div id="shared-nav"></div>
`;
}

const FOOT = `
<div id="shared-footer"></div>
<script src="/shared.js"></script>
</body>
</html>`;

// ── Página de termo ──
export function renderTermo(slug) {
  const t = TERMOS_BY_SLUG.get(slug);
  if (!t) return null;

  const path = `/glossario/${t.slug}`;
  const title = `O que é ${t.termo}? Definição e aplicação prática | Anders Tech`;
  const desc = (t.def[0].length > 152 ? t.def[0].slice(0, 152).replace(/\s+\S*$/, '') + '…' : t.def[0]);

  const definedTerm = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: t.termo,
    description: t.def.join(' '),
    url: SITE + path,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Glossário da Qualidade — Anders Tech',
      url: SITE + '/glossario',
    },
  };

  const ferramentaNome = FERRAMENTAS_PB[t.ferramenta];
  const ferramentaUrl = PRISMABIZ_BASE + t.ferramenta;

  const relacionados = t.rel
    .map(r => TERMOS_BY_SLUG.get(r))
    .filter(Boolean)
    .map(r => `<li><a href="/glossario/${r.slug}">${esc(r.termo)}</a></li>`)
    .join('');

  const waMsg = encodeURIComponent(`Olá, li sobre ${t.termo} no glossário da Anders Tech e quero conversar sobre consultoria.`);

  return head({ title, desc, path, jsonLd: [definedTerm] }) + `
<section class="hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Você está aqui"><a href="/">Início</a> / <a href="/glossario">Glossário da Qualidade</a></nav>
    <div class="tag">${esc(t.categoria)}</div>
    <h1>O que é <span>${esc(t.termo)}</span>?</h1>
  </div>
</section>

<article class="content" id="main-content">
  ${t.def.map(p => `<p>${esc(p)}</p>`).join('\n  ')}

  <div class="pratica-box">
    <div class="pb-title">Na prática</div>
    <p>${esc(t.pratica)}</p>
  </div>

  <div class="tool-box">
    <div class="tb-title">Ferramenta relacionada</div>
    <p>Para aplicar este conceito no dia a dia, use a ferramenta <strong>${esc(ferramentaNome)}</strong> no PrismaBiz — plataforma de gestão da qualidade do mesmo ecossistema da Anders Tech.</p>
    <a class="tb-link" href="${ferramentaUrl}" target="_blank" rel="noopener">Abrir ${esc(ferramentaNome)} no PrismaBiz →</a>
  </div>

  <h2>Termos relacionados</h2>
  <ul class="rel-list">${relacionados}</ul>
  <p><a href="/glossario" style="color:var(--red);font-weight:600">← Ver todos os termos do glossário</a></p>
</article>

<section class="cta-section">
  <div class="wrap">
    <h2>Quer implantar isso na sua empresa?</h2>
    <p>A Anders Tech implanta ISO 9001, PBQP-H e sistemas de gestão da qualidade em indústrias do RS. Diagnóstico gratuito, sem compromisso.</p>
    <div class="cta-buttons">
      <a href="https://wa.me/5554999648368?text=${waMsg}" class="btn btn-red" target="_blank" rel="noopener">Falar no WhatsApp</a>
      <a href="/ead/cursos" class="btn btn-outline">Cursos EAD de qualidade</a>
    </div>
  </div>
</section>
` + FOOT;
}

// ── Índice do glossário ──
export function renderIndex() {
  const path = '/glossario';
  const title = `Glossário da Qualidade: ${TERMOS.length} termos ISO 9001 explicados | Anders Tech`;
  const desc = `Glossário completo de gestão da qualidade: ${TERMOS.length} termos de ISO 9001, auditoria, lean e melhoria contínua explicados em linguagem direta, com aplicação prática na indústria.`;

  const termSet = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Glossário da Qualidade — Anders Tech',
    description: desc,
    url: SITE + path,
    hasDefinedTerm: TERMOS.map(t => ({
      '@type': 'DefinedTerm',
      name: t.termo,
      url: `${SITE}/glossario/${t.slug}`,
    })),
  };

  const porCategoria = CATEGORIAS.map(cat => {
    const termos = TERMOS.filter(t => t.categoria === cat)
      .sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR'));
    if (!termos.length) return '';
    return `
  <div class="gl-cat">
    <h2>${esc(cat)}</h2>
    <ul class="gl-grid">
      ${termos.map(t => `<li><a href="/glossario/${t.slug}">${esc(t.termo)}</a></li>`).join('\n      ')}
    </ul>
  </div>`;
  }).join('\n');

  return head({ title, desc, path, jsonLd: [termSet] }) + `
<section class="hero">
  <div class="wrap">
    <div class="tag">Glossário da Qualidade</div>
    <h1>${TERMOS.length} termos de <span>ISO 9001 e gestão da qualidade</span>, explicados sem juridiquês</h1>
    <p class="subtitle">De não conformidade a takt time: definições diretas, escritas por quem implanta sistemas de gestão em indústrias do Rio Grande do Sul — cada termo com aplicação prática e a ferramenta certa para usar.</p>
  </div>
</section>

<article class="content" id="main-content">
  <p>Este glossário reúne os termos que aparecem todos os dias em projetos de certificação <strong>ISO 9001</strong>, auditorias, programas de melhoria contínua e no chão de fábrica. Cada verbete tem definição própria — sem copiar a letra fria da norma —, um bloco "na prática" com o erro comum e o caminho que funciona, e o link para a ferramenta relacionada no PrismaBiz, quando existe uma que ajuda a aplicar o conceito.</p>
  <p>Use como material de consulta na implantação do seu sistema de gestão, no treinamento de equipe ou na preparação para auditoria. Se um termo que você procura não está aqui, <a href="https://wa.me/5554999648368?text=Oi%2C%20senti%20falta%20de%20um%20termo%20no%20gloss%C3%A1rio%20da%20Anders%20Tech." target="_blank" rel="noopener" style="color:var(--red);font-weight:600">avise no WhatsApp</a> — o glossário cresce com as dúvidas reais de quem usa.</p>
${porCategoria}
</article>

<section class="cta-section">
  <div class="wrap">
    <h2>Da teoria à certificação</h2>
    <p>Consultoria de implantação ISO 9001 e PBQP-H para indústrias de Passo Fundo, Erechim e região — e cursos EAD para formar sua equipe.</p>
    <div class="cta-buttons">
      <a href="https://wa.me/5554999648368?text=Ol%C3%A1%2C%20quero%20um%20diagn%C3%B3stico%20gratuito%20de%20gest%C3%A3o%20da%20qualidade." class="btn btn-red" target="_blank" rel="noopener">Diagnóstico gratuito</a>
      <a href="/ead/cursos" class="btn btn-outline">Ver cursos EAD</a>
    </div>
  </div>
</section>
` + FOOT;
}
