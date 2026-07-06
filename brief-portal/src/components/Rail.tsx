"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Buildings, MapPin, Browser, FileText, Image as ImageIcon } from "@phosphor-icons/react";
import type { BriefData } from "@/lib/types";
import { TYPES_SITE } from "@/lib/config";
import { calculerCompletion } from "@/lib/completion";

interface RailProps {
  data: BriefData;
}

export function Rail({ data }: RailProps) {
  const completion = calculerCompletion(data);
  const typeLabel = TYPES_SITE.find((t) => t.value === data.typeSite)?.label;

  return (
    <aside
      aria-label="Aperçu de votre dossier"
      className="flex h-full flex-col justify-between bg-rail px-6 py-8 text-rail-ink"
    >
      <div className="flex flex-col gap-8">
        <div>
          <p className="font-label text-xs text-rail-ink/50">Dossier client</p>
          <h2 className="mt-2 text-h2 text-rail-ink">
            {data.nomEntreprise.trim() || (
              <span className="text-rail-ink/30">Votre entreprise</span>
            )}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            <AnimatePresence>
              {data.ville && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1 rounded-full border border-rail-line px-3 py-1 text-xs"
                >
                  <MapPin size={12} aria-hidden /> {data.ville}
                </motion.span>
              )}
              {data.secteur && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1 rounded-full border border-rail-line px-3 py-1 text-xs"
                >
                  <Buildings size={12} aria-hidden /> {data.secteur}
                </motion.span>
              )}
            </AnimatePresence>
            {!data.ville && !data.secteur && (
              <span className="text-xs text-rail-ink/30">Ville et secteur apparaîtront ici</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-label text-xs text-rail-ink/50">Identité</p>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-rail-line bg-white/5">
              {data.logo?.previewUrl ? (
                <Image
                  src={data.logo.previewUrl}
                  alt="Logo de l'entreprise"
                  width={56}
                  height={56}
                  className="object-contain"
                  unoptimized
                  priority
                />
              ) : (
                <ImageIcon size={20} className="text-rail-ink/30" aria-hidden />
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.couleurs.length > 0 ? (
                data.couleurs.map((c, i) => (
                  <span
                    key={`${c}-${i}`}
                    className="h-5 w-5 rounded-full border border-rail-line"
                    style={{ backgroundColor: c }}
                  />
                ))
              ) : (
                <span className="text-xs text-rail-ink/30">Aucune couleur choisie</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-label text-xs text-rail-ink/50">Le site</p>
          <div className="flex items-center gap-2 text-sm">
            <Browser size={16} className="text-rail-ink/50" aria-hidden />
            {typeLabel ?? <span className="text-rail-ink/30">Type de site non défini</span>}
          </div>
          {data.pages.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {data.pages.map((p) => (
                <span key={p} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-rail-ink/80">
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-rail-ink/30">
              <FileText size={14} aria-hidden /> Pages à sélectionner
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="font-label text-xs text-rail-ink/50">Complétion</p>
          <p className="font-mono text-xs text-rail-ink/70">{completion}%</p>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${completion}%` }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </aside>
  );
}
