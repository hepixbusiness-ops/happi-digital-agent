import type { Metadata } from "next";
import { BriefForm } from "@/components/BriefForm";

export const metadata: Metadata = {
  title: "Portail de brief client — Pharel Happi",
  description:
    "Confiez-nous les informations et fichiers de votre projet en 4 étapes guidées : votre dossier est constitué en direct et transmis à l'agence dès l'envoi.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Portail de brief client",
  description:
    "Formulaire guidé en 4 étapes pour collecter les informations et fichiers nécessaires à la création d'un site web.",
  isPartOf: {
    "@type": "WebSite",
    name: "Pharel Happi",
    url: "https://pharel.cloud",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BriefForm />
    </>
  );
}
