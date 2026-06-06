/* ============================================================
   ANDERS TECH — Engineering Editorial · interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- CONFIG: troque pelos dados reais ---- */
  var CONFIG = {
    whatsapp: "5554999648368",
    email: "danielanders76@gmail.com",
    waGreeting: "Olá! Vim pelo site da Anders Tech e gostaria de falar sobre gestão da qualidade / certificação."
  };

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- WhatsApp ---- */
  function waUrl(msg) { return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg || CONFIG.waGreeting); }
  $$("[data-wa]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); window.open(waUrl(), "_blank", "noopener"); });
  });

  /* ---- build the data-as-art bits ---- */
  // timeline: 18 months, rising trend, last stretch flagged red (overshoot)
  var tl = $("#timeline");
  if (tl) {
    var heights = [22,30,26,38,34,46,42,55,50,62,58,70,66,80,76,90,96,100];
    heights.forEach(function (h, i) {
      var b = document.createElement("i");
      b.dataset.h = h;
      if (i >= 13) b.classList.add("on");
      tl.appendChild(b);
    });
  }
  // dotfield: 25 x 5 grid, scatter "hot" cells
  var df = $("#dotfield");
  if (df) {
    for (var i = 0; i < 125; i++) {
      var d = document.createElement("i");
      if (Math.random() < 0.16) d.classList.add("hot");
      d.dataset.i = i;
      df.appendChild(d);
    }
  }

  /* ---- marquee: duplicate for seamless loop ---- */
  var track = $("#trustTrack");
  if (track) track.innerHTML += track.innerHTML;

  /* ---- counters ---- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count || "0");
    var divide = parseFloat(el.dataset.divide || "1");
    var suffix = el.dataset.suffix || "";
    var final = target / divide;
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(final * eased);
      el.textContent = val.toLocaleString("pt-BR") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- animate a container's data viz when it enters ---- */
  function playViz(scope) {
    $$("[data-count]", scope).forEach(function (el) { if (!el._done) { el._done = 1; animateCount(el); } });
    $$("[data-bar]", scope).forEach(function (el) { if (!el._done) { el._done = 1; setTimeout(function () { el.style.width = el.dataset.bar + "%"; }, 120); } });
    $$("#timeline i", scope).forEach(function (el, i) {
      if (el._done) return; el._done = 1;
      setTimeout(function () { el.style.height = el.dataset.h + "%"; el.style.transform = "scaleY(1)"; }, 60 * i);
    });
    $$("#dotfield i", scope).forEach(function (el, i) {
      if (el._done) return; el._done = 1;
      setTimeout(function () { el.style.transform = "rotate(45deg) scale(1)"; }, 6 * i);
    });
  }

  /* ---- reveal + viz trigger ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      playViz(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -50px 0px" });
  $$(".reveal").forEach(function (el) { io.observe(el); });

  // console / hero readout may not be .reveal-wrapped for their viz — observe explicitly
  ["#console", ".readout"].forEach(function (sel) { var n = $(sel); if (n) io.observe(n); });

  // stagger within grids
  $$(".serv-list, .cases-grid, .blog-grid, .opt").forEach(function (grid) {
    $$(":scope > .reveal", grid).forEach(function (el, i) { el.style.transitionDelay = Math.min(i * 80, 320) + "ms"; });
  });

  /* ---- nav solid + scroll progress + parallax + blueprint dark ---- */
  var nav = $("#nav"), progress = $("#progress"), blueprint = $("#blueprint"), coordBL = $("#coordBL");
  var parallax = $$("[data-parallax]");
  // mark dark sections
  var darkSel = ".hero,.trust,.diff,.contato,.footer";
  var darkRects = $$(darkSel);

  function onScroll() {
    var y = window.scrollY || 0;
    nav.classList.toggle("solid", y > 10);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    // parallax
    parallax.forEach(function (el) {
      var sp = parseFloat(el.dataset.parallax || "0.05");
      el.style.transform = "translateY(-50%) rotate(45deg) translate3d(0," + (y * sp) + "px,0)";
    });
    // blueprint over dark?
    var topY = 40, dark = false;
    for (var i = 0; i < darkRects.length; i++) {
      var r = darkRects[i].getBoundingClientRect();
      if (r.top <= topY && r.bottom > topY) { dark = true; break; }
    }
    blueprint.classList.toggle("on-dark", dark);
    blueprint.style.borderColor = dark ? "rgba(255,255,255,.16)" : "rgba(32,56,100,.14)";
    if (coordBL) coordBL.style.color = dark ? "rgba(255,255,255,.4)" : "";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---- mobile menu ---- */
  var toggle = $("#navToggle"), menu = $("#mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; });
    });
  }

  /* ---- image fallback (branded gradient if a photo fails) ---- */
  $$("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function () {
      img.style.opacity = "0";
      var p = img.parentElement;
      if (p) p.style.background = "repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 2px, transparent 2px 22px), linear-gradient(160deg,#2b4a82,#0b1730)";
    });
  });

  /* ---- toast ---- */
  var toast = $("#toast"), toastMsg = $("#toastMsg"), tt;
  function showToast(msg) { if (toastMsg) toastMsg.textContent = msg; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("show"); }, 4200); }

  /* ---- contact form -> API POST ---- */
  var form = $("#contactForm");
  if (form) {
    var submitBtn = $("button[type=submit]", form);
    var btnText = submitBtn ? submitBtn.innerHTML : "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var g = function (k) { return (d.get(k) || "").toString().trim(); };

      if (g("website")) return;

      var firstInvalid = null;
      $$("[required]", form).forEach(function (f) {
        var ok = f.value && f.value.trim();
        f.style.borderBottomColor = ok ? "" : "var(--red)";
        if (!ok && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid) { firstInvalid.focus(); showToast("Preencha os campos obrigatórios."); return; }

      submitBtn.disabled = true;
      submitBtn.innerHTML = "<span>Enviando...</span>";

      var params = new URLSearchParams(window.location.search);
      var payload = {
        nome: g("nome"), empresa: g("empresa"), email: g("email"),
        telefone: g("telefone"), interesse: g("interesse"), mensagem: g("mensagem"),
        source: "site_form",
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || ""
      };

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (result.ok) {
          showToast("Mensagem enviada! Entraremos em contato.");
          form.reset();
          setTimeout(function () {
            window.open(waUrl("Oi, sou " + payload.nome + (payload.empresa ? " da " + payload.empresa : "") + ". Acabei de preencher o formulário no site."), "_blank", "noopener");
          }, 1200);
        } else {
          throw new Error(result.data.error || "Erro");
        }
      })
      .catch(function () {
        showToast("Erro ao enviar. Tente via WhatsApp.");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnText;
      });
    });
  }
  /* ---- Plausible custom event tracking ---- */
  function track(name, props) {
    if (typeof plausible === "function") plausible(name, { props: props });
  }

  // track section views
  var sections = { "serviços": "servicos", "diferencial": "diferencial", "cases": "cases", "sobre": "sobre", "conteúdo": "conteudo", "contato": "contato" };
  var sectionIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var name = en.target.id || en.target.className;
      var mapped = sections[name];
      if (mapped && !en.target._tracked) { en.target._tracked = 1; track("scroll_section", { section: mapped }); }
    });
  }, { threshold: 0.3 });
  Object.keys(sections).forEach(function (id) { var el = document.getElementById(id); if (el) sectionIO.observe(el); });

  // track CTA clicks
  $$(".btn-red, .btn-out-light, [data-wa], .optc").forEach(function (el) {
    el.addEventListener("click", function () {
      var label = el.textContent.trim().slice(0, 40);
      var section = el.closest("section");
      track("cta_click", { label: label, section: section ? section.id || "nav" : "nav" });
    });
  });

  // track form submit
  if (form) {
    form.addEventListener("submit", function () { track("form_submit", { type: "contact" }); }, true);
  }

  /* ---- exit-intent popup ---- */
  var exitOverlay = $("#exitOverlay"), exitClose = $("#exitClose"), exitForm = $("#exitForm");
  var exitShown = localStorage.getItem("at_exit_shown");

  function showExit() {
    if (exitShown || !exitOverlay) return;
    exitShown = true;
    localStorage.setItem("at_exit_shown", "1");
    exitOverlay.classList.add("active");
    track("exit_intent_shown");
  }

  if (exitOverlay && !exitShown) {
    document.addEventListener("mouseout", function (e) {
      if (e.clientY < 5 && !exitShown) showExit();
    });
    // mobile: show after 45s if scrolled past 50%
    setTimeout(function () {
      var scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPct > 0.5) showExit();
    }, 45000);
  }

  if (exitClose) exitClose.addEventListener("click", function () { exitOverlay.classList.remove("active"); });
  if (exitOverlay) exitOverlay.addEventListener("click", function (e) { if (e.target === exitOverlay) exitOverlay.classList.remove("active"); });

  if (exitForm) {
    exitForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(exitForm);
      var g = function (k) { return (d.get(k) || "").toString().trim(); };
      if (g("website")) return;
      if (!g("nome") || !g("email")) { showToast("Preencha nome e email."); return; }

      var btn = $("button", exitForm);
      btn.disabled = true;
      btn.innerHTML = "<span>Enviando...</span>";

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: g("nome"), email: g("email"), empresa: g("empresa"),
          source: "lead_magnet_checklist", interesse: "ISO 9001 — implantação / manutenção"
        })
      })
      .then(function (res) { return res.json(); })
      .then(function () {
        showToast("Checklist enviado para o seu email!");
        exitOverlay.classList.remove("active");
        track("exit_intent_submit");
      })
      .catch(function () { showToast("Erro ao enviar. Tente via WhatsApp."); })
      .finally(function () { btn.disabled = false; btn.innerHTML = "<span>Enviar checklist</span>"; });
    });
  }
})();
