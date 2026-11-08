// POST /api/acheter { produit } → crée le paiement KPAY-NOW (page hébergée) et renvoie son URL.
const crypto = require("crypto");
const { PRODUITS, SITE, KPAY, kpayHeaders, configure } = require("./_boutique");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ erreur: "Méthode non autorisée" });
  // sans clés, le site retombe sur la commande par WhatsApp
  if (!configure()) return res.status(503).json({ erreur: "Paiement en ligne pas encore configuré" });

  const id = req.body && req.body.produit;
  const p = PRODUITS[id];
  if (!p) return res.status(400).json({ erreur: "Produit inconnu" });

  const externalId = `EB.${id}.${Date.now()}.${crypto.randomBytes(4).toString("hex")}`;
  try {
    const r = await fetch(`${KPAY}/payments/init`, {
      method: "POST",
      headers: kpayHeaders(),
      body: JSON.stringify({
        amount: p.prix,
        currency: "XAF",
        externalId,
        description: p.titre,
        metadata: { produit: id },
        returnUrl: `${SITE}/guides/merci.html`,
        successUrl: `${SITE}/guides/merci.html`,
        cancelUrl: `${SITE}/guides/${id}.html?paiement=annule`,
      }),
    });
    const data = await r.json();
    if (!r.ok || !data.gatewayUrl) {
      console.error("KPAY init", r.status, data);
      return res.status(502).json({ erreur: "Le paiement n'a pas pu démarrer" });
    }
    return res.status(200).json({ url: data.gatewayUrl, reference: data.reference, externalId });
  } catch (e) {
    console.error("KPAY init", e);
    return res.status(502).json({ erreur: "Le paiement n'a pas pu démarrer" });
  }
};
