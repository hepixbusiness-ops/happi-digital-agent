// GET /api/telechargement?reference=KPAY-…&externalId=EB.… → vérifie le paiement auprès de KPAY-NOW,
// puis renvoie des liens de téléchargement temporaires vers les PDF (bucket Supabase privé).
const { PRODUITS, EBOOKS, KPAY, kpayHeaders, configure, produitDe } = require("./_boutique");

const DUREE = 60 * 60; // validité des liens : 1 heure (la page de remerciement peut en redemander)

async function lienSigne(fichier) {
  const base = process.env.SUPABASE_URL.replace(/\/$/, "");
  const r = await fetch(`${base}/storage/v1/object/sign/ebooks/${fichier}.pdf`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`, apikey: process.env.SUPABASE_SERVICE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: DUREE }),
  });
  const data = await r.json();
  if (!r.ok || !data.signedURL) throw new Error(`Supabase ${r.status} ${JSON.stringify(data)}`);
  return `${base}/storage/v1${data.signedURL}&download=${fichier}.pdf`;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!configure()) return res.status(503).json({ statut: "INDISPONIBLE" });
  const { reference, externalId } = req.query;
  const id = produitDe(externalId);
  if (!reference || !id) return res.status(400).json({ statut: "INVALIDE" });

  try {
    const r = await fetch(`${KPAY}/payments/${encodeURIComponent(reference)}`, { headers: kpayHeaders() });
    if (!r.ok) return res.status(404).json({ statut: "INTROUVABLE" });
    const pay = await r.json();
    // le paiement doit être celui de cette commande, terminé, et du bon montant
    if (pay.externalId !== externalId) return res.status(400).json({ statut: "INVALIDE" });
    if (pay.status !== "COMPLETED") return res.status(200).json({ statut: pay.status });
    if (Number(pay.amount) < PRODUITS[id].prix) return res.status(400).json({ statut: "MONTANT" });

    const fichiers = await Promise.all(PRODUITS[id].fichiers.map(async (f) => ({ titre: EBOOKS[f].titre, url: await lienSigne(f) })));
    return res.status(200).json({ statut: "COMPLETED", produit: PRODUITS[id].titre, fichiers });
  } catch (e) {
    console.error("telechargement", e);
    return res.status(502).json({ statut: "ERREUR" });
  }
};
