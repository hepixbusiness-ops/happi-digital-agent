export type Chiffre = { valeur: string; label: string };

export type Service = { titre: string; description: string };

export type Realisation = {
  titre: string;
  lieu: string;
  annee?: string;
  nature: string;
  /** Silhouette dessinée quand aucune photo n'est fournie. */
  gabarit: "villa" | "immeuble" | "ouvrage";
  /** Chemin sous /public, ex. « /chantiers/alsi-01.jpg ». */
  photo?: string;
};

export type Entreprise = {
  slug: string;
  nom: string;
  /** Activité affichée dans le H1 et le title, ex. « Entreprise de construction ». */
  activite: string;
  ville: string;
  adresse?: string;
  telephone: string;
  email?: string;
  lienMaps?: string;
  /** Promesse en une phrase sous le H1. */
  promesse: string;
  presentation: string;
  chiffres: Chiffre[];
  services: Service[];
  /** Vide : des cadres « photo à fournir » s'affichent à la place. */
  realisations: Realisation[];
  zones: string[];
  noteGoogle?: { note: number; avis: number };
  /** Bandeau « maquette » + noindex. Faux uniquement pour un site livré. */
  maquette: boolean;
  /** Mention sous le bandeau, ex. « entreprise fictive ». */
  mentionMaquette?: string;
  siteUrl: string;
};
