"use client";

import { motion } from "motion/react";
import { TOTAL_ETAPES } from "@/lib/config";

const NOMS_ETAPES = ["Entreprise", "Identité", "Le site", "Cadre"];

interface StepIndicatorProps {
  etape: number;
}

export function StepIndicator({ etape }: StepIndicatorProps) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progression du brief">
      {Array.from({ length: TOTAL_ETAPES }, (_, i) => i + 1).map((n) => {
        const actif = n === etape;
        const complete = n < etape;
        return (
          <li key={n} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center gap-1.5">
              <motion.span
                animate={{
                  backgroundColor: actif || complete ? "var(--color-accent)" : "var(--color-line)",
                  color: actif || complete ? "var(--color-surface)" : "var(--color-ink-faint)",
                }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs"
                aria-current={actif ? "step" : undefined}
              >
                {n}
              </motion.span>
              {n < TOTAL_ETAPES && (
                <span
                  className={`h-px flex-1 transition-colors duration-200 ${
                    complete ? "bg-accent" : "bg-line"
                  }`}
                />
              )}
            </div>
            <span className={`hidden text-xs sm:block ${actif ? "text-ink" : "text-ink-faint"}`}>
              {NOMS_ETAPES[n - 1]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
