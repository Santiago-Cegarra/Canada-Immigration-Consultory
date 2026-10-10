import Image from "next/image";
import { homeContent } from "../../content/home";
import { ButtonLink } from "../ui/button-link";
import { Container } from "../ui/container";

export function FinalCta() {
  const { eyebrow, title, description, actions, image } = homeContent.finalCta;
  const [primaryAction, secondaryAction] = actions;

  return (
    <section className="w-full border-t border-surface-container bg-surface-container-lowest py-24">
      <Container>
        <div className="surface-dark relative flex flex-col items-stretch overflow-hidden rounded-3xl bg-on-surface shadow-2xl md:flex-row">
          <div className="relative z-10 flex w-full flex-col justify-center p-10 md:w-1/2 md:p-16">
            <span className="mb-4 block font-label-md text-label-md tracking-widest text-primary-fixed-dim uppercase">
              {eyebrow}
            </span>
            <h2 className="mb-6 font-display-lg text-headline-lg leading-tight font-extrabold text-surface-container-lowest md:text-display-lg">
              {title}
            </h2>
            <p className="mb-10 font-body-lg text-body-lg text-surface-container-highest">
              {description}
            </p>
            <div className="flex flex-col gap-4 sm:items-start">
              <ButtonLink action={primaryAction} variant="primary" />
              <ButtonLink action={secondaryAction} variant="ghost" />
            </div>
          </div>

          <div className="relative min-h-[400px] w-full md:w-1/2">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-on-surface via-on-surface/50 to-transparent md:bg-gradient-to-r" />
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
