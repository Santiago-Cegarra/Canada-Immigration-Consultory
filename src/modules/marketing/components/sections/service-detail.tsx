import Image from "next/image";
import Link from "next/link";
import { serviciosContent } from "../../content/servicios";
import {
  bookingPath,
  categoryPath,
  type ServiceMatch,
  servicePath,
} from "../../services";
import { Breadcrumb } from "../ui/breadcrumb";
import { ButtonLink } from "../ui/button-link";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";

/**
 * Página de detalle de un trámite: cabecera con la imagen de su categoría,
 * para quién es, qué incluye la asesoría, la llamada a reservar y el resto de
 * trámites de la categoría.
 *
 * Los textos del trámite vienen de `content/servicios.ts`; los títulos fijos de
 * la página, de `serviciosContent.detail`.
 */
export function ServiceDetail({ category, process }: ServiceMatch) {
  const { detail } = serviciosContent;
  const bookingAction = {
    label: detail.booking.label,
    href: bookingPath(process),
    icon: "calendar_month",
  } as const;
  const related = category.processes.filter(
    ({ slug }) => slug !== process.slug,
  );

  return (
    <article className="flex w-full flex-col">
      <header className="relative w-full overflow-hidden bg-inverse-surface">
        {category.image ? (
          <Image
            src={category.image.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          // Sin foto todavía: el mismo fondo de marca que su tarjeta.
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-on-primary-fixed-variant via-inverse-surface to-inverse-surface"
          />
        )}
        {/* Oscurece la foto para que el texto blanco sea legible. */}
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50"
        />

        <Container className="relative flex flex-col gap-6 py-10 lg:py-16">
          <Breadcrumb
            label={detail.breadcrumbLabel}
            items={[
              { label: detail.homeLabel, href: "/" },
              { label: detail.servicesLabel, href: "/servicios" },
              { label: category.title, href: categoryPath(category) },
              { label: process.title },
            ]}
          />

          <div className="flex max-w-3xl flex-col gap-4">
            <p className="flex items-center gap-2 font-label-md text-label-md tracking-widest text-primary-fixed-dim uppercase">
              <Icon name={category.icon} className="text-[20px]" />
              {category.title}
            </p>
            <h1 className="font-headline-lg text-headline-lg-mobile text-white md:text-headline-lg">
              {process.title}
            </h1>
            <p className="font-body-lg text-body-lg text-white/85">
              {process.summary}
            </p>
          </div>

          <ButtonLink
            action={bookingAction}
            className="w-full self-start sm:w-auto"
          />
        </Container>
      </header>

      <Container className="grid grid-cols-1 gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 lg:py-16">
        <div className="flex flex-col gap-10">
          <section aria-labelledby="para-quien">
            <h2
              id="para-quien"
              className="mb-4 font-headline-md text-headline-md text-on-surface"
            >
              {detail.audienceTitle}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {process.audience}
            </p>
          </section>

          <section aria-labelledby="que-incluye">
            <h2
              id="que-incluye"
              className="mb-4 font-headline-md text-headline-md text-on-surface"
            >
              {detail.includesTitle}
            </h2>
            <ul className="flex flex-col gap-3">
              {process.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-lg bg-surface-container-lowest p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                >
                  <Icon
                    name="check_circle"
                    filled
                    className="mt-0.5 shrink-0 text-[22px] text-primary"
                  />
                  <span className="font-body-md text-body-md text-on-surface">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <p className="font-caption text-caption text-on-surface-variant">
            {detail.disclaimer}
          </p>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] lg:p-8">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {detail.booking.title}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {detail.booking.description}
            </p>
            <ButtonLink action={bookingAction} className="w-full" />
          </div>
        </aside>
      </Container>

      {related.length > 0 && (
        <section
          aria-labelledby="otros-tramites"
          className="w-full bg-surface-container-low py-12 lg:py-16"
        >
          <Container>
            <h2
              id="otros-tramites"
              className="mb-6 font-headline-md text-headline-md text-on-surface"
            >
              {detail.relatedTitle}
            </h2>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {related.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={servicePath({ category, process: other })}
                    className="group flex h-full items-start gap-3 rounded-lg border border-surface-container-high bg-surface-container-lowest p-4 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="flex-1 font-label-md text-label-md text-on-surface group-hover:text-primary">
                      {other.title}
                    </span>
                    <Icon
                      name="arrow_forward"
                      className="mt-0.5 shrink-0 text-[18px] text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </article>
  );
}
