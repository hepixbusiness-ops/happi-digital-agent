// Construit une maquette par fichier entreprises/<slug>.json dans dist/<slug>/,
// prête à être publiée sous pharel.cloud/maquettes/<slug>/.
// Usage : npm run build:all            (toutes)
//         npm run build:all -- alsi-sarl (une seule)
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const racine = path.resolve(import.meta.dirname, "..");
const demandes = process.argv.slice(2);
const slugs = readdirSync(path.join(racine, "entreprises"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .filter((s) => demandes.length === 0 || demandes.includes(s));

if (slugs.length === 0) {
  console.error("Aucune entreprise trouvée pour :", demandes.join(", "));
  process.exit(1);
}

mkdirSync(path.join(racine, "dist"), { recursive: true });
for (const slug of slugs) {
  console.log(`\n▸ Maquette ${slug}`);
  execFileSync("npx", ["next", "build"], {
    cwd: racine,
    stdio: "inherit",
    env: { ...process.env, MAQUETTE: slug, MAQUETTE_BASE_PATH: `/maquettes/${slug}` },
  });
  const cible = path.join(racine, "dist", slug);
  rmSync(cible, { recursive: true, force: true });
  cpSync(path.join(racine, "out"), cible, { recursive: true });
}
console.log(`\n✓ ${slugs.length} maquette(s) dans dist/`);
