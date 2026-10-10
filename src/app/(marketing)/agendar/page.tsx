import type { Metadata } from "next";
import { connection } from "next/server";
import { getTakenStarts } from "@/modules/citas/appointments";
import {
  addDays,
  buildAvailability,
  CONSULTATION,
  formatPrice,
  toZonedDay,
  zonedTimeToUtc,
} from "@/modules/citas/schedule";
import { BookingAssurances } from "@/modules/marketing/components/sections/booking-assurances";
import { BookingCheckout } from "@/modules/marketing/components/sections/booking-checkout";
import { BookingSteps } from "@/modules/marketing/components/sections/booking-steps";
import { BookingSummary } from "@/modules/marketing/components/sections/booking-summary";
import { Container } from "@/modules/marketing/components/ui/container";
import { agendarContent } from "@/modules/marketing/content/agendar";

export const metadata: Metadata = agendarContent.seo;

/**
 * Horarios ocupados en el horizonte de reserva. Si la base de datos no
 * responde, la página se muestra igual con todos los horarios: la reserva
 * vuelve a comprobar la disponibilidad antes de cobrar.
 */
async function loadTakenStarts(now: Date): Promise<Set<string>> {
  const lastDay = addDays(
    toZonedDay(now, CONSULTATION.timeZone),
    CONSULTATION.bookingHorizonDays + 1,
  );
  try {
    return await getTakenStarts(
      now,
      zonedTimeToUtc(lastDay, "00:00", CONSULTATION.timeZone),
      now,
    );
  } catch {
    return new Set();
  }
}

/**
 * Reserva de la consulta (`/agendar`). La disponibilidad cambia con cada
 * reserva, así que la página se genera en cada visita y nunca en el build.
 * Los textos se editan en `src/modules/marketing/content/agendar.ts`.
 */
export default async function BookingPage() {
  await connection();
  const now = new Date();
  const days = buildAvailability(now, await loadTakenStarts(now));
  const price = formatPrice(CONSULTATION.priceCents);
  const { steps, seal, summary, faqTitle, faq, assurances } = agendarContent;

  return (
    <div className="flex w-full flex-col">
      <BookingSteps steps={steps} current={0} seal={seal} />
      <section className="w-full py-10 lg:py-14">
        <Container>
          <BookingCheckout
            days={days}
            price={price}
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
