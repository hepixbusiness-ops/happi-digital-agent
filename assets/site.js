// Utilitaires partagés — Pharel Happi (site public)

var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Menu mobile
(function () {
  var toggle = document.getElementById('nav-toggle');
  var drawer = document.getElementById('nav-drawer');
  if (!toggle || !drawer) return;
  function setState(open) {
    toggle.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () {
    setState(!drawer.classList.contains('open'));
  });
  drawer.addEventListener('click', function (e) {
    if (e.target === drawer || e.target.tagName === 'A') setState(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) setState(false);
  });
})();

// Reveal au scroll (éléments simples + grilles en cascade)
(function () {
  var els = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

// Compteurs animés
(function () {
  var els = document.querySelectorAll('[data-count-to]');
  if (!els.length) return;
  function animate(el) {
    var target = parseFloat(el.getAttribute('data-count-to'));
    var suffix = el.getAttribute('data-count-suffix') || '';
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!('IntersectionObserver' in window)) {
    els.forEach(animate);
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  els.forEach(function (el) { io.observe(el); });
})();

// Accordéon FAQ
(function () {
  var items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  function close(item) {
    var answer = item.querySelector('.faq-answer');
    answer.style.maxHeight = '0px';
    item.classList.remove('open');
    item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
  }
  function open(item) {
    var answer = item.querySelector('.faq-answer');
    answer.style.maxHeight = answer.scrollHeight + 'px';
    item.classList.add('open');
    item.querySelector('.faq-question').setAttribute('aria-expanded', 'true');
  }

  items.forEach(function (item) {
    item.querySelector('.faq-question').addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      items.forEach(close);
      if (!isOpen) open(item);
    });
  });

  // Recalcule la hauteur des réponses ouvertes quand la mise en page change
  window.addEventListener('resize', function () {
    items.forEach(function (item) {
      if (item.classList.contains('open')) {
        item.querySelector('.faq-answer').style.maxHeight =
          item.querySelector('.faq-answer').scrollHeight + 'px';
      }
    });
  });
})();

// État de scroll : ombre de la nav + bouton retour en haut
(function () {
  var nav = document.querySelector('nav');
  var btn = document.getElementById('scroll-top');
  var ticking = false;

  function update() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 20);
    if (btn) btn.classList.toggle('visible', y > 400);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  update();

  if (btn) {
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }
})();
