"use client";

import { motion } from "motion/react";
import { Check } from "@phosphor-icons/react";

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function Chip({ label, selected, onClick, disabled }: ChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? "border-accent bg-accent-soft text-accent-strong"
          : "border-line bg-surface-raised text-ink-soft hover:border-line-strong hover:text-ink"
      }`}
    >
      {selected && <Check size={14} weight="bold" aria-hidden />}
      {label}
    </motion.button>
  );
}
