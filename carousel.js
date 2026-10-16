// Carosello degli screenshot: schede, frecce, tastiera e scorrimento laterale (anche con il dito).
(() => {
  const strip = document.querySelector('.slides');
  if (!strip) return;
  const slides = [...strip.querySelectorAll('.slide')];
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const num = document.getElementById('slide-num');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;

  const mark = (i) => {
    current = i;
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    num.textContent = String(i + 1);
  };

  const go = (i, focusTab = false) => {
    i = (i + slides.length) % slides.length;
    strip.scrollTo({ left: slides[i].offsetLeft - strip.offsetLeft, behavior: reduce.matches ? 'auto' : 'smooth' });
    mark(i);
    if (focusTab) tabs[i].focus();
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => go(i));
    t.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (step) { e.preventDefault(); go(current + step, true); }
      if (e.key === 'Home') { e.preventDefault(); go(0, true); }
      if (e.key === 'End') { e.preventDefault(); go(slides.length - 1, true); }
    });
  });

  document.querySelectorAll('.arrow').forEach((b) =>
    b.addEventListener('click', () => go(current + Number(b.dataset.step))));

  strip.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (step) { e.preventDefault(); go(current + step); }
  });

  // scorrimento a mano: la scheda segue l'immagine più visibile
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && e.intersectionRatio > 0.6) mark(slides.indexOf(e.target));
    }
  }, { root: strip, threshold: [0.6] });
  slides.forEach((s) => seen.observe(s));
})();
