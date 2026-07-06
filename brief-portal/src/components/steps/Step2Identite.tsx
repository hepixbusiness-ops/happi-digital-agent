"use client";

import { FileDropzone } from "@/components/ui/FileDropzone";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { TextareaField } from "@/components/ui/TextareaField";
import { MAX_VISUELS } from "@/lib/config";
import type { BriefData, ErreursBrief } from "@/lib/types";

interface StepProps {
  data: BriefData;
  erreurs: ErreursBrief;
  onChange: <K extends keyof BriefData>(champ: K, valeur: BriefData[K]) => void;
}

export function Step2Identite({ data, onChange }: Omit<StepProps, "erreurs">) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1 text-ink">Votre identité visuelle</h1>
        <p className="mt-2 text-ink-soft">
          Tout ce que vous avez déjà — même incomplet — nous aide à cerner votre univers.
        </p>
      </div>

      <FileDropzone
        label="Logo"
        hint="Image, PDF ou SVG"
        accept="image/*,.pdf,.svg"
        value={data.logo ? [data.logo] : []}
        maxFiles={1}
        onChange={(files) => onChange("logo", files[0] ?? null)}
      />

      <ColorPicker couleurs={data.couleurs} onChange={(c) => onChange("couleurs", c)} />

      <FileDropzone
        label="Photos et visuels"
        hint={`Jusqu'à ${MAX_VISUELS} images de votre activité, produits ou équipe`}
        accept="image/*"
        multiple
        maxFiles={MAX_VISUELS}
        value={data.visuels}
        onChange={(files) => onChange("visuels", files)}
      />

      <TextareaField
        label="Sites qui vous inspirent"
        hint="Un lien par ligne"
        placeholder={"https://exemple1.com\nhttps://exemple2.com"}
        rows={3}
        value={data.sitesInspirants}
        onChange={(e) => onChange("sitesInspirants", e.target.value)}
      />
    </div>
  );
}
