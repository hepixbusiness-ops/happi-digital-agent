import { BriefData, ErreursBrief } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_RE = /^[+\d][\d\s-]{6,}$/;

export function validerEtape1(data: BriefData): ErreursBrief {
  const erreurs: ErreursBrief = {};

  if (!data.nomEntreprise.trim()) {
    erreurs.nomEntreprise = "Dites-nous comment s'appelle votre entreprise, on ne peut pas commencer sans.";
  }

  if (!data.email.trim()) {
    erreurs.email = "Une adresse email nous permet de vous recontacter — celle-ci est requise.";
  } else if (!EMAIL_RE.test(data.email.trim())) {
    erreurs.email = "Cette adresse email ne semble pas complète — vérifiez le \"@\" et le domaine.";
  }

  if (!data.whatsapp.trim()) {
    erreurs.whatsapp = "Votre numéro WhatsApp est requis, c'est notre moyen de contact le plus rapide.";
  } else if (!WHATSAPP_RE.test(data.whatsapp.trim())) {
    erreurs.whatsapp = "Ce numéro ne semble pas complet — indiquez l'indicatif pays si possible.";
  }

  return erreurs;
}

export function validerEtape3(data: BriefData): ErreursBrief {
  const erreurs: ErreursBrief = {};

  if (!data.typeSite) {
    erreurs.typeSite = "Choisissez le type de site qui correspond le mieux à votre projet.";
  }

  return erreurs;
}

export function validerEtape(etape: number, data: BriefData): ErreursBrief {
  if (etape === 1) return validerEtape1(data);
  if (etape === 3) return validerEtape3(data);
  return {};
}

export function estEtapeValide(etape: number, data: BriefData): boolean {
  return Object.keys(validerEtape(etape, data)).length === 0;
}
