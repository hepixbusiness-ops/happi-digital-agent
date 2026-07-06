import { createClient } from "@supabase/supabase-js";

// Pas de schéma Database généré pour ce projet : on type le client en `any`
// pour éviter que `.insert()` ne résolve les lignes en `never`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ReturnType<typeof createClient<any>> | null = null;

// Client serveur uniquement (clé service_role) — ne jamais importer côté client.
export function getSupabaseAdmin() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client = createClient<any>(url, key, {
    auth: { persistSession: false },
  });

  return client;
}
