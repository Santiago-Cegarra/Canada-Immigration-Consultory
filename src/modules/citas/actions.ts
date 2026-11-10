"use server";

import { redirect } from "next/navigation";
import { getBaseUrl } from "@/lib/base-url";
import { createConsultationCheckout } from "@/modules/pagos/checkout";
import { getStripe } from "@/modules/pagos/stripe";
import {
  attachCheckoutSession,
  findAppointmentByRescheduleToken,
  getProfessionalConsultationConfig,
  markAppointmentFailed,
  NoProfessionalError,
  RescheduleNotAllowedError,
  rescheduleAppointment,
  reserveSlot,
  SlotUnavailableError,
} from "./appointments";
import { CONSULTATION } from "./schedule";
import {
  type BookingErrors,
  type BookingField,
  validateBooking,
} from "./validation";

export type BookingFormState =
  | { status: "idle" }
  /*
   * `values` devuelve lo que escribió el usuario: React vacía el formulario
   * tras cada envío, y sin esto un error le borraría todo.
   */
  | {
      status: "invalid";
      errors: BookingErrors;
      values: Partial<Record<BookingField, string>>;
    }
  | {
      status: "error";
      message: string;
      values: Partial<Record<BookingField, string>>;
    };

function echoValues(formData: FormData): Partial<Record<BookingField, string>> {
  return Object.fromEntries(
    [...formData.entries()].filter(
      (entry): entry is [BookingField, string] =>
        typeof entry[1] === "string" && !entry[0].startsWith("$ACTION"),
    ),
  );
}

/**
 * Reserva una consulta: aparta el horario y lleva al cliente a pagar en Stripe.
 *
 * El horario queda apartado como "pendiente" mientras el cliente paga; el
 * webhook de Stripe lo confirma o lo libera. Nunca registrar los datos del
 * cliente en logs: son datos personales.
 */
export async function startBooking(
  _previousState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const now = new Date();
  const values = echoValues(formData);
  const rawProfId = values.professionalId;

  let config = CONSULTATION;
  try {
    const profConfig = await getProfessionalConsultationConfig(
      rawProfId && rawProfId !== "default" ? rawProfId : null,
    );
    config = profConfig.config;
  } catch {
    // Si no hay profesional en BD todavía, se valida con CONSULTATION y fallará limpiamente al reservar.
  }

  const result = validateBooking(formData, now, config);

  if (!result.ok) return { status: "invalid", errors: result.errors, values };

  const stripe = getStripe();
  if (!stripe) {
    return {
      status: "error",
      values,
      message:
        "El pago en línea todavía no está activo. Escríbenos desde la página de contacto y agendamos tu consulta.",
    };
  }

  let appointmentId: string;
  try {
    ({ id: appointmentId } = await reserveSlot(result.data, now));
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return {
        status: "invalid",
        values: { ...values, horario: "" },
        errors: {
          horario: "Alguien acaba de reservar ese horario. Elige otro.",
        },
      };
    }
    if (error instanceof NoProfessionalError) {
      return {
        status: "error",
        values,
        message:
          "La agenda no está disponible en este momento. Escríbenos desde la página de contacto.",
      };
    }
    return {
      status: "error",
      values,
      message:
        "No pudimos apartar tu horario. Inténtalo de nuevo en unos minutos.",
    };
  }

  let checkoutUrl: string | null = null;
  try {
    const session = await createConsultationCheckout(stripe, {
      appointmentId,
      email: result.data.email,
      start: result.data.start,
      baseUrl: await getBaseUrl(),
    });
    await attachCheckoutSession(appointmentId, session.id);
    checkoutUrl = session.url;
  } catch {
    // Sin sesión de pago no hay forma de completar la reserva: se libera.
    await markAppointmentFailed(appointmentId);
  }

  if (!checkoutUrl) {
    return {
      status: "error",
      values,
      message:
        "No pudimos iniciar el pago. Inténtalo de nuevo en unos minutos.",
    };
  }

  // Fuera del try: `redirect` funciona lanzando una excepción especial.
  redirect(checkoutUrl);
}

export type RescheduleFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; newStartIso: string };

export async function rescheduleByClientAction(
  _previousState: RescheduleFormState,
  formData: FormData,
): Promise<RescheduleFormState> {
  const token = String(formData.get("token") ?? "").trim();
  const horario = String(formData.get("horario") ?? "").trim();

  if (!token) {
    return { status: "error", message: "Enlace de reprogramación no válido." };
  }
  if (!horario) {
    return {
      status: "error",
      message: "Elige un nuevo día y hora en el calendario.",
    };
  }

  const newStart = new Date(horario);
  if (Number.isNaN(newStart.getTime())) {
    return {
      status: "error",
      message: "El horario seleccionado no es válido.",
    };
  }

  const now = new Date();
  const appointment = await findAppointmentByRescheduleToken(token, now);
  if (!appointment) {
    return {
      status: "error",
      message: "No encontramos una cita activa asociada a este enlace.",
    };
  }

  try {
    await rescheduleAppointment({
      appointmentId: appointment.id,
      newStart,
      now,
      byAdmin: false,
    });
    return { status: "success", newStartIso: newStart.toISOString() };
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return {
        status: "error",
        message: "Ese horario acaba de ocuparse. Por favor elige otro.",
      };
    }
    if (error instanceof RescheduleNotAllowedError) {
      return { status: "error", message: error.message };
    }
    return {
      status: "error",
      message: "No pudimos reprogramar tu cita. Inténtalo de nuevo.",
    };
  }
}
