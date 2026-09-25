import { readFileSync } from "node:fs";
import path from "node:path";
import type { Entreprise } from "./types";

// Lu au build (export statique) : MAQUETTE=<slug> choisit entreprises/<slug>.json.
export function chargerEntreprise(): Entreprise {
  const slug = process.env.MAQUETTE || "exemple";
  const fichier = path.join(process.cwd(), "entreprises", `${slug}.json`);
  return JSON.parse(readFileSync(fichier, "utf8")) as Entreprise;
}

export const entreprise = chargerEntreprise();
