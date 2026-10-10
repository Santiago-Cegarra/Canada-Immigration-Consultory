import type Stripe from "stripe";
import {
  markAppointmentFailed,
  markAppointmentPaid,
} from "@/modules/citas/appointments";

/**
 * Aplica a la cita el resultado de un evento de Stripe Checkout. El evento ya
 * llega verificado (firma comprobada en el route handler).
 *
 * - Pago completado → la cita queda pagada.
 * - Sesión caducada o pago asíncrono fallido → se libera el horario.
 *
 * No hay lógica de reembolsos: la política de la firma es sin reembolsos.
 */
export async function applyCheckoutEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;
      if (appointmentId && session.payment_status === "paid") {
        await markAppointmentPaid(appointmentId);
      }
      return;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const appointmentId = event.data.object.metadata?.appointmentId;
      if (appointmentId) await markAppointmentFailed(appointmentId);
      return;
    }
    default:
      return;
  }
}
