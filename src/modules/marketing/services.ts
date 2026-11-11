import { serviciosContent } from "./content/servicios";
import type { ServiceCategory, ServiceProcess } from "./types";

/**
 * Consultas sobre el catálogo de servicios. El contenido vive en
 * `content/servicios.ts`; aquí solo se busca y se construyen rutas, para que
 * las páginas, la reserva y los correos no repitan esa lógica.
 */

export type ServiceMatch = {
  category: ServiceCategory;
  process: ServiceProcess;
};

export const serviceCategories: readonly ServiceCategory[] =
  serviciosContent.catalog.categories;

/** Trámite a partir de los dos segmentos de `/servicios/<categoria>/<proceso>`. */
export function findService(
  categorySlug: string,
  processSlug: string,
): ServiceMatch | null {
  const category = serviceCategories.find(({ slug }) => slug === categorySlug);
  const process = category?.processes.find(({ slug }) => slug === processSlug);
  return category && process ? { category, process } : null;
}

/**
 * Trámite a partir solo de su slug (`/agendar?servicio=<slug>`). El slug llega
 * desde la URL, así que puede ser cualquier cosa: si no existe, devuelve `null`.
 */
export function findServiceBySlug(processSlug: string): ServiceMatch | null {
  for (const category of serviceCategories) {
    const process = category.processes.find(({ slug }) => slug === processSlug);
    if (process) return { category, process };
  }
  return null;
}

export function servicePath({ category, process }: ServiceMatch): string {
  return `/servicios/${category.slug}/${process.slug}`;
}

/** La tarjeta de la categoría dentro de `/servicios`; el catálogo la abre sola. */
export function categoryPath(category: ServiceCategory): string {
  return `/servicios#${category.slug}`;
}

export function bookingPath(process: ServiceProcess): string {
  return `/agendar?servicio=${encodeURIComponent(process.slug)}`;
}

/** Nombre del trámite tal como se guarda en la cita y se muestra al equipo. */
export function serviceLabel({ category, process }: ServiceMatch): string {
  return `${category.title} — ${process.title}`;
}
