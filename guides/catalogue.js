/* Catalogue de la boutique pharel.cloud/guides.
   Tout ce qui change (prix, statut, sommaire) se modifie ICI, sans toucher au HTML.
   statut : "disponible" → bouton d'achat WhatsApp ; "bientot" → bouton « Me prévenir ».
   Ne passez un ebook en "disponible" que lorsque le PDF est prêt à être envoyé. */
/* Les données viennent de donnees.js, généré par produits.py. */
(function () {
  var B = BOUTIQUE;
  var fcfa = function (n) { return typeof n === "number" ? n.toLocaleString("fr-FR").replace(/ /g, " ") + " FCFA" : n + " FCFA"; };
  var wa = function (texte) { return "https://wa.me/" + B.whatsapp + "?text=" + encodeURIComponent(texte); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var tousDispo = B.ebooks.every(function (e) { return e.statut === "disponible"; });

  // guide gratuit
  var ch = document.getElementById("chapitres");
  if (ch) ch.innerHTML = B.guideGratuit.chapitres.map(function (t, i) { return "<li><b>" + (i + 1) + "</b>" + esc(t) + "</li>"; }).join("");
  document.querySelectorAll("[data-guide-wa]").forEach(function (a) { a.href = wa("Bonjour Pharel, je veux recevoir le guide gratuit « " + B.guideGratuit.titre + " »."); });

  // ebooks
  var grille = document.getElementById("liste-ebooks");
  if (grille) grille.innerHTML = B.ebooks.map(function (e) {
    var dispo = e.statut === "disponible";
    var lien = dispo && e.chariow ? e.chariow : dispo
      ? wa("Bonjour Pharel, je veux acheter l'ebook « " + e.titre + " » (" + fcfa(e.prix) + "). Je paie par : MTN MoMo / Orange Money (je précise).")
      : wa("Bonjour Pharel, préviens-moi à la sortie de l'ebook « " + e.titre + " ».");
    var page = e.id + ".html";
    var visuel = e.couv
      ? '<a href="' + page + '" class="couv img"><img src="' + e.couv + '" alt="Couverture : ' + esc(e.titre) + '" loading="lazy" width="683" height="1024"><i class="tranche"></i></a>'
      : '<a href="' + page + '" class="couv t-' + e.teinte + '"><span class="marque">pharel<em>.</em>cloud</span><small>Ebook</small><b>' + esc(e.titre) + '</b><i class="tranche"></i></a>';
    return '<article class="ebook" data-reveal>' + visuel +
      '<div class="ebook-corps">' +
        (dispo ? '<span class="statut ok">Disponible</span>' : '<span class="statut">Bientôt disponible</span>') +
        "<h3><a href=\"" + page + "\">" + esc(e.titre) + "</a></h3><p>" + esc(e.sous) + "</p>" +
        "<ul>" + e.sommaire.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
        '<a class="voir" href="' + page + '">Tout le contenu et pourquoi le lire →</a>' +
        '<div class="ebook-pied"><div><b>' + fcfa(e.prix) + "</b><small>PDF · " + e.pages + " pages</small></div>" +
        '<a class="btn ' + (dispo ? "btn-or" : "btn-clair") + '" href="' + lien + '" target="_blank" rel="noopener" data-direct>' + (dispo ? "Acheter" : "Me prévenir") + "</a></div>" +
      "</div></article>";
  }).join("");

  // packs : la formule recommandée est au milieu et mise en avant
  var packs = document.getElementById("liste-packs");
  if (packs) packs.innerHTML = B.packs.map(function (p) {
    var texte = tousDispo
      ? "Bonjour Pharel, je choisis « " + p.nom + " » (" + fcfa(p.prix) + "). Je paie par : MTN MoMo / Orange Money (je précise)."
      : "Bonjour Pharel, préviens-moi quand « " + p.nom + " » sera disponible.";
    return '<div class="pack' + (p.reco ? " reco" : "") + '" data-reveal>' +
      (p.reco ? '<span class="ruban">Recommandé</span>' : "") +
      "<h3>" + (p.page ? '<a href="' + p.page + '">' + esc(p.nom) + "</a>" : esc(p.nom)) + "</h3><p>" + esc(p.detail) + "</p>" +
      '<div class="pack-prix">' + (p.barre ? "<s>" + fcfa(p.barre) + "</s>" : "") + "<b>" + fcfa(p.prix) + "</b></div>" +
      (p.barre ? '<div class="eco">Tu économises ' + fcfa(p.barre - p.prix) + "</div>" : "") +
      "<ul>" + p.inclus.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
      '<a class="btn ' + (p.reco ? "btn-or" : "btn-clair") + '" href="' + (tousDispo && p.chariow ? p.chariow : wa(texte)) + '" target="_blank" rel="noopener" data-direct>' + (tousDispo ? "Choisir" : "Être prévenu") + "</a></div>";
  }).join("");

  // apparition au défilement
  var els = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("vu"); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("vu"); io.unobserve(x.target); } }); }, { threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });

  // FAQ
  document.querySelectorAll(".faq button").forEach(function (b) {
    b.addEventListener("click", function () { var o = b.parentElement.classList.toggle("ouvert"); b.setAttribute("aria-expanded", o); });
  });
})();
