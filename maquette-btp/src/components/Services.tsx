import type { Service } from "@/lib/types";
import { Reveal } from "./Reveal";

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
      <div className="grid gap-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="label-mono text-accent">01 · Services</p>
          <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em]">
            Ce que nous construisons
          </h2>
        </Reveal>
        <ol className="lg:col-span-8">
          {services.map((s, i) => (
            <Reveal
              as="li"
              key={s.titre}
              delai={i * 0.05}
              className="group relative grid grid-cols-[56px_1fr] gap-4 border-t border-line py-8 last:border-b md:grid-cols-[96px_1fr_1fr] md:gap-8"
            >
              <span
                className="absolute left-0 top-[-1px] h-px w-0 bg-accent transition-[width] duration-700 ease-out-expo group-hover:w-full"
                aria-hidden="true"
              />
              <span className="label-mono pt-2 text-faint">Lot {String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-3xl font-bold uppercase leading-none tracking-tight transition-colors duration-300 group-hover:text-accent md:text-4xl">
                {s.titre}
              </h3>
              <p className="col-start-2 leading-relaxed text-muted md:col-start-3">{s.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
