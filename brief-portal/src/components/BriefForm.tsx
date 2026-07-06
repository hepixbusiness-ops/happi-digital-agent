"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, PaperPlaneTilt, WarningCircle } from "@phosphor-icons/react";
import { Rail } from "@/components/Rail";
import { StepIndicator } from "@/components/StepIndicator";
import { Step1Entreprise } from "@/components/steps/Step1Entreprise";
import { Step2Identite } from "@/components/steps/Step2Identite";
import { Step3Site } from "@/components/steps/Step3Site";
import { Step4Cadre } from "@/components/steps/Step4Cadre";
import { SuccessScreen } from "@/components/SuccessScreen";
import { Button } from "@/components/ui/Button";
import { BRIEF_VIDE, BriefData, ErreursBrief } from "@/lib/types";
import { validerEtape, estEtapeValide } from "@/lib/validation";
import { TOTAL_ETAPES } from "@/lib/config";
import { SUBMIT_BRIEF_URL, SUPABASE_ANON_KEY } from "@/lib/supabasePublic";

const VARIANTS_ETAPE = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export function BriefForm() {
  const [etape, setEtape] = useState(1);
  const [data, setData] = useState<BriefData>(BRIEF_VIDE);
  const [erreurs, setErreurs] = useState<ErreursBrief>({});
  const [envoi, setEnvoi] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [erreurEnvoi, setErreurEnvoi] = useState("");
  const [reference, setReference] = useState("");

  function onChange<K extends keyof BriefData>(champ: K, valeur: BriefData[K]) {
    setData((d) => ({ ...d, [champ]: valeur }));
    if (erreurs[champ]) setErreurs((e) => ({ ...e, [champ]: undefined }));
  }

  function suivant() {
    const nouvellesErreurs = validerEtape(etape, data);
    setErreurs(nouvellesErreurs);
    if (Object.keys(nouvellesErreurs).length > 0) return;
    setEtape((e) => Math.min(e + 1, TOTAL_ETAPES));
  }

  function precedent() {
    setEtape((e) => Math.max(e - 1, 1));
  }

  async function envoyer() {
    if (!estEtapeValide(1, data) || !estEtapeValide(3, data)) {
      setErreurs({ ...validerEtape(1, data), ...validerEtape(3, data) });
      setEtape(!estEtapeValide(1, data) ? 1 : 3);
      return;
    }

    setEnvoi("loading");
    setErreurEnvoi("");

    try {
      const form = new FormData();
      const { logo, visuels, ...champsTexte } = data;
      Object.entries(champsTexte).forEach(([cle, valeur]) => {
        form.append(cle, Array.isArray(valeur) ? JSON.stringify(valeur) : String(valeur));
      });
      if (logo) form.append("logo", logo.file, logo.file.name);
      visuels.forEach((v) => form.append("visuels", v.file, v.file.name));

      const res = await fetch(SUBMIT_BRIEF_URL, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY },
        body: form,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Une erreur est survenue à l'envoi.");
      }

      setReference(json.reference ?? "—");
      setEnvoi("success");
    } catch (err) {
      setErreurEnvoi(
        err instanceof Error
          ? err.message
          : "Nous n'avons pas réussi à transmettre votre dossier. Vérifiez votre connexion et réessayez."
      );
      setEnvoi("error");
    }
  }

  if (envoi === "success") {
    return <SuccessScreen nomEntreprise={data.nomEntreprise} reference={reference} />;
  }

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[340px_1fr]">
      <div className="hidden lg:block">
        <Rail data={data} />
      </div>

      <main className="flex flex-col px-5 py-6 sm:px-10 sm:py-10">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8">
          <StepIndicator etape={etape} />

          <AnimatePresence mode="wait">
            <motion.div
              key={etape}
              variants={VARIANTS_ETAPE}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {etape === 1 && <Step1Entreprise data={data} erreurs={erreurs} onChange={onChange} />}
              {etape === 2 && <Step2Identite data={data} onChange={onChange} />}
              {etape === 3 && <Step3Site data={data} erreurs={erreurs} onChange={onChange} />}
              {etape === 4 && <Step4Cadre data={data} onChange={onChange} />}
            </motion.div>
          </AnimatePresence>

          {envoi === "error" && (
            <div className="flex items-start gap-2 rounded-xl border border-error bg-error-soft px-4 py-3 text-sm text-error">
              <WarningCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
              <span>{erreurEnvoi}</span>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-6">
            <Button variant="ghost" onClick={precedent} disabled={etape === 1 || envoi === "loading"}>
              <ArrowLeft size={16} weight="bold" aria-hidden /> Précédent
            </Button>

            {etape < TOTAL_ETAPES ? (
              <Button onClick={suivant}>
                Suivant <ArrowRight size={16} weight="bold" aria-hidden />
              </Button>
            ) : (
              <Button onClick={envoyer} loading={envoi === "loading"}>
                {envoi === "loading" ? "Envoi en cours…" : "Envoyer mon dossier"}
                {envoi !== "loading" && <PaperPlaneTilt size={16} weight="bold" aria-hidden />}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
