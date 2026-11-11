import type { Metadata } from "next";
import { connection } from "next/server";
import { loadBookableProfessionals } from "@/modules/citas/appointments";
import { CONSULTATION, formatPrice } from "@/modules/citas/schedule";
import { BookingAssurances } from "@/modules/marketing/components/sections/booking-assurances";
import { BookingCheckout } from "@/modules/marketing/components/sections/booking-checkout";
import { BookingSteps } from "@/modules/marketing/components/sections/booking-steps";
import { BookingSummary } from "@/modules/marketing/components/sections/booking-summary";
import { Container } from "@/modules/marketing/components/ui/container";
import { agendarContent } from "@/modules/marketing/content/agendar";
import { findServiceBySlug, serviceLabel } from "@/modules/marketing/services";

export const metadata: Metadata = agendarContent.seo;

/**
 * Reserva de la consulta (`/agendar`). La disponibilidad cambia con cada
 * reserva, así que la página se genera en cada visita y nunca en el build.
 * Los textos se editan en `src/modules/marketing/content/agendar.ts`.
 */
export default async function BookingPage({
  searchParams,
}: PageProps<"/agendar">) {
  await connection();
  // `?servicio=<slug>` llega desde la página de un trámite. Si el slug no
  // existe se ignora: la reserva funciona igual, sin trámite asociado.
  const { servicio } = await searchParams;
  const service =
    typeof servicio === "string" ? findServiceBySlug(servicio) : null;
  const now = new Date();
  const professionals = await loadBookableProfessionals(now);
  const firstProf = professionals[0];
  const price = formatPrice(CONSULTATION.priceCents);
  const { steps, seal, summary, faqTitle, faq, assurances } = agendarContent;

  return (
    <div className="flex w-full flex-col">
      <BookingSteps steps={steps} current={0} seal={seal} />
      <section className="w-full py-10 lg:py-14">
        <Container>
          <BookingCheckout
            days={firstProf?.days ?? []}
            professionals={professionals}
            price={price}
            service={
              service && {
                slug: service.process.slug,
                title: serviceLabel(service),
              }
            }
            summary={<BookingSummary {...summary} price={price} />}
            assurances={
              <BookingAssurances
                faqTitle={faqTitle}
                faq={faq}
                assurances={assurances}
              />
            }
          />
        </Container>
      </section>
    </div>
  );
}
