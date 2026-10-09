// Assemble le site public dans _site/ : pages statiques de la racine,
// portail de brief (brief-portal, sous /brief) et maquettes BTP (sous /maquettes).
// Utilisé par Vercel (vercel.json) et par GitHub Pages (.github/workflows/pages.yml),
// pour que les deux hébergements publient exactement la même chose.
import { execSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const racine = path.resolve(import.meta.dirname, "..");
const sortie = path.join(racine, "_site");
const run = (cmd, cwd) => execSync(cmd, { cwd: path.join(racine, cwd), stdio: "inherit" });

// Tout ce qui n'est pas du contenu public reste hors de _site.
const EXCLUS = new Set([
  "_site", ".git", ".github", ".claude", ".vercel", "node_modules",
  "brief-portal", "maquette-btp", "scripts", "vercel.json",
]);

console.log("▸ Portail de brief");
run("npm ci --no-audit --no-fund", "brief-portal");
run("npm run build", "brief-portal");

console.log("▸ Maquettes BTP");
run("node scripts/build-all.mjs", "maquette-btp");

console.log("▸ Assemblage de _site");
rmSync(sortie, { recursive: true, force: true });
mkdirSync(sortie);
for (const nom of readdirSync(racine)) {
  if (EXCLUS.has(nom)) continue;
  cpSync(path.join(racine, nom), path.join(sortie, nom), { recursive: true });
}
cpSync(path.join(racine, "brief-portal", "out"), path.join(sortie, "brief"), { recursive: true });
cpSync(path.join(racine, "maquette-btp", "dist"), path.join(sortie, "maquettes"), { recursive: true });
console.log("✓ _site prêt");
