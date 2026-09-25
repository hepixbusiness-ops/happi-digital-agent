"use client";

import { ArrowDownRight, WhatsappLogo } from "@phosphor-icons/react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { Chiffre } from "@/lib/types";
import { lienWhatsApp } from "@/lib/whatsapp";
import { Blueprint } from "./Blueprint";

type Props = {
  nom: string;
  activite: string;
  ville: string;
  promesse: string;
  telephone: string;
  chiffres: Chiffre[];
};

export function Hero({ nom, activite, ville, promesse, telephone, chiffres }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduire = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const grilleY = useTransform(scrollYProgress, [0, 1], ["0%", reduire ? "0%" : "18%"]);
  const planY = useTransform(scrollYProgress, [0, 1], ["0%", reduire ? "0%" : "-10%"]);
  const ease = [0.16, 1, 0.3, 1] as const;
  const apparition = (delai: number) => ({
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease, delay: delai },
  });

  return (
    <section ref={ref} className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden pt-24">
      <motion.div style={{ y: grilleY }} className="blueprint-grid absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-bg-base to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-end gap-8 px-4 pb-8 md:px-8 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <motion.p {...apparition(0)} className="label-mono mb-4 flex items-center gap-2 text-muted">
            <span className="inline-block h-2 w-2 bg-accent" aria-hidden="true" />
            {activite} · {ville}
          </motion.p>
          <h1 className="font-display font-black uppercase">
            <motion.span
              {...apparition(0.08)}
              className={`block leading-[0.82] tracking-[-0.03em] text-balance [overflow-wrap:anywhere] ${
                // Les noms longs (« ETS ALU CONSTRUCTION ») descendent d'un cran pour ne pas mordre sur le plan.
                nom.length > 14 ? "text-[clamp(2.75rem,7vw,6.5rem)]" : "text-[clamp(3.5rem,11vw,10rem)]"
              }`}
            >
              {nom}
            </motion.span>
            <motion.span
              {...apparition(0.16)}
              className="mt-4 block font-sans text-[clamp(1rem,1.6vw,1.25rem)] font-medium normal-case tracking-normal text-muted"
            >
              {activite} à {ville}
            </motion.span>
          </h1>
          <motion.p {...apparition(0.24)} className="mt-6 max-w-xl text-lg leading-relaxed text-ink/90">
            {promesse}
          </motion.p>
          <motion.div {...apparition(0.32)} className="mt-8 flex flex-wrap gap-4">
            <a
              href="#devis"
              className="group inline-flex items-center gap-2 bg-accent px-6 py-4 text-sm font-semibold text-accent-ink shadow-accent transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 active:translate-y-0"
            >
              Demander un devis
              <ArrowDownRight size={18} weight="bold" className="transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
            <a
              href={lienWhatsApp(telephone, `Bonjour ${nom}, je souhaite un renseignement.`)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 border border-line-strong px-6 py-4 text-sm font-semibold transition-colors duration-300 ease-out-expo hover:border-accent hover:text-accent"
            >
              <WhatsappLogo size={18} weight="bold" />
              WhatsApp
            </a>
          </motion.div>
        </div>

        <motion.div style={{ y: planY }} className="relative hidden lg:col-span-5 lg:block">
          <span className="label-mono absolute left-0 top-0 text-faint">Élévation · éch. 1/200</span>
          <Blueprint gabarit="immeuble" cotes className="mt-8 w-full" delai={0.3} />
        </motion.div>
      </div>

      {chiffres.length > 0 && (
        <dl className="mx-auto grid w-full max-w-7xl grid-cols-2 border-t border-line md:grid-cols-4">
          {chiffres.map((c, i) => (
            <motion.div
              key={c.label}
              {...apparition(0.4 + i * 0.06)}
              className="border-line px-4 py-6 md:px-8 [&:not(:first-child)]:border-l max-md:[&:nth-child(3)]:border-l-0 max-md:[&:nth-child(n+3)]:border-t"
            >
              <dt className="label-mono text-faint">{c.label}</dt>
              <dd className="mt-2 font-display text-5xl font-extrabold leading-none tracking-tight">{c.valeur}</dd>
            </motion.div>
          ))}
        </dl>
      )}
    </section>
  );
}
