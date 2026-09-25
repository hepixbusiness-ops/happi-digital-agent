"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";

type Props = {
  nom: string;
  maquette: boolean;
  mentionMaquette?: string;
};

const LIENS = [
  { href: "#services", label: "Services" },
  { href: "#realisations", label: "Réalisations" },
  { href: "#methode", label: "Méthode" },
  { href: "#zones", label: "Zones" },
];

export function Header({ nom, maquette, mentionMaquette }: Props) {
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setCompact(y > 24));

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {maquette && (
        <p className="label-mono bg-accent px-4 py-1 text-center text-accent-ink">
          Maquette proposée par{" "}
          <a href="https://pharel.cloud" className="underline underline-offset-2 hover:no-underline">
            pharel.cloud
          </a>
          {mentionMaquette ? ` · ${mentionMaquette}` : ""}
        </p>
      )}
      <div
        className={`border-b transition-colors duration-500 ease-out-expo ${
          compact ? "border-line bg-bg-base/85 backdrop-blur-md" : "border-transparent bg-transparent"
        }`}
      >
        <nav aria-label="Navigation principale" className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 md:px-8">
          <a href="#" className="font-display text-xl font-extrabold uppercase tracking-tight">
            {nom}
          </a>
          <ul className="ml-auto hidden items-center gap-8 md:flex">
            {LIENS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="label-mono text-muted transition-colors duration-300 hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#devis"
            className="ml-auto border border-accent px-4 py-2 text-sm font-semibold text-accent transition-colors duration-300 ease-out-expo hover:bg-accent hover:text-accent-ink md:ml-0"
          >
            Devis gratuit
          </a>
        </nav>
      </div>
    </header>
  );
}
