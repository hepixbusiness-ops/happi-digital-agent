import { GoogleLogo, MapPin, Star } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./Reveal";

type Props = {
  ville: string;
  zones: string[];
  adresse?: string;
  lienMaps?: string;
  noteGoogle?: { note: number; avis: number };
};

export function Zones({ ville, zones, adresse, lienMaps, noteGoogle }: Props) {
  return (
    <section id="zones" className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-16 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="label-mono text-accent">04 · Zones d&apos;intervention</p>
          <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em]">
            Partout à {ville}
          </h2>
          {adresse && (
            <p className="mt-8 flex items-start gap-2 text-muted">
              <MapPin size={20} className="mt-0.5 shrink-0 text-accent" />
              <span>
                {adresse}
                {lienMaps && (
                  <>
                    {" · "}
                    <a href={lienMaps} target="_blank" rel="noopener" className="text-ink underline underline-offset-4 hover:text-accent">
                      Itinéraire
                    </a>
                  </>
                )}
              </span>
            </p>
          )}
          {noteGoogle && (
            <div className="mt-8 inline-flex items-center gap-4 bg-bg-raised px-6 py-4 shadow-raised">
              <GoogleLogo size={24} weight="bold" />
              <span className="font-display text-4xl font-extrabold leading-none">
                {noteGoogle.note.toFixed(1).replace(".", ",")}
              </span>
              <span className="flex flex-col">
                <span className="flex text-accent" aria-label={`${noteGoogle.note} sur 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} weight={i < Math.round(noteGoogle.note) ? "fill" : "regular"} />
                  ))}
                </span>
                <span className="label-mono text-faint">{noteGoogle.avis} avis Google</span>
              </span>
            </div>
          )}
        </Reveal>
        <ul className="flex flex-wrap content-start gap-2 lg:col-span-7">
          {zones.map((z, i) => (
            <Reveal
              as="li"
              key={z}
              delai={i * 0.03}
              className="border border-line-strong px-4 py-2 font-display text-2xl font-bold uppercase tracking-tight transition-colors duration-300 hover:border-accent hover:text-accent md:text-3xl"
            >
              {z}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
