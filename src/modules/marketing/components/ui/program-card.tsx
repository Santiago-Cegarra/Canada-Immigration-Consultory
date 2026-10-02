import Image from "next/image";
import type { Program } from "../../types";
import { ButtonLink } from "./button-link";
import { Icon } from "./icon";

type ProgramCardProps = Program & {
  /** Texto del botón de la tarjeta; es el mismo para todas, por eso no va en `Program`. */
  actionLabel: string;
};

/**
 * Tarjeta de un programa del catálogo.
 *
 * La imagen va a sangre arriba porque la tarjeta recorta con `overflow-hidden`;
 * el HTML original lo lograba con márgenes negativos que había que mantener
 * sincronizados con el padding responsive.
 */
export function ProgramCard({
  icon,
  category,
  title,
  description,
  image,
  href,
  actionLabel,
}: ProgramCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-shadow duration-400 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="relative h-48 w-full shrink-0 overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed/30 text-on-primary-fixed-variant transition-transform duration-300 group-hover:scale-110">
          <Icon name={icon} className="text-[24px]" />
        </div>

        <span className="mb-3 self-start rounded bg-surface-container px-2.5 py-1 font-caption text-caption text-on-surface-variant">
          {category.label}
        </span>
        <h3 className="mb-3 font-headline-md text-headline-md text-on-surface transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="line-clamp-3 font-body-md text-body-md text-on-surface-variant">
          {description}
        </p>

        <div className="mt-auto pt-6">
          <ButtonLink
            action={{ label: actionLabel, href, icon: "arrow_forward" }}
            variant="secondary"
            size="sm"
            className="w-full"
          />
        </div>
      </div>
    </article>
  );
}
