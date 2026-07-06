import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const BUCKET = "briefs";

function genererReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffixe = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `BRF-${date}-${suffixe}`;
}

function champTexte(form: FormData, cle: string): string {
  const valeur = form.get(cle);
  return typeof valeur === "string" ? valeur : "";
}

function champListe(form: FormData, cle: string): string[] {
  const valeur = form.get(cle);
  if (typeof valeur !== "string" || !valeur) return [];
  try {
    const parsed = JSON.parse(valeur);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function uploaderFichier(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  chemin: string,
  file: File
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(chemin, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(`Échec de l'envoi du fichier ${file.name} : ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(chemin);
  return data.publicUrl;
}

export async function POST(request: NextRequest) {
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { message: "Le service n'est pas configuré (variables Supabase manquantes)." },
      { status: 500 }
    );
  }

  try {
    const form = await request.formData();
    const reference = genererReference();

    const nomEntreprise = champTexte(form, "nomEntreprise");
    const email = champTexte(form, "email");
    const whatsapp = champTexte(form, "whatsapp");

    if (!nomEntreprise.trim() || !email.trim() || !whatsapp.trim()) {
      return NextResponse.json(
        { message: "Nom, email et WhatsApp sont requis pour transmettre ce dossier." },
        { status: 400 }
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
      return NextResponse.json(
        { message: "Votre dossier n'a pas pu être enregistré. Réessayez dans un instant." },
        { status: 500 }
      );
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(brief),
        });
      } catch {
        // La soumission est déjà enregistrée en base ; l'automatisation Drive/Notion
        // pourra être rejouée manuellement même si le webhook échoue ici.
      }
    }

    return NextResponse.json({ reference });
  } catch (err) {
    return NextResponse.json(
      {
        message:
          err instanceof Error
            ? err.message
            : "Une erreur inattendue est survenue. Réessayez dans un instant.",
      },
      { status: 500 }
    );
  }
}
