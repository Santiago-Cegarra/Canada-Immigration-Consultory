"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import type { ServiceCategory, ServiceProcess } from "../../types";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";

/** Lo que el catálogo necesita de cada trámite: el detalle vive en su página. */
type CatalogProcess = Pick<ServiceProcess, "slug" | "title" | "summary">;

export type CatalogCategory = Pick<
  ServiceCategory,
  "slug" | "title" | "icon" | "image"
> & { processes: readonly CatalogProcess[] };

type ServiceCatalogProps = {
  categories: readonly CatalogCategory[];
  /** Plantillas con `{count}`, p. ej. "{count} trámites". */
  countLabel: { one: string; other: string };
  closeLabel: string;
  /** Nombre accesible del listado. */
  listLabel: string;
};

/*
 * `#<slug>` en la URL abre esa categoría al llegar (así enlaza el breadcrumb de
 * la página de detalle). `useSyncExternalStore` lee el hash en el cliente sin
 * desajustes de hidratación: en el servidor no hay hash.
 */
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const readHash = () => decodeURIComponent(window.location.hash.slice(1));
const readServerHash = () => "";

const buttonId = (slug: string) => `servicio-${slug}-boton`;
const panelId = (slug: string) => `servicio-${slug}-panel`;

/**
 * Catálogo de servicios: una tarjeta por categoría y, al pulsarla, un panel con
 * sus trámites.
 *
 * El panel va en el DOM justo después de su tarjeta (así el foco del teclado
 * pasa de la tarjeta a sus trámites) pero ocupa una fila entera de la rejilla.
 * `grid-flow-row-dense` hace que las tarjetas siguientes rellenen los huecos de
 * la fila de la tarjeta abierta, de modo que el panel queda debajo de la fila
 * completa con cualquier número de columnas, sin calcularlo en JavaScript.
 *
 * Client Component por el estado de la categoría abierta.
 */
export function ServiceCatalog({
  categories,
  countLabel,
  closeLabel,
  listLabel,
}: ServiceCatalogProps) {
  const hash = useSyncExternalStore(subscribeToHash, readHash, readServerHash);
  // `undefined`: el visitante aún no ha tocado nada y manda el hash de la URL.
  const [choice, setChoice] = useState<string | null | undefined>(undefined);
  const hashSlug = categories.some(({ slug }) => slug === hash) ? hash : null;
  const openSlug = choice === undefined ? hashSlug : choice;

  const panelRef = useRef<HTMLLIElement>(null);

  // Desplaza hasta el panel recién abierto, sin animación si el visitante
  // pidió reducir el movimiento.
  useEffect(() => {
    if (!openSlug) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    panelRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }, [openSlug]);

  // Escape cierra el panel y devuelve el foco a su tarjeta.
  useEffect(() => {
    if (!openSlug) return;
    const slug = openSlug;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setChoice(null);
      document.getElementById(buttonId(slug))?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openSlug]);

  return (
    <section className="w-full pb-12 lg:pb-24">
      <Container>
        <ul
          aria-label={listLabel}
          className="grid grid-flow-row-dense grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {categories.flatMap((category) => {
            const isOpen = category.slug === openSlug;
            const count = category.processes.length;
            const countText = (
              count === 1 ? countLabel.one : countLabel.other
            ).replace("{count}", String(count));

            const card = (
              <li
                key={category.slug}
                id={category.slug}
                className="scroll-mt-28"
              >
                <h2 className="h-full">
                  <button
                    type="button"
                    id={buttonId(category.slug)}
                    aria-expanded={isOpen}
                    aria-controls={panelId(category.slug)}
                    onClick={() => setChoice(isOpen ? null : category.slug)}
                    className={cn(
                      "group relative flex h-full min-h-64 w-full cursor-pointer flex-col justify-end overflow-hidden rounded-xl bg-inverse-surface p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.16)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary lg:p-8",
                      isOpen && "ring-3 ring-primary ring-offset-2",
                    )}
                  >
                    {category.image ? (
                      <Image
                        src={category.image.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      // Sin foto todavía: fondo de marca en lugar de un hueco.
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-br from-on-primary-fixed-variant via-inverse-surface to-inverse-surface"
                      />
                    )}
                    {/* Oscurece la foto para que el texto blanco sea legible. */}
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30"
                    />

                    <span className="relative flex flex-col gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
                        <Icon name={category.icon} className="text-[24px]" />
                      </span>
                      <span className="font-headline-md text-headline-md text-white">
                        {category.title}
                      </span>
                      <span className="flex items-center justify-between gap-3 font-label-md text-label-md text-white/85">
                        {countText}
                        <Icon
                          name="expand_more"
                          className={cn(
                            "text-[24px] transition-transform duration-300 motion-reduce:transition-none",
                            isOpen && "rotate-180",
                          )}
                        />
                      </span>
                    </span>
                  </button>
                </h2>
              </li>
            );

            if (!isOpen) return [card];

            return [
              card,
              <li
                key={`${category.slug}-panel`}
                ref={panelRef}
                id={panelId(category.slug)}
                role="region"
                aria-labelledby={buttonId(category.slug)}
                className="col-span-full scroll-mt-28 scroll-mb-6 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] motion-safe:animate-card-in lg:p-8"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-headline-md text-headline-md text-on-surface">
                      {category.title}
                    </p>
                    <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                      {countText}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setChoice(null);
                      document.getElementById(buttonId(category.slug))?.focus();
                    }}
                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 font-label-md text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <Icon name="close" className="text-[18px]" />
                    {closeLabel}
                  </button>
                </div>

                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {category.processes.map((process) => (
                    <li key={process.slug}>
                      <Link
                        href={`/servicios/${category.slug}/${process.slug}`}
                        className="group/link flex h-full items-start gap-3 rounded-lg border border-surface-container-high p-4 transition-colors hover:border-primary hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <span className="flex flex-1 flex-col gap-1">
                          <span className="font-label-md text-label-md text-on-surface group-hover/link:text-primary">
                            {process.title}
                          </span>
                          <span className="line-clamp-2 font-caption text-caption text-on-surface-variant">
                            {process.summary}
                          </span>
                        </span>
                        <Icon
                          name="arrow_forward"
                          className="mt-0.5 shrink-0 text-[18px] text-primary transition-transform group-hover/link:translate-x-1 motion-reduce:transition-none"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>,
            ];
          })}
        </ul>
      </Container>
    </section>
  );
}
