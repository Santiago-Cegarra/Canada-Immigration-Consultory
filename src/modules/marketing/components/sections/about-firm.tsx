import type { Feature } from "../../types";
import { Container } from "../ui/container";
import { HighlightedText } from "../ui/highlighted-text";
import { PillarCard } from "../ui/pillar-card";
import { TeamShowcase, type TeamShowcaseProps } from "../ui/team-showcase";

type AboutFirmProps = {
  eyebrow: string;
  /** Admite fragmentos resaltados entre llaves: `"… {Profesionales Regulados}"`. */
  title: string;
  description: string;
  team: TeamShowcaseProps;
  pillars: Feature[];
};

/**
 * "Sobre nosotros": presentación de la firma, foto del equipo y pilares de
 * confianza. El `id` es el destino del enlace "Sobre Nosotros" del menú, y
 * `scroll-mt-20` evita que la cabecera fija (h-20) tape el inicio al saltar.
 */
export function AboutFirm({
  eyebrow,
  title,
  description,
  team,
  pillars,
}: AboutFirmProps) {
  return (
    <section
      id="sobre-nosotros"
      className="relative w-full scroll-mt-20 overflow-hidden border-t border-surface-container bg-surface-container-low py-20"
    >
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-surface-container bg-surface-container-lowest px-4 py-2 font-label-md text-label-md tracking-widest text-primary uppercase">
            <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />
            {eyebrow}
          </span>
          <h2 className="mb-4 font-headline-lg text-headline-lg text-on-surface">
            <HighlightedText text={title} />
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {description}
          </p>
        </div>

        <div className="mb-16">
          <TeamShowcase {...team} />
        </div>

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <li key={pillar.title}>
              <PillarCard {...pillar} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
