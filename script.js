document.addEventListener('DOMContentLoaded', () => {

  /* ── Nav scroll state ── */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ── */
  const burger = document.querySelector('.nav__burger');
  const menu = document.querySelector('.nav__links');
  if (burger) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        menu.classList.remove('open');
      })
    );
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = nav.offsetHeight + 16;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  /* ── Intersection Observer — reveal on scroll ── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.delay) || 0;
          setTimeout(() => el.classList.add('visible'), delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(el => observer.observe(el));
  }

  /* ── Counter animation ── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const ease = t => 1 - Math.pow(1 - t, 3);
    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = Number(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const duration = 2200;
          const start = performance.now();
          const tick = now => {
            const t = Math.min((now - start) / duration, 1);
            el.textContent = Math.round(ease(t) * target) + suffix;
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(el => counterObserver.observe(el));
  }

  /* ── Card hover tilt (desktop only) ── */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card--tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ── Contact form ── */
  const form = document.getElementById('contactForm');
  if (form) {
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      btn.disabled = true;
      btn.textContent = 'Enviando...';

      const data = Object.fromEntries(new FormData(form));

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          btn.textContent = 'Enviado!';
          btn.classList.add('btn--success');
          form.reset();
          setTimeout(() => {
            window.open(
              `https://wa.me/5554999648368?text=${encodeURIComponent(
                `Oi, sou ${data.nome}${data.empresa ? ` da ${data.empresa}` : ''}. Acabei de preencher o formulário no site.`
              )}`,
              '_blank'
            );
          }, 800);
        } else {
          throw new Error();
        }
      } catch {
        btn.textContent = 'Erro. Tente via WhatsApp.';
        btn.classList.add('btn--error');
      }

      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = originalText;
        btn.classList.remove('btn--success', 'btn--error');
      }, 4000);
    });
  }

  /* ── Scroll indicator fade ── */
  const scrollHint = document.querySelector('.hero__scroll');
  if (scrollHint) {
    window.addEventListener('scroll', () => {
      scrollHint.style.opacity = Math.max(0, 1 - window.scrollY / 300);
    }, { passive: true });
  }

});
