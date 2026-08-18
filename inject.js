// ── Shared HTML injection (analytics, nav, footer, breadcrumbs) ──
// Extraido de server.js para evitar dependencia circular com ead/routes.js

import { PROMO, promoAtiva } from './promo.js';
import { EMPRESA } from './config/empresa.js';
import { TERMOS_BY_SLUG } from './glossario/terms.js';

// ── Google Analytics 4 (gtag.js) ──
const GTAG_HTML = '<script async src=`https://www.googletagmanager.com/gtag/js?id=${EMPRESA.ga4}`></script>'
  + '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","'+EMPRESA.ga4+'");</script>';

// ── GA4: todo clique em link wa.me vira evento "contact" ──
const WA_TRACK_HTML = '<script>document.addEventListener("click",function(e){'
  + 'var a=e.target&&e.target.closest?e.target.closest(\'a[href*="wa.me"]\'):null;if(!a)return;'
  + 'if(typeof gtag==="function")gtag("event","contact",{method:"whatsapp",event_category:"engagement",event_label:location.pathname});'
  + 'if(typeof plausible==="function")plausible("whatsapp_click",{props:{path:location.pathname}});'
  + '});</'
  + 'script>';

// ── SSR nav/footer for sub-pages ──
const NAV_HTML = '<header class="nav solid" style="position:sticky;top:0;z-index:80"><div class="wrap"><div class="nav-inner">'
  + '<a href="/" class="brand" aria-label="Anders Tech">'
  + '<img src="/assets/logo-horizontal-transparent.png" alt="Anders Tech" width="320" height="80" style="height:80px;width:auto;object-fit:contain"></a>'
  + '<nav class="nav-links" aria-label="Principal">'
  + '<a href="/#servicos">Serviços</a><a href="/#diferencial">Diferencial</a><a href="/#sobre">Sobre</a><a href="/blog">Conteúdo</a><a href="/ead/cursos">Cursos</a><a href="/#contato">Contato</a></nav>'
  + '<div class="nav-cta"><a href="/portal" class="btn btn-out" style="padding:10px 18px;font-size:13px"><span>Portal</span></a><a href="/#contato" class="btn btn-red"><span>Agendar Conversa</span></a>'
  + '<button class="nav-toggle" id="navToggle" aria-label="Abrir menu" aria-expanded="false">'
  + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg></button>'
  + '</div></div></div></header>'
  + '<nav class="mobile-menu" id="mobileMenu" aria-label="Menu móvel">'
  + '<a href="/#servicos"><i>01</i> Serviços</a>'
  + '<a href="/#diferencial"><i>02</i> Diferencial</a>'
  + '<a href="/#sobre"><i>03</i> Sobre</a>'
  + '<a href="/blog"><i>04</i> Conteúdo</a>'
  + '<a href="/ead/cursos"><i>05</i> Cursos EAD</a>'
  + '<a href="/#contato"><i>06</i> Contato</a>'
  + '<a href="/#contato" class="btn btn-red btn-lg"><span>Agendar Conversa</span></a></nav>'
  + '<script>!function(){var t=document.getElementById("navToggle"),m=document.getElementById("mobileMenu");if(t&&m){t.addEventListener("click",function(){var o=m.classList.toggle("open");t.setAttribute("aria-expanded",String(o));document.body.style.overflow=o?"hidden":""});m.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){m.classList.remove("open");t.setAttribute("aria-expanded","false");document.body.style.overflow=""})})}}()</script>';
const FOOTER_HTML = '<footer class="footer"><div class="wrap footer-big">'
  + '<div class="fb-word">anders<b>tech</b></div>'
  + '<div class="fb-tag">GESTÃO COM TECNOLOGIA · QUALIDADE &amp; CONFORMIDADE PARA A INDÚSTRIA</div>'
  + '<p class="fb-desc">Consultoria de qualidade e conformidade para a indústria. Diagnóstico baseado em dados — método de engenharia.</p>'
  + '<div class="fb-cnpj">CNPJ '+EMPRESA.cnpj+'</div></div>'
  + '<div class="wrap footer-grid">'
  + '<div class="footer-col"><h4>Navegação</h4><ul>'
  + '<li><a href="/#servicos">Serviços</a></li><li><a href="/#diferencial">Diferencial</a></li><li><a href="/#sobre">Sobre</a></li>'
  + '<li><a href="/blog">Conteúdo</a></li><li><a href="/#contato">Contato</a></li>'
  + '<li><a href="/ead/cursos">Cursos EAD</a></li><li><a href="/glossario">Glossário da Qualidade</a></li><li><a href="/calculadora-roi-certificacao">Calculadora ROI</a></li><li><a href="/checklist-iso-9001">Checklist ISO 9001</a></li><li><a href="/quanto-custa-certificacao-iso">Quanto custa a ISO 9001</a></li></ul></div>'
  + '<div class="footer-col"><h4>Regiões</h4><ul>'
  + '<li><a href="/consultoria-iso-9001-passo-fundo">Passo Fundo</a></li>'
  + '<li><a href="/consultoria-iso-9001-erechim">Erechim</a></li>'
  + '<li><a href="/consultoria-iso-9001-caxias-do-sul">Caxias do Sul</a></li>'
  + '<li><a href="/consultoria-iso-9001-porto-alegre">Porto Alegre</a></li>'
  + '<li><a href="/consultoria-iso-9001-bento-goncalves">Bento Gonçalves</a></li>'
  + '<li><a href="/consultoria-iso-9001-carazinho">Carazinho</a></li>'
  + '<li><a href="/consultoria-iso-9001-marau">Marau</a></li></ul></div>'
  + '<div class="footer-col"><h4>Contato</h4><ul class="footer-contact"><li>'+EMPRESA.cidades+'</li><li>'+EMPRESA.email+'</li></ul>'
  + '<a href="https://andersdev.com.br" target="_blank" rel="noopener" class="footer-cross">Software sob medida → andersdev.com.br</a></div></div>'
  + '<div class="wrap footer-bot"><p>© 2026 ANDERS TECH · TODOS OS DIREITOS RESERVADOS</p>'
  + '<div class="fl"><a href="/termos-de-uso">Termos</a><a href="/politica-de-privacidade">Privacidade</a>'
  + '<a href="https://anderstech.net"><b>anderstech.net</b></a><a href="https://andersdev.com.br" target="_blank" rel="noopener">andersdev.com.br</a></div></div></footer>';
const WA_FAB = '<a href="https://wa.me/'+EMPRESA.whatsapp+'?text=Oi%2C%20vim%20pelo%20site%20da%20Anders%20Tech." target="_blank" rel="noopener" class="wa-fab" aria-label="WhatsApp" style="position:fixed;right:28px;bottom:28px;z-index:85;width:58px;height:58px;background:#25D366;display:grid;place-items:center;color:#fff;box-shadow:0 14px 32px rgba(37,211,102,.42);border-radius:50%">'
  + '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207z"/></svg></a>';

// ── Sticky CTA mobile ──
const STICKY_CTA = '<div class="sticky-cta" id="stickyCta">'
  + '<a class="sc-main" href="/#contato">Agendar diagnóstico gratuito</a>'
  + '<a class="sc-wa" href="https://wa.me/'+EMPRESA.whatsapp+'?text=Oi%2C%20vim%20pelo%20site%20da%20Anders%20Tech." target="_blank" rel="noopener" aria-label="Falar no WhatsApp">'
  + '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207z"/></svg></a></div>'
  + '<style>.sticky-cta{display:none}@media(max-width:760px){body{padding-bottom:70px}.wa-fab{display:none!important}'
  + '.sticky-cta{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:84;gap:10px;align-items:stretch;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:#0b1730;box-shadow:0 -8px 28px rgba(11,23,48,.35)}'
  + '.sticky-cta .sc-main{flex:1;display:flex;align-items:center;justify-content:center;background:#c5383c;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 8px}'
  + '.sticky-cta .sc-wa{width:50px;display:grid;place-items:center;background:#25D366;color:#fff;flex:none}}</style>'
  + '<script>!function(){var b=document.getElementById("stickyCta");if(!b)return;b.addEventListener("click",function(e){var a=e.target.closest("a");if(!a)return;var w=a.classList.contains("sc-wa");'
  + 'if(typeof gtag==="function")gtag("event",w?"contact_whatsapp":"diagnosis_click",{event_category:"engagement",event_label:"sticky_mobile"});'
  + 'if(typeof plausible==="function")plausible(w?"whatsapp_sticky":"diagnosis_sticky")})}()</'
  + 'script>';

const SKIP_LINK = '<a href="#main-content" class="skip-link">Pular para o conteúdo</a>';

const BREADCRUMB_LABELS = {
  blog: 'Conteúdo',
  'quanto-custa-certificacao-iso-9001': 'Quanto custa a certificação ISO 9001?',
  'pbqp-h-o-que-e-para-que-serve': 'PBQP-H: o que é e para que serve?',
  'iso-9001-vale-a-pena-para-metalurgica': 'ISO 9001 vale a pena para metalúrgica?',
  'como-reduzir-retrabalho-na-producao': 'Como reduzir retrabalho na produção',
  'consultoria-iso-9001-passo-fundo': 'Consultoria ISO 9001 em Passo Fundo',
  'consultoria-iso-9001-erechim': 'Consultoria ISO 9001 em Erechim',
  'consultoria-iso-9001-caxias-do-sul': 'Consultoria ISO 9001 em Caxias do Sul',
  'consultoria-iso-9001-porto-alegre': 'Consultoria ISO 9001 em Porto Alegre',
  'consultoria-iso-9001-bento-goncalves': 'Consultoria ISO 9001 em Bento Gonçalves',
  'iso-9001-metalurgica': 'ISO 9001 para Metalúrgicas',
  'iso-9001-industria-alimenticia': 'ISO 9001 para Indústria Alimentícia',
  'iso-9001-cooperativa-agricola': 'ISO 9001 para Cooperativas Agrícolas',
  'iso-9001-construtora': 'ISO 9001 para Construtoras',
  'pbqp-h-construtora-residencial': 'PBQP-H para Construtora Residencial',
  'pbqp-h-construtora-grande-porte': 'PBQP-H para Construtora Grande Porte',
  'iso-9001-vale-a-pena': 'ISO 9001 vale a pena?',
  'quanto-custa-certificacao-iso': 'Quanto custa a certificação ISO?',
  'quanto-tempo-implantar-iso-9001': 'Quanto tempo leva para implantar a ISO 9001?',
  'diferenca-iso-9001-vs-bpm': 'ISO 9001 vs BPM',
  'calculadora-roi-certificacao': 'Calculadora ROI da Certificação',
  'checklist-iso-9001': 'Checklist ISO 9001',
  'consultoria-iso-9001-carazinho': 'Consultoria ISO 9001 em Carazinho',
  'consultoria-iso-9001-marau': 'Consultoria ISO 9001 em Marau',
  'o-que-e-iso-9001': 'O que é ISO 9001?',
  'como-conseguir-certificacao-iso-9001': 'Como conseguir a certificação ISO 9001',
  'iso-9001-para-industrias': 'ISO 9001 para indústrias',
  'erros-certificacao-iso-9001': '5 erros na certificação ISO 9001',
  'ead': 'Cursos EAD',
  'glossario': 'Glossário da Qualidade',
  'quanto-custa-iso-14001': 'Quanto custa a ISO 14001?',
  'quanto-custa-auditoria-interna': 'Quanto custa a auditoria interna?',
  'quanto-custa-pbqp-h': 'Quanto custa o PBQP-H?',
};

function buildBreadcrumbSchema(urlPath) {
  const parts = urlPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  if (!parts.length) return '';
  const items = [{ '@type': 'ListItem', position: 1, name: 'Início', item: 'https://anderstech.net' }];
  let pos = 2;
  if (parts[0] === 'blog' && parts.length > 1) {
    items.push({ '@type': 'ListItem', position: pos++, name: 'Conteúdo', item: 'https://anderstech.net/blog' });
    items.push({ '@type': 'ListItem', position: pos, name: BREADCRUMB_LABELS[parts[1]] || parts[1] });
  } else if (parts[0] === 'glossario' && parts.length > 1) {
    items.push({ '@type': 'ListItem', position: pos++, name: 'Glossário da Qualidade', item: 'https://anderstech.net/glossario' });
    items.push({ '@type': 'ListItem', position: pos, name: (TERMOS_BY_SLUG.get(parts[1]) || {}).termo || parts[1] });
  } else {
    items.push({ '@type': 'ListItem', position: pos, name: BREADCRUMB_LABELS[parts[0]] || parts[0] });
  }
  return '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items }) + '</script>';
}

// #50: o GA4 era injetado sempre — cada teste local registrava lead falso na
// propriedade de producao. #72: e gravava cookie antes de qualquer escolha.
const IS_PROD = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

const COOKIE_BANNER = '<div id="ckBanner" style="display:none;position:fixed;left:0;right:0;bottom:0;z-index:90;background:#0b1730;color:#fff;padding:16px 20px;font-size:14px;line-height:1.5;box-shadow:0 -8px 28px rgba(11,23,48,.35)">'
  + '<div style="max-width:1080px;margin:0 auto;display:flex;gap:16px;align-items:center;flex-wrap:wrap">'
  + '<span style="flex:1;min-width:260px">Usamos cookies de análise para entender como o site é usado. '
  + '<a href="/politica-de-privacidade" style="color:#fff;text-decoration:underline">Política de Privacidade</a>.</span>'
  + '<button id="ckNo" style="background:none;border:1px solid rgba(255,255,255,.4);color:#fff;padding:9px 16px;cursor:pointer;font-size:14px">Recusar</button>'
  + '<button id="ckYes" style="background:#c5383c;border:none;color:#fff;padding:10px 20px;cursor:pointer;font-weight:600;font-size:14px">Aceitar</button>'
  + '</div></div>'
  + '<script>!function(){var K="at_cookie_consent";function load(){'
  + 'if(window.__gaLoaded)return;window.__gaLoaded=1;'
  + 'var s=document.createElement("script");s.async=1;s.src=`https://www.googletagmanager.com/gtag/js?id=${EMPRESA.ga4}`;document.head.appendChild(s);'
  + 'window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag("js",new Date());gtag("config","'+EMPRESA.ga4+'")}'
  + 'try{var v=localStorage.getItem(K);if(v==="1"){load();return}if(v==="0")return}catch(e){}'
  + 'var b=document.getElementById("ckBanner");if(!b)return;b.style.display="block";'
  + 'document.getElementById("ckYes").onclick=function(){try{localStorage.setItem(K,"1")}catch(e){}b.style.display="none";load()};'
  + 'document.getElementById("ckNo").onclick=function(){try{localStorage.setItem(K,"0")}catch(e){}b.style.display="none"}}()</'
  + 'script>';

export function injectShared(html, urlPath) {
  const breadcrumb = urlPath ? buildBreadcrumbSchema(urlPath) : '';
  return html
    .replace('</head>', '<link rel="apple-touch-icon" href="/assets/favicon.png">' + breadcrumb + (IS_PROD ? WA_TRACK_HTML : '') + '</head>')
    .replace('<body>', '<body>' + SKIP_LINK)
    .replace('<div id="shared-nav"></div>', NAV_HTML)
    .replace('<div id="shared-footer"></div>', FOOTER_HTML + WA_FAB + STICKY_CTA)
    // #78: a home anunciava "acesso gratuito ate 29/07" com a promocao ja
    // encerrada. Agora o bloco so existe enquanto a promocao estiver ativa.
    // Banner ancorado em </body>: a home tem rodape proprio, sem #shared-footer.
    .replace('</body>', (IS_PROD ? COOKIE_BANNER : '') + '</body>')
    // Seção 06 da home era HTML fixo de promoção: título "Grátis", badge em
    // cada card, preço riscado e bloco de pacote a R$ 0. Continuou anunciando
    // gratuidade depois de a promoção encerrar. Agora o servidor resolve.
    .replace(/__TREIN_TITULO__/g, promoAtiva()
      ? '4 cursos de qualidade industrial. Grátis.'
      : '4 treinamentos de qualidade industrial')
    .replace(/__TREIN_SUB__/g, promoAtiva()
      ? '88 aulas, 44h de conteúdo, templates prontos, certificado. Matricule-se agora e mantenha o acesso permanente.'
      : '88 aulas, 44h de conteúdo, templates prontos e certificado de conclusão. Acesso vitalício.')
    .replace(/__TREIN_BADGE__/g, promoAtiva()
      ? '<span class="trein-badge trein-badge-green">Grátis</span>'
      : '')
    .replace(/__TREIN_PRECO_(\d+)__/g, (_m, preco) => promoAtiva()
      ? `<span class="trein-price-old">R$ ${preco}</span><span class="trein-price trein-price-free">Grátis</span>`
      : `<span class="trein-price">R$ ${preco}</span>`)
    .replace(/__TREIN_BUNDLE__/g, promoAtiva()
      ? '<div class="trein-bundle reveal" style="border-color:rgba(22,163,74,.4);background:linear-gradient(135deg,rgba(22,163,74,.15) 0%,rgba(22,163,74,.04) 100%)">'
        + '<div class="trein-bundle-text"><span class="trein-cat" style="color:#4ade80">Oferta de lançamento</span>'
        + '<h3>Todos os 4 cursos gratuitos por tempo limitado</h3>'
        + '<p>Matricule-se agora. Acesso permanente mesmo após o fim da promoção.</p></div>'
        + '<div class="trein-bundle-price"><span class="trein-price-old">R$ 1.388</span>'
        + '<span class="trein-price" style="font-size:32px;color:#4ade80">R$ 0</span>'
        + '<a href="/ead/cursos" class="trein-bundle-btn" style="background:#16a34a">Matricular grátis &rarr;</a></div></div>'
      : '<div class="trein-bundle reveal">'
        + '<div class="trein-bundle-text"><span class="trein-cat">Formação completa</span>'
        + '<h3>Os 4 treinamentos, do requisito à auditoria</h3>'
        + '<p>88 aulas, 44h, templates e certificado em cada um. Acesso vitalício.</p></div>'
        + '<div class="trein-bundle-price">'
        + '<a href="/ead/cursos" class="trein-bundle-btn">Ver os treinamentos &rarr;</a></div></div>')
    .replace(/__PROMO_TAG__/g, promoAtiva()
      ? `<span class="tag" style="color:#16a34a">Lançamento — acesso gratuito até ${PROMO.fimCurto}</span>`
      : '')
    .replace(/__PROMO_FIM_CURTO__/g, PROMO.fimCurto)
    .replace(/__PROMO_FIM_LONGO__/g, PROMO.fimLongo);
}
