"use client";

import { SelectField } from "@/components/ui/SelectField";
import { TextareaField } from "@/components/ui/TextareaField";
import { DELAIS, BUDGETS_FCFA, TYPES_SITE } from "@/lib/config";
import type { BriefData, ErreursBrief } from "@/lib/types";

interface StepProps {
  data: BriefData;
  erreurs: ErreursBrief;
  onChange: <K extends keyof BriefData>(champ: K, valeur: BriefData[K]) => void;
}

function LigneRecap({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <span className="font-label text-xs text-ink-faint">{label}</span>
      <span className="text-right text-sm text-ink">{valeur}</span>
    </div>
  );
}

export function Step4Cadre({ data, onChange }: Omit<StepProps, "erreurs">) {
  const typeLabel = TYPES_SITE.find((t) => t.value === data.typeSite)?.label ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1 text-ink">Cadre du projet</h1>
        <p className="mt-2 text-ink-soft">Dernière étape : le délai, le budget, et un dernier mot pour l&apos;agence.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          label="Délai souhaité"
          options={DELAIS}
          value={data.delai}
          onChange={(e) => onChange("delai", e.target.value)}
        />
        <SelectField
          label="Budget (FCFA)"
          options={BUDGETS_FCFA}
          value={data.budget}
          onChange={(e) => onChange("budget", e.target.value)}
        />
      </div>

      <TextareaField
        label="Un message pour l'agence"
        placeholder="Toute précision utile — contraintes, préférences, questions…"
        value={data.message}
        onChange={(e) => onChange("message", e.target.value)}
      />

      <div className="rounded-2xl border border-line bg-surface-raised p-5">
        <p className="font-label mb-1 text-xs text-ink-soft">Récapitulatif de votre dossier</p>
        <div className="flex flex-col">
          <LigneRecap label="Entreprise" valeur={data.nomEntreprise || "—"} />
          <LigneRecap label="Secteur / Ville" valeur={[data.secteur, data.ville].filter(Boolean).join(" · ") || "—"} />
          <LigneRecap label="Contact" valeur={[data.email, data.whatsapp].filter(Boolean).join(" · ") || "—"} />
          <LigneRecap label="Couleurs" valeur={data.couleurs.length ? `${data.couleurs.length} couleur(s)` : "—"} />
          <LigneRecap label="Visuels" valeur={`${data.logo ? "Logo" : ""}${data.logo && data.visuels.length ? " · " : ""}${data.visuels.length ? `${data.visuels.length} visuel(s)` : ""}` || "—"} />
          <LigneRecap label="Type de site" valeur={typeLabel} />
          <LigneRecap label="Pages" valeur={data.pages.join(", ") || "—"} />
          <LigneRecap label="Fonctionnalités" valeur={data.fonctionnalites.join(", ") || "—"} />
          <LigneRecap label="Délai" valeur={data.delai || "—"} />
          <LigneRecap label="Budget" valeur={data.budget || "—"} />
        </div>
      </div>
    </div>
  );
}
