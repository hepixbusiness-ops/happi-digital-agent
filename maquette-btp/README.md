# Maquettes BTP

Générateur de sites vitrines pour les entreprises du BTP prospectées à Yaoundé,
construit sur le modèle **Kaeso Bâtiment** (`template/`). Un fichier JSON par
entreprise, une page statique par fichier, publiée sous `pharel.cloud/maquettes/<slug>/`.

Aucune dépendance : `node scripts/build-all.mjs` (Node 18+).

## Structure

| Chemin | Rôle |
|---|---|
| `template/style.css` | CSS du modèle Kaeso, inchangé |
| `template/script.js` | JS du modèle, lit ses données dans `#site-data` (numéro WhatsApp, nom, témoignages) |
| `template/icons.svg` | Sprite d'icônes |
| `template/img/` | Les 11 photos du chantier en accéléré, réutilisées dans toutes les sections |
| `scripts/build-all.mjs` | Assemble les sections à partir du JSON |
| `entreprises/*.json` | Contenu de chaque maquette |

## Sections

Toujours présentes : hero, services, processus, réalisations, « notre différence », FAQ, contact.
Facultatives (clé absente = section absente) : `stats`, `garanties`, `chantier`
(chantier en accéléré), `cleEnMain`, `modeles`, `diaspora`, `temoignages`,
`realisations.avantApres`.

## Créer la maquette d'un prospect

1. Copier `entreprises/alsi-sarl.json` en `entreprises/<slug>.json` et adapter.
2. `node scripts/build-all.mjs <slug>` puis ouvrir `dist/<slug>/index.html` via un petit serveur
   (`npx serve dist` ou `python3 -m http.server -d dist`).

Règles :
- **Pas de chiffres, d'avis ni de garanties inventés** pour une vraie entreprise :
  `stats`, `temoignages`, `modeles` (prix) et `diaspora` restent absents tant que le client
  ne les a pas fournis ou validés.
- Avec `maquette: true` : bandeau « Maquette proposée par pharel.cloud », `noindex`, et
  badge « Photo d'illustration » sur chaque photo du modèle.
- Quand le client envoie ses photos : les ajouter dans `template/img/` (ou prévoir un dossier
  par client) et référencer leur numéro dans le JSON.

## Maquettes présentes

| Fichier | Statut |
|---|---|
| `exemple.json` | Kaeso Bâtiment, le modèle d'origine (entreprise fictive), sert de démo |
| `ets-alu-construction.json` | RDV du 26/09, services déduits du nom, à valider |
| `dreams-building.json` | RDV du 26/09, services déduits du nom, à valider |
| `alsi-sarl.json` | Proposition chiffrée envoyée, services déduits du nom, à valider |

Les JSON ne contiennent que les informations publiques des fiches Google Maps.
Aucune note d'appel ne doit être commitée ici : le dépôt est public.
