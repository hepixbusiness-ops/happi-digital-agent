"use client";

import { WhatsappLogo } from "@phosphor-icons/react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { lienWhatsApp } from "@/lib/whatsapp";

export function WhatsAppFlottant({ nom, telephone }: { nom: string; telephone: string }) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 480));

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={lienWhatsApp(telephone, `Bonjour ${nom}, je souhaite un renseignement.`)}
          target="_blank"
          rel="noopener"
          aria-label={`Écrire à ${nom} sur WhatsApp`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center bg-accent text-accent-ink shadow-accent transition-transform duration-300 hover:-translate-y-0.5 md:bottom-8 md:right-8"
        >
          <WhatsappLogo size={28} weight="bold" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
