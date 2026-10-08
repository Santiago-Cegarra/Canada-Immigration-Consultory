import type { Metadata } from "next";
import { ContactForm } from "@/modules/marketing/components/sections/contact-form";
import { ContactInfo } from "@/modules/marketing/components/sections/contact-info";
import { PageBanner } from "@/modules/marketing/components/sections/page-banner";
import { Container } from "@/modules/marketing/components/ui/container";
import { contactoContent } from "@/modules/marketing/content/contacto";

export const metadata: Metadata = contactoContent.seo;

/**
 * Página de contacto (`/contacto`). Formulario a la izquierda y datos de
 * contacto a la derecha; en móvil se apilan. Los textos se editan en
 * `src/modules/marketing/content/contacto.ts`.
 */
export default function ContactPage() {
  return (
    <div className="flex w-full flex-col">
      <PageBanner {...contactoContent.banner} />
      <section className="w-full py-16 lg:py-24">
        <Container className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[3fr_2fr] lg:gap-12">
          <ContactForm />
          <ContactInfo />
        </Container>
      </section>
    </div>
  );
}
