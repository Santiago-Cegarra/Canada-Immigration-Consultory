import { FinalCta } from "@/modules/marketing/components/sections/final-cta";
import { Hero } from "@/modules/marketing/components/sections/hero";
import { Process } from "@/modules/marketing/components/sections/process";
import { Results } from "@/modules/marketing/components/sections/results";
import { Services } from "@/modules/marketing/components/sections/services";
import { TrustBadges } from "@/modules/marketing/components/sections/trust-badges";

/**
 * Portada. Esta página solo decide qué secciones se muestran y en qué orden:
 * reordenar la página es mover una línea, y los textos se editan en
 * `src/modules/marketing/content/home.ts`.
 */
export default function HomePage() {
  return (
    <div className="flex w-full flex-col">
      <Hero />
      <TrustBadges />
      <Services />
      <Process />
      <Results />
      <FinalCta />
    </div>
  );
}
