"use client";

import { CheckCircle, CircleNotch, PaperPlaneTilt, WarningCircle } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { lienWhatsApp } from "@/lib/whatsapp";

type Props = {
  nom: string;
  telephone: string;
  services: string[];
};

type Champs = { nom: string; telephone: string; travaux: string; quartier: string; message: string };
type Erreurs = Partial<Record<keyof Champs, string>>;
type Etat = "saisie" | "envoi" | "envoye";

const VIDE: Champs = { nom: "", telephone: "", travaux: "", quartier: "", message: "" };

function valider(c: Champs): Erreurs {
  const e: Erreurs = {};
  if (c.nom.trim().length < 2) e.nom = "Indiquez votre nom.";
  if (c.telephone.replace(/\D/g, "").length < 9) e.telephone = "Numéro à 9 chiffres minimum.";
  if (!c.travaux) e.travaux = "Choisissez un type de travaux.";
  return e;
}

export function Devis({ nom, telephone, services }: Props) {
  const [champs, setChamps] = useState<Champs>(VIDE);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [etat, setEtat] = useState<Etat>("saisie");

  const maj = (k: keyof Champs) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setChamps((c) => ({ ...c, [k]: ev.target.value }));
    if (erreurs[k]) setErreurs((e) => ({ ...e, [k]: undefined }));
  };

  const envoyer = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = valider(champs);
    setErreurs(e);
    if (Object.keys(e).length > 0) return;
    setEtat("envoi");
    const texte = [
      `Bonjour ${nom}, je souhaite un devis.`,
      `Nom : ${champs.nom}`,
      `Téléphone : ${champs.telephone}`,
      `Travaux : ${champs.travaux}`,
      champs.quartier && `Quartier : ${champs.quartier}`,
      champs.message && `Détails : ${champs.message}`,
    ]
      .filter(Boolean)
      .join("\n");
    // Ouverture synchrone (sinon les navigateurs mobiles bloquent la fenêtre),
    // puis bref état « envoi » avant la confirmation.
    window.open(lienWhatsApp(telephone, texte), "_blank", "noopener");
    window.setTimeout(() => setEtat("envoye"), 500);
  };

  const champ =
    "w-full border bg-bg-sunken px-4 py-3 text-ink placeholder:text-faint transition-colors duration-300 focus:border-accent focus:outline-none disabled:opacity-50 aria-[invalid=true]:border-error";

  return (
    <section id="devis" className="relative overflow-hidden border-t border-line bg-bg-raised">
      <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="label-mono text-accent">05 · Devis</p>
          <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em]">
            Parlons de votre projet
          </h2>
          <p className="mt-8 max-w-md leading-relaxed text-muted">
            Décrivez vos travaux en quelques mots. Votre demande arrive directement sur notre WhatsApp, avec toutes les
            informations utiles pour vous rappeler.
          </p>
        </div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {etat === "envoye" ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="border border-line-strong bg-bg-base p-8"
                role="status"
              >
                <CheckCircle size={40} className="text-accent" />
                <p className="mt-4 font-display text-3xl font-bold uppercase tracking-tight">Demande prête</p>
                <p className="mt-2 text-muted">
                  WhatsApp s&apos;est ouvert avec votre message. Il ne reste qu&apos;à appuyer sur « Envoyer ».
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setChamps(VIDE);
                    setEtat("saisie");
                  }}
                  className="mt-6 text-sm font-semibold text-accent underline underline-offset-4 hover:no-underline"
                >
                  Faire une autre demande
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={envoyer} noValidate exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-2">
                <Champ label="Votre nom" erreur={erreurs.nom} id="nom">
                  <input id="nom" autoComplete="name" value={champs.nom} onChange={maj("nom")} disabled={etat === "envoi"} aria-invalid={!!erreurs.nom} aria-describedby={erreurs.nom ? "nom-err" : undefined} className={champ} placeholder="Jean Mbarga" />
                </Champ>
                <Champ label="Téléphone" erreur={erreurs.telephone} id="telephone">
                  <input id="telephone" type="tel" inputMode="tel" autoComplete="tel" value={champs.telephone} onChange={maj("telephone")} disabled={etat === "envoi"} aria-invalid={!!erreurs.telephone} aria-describedby={erreurs.telephone ? "telephone-err" : undefined} className={champ} placeholder="6 XX XX XX XX" />
                </Champ>
                <Champ label="Type de travaux" erreur={erreurs.travaux} id="travaux">
                  <select id="travaux" value={champs.travaux} onChange={maj("travaux")} disabled={etat === "envoi"} aria-invalid={!!erreurs.travaux} aria-describedby={erreurs.travaux ? "travaux-err" : undefined} className={champ}>
                    <option value="">Choisir…</option>
                    {services.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                    <option>Autre</option>
                  </select>
                </Champ>
                <Champ label="Quartier du chantier" id="quartier" optionnel>
                  <input id="quartier" value={champs.quartier} onChange={maj("quartier")} disabled={etat === "envoi"} className={champ} placeholder="Odza, Nkolbisson…" />
                </Champ>
                <Champ label="Votre projet" id="message" optionnel pleineLargeur>
                  <textarea id="message" rows={4} value={champs.message} onChange={maj("message")} disabled={etat === "envoi"} className={`${champ} resize-y`} placeholder="Surface, délai souhaité, plans disponibles…" />
                </Champ>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={etat === "envoi"}
                    className="inline-flex w-full items-center justify-center gap-2 bg-accent px-8 py-4 font-semibold text-accent-ink shadow-accent transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 md:w-auto"
                  >
                    {etat === "envoi" ? (
                      <>
                        <CircleNotch size={18} weight="bold" className="animate-spin" /> Préparation…
                      </>
                    ) : (
                      <>
                        <PaperPlaneTilt size={18} weight="bold" /> Envoyer ma demande sur WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Champ({
  label,
  id,
  erreur,
  optionnel,
  pleineLargeur,
  children,
}: {
  label: string;
  id: string;
  erreur?: string;
  optionnel?: boolean;
  pleineLargeur?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={pleineLargeur ? "md:col-span-2" : undefined}>
      <label htmlFor={id} className="label-mono mb-2 flex justify-between text-muted">
        {label}
        {optionnel && <span className="text-faint">facultatif</span>}
      </label>
      {children}
      {erreur && (
        <p id={`${id}-err`} className="mt-2 flex items-center gap-1 text-sm text-error">
          <WarningCircle size={16} weight="bold" /> {erreur}
        </p>
      )}
    </div>
  );
}
