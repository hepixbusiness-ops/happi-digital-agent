"use client";

import { Chip } from "@/components/ui/Chip";
import { TextareaField } from "@/components/ui/TextareaField";
import { TYPES_SITE, PAGES_DISPONIBLES, FONCTIONNALITES } from "@/lib/config";
import type { BriefData, ErreursBrief } from "@/lib/types";

interface StepProps {
  data: BriefData;
  erreurs: ErreursBrief;
  onChange: <K extends keyof BriefData>(champ: K, valeur: BriefData[K]) => void;
}

function basculer(liste: string[], valeur: string): string[] {
  return liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur];
}

export function Step3Site({ data, erreurs, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1 text-ink">Le site que vous imaginez</h1>
        <p className="mt-2 text-ink-soft">Choisissez ce qui correspond à votre projet — vous pourrez toujours ajuster plus tard.</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-label text-xs text-ink-soft">
          Type de site<span className="text-accent"> *</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {TYPES_SITE.map((t) => (
            <Chip
              key={t.value}
              label={t.label}
              selected={data.typeSite === t.value}
              onClick={() => onChange("typeSite", t.value)}
            />
          ))}
        </div>
        {erreurs.typeSite && <p className="text-sm text-error">{erreurs.typeSite}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-label text-xs text-ink-soft">Pages souhaitées</span>
        <div className="flex flex-wrap gap-2">
          {PAGES_DISPONIBLES.map((p) => (
            <Chip
              key={p}
              label={p}
              selected={data.pages.includes(p)}
              onClick={() => onChange("pages", basculer(data.pages, p))}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-label text-xs text-ink-soft">Fonctionnalités</span>
        <div className="flex flex-wrap gap-2">
          {FONCTIONNALITES.map((f) => (
            <Chip
              key={f}
              label={f}
              selected={data.fonctionnalites.includes(f)}
              onClick={() => onChange("fonctionnalites", basculer(data.fonctionnalites, f))}
            />
          ))}
        </div>
      </div>

      <TextareaField
        label="Objectif n°1 de ce site"
        placeholder="Ex : Vendre en ligne, être trouvé sur Google, présenter nos services aux entreprises…"
        value={data.objectif}
        onChange={(e) => onChange("objectif", e.target.value)}
      />
    </div>
  );
}
