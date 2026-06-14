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
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
<style>
:root{--bg:#080810;--bg2:#0d0d1a;--surface:#111120;--surface2:#16162a;--border:rgba(255,255,255,0.07);--text:#ede9e1;--muted:#635f78;--muted2:#9896aa;--gold:#e8b84b;--gold-l:#f5d47a;--blue:#4b8be8}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Poppins',sans-serif;font-weight:300;overflow-x:hidden;line-height:1.6}
body::after{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");pointer-events:none;z-index:9999}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1.2rem 3rem;display:flex;align-items:center;justify-content:space-between;background:rgba(8,8,16,0.75);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.nav-logo{font-weight:800;font-size:1rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text);text-decoration:none}
.nav-logo span{color:var(--gold)}
.nav-links{display:flex;gap:2.5rem;list-style:none}
.nav-links a{font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);text-decoration:none;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600;padding:10px 20px;background:var(--gold);color:#080810;border-radius:8px;text-decoration:none}

.article-header{padding:10rem 5rem 4rem;max-width:860px;margin:0 auto}
.back-link{display:inline-flex;align-items:center;gap:8px;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);text-decoration:none;margin-bottom:2rem;transition:color .2s}
.back-link:hover{color:var(--gold)}
.article-cat{display:inline-block;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);border:1px solid rgba(232,184,75,.3);padding:4px 12px;border-radius:100px;background:rgba(232,184,75,.05);margin-bottom:1.5rem}
.article-title{font-size:clamp(2rem,4vw,3.2rem);font-weight:800;letter-spacing:-.04em;line-height:1.1;margin-bottom:1.5rem}
.article-meta{display:flex;align-items:center;gap:1.5rem;font-size:.75rem;color:var(--muted2);padding-bottom:2rem;border-bottom:1px solid var(--border)}
.article-meta .author{display:flex;align-items:center;gap:.5rem;font-weight:500}
.meta-sep{color:var(--muted)}

.article-body{max-width:720px;margin:0 auto;padding:3rem 5rem 5rem}
.article-body h2{font-size:1.4rem;font-weight:700;letter-spacing:-.02em;line-height:1.3;margin:2.5rem 0 1rem;color:var(--text)}
.article-body p{font-size:.95rem;color:#c8c5d8;line-height:1.85;margin-bottom:1.2rem}
.article-body strong{color:var(--text);font-weight:600}
.article-body ul{margin:.8rem 0 1.2rem 1.5rem}
.article-body li{font-size:.92rem;color:#c8c5d8;line-height:1.75;margin-bottom:.4rem}

.cta-box{background:var(--surface);border:1px solid rgba(232,184,75,.2);border-radius:16px;padding:2.5rem;text-align:center;margin-top:4rem}
.cta-box h3{font-size:1.3rem;font-weight:700;margin-bottom:.8rem}
.cta-box p{font-size:.88rem;color:var(--muted2);margin-bottom:1.5rem;line-height:1.7}
.btn-gold{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:#080810;font-weight:700;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;padding:14px 28px;border-radius:10px;text-decoration:none;transition:all .25s}
.btn-gold:hover{background:var(--gold-l);transform:translateY(-2px);box-shadow:0 8px 30px rgba(232,184,75,.3)}

footer{padding:3rem 5rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.footer-logo{font-weight:800;font-size:.9rem;letter-spacing:.08em;text-transform:uppercase}
.footer-logo span{color:var(--gold)}
.footer-copy{font-size:.72rem;color:var(--muted)}

@media(max-width:768px){
  nav{padding:1rem 1.5rem}
  .nav-links{display:none}
  .article-header,.article-body{padding-left:1.5rem;padding-right:1.5rem}
  footer{flex-direction:column;gap:1rem;text-align:center;padding:2rem 1.5rem}
}
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-logo">Pharel<span>.</span></a>
  <ul class="nav-links">
    <li><a href="/#services">Services</a></li>
    <li><a href="/#offres">Offres</a></li>
    <li><a href="/blog.html">Blog</a></li>
    <li><a href="/#contact">Contact</a></li>
  </ul>
  <a href="https://wa.me/237699179254" class="nav-cta">Démarrer →</a>
</nav>

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
