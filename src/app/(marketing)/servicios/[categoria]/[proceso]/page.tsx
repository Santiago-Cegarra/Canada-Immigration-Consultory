import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/modules/marketing/components/sections/service-detail";
import { serviciosContent } from "@/modules/marketing/content/servicios";
import { findService, serviceCategories } from "@/modules/marketing/services";

type ServicePageProps = PageProps<"/servicios/[categoria]/[proceso]">;

/**
 * Los trámites se conocen en el build (están en `content/servicios.ts`), así
 * que cada página se genera como HTML estático.
 */
export function generateStaticParams() {
  return serviceCategories.flatMap((category) =>
    category.processes.map((process) => ({
      categoria: category.slug,
      proceso: process.slug,
    })),
  );
}

/** Título y descripción propios de cada trámite. */
export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { categoria, proceso } = await params;
  const match = findService(categoria, proceso);

  if (!match) {
    return {
      title: serviciosContent.notFound.title,
      robots: { index: false },
    };
  }

  return {
    title: `${match.process.title} | ${match.category.title}`,
    description: match.process.summary,
  };
}

/**
 * Detalle de un trámite (`/servicios/<categoria>/<proceso>`). Solo resuelve la
 * URL; el contenido se edita en `src/modules/marketing/content/servicios.ts`.
 * Si el trámite no existe se muestra `not-found.tsx`, con el 404 del sitio.
 */
export default async function ServicePage({ params }: ServicePageProps) {
  const { categoria, proceso } = await params;
  const match = findService(categoria, proceso);
  if (!match) notFound();

  return <ServiceDetail {...match} />;
}
