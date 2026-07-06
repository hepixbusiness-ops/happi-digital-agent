import { BriefData } from "./types";

const CHAMPS_SUIVIS: (keyof BriefData)[] = [
  "nomEntreprise",
  "secteur",
  "ville",
  "activite",
  "email",
  "whatsapp",
  "logo",
  "couleurs",
  "visuels",
  "sitesInspirants",
  "typeSite",
  "pages",
  "fonctionnalites",
  "objectif",
  "delai",
  "budget",
  "message",
];

function estRempli(valeur: unknown): boolean {
  if (valeur === null || valeur === undefined) return false;
  if (typeof valeur === "string") return valeur.trim().length > 0;
  if (Array.isArray(valeur)) return valeur.length > 0;
  return true;
}

export function calculerCompletion(data: BriefData): number {
  const remplis = CHAMPS_SUIVIS.filter((champ) => estRempli(data[champ])).length;
  return Math.round((remplis / CHAMPS_SUIVIS.length) * 100);
}
