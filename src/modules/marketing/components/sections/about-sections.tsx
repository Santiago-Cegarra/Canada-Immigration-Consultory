import type { Feature, MaterialSymbol } from "../../types";
import type { Director, FactItem, InfoItem } from "../../content/nosotros";
import { ButtonLink } from "../ui/button-link";
import { Container } from "../ui/container";
import { DirectorCard } from "../ui/director-card";
import { Icon } from "../ui/icon";
import { PillarCard } from "../ui/pillar-card";

/*
 * Secciones de "Acerca de Nosotros". Viven juntas porque solo las usa esa
 * página; cada una recibe su contenido por props desde `content/nosotros.ts`.
 */

type IconLabel = { icon: MaterialSymbol; label: string };

/** Antetítulo de sección: trazo rojo + etiqueta en mayúsculas. */
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-2 font-label-md text-label-md tracking-wider text-primary uppercase">
      <span aria-hidden className="h-[2px] w-6 bg-primary" />
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------

export function AccreditationStrip({
  title,
  items,
}: {
  title: string;
  items: readonly IconLabel[];
}) {
  return (
    <section className="w-full border-b border-surface-container bg-surface-container-low py-3">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="flex items-center gap-2 font-label-md text-caption tracking-wider text-on-surface uppercase">
          <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />
          {title}
        </p>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
          {items.map(({ icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 font-caption text-caption text-on-surface-variant"
            >
              <Icon name={icon} className="text-[16px] text-primary" />
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------

/**
 * Hero institucional sobre fondo oscuro, sin fotografía: la del diseño mostraba
 * el rótulo de otro bufete real. El peso lo llevan el titular y los hechos.
 */
export function AboutHero({
  eyebrow,
  title,
  description,
  facts,
}: {
  eyebrow: string;
  title: string;
  description: string;
  facts: readonly FactItem[];
}) {
  return (
    <section className="surface-dark relative w-full overflow-hidden bg-inverse-surface py-20 lg:py-28">
      {/* Trazo rojo superior: el único color de marca del hero. */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-primary" />
      <Container>
        <div className="max-w-3xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-inverse-on-surface/20 px-4 py-1.5 font-label-md text-label-md tracking-wider text-inverse-on-surface uppercase">
            <Icon name="account_balance" className="text-[16px] text-primary" />
            {eyebrow}
          </p>
          <h1 className="mb-6 font-display-lg text-[40px] leading-tight text-inverse-on-surface md:text-display-lg">
            {title}
          </h1>
          <p className="mb-12 max-w-2xl font-body-lg text-body-lg text-inverse-on-surface/85">
            {description}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {facts.map(({ icon, title: factTitle, description: text }) => (
            <li
              key={factTitle}
              className="flex flex-col gap-3 rounded-xl border border-inverse-on-surface/15 bg-inverse-on-surface/5 p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary">
                <Icon name={icon} className="text-[22px]" />
              </span>
              <p className="font-headline-md text-headline-md text-inverse-on-surface">
                {factTitle}
              </p>
              <p className="font-body-md text-body-md text-inverse-on-surface/80">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function Leadership({
  eyebrow,
  title,
  description,
  directors,
  ...labels
}: {
  eyebrow: string;
  title: string;
  description: string;
  directors: readonly Director[];
  specialtiesTitle: string;
  verifyLabel: string;
  licenseLabel: string;
  bookLabel: string;
}) {
  return (
    <section className="w-full bg-surface-container-low py-20">
      <Container>
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end lg:mb-16">
          <div>
            <SectionEyebrow>{eyebrow}</SectionEyebrow>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {title}
            </h2>
          </div>
          <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {directors.map((director) => (
            <DirectorCard key={director.name} {...director} labels={labels} />
          ))}
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function ValuesGrid({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: readonly Feature[];
}) {
  return (
    <section className="w-full bg-surface py-20">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
          <p className="mb-3 font-label-md text-label-md tracking-wider text-primary uppercase">
            {eyebrow}
          </p>
          <h2 className="mb-4 font-headline-lg text-headline-lg text-on-surface">
            {title}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {description}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((value) => (
            <li key={value.title}>
              <PillarCard {...value} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------

/**
 * Sede. En lugar de una foto de oficina (la del diseño es generada), una ficha
 * con la dirección real y el enlace al mapa.
 */
export function Headquarters({
  eyebrow,
  title,
  description,
  address,
  addressLabel,
  mapLabel,
  mapUrl,
  remoteNote,
  info,
}: {
  eyebrow: string;
  title: string;
  description: string;
  address: string;
  addressLabel: string;
  mapLabel: string;
  mapUrl: string;
  remoteNote: string;
  info: readonly InfoItem[];
}) {
  return (
    <section className="w-full bg-surface-container-low py-20">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="surface-dark relative flex min-h-[320px] flex-col justify-between gap-10 overflow-hidden rounded-2xl bg-inverse-surface p-8 lg:col-span-7 lg:min-h-[420px] lg:p-12">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-primary"
          />
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-inverse-on-surface/20 px-3 py-1 font-label-md text-caption tracking-wider text-inverse-on-surface uppercase">
            {addressLabel}
          </span>
          <div className="flex flex-col gap-4">
            <Icon name="location_on" className="text-[40px] text-primary" />
            <p className="font-headline-lg text-headline-lg text-inverse-on-surface">
              {address}
            </p>
            <p className="flex items-center gap-2 font-body-md text-body-md text-inverse-on-surface/80">
              <Icon name="videocam" className="text-[20px]" />
              {remoteNote}
            </p>
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 self-start font-label-md text-label-md text-inverse-on-surface underline decoration-inverse-on-surface/40 underline-offset-4 transition-colors hover:decoration-inverse-on-surface"
          >
            {mapLabel}
            <Icon name="open_in_new" className="text-[18px]" />
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
        </div>

        <div className="flex flex-col lg:col-span-5">
          <SectionEyebrow>{eyebrow}</SectionEyebrow>
          <h2 className="mb-6 font-headline-lg text-headline-lg text-on-surface">
            {title}
          </h2>
          <p className="mb-8 font-body-md text-body-md text-on-surface-variant">
            {description}
          </p>
          <ul className="flex flex-col gap-4">
            {info.map(({ icon, title: itemTitle, value, href, note }) => (
              <li
                key={itemTitle}
                className="flex items-start gap-4 rounded-xl border border-surface-container bg-surface-container-lowest p-4"
              >
                <Icon
                  name={icon}
                  className="mt-0.5 shrink-0 text-[24px] text-primary"
                />
                <div>
                  <p className="font-label-md text-label-md text-on-surface">
                    {itemTitle}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="font-body-md text-body-md text-on-surface-variant underline decoration-outline-variant underline-offset-4 transition-colors hover:text-primary"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {value}
                    </p>
                  )}
                  {note && (
                    <p className="font-caption text-caption text-on-surface-variant">
                      {note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------

export function AboutCta({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  trust,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primary: { label: string; href: string; icon: MaterialSymbol };
  secondary: { label: string; href: string };
  trust: readonly IconLabel[];
}) {
  return (
    <section className="w-full bg-surface py-20">
      <Container>
        <div className="surface-dark relative overflow-hidden rounded-2xl bg-inverse-surface p-8 sm:p-10 lg:p-16">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-primary"
          />
          <div className="relative max-w-3xl">
            <p className="mb-6 inline-block rounded-full bg-primary px-3 py-1 font-label-md text-caption tracking-wider text-on-primary uppercase">
              {eyebrow}
            </p>
            <h2 className="mb-6 font-display-lg text-[36px] leading-tight text-inverse-on-surface md:text-display-lg">
              {title}
            </h2>
            <p className="mb-10 max-w-2xl font-body-lg text-body-lg text-inverse-on-surface/85">
              {description}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <ButtonLink action={primary} />
              <ButtonLink action={secondary} variant="outline" />
            </div>
            <ul className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-inverse-on-surface/15 pt-8">
              {trust.map(({ icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 font-caption text-caption text-inverse-on-surface/85"
                >
                  <Icon name={icon} className="text-[18px] text-primary" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
