/* Page de retour après paiement KPAY-NOW : le serveur vérifie le paiement, puis donne les liens de téléchargement. */
(function () {
  var q = new URLSearchParams(location.search);
  var reference = q.get("reference"), externalId = q.get("externalId");
  var $ = function (id) { return document.getElementById(id); };
  var montrer = function (id) { ["attente", "ok", "echec"].forEach(function (x) { $(x).hidden = x !== id; }); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  if (reference) {
    $("ref").textContent = "Ta référence : " + reference;
    $("aide").href = "https://wa.me/237699179254?text=" + encodeURIComponent("Bonjour Pharel, j'ai payé un ebook. Ma référence de paiement : " + reference);
  }
  if (!reference || !externalId) {
    $("echec-texte").textContent = "Cette page ne contient pas de référence de paiement. Si tu as payé, écris-moi sur WhatsApp.";
    return montrer("echec");
  }

  var essais = 0;
  function verifier() {
    essais++;
    fetch("/api/telechargement?reference=" + encodeURIComponent(reference) + "&externalId=" + encodeURIComponent(externalId), { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.statut === "COMPLETED") {
          $("ok-produit").textContent = d.produit;
          $("liens").innerHTML = d.fichiers.map(function (f) {
            return '<a class="btn btn-or" href="' + esc(f.url) + '">Télécharger « ' + esc(f.titre) + " »</a>";
          }).join("");
          return montrer("ok");
        }
        if (d.statut === "FAILED" || d.statut === "CANCELLED") return montrer("echec");
        // PENDING, PROCESSING ou réponse provisoire : on réessaie, espacé, pendant environ 3 minutes
        if (essais < 30) return setTimeout(verifier, 6000);
        $("attente").querySelector("p").textContent = "La confirmation prend plus de temps que prévu. Recharge cette page dans quelques minutes, ou écris-moi sur WhatsApp avec ta référence.";
      })
      .catch(function () { if (essais < 30) setTimeout(verifier, 6000); });
  }
  verifier();
})();
