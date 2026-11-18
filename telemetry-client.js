/* ============================================================
   ANDERS TECH — telemetria (cliente)
   Injetado em <head> por inject.js, com defer: roda antes do app.js,
   que limpa as UTMs da URL. Se a ordem inverter, a origem se perde.
   ============================================================ */
(function () {
  "use strict";
  if (window.anders) return;              // idempotente: nunca instrumenta duas vezes

  var API = "/api/telemetry";
  var K_ANON = "at_anonymous_id";
  var K_UTM = "at_utm";
  var K_LANDING = "at_landing";
  var K_SESSAO = "at_sessao";           // {id, visto} — fecha por inatividade
  var SESSAO_MS = 30 * 60 * 1000;       // 30 min, convenção de mercado
  var K_CONSENT = "at_cookie_consent";    // mesma chave do banner (inject.js)
  var EVENTOS_UNICOS = { page_view: 1, case_view: 1 };

  /* ---------- storage tolerante (modo anônimo, cookie bloqueado) ---------- */
  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
      return v;
    } catch (e) { return null; }
  }

  /* ---------- consentimento ---------- */
  // Antes da escolha: nada sai daqui e nada e persistido. Os eventos ficam na
  // fila em memoria, na ordem em que aconteceram, e so partem se a pessoa
  // aceitar — assim o primeiro page_view nao se perde por causa do banner.
  function consentimento() {
    var v = ls(K_CONSENT);
    return v === "1" ? "sim" : v === "0" ? "nao" : "pendente";
  }

  /* ---------- identificacao anonima ---------- */
  var anonMemoria = null;
  function novoId() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }
  function anonId() {
    if (!anonMemoria) anonMemoria = novoId();
    if (consentimento() === "sim") {
      var salvo = ls(K_ANON);
      if (salvo) return salvo;
      ls(K_ANON, anonMemoria);
    }
    return anonMemoria;
  }

  /* ---------- UTM: capturar antes que app.js limpe a URL ---------- */
  var CAMPOS_UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
  var utm = {};
  (function capturarUtm() {
    var achou = false;
    try {
      var q = new URLSearchParams(location.search);
      for (var i = 0; i < CAMPOS_UTM.length; i++) {
        var v = q.get(CAMPOS_UTM[i]);
        if (v) { utm[CAMPOS_UTM[i]] = v.slice(0, 120); achou = true; }
      }
    } catch (e) {}
    if (achou) {
      // Primeira origem vence dentro da sessao: quem chegou por uma campanha e
      // depois navegou pelo site continua atribuido a campanha.
      if (consentimento() === "sim") ls(K_UTM, JSON.stringify(utm));
      return;
    }
    try {
      var salvo = ls(K_UTM);
      if (salvo) utm = JSON.parse(salvo) || {};
    } catch (e) { utm = {}; }
  })();

  /* ---------- origem legivel da pagina ---------- */
  function meta(nome) {
    var m = document.querySelector('meta[name="' + nome + '"]');
    return m ? m.getAttribute("content") : null;
  }
  var ROTA = meta("at-rota") || location.pathname;
  var ORIGEM = meta("at-origem") || (document.title || "").split("—")[0].trim() || ROTA;

  /* ---------- sessao ----------
     O anonymous_id e identificador de DISPOSITIVO e vive para sempre: sem
     sessao nao ha como calcular funil nem taxa sobre a etapa anterior, porque
     duas visitas em meses diferentes eram a mesma linha. A sessao fecha por
     30 min de inatividade e e renovada a cada evento. */
  var sessaoMemoria = null;
  function sessaoId() {
    var agora = Date.now();
    var atual = null;
    try {
      var cru = ls(K_SESSAO);
      if (cru) atual = JSON.parse(cru);
    } catch (e) { atual = null; }

    if (!atual || !atual.id || !atual.visto || agora - atual.visto > SESSAO_MS) {
      atual = { id: novoId().replace(/-/g, "").slice(0, 32), visto: agora };
    } else {
      atual.visto = agora;
    }

    sessaoMemoria = atual.id;
    if (consentimento() === "sim") {
      try { ls(K_SESSAO, JSON.stringify(atual)); } catch (e) {}
    }
    return atual.id;
  }

  /* ---------- pagina de entrada da sessao ---------- */
  // Sem isto nao ha como saber qual pagina gera contato: o caminho so existia
  // dentro do props.path de cada evento, e o lead nao guardava nada. Mesma
  // regra da UTM: a primeira pagina vence, quem entrou por um artigo e foi
  // preencher o formulario na home continua atribuido ao artigo.
  var LANDING = ROTA;
  (function capturarLanding() {
    if (consentimento() !== "sim") return;   // sem consentimento: so a rota atual, em memoria
    var salvo = ls(K_LANDING);
    if (salvo) { LANDING = salvo; return; }
    ls(K_LANDING, ROTA);
  })();

  /* ---------- atribuicao completa (cookie first-party at_attr) ----------
     O servidor le este cookie ao gravar lead e pedido (growth/atribuicao.js).
     Primeiro toque nunca muda; ultimo toque muda a cada CHEGADA (URL com UTM
     ou identificador de clique, ou vinda de outro site) — navegar dentro do
     site nao e chegada. Regras de consentimento:
       - sem consentimento de analise: nada e gravado (so memoria);
       - identificador de clique (gclid, msclkid...) so com consentimento de
         marketing — e o que permite devolver a venda ao anuncio. */
  var CLIDS = ["gclid", "gbraid", "wbraid", "msclkid", "fbclid", "li_fat_id"];
  var K_MKT = "at_consent_mkt";
  function consentMkt() { return ls(K_MKT) === "1"; }

  var toque = null;   // chegada desta pagina, se for chegada
  (function capturarToque() {
    var q;
    try { q = new URLSearchParams(location.search); } catch (e) { return; }
    var t = { ts: new Date().toISOString(), landing: ROTA }, chegou = false;
    var ref = String(document.referrer || "");
    var externo = ref && ref.indexOf(location.origin) !== 0;
    if (externo) { t.referrer = ref.slice(0, 300); chegou = true; }
    for (var i = 0; i < CAMPOS_UTM.length; i++) {
      var u = q.get(CAMPOS_UTM[i]);
      if (u) { t[CAMPOS_UTM[i]] = u.slice(0, 120); chegou = true; }
    }
    var term = q.get("utm_term");
    if (term) { t.utm_term = term.slice(0, 120); chegou = true; }
    for (var j = 0; j < CLIDS.length; j++) {
      var c = q.get(CLIDS[j]);
      if (c && /^[A-Za-z0-9_.\-~]{4,300}$/.test(c)) { t[CLIDS[j]] = c; chegou = true; }
    }
    if (chegou) toque = t;
  })();

  function lerAttr() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)at_attr=([^;]*)/);
      return m ? JSON.parse(decodeURIComponent(m[1])) : null;
    } catch (e) { return null; }
  }
  function semClids(t) {
    if (!t) return t;
    var o = {};
    for (var k in t) if (CLIDS.indexOf(k) === -1) o[k] = t[k];
    return o;
  }
  function gravarAttr() {
    if (consentimento() !== "sim") {
      // Recusou analise: apaga o que houver.
      if (consentimento() === "nao") document.cookie = "at_attr=; path=/; max-age=0; SameSite=Lax";
      return;
    }
    var atual = lerAttr() || {};
    var mkt = consentMkt();
    var ft = atual.ft || toque || { ts: new Date().toISOString(), landing: LANDING };
    var lt = toque || atual.lt || ft;
    var valor = { ft: mkt ? ft : semClids(ft), lt: mkt ? lt : semClids(lt), mkt: mkt ? 1 : 0, sid: sessaoMemoria || sessaoId() };
    var s = encodeURIComponent(JSON.stringify(valor));
    if (s.length > 3800) { valor.ft = semClids(valor.ft); s = encodeURIComponent(JSON.stringify(valor)); }
    document.cookie = "at_attr=" + s + "; path=/; max-age=" + (90 * 86400) + "; SameSite=Lax" +
      (location.protocol === "https:" ? "; Secure" : "");
  }
  // Para formularios sem cookie (consentimento pendente): o toque desta pagina,
  // sem identificador de clique. O servidor da preferencia ao cookie.
  function atribAtual() {
    var c = lerAttr();
    if (c) return c;
    var t = semClids(toque || { ts: new Date().toISOString(), landing: LANDING });
    return { ft: t, lt: t, mkt: 0 };
  }

  /* ---------- fila + envio ---------- */
  var fila = [];
  var jaEnviado = {};
  var timer = null;

  function enfileirar(evento, props, extra) {
    if (EVENTOS_UNICOS[evento]) {
      if (jaEnviado[evento]) return;        // page_view/case_view: um por carregamento
      jaEnviado[evento] = 1;
    }
    var e = {
      event: evento,
      ts: new Date().toISOString(),
      anonymous_id: anonId(),
      session_id: sessaoId(),
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null,
      utm_content: utm.utm_content || null,
      props: props || {}
    };
    if (extra && extra.email) e.email = extra.email;
    if (extra && extra.telefone) e.telefone = extra.telefone;
    fila.push(e);
    agendar(extra && extra.imediato);
  }

  function agendar(imediato) {
    if (consentimento() !== "sim") return;   // pendente ou recusado: fila parada
    if (imediato) { despachar(); return; }
    if (timer) return;
    timer = setTimeout(despachar, 1000);
  }

  function despachar() {
    clearTimeout(timer); timer = null;
    if (consentimento() !== "sim" || !fila.length) return;
    var lote = fila.splice(0, 20);
    var corpo = JSON.stringify({ events: lote });
    // sendBeacon sobrevive a navegacao — clique em WhatsApp abre outra aba e a
    // pagina pode ser descartada antes de um fetch normal terminar.
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(API, new Blob([corpo], { type: "application/json" }))) return;
    } catch (e) {}
    try {
      fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: corpo, keepalive: true }).catch(function () {});
    } catch (e) {}
  }

  /* ---------- links de WhatsApp: origem + UTM ---------- */
  // Mensagens genericas que nao dizem de onde a pessoa veio. Paginas que ja
  // trazem texto proprio e especifico mantem o delas — e melhor que o generico.
  var GENERICAS = /^(oi,?\s*vim pelo site.*|ol[áa],?\s*vim pelo site.*|)$/i;

  function enriquecerWa(a) {
    if (!a || !a.href || a.href.indexOf("wa.me") === -1) return a;
    var u;
    try { u = new URL(a.href); } catch (e) { return a; }

    var texto = (u.searchParams.get("text") || "").trim().replace(/\.$/, "");
    if (GENERICAS.test(texto)) {
      u.searchParams.set("text", "Olá! Vim pela página " + ORIGEM + " (" + ROTA + ")");
    }
    u.searchParams.set("utm_source", "anderstech");
    u.searchParams.set("utm_medium", "whatsapp");
    u.searchParams.set("utm_campaign", ROTA === "/" ? "home" : ROTA.replace(/^\//, "").replace(/\//g, "_"));
    a.href = u.toString();
    return a;
  }

  function enriquecerTodos() {
    var links = document.querySelectorAll('a[href*="wa.me"]');
    for (var i = 0; i < links.length; i++) enriquecerWa(links[i]);
  }

  /* ---------- instrumentacao ---------- */
  // Um unico listener delegado no documento: elemento que aparece depois
  // (menu mobile, CTA sticky, exit popup) ja nasce coberto, e re-render nao
  // multiplica handler — a causa classica de evento duplicado.
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href*="wa.me"]') : null;
    if (!a) return;
    enriquecerWa(a);                        // garante UTM mesmo se o href mudou depois
    enfileirar("cta_whatsapp_click", {
      path: ROTA,
      origem: ORIGEM,
      local: a.getAttribute("data-at-local") || String(a.className || "").slice(0, 40) || "link"
    }, { imediato: true });
  }, true);

  function iniciar() {
    gravarAttr();
    enriquecerTodos();
    enfileirar("page_view", { path: ROTA, origem: ORIGEM, referrer: String(document.referrer || "").slice(0, 200) });
    if (ROTA.indexOf("/cases/") === 0) {
      enfileirar("case_view", { path: ROTA, slug: ROTA.replace("/cases/", "") });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();

  // Descarrega o que sobrou na fila ao sair da pagina.
  addEventListener("pagehide", despachar);
  addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") despachar(); });

  // O banner (inject.js) dispara este evento nas duas respostas. Aceitou:
  // persiste o id anonimo e despeja a fila na ordem original. Recusou: descarta.
  addEventListener("at:consent", function (ev) {
    if (ev.detail === "sim") {
      anonId();
      // Aceitou depois de navegar: grava a pagina de entrada agora, senao a
      // atribuicao se perde na proxima navegacao.
      if (!ls(K_LANDING)) ls(K_LANDING, LANDING);
      gravarAttr();
      despachar();
    }
    else { fila.length = 0; gravarAttr(); }
  });
  // Marketing respondido (aceite ou recusa): regrava com ou sem os
  // identificadores de clique.
  addEventListener("at:consent-mkt", function () { gravarAttr(); });

  /* ---------- API publica ---------- */
  /* ---------- CTA visto ----------
     Sem impressao nao ha denominador: 3 cliques nao dizem nada se voce nao sabe
     se 10 ou 10.000 pessoas viram o botao. Um disparo por CTA por sessao —
     re-render e scroll de ida e volta nao podem inflar a conta. */
  var ctasVistos = {};
  function observarCtas() {
    if (!window.IntersectionObserver) return;
    var alvos = document.querySelectorAll('a[href*="wa.me"], [data-wa], [data-cta]');
    if (!alvos.length) return;

    var obs = new IntersectionObserver(function (entradas) {
      for (var i = 0; i < entradas.length; i++) {
        var e = entradas[i];
        if (!e.isIntersecting) continue;
        var el = e.target;
        var local = el.getAttribute("data-cta") || el.getAttribute("data-wa") || el.className || "cta";
        var chave = ROTA + "|" + local;
        if (ctasVistos[chave]) { obs.unobserve(el); continue; }
        ctasVistos[chave] = 1;
        obs.unobserve(el);            // visto uma vez, nao observa mais
        enfileirar("cta_view", { path: ROTA, origem: ORIGEM, local: String(local).slice(0, 80) });
      }
    }, { threshold: 0.5 });           // metade do botao na tela conta como visto

    for (var j = 0; j < alvos.length; j++) obs.observe(alvos[j]);
  }

  if (document.readyState === "loading") {
    addEventListener("DOMContentLoaded", observarCtas);
  } else {
    observarCtas();
  }

  /* ---------- iscas e CTA do produto ----------
     Propriedades obrigatorias em todo evento de isca (organico/taxonomia.js):
     page_type, cluster, consulta_alvo, isca_id. As tres primeiras vem das metas
     at-* que o servidor poe em toda pagina. */
  var PAGINA = { page_type: meta("at-page-type") || "outra", cluster: meta("at-cluster") || "", consulta_alvo: meta("at-consulta") || "" };
  function propsIsca(id, extra) {
    var p = { path: ROTA, page_type: PAGINA.page_type, cluster: PAGINA.cluster, consulta_alvo: PAGINA.consulta_alvo, isca_id: id || "" };
    for (var k in (extra || {})) p[k] = extra[k];
    return p;
  }
  var iscaJa = {};
  function iscaEvento(evento, id, extra) {
    var chave = evento + "|" + id;
    if ((evento === "isca_vista" || evento === "isca_iniciada") && iscaJa[chave]) return;
    iscaJa[chave] = 1;
    enfileirar(evento, propsIsca(id, extra), { imediato: evento !== "isca_vista" });
    // Destino adicional: GA4 (só existe em producao e respeita o Consent Mode).
    // Marcar isca_concluida e lead_capturado como eventos-chave no GA4.
    try { if (typeof gtag === "function") gtag("event", evento, { isca_id: id || "", page_type: PAGINA.page_type, cluster: PAGINA.cluster }); } catch (e) {}
  }
  function observarIscas() {
    var alvos = document.querySelectorAll("[data-isca]");
    if (!alvos.length || !window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) {
        if (!es[i].isIntersecting) continue;
        iscaEvento("isca_vista", es[i].target.getAttribute("data-isca"), { posicao: es[i].target.getAttribute("data-isca-pos") || "" });
        obs.unobserve(es[i].target);
      }
    }, { threshold: 0.5 });
    for (var j = 0; j < alvos.length; j++) obs.observe(alvos[j]);
  }
  // Primeira interacao com a isca (foco num campo, clique numa opcao ou no CTA).
  function iniciou(ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest("[data-isca]") : null;
    if (el) iscaEvento("isca_iniciada", el.getAttribute("data-isca"));
    var prod = ev.target && ev.target.closest ? ev.target.closest('[data-cta-produto], a[href^="/contratar"], a[href*="anderstech.net/contratar"]') : null;
    if (prod && ev.type === "click") {
      enfileirar("cta_produto_clicado", propsIsca(prod.getAttribute("data-cta-produto") || "", { destino: (prod.getAttribute("href") || "").slice(0, 120) }), { imediato: true });
      try { if (typeof gtag === "function") gtag("event", "cta_produto_clicado", { page_type: PAGINA.page_type, cluster: PAGINA.cluster }); } catch (e) {}
    }
  }
  document.addEventListener("click", iniciou, true);
  document.addEventListener("focusin", iniciou, true);
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", observarIscas); else observarIscas();

  window.anders = {
    track: function (evento, props) { enfileirar(evento, props); },
    identify: function (traits) {
      if (!traits || (!traits.email && !traits.telefone)) return;
      enfileirar("identify", {
        path: ROTA,
        tem_email: !!traits.email,
        tem_telefone: !!traits.telefone
      }, { email: traits.email, telefone: traits.telefone, imediato: true });
    },
    waUrl: function (mensagem, numero) {
      var a = document.createElement("a");
      a.href = "https://wa.me/" + (numero || "5554999648368") +
        (mensagem ? "?text=" + encodeURIComponent(mensagem) : "");
      return enriquecerWa(a).href;
    },
    utm: function () { return JSON.parse(JSON.stringify(utm)); },
    // Atribuicao completa (primeiro e ultimo toque) para formularios e
    // checkouts que querem mandar no corpo — o servidor prefere o cookie.
    atrib: function () { return atribAtual(); },
    // Para as paginas de isca: isca("isca_concluida", "id") e isca("lead_capturado", "id").
    isca: function (evento, id, extra) { iscaEvento(evento, id, extra); },
    pagina: function () { return JSON.parse(JSON.stringify(PAGINA)); },
    landing: function () { return LANDING; },
    sessao: function () { return sessaoMemoria || sessaoId(); },
    // Ponto unico de atribuicao para POST /api/contact. Todo formulario do site
    // espalha isto no payload: antes so a home mandava UTM, e lead de
    // calculadora, checklist e pop-up nascia sem origem nenhuma.
    atribuicao: function () {
      return {
        landing_page: LANDING,
        utm_source: utm.utm_source || "",
        utm_medium: utm.utm_medium || "",
        utm_campaign: utm.utm_campaign || "",
        utm_content: utm.utm_content || ""
      };
    },
    rota: ROTA,
    origem: ORIGEM
  };
})();
