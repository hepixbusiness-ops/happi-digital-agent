# Portail de brief client

App Next.js autonome (à déployer séparément du site statique pharel.cloud,
par exemple sur Vercel avec son propre sous-domaine `brief.pharel.cloud`).

## Configuration

1. `cp .env.example .env.local` puis renseigner :
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — projet Supabase à utiliser.
   - `N8N_WEBHOOK_URL` — webhook n8n (Drive + Notion + email).
   - `NEXT_PUBLIC_SITE_URL` — URL publique du portail.
2. Exécuter `supabase/migration.sql` dans le SQL Editor du projet Supabase
   (crée la table `briefs` et le bucket de stockage `briefs`).

## Développement

```bash
npm install
npm run dev
```

## Déploiement

```bash
npm run build
npm run start
```
