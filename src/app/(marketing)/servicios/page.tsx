import type { Metadata } from "next";
import { EvaluationCta } from "@/modules/marketing/components/sections/evaluation-cta";
import { ProgramCatalog } from "@/modules/marketing/components/sections/program-catalog";
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

  return (
    <div className="relative isolate flex w-full flex-col">
      <PageBackdrop />
      <ServicesHeader {...header} />
      <ProgramCatalog {...catalog} />
      <WhyChooseUs {...whyChooseUs} />
      <EvaluationCta {...cta} />
    </div>
  );
}
