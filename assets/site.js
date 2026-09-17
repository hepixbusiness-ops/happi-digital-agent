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

// Questionnaire de projet avant l'envoi WhatsApp
(function () {
  var overlay = document.getElementById('qz-overlay');
  var form = document.getElementById('qz-form');
  if (!overlay || !form) return;

  var NUMERO = '237699179254';
  var declencheur = null;
  var mode = 'site';               // 'site' (formules) ou 'creatif' (design & contenu)
  var formuleCourante = { nom: '', prix: '' };

  var champNom = document.getElementById('qz-nom');
  var labelNom = document.getElementById('qz-nom-label');
  var champAttentes = document.getElementById('qz-attentes');
  var labelAttentes = document.getElementById('qz-attentes-label');
  var champSecteur = document.getElementById('qz-secteur');
  var blocType = document.getElementById('qz-field-type');
  var blocPresta = document.getElementById('qz-field-presta');
  var blocFichiers = document.getElementById('qz-field-fichiers');

  var TEXTES = {
    site: {
      badge: 'Formule choisie',
      intro: "Quatre questions, une minute. Vos réponses partent avec votre message WhatsApp : je peux vous répondre avec un vrai devis plutôt qu'un questionnaire de plus.",
      attentes: 'Qu\'attendez-vous de ce site ?',
      placeholder: 'Ex. être trouvé sur Google, montrer mes réalisations, recevoir des commandes, arrêter de répondre aux mêmes questions sur WhatsApp...',
    },
    creatif: {
      badge: 'Design & contenu',
      intro: "Quelques questions, une minute. Vos réponses partent avec votre message WhatsApp : je peux vous chiffrer le travail sans vous rappeler pour les mêmes détails.",
      attentes: 'Décrivez votre projet',
      placeholder: 'Ex. une vidéo de 30 s pour Facebook à partir de mes photos de chantier, un logo pour ma boutique, trois affiches pour une promotion...',
    },
  };

  function valeurRadio(nom) {
    var coche = form.querySelector('input[name="' + nom + '"]:checked');
    return coche ? coche.value : '';
  }

  function prestationsCochees() {
    return Array.prototype.map.call(
      form.querySelectorAll('input[name="qz-presta"]:checked'),
      function (c) { return c.value; }
    );
  }

  function marquer(id, invalide) {
    document.getElementById(id).classList.toggle('invalid', invalide);
  }

  // La question sur les fichiers ne concerne que la vidéo
  function majBlocFichiers() {
    var presta = prestationsCochees();
    var video = presta.indexOf('Montage vidéo') !== -1 || presta.indexOf('Motion design') !== -1;
    blocFichiers.hidden = !(mode === 'creatif' && video);
  }

  function ouvrir(el) {
    declencheur = el;
    var nouveauMode = el.hasAttribute('data-creatif') ? 'creatif' : 'site';
    // La description est propre à la demande : on la vide en changeant de mode,
    // mais on la garde si la modale est simplement rouverte au même endroit.
    if (nouveauMode !== mode) champAttentes.value = '';
    mode = nouveauMode;
    var t = TEXTES[mode];

    document.getElementById('qz-formule-label').textContent = t.badge;
    document.getElementById('qz-intro').textContent = t.intro;
    labelAttentes.textContent = t.attentes;
    champAttentes.placeholder = t.placeholder;

    blocType.hidden = mode !== 'site';
    blocPresta.hidden = mode !== 'creatif';

    if (mode === 'site') {
      formuleCourante = { nom: el.dataset.formule || '', prix: el.dataset.prix || '' };
      document.getElementById('qz-formule-nom').textContent =
        formuleCourante.nom + (formuleCourante.prix ? ' · ' + formuleCourante.prix : '');
    } else {
      var presta = el.dataset.creatif;
      form.querySelectorAll('input[name="qz-presta"]').forEach(function (c) {
        c.checked = presta ? c.value === presta : false;
      });
      document.getElementById('qz-formule-nom').textContent = presta || 'Devis sur mesure';
    }
    majBlocFichiers();

    form.querySelectorAll('.qz-field').forEach(function (f) { f.classList.remove('invalid'); });

    overlay.hidden = false;
    // laisse le navigateur peindre l'état initial avant de lancer la transition
    requestAnimationFrame(function () { overlay.classList.add('open'); });
    document.body.style.overflow = 'hidden';
    setTimeout(function () { champNom.focus(); }, 80);
  }

  function fermer() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () { overlay.hidden = true; }, 300);
    if (declencheur) { declencheur.focus(); declencheur = null; }
  }

  function composerMessage() {
    var profil = valeurRadio('qz-profil');
    var lignes = ['Bonjour Pharel,', ''];

    if (mode === 'site') {
      lignes.push('Je suis intéressé(e) par la formule ' + formuleCourante.nom +
        (formuleCourante.prix ? ' (' + formuleCourante.prix + ')' : '') + '.');
    } else {
      lignes.push('Je veux un devis pour du design et du contenu visuel.');
    }
    lignes.push('');
    lignes.push((profil === 'Particulier' ? 'Particulier : ' : 'Entreprise : ') + champNom.value.trim());

    if (mode === 'site') {
      lignes.push('Type de site : ' + valeurRadio('qz-type'));
    } else {
      lignes.push('Prestations : ' + prestationsCochees().join(', '));
      if (!blocFichiers.hidden && valeurRadio('qz-fichiers')) {
        lignes.push('Fichiers : ' + valeurRadio('qz-fichiers'));
      }
    }
    if (champSecteur.value.trim()) lignes.push('Secteur : ' + champSecteur.value.trim());

    lignes.push('', mode === 'site' ? 'Mes attentes :' : 'Mon projet :', champAttentes.value.trim());
    return lignes.join('\n');
  }

  document.querySelectorAll('.card-cta[data-formule], [data-creatif]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      ouvrir(el);
    });
  });

  document.getElementById('qz-close').addEventListener('click', fermer);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) fermer(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) fermer();
  });

  // Le libellé du nom suit le profil choisi
  form.querySelectorAll('input[name="qz-profil"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      var particulier = valeurRadio('qz-profil') === 'Particulier';
      labelNom.textContent = particulier ? 'Votre nom' : "Nom de l'entreprise";
      champNom.placeholder = particulier ? 'Ex. Pharel Happi' : 'Ex. Restaurant Le Bantou';
      champNom.autocomplete = particulier ? 'name' : 'organization';
    });
  });

  [champNom, champAttentes].forEach(function (champ) {
    champ.addEventListener('input', function () {
      if (champ.value.trim()) champ.closest('.qz-field').classList.remove('invalid');
    });
  });
  form.querySelectorAll('input[name="qz-type"]').forEach(function (radio) {
    radio.addEventListener('change', function () { marquer('qz-field-type', false); });
  });
  form.querySelectorAll('input[name="qz-presta"]').forEach(function (c) {
    c.addEventListener('change', function () {
      majBlocFichiers();
      if (prestationsCochees().length) marquer('qz-field-presta', false);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var sansNom = !champNom.value.trim();
    var sansChoix = mode === 'site' ? !valeurRadio('qz-type') : !prestationsCochees().length;
    var sansAttentes = champAttentes.value.trim().length < 5;

    marquer('qz-field-nom', sansNom);
    marquer(mode === 'site' ? 'qz-field-type' : 'qz-field-presta', sansChoix);
    marquer('qz-field-attentes', sansAttentes);

    if (sansNom) { champNom.focus(); return; }
    if (sansChoix) { document.getElementById(mode === 'site' ? 'qz-type-v' : 'qz-p1').focus(); return; }
    if (sansAttentes) { champAttentes.focus(); return; }

    window.open('https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(composerMessage()), '_blank', 'noopener');
    fermer();
  });
})();
