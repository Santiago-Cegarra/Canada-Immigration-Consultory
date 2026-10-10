import type { Metadata } from "next";
import {
  AboutCta,
  AboutHero,
  AccreditationStrip,
  Headquarters,
  Leadership,
  ValuesGrid,
} from "@/modules/marketing/components/sections/about-sections";
import { nosotrosContent } from "@/modules/marketing/content/nosotros";

export const metadata: Metadata = nosotrosContent.seo;

/**
 * "Acerca de Nosotros" (`/nosotros`): quiénes somos, quién atiende y cómo
 * verificarlo. Los textos y los datos de los directores se editan en
 * `src/modules/marketing/content/nosotros.ts`.
 */
export default function AboutPage() {
  const { accreditation, hero, leadership, values, headquarters, cta } =
    nosotrosContent;

  return (
    <div className="flex w-full flex-col">
      <AccreditationStrip {...accreditation} />
      <AboutHero {...hero} />
      <Leadership {...leadership} />
      <ValuesGrid {...values} />
      <Headquarters {...headquarters} />
      <AboutCta {...cta} />
    </div>
  );
}
