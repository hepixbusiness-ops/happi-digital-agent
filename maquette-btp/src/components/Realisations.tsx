import Image from "next/image";
import type { Realisation } from "@/lib/types";
import { Blueprint } from "./Blueprint";
import { Reveal } from "./Reveal";

const basePath = process.env.MAQUETTE_BASE_PATH || "";

// Sans photos fournies : trois cadres honnêtes « photo à fournir », jamais de faux chantier.
const CADRES_VIDES: Realisation[] = [
  { titre: "Votre chantier phare", lieu: "Photo à fournir", nature: "Gros œuvre", gabarit: "immeuble" },
  { titre: "Une villa livrée", lieu: "Photo à fournir", nature: "Construction", gabarit: "villa" },
  { titre: "Un ouvrage", lieu: "Photo à fournir", nature: "Travaux publics", gabarit: "ouvrage" },
];

export function Realisations({ realisations }: { realisations: Realisation[] }) {
  const vides = realisations.length === 0;
  const items = vides ? CADRES_VIDES : realisations;

  return (
    <section id="realisations" className="border-y border-line bg-bg-sunken py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="label-mono text-accent">02 · Réalisations</p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em]">
              Nos chantiers
            </h2>
          </div>
          <p className="max-w-sm text-muted">
            {vides
              ? "Cet espace accueillera vos photos de chantiers, avec le lieu et la nature des travaux pour chacun."
              : "Une sélection de chantiers livrés, avec le lieu et la nature des travaux."}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => (
            <Reveal
              as="figure"
              key={`${r.titre}-${i}`}
              delai={i * 0.08}
              className={`group flex flex-col bg-bg-raised shadow-raised ${i === 0 ? "md:col-span-2 lg:row-span-2" : ""}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden border-b border-line blueprint-grid">
                {r.photo ? (
                  <Image
                    src={`${basePath}${r.photo}`}
                    alt={`${r.titre}, ${r.lieu}`}
                    fill
                    sizes={i === 0 ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
                  />
                ) : (
                  <>
                    <Blueprint gabarit={r.gabarit} className="absolute inset-0 m-auto h-3/4 w-3/4" delai={i * 0.1} />
                    <span className="label-mono absolute left-4 top-4 border border-line-strong bg-bg-base/80 px-2 py-1 text-muted">
                      {vides ? `Chantier ${String(i + 1).padStart(2, "0")} · photo à fournir` : "Photo à venir"}
                    </span>
                  </>
                )}
              </div>
              <figcaption className="grid grid-cols-2 gap-4 p-4 md:p-6">
                <h3 className="col-span-2 font-display text-2xl font-bold uppercase leading-none tracking-tight">{r.titre}</h3>
                <dl className="contents">
                  <div>
                    <dt className="label-mono text-faint">Lieu</dt>
                    <dd className="mt-1 text-sm">{r.lieu}</dd>
                  </div>
                  <div>
                    <dt className="label-mono text-faint">Nature</dt>
                    <dd className="mt-1 text-sm">
                      {r.nature}
                      {r.annee ? ` · ${r.annee}` : ""}
                    </dd>
                  </div>
                </dl>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
