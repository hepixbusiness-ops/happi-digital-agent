/* Pages produit : apparition au défilement, FAQ, auto-diagnostic, barre d'achat mobile. */
(function () {
  var els = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("vu"); io.unobserve(x.target); } }); }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  } else els.forEach(function (e) { e.classList.add("vu"); });

  document.querySelectorAll(".faq button").forEach(function (b) {
    b.addEventListener("click", function () { var o = b.parentElement.classList.toggle("ouvert"); b.setAttribute("aria-expanded", o); });
  });

  // le lecteur constate lui-même ce qui lui manque
  var d = document.querySelector(".pp-diag");
  if (d) {
    var total = +d.dataset.total, score = d.querySelector(".pp-score b"), verdict = d.querySelector(".pp-verdict");
    var maj = function () {
      var n = d.querySelectorAll("input:checked").length;
      score.textContent = n;
      verdict.textContent = n === 0 ? "Coche les phrases qui te ressemblent."
        : n <= 2 ? "Quelques points à corriger : les chapitres concernés te feront gagner du temps."
        : "Cet ebook a été écrit pour ta situation : chaque point coché a son chapitre.";
      d.classList.toggle("fort", n >= 3);
    };
    d.addEventListener("change", maj);
  }

  // barre d'achat : visible une fois le haut de page dépassé
  var barre = document.querySelector(".pp-barre"), hero = document.querySelector(".pp-hero");
  if (barre && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { barre.classList.toggle("visible", !es[0].isIntersecting); }).observe(hero);
  }
})();
