import type { Metadata } from "next";
import { EvaluationCta } from "@/modules/marketing/components/sections/evaluation-cta";
import { ServiceCatalog } from "@/modules/marketing/components/sections/service-catalog";
import { ServicesHeader } from "@/modules/marketing/components/sections/services-header";
import { WhyChooseUs } from "@/modules/marketing/components/sections/why-choose-us";
import { PageBackdrop } from "@/modules/marketing/components/ui/page-backdrop";
import { serviciosContent } from "@/modules/marketing/content/servicios";

export const metadata: Metadata = serviciosContent.seo;

/**
 * Página de servicios (`/servicios`). Solo decide qué secciones se muestran y en
 * qué orden, y les pasa su contenido; los textos se editan en
 * `src/modules/marketing/content/servicios.ts`.
 *
 * `isolate` es necesario para que `PageBackdrop` (z-index negativo) quede visible.
 */
export default function ServicesPage() {
  const { header, catalog, whyChooseUs, cta } = serviciosContent;

  // El catálogo es Client Component: solo recibe lo que pinta en las tarjetas,
  // no los textos completos de los 55 trámites.
  const categories = catalog.categories.map(({ processes, ...category }) => ({
    ...category,
    processes: processes.map(({ slug, title, summary }) => ({
      slug,
      title,
      summary,
    })),
  }));

  return (
    <div className="relative isolate flex w-full flex-col">
      <PageBackdrop />
      <ServicesHeader {...header} />
      <ServiceCatalog
        categories={categories}
        countLabel={catalog.countLabel}
        closeLabel={catalog.closeLabel}
        listLabel={catalog.listLabel}
      />
      <WhyChooseUs {...whyChooseUs} />
      <EvaluationCta {...cta} />
    </div>
  );
}
