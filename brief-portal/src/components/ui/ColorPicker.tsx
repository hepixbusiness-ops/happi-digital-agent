"use client";

import { motion, AnimatePresence } from "motion/react";
import { Plus, X } from "@phosphor-icons/react";
import { COULEURS_SUGGEREES, MAX_COULEURS } from "@/lib/config";

interface ColorPickerProps {
  couleurs: string[];
  onChange: (couleurs: string[]) => void;
}

export function ColorPicker({ couleurs, onChange }: ColorPickerProps) {
  const plein = couleurs.length >= MAX_COULEURS;

  function ajouter(couleur: string) {
    if (plein || couleurs.includes(couleur)) return;
    onChange([...couleurs, couleur]);
  }

  function retirer(index: number) {
    onChange(couleurs.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-label text-xs text-ink-soft">
          Couleurs de marque ({couleurs.length}/{MAX_COULEURS})
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <AnimatePresence initial={false}>
          {couleurs.map((c, i) => (
            <motion.div
              key={`${c}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
            >
              <div
                className="h-11 w-11 rounded-full border border-line-strong shadow-sm"
                style={{ backgroundColor: c }}
                aria-label={`Couleur ${c}`}
              />
              <button
                type="button"
                onClick={() => retirer(i)}
                aria-label={`Retirer la couleur ${c}`}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-surface opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X size={11} weight="bold" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {!plein && (
          <label className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-dashed border-line-strong text-ink-faint transition-colors duration-150 hover:border-accent hover:text-accent">
            <Plus size={18} weight="bold" aria-hidden />
            <input
              type="color"
              onChange={(e) => ajouter(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Choisir une couleur personnalisée"
            />
          </label>
        )}
      </div>

      {!plein && (
        <div className="flex flex-wrap gap-2">
          {COULEURS_SUGGEREES.filter((c) => !couleurs.includes(c)).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => ajouter(c)}
              className="h-7 w-7 rounded-full border border-line transition-transform duration-150 hover:scale-110"
              style={{ backgroundColor: c }}
              aria-label={`Ajouter la couleur suggérée ${c}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
