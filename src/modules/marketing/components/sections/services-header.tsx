import type { CallToAction } from "../../types";
import { ButtonLink } from "../ui/button-link";
import { Container } from "../ui/container";

type ServicesHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action: CallToAction;
};

/** Cabecera de la página de servicios: título, bajada y llamada a la acción. */
export function ServicesHeader({
  eyebrow,
  title,
  description,
  action,
}: ServicesHeaderProps) {
  return (
    <section className="w-full pt-8 pb-12 lg:pt-16 lg:pb-20">
      <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span aria-hidden className="h-[2px] w-12 bg-primary" />
            <span className="font-label-md text-label-md tracking-widest text-primary uppercase">
              {eyebrow}
            </span>
          </div>
          <h1 className="mb-6 font-display-lg text-display-lg leading-tight text-on-surface">
            {title}
          </h1>
          <p className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
            {description}
          </p>
        </div>

        <ButtonLink action={action} className="w-full shrink-0 sm:w-auto" />
      </Container>
    </section>
  );
}
