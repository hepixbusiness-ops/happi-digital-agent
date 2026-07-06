export interface VisuelFichier {
  id: string;
  file: File;
  previewUrl: string;
}

export interface BriefData {
  // Étape 1 — Entreprise
  nomEntreprise: string;
  secteur: string;
  ville: string;
  activite: string;
  email: string;
  whatsapp: string;

  // Étape 2 — Identité
  logo: VisuelFichier | null;
  couleurs: string[];
  visuels: VisuelFichier[];
  sitesInspirants: string;

  // Étape 3 — Le site
  typeSite: string;
  pages: string[];
  fonctionnalites: string[];
  objectif: string;

  // Étape 4 — Cadre
  delai: string;
  budget: string;
  message: string;
}

export const BRIEF_VIDE: BriefData = {
  nomEntreprise: "",
  secteur: "",
  ville: "",
  activite: "",
  email: "",
  whatsapp: "",
  logo: null,
  couleurs: [],
  visuels: [],
  sitesInspirants: "",
  typeSite: "",
  pages: [],
  fonctionnalites: [],
  objectif: "",
  delai: "",
  budget: "",
  message: "",
};

export type ErreursBrief = Partial<Record<keyof BriefData, string>>;
