(() => {
  'use strict';

  const header = document.querySelector('.hdr');
  const bar = document.querySelector('.bar');
  const hero = document.querySelector('.hero');
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('menu');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Шапка и нижняя панель записи -----------------------------------
  // Порог кэшируем и обновляем на resize; scroll обрабатываем раз в кадр.
  let heroThreshold = 0;
  let ticking = false;

  const measure = () => { heroThreshold = hero.offsetHeight * 0.6; };

  const updateUI = () => {
    const y = window.scrollY;
    const showBar = y > heroThreshold;
    header.classList.toggle('is-solid', y > 40);
    bar.classList.toggle('is-visible', showBar);
    bar.inert = !showBar; // скрытая панель не попадает в Tab-порядок
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateUI);
  };

  measure();
  updateUI();
  window.addEventListener('resize', () => { measure(); updateUI(); }, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Мобильное меню ---------------------------------------------------
  const setMenu = (open) => {
    header.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };

  burger.addEventListener('click', () => {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });

  // При переходе на десктоп закрываем мобильное меню
  matchMedia('(min-width: 761px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  // --- Счётчики: набираются один раз, когда попадают в экран -------------
  // Без JS или при «уменьшить движение» остаются итоговые значения из HTML.
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const fmt = new Intl.NumberFormat('ru-RU');

  const animate = (el) => {
    const end = Number(el.dataset.count);
    const suffix = el.dataset.sfx ?? '';
    const start = performance.now();

    const step = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      const eased = 1 - (1 - p) ** 3;
      el.textContent = fmt.format(Math.round(end * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      animate(entry.target);
    }
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-count]').forEach((el) => {
    el.textContent = '0' + (el.dataset.sfx ?? '');
    io.observe(el);
  });
})();
