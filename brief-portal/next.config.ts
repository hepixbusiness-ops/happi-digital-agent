import type { NextConfig } from "next";

// Exporté en statique et publié sous pharel.cloud/brief/ (voir .github/workflows/pages.yml) :
// pas de serveur Next.js en prod, donc pas de routes API — la soumission
// du formulaire appelle directement une Supabase Edge Function (voir
// supabase/functions/submit-brief).
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/brief",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
