# Paiement des ebooks avec KPAY-NOW

La boutique `/guides` vend les ebooks en ligne : le client paie sur la page sécurisée de KPAY-NOW
(MTN MoMo, Orange Money ou carte), revient sur `/guides/merci.html`, et télécharge ses PDF.
Tant que la configuration ci-dessous n'est pas faite, les boutons « Acheter » ouvrent WhatsApp
(commande manuelle) : rien ne casse.

## Comment ça marche

1. `POST /api/acheter` crée le paiement chez KPAY-NOW. Le prix vient de `api/_boutique.js`,
   jamais du navigateur.
2. Après paiement, `merci.html` appelle `GET /api/telechargement`, qui interroge KPAY-NOW
   (statut `COMPLETED`, même commande, bon montant), puis renvoie des liens de téléchargement
   valables 1 heure vers le bucket Supabase privé `ebooks`.
3. `POST /api/kpay-webhook` vérifie la signature des notifications KPAY-NOW et garde une trace
   de chaque vente dans les journaux Vercel.

## À faire une seule fois

### 1. Compte KPAY-NOW
- Crée ton compte sur https://kpay.site, puis une **Application** dans le tableau de bord.
- Dans l'application, coche les opérateurs du Cameroun (MTN MoMo, Orange) et, si tu veux, la carte.
- Callback URL des dépôts : `https://pharel.cloud/api/kpay-webhook`
- Note la clé publique (`kpay_test_…` d'abord), la clé secrète (affichée une seule fois) et le
  secret de signature des webhooks.
- Pour encaisser de vrais paiements, termine la vérification d'identité (KYC) : tu obtiendras
  des clés `kpay_live_…`.

### 2. Les PDF dans Supabase (privés)
- Supabase, projet `vuzjrsgobeevfqjmsgsm` → Storage → **New bucket** `ebooks`, **non public**.
- Envoie-y les 5 fichiers, avec exactement ces noms :
  `site-qui-vend.pdf`, `psychologie.pdf`, `google.pdf`, `whatsapp.pdf`, `videos.pdf`
  (ils sont dans `SITE_PHAREL/ebooks/pdf/` sur ton ordinateur).
- Ne mets jamais ces PDF dans ce dépôt : il est public.

### 3. Les variables d'environnement sur Vercel
Projet `pharel-cloud` → Settings → Environment Variables (Production et Preview) :

| Variable | Valeur |
|---|---|
| `KPAY_API_KEY` | clé publique KPAY-NOW (`kpay_test_…` puis `kpay_live_…`) |
| `KPAY_SECRET_KEY` | clé secrète KPAY-NOW |
| `KPAY_WEBHOOK_SECRET` | secret de signature des webhooks |
| `SUPABASE_URL` | `https://vuzjrsgobeevfqjmsgsm.supabase.co` |
| `SUPABASE_SERVICE_KEY` | clé `service_role` de Supabase (Settings → API) |

Puis **Redeploy** le dernier déploiement pour que les variables soient prises en compte.

### 4. Tester avant d'encaisser
- Avec les clés `kpay_test_…`, fais un achat sur le site avec un numéro de test de la
  documentation KPAY-NOW (« Données de test ») : aucun argent ne bouge.
- Vérifie que la page de remerciement affiche les liens et que les PDF se téléchargent.
- Remplace ensuite les clés par les clés `kpay_live_…` et redéploie.

## Changer un prix
Modifie le prix dans `api/_boutique.js` **et** dans `produits.py` (pages de la boutique),
pour que le prix affiché et le prix encaissé restent identiques.
