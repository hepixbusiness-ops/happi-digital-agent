/* Boutons d'achat : paiement en ligne KPAY-NOW. Si le paiement en ligne n'est pas disponible,
   le lien WhatsApp du bouton reste la solution de repli (commande manuelle). */
(function () {
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-acheter]");
    if (!a || a.dataset.enCours) return;
    e.preventDefault();
    var texte = a.textContent, repli = a.href;
    a.dataset.enCours = "1"; a.textContent = "Ouverture du paiement…";
    fetch("/api/acheter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ produit: a.dataset.acheter }) })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) { location.href = d.url; })
      .catch(function () { a.textContent = texte; delete a.dataset.enCours; window.open(repli, "_blank", "noopener"); });
  });
  if (/paiement=annule/.test(location.search)) {
    var b = document.createElement("div"); b.className = "annule";
    b.textContent = "Paiement annulé : aucun montant n'a été prélevé. Tu peux réessayer quand tu veux.";
    document.body.prepend(b);
  }
})();
