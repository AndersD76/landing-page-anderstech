(function(){
  var NAV = '<header class="nav solid" style="position:sticky;top:0;z-index:80"><div class="wrap"><div class="nav-inner">'
    + '<a href="/" class="brand" aria-label="Anders Tech">'
    + '<img src="/assets/logo-horizontal-transparent.png" alt="Anders Tech" style="height:80px;width:auto;object-fit:contain"></a>'
    + '<nav class="nav-links" aria-label="Principal">'
    + '<a href="/#servicos">Serviços</a>'
    + '<a href="/#diferencial">Diferencial</a>'
    + '<a href="/#sobre">Sobre</a>'
    + '<a href="/blog">Conteúdo</a>'
    + '<a href="/#contato">Contato</a></nav>'
    + '<div class="nav-cta"><a href="/portal" class="btn btn-out" style="padding:10px 18px;font-size:13px"><span>Portal</span></a><a href="/#contato" class="btn btn-red"><span>Agendar Conversa</span></a></div>'
    + '</div></div></header>';

  var FOOTER = '<footer class="footer"><div class="wrap footer-big">'
    + '<div class="fb-word">anders<b>tech</b></div>'
    + '<div class="fb-tag">GESTÃO COM TECNOLOGIA · QUALIDADE &amp; CONFORMIDADE PARA A INDÚSTRIA</div>'
    + '<p class="fb-desc">Consultoria de qualidade e conformidade para a indústria. Diagnóstico baseado em dados — método de engenharia.</p>'
    + '<div class="fb-cnpj">CNPJ 42.073.716/0001-80</div></div>'
    + '<div class="wrap footer-grid">'
    + '<div class="footer-col"><h4>Navegação</h4><ul>'
    + '<li><a href="/#servicos">Serviços</a></li>'
    + '<li><a href="/#diferencial">Diferencial</a></li>'
    + '<li><a href="/#sobre">Sobre</a></li>'
    + '<li><a href="/blog">Conteúdo</a></li>'
    + '<li><a href="/#contato">Contato</a></li>'
    + '<li><a href="/calculadora-roi-certificacao">Calculadora ROI</a></li>'
    + '<li><a href="/checklist-iso-9001">Checklist ISO 9001</a></li></ul></div>'
    + '<div class="footer-col"><h4>Regiões</h4><ul>'
    + '<li><a href="/consultoria-iso-9001-passo-fundo">Passo Fundo</a></li>'
    + '<li><a href="/consultoria-iso-9001-erechim">Erechim</a></li>'
    + '<li><a href="/consultoria-iso-9001-caxias-do-sul">Caxias do Sul</a></li>'
    + '<li><a href="/consultoria-iso-9001-porto-alegre">Porto Alegre</a></li>'
    + '<li><a href="/consultoria-iso-9001-bento-goncalves">Bento Gonçalves</a></li>'
    + '<li><a href="/consultoria-iso-9001-carazinho">Carazinho</a></li>'
    + '<li><a href="/consultoria-iso-9001-marau">Marau</a></li></ul></div>'
    + '<div class="footer-col"><h4>Contato</h4>'
    + '<ul class="footer-contact">'
    + '<li>Passo Fundo · Erechim · RS</li>'
    + '<li>danielanders76@gmail.com</li></ul>'
    + '<a href="https://andersdev.com.br" target="_blank" rel="noopener" class="footer-cross">'
    + 'Software sob medida → andersdev.com.br</a></div></div>'
    + '<div class="wrap footer-bot"><p>© 2026 ANDERS TECH · TODOS OS DIREITOS RESERVADOS</p>'
    + '<div class="fl"><a href="/termos-de-uso">Termos</a>'
    + '<a href="/politica-de-privacidade">Privacidade</a>'
    + '<a href="https://anderstech.net"><b>anderstech.net</b></a>'
    + '<a href="https://andersdev.com.br" target="_blank" rel="noopener">andersdev.com.br</a></div></div></footer>';

  var FAB = '<a href="https://wa.me/5554999648368?text=Oi%2C%20vim%20pelo%20site%20da%20Anders%20Tech." target="_blank" rel="noopener" class="wa-fab" aria-label="WhatsApp" style="position:fixed;right:28px;bottom:28px;z-index:85;width:58px;height:58px;background:#25D366;display:grid;place-items:center;color:#fff;box-shadow:0 14px 32px rgba(37,211,102,.42);border-radius:50%">'
    + '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207z"/></svg></a>';

  var el;
  el = document.getElementById('shared-nav');
  if (el) el.outerHTML = NAV;
  el = document.getElementById('shared-footer');
  if (el) el.outerHTML = FOOTER;
  if (!document.querySelector('.wa-fab')) document.body.insertAdjacentHTML('beforeend', FAB);
})();
