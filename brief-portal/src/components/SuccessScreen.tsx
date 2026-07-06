"use client";

import { motion } from "motion/react";

interface SuccessScreenProps {
  nomEntreprise: string;
  reference: string;
}

export function SuccessScreen({ nomEntreprise, reference }: SuccessScreenProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.svg
        width="88"
        height="88"
        viewBox="0 0 88 88"
        fill="none"
        role="img"
        aria-label="Envoi confirmé"
      >
        <motion.circle
          cx="44"
          cy="44"
          r="40"
          stroke="var(--color-accent)"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d="M27 45L38 56L61 32"
          stroke="var(--color-accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.svg>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-w-md flex-col gap-3"
      >
        <h1 className="text-h1 text-ink">
          Merci{nomEntreprise ? `, ${nomEntreprise}` : ""}.
        </h1>
        <p className="text-ink-soft">
          Votre dossier est bien arrivé chez nous. Nous revenons vers vous sous 48h pour la suite.
        </p>
        <p className="font-mono text-sm text-ink-faint">Référence dossier : {reference}</p>
      </motion.div>
    </div>
  );
}
