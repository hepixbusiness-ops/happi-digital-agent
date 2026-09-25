# Maquettes BTP

Générateur de sites vitrines pour les entreprises du BTP prospectées à Yaoundé.
Un fichier JSON par entreprise, une maquette statique par fichier, publiée sous
`pharel.cloud/maquettes/<slug>/`.

**Direction** : industriel technique (plan d'exécution). Fond graphite, texte blanc
béton, un seul accent orange sécurité. Tant que l'entreprise n'a pas envoyé ses
photos, les chantiers sont des silhouettes dessinées au trait avec la mention
« photo à fournir » : jamais de fausse photo ni de faux chantier.

Stack : Next.js (export statique), Tailwind v4, motion, Phosphor.

## Créer la maquette d'un prospect

1. Copier `entreprises/exemple.json` en `entreprises/<slug>.json`.
2. Remplir les champs (voir `src/lib/types.ts`). Règles :
   - `chiffres`, `noteGoogle`, `realisations` : **uniquement des données réelles**.
     Laisser vide si on ne sait pas : la section s'adapte.
   - `maquette: true` tant que le client n'a pas validé (bandeau + `noindex`).
   - Photos : les mettre dans `public/chantiers/` et renseigner `"photo": "/chantiers/xxx.jpg"`.
3. Prévisualiser : `MAQUETTE=<slug> npm run dev`
4. Construire : `npm run build:all -- <slug>` → `dist/<slug>/`

Au merge sur `main`, le workflow Pages construit toutes les maquettes et les publie.

## Maquettes présentes

| Fichier | Statut |
|---|---|
| `exemple.json` | Entreprise fictive, sert de démo dans les messages WhatsApp |
| `ets-alu-construction.json` | RDV du 26/09, services supposés d'après le nom : à valider |
| `dreams-building.json` | RDV du 26/09, services supposés (génie civil) : à valider |
| `alsi-sarl.json` | Proposition chiffrée envoyée, services supposés : à valider |

Les fichiers ne contiennent que des informations publiques de la fiche Google Maps
(nom, téléphone, adresse). Aucune note d'appel ne doit être commitée ici : le dépôt est public.
