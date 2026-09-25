import type { NextConfig } from "next";

// Export statique : une maquette = un dossier HTML autonome.
// MAQUETTE_BASE_PATH vaut « /maquettes/<slug> » quand la maquette est publiée
// sous pharel.cloud (voir scripts/build-all.mjs et .github/workflows/pages.yml),
// et reste vide pour un déploiement à la racine d'un domaine client.
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.MAQUETTE_BASE_PATH || "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
