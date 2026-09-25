import { Reveal } from "./Reveal";

const ETAPES = [
  { titre: "Visite", texte: "Nous venons sur le terrain relever les contraintes et écouter votre besoin." },
  { titre: "Devis détaillé", texte: "Chaque poste est chiffré par lot : vous savez exactement ce que vous payez." },
  { titre: "Exécution", texte: "Un responsable de chantier unique vous tient informé à chaque étape." },
  { titre: "Réception", texte: "Nous vérifions l'ouvrage avec vous avant la remise des clés." },
];

export function Methode() {
  return (
    <section id="methode" className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
      <Reveal>
        <p className="label-mono text-accent">03 · Méthode</p>
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em]">
          Du premier relevé à la remise des clés
        </h2>
      </Reveal>
      <ol className="mt-16 grid gap-8 md:grid-cols-4 md:gap-4">
        {ETAPES.map((e, i) => (
          <Reveal as="li" key={e.titre} delai={i * 0.1} className="relative border-t-2 border-ink pt-6">
            <span className="absolute -top-[5px] left-0 h-2 w-2 bg-accent" aria-hidden="true" />
            <span className="label-mono text-faint">Phase {i + 1}</span>
            <h3 className="mt-2 font-display text-3xl font-bold uppercase leading-none tracking-tight">{e.titre}</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted">{e.texte}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
