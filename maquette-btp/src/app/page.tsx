import { Devis } from "@/components/Devis";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Methode } from "@/components/Methode";
import { Realisations } from "@/components/Realisations";
import { Services } from "@/components/Services";
import { WhatsAppFlottant } from "@/components/WhatsAppFlottant";
import { Zones } from "@/components/Zones";
import { entreprise as e } from "@/lib/entreprise";

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: e.nom,
    description: e.promesse,
    url: e.siteUrl,
    telephone: e.telephone,
    ...(e.email ? { email: e.email } : {}),
    address: {
      "@type": "PostalAddress",
      ...(e.adresse ? { streetAddress: e.adresse } : {}),
      addressLocality: e.ville,
      addressCountry: "CM",
    },
    areaServed: e.zones.map((z) => ({ "@type": "Place", name: `${z}, ${e.ville}` })),
    makesOffer: e.services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.titre } })),
    ...(e.noteGoogle
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: e.noteGoogle.note, reviewCount: e.noteGoogle.avis } }
      : {}),
  };
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      <Header nom={e.nom} maquette={e.maquette} mentionMaquette={e.mentionMaquette} />
      <main>
        <Hero nom={e.nom} activite={e.activite} ville={e.ville} promesse={e.promesse} telephone={e.telephone} chiffres={e.chiffres} />
        <section aria-label="Présentation" className="mx-auto max-w-7xl px-4 pt-24 md:px-8 md:pt-32">
          <p className="max-w-4xl font-display text-[clamp(1.75rem,3.4vw,3rem)] font-bold leading-[1.05] tracking-[-0.01em] text-balance">
            {e.presentation}
          </p>
        </section>
        <Services services={e.services} />
        <Realisations realisations={e.realisations} />
        <Methode />
        <Zones ville={e.ville} zones={e.zones} adresse={e.adresse} lienMaps={e.lienMaps} noteGoogle={e.noteGoogle} />
        <Devis nom={e.nom} telephone={e.telephone} services={e.services.map((s) => s.titre)} />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-8 px-4 py-12 md:px-8">
          <div>
            <p className="font-display text-3xl font-extrabold uppercase tracking-tight">{e.nom}</p>
            <p className="mt-2 text-sm text-muted">
              {e.activite} à {e.ville}
              {e.adresse ? ` · ${e.adresse}` : ""}
            </p>
            <p className="mt-1 text-sm">
              <a href={`tel:${e.telephone.replace(/\s/g, "")}`} className="hover:text-accent">
                {e.telephone}
              </a>
              {e.email && (
                <>
                  {" · "}
                  <a href={`mailto:${e.email}`} className="hover:text-accent">
                    {e.email}
                  </a>
                </>
              )}
            </p>
          </div>
          <p className="label-mono text-faint">
            Site réalisé par{" "}
            <a href="https://pharel.cloud" className="text-muted hover:text-accent">
              pharel.cloud
            </a>
          </p>
        </div>
      </footer>
      <WhatsAppFlottant nom={e.nom} telephone={e.telephone} />
    </>
  );
}
