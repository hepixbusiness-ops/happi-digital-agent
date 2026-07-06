# Portail de brief client

Publié directement sur **pharel.cloud/brief** : exporté en HTML/JS statique
(`output: 'export'` dans `next.config.ts`, `basePath: '/brief'`) et construit
automatiquement par `.github/workflows/pages.yml` à chaque déploiement du
site. Pas de serveur Next.js en production — la soumission du formulaire
passe par une Supabase Edge Function plutôt qu'une route API Next.

Rôle du formulaire : récupérer les informations et fichiers du client et les
stocker (table `briefs` + bucket de stockage `briefs`). Pas d'automatisation
externe (Drive/Notion/n8n) — juste la collecte des données.

Le lien n'est volontairement pas dans le menu du site (`robots: noindex`,
pas de lien dans `index.html`) : conforme au brief d'origine, c'est un lien
unique envoyé par l'agence à chaque client, pas une page à découvrir.

## Mise en service (une fois)

1. **Migration** : exécuter `supabase/migration.sql` dans le SQL Editor du
   projet Supabase `vuzjrsgobeevfqjmsgsm` (crée la table `briefs` et le
   bucket de stockage `briefs`).
2. **Déployer la Edge Function** (upload fichiers + insertion en base) :
   ```bash
   supabase functions deploy submit-brief --project-ref vuzjrsgobeevfqjmsgsm --no-verify-jwt
   ```
   (`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont injectés automatiquement
   par Supabase dans la fonction — rien à configurer.)
3. Pousser sur `main` (ou lancer le workflow manuellement) : le site
   redéploie et `brief-portal/` est construit + publié sous `/brief`.

## Consulter les dossiers reçus

Les soumissions sont dans la table `briefs` du projet Supabase (visibles
depuis Supabase Studio → Table Editor). Les fichiers (logo, visuels) sont
dans le bucket de stockage `briefs`, un sous-dossier par référence de
dossier (ex. `BRF-20260706-A1B2C3/`).

## Développement local

```bash
npm install
npm run dev
```

En local le formulaire appelle directement la Edge Function de production
(`src/lib/supabasePublic.ts`) — les tests de soumission en dev touchent donc
les vraies données Supabase une fois la fonction déployée.

## Build (identique à ce que fait le workflow)

```bash
npm run build   # écrit brief-portal/out/, prêt à être servi sous /brief
```
