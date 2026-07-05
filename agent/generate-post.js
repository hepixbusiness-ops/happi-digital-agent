#!/usr/bin/env node
/**
 * GÉNÉRATEUR D'ARTICLES DE BLOG
 * Utilise l'API OpenAI pour créer 1 article par jour
 * Catégories alternées : Digital Cameroun / Tutoriels Web / Conseils Business / IA
 */

const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const POSTS_FILE = path.join(__dirname, '..', 'posts.json');
const BLOG_DIR = path.join(__dirname, '..', 'blog');

// Sujets rotatifs pour 30 jours de contenu
const SUJETS = [
  { cat: 'Digital Cameroun', tags: ['digital','cameroun','web'], sujet: 'Pourquoi les PME camerounaises perdent des clients sans site web' },
  { cat: 'Tutoriels Web', tags: ['web','design','seo'], sujet: 'Comment créer un site web professionnel avec l\'IA en 2025' },
  { cat: 'Conseils Business', tags: ['business','ventes','digital'], sujet: 'Comment doubler vos ventes grâce au digital au Cameroun' },
  { cat: 'Intelligence Artificielle', tags: ['ia','automatisation','productivité'], sujet: 'ChatGPT et Claude : comment les utiliser pour votre business' },
  { cat: 'Digital Cameroun', tags: ['restaurant','yaounde','web'], sujet: 'Restaurant à Yaoundé : pourquoi vous avez besoin d\'un site avec menu en ligne' },
  { cat: 'Tutoriels Web', tags: ['google','seo','visibilite'], sujet: 'Comment apparaître en première page de Google sans budget publicitaire' },
  { cat: 'Conseils Business', tags: ['whatsapp','prospection','clients'], sujet: 'WhatsApp Business : le guide complet pour vendre plus au Cameroun' },
  { cat: 'Intelligence Artificielle', tags: ['ia','contenu','marketing'], sujet: 'Comment l\'IA peut créer votre contenu marketing en 10 minutes par jour' },
  { cat: 'Digital Cameroun', tags: ['mtn','momo','paiement'], sujet: 'Accepter les paiements MTN MoMo sur votre site web : guide complet' },
  { cat: 'Tutoriels Web', tags: ['mobile','responsive','vitesse'], sujet: '5 erreurs qui font fuir vos visiteurs sur mobile' },
  { cat: 'Conseils Business', tags: ['agence','freelance','prix'], sujet: 'Combien coûte un site web au Cameroun en 2025 ? (comparatif honnête)' },
  { cat: 'Intelligence Artificielle', tags: ['ia','cameroun','avenir'], sujet: 'L\'IA va-t-elle transformer le business au Cameroun ? Notre analyse' },
  { cat: 'Digital Cameroun', tags: ['reseaux','facebook','instagram'], sujet: 'Facebook ou Instagram : quel réseau social pour votre entreprise camerounaise ?' },
  { cat: 'Tutoriels Web', tags: ['wordpress','wix','code'], sujet: 'WordPress vs site sur-mesure : que choisir pour votre entreprise ?' },
  { cat: 'Conseils Business', tags: ['email','prospection','leads'], sujet: 'Comment trouver 50 nouveaux clients par mois avec le digital' },
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[àáâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    .trim().slice(0, 60);
}

function getDateFR() {
  return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function genererArticle(sujetObj) {
  console.log('[BLOG] Generation article:', sujetObj.sujet);

  const prompt = `Tu es Pharel Happi, expert digital basé à Yaoundé, Cameroun.
Tu écris un article de blog professionnel, utile et optimisé SEO.

Catégorie : ${sujetObj.cat}
Sujet : ${sujetObj.sujet}

Rédige un article complet en français avec :
1. Un titre accrocheur (H1) - légèrement différent du sujet donné
2. Une introduction engageante (2-3 paragraphes)
3. 4-5 sections avec sous-titres (H2)
4. Des exemples concrets liés au contexte camerounais/africain
5. Une conclusion avec un appel à l'action vers WhatsApp (+237 699 179 254)

Format de réponse JSON strict :
{
  "titre": "Le titre de l'article",
  "extrait": "Une description de 2 phrases pour les moteurs de recherche",
  "contenu": "Le contenu HTML complet avec balises h2, p, ul, li, strong (pas de h1 dans le contenu)",
  "meta_description": "Description SEO de 155 caractères max",
  "lecture": 5
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ni après.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error('API OpenAI: ' + response.status);
  const data = await response.json();
  const text = data.choices[0].message.content.trim();

  // Parser le JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSON invalide dans la réponse');
  return JSON.parse(jsonMatch[0]);
}

function genererHTMLArticle(article, sujetObj, slug) {
  const date = getDateFR();
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${article.titre} | Pharel Happi</title>
<meta name="description" content="${article.meta_description || article.extrait}">
<meta property="og:title" content="${article.titre}">
<meta property="og:description" content="${article.extrait}">
<meta property="og:url" content="https://pharel.cloud/blog/${slug}.html">
<link rel="canonical" href="https://pharel.cloud/blog/${slug}.html">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<nav>
  <a href="/" class="nav-logo">Pharel<span>.</span></a>
  <ul class="nav-links">
    <li><a href="/#services">Services</a></li>
    <li><a href="/#offres">Offres</a></li>
    <li><a href="/realisations.html">Réalisations</a></li>
    <li><a href="/blog.html">Blog</a></li>
    <li><a href="/#contact">Contact</a></li>
  </ul>
  <a href="https://wa.me/237699179254" class="nav-cta">Démarrer →</a>
  <button class="nav-toggle" id="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
</nav>
<div class="nav-drawer" id="nav-drawer">
  <div class="nav-drawer-panel">
    <a href="/#services">Services</a>
    <a href="/#offres">Offres</a>
    <a href="/realisations.html">Réalisations</a>
    <a href="/blog.html">Blog</a>
    <a href="/#contact">Contact</a>
    <a href="https://wa.me/237699179254" class="nav-cta">Démarrer →</a>
  </div>
</div>

<div class="article-header">
  <a href="/blog.html" class="back-link">← Retour au blog</a>
  <div class="article-cat">${sujetObj.cat}</div>
  <h1 class="article-title">${article.titre}</h1>
  <div class="article-meta">
    <span class="author">✍️ <strong>Pharel Happi</strong></span>
    <span class="meta-sep">·</span>
    <span>${date}</span>
    <span class="meta-sep">·</span>
    <span>${article.lecture || 5} min de lecture</span>
  </div>
</div>

<div class="article-body">
  ${article.contenu}

  <div class="cta-box">
    <h3>Besoin d'un site web pour votre entreprise ?</h3>
    <p>Je crée des sites web professionnels en 72h pour les entreprises camerounaises.<br>
    Paiement en MTN MoMo ou Orange Money. À partir de 100 000 FCFA.</p>
    <a href="https://wa.me/237699179254?text=Bonjour%20Pharel,%20j'ai%20lu%20votre%20article%20et%20je%20voudrais%20un%20site%20web" class="btn-gold">
      Me contacter sur WhatsApp →
    </a>
  </div>
</div>

<footer>
  <span class="footer-logo">Pharel<span>.</span>cloud</span>
  <span class="footer-copy">© 2025 Pharel Happi — Yaoundé, Cameroun</span>
</footer>
<script src="/assets/site.js"></script>
</body>
</html>`;
}

async function main() {
  console.log('[BLOG] Démarrage génération article...');

  if (!OPENAI_API_KEY) {
    console.error('[BLOG] OPENAI_API_KEY manquante');
    process.exit(1);
  }

  // Créer le dossier blog si besoin
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });

  // Charger posts existants
  let posts = [];
  try { posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8')); } catch {}

  // Choisir le sujet (rotation sur les jours)
  const dayIndex = Math.floor(Date.now() / 86400000) % SUJETS.length;
  const sujetObj = SUJETS[dayIndex];

  // Générer l'article via Claude
  const article = await genererArticle(sujetObj);
  const slug = slugify(article.titre);
  const dateISO = new Date().toISOString().split('T')[0];
  const dateFR = getDateFR();

  // Vérifier que cet article n'existe pas déjà
  if (posts.find(function(p){ return p.slug === slug; })) {
    console.log('[BLOG] Article déjà publié:', slug);
    process.exit(0);
  }

  // Générer le HTML de l'article
  const html = genererHTMLArticle(article, sujetObj, slug);
  fs.writeFileSync(path.join(BLOG_DIR, slug + '.html'), html, 'utf8');

  // Ajouter à l'index posts.json
  const postEntry = {
    slug: slug,
    titre: article.titre,
    extrait: article.extrait,
    categorie: sujetObj.cat,
    tags: sujetObj.tags,
    date: dateFR,
    dateISO: dateISO,
    lecture: article.lecture || 5,
  };

  posts.unshift(postEntry); // Ajouter en premier (plus récent d'abord)
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');

  console.log('[BLOG] Article publié:', article.titre);
  console.log('[BLOG] URL:', 'https://pharel.cloud/blog/' + slug + '.html');
}

main().catch(function(err) {
  console.error('[BLOG] Erreur:', err.message);
  process.exit(1);
});
