"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Realisation } from "@/lib/types";

type Gabarit = Realisation["gabarit"];

// Silhouettes au trait, façon élévation de plan. viewBox 400 × 300.
const TRACES: Record<Gabarit, { structure: string[]; details: string[] }> = {
  villa: {
    structure: [
      "M16 262 H384",
      "M72 262 V150 H328 V262",
      "M112 150 V92 H288 V150",
      "M92 92 H308",
      "M72 186 H328",
    ],
    details: [
      "M96 200 h36 v40 h-36 z",
      "M150 200 h36 v62",
      "M150 200 v62",
      "M216 200 h36 v40 h-36 z",
      "M270 200 h36 v40 h-36 z",
      "M136 108 h40 v30 h-40 z",
      "M200 108 h64 v30 h-64 z",
    ],
  },
  immeuble: {
    structure: [
      "M16 272 H384",
      "M120 272 V56 H264 V272",
      "M120 92 H264 M120 128 H264 M120 164 H264 M120 200 H264 M120 236 H264",
      "M320 272 V24",
      "M296 24 H392",
      "M320 24 L356 56",
    ],
    details: [
      "M136 66 h24 v18 h-24 z M180 66 h24 v18 h-24 z M224 66 h24 v18 h-24 z",
      "M136 102 h24 v18 h-24 z M180 102 h24 v18 h-24 z M224 102 h24 v18 h-24 z",
      "M136 138 h24 v18 h-24 z M180 138 h24 v18 h-24 z M224 138 h24 v18 h-24 z",
      "M136 174 h24 v18 h-24 z M180 174 h24 v18 h-24 z M224 174 h24 v18 h-24 z",
      "M176 244 h32 v28",
      "M372 24 V72 M364 72 h16 v12 h-16 z",
    ],
  },
  ouvrage: {
    structure: [
      "M8 150 H392",
      "M8 166 H392",
      "M104 166 V264 M200 166 V264 M296 166 V264",
      "M8 264 H392",
    ],
    details: [
      "M16 166 Q60 214 104 166 M104 166 Q152 214 200 166 M200 166 Q248 214 296 166 M296 166 Q340 214 384 166",
      "M92 264 h24 M188 264 h24 M284 264 h24",
      "M8 138 H392",
      "M24 138 V150 M72 138 V150 M120 138 V150 M168 138 V150 M216 138 V150 M264 138 V150 M312 138 V150 M360 138 V150",
    ],
  },
};

type Props = {
  gabarit: Gabarit;
  className?: string;
  /** Affiche les lignes de cote et leurs repères. */
  cotes?: boolean;
  delai?: number;
};

export function Blueprint({ gabarit, className, cotes = false, delai = 0 }: Props) {
  const reduire = useReducedMotion();
  const { structure, details } = TRACES[gabarit];
  const ease = [0.16, 1, 0.3, 1] as const;

  // Mêmes props au rendu serveur et client ; seul le tracé est instantané si l'utilisateur réduit les animations.
  const trait = (i: number, base: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: "-10% 0px" },
    transition: reduire ? { duration: 0 } : { duration: 1.4, ease, delay: delai + base + i * 0.12 },
  });

  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" aria-hidden="true">
      {structure.map((d, i) => (
        <motion.path key={`s${i}`} d={d} stroke="var(--text-primary)" strokeWidth={1.5} strokeLinecap="square" {...trait(i, 0)} />
      ))}
      {details.map((d, i) => (
        <motion.path key={`d${i}`} d={d} stroke="var(--text-muted)" strokeWidth={1} {...trait(i, 0.5)} />
      ))}
      {cotes && (
        <motion.g
          stroke="var(--accent)"
          strokeWidth={1}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={reduire ? { duration: 0 } : { duration: 0.8, delay: delai + 1.6 }}
        >
          <path d="M16 288 H384 M16 282 V294 M384 282 V294" />
          <path d="M8 272 V56 M2 272 H14 M2 56 H14" />
        </motion.g>
      )}
    </svg>
  );
}
