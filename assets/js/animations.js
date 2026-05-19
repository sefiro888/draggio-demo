/* =============================================
   D'Raggio Estilistas — Animaciones globales
   ============================================= */

(function () {
  'use strict';

  /* ── 1. CSS dinámico ─────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* Barra de progreso superior */
    #draggio-progress {
      position: fixed; top: 0; left: 0; height: 2px; width: 0%;
      background: linear-gradient(90deg, #c8a96e, #e8c990, #c8a96e);
      background-size: 200% 100%;
      z-index: 2001; pointer-events: none;
      transition: width 0.12s linear;
      animation: progressShimmer 2.5s linear infinite;
    }
    @keyframes progressShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Cursor glow */
    #draggio-cursor-glow {
      position: fixed; pointer-events: none; z-index: 9990;
      width: 340px; height: 340px; border-radius: 50%;
      background: radial-gradient(circle, rgba(200,169,110,0.07) 0%, transparent 68%);
      transform: translate(-50%, -50%);
      transition: left 0.18s ease, top 0.18s ease;
      will-change: left, top;
    }

    /* Destellos al clic */
    .draggio-spark {
      position: fixed; pointer-events: none; z-index: 9999;
      border-radius: 50%; background: #c8a96e;
      transform: translate(-50%, -50%) scale(1);
      animation: sparkFly 0.55s ease forwards;
    }
    @keyframes sparkFly {
      0%   { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0;   transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.1); }
    }

    /* Scroll reveal */
    .draggio-reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1),
                  transform 0.65s cubic-bezier(0.16,1,0.3,1);
      transition-delay: var(--reveal-delay, 0ms);
    }
    .draggio-reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* Lift sutil en tarjetas */
    .review-card, .llegar-card, .channel-card, .service-card {
      transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease !important;
    }
    .review-card:hover, .llegar-card:hover, .service-card:hover {
      transform: translateY(-6px) !important;
    }
  `;
  document.head.appendChild(style);


  /* ── 2. Barra de progreso de scroll ─────── */
  const bar = document.createElement('div');
  bar.id = 'draggio-progress';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrolled  = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = maxScroll > 0 ? `${(scrolled / maxScroll) * 100}%` : '0%';
  }, { passive: true });


  /* ── 3. Cursor glow (solo desktop con ratón) */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.id = 'draggio-cursor-glow';
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, { passive: true });
  }


  /* ── 4. Destellos dorados al hacer clic ─── */
  document.addEventListener('click', (e) => {
    const count = 7;
    for (let i = 0; i < count; i++) {
      const s    = document.createElement('span');
      const size = 4 + Math.random() * 5;
      const angle = (360 / count) * i + Math.random() * 30;
      const dist  = 20 + Math.random() * 28;
      const rad   = angle * Math.PI / 180;

      s.className = 'draggio-spark';
      s.style.cssText = `
        left: ${e.clientX}px;
        top:  ${e.clientY}px;
        width: ${size}px;
        height: ${size}px;
        --tx: ${Math.cos(rad) * dist}px;
        --ty: ${Math.sin(rad) * dist}px;
        animation-duration: ${0.4 + Math.random() * 0.25}s;
        animation-delay: ${i * 18}ms;
      `;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  });


  /* ── 5. Scroll reveal con IntersectionObserver */
  const REVEAL_SELECTORS = [
    '.section-title', '.section-label', '.page-eyebrow',
    '.review-card', '.g-item',
    '.channel-card', '.contact-item', '.map-info-item',
    '.llegar-card', '.gallery-subhead',
    '.service-card', '.service-item', '.service-feature',
    '.footer-col', '.footer-brand',
    '.cta-band h2', '.cta-band p',
    '.hero-badge', '.trust-item',
    '.reel-caption'
  ].join(', ');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll(REVEAL_SELECTORS).forEach((el) => {
    /* Calcular delay basado en posición entre hermanos */
    let idx = 0;
    const parent = el.parentElement;
    if (parent) {
      const siblings = parent.querySelectorAll(':scope > *');
      siblings.forEach((sib, i) => { if (sib === el) idx = i; });
    }
    el.style.setProperty('--reveal-delay', `${Math.min(idx * 75, 350)}ms`);
    el.classList.add('draggio-reveal');
    revealObserver.observe(el);
  });


  /* ── 6. Contador animado para la nota 5,0 ── */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseFloat(el.dataset.countTarget);
      const isInt  = Number.isInteger(target);
      const dur    = 1400;
      const start  = performance.now();

      const tick = (now) => {
        const p    = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = isInt
          ? Math.round(target * ease)
          : (target * ease).toFixed(1).replace('.', ',');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.rating-big').forEach(el => {
    const raw = parseFloat(el.textContent.replace(',', '.'));
    if (!isNaN(raw)) {
      el.dataset.countTarget = raw;
      el.textContent = '0,0';
      counterObserver.observe(el);
    }
  });

})();
