import type { Metadata } from "next";
import { CONSULTATION, formatSlotLong } from "@/modules/citas/schedule";
import { BookingSteps } from "@/modules/marketing/components/sections/booking-steps";
import { ButtonLink } from "@/modules/marketing/components/ui/button-link";
import { Container } from "@/modules/marketing/components/ui/container";
import { Icon } from "@/modules/marketing/components/ui/icon";
import { agendarContent } from "@/modules/marketing/content/agendar";
import type { MaterialSymbol } from "@/modules/marketing/types";
import { resolveCheckoutReturn } from "@/modules/pagos/checkout";

export const metadata: Metadata = {
  title: agendarContent.confirmation.seoTitle,
  // Página personal de cada reserva: no debe aparecer en buscadores.
  robots: { index: false },
};

type ViewState = {
  icon: MaterialSymbol;
  title: string;
  body: string;
  step: number;
};

/**
 * Vuelta desde Stripe (`/agendar/confirmacion?session_id=…`). Muestra si la
 * consulta quedó pagada, si el pago se está confirmando, o si no hay reserva.
 * No muestra datos personales: solo la fecha y la hora.
 */
export default async function BookingConfirmationPage({
  searchParams,
}: PageProps<"/agendar/confirmacion">) {
  const { session_id: sessionParam } = await searchParams;
  const sessionId = typeof sessionParam === "string" ? sessionParam : null;
  const result = sessionId
    ? await resolveCheckoutReturn(sessionId)
    : ({ status: "not_found" } as const);

  const { confirmation: text, steps, seal } = agendarContent;
  const when =
    result.status === "not_found"
      ? null
      : `${formatSlotLong(result.start, CONSULTATION.timeZone)} (${text.timeZoneNote})`;

  const view: ViewState =
    result.status === "paid"
      ? {
          icon: "check_circle",
          title: text.paidTitle,
          body: text.paidBody,
          step: 2,
        }
      : result.status === "pending"
        ? {
            icon: "hourglass_top",
            title: text.pendingTitle,
            body: text.pendingBody,
            step: 1,
          }
        : {
            icon: "event_busy",
            title: text.missingTitle,
            body: text.missingBody,
            step: 0,
          };

  return (
    <div className="flex w-full flex-col">
      <BookingSteps steps={steps} current={view.step} seal={seal} />
      <section className="w-full py-16 lg:py-24">
        <Container className="flex justify-center">
          <div
            role="status"
            className="flex w-full max-w-xl flex-col items-start gap-5 rounded-2xl border border-surface-container bg-surface-container-lowest p-8 md:p-10"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name={view.icon} className="text-[28px]" />
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {view.title}
            </h1>
            {when && (
              <p className="font-label-md text-label-md text-on-surface first-letter:uppercase">
                {when}
              </p>
            )}
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {view.body}
            </p>
            {result.status === "paid" && (
              <p className="font-body-md text-body-md text-on-surface-variant">
                {text.paidPolicy}
              </p>
            )}

            <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
              {result.status === "paid" && (
                <ButtonLink
                  action={{ label: text.backHome, href: "/" }}
                  size="md"
                />
              )}
              {result.status === "pending" && sessionId && (
                <ButtonLink
                  action={{
                    label: text.refreshLabel,
                    href: `/agendar/confirmacion?session_id=${encodeURIComponent(sessionId)}`,
                  }}
                  size="md"
                />
              )}
              {result.status === "not_found" && (
                <>
                  <ButtonLink
                    action={{ label: text.backToBooking, href: "/agendar" }}
                    size="md"
                  />
                  <ButtonLink
                    action={{ label: text.contact, href: "/contacto" }}
                    variant="secondary"
                    size="md"
                  />
                </>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
