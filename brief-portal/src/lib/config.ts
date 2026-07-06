// Constantes du brief — modifiez librement ces listes pour ajuster le
// formulaire sans toucher au reste du code.

export const SECTEURS = [
  "Commerce & distribution",
  "Restauration & hôtellerie",
  "Santé & bien-être",
  "Énergie & environnement",
  "BTP & immobilier",
  "Finance & assurance",
  "Éducation & formation",
  "Transport & logistique",
  "Mode & beauté",
  "Agroalimentaire",
  "Services professionnels",
  "Autre",
] as const;

export const VILLES = [
  "Douala",
  "Yaoundé",
  "Bafoussam",
  "Bamenda",
  "Garoua",
  "Maroua",
  "Ngaoundéré",
  "Bertoua",
  "Buea",
  "Limbé",
  "Hors Cameroun",
] as const;

export const TYPES_SITE = [
  { value: "vitrine", label: "Site vitrine" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "vitrine-ecommerce", label: "Vitrine + e-commerce" },
  { value: "landing", label: "Landing page" },
  { value: "blog", label: "Blog / média" },
  { value: "portfolio", label: "Portfolio" },
  { value: "autre", label: "Autre" },
] as const;

export const PAGES_DISPONIBLES = [
  "Accueil",
  "À propos",
  "Services / Produits",
  "Boutique",
  "Portfolio / Réalisations",
  "Blog",
  "Tarifs",
  "FAQ",
  "Équipe",
  "Témoignages",
  "Contact",
  "Mentions légales",
] as const;

export const FONCTIONNALITES = [
  "Paiement Mobile Money",
  "Bouton WhatsApp",
  "Bilingue FR/EN",
  "Boutique en ligne",
  "Prise de rendez-vous",
  "Newsletter",
  "Espace client",
  "Chat en direct",
  "Multi-devises",
  "Livraison / suivi de commande",
] as const;

export const DELAIS = [
  "Le plus vite possible",
  "2 à 4 semaines",
  "1 à 2 mois",
  "2 à 3 mois",
  "Pas de contrainte de date",
] as const;

export const BUDGETS_FCFA = [
  "Moins de 200 000 FCFA",
  "200 000 – 500 000 FCFA",
  "500 000 – 1 000 000 FCFA",
  "1 000 000 – 2 500 000 FCFA",
  "Plus de 2 500 000 FCFA",
  "Je préfère en discuter",
] as const;

export const MAX_COULEURS = 5;
export const MAX_VISUELS = 8;
export const TOTAL_ETAPES = 4;

export const COULEURS_SUGGEREES = [
  "#0F6B57",
  "#16211C",
  "#EEF0EA",
  "#C97B3C",
  "#2B4C7E",
  "#8A2B3B",
];
