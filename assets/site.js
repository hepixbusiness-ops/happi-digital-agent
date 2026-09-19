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

// État de scroll : nav, bouton retour en haut, barre de progression, parallaxe
(function () {
  var nav = document.querySelector('nav');
  var btn = document.getElementById('scroll-top');
  var ticking = false;

  var barre = document.createElement('div');
  barre.id = 'scroll-progress';
  document.body.appendChild(barre);

  // Le portrait suit le défilement d'une fraction de sa course.
  // Désactivé sur mobile : la place manque et le gain est nul.
  var portrait = document.querySelector('.hero .photo-frame');
  var parallaxeActive = portrait && !prefersReducedMotion && window.matchMedia('(min-width: 901px)').matches;

  function update() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 20);
    if (btn) btn.classList.toggle('visible', y > 400);

    var course = document.documentElement.scrollHeight - window.innerHeight;
    barre.style.transform = 'scaleX(' + (course > 0 ? Math.min(y / course, 1) : 0) + ')';

    if (parallaxeActive && y < window.innerHeight) {
      portrait.style.transform = 'translate3d(0,' + (y * 0.08).toFixed(1) + 'px,0)';
    }
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

// Questionnaire de projet avant l'envoi WhatsApp.
// La modale est construite ici plutôt que dans le HTML : elle existe ainsi sur
// toutes les pages, articles de blog compris, sans duplication de balisage.
(function () {
  var NUMERO = '237699179254';

  var ETAPES = ['Votre projet', 'Votre cadre', 'Vous'];

  var GABARIT = [
    '<div class="qz-overlay" id="qz-overlay" role="dialog" aria-modal="true" aria-labelledby="qz-title" hidden>',
    '<div class="qz-modal">',
    '<button type="button" class="qz-close" id="qz-close" aria-label="Fermer">',
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    '</button>',
    '<div class="qz-formule" id="qz-badge" hidden><span id="qz-badge-label"></span> <span id="qz-badge-nom"></span></div>',
    '<h2 id="qz-title">Parlez-moi de votre projet.</h2>',
    '<p class="qz-intro" id="qz-intro"></p>',

    '<ol class="qz-steps" id="qz-steps">',
    ETAPES.map(function (nom, i) {
      return '<li class="qz-step-dot" data-etape="' + (i + 1) + '">' +
             '<span class="qz-step-num">' + (i + 1) + '</span>' +
             '<span class="qz-step-nom">' + nom + '</span></li>';
    }).join(''),
    '</ol>',

    '<form id="qz-form" novalidate>',

    /* ── Étape 1 : ce qu'il veut ─────────────────────────────── */
    '<section class="qz-step" data-etape="1" aria-labelledby="qz-titre-1">',
    '<p class="qz-group" id="qz-titre-1">Votre projet</p>',

    '<fieldset class="qz-field" id="qz-field-besoin">',
    '<legend class="qz-legend">De quoi avez-vous besoin ?</legend>',
    '<div class="qz-choices">',
    '<input type="radio" name="qz-besoin" id="qz-b-site" value="site"><label for="qz-b-site">Un site web</label>',
    '<input type="radio" name="qz-besoin" id="qz-b-design" value="design"><label for="qz-b-design">Du design &amp; contenu</label>',
    '<input type="radio" name="qz-besoin" id="qz-b-deux" value="deux"><label for="qz-b-deux">Les deux</label>',
    '<input type="radio" name="qz-besoin" id="qz-b-inconnu" value="inconnu"><label for="qz-b-inconnu">Je ne sais pas encore</label>',
    '</div>',
    '<p class="qz-error">Choisissez une option, quitte à prendre « Je ne sais pas encore ».</p>',
    '</fieldset>',

    '<fieldset class="qz-field" id="qz-field-type" hidden>',
    '<legend class="qz-legend">Quel type de site voulez-vous ?</legend>',
    '<div class="qz-choices">',
    '<input type="radio" name="qz-type" id="qz-type-v" value="Site vitrine"><label for="qz-type-v">Site vitrine</label>',
    '<input type="radio" name="qz-type" id="qz-type-e" value="Boutique en ligne"><label for="qz-type-e">Boutique en ligne</label>',
    '<input type="radio" name="qz-type" id="qz-type-b" value="Vitrine + boutique"><label for="qz-type-b">Les deux</label>',
    '<input type="radio" name="qz-type" id="qz-type-i" value="À définir ensemble"><label for="qz-type-i">Je ne sais pas encore</label>',
    '</div>',
    '<p class="qz-hint">Un site vitrine présente votre activité. Une boutique vend en ligne, avec paiement MTN MoMo et Orange Money.</p>',
    '<p class="qz-error">Choisissez une option, quitte à prendre « Je ne sais pas encore ».</p>',
    '</fieldset>',

    '<fieldset class="qz-field" id="qz-field-existant" hidden>',
    '<legend class="qz-legend">Avez-vous déjà un site ?</legend>',
    '<div class="qz-choices">',
    '<input type="radio" name="qz-existant" id="qz-e1" value="Aucun site pour l\'instant"><label for="qz-e1">Non, aucun</label>',
    '<input type="radio" name="qz-existant" id="qz-e2" value="Un site existe, à refaire entièrement"><label for="qz-e2">Oui, à refaire</label>',
    '<input type="radio" name="qz-existant" id="qz-e3" value="Un site existe, à améliorer"><label for="qz-e3">Oui, à améliorer</label>',
    '<input type="radio" name="qz-existant" id="qz-e4" value="Une page Facebook ou Instagram seulement"><label for="qz-e4">Juste une page Facebook</label>',
    '</div>',
    '<p class="qz-error">Choisissez une option.</p>',
    '</fieldset>',

    '<fieldset class="qz-field" id="qz-field-options" hidden>',
    '<legend class="qz-legend">Ce que le site doit savoir faire <span class="qz-opt">(optionnel)</span></legend>',
    '<div class="qz-choices">',
    '<input type="checkbox" name="qz-options" id="qz-o1" value="Paiement en ligne (MoMo, Orange Money)"><label for="qz-o1">Paiement en ligne</label>',
    '<input type="checkbox" name="qz-options" id="qz-o2" value="Prise de rendez-vous"><label for="qz-o2">Prise de rendez-vous</label>',
    '<input type="checkbox" name="qz-options" id="qz-o3" value="Bouton WhatsApp"><label for="qz-o3">Bouton WhatsApp</label>',
    '<input type="checkbox" name="qz-options" id="qz-o4" value="Blog ou actualités"><label for="qz-o4">Blog ou actualités</label>',
    '<input type="checkbox" name="qz-options" id="qz-o5" value="Site en plusieurs langues"><label for="qz-o5">Plusieurs langues</label>',
    '<input type="checkbox" name="qz-options" id="qz-o6" value="Espace client"><label for="qz-o6">Espace client</label>',
    '</div>',
    '<p class="qz-hint">Plusieurs choix possibles. Rien de coché n\'est pas un problème, on en parlera.</p>',
    '</fieldset>',

    '<fieldset class="qz-field" id="qz-field-presta" hidden>',
    '<legend class="qz-legend">Que voulez-vous faire réaliser ?</legend>',
    '<div class="qz-choices">',
    '<input type="checkbox" name="qz-presta" id="qz-p1" value="Affiches publicitaires"><label for="qz-p1">Affiches publicitaires</label>',
    '<input type="checkbox" name="qz-presta" id="qz-p2" value="Logo &amp; identité"><label for="qz-p2">Logo &amp; identité</label>',
    '<input type="checkbox" name="qz-presta" id="qz-p3" value="Bannières"><label for="qz-p3">Bannières</label>',
    '<input type="checkbox" name="qz-presta" id="qz-p4" value="Montage vidéo"><label for="qz-p4">Montage vidéo</label>',
    '<input type="checkbox" name="qz-presta" id="qz-p5" value="Motion design"><label for="qz-p5">Motion design</label>',
    '</div>',
    '<p class="qz-hint">Plusieurs choix possibles.</p>',
    '<p class="qz-error">Cochez au moins une prestation.</p>',
    '</fieldset>',

    '<fieldset class="qz-field" id="qz-field-fichiers" hidden>',
    '<legend class="qz-legend">Avez-vous déjà les images ou les vidéos ?</legend>',
    '<div class="qz-choices">',
    '<input type="radio" name="qz-fichiers" id="qz-f1" value="Tous les fichiers sont prêts"><label for="qz-f1">Oui, tout est prêt</label>',
    '<input type="radio" name="qz-fichiers" id="qz-f2" value="Une partie des fichiers existe"><label for="qz-f2">En partie</label>',
    '<input type="radio" name="qz-fichiers" id="qz-f3" value="Rien encore, tout est à produire"><label for="qz-f3">Rien encore</label>',
    '</div>',
    '<p class="qz-hint">Cela change le délai et le prix : si les rushes existent déjà, je monte directement.</p>',
    '<p class="qz-error">Choisissez une option.</p>',
    '</fieldset>',
    '</section>',

    /* ── Étape 2 : le cadre ──────────────────────────────────── */
    '<section class="qz-step" data-etape="2" aria-labelledby="qz-titre-2" hidden>',
    '<p class="qz-group" id="qz-titre-2">Votre cadre</p>',

    '<fieldset class="qz-field" id="qz-field-echeance">',
    '<legend class="qz-legend">Quand voulez-vous démarrer ?</legend>',
    '<div class="qz-choices">',
    '<input type="radio" name="qz-echeance" id="qz-d1" value="Dès que possible"><label for="qz-d1">Dès que possible</label>',
    '<input type="radio" name="qz-echeance" id="qz-d2" value="Dans le mois"><label for="qz-d2">Dans le mois</label>',
    '<input type="radio" name="qz-echeance" id="qz-d3" value="Dans deux à trois mois"><label for="qz-d3">Dans 2 à 3 mois</label>',
    '<input type="radio" name="qz-echeance" id="qz-d4" value="Se renseigne pour le moment"><label for="qz-d4">Je me renseigne</label>',
    '</div>',
    '<p class="qz-hint">Comptez entre 7 et 15 jours de production une fois le projet lancé.</p>',
    '<p class="qz-error">Choisissez une option, quitte à prendre « Je me renseigne ».</p>',
    '</fieldset>',

    '<fieldset class="qz-field" id="qz-field-budget">',
    '<legend class="qz-legend">Quel budget avez-vous en tête ?</legend>',
    '<div class="qz-choices">',
    '<input type="radio" name="qz-budget" id="qz-g1" value="Moins de 250 000 FCFA"><label for="qz-g1">Moins de 250 000</label>',
    '<input type="radio" name="qz-budget" id="qz-g2" value="250 000 à 400 000 FCFA"><label for="qz-g2">250 à 400 000</label>',
    '<input type="radio" name="qz-budget" id="qz-g3" value="400 000 à 650 000 FCFA"><label for="qz-g3">400 à 650 000</label>',
    '<input type="radio" name="qz-budget" id="qz-g4" value="Plus de 650 000 FCFA"><label for="qz-g4">Plus de 650 000</label>',
    '<input type="radio" name="qz-budget" id="qz-g5" value="À définir ensemble"><label for="qz-g5">À définir ensemble</label>',
    '</div>',
    '<p class="qz-hint">En francs CFA. Ce n\'est pas un engagement, juste un ordre de grandeur pour vous proposer ce qui tient dedans.</p>',
    '<p class="qz-error">Choisissez une option, quitte à prendre « À définir ensemble ».</p>',
    '</fieldset>',

    '<fieldset class="qz-field" id="qz-field-identite">',
    '<legend class="qz-legend">Avez-vous un logo et des couleurs ?</legend>',
    '<div class="qz-choices">',
    '<input type="radio" name="qz-identite" id="qz-i1" value="Logo et charte graphique en place"><label for="qz-i1">Oui, tout est en place</label>',
    '<input type="radio" name="qz-identite" id="qz-i2" value="Un logo existe, à moderniser"><label for="qz-i2">Un logo, à moderniser</label>',
    '<input type="radio" name="qz-identite" id="qz-i3" value="Rien encore, identité à créer"><label for="qz-i3">Rien encore</label>',
    '</div>',
    '<p class="qz-error">Choisissez une option.</p>',
    '</fieldset>',

    '<fieldset class="qz-field" id="qz-field-domaine" hidden>',
    '<legend class="qz-legend">Avez-vous déjà un nom de domaine ?</legend>',
    '<div class="qz-choices">',
    '<input type="radio" name="qz-domaine" id="qz-n1" value="Nom de domaine déjà acheté"><label for="qz-n1">Oui</label>',
    '<input type="radio" name="qz-domaine" id="qz-n2" value="Pas de nom de domaine"><label for="qz-n2">Non</label>',
    '<input type="radio" name="qz-domaine" id="qz-n3" value="Ne sait pas s\'il a un nom de domaine"><label for="qz-n3">Je ne sais pas</label>',
    '</div>',
    '<p class="qz-hint">C\'est l\'adresse du site, par exemple monentreprise.cm. Je peux m\'en occuper.</p>',
    '<p class="qz-error">Choisissez une option, quitte à prendre « Je ne sais pas ».</p>',
    '</fieldset>',

    '<div class="qz-field" id="qz-field-attentes">',
    '<label for="qz-attentes" id="qz-attentes-label">Qu\'attendez-vous de ce projet ?</label>',
    '<textarea id="qz-attentes"></textarea>',
    '<p class="qz-error">Deux phrases suffisent. C\'est ce qui me permet de chiffrer juste.</p>',
    '</div>',
    '</section>',

    /* ── Étape 3 : qui il est ────────────────────────────────── */
    '<section class="qz-step" data-etape="3" aria-labelledby="qz-titre-3" hidden>',
    '<p class="qz-group" id="qz-titre-3">Vous</p>',

    '<fieldset class="qz-field">',
    '<legend class="qz-legend">Vous êtes</legend>',
    '<div class="qz-choices">',
    '<input type="radio" name="qz-profil" id="qz-profil-e" value="Entreprise" checked><label for="qz-profil-e">Une entreprise</label>',
    '<input type="radio" name="qz-profil" id="qz-profil-p" value="Particulier"><label for="qz-profil-p">Un particulier</label>',
    '</div>',
    '</fieldset>',

    '<div class="qz-field" id="qz-field-nom">',
    '<label for="qz-nom" id="qz-nom-label">Nom de l\'entreprise</label>',
    '<input type="text" id="qz-nom" autocomplete="organization" placeholder="Ex. Restaurant Le Bantou">',
    '<p class="qz-error">Indiquez un nom, pour que je sache à qui je réponds.</p>',
    '</div>',

    '<div class="qz-field">',
    '<label for="qz-secteur">Votre secteur d\'activité <span class="qz-opt">(optionnel)</span></label>',
    '<input type="text" id="qz-secteur" placeholder="Ex. restauration, santé, BTP, école...">',
    '</div>',

    '<div class="qz-field">',
    '<label for="qz-ville">Où êtes-vous situé ? <span class="qz-opt">(optionnel)</span></label>',
    '<input type="text" id="qz-ville" autocomplete="address-level2" placeholder="Ex. Yaoundé, Douala, Paris, Montréal...">',
    '</div>',

    '<fieldset class="qz-field">',
    '<legend class="qz-legend">Comment m\'avez-vous connu ? <span class="qz-opt">(optionnel)</span></legend>',
    '<div class="qz-choices">',
    '<input type="radio" name="qz-source" id="qz-s1" value="Google"><label for="qz-s1">Google</label>',
    '<input type="radio" name="qz-source" id="qz-s2" value="Réseaux sociaux"><label for="qz-s2">Réseaux sociaux</label>',
    '<input type="radio" name="qz-source" id="qz-s3" value="Bouche à oreille"><label for="qz-s3">Bouche à oreille</label>',
    '<input type="radio" name="qz-source" id="qz-s4" value="Autre"><label for="qz-s4">Autre</label>',
    '</div>',
    '</fieldset>',
    '</section>',

    '<div class="qz-actions">',
    '<button type="button" class="qz-back" id="qz-back" hidden>',
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" style="width:15px;height:15px"><path d="M15 18l-6-6 6-6"/></svg>',
    'Retour',
    '</button>',
    '<button type="submit" class="btn-primary" id="qz-submit">',
    '<span id="qz-submit-icone" hidden>',
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    '</span>',
    '<span id="qz-submit-texte">Continuer</span>',
    '</button>',
    '<p class="qz-note" id="qz-note"></p>',
    '</div>',
    '</form>',
    '</div>',
    '</div>',
  ].join('');

  var hote = document.createElement('div');
  hote.innerHTML = GABARIT;
  document.body.appendChild(hote.firstChild);

  var overlay = document.getElementById('qz-overlay');
  var modale = overlay.querySelector('.qz-modal');
  var form = document.getElementById('qz-form');
  var champNom = document.getElementById('qz-nom');
  var labelNom = document.getElementById('qz-nom-label');
  var champAttentes = document.getElementById('qz-attentes');
  var labelAttentes = document.getElementById('qz-attentes-label');
  var champSecteur = document.getElementById('qz-secteur');
  var champVille = document.getElementById('qz-ville');
  var blocBesoin = document.getElementById('qz-field-besoin');
  var blocType = document.getElementById('qz-field-type');
  var blocExistant = document.getElementById('qz-field-existant');
  var blocOptions = document.getElementById('qz-field-options');
  var blocPresta = document.getElementById('qz-field-presta');
  var blocFichiers = document.getElementById('qz-field-fichiers');
  var blocBudget = document.getElementById('qz-field-budget');
  var blocDomaine = document.getElementById('qz-field-domaine');
  var badge = document.getElementById('qz-badge');
  var boutonRetour = document.getElementById('qz-back');
  var texteEnvoi = document.getElementById('qz-submit-texte');
  var iconeEnvoi = document.getElementById('qz-submit-icone');
  var note = document.getElementById('qz-note');
  var sections = form.querySelectorAll('.qz-step');
  var pastilles = document.querySelectorAll('.qz-step-dot');

  var declencheur = null;
  var formule = null;          // { nom, prix } quand une formule a été cliquée
  var besoinImpose = null;     // 'site' ou 'design' quand l'origine du clic le dit
  var etape = 1;

  // D'où vient le visiteur : cette information part avec le message
  var PROVENANCE = (function () {
    var titre = document.querySelector('.article-header .article-title');
    if (titre) return 'votre article « ' + titre.textContent.trim() + ' »';
    var chemin = location.pathname;
    if (chemin.indexOf('realisations') !== -1) return 'votre page Réalisations';
    if (chemin.indexOf('/blog') !== -1) return 'votre blog';
    return '';
  })();

  function valeurRadio(nom) {
    var coche = form.querySelector('input[name="' + nom + '"]:checked');
    return coche ? coche.value : '';
  }

  function cochees(nom) {
    return Array.prototype.map.call(
      form.querySelectorAll('input[name="' + nom + '"]:checked'),
      function (c) { return c.value; }
    );
  }

  function prestationsCochees() { return cochees('qz-presta'); }
  function besoin() { return besoinImpose || valeurRadio('qz-besoin'); }
  function marquer(el, invalide) { el.classList.toggle('invalid', invalide); }

  // Les blocs affichés découlent du besoin exprimé
  function majBlocs() {
    var b = besoin();
    var siteEnJeu = b === 'site' || b === 'deux';
    blocType.hidden = !siteEnJeu;
    blocExistant.hidden = !siteEnJeu;
    blocOptions.hidden = !siteEnJeu;
    blocDomaine.hidden = !siteEnJeu;
    blocPresta.hidden = !(b === 'design' || b === 'deux');

    var presta = prestationsCochees();
    var video = presta.indexOf('Montage vidéo') !== -1 || presta.indexOf('Motion design') !== -1;
    blocFichiers.hidden = blocPresta.hidden || !video;

    // Le prix de la formule est déjà connu : redemander le budget sonnerait faux.
    blocBudget.hidden = !!formule;

    labelAttentes.textContent = b === 'design' ? 'Décrivez votre projet' : 'Qu\'attendez-vous de ce projet ?';
    champAttentes.placeholder = b === 'design'
      ? 'Ex. une vidéo de 30 s pour Facebook à partir de mes photos de chantier, un logo pour ma boutique...'
      : 'Ex. être trouvé sur Google, montrer mes réalisations, recevoir des commandes, arrêter de répondre aux mêmes questions sur WhatsApp...';
  }

  function premierVisible(section) {
    return Array.prototype.filter.call(
      section.querySelectorAll('input, textarea'),
      function (el) { return el.offsetParent !== null || el.type === 'radio' || el.type === 'checkbox'; }
    ).filter(function (el) {
      var bloc = el.closest('.qz-field');
      return !bloc || !bloc.hidden;
    })[0];
  }

  function afficherEtape(n, sens) {
    etape = n;
    Array.prototype.forEach.call(sections, function (s) {
      var active = Number(s.dataset.etape) === n;
      s.hidden = !active;
      if (active) {
        s.classList.remove('qz-avant', 'qz-arriere');
        // reflow : sans cela, réappliquer la même classe ne rejoue pas l'animation
        void s.offsetWidth;
        s.classList.add(sens === 'arriere' ? 'qz-arriere' : 'qz-avant');
      }
    });
    Array.prototype.forEach.call(pastilles, function (p) {
      var i = Number(p.dataset.etape);
      p.classList.toggle('is-active', i === n);
      p.classList.toggle('is-done', i < n);
    });

    boutonRetour.hidden = n === 1;
    var derniere = n === ETAPES.length;
    texteEnvoi.textContent = derniere ? 'Envoyer sur WhatsApp' : 'Continuer';
    iconeEnvoi.hidden = !derniere;
    document.getElementById('qz-submit').classList.toggle('qz-vert', derniere);
    note.textContent = derniere
      ? 'WhatsApp s\'ouvre avec votre message déjà rédigé. Vous le relisez avant d\'envoyer.'
      : 'Étape ' + n + ' sur ' + ETAPES.length + ' · ' + ETAPES[n - 1];

    modale.scrollTop = 0;
    var cible = premierVisible(sections[n - 1]);
    if (cible) setTimeout(function () { cible.focus(); }, 60);
  }

  /* Renvoie le premier champ en défaut de l'étape, ou null si elle est complète. */
  function defaut(n) {
    if (n === 1) {
      if (!blocBesoin.hidden && !valeurRadio('qz-besoin')) return [blocBesoin, 'qz-b-site'];
      if (!blocType.hidden && !valeurRadio('qz-type')) return [blocType, 'qz-type-v'];
      if (!blocExistant.hidden && !valeurRadio('qz-existant')) return [blocExistant, 'qz-e1'];
      if (!blocPresta.hidden && !prestationsCochees().length) return [blocPresta, 'qz-p1'];
      if (!blocFichiers.hidden && !valeurRadio('qz-fichiers')) return [blocFichiers, 'qz-f1'];
      return null;
    }
    if (n === 2) {
      if (!valeurRadio('qz-echeance')) return [document.getElementById('qz-field-echeance'), 'qz-d1'];
      if (!blocBudget.hidden && !valeurRadio('qz-budget')) return [blocBudget, 'qz-g1'];
      if (!valeurRadio('qz-identite')) return [document.getElementById('qz-field-identite'), 'qz-i1'];
      if (!blocDomaine.hidden && !valeurRadio('qz-domaine')) return [blocDomaine, 'qz-n1'];
      if (champAttentes.value.trim().length < 5) return [document.getElementById('qz-field-attentes'), 'qz-attentes'];
      return null;
    }
    if (!champNom.value.trim()) return [document.getElementById('qz-field-nom'), 'qz-nom'];
    return null;
  }

  function valider(n) {
    var manque = defaut(n);
    Array.prototype.forEach.call(sections[n - 1].querySelectorAll('.qz-field'), function (f) {
      marquer(f, false);
    });
    if (!manque) return true;
    marquer(manque[0], true);
    document.getElementById(manque[1]).focus();
    return false;
  }

  function ouvrir(el) {
    declencheur = el;
    formule = el.dataset.formule ? { nom: el.dataset.formule, prix: el.dataset.prix || '' } : null;
    besoinImpose = formule ? 'site' : (el.hasAttribute('data-creatif') ? 'design' : null);

    blocBesoin.hidden = !!besoinImpose;
    if (!besoinImpose) form.querySelectorAll('input[name="qz-besoin"]').forEach(function (r) { r.checked = false; });

    if (formule) {
      badge.hidden = false;
      document.getElementById('qz-badge-label').textContent = 'Formule choisie';
      document.getElementById('qz-badge-nom').textContent =
        formule.nom + (formule.prix ? ' · ' + formule.prix : '');
    } else if (besoinImpose === 'design') {
      var presta = el.dataset.creatif;
      form.querySelectorAll('input[name="qz-presta"]').forEach(function (c) {
        c.checked = presta ? c.value === presta : false;
      });
      badge.hidden = false;
      document.getElementById('qz-badge-label').textContent = 'Design & contenu';
      document.getElementById('qz-badge-nom').textContent = presta || 'Devis sur mesure';
    } else {
      badge.hidden = true;
    }

    document.getElementById('qz-intro').textContent = PROVENANCE
      ? 'Vous arrivez depuis ' + PROVENANCE + '. Trois étapes courtes, et je vous réponds avec un vrai devis plutôt qu\'un questionnaire de plus.'
      : 'Trois étapes courtes, une minute. Vos réponses partent avec votre message WhatsApp : je vous réponds avec un vrai devis plutôt qu\'un questionnaire de plus.';

    majBlocs();
    form.querySelectorAll('.qz-field').forEach(function (f) { f.classList.remove('invalid'); });

    overlay.hidden = false;
    // laisse le navigateur peindre l'état initial avant de lancer la transition
    requestAnimationFrame(function () { overlay.classList.add('open'); });
    document.body.style.overflow = 'hidden';
    afficherEtape(1, 'avant');
  }

  function fermer() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () { overlay.hidden = true; }, 300);
    if (declencheur) { declencheur.focus(); declencheur = null; }
  }

  function ligne(etiquette, valeur) { return valeur ? etiquette + ' : ' + valeur : ''; }

  function composerMessage() {
    var b = besoin();
    var lignes = ['Bonjour Pharel,', ''];

    if (formule) {
      lignes.push('Je suis intéressé(e) par la formule ' + formule.nom +
        (formule.prix ? ' (' + formule.prix + ')' : '') + '.');
    } else if (b === 'site') {
      lignes.push('Je veux un site web.');
    } else if (b === 'design') {
      lignes.push('Je veux un devis pour du design et du contenu visuel.');
    } else if (b === 'deux') {
      lignes.push('Je veux un site web, et du design et du contenu visuel.');
    } else {
      lignes.push('J\'aimerais discuter d\'un projet avec vous.');
    }

    lignes.push('');
    lignes.push((valeurRadio('qz-profil') === 'Particulier' ? 'Particulier : ' : 'Entreprise : ') + champNom.value.trim());

    [
      champSecteur.value.trim() ? ligne('Secteur', champSecteur.value.trim()) : '',
      champVille.value.trim() ? ligne('Situé à', champVille.value.trim()) : '',
      blocType.hidden ? '' : ligne('Type de site', valeurRadio('qz-type')),
      blocExistant.hidden ? '' : ligne('Site actuel', valeurRadio('qz-existant')),
      blocOptions.hidden || !cochees('qz-options').length ? '' : ligne('Fonctions voulues', cochees('qz-options').join(', ')),
      blocDomaine.hidden ? '' : ligne('Nom de domaine', valeurRadio('qz-domaine')),
      blocPresta.hidden ? '' : ligne('Prestations', prestationsCochees().join(', ')),
      blocFichiers.hidden ? '' : ligne('Fichiers', valeurRadio('qz-fichiers')),
      ligne('Identité visuelle', valeurRadio('qz-identite')),
      ligne('Démarrage', valeurRadio('qz-echeance')),
      blocBudget.hidden ? '' : ligne('Budget', valeurRadio('qz-budget')),
      PROVENANCE ? ligne('Vu sur', PROVENANCE) : '',
      ligne('Connu par', valeurRadio('qz-source'))
    ].forEach(function (l) { if (l) lignes.push(l); });

    lignes.push('', b === 'design' ? 'Mon projet :' : 'Mes attentes :', champAttentes.value.trim());
    return lignes.join('\n');
  }

  // Tout lien WhatsApp du site passe par le questionnaire
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (lien) {
    lien.addEventListener('click', function (e) {
      e.preventDefault();
      ouvrir(lien);
    });
  });
  document.querySelectorAll('button[data-creatif]').forEach(function (bouton) {
    bouton.addEventListener('click', function () { ouvrir(bouton); });
  });

  document.getElementById('qz-close').addEventListener('click', fermer);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) fermer(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) fermer();
  });

  boutonRetour.addEventListener('click', function () {
    if (etape > 1) afficherEtape(etape - 1, 'arriere');
  });

  form.querySelectorAll('input[name="qz-besoin"]').forEach(function (r) {
    r.addEventListener('change', function () { marquer(blocBesoin, false); majBlocs(); });
  });
  form.querySelectorAll('input[name="qz-profil"]').forEach(function (r) {
    r.addEventListener('change', function () {
      var particulier = valeurRadio('qz-profil') === 'Particulier';
      labelNom.textContent = particulier ? 'Votre nom' : 'Nom de l\'entreprise';
      champNom.placeholder = particulier ? 'Ex. Pharel Happi' : 'Ex. Restaurant Le Bantou';
      champNom.autocomplete = particulier ? 'name' : 'organization';
    });
  });
  form.querySelectorAll('input[name="qz-presta"]').forEach(function (c) {
    c.addEventListener('change', function () {
      majBlocs();
      if (prestationsCochees().length) marquer(blocPresta, false);
    });
  });
  // Une réponse donnée efface son propre signalement d'erreur
  ['qz-type', 'qz-existant', 'qz-fichiers', 'qz-echeance', 'qz-budget', 'qz-identite', 'qz-domaine']
    .forEach(function (nom) {
      form.querySelectorAll('input[name="' + nom + '"]').forEach(function (r) {
        r.addEventListener('change', function () { marquer(r.closest('.qz-field'), false); });
      });
    });
  [champNom, champAttentes].forEach(function (champ) {
    champ.addEventListener('input', function () {
      if (champ.value.trim()) champ.closest('.qz-field').classList.remove('invalid');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!valider(etape)) return;
    if (etape < ETAPES.length) { afficherEtape(etape + 1, 'avant'); return; }

    window.open('https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(composerMessage()), '_blank', 'noopener');
    fermer();
  });
})();
