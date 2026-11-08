// Catalogue côté serveur : le prix payé est toujours vérifié ici, jamais lu depuis le navigateur.
// Les fichiers sont dans le bucket Supabase privé « ebooks » (voir PAIEMENT_KPAY.md).
const EBOOKS = {
  "site-qui-vend": { titre: "Le site qui vend", prix: 6900 },
  "psychologie": { titre: "Les 10 leviers qui font acheter", prix: 6900 },
  "google": { titre: "Visible sur Google en 30 jours", prix: 4900 },
  "whatsapp": { titre: "WhatsApp Business qui vend", prix: 4900 },
  "videos": { titre: "Des vidéos qui retiennent", prix: 5900 },
};

const PRODUITS = {
  ...Object.fromEntries(Object.entries(EBOOKS).map(([id, e]) => [id, { titre: e.titre, prix: e.prix, fichiers: [id] }])),
  "pack-complet": { titre: "Le pack complet (5 ebooks)", prix: 17900, fichiers: Object.keys(EBOOKS) },
};

const SITE = "https://pharel.cloud";
const KPAY = "https://admin.kpay.site/api/v1";

function kpayHeaders() {
  return { "X-API-Key": process.env.KPAY_API_KEY, "X-Secret-Key": process.env.KPAY_SECRET_KEY, "Content-Type": "application/json" };
}

function configure() {
  return Boolean(process.env.KPAY_API_KEY && process.env.KPAY_SECRET_KEY && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

// identifiant de commande : EB.<produit>.<horodatage>.<aléa>
function produitDe(externalId) {
  const m = /^EB\.([a-z-]+)\.\d+\.[a-z0-9]+$/.exec(externalId || "");
  return m && PRODUITS[m[1]] ? m[1] : null;
}

module.exports = { EBOOKS, PRODUITS, SITE, KPAY, kpayHeaders, configure, produitDe };
