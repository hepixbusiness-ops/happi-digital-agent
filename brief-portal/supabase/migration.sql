-- Portail de brief client — à exécuter dans Supabase Studio (SQL Editor)
-- sur le projet que vous souhaitez utiliser pour ce portail.

-- 1) Table des dossiers reçus
create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  nom_entreprise text not null,
  secteur text,
  ville text,
  activite text,
  email text not null,
  whatsapp text not null,
  logo_url text,
  couleurs jsonb not null default '[]'::jsonb,
  visuels_urls jsonb not null default '[]'::jsonb,
  sites_inspirants text,
  type_site text not null,
  pages jsonb not null default '[]'::jsonb,
  fonctionnalites jsonb not null default '[]'::jsonb,
  objectif text,
  delai text,
  budget text,
  message text,
  created_at timestamptz not null default now()
);

-- 2) RLS : verrouillé par défaut. Seul le rôle service_role (utilisé par la
--    route serveur /api/submit) peut lire/écrire — il contourne RLS de base,
--    donc aucune policy explicite n'est nécessaire pour lui.
alter table public.briefs enable row level security;

-- Si vous souhaitez plus tard consulter les dossiers depuis un dashboard
-- authentifié (comme dashboard.html), décommentez :
-- create policy "briefs_read_authenticated" on public.briefs
--   for select to authenticated using (true);

-- 3) Bucket de stockage pour les fichiers (logo, visuels)
insert into storage.buckets (id, name, public)
values ('briefs', 'briefs', true)
on conflict (id) do nothing;

-- Le bucket est public en lecture (URLs directes utilisées dans le webhook
-- n8n et un futur dashboard) ; l'écriture reste réservée au service_role
-- (la route /api/submit), aucune policy d'upload n'est donc ajoutée pour
-- anon/authenticated.
