// Supabase Edge Function — reçoit la soumission du portail de brief
// (pharel.cloud/brief, export statique sans serveur Next.js) : upload des
// fichiers, enregistrement en base, puis notification du webhook n8n.
//
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont injectés automatiquement
// par Supabase dans l'environnement de chaque Edge Function. Seul
// N8N_WEBHOOK_URL doit être défini manuellement :
//   supabase secrets set N8N_WEBHOOK_URL=https://... --project-ref vuzjrsgobeevfqjmsgsm

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET = "briefs";

const ORIGINES_AUTORISEES = new Set([
  "https://pharel.cloud",
  "http://localhost:3000",
  "http://localhost:8930",
]);

function enTetesCors(origin: string | null) {
  const origineAutorisee = origin && ORIGINES_AUTORISEES.has(origin) ? origin : "https://pharel.cloud";
  return {
    "Access-Control-Allow-Origin": origineAutorisee,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function genererReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffixe = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `BRF-${date}-${suffixe}`;
}

function champTexte(form: FormData, cle: string): string {
  const valeur = form.get(cle);
  return typeof valeur === "string" ? valeur : "";
}

function champListe(form: FormData, cle: string): unknown[] {
  const valeur = form.get(cle);
  if (typeof valeur !== "string" || !valeur) return [];
  try {
    const parsed = JSON.parse(valeur);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// deno-lint-ignore no-explicit-any
async function uploaderFichier(supabase: any, chemin: string, file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(chemin, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(`Échec de l'envoi du fichier ${file.name} : ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(chemin);
  return data.publicUrl;
}

Deno.serve(async (req: Request) => {
  const cors = enTetesCors(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Méthode non supportée." }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const form = await req.formData();
    const reference = genererReference();

    const nomEntreprise = champTexte(form, "nomEntreprise");
    const email = champTexte(form, "email");
    const whatsapp = champTexte(form, "whatsapp");

    if (!nomEntreprise.trim() || !email.trim() || !whatsapp.trim()) {
      return new Response(
        JSON.stringify({ message: "Nom, email et WhatsApp sont requis pour transmettre ce dossier." }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    let logoUrl: string | null = null;
    const logo = form.get("logo");
    if (logo instanceof File && logo.size > 0) {
      logoUrl = await uploaderFichier(supabase, `${reference}/logo-${logo.name}`, logo);
    }

    const visuelsUrls: string[] = [];
    for (const fichier of form.getAll("visuels")) {
      if (fichier instanceof File && fichier.size > 0) {
        const url = await uploaderFichier(supabase, `${reference}/visuel-${visuelsUrls.length}-${fichier.name}`, fichier);
        visuelsUrls.push(url);
      }
    }

    const brief = {
      reference,
      nom_entreprise: nomEntreprise,
      secteur: champTexte(form, "secteur"),
      ville: champTexte(form, "ville"),
      activite: champTexte(form, "activite"),
      email,
      whatsapp,
      logo_url: logoUrl,
      couleurs: champListe(form, "couleurs"),
      visuels_urls: visuelsUrls,
      sites_inspirants: champTexte(form, "sitesInspirants"),
      type_site: champTexte(form, "typeSite"),
      pages: champListe(form, "pages"),
      fonctionnalites: champListe(form, "fonctionnalites"),
      objectif: champTexte(form, "objectif"),
      delai: champTexte(form, "delai"),
      budget: champTexte(form, "budget"),
      message: champTexte(form, "message"),
    };

    const { error: dbError } = await supabase.from("briefs").insert([brief]);
    if (dbError) {
      return new Response(
        JSON.stringify({ message: "Votre dossier n'a pas pu être enregistré. Réessayez dans un instant." }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const webhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(brief),
        });
      } catch {
        // Le dossier est déjà enregistré en base ; l'automatisation Drive/Notion
        // pourra être rejouée manuellement même si le webhook échoue ici.
      }
    }

    return new Response(JSON.stringify({ reference }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: err instanceof Error ? err.message : "Une erreur inattendue est survenue. Réessayez dans un instant.",
      }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
