// Génère une maquette statique par fichier entreprises/<slug>.json dans dist/<slug>/,
// sur la base du modèle Kaeso (template/). Aucune dépendance : Node 18+ suffit.
// Usage : node scripts/build-all.mjs            (toutes)
//         node scripts/build-all.mjs alsi-sarl  (une seule)
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const racine = path.resolve(import.meta.dirname, "..");
const tpl = (f) => readFileSync(path.join(racine, "template", f), "utf8");
const CSS = tpl("style.css");
const ICONES = tpl("icons.svg");
const JS = tpl("script.js");

// ---------------------------------------------------------------- utilitaires
const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// Chemins absolus (/maquettes/<slug>/img/…) : la page s'affiche correctement même
// ouverte sans « / » final, quel que soit l'hébergeur.
let BASE = "";
// Un numéro désigne une photo du modèle (template/img/NN.webp) ; un nom de fichier
// désigne une photo propre à l'entreprise (entreprises/<slug>/img/…).
const img = (n) => (typeof n === "string" ? `${BASE}img/${n}` : `${BASE}img/${String(n).padStart(2, "0")}.webp`);
const num = (tel) => tel.replace(/\D/g, "");
const wa = (e, texte) => `https://wa.me/${num(e.telephone)}${texte ? `?text=${encodeURIComponent(texte)}` : ""}`;
const pad = (i) => String(i + 1).padStart(2, "0");
const ico = (id) => `<svg><use href="#i-${id}"/></svg>`;
const checks = (items) => `<ul class="checks">${items.map((t) => `<li>${ico("check")}${esc(t)}</li>`).join("")}</ul>`;
const badgeIllus = (e) => (e.maquette ? `<span class="illus">Photo d'illustration</span>` : "");

// Libellés de navigation : une section absente disparaît du menu.
function liens(e) {
  return [
    ["accueil", "Accueil"],
    ["services", "Services"],
    e.cleEnMain && ["cle-en-main", e.cleEnMain.nav || "Clé en main"],
    ["realisations", "Réalisations"],
    ["a-propos", "À propos"],
    ["contact", "Contact"],
  ].filter(Boolean);
}

// ------------------------------------------------------------------ sections
const logo = (e) => `<a class="logo" href="#accueil" aria-label="${esc(e.nom)}, accueil"><i></i>${esc(e.logo[0])}${e.logo[1] ? ` <small>${esc(e.logo[1])}</small>` : ""}</a>`;

function entete(e) {
  const nav = liens(e).map(([id, l]) => `<a href="#${id}">${esc(l)}</a>`).join("");
  return `<header class="hdr" id="hdr">
  <div class="hdr-in">
    ${logo(e)}
    <nav class="nav" aria-label="Navigation principale">${nav}</nav>
    <div class="hdr-cta">
      <a class="tel" href="${wa(e)}">${ico("wa")}${esc(e.telephone)}</a>
      <a class="btn btn-accent btn-sm" href="#contact">Demander un devis</a>
      <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="menu">${ico("menu")}</button>
    </div>
  </div>
</header>
<nav class="menu" id="menu" aria-label="Menu mobile">
  ${nav}
  <a class="btn btn-accent" href="#contact">Demander un devis</a>
  <a class="btn btn-line" href="${wa(e)}">${ico("wa")}WhatsApp ${esc(e.telephone)}</a>
</nav>`;
}

function hero(e) {
  const h = e.hero;
  const stats = e.stats?.length
    ? `<dl class="stats">${e.stats.map((s) => `<div><dt>${esc(s.valeur)}</dt><dd>${esc(s.label)}</dd></div>`).join("")}</dl>`
    : "";
  return `<section class="hero on-photo" id="accueil" aria-labelledby="h1">
  <div class="hero-img"><img src="${img(h.image)}" alt="${esc(h.alt)}" width="1440" height="1080" fetchpriority="high"></div>
  <div class="hero-copy">
    <p class="eyebrow">${esc(h.eyebrow)}</p>
    <h1 id="h1">${h.titre.map((l) => `<span>${esc(l)}</span>`).join("")}<span class="sr-only"> ${esc(e.nom)}, ${esc(e.activite)} à ${esc(e.ville)}</span></h1>
    <p class="lede">${esc(h.lede)}</p>
    <div class="actions"><a class="btn btn-accent" href="#contact">${esc(h.cta || "Demander un devis")}</a><a class="btn btn-line" href="#realisations">Voir nos réalisations</a></div>
  </div>
  ${stats}
</section>`;
}

function garanties(e) {
  if (!e.garanties?.length) return "";
  const li = (t, dup) => `<li${dup ? ' class="dup" aria-hidden="true"' : ""}>${ico("shield")}${esc(t)}</li>`;
  return `<div class="trust" aria-label="Nos engagements">
  <ul>${e.garanties.map((t) => li(t)).join("")}${e.garanties.map((t) => li(t, true)).join("")}</ul>
</div>`;
}

// Le « chantier en accéléré » : 11 photos fixes du modèle, 6 chapitres de texte.
const CHANTIER_ALTS = [
  "Terrain préparé, implantation de la maison au cordeau",
  "Fouilles des fondations creusées à la pelle mécanique",
  "Semelles de fondation en béton armé coulées",
  "Murs du rez-de-chaussée en parpaings en cours d'élévation",
  "Coffrage et ferraillage de la dalle du rez-de-chaussée",
  "Dalle coulée et murs de l'étage en construction",
  "Structure brute de la maison terminée",
  "Enduits posés sur toute la façade",
  "Façade peinte et menuiseries posées, cour en cours d'aménagement",
  "Maison livrée avec portail, jardin et piscine au coucher du soleil",
  "Séjour double hauteur de la maison livrée, vue sur la piscine",
];
function chantier(e) {
  if (!e.chantier) return "";
  const c = e.chantier;
  const plages = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 10]];
  const chap = c.etapes
    .map((s, i) => {
      const T = i === 0 ? "h2" : "h3";
      return `<div class="tl-ch" data-side="${i % 2 ? "r" : "l"}" data-a="${plages[i][0]}" data-b="${plages[i][1]}">
        <span class="tl-n" aria-hidden="true">${pad(i)}<small>/06</small></span>
        <p class="eyebrow">${esc(s.eyebrow)}</p>
        <${T}${i === 0 ? ' id="tl-title"' : ""}>${esc(s.titre)}</${T}>
        <p>${esc(s.texte)}</p>${i === 0 ? `\n        <p class="hint"><i></i>Faites défiler : 34 semaines de chantier</p>` : ""}${i === 5 ? `\n        <div class="actions"><a class="btn btn-accent" href="#contact">Demander un devis</a></div>` : ""}
      </div>`;
    })
    .join("\n      ");
  return `<section class="tl" id="chantier" aria-labelledby="tl-title">
  <div class="tl-stage">
    <div class="tl-media" id="tlMedia">
      ${CHANTIER_ALTS.map((a, i) => `<img src="${img(i + 1)}" alt="${esc(a)}" width="1440" height="1080">`).join("\n      ")}
    </div>
    ${e.maquette ? `<span class="illus illus-tl">Photos d'illustration</span>` : ""}
    <div class="scrim scrim-l" id="scrimL" aria-hidden="true"></div><div class="scrim scrim-r" id="scrimR" aria-hidden="true"></div>
    <div class="tl-copy" id="tlCopy">
      ${chap}
    </div>
    <div class="tl-hud">
      <div class="week" aria-hidden="true"><span>Semaine de chantier</span><b id="week">1</b></div>
      <ol class="rail" id="rail" aria-label="Étapes du chantier"></ol>
    </div>
  </div>
</section>`;
}

function services(e) {
  const s = e.services;
  return `<section class="sec light" id="services" aria-labelledby="svc-title">
  <div class="wrap split">
    <div class="split-head">
      <p class="eyebrow">Ce que nous faisons</p>
      <h2 id="svc-title">${esc(s.titre)}</h2>
      <p class="lede">${esc(s.lede)}</p>
    </div>
    <div>
      <ol class="svc">
        ${s.liste.map((x, i) => `<li tabindex="0"><span class="n">${pad(i)}</span><div><h3>${esc(x.titre)}</h3><p>${esc(x.texte)}</p></div><figure><img src="${img(x.image)}" alt="" loading="lazy"></figure></li>`).join("\n        ")}
      </ol>
      <p class="svc-more"><a class="link" href="#contact">Parler de votre projet${ico("arrow")}</a></p>
    </div>
  </div>
</section>`;
}

function cleEnMain(e) {
  const c = e.cleEnMain;
  if (!c) return "";
  return `<section class="sec dark" id="cle-en-main" aria-labelledby="ck-title" style="padding-left:0;padding-right:0">
  <div class="turnkey">
    <div class="turnkey-img"><img src="${img(c.image)}" alt="${esc(c.alt)}" loading="lazy">${badgeIllus(e)}</div>
    <div class="turnkey-card">
      <p class="eyebrow">${esc(c.eyebrow)}</p>
      <h2 id="ck-title">${esc(c.titre)}</h2>
      <p class="lede">${esc(c.lede)}</p>
      ${checks(c.points)}
      <div class="actions"><a class="btn btn-accent" href="#contact">${esc(c.cta || "Demander un devis")}</a></div>
    </div>
  </div>
</section>`;
}

function processus(e) {
  const p = e.processus;
  return `<section class="sec light" id="processus" aria-labelledby="pr-title">
  <div class="wrap">
    <p class="eyebrow">Comment ça se passe</p>
    <h2 id="pr-title">${esc(p.titre)}</h2>
    <ol class="steps" id="steps">
      ${p.etapes.map((s, i) => `<li><span class="n">${pad(i)}</span><h3>${esc(s.titre)}</h3><p>${esc(s.texte)}</p></li>`).join("\n      ")}
    </ol>
  </div>
</section>`;
}

function modeles(e) {
  const m = e.modeles;
  if (!m) return "";
  const carte = (x, i) => `<a class="model${i === 0 ? " feat" : ""}" href="#contact">
        <div class="ph"><img src="${img(x.image)}" alt="${esc(x.alt)}" loading="lazy">${x.tag ? `<span class="tag">${esc(x.tag)}</span>` : ""}</div>
        <div class="body"><h3>${esc(x.titre)}</h3><p class="spec">${esc(x.spec)}</p><p class="price">${esc(x.prefixe ?? "À partir de")}<b>${esc(x.prix)}</b>${x.delai ? esc(x.delai) : ""}</p>${i === 0 ? `<span class="btn btn-accent">${esc(x.cta ?? "Voir le modèle")}${ico("arrow")}</span>` : ""}</div>
      </a>`;
  return `<section class="sec dark" id="modeles" aria-labelledby="md-title">
  <div class="wrap">
    <p class="eyebrow">${esc(m.eyebrow ?? "Nos modèles")}</p>
    <h2 id="md-title">${esc(m.titre)}</h2>
    <p class="lede">${esc(m.lede)}</p>
    <div class="models">
      ${m.liste.map(carte).join("\n      ")}
    </div>
    <p class="fine">${esc(m.note)}</p>
  </div>
</section>`;
}

function realisations(e) {
  const r = e.realisations;
  const cls = ["big", "", "", "wide"];
  const avantApres = r.avantApres
    ? `<div class="ba" id="ba">
      <img src="${img(1)}" alt="Avant : terrain nu en début de chantier" loading="lazy">
      <img class="after" src="${img(10)}" alt="Après : la même parcelle avec la maison livrée" loading="lazy">
      <span class="lbl l">Semaine 1</span><span class="lbl r">Semaine 34</span>
      <span class="bar"></span>
      <input type="range" min="0" max="100" value="50" aria-label="Comparer avant et après : déplacer le curseur">
      <span class="knob">${ico("lr")}</span>${badgeIllus(e)}
    </div>`
    : "";
  return `<section class="sec light" id="realisations" aria-labelledby="re-title">
  <div class="wrap">
    <p class="eyebrow">Réalisations</p>
    <h2 id="re-title">${esc(r.titre)}</h2>
    ${r.lede ? `<p class="lede re-lede">${esc(r.lede)}</p>` : ""}
    ${avantApres}
    <div class="mosaic">
      ${r.liste
        .map(
          (x, i) =>
            `<figure${cls[i] ? ` class="${cls[i]}"` : ""} tabindex="0"><img src="${img(x.image)}" alt="${esc(x.alt)}" loading="lazy">${badgeIllus(e)}<figcaption><b>${esc(x.titre)}</b><span>${esc(x.detail)}</span></figcaption></figure>`,
        )
        .join("\n      ")}
    </div>
  </div>
</section>`;
}

function diaspora(e) {
  const d = e.diaspora;
  if (!d) return "";
  return `<section class="sec dark" id="diaspora" aria-labelledby="di-title">
  <div class="wrap two">
    <div>
      <p class="eyebrow">Vous vivez à l'étranger ?</p>
      <h2 id="di-title">${esc(d.titre)}</h2>
      <p class="lede">${esc(d.lede)}</p>
      ${checks(d.points)}
      <div class="actions"><a class="btn btn-accent" href="${wa(e, "Bonjour, je souhaite planifier un appel vidéo pour mon projet de construction.")}">Planifier un appel vidéo</a></div>
    </div>
    <div class="photo"><img src="${img(4)}" alt="Maçons en train d'élever les murs d'une maison" loading="lazy" style="object-position:62% 50%">${badgeIllus(e)}</div>
  </div>
</section>`;
}

function pourquoi(e) {
  const w = e.pourquoi;
  return `<section class="sec light" id="a-propos" aria-labelledby="wh-title">
  <div class="wrap">
    <p class="eyebrow">Notre différence</p>
    <h2 id="wh-title">${esc(w.titre)}</h2>
    <div class="band"><img src="${img(w.image ?? 6)}" alt="${esc(w.alt || "Chantier en cours : dalle coulée et étage en élévation")}" loading="lazy">${badgeIllus(e)}</div>
    <div class="why">
      ${w.points.map((p) => `<article><span class="k"></span><h3>${esc(p.titre)}</h3><p>${esc(p.texte)}</p></article>`).join("\n      ")}
    </div>
  </div>
</section>`;
}

function temoignages(e) {
  if (!e.temoignages?.length) return "";
  return `<section class="sec dark" id="temoignages" aria-labelledby="te-title">
  <div class="wrap">
    <p class="eyebrow">Ils nous ont fait confiance</p>
    <h2 id="te-title">Ce que disent nos clients.</h2>
    <figure class="quote q-fade" id="quote" aria-live="polite">
      <blockquote id="qText"></blockquote>
      <figcaption id="qWho"></figcaption>
    </figure>
    <div class="q-nav">
      <button type="button" id="qPrev" aria-label="Témoignage précédent">${ico("left")}</button>
      <button type="button" id="qNext" aria-label="Témoignage suivant">${ico("right")}</button>
      <span class="q-count" id="qCount"></span>
    </div>
  </div>
</section>`;
}

function faq(e) {
  return `<section class="sec light" id="faq" aria-labelledby="fq-title">
  <div class="wrap split">
    <div class="split-head"><p class="eyebrow">FAQ</p><h2 id="fq-title">Vos questions, nos réponses.</h2></div>
    <div class="faq">
      ${e.faq.map((f) => `<details><summary>${esc(f.q)}<i aria-hidden="true"></i></summary><p>${esc(f.r)}</p></details>`).join("\n      ")}
    </div>
  </div>
</section>`;
}

function contact(e) {
  const c = e.contact;
  const options = (l) => l.map((o) => `<option>${esc(o)}</option>`).join("");
  return `<section class="cta on-photo" id="contact" aria-labelledby="ct-title">
  <div class="cta-bg"><img src="${img(c.image ?? 10)}" alt="" loading="lazy"></div>
  <div class="wrap two">
    <div>
      <p class="eyebrow">Parlons de votre projet</p>
      <h2 id="ct-title">${esc(c.titre)}</h2>
      <p class="lede">${esc(c.lede)}</p>
      <p class="wa-alt"><a class="link" href="${wa(e)}">${ico("wa")}Pressé ? Écrivez-nous directement sur WhatsApp</a></p>${e.lienMaps ? `
      <p class="wa-alt"><a class="link" href="${esc(e.lienMaps)}" target="_blank" rel="noopener">${ico("arrow")}Nous trouver sur Google Maps${e.adresse ? ` · ${esc(e.adresse)}` : ""}</a></p>` : ""}
    </div>
    <form class="form" id="quoteForm" novalidate>
      <h3>${esc(c.formTitre)}</h3>
      <div class="grid2">
        <div class="field"><label for="f-name">Nom complet</label><input id="f-name" name="fullname" autocomplete="name" required><span class="err">Indiquez votre nom.</span></div>
        <div class="field"><label for="f-tel">Téléphone / WhatsApp</label><input id="f-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" required placeholder="+237 6XX XX XX XX"><span class="err">Numéro d'au moins 9 chiffres.</span></div>
        <div class="field"><label for="f-city">Lieu du chantier</label><input id="f-city" name="city" placeholder="${esc(c.lieuPlaceholder || "Quartier, ville")}"></div>
        <div class="field"><label for="f-type">Type de projet</label><select id="f-type" name="ptype">${options(c.projets)}</select></div>
      </div>
      ${c.budgets ? `<div class="field"><label for="f-budget">Budget estimé</label><select id="f-budget" name="budget">${options(c.budgets)}</select></div>` : ""}
      <div class="field"><label for="f-msg">Message <span>(facultatif)</span></label><textarea id="f-msg" name="msg" placeholder="${esc(c.messagePlaceholder)}"></textarea></div>
      <button class="btn btn-accent" type="submit" id="fSubmit"><span class="spin" aria-hidden="true"></span><span class="lbl">${esc(c.cta)}</span></button>
      <p class="status" id="fStatus" role="status" aria-live="polite"></p>
      <p class="form-meta">${esc(c.meta)}</p>
    </form>
  </div>
</section>`;
}

function pied(e) {
  const f = e.footer;
  const annee = new Date().getFullYear();
  return `<footer class="ftr">
  <div class="wrap">
    <div class="ftr-grid">
      <div>${logo(e)}<p>${esc(f.description)}</p>${f.mentions ? `<p class="small">${esc(f.mentions)}</p>` : ""}</div>
      <div><h4>Services</h4><ul>${e.services.liste.slice(0, 5).map((s) => `<li><a href="#services">${esc(s.titre)}</a></li>`).join("")}</ul></div>
      <div><h4>Entreprise</h4><ul>${liens(e).slice(2).map(([id, l]) => `<li><a href="#${id}">${esc(l)}</a></li>`).join("")}</ul></div>
      <div><h4>Contact</h4><ul>${e.adresse ? `<li>${esc(e.adresse)}</li>` : ""}<li><a href="tel:+${num(e.telephone)}">${esc(e.telephone)}</a></li>${e.telephone2 ? `<li><a href="tel:+${num(e.telephone2)}">${esc(e.telephone2)}</a></li>` : ""}<li><a href="${wa(e)}">WhatsApp</a></li>${e.email ? `<li><a href="mailto:${esc(e.email)}">${esc(e.email)}</a></li>` : ""}${e.horaires ? `<li>${esc(e.horaires)}</li>` : ""}${(e.reseaux || []).map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.nom)}</a></li>`).join("")}</ul></div>
    </div>
    <div class="ftr-bot"><span>© ${annee} ${esc(e.nom)}. Tous droits réservés</span><span>Site réalisé par <a href="https://pharel.cloud">pharel.cloud</a></span></div>
  </div>
</footer>`;
}

function jsonLd(e) {
  const entreprise = {
    "@type": "GeneralContractor",
    "@id": `${e.siteUrl}#entreprise`,
    name: e.nom,
    url: e.siteUrl,
    description: e.description,
    telephone: `+${num(e.telephone)}`,
    ...(e.email ? { email: e.email } : {}),
    address: { "@type": "PostalAddress", ...(e.adresse ? { streetAddress: e.adresse } : {}), addressLocality: e.ville, addressCountry: "CM" },
    areaServed: e.zones,
  };
  const faqPage = {
    "@type": "FAQPage",
    mainEntity: e.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.r } })),
  };
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [entreprise, faqPage] }).replace(/</g, "\\u003c");
}

// Petits ajouts au CSS du modèle : bandeau maquette, badge « illustration », intro des réalisations.
const CSS_MAQUETTE = `
.maq{position:fixed;right:12px;bottom:12px;z-index:70;max-width:min(360px,calc(100vw - 24px));display:flex;gap:8px;align-items:flex-start;background:var(--bg-black);color:var(--on-dark);font-size:.75rem;line-height:1.35;padding:8px 8px 8px 12px;border-left:3px solid var(--accent);box-shadow:var(--shadow);margin:0}
.maq a{color:var(--accent)}
.maq button{flex:none;border:0;background:transparent;color:var(--on-dark);cursor:pointer;width:24px;height:24px;display:grid;place-items:center;padding:0}
.maq button:hover{color:var(--accent)}
.maq button svg{width:14px;height:14px;fill:currentColor}
.maq[hidden]{display:none}
.illus{position:absolute;left:12px;top:12px;z-index:3;background:rgba(18,20,22,.78);color:var(--on-dark);font-size:.6875rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:4px 8px;pointer-events:none}
.illus-tl{top:auto;bottom:12px;left:auto;right:12px}
.turnkey-img,.photo,.band,.mosaic figure,.ba{position:relative}
.turnkey>*{min-width:0}
.re-lede{margin:24px 0 0;max-width:60ch;color:var(--text-muted)}
`;

function page(e) {
  const site = { nom: e.nom, wa: num(e.telephone), temoignages: e.temoignages || [], ctaForm: e.contact.cta };
  const titre = e.title || `${e.nom} | ${e.activite} à ${e.ville}`;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(e.description)}">
${e.maquette ? '<meta name="robots" content="noindex, nofollow">\n' : ""}<link rel="canonical" href="${esc(e.siteUrl)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="${esc(e.nom)}">
<meta property="og:title" content="${esc(titre)}">
<meta property="og:description" content="${esc(e.description)}">
<meta property="og:url" content="${esc(e.siteUrl)}">
<meta property="og:image" content="${esc(e.siteUrl)}og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1F2225">
<link rel="icon" href="${BASE}favicon.svg" type="image/svg+xml">
<link rel="preload" as="image" href="${img(e.hero.image)}" fetchpriority="high">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap" rel="stylesheet">
<script type="application/ld+json">${jsonLd(e)}</script>
<style>
${CSS}${CSS_MAQUETTE}</style>
</head>
<body>
${ICONES}
${entete(e)}

<main>
${[hero, garanties, chantier, services, cleEnMain, processus, modeles, realisations, diaspora, pourquoi, temoignages, faq, contact].map((f) => f(e)).filter(Boolean).join("\n\n")}
</main>

${pied(e)}
${e.maquette ? `<p class="maq" id="maq"><span>Maquette proposée par <a href="https://pharel.cloud">pharel.cloud</a>${e.mentionMaquette ? ` · ${esc(e.mentionMaquette)}` : ""}</span><button type="button" aria-label="Masquer ce bandeau" onclick="this.parentElement.hidden=true">${ico("x")}</button></p>\n` : ""}<script type="application/json" id="site-data">${JSON.stringify(site).replace(/</g, "\\u003c")}</script>
<script>
${JS}</script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------- build
const demandes = process.argv.slice(2);
const slugs = readdirSync(path.join(racine, "entreprises"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .filter((s) => demandes.length === 0 || demandes.includes(s));

if (slugs.length === 0) {
  console.error("Aucune entreprise trouvée pour :", demandes.join(", "));
  process.exit(1);
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#1F2225"/><rect x="9" y="9" width="14" height="14" fill="#F2B705"/></svg>\n`;

for (const slug of slugs) {
  const e = JSON.parse(readFileSync(path.join(racine, "entreprises", `${slug}.json`), "utf8"));
  BASE = new URL(e.siteUrl).pathname;
  const cible = path.join(racine, "dist", slug);
  rmSync(cible, { recursive: true, force: true });
  mkdirSync(cible, { recursive: true });
  cpSync(path.join(racine, "template", "img"), path.join(cible, "img"), { recursive: true });
  const propres = path.join(racine, "entreprises", slug, "img");
  if (existsSync(propres)) cpSync(propres, path.join(cible, "img"), { recursive: true });
  cpSync(path.join(racine, "template", "og.jpg"), path.join(cible, "og.jpg"));
  writeFileSync(path.join(cible, "favicon.svg"), favicon);
  writeFileSync(path.join(cible, "index.html"), page(e));
  console.log(`✓ ${slug}`);
}
console.log(`${slugs.length} maquette(s) dans dist/`);
