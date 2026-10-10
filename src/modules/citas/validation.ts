/**
 * Validación del formulario de reserva. Es la frontera del sistema: el
 * navegador ya valida, pero esas reglas se saltan con una petición directa, así
 * que aquí se vuelve a validar todo, incluido que el horario exista de verdad.
 *
 * Es una función pura (sin `"use server"`) para poder probarla con Vitest.
 */
import {
  CONSULTATION,
  type ConsultationConfig,
  isOfferedSlot,
} from "./schedule";

export type BookingRequest = {
  start: Date;
  nombre: string;
  email: string;
  /** Opcional: el cliente puede dejarlo en blanco. */
  telefono: string | null;
};

export type BookingField =
  "horario" | "nombre" | "email" | "telefono" | "politica";

export type BookingErrors = Partial<Record<BookingField, string>>;

export type BookingValidation =
  { ok: true; data: BookingRequest } | { ok: false; errors: BookingErrors };

const MAX_LENGTH = { nombre: 120, email: 254, telefono: 30 } as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Dígitos con separadores habituales y `+` inicial opcional. */
const PHONE_PATTERN = /^\+?[\d\s().-]{7,}$/;

function readText(formData: FormData, field: BookingField): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export function validateBooking(
  formData: FormData,
  now: Date,
  config: ConsultationConfig = CONSULTATION,
): BookingValidation {
  const horario = readText(formData, "horario");
  const nombre = readText(formData, "nombre");
  const email = readText(formData, "email").toLowerCase();
  const telefono = readText(formData, "telefono");
  const politica = readText(formData, "politica");

  const errors: BookingErrors = {};
  const start = new Date(horario);

  if (!horario) {
    errors.horario = "Elige un día y una hora para tu consulta.";
  } else if (!isOfferedSlot(start, now, config)) {
    errors.horario = "Ese horario ya no está disponible. Elige otro.";
  }

  if (!nombre) errors.nombre = "Escribe tu nombre completo.";
  else if (nombre.length > MAX_LENGTH.nombre)
    errors.nombre = "El nombre es demasiado largo.";

  if (!EMAIL_PATTERN.test(email) || email.length > MAX_LENGTH.email) {
    errors.email =
      "Escribe un correo válido: ahí te enviaremos la confirmación.";
  }

  if (
    telefono &&
    (!PHONE_PATTERN.test(telefono) || telefono.length > MAX_LENGTH.telefono)
  ) {
    errors.telefono = "Escribe un teléfono válido, con código de país.";
  }

  if (politica !== "acepto") {
    errors.politica =
      "Confirma que conoces la política de reprogramación y reembolsos.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: { start, nombre, email, telefono: telefono || null },
  };
}
