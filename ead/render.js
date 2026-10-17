// ── SSR das páginas públicas do EAD ──────────────────────────────────────────
// As duas páginas de produto eram 100% JavaScript: o Google via "Carregando
// cursos..." e "Carregando curso...". São quatro produtos de R$ 197 a R$ 497
// invisíveis para busca — e a própria página de detalhe já tinha meta e
// JSON-LD prontos do servidor, mas nenhum conteúdo no corpo.
//
// O HTML daqui usa EXATAMENTE as mesmas classes do template em JS. O script da
// página continua rodando e sobrescreve este conteúdo quando carrega, para
// mostrar o estado de quem está logado (matriculado, acesso ao player). Para o
// robô e para quem tem JS lento, o conteúdo já está no primeiro byte.

const ICONES = ['9001', 'AUD', 'P+I', '5S'];

export function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function moeda(v) {
  const n = Number(v || 0);
  return 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Grade de /ead/cursos. `promo` liga o preço gratuito de lançamento. */
export function renderGrade(cursos, promo = false) {
  if (!cursos.length) return '<p class="loading">Cursos em breve!</p>';

  return cursos.map((c, i) => {
    const preco = promo
      ? `<div><span class="price-was">${moeda(c.preco)}</span><span class="price-free">Grátis</span></div>`
      : `<div>${c.preco_original ? `<span class="price-original">${moeda(c.preco_original)}</span>` : ''}<span class="price">${moeda(c.preco)}</span></div>`;

    const botao = promo
      ? `<a href="/ead/checkout/${esc(c.slug)}" class="btn-ver" style="background:var(--green)">Acessar grátis</a>`
      : `<a href="/ead/curso/${esc(c.slug)}" class="btn-ver">Ver detalhes</a>`;

    return `<div class="course-card">
<div class="thumb">${promo ? '<span class="promo-tag">Grátis</span>' : ''}${ICONES[i] || ''}</div>
<div class="body">
<h2><a href="/ead/curso/${esc(c.slug)}" style="color:inherit;text-decoration:none">${esc(c.titulo)}</a></h2>
<div class="meta"><span>${esc(c.carga_horaria)}</span><span>${c.total_modulos} módulos</span><span>${c.total_aulas} aulas</span></div>
<p class="desc">${esc(String(c.subtitulo || c.descricao || '').slice(0, 160))}</p>
<div class="bottom">${preco}${botao}</div>
</div></div>`;
  }).join('');
}

/** Corpo visível de /ead/curso/<slug>. `modulos` = [{titulo, aulas:[{titulo, duracao}]}]. */
export function renderDetalhe(c, modulos = [], promo = false) {
  const totalAulas = modulos.reduce((s, m) => s + (m.aulas?.length || 0), 0);

  const ctaTopo = promo
    ? `<span class="price-was">${moeda(c.preco)}</span><span class="price-free">Grátis</span><a href="/ead/checkout/${esc(c.slug)}" class="btn-free">Matricular grátis</a>`
    : `${c.preco_original ? `<span class="price-old">${moeda(c.preco_original)}</span>` : ''}<span class="price">${moeda(c.preco)}</span><a href="/ead/checkout/${esc(c.slug)}" class="btn-buy">Comprar agora</a>`;

  // "Pagamento seguro via Mercado Pago" era texto morto: o Mercado Pago saiu do
  // projeto e o checkout é Asaas (Pix, boleto ou cartão).
  const ctaRodape = promo
    ? `<div class="cta-card"><div class="cta-card-badge">Lançamento — acesso gratuito</div>
<div class="cta-card-prices"><span class="price-was-dark">${moeda(c.preco)}</span><span class="price-free-lg">Grátis</span></div>
<a href="/ead/checkout/${esc(c.slug)}" class="btn-free btn-free-lg">Matricular grátis agora</a>
<p class="cta-card-sub">Acesso vitalício. Sem cartão. Sem compromisso.</p></div>`
    : `<div class="cta-card cta-card-paid">${c.preco_original ? `<div class="price-was-dark">${moeda(c.preco_original)}</div>` : ''}
<div class="price-lg">${moeda(c.preco)}</div>
<a href="/ead/checkout/${esc(c.slug)}" class="btn-buy btn-buy-lg">Comprar agora</a>
<p class="cta-card-sub">Pagamento via Pix, boleto ou cartão. Certificado incluso.</p></div>`;

  const ementa = modulos.map((m, i) => {
    const aulas = (m.aulas || []).map((l) =>
      `<div class="lesson-item"><span>${esc(l.titulo)}${l.entregavel_titulo ? `<span class="tpl">${esc(l.entregavel_titulo)}</span>` : ''}</span><span class="dur">${esc(l.duracao || '')}</span></div>`
    ).join('');
    return `<div class="module-accordion">
<div class="module-header${i === 0 ? ' open' : ''}" data-accordion>
<h3>Módulo ${i + 1}: ${esc(m.titulo)}</h3>
<span class="count">${(m.aulas || []).length} aulas</span>
<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
</div>
<div class="module-lessons${i === 0 ? ' show' : ''}">${aulas}</div></div>`;
  }).join('');

  return `<section class="hero-course"><div class="wrap">
<div class="breadcrumb"><a href="/ead/cursos">Cursos</a> / ${esc(c.titulo)}</div>
<h1>${esc(c.titulo)}</h1>
<p class="sub">${esc(c.subtitulo || '')}</p>
<div class="meta"><span>${esc(c.carga_horaria)}</span><span>${modulos.length} módulos</span><span>${totalAulas} aulas</span><span>Certificado incluso</span></div>
<div class="cta-row">${ctaTopo}</div>
</div></section>
<div class="wrap">
<section class="content-section">
<h2>O que você vai aprender</h2>
<p style="font-size:15px;line-height:1.7;color:var(--mute);margin-bottom:28px">${esc(c.objetivo || c.descricao || '')}</p>
${c.publico ? `<div style="margin-bottom:16px"><b style="font-size:14px">Para quem é:</b> <span style="font-size:14px;color:var(--mute)">${esc(c.publico)}</span></div>` : ''}
${c.prerequisito ? `<div style="margin-bottom:28px"><b style="font-size:14px">Pré-requisito:</b> <span style="font-size:14px;color:var(--mute)">${esc(c.prerequisito)}</span></div>` : ''}
</section>
<section class="content-section"><h2>Conteúdo do curso</h2>${ementa}</section>
<section class="content-section" style="text-align:center;padding:40px 0 48px">${ctaRodape}</section>
</div>`;
}

/** Troca o placeholder de carregamento pelo HTML pronto. */
export function injetar(html, placeholder, conteudo) {
  if (!html.includes(placeholder)) return html;
  return html.replace(placeholder, conteudo);
}
