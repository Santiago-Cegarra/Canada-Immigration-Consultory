import Image from "next/image";
import { homeContent } from "../../content/home";
import { ButtonLink } from "../ui/button-link";
import { HighlightedText } from "../ui/highlighted-text";
import { Icon } from "../ui/icon";

export function Hero() {
  const { eyebrow, title, description, image, actions, highlight } =
    homeContent.hero;
  const [primaryAction, secondaryAction] = actions;

  return (
    <section className="surface-dark relative -mt-20 flex min-h-[80vh] w-full items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* En móvil el texto ocupa todo el ancho: capa uniforme. Desde md, el
            degradado deja ver la foto a la derecha, donde no hay texto. */}
        <div className="absolute inset-0 bg-on-surface/80 md:bg-transparent md:bg-gradient-to-r md:from-on-surface/90 md:via-on-surface/70 md:to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-page grid-cols-1 gap-gutter px-gutter md:grid-cols-12">
        <div className="flex flex-col items-start gap-6 md:col-span-8 lg:col-span-6">
          <span className="rounded-full border border-surface-container-lowest/20 bg-surface-container-lowest/10 px-4 py-2 font-label-md text-label-md tracking-widest text-primary-fixed-dim uppercase backdrop-blur-sm">
            {eyebrow}
          </span>

          <h1 className="font-display-lg text-[48px] leading-tight font-extrabold tracking-tight text-surface-container-lowest md:text-[64px]">
            <HighlightedText
              text={title}
              emphasisClassName="text-primary-fixed-dim"
            />
          </h1>

          <p className="max-w-xl font-body-lg text-body-lg text-surface-container-highest">
            {description}
          </p>

          <div className="mt-4 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <ButtonLink action={primaryAction} variant="primary" />
            <ButtonLink action={secondaryAction} variant="outline" />
          </div>
        </div>
      </div>

      {/* Tarjeta flotante de resultado. Es decorativa en móvil, así que se oculta. */}
      <div className="absolute right-12 bottom-12 hidden max-w-xs transform flex-col gap-4 rounded-xl border border-surface-container bg-surface-container-lowest/95 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 lg:flex">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon name={highlight.icon} className="text-primary" />
          </div>
          <div>
            <p className="font-headline-md text-headline-md text-on-surface">
              {highlight.value}
            </p>
            <p className="font-caption text-caption text-on-surface-variant">
              {highlight.label}
            </p>
          </div>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${highlight.progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
