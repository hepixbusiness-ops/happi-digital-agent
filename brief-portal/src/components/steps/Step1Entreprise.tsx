"use client";

import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SelectField } from "@/components/ui/SelectField";
import { SECTEURS, VILLES } from "@/lib/config";
import type { BriefData, ErreursBrief } from "@/lib/types";

interface StepProps {
  data: BriefData;
  erreurs: ErreursBrief;
  onChange: <K extends keyof BriefData>(champ: K, valeur: BriefData[K]) => void;
}

export function Step1Entreprise({ data, erreurs, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1 text-ink">Parlez-nous de votre entreprise</h1>
        <p className="mt-2 text-ink-soft">
          Ces informations nous permettent de démarrer votre dossier et de vous recontacter.
        </p>
      </div>

      <TextField
        label="Nom de l'entreprise"
        required
        placeholder="Ex : Boutique Amara"
        value={data.nomEntreprise}
        error={erreurs.nomEntreprise}
        onChange={(e) => onChange("nomEntreprise", e.target.value)}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          label="Secteur d'activité"
          options={SECTEURS}
          value={data.secteur}
          onChange={(e) => onChange("secteur", e.target.value)}
        />
        <SelectField
          label="Ville"
          options={VILLES}
          value={data.ville}
          onChange={(e) => onChange("ville", e.target.value)}
        />
      </div>

      <TextareaField
        label="Votre activité en une phrase"
        placeholder="Ex : Nous vendons des équipements solaires aux particuliers et entreprises."
        value={data.activite}
        onChange={(e) => onChange("activite", e.target.value)}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Email"
          type="email"
          required
          placeholder="vous@entreprise.com"
          value={data.email}
          error={erreurs.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
        <TextField
          label="WhatsApp"
          type="tel"
          required
          placeholder="+237 6 xx xx xx xx"
          value={data.whatsapp}
          error={erreurs.whatsapp}
          onChange={(e) => onChange("whatsapp", e.target.value)}
        />
      </div>
    </div>
  );
}
