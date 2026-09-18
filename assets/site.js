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

// Questionnaire de projet avant l'envoi WhatsApp.
// La modale est construite ici plutôt que dans le HTML : elle existe ainsi sur
// toutes les pages, articles de blog compris, sans duplication de balisage.
(function () {
  var NUMERO = '237699179254';

  var GABARIT = [
    '<div class="qz-overlay" id="qz-overlay" role="dialog" aria-modal="true" aria-labelledby="qz-title" hidden>',
    '<div class="qz-modal">',
    '<button type="button" class="qz-close" id="qz-close" aria-label="Fermer">',
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    '</button>',
    '<div class="qz-formule" id="qz-badge" hidden><span id="qz-badge-label"></span> <span id="qz-badge-nom"></span></div>',
    '<h2 id="qz-title">Parlez-moi de votre projet.</h2>',
    '<p class="qz-intro" id="qz-intro"></p>',
    '<form id="qz-form" novalidate>',

    '<p class="qz-group">Votre projet</p>',
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
    '</fieldset>',

    '<div class="qz-field" id="qz-field-attentes">',
    '<label for="qz-attentes" id="qz-attentes-label">Qu\'attendez-vous de ce projet ?</label>',
    '<textarea id="qz-attentes"></textarea>',
    '<p class="qz-error">Deux phrases suffisent. C\'est ce qui me permet de chiffrer juste.</p>',
    '</div>',

    '<p class="qz-group">Vous</p>',
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
    '<label for="qz-secteur">Votre secteur d\'activité <span style="text-transform:none;letter-spacing:0">(optionnel)</span></label>',
    '<input type="text" id="qz-secteur" placeholder="Ex. restauration, santé, BTP, école...">',
    '</div>',

    '<div class="qz-actions">',
    '<button type="submit" class="btn-primary">',
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    'Envoyer sur WhatsApp',
    '</button>',
    '<p class="qz-note">WhatsApp s\'ouvre avec votre message déjà rédigé. Vous le relisez avant d\'envoyer.</p>',
    '</div>',
    '</form>',
    '</div>',
    '</div>',
  ].join('');

  var hote = document.createElement('div');
  hote.innerHTML = GABARIT;
  document.body.appendChild(hote.firstChild);

  var overlay = document.getElementById('qz-overlay');
  var form = document.getElementById('qz-form');
  var champNom = document.getElementById('qz-nom');
  var labelNom = document.getElementById('qz-nom-label');
  var champAttentes = document.getElementById('qz-attentes');
  var labelAttentes = document.getElementById('qz-attentes-label');
  var champSecteur = document.getElementById('qz-secteur');
  var blocBesoin = document.getElementById('qz-field-besoin');
  var blocType = document.getElementById('qz-field-type');
  var blocPresta = document.getElementById('qz-field-presta');
  var blocFichiers = document.getElementById('qz-field-fichiers');
  var badge = document.getElementById('qz-badge');

  var declencheur = null;
  var formule = null;          // { nom, prix } quand une formule a été cliquée
  var besoinImpose = null;     // 'site' ou 'design' quand l'origine du clic le dit

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

  function prestationsCochees() {
    return Array.prototype.map.call(
      form.querySelectorAll('input[name="qz-presta"]:checked'),
      function (c) { return c.value; }
    );
  }

  function besoin() { return besoinImpose || valeurRadio('qz-besoin'); }

  function marquer(el, invalide) { el.classList.toggle('invalid', invalide); }

  // Les blocs affichés découlent du besoin exprimé
  function majBlocs() {
    var b = besoin();
    blocType.hidden = !(b === 'site' || b === 'deux');
    blocPresta.hidden = !(b === 'design' || b === 'deux');
    var presta = prestationsCochees();
    var video = presta.indexOf('Montage vidéo') !== -1 || presta.indexOf('Motion design') !== -1;
    blocFichiers.hidden = blocPresta.hidden || !video;

    labelAttentes.textContent = b === 'design' ? 'Décrivez votre projet' : 'Qu\'attendez-vous de ce projet ?';
    champAttentes.placeholder = b === 'design'
      ? 'Ex. une vidéo de 30 s pour Facebook à partir de mes photos de chantier, un logo pour ma boutique...'
      : 'Ex. être trouvé sur Google, montrer mes réalisations, recevoir des commandes, arrêter de répondre aux mêmes questions sur WhatsApp...';
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
      ? 'Vous arrivez depuis ' + PROVENANCE + '. Quelques questions et je vous réponds avec un vrai devis, pas un questionnaire de plus.'
      : 'Quelques questions, une minute. Vos réponses partent avec votre message WhatsApp : je vous réponds avec un vrai devis plutôt qu\'un questionnaire de plus.';

    majBlocs();
    form.querySelectorAll('.qz-field').forEach(function (f) { f.classList.remove('invalid'); });

    overlay.hidden = false;
    // laisse le navigateur peindre l'état initial avant de lancer la transition
    requestAnimationFrame(function () { overlay.classList.add('open'); });
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var premier = Array.prototype.filter.call(
        form.querySelectorAll('input, textarea'),
        function (el) { return el.offsetParent !== null; }
      )[0];
      (premier || champNom).focus();
    }, 80);
  }

  function fermer() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () { overlay.hidden = true; }, 300);
    if (declencheur) { declencheur.focus(); declencheur = null; }
  }

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

    if (!blocType.hidden) lignes.push('Type de site : ' + valeurRadio('qz-type'));
    if (!blocPresta.hidden) lignes.push('Prestations : ' + prestationsCochees().join(', '));
    if (!blocFichiers.hidden && valeurRadio('qz-fichiers')) lignes.push('Fichiers : ' + valeurRadio('qz-fichiers'));
    if (champSecteur.value.trim()) lignes.push('Secteur : ' + champSecteur.value.trim());
    if (PROVENANCE) lignes.push('Vu sur : ' + PROVENANCE);

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
  form.querySelectorAll('input[name="qz-type"]').forEach(function (r) {
    r.addEventListener('change', function () { marquer(blocType, false); });
  });
  form.querySelectorAll('input[name="qz-presta"]').forEach(function (c) {
    c.addEventListener('change', function () {
      majBlocs();
      if (prestationsCochees().length) marquer(blocPresta, false);
    });
  });
  [champNom, champAttentes].forEach(function (champ) {
    champ.addEventListener('input', function () {
      if (champ.value.trim()) champ.closest('.qz-field').classList.remove('invalid');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var sansBesoin = !blocBesoin.hidden && !valeurRadio('qz-besoin');
    var sansNom = !champNom.value.trim();
    var sansType = !blocType.hidden && !valeurRadio('qz-type');
    var sansPresta = !blocPresta.hidden && !prestationsCochees().length;
    var sansAttentes = champAttentes.value.trim().length < 5;

    marquer(blocBesoin, sansBesoin);
    marquer(document.getElementById('qz-field-nom'), sansNom);
    marquer(blocType, sansType);
    marquer(blocPresta, sansPresta);
    marquer(document.getElementById('qz-field-attentes'), sansAttentes);

    if (sansBesoin) { document.getElementById('qz-b-site').focus(); return; }
    if (sansType) { document.getElementById('qz-type-v').focus(); return; }
    if (sansPresta) { document.getElementById('qz-p1').focus(); return; }
    if (sansAttentes) { champAttentes.focus(); return; }
    if (sansNom) { champNom.focus(); return; }

    window.open('https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(composerMessage()), '_blank', 'noopener');
    fermer();
  });
})();
