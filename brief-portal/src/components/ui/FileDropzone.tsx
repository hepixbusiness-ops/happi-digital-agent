"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { UploadSimple, FilePdf, FileSvg, X } from "@phosphor-icons/react";
import type { VisuelFichier } from "@/lib/types";

interface FileDropzoneProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  value: VisuelFichier[];
  onChange: (files: VisuelFichier[]) => void;
}

function creerVisuel(file: File): VisuelFichier {
  const isPreviewable = file.type.startsWith("image/") && file.type !== "image/svg+xml" ? true : file.type === "image/svg+xml";
  return {
    id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
    file,
    previewUrl: isPreviewable || file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
  };
}

export function FileDropzone({
  label,
  hint,
  error,
  required,
  multiple = false,
  maxFiles = 1,
  accept,
  value,
  onChange,
}: FileDropzoneProps) {
  const [survole, setSurvole] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const plein = value.length >= maxFiles;

  function ajouterFichiers(fileList: FileList | null) {
    if (!fileList || plein) return;
    const restants = maxFiles - value.length;
    const nouveaux = Array.from(fileList).slice(0, restants).map(creerVisuel);
    onChange(multiple ? [...value, ...nouveaux] : nouveaux.slice(0, 1));
  }

  function retirer(id: string) {
    onChange(value.filter((v) => v.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-label text-xs text-ink-soft">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>

      {!plein && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setSurvole(true);
          }}
          onDragLeave={() => setSurvole(false)}
          onDrop={(e) => {
            e.preventDefault();
            setSurvole(false);
            ajouterFichiers(e.dataTransfer.files);
          }}
          className={`flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors duration-150 ${
            survole ? "border-accent bg-accent-soft" : "border-line-strong bg-surface-raised hover:border-accent"
          }`}
        >
          <UploadSimple size={22} className="text-ink-faint" aria-hidden />
          <span className="text-sm text-ink-soft">
            Glissez vos fichiers ici ou <span className="text-accent underline">parcourir</span>
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => ajouterFichiers(e.target.files)}
            className="hidden"
          />
        </button>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <AnimatePresence initial={false}>
            {value.map((v) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="group relative h-20 w-20 overflow-hidden rounded-lg border border-line bg-surface-raised"
              >
                {v.previewUrl ? (
                  <Image src={v.previewUrl} alt={`Aperçu de ${v.file.name}`} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-ink-faint">
                    {v.file.type === "application/pdf" ? (
                      <FilePdf size={20} aria-hidden />
                    ) : (
                      <FileSvg size={20} aria-hidden />
                    )}
                    <span className="w-full truncate text-center text-[10px]">{v.file.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => retirer(v.id)}
                  aria-label={`Retirer ${v.file.name}`}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-surface opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <X size={12} weight="bold" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {error ? (
        <p className="text-sm text-error">{error}</p>
      ) : hint ? (
        <p className="text-sm text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}
