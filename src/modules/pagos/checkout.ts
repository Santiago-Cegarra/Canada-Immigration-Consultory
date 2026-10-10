import type Stripe from "stripe";
import {
  findAppointmentByCheckoutSession,
  markAppointmentPaid,
} from "@/modules/citas/appointments";
import { CONSULTATION, formatSlotLong } from "@/modules/citas/schedule";
import { getStripe } from "./stripe";

export type CheckoutReturn =
  | { status: "paid"; start: Date }
  | { status: "pending"; start: Date }
  | { status: "not_found" };

/**
 * Estado de una reserva cuando el cliente vuelve de Stripe.
 *
 * El webhook es quien confirma el pago, pero puede llegar unos segundos tarde
 * (o no llegar en desarrollo local). Si la cita sigue pendiente, se consulta la
 * sesión directamente a Stripe desde el servidor: es una fuente fiable, no un
 * dato que envíe el navegador.
 */
export async function resolveCheckoutReturn(
  sessionId: string,
): Promise<CheckoutReturn> {
  let appointment;
  try {
    appointment = await findAppointmentByCheckoutSession(sessionId);
  } catch {
    return { status: "not_found" };
  }
  if (!appointment) return { status: "not_found" };

  const start = appointment.startTime;
  if (appointment.paymentStatus === "PAID") return { status: "paid", start };
  if (appointment.paymentStatus === "FAILED") return { status: "not_found" };

  const stripe = getStripe();
  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        await markAppointmentPaid(appointment.id);
        return { status: "paid", start };
      }
    } catch {
      // Si Stripe no responde, se muestra como pendiente y el webhook lo resolverá.
    }
  }
  return { status: "pending", start };
}

type ConsultationCheckoutInput = {
  appointmentId: string;
  email: string;
  start: Date;
  /** Origen público del sitio, p. ej. `https://helpimmigrationcanada.net`. */
  baseUrl: string;
};

/**
 * Crea la sesión de Stripe Checkout para pagar una consulta.
 *
 * El cliente paga en la página segura de Stripe (tarjeta, Apple Pay, Google
 * Pay): los datos de la tarjeta nunca pasan por nuestro servidor. La sesión
 * caduca a la vez que se libera el horario apartado.
 */
export async function createConsultationCheckout(
  stripe: Stripe,
  { appointmentId, email, start, baseUrl }: ConsultationCheckoutInput,
): Promise<{ id: string; url: string | null }> {
  const expiresAt =
    Math.floor(Date.now() / 1000) + CONSULTATION.checkoutHoldMinutes * 60;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "es-419",
    customer_email: email,
    client_reference_id: appointmentId,
    metadata: { appointmentId },
    expires_at: expiresAt,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CONSULTATION.currency.toLowerCase(),
          unit_amount: CONSULTATION.priceCents,
          product_data: {
            name: `Consulta migratoria (${CONSULTATION.durationMinutes} min)`,
            description: `${formatSlotLong(start, CONSULTATION.timeZone)} (hora de Toronto)`,
          },
        },
      },
    ],
    success_url: `${baseUrl}/agendar/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/agendar`,
  });

  return { id: session.id, url: session.url };
}
