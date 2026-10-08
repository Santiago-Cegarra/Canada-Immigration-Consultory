import Image from "next/image";
import type { ImageAsset } from "../../types";
import { Icon } from "./icon";

export type TeamShowcaseProps = {
  image: ImageAsset;
  title: string;
  subtitle: string;
  /** Texto de la insignia de licencia (p. ej. "Licencia Oficial CICC #…"). */
  licenseLabel: string;
};

/**
 * Foto del equipo con una tarjeta de credenciales.
 *
 * En móvil la tarjeta va DEBAJO de la foto: superpuesta, como en el diseño,
 * taparía casi toda la imagen y podía desbordarla por arriba. Desde `md` flota
 * sobre la foto, con el degradado que la hace legible.
 *
 * La insignia de licencia se ve en todos los tamaños: en el HTML original se
 * ocultaba en móvil, y es justo el dato que da confianza.
 */
export function TeamShowcase({
  image,
  title,
  subtitle,
  licenseLabel,
}: TeamShowcaseProps) {
  return (
    <figure className="relative m-0 overflow-hidden rounded-2xl bg-surface-container-lowest shadow-xl">
      <div className="relative aspect-[4/3] w-full sm:aspect-video md:aspect-auto md:h-[480px] lg:h-[560px]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1280px) 1232px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 hidden bg-gradient-to-t from-on-surface/80 via-transparent to-transparent md:block" />
      </div>

      <figcaption className="flex flex-col items-start justify-between gap-4 border-t border-surface-container p-6 sm:flex-row sm:items-center md:absolute md:right-8 md:bottom-8 md:left-8 md:rounded-xl md:border md:bg-surface-container-lowest/95 md:shadow-lg md:backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon name="verified_user" className="text-[28px] text-primary" />
          </div>
          <div>
            <p className="font-headline-md text-[18px] leading-snug font-bold text-on-surface">
              {title}
            </p>
            <p className="font-caption text-caption text-on-surface-variant">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-lg bg-surface-container px-4 py-2">
          <Icon name="verified" className="text-[20px] text-primary" />
          <span className="font-label-md text-caption font-semibold text-on-surface">
            {licenseLabel}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
