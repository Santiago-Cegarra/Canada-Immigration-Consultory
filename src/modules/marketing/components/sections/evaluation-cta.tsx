import Image from "next/image";
import type { CallToAction, ImageAsset } from "../../types";
import { ButtonLink } from "../ui/button-link";
import { Container } from "../ui/container";

type EvaluationCtaProps = {
  title: string;
  description: string;
  action: CallToAction;
  /** Patrón decorativo de fondo; se muestra con muy poca opacidad. */
  backgroundImage: ImageAsset;
};

/** Banda oscura de cierre con una única llamada a la acción. */
export function EvaluationCta({
  title,
  description,
  action,
  backgroundImage,
}: EvaluationCtaProps) {
  return (
    <section className="relative mt-12 w-full overflow-hidden bg-inverse-surface py-16 lg:py-24">
      <Image
        src={backgroundImage.src}
        alt={backgroundImage.alt}
        fill
        sizes="100vw"
        className="object-cover opacity-10"
      />

      <Container className="relative z-10 flex flex-col items-center justify-between gap-12 md:flex-row">
        <div className="max-w-2xl text-left">
          <h2 className="mb-4 font-headline-lg text-headline-lg text-inverse-on-surface">
            {title}
          </h2>
          <p className="font-body-lg text-body-lg text-tertiary-fixed-dim">
            {description}
          </p>
        </div>

        <ButtonLink action={action} className="w-full md:w-auto md:shrink-0" />
      </Container>
    </section>
  );
}
