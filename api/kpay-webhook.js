// POST /api/kpay-webhook : notifications signées de KPAY-NOW (X-KPAY-Signature, HMAC-SHA256 du corps brut).
// La livraison se fait par /api/telechargement ; ce point d'entrée garde une trace vérifiée de chaque vente
// dans les journaux Vercel et répond vite pour éviter les renvois.
const crypto = require("crypto");

function corpsBrut(req) {
  return new Promise((ok, ko) => {
    const morceaux = [];
    req.on("data", (c) => morceaux.push(c));
    req.on("end", () => ok(Buffer.concat(morceaux)));
    req.on("error", ko);
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Méthode non autorisée");
  const secret = process.env.KPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(503).send("Non configuré");

  const brut = await corpsBrut(req);
  const signature = String(req.headers["x-kpay-signature"] || "");
  const attendue = crypto.createHmac("sha256", secret).update(brut).digest("hex");
  const valide = signature.length === attendue.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(attendue));
  if (!valide) return res.status(400).send("Signature invalide");

  const evt = JSON.parse(brut.toString("utf8"));
  console.log("KPAY", evt.event, evt.reference, evt.externalId, evt.amount, evt.status);
  return res.status(200).send("OK");
};

module.exports.config = { api: { bodyParser: false } };
