import Image from "next/image";
import Link from "next/link";
import type { Director } from "../../content/nosotros";
import { Icon } from "./icon";

type DirectorCardProps = Director & {
  labels: {
    specialtiesTitle: string;
    verifyLabel: string;
    licenseLabel: string;
    bookLabel: string;
  };
};

/**
 * Ficha de un director: quién es, qué licencia tiene y dónde comprobarla.
 *
 * Sin foto real se muestran sus iniciales: nunca una cara que no sea la suya.
 * El enlace al registro oficial es la prueba de confianza más fuerte de la
 * página, porque el cliente la verifica por su cuenta.
 */
export function DirectorCard({
  name,
  initials,
  photo,
  badgeIcon,
  credential,
  role,
  regulator,
  licenseNumber,
  registerUrl,
  bio,
  specialties,
  location,
  labels,
}: DirectorCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-surface-container bg-surface-container-lowest p-6 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          {photo ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              width={128}
              height={128}
              className="h-28 w-28 rounded-xl object-cover sm:h-32 sm:w-32"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-28 w-28 items-center justify-center rounded-xl bg-surface-container font-display-lg text-headline-lg text-on-surface sm:h-32 sm:w-32"
            >
              {initials}
            </span>
          )}
          <span
            aria-hidden
            className="absolute -right-2 -bottom-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-on-primary"
          >
            <Icon name={badgeIcon} className="text-[18px]" />
          </span>
        </div>

        <div className="min-w-0">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-label-md text-caption text-primary">
            <Icon name="verified" className="text-[14px]" />
            {credential}
          </p>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            {name}
          </h3>
          <p className="font-label-md text-label-md text-on-surface-variant">
            {role}
          </p>
          <p className="font-caption text-caption text-on-surface-variant">
            {regulator}
          </p>
        </div>
      </div>

      <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
        {bio}
      </p>

      <div className="flex flex-col gap-3 border-t border-surface-container pt-6">
        <h4 className="font-label-md text-label-md tracking-wider text-on-surface uppercase">
          {labels.specialtiesTitle}
        </h4>
        <ul className="flex flex-col gap-2">
          {specialties.map((specialty) => (
            <li
              key={specialty}
              className="flex items-start gap-2.5 font-body-md text-body-md text-on-surface-variant"
            >
              <Icon
                name="check_circle"
                className="mt-0.5 shrink-0 text-[20px] text-primary"
              />
              {specialty}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-caption text-caption tracking-wider text-on-surface-variant uppercase">
          {location}
          {licenseNumber && ` • ${labels.licenseLabel} ${licenseNumber}`}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href={registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface underline decoration-outline-variant underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            {labels.verifyLabel}
            <Icon name="open_in_new" className="text-[16px]" />
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
          <Link
            href="/agendar"
            className="group/link inline-flex items-center gap-1 font-label-md text-label-md text-primary"
          >
            {labels.bookLabel}
            <Icon
              name="arrow_forward"
              className="text-[18px] transition-transform group-hover/link:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
