"use server";

import {
  type ContactErrors,
  type ContactField,
  validateContactForm,
} from "./validation";

export type ContactFormState =
  | { status: "idle" }
  /*
   * `values` devuelve lo que escribió el usuario: React vacía el formulario
   * tras cada envío, y sin esto un error de validación le borraría todo.
   */
  | {
      status: "invalid";
      errors: ContactErrors;
      values: Partial<Record<ContactField, string>>;
    }
  | { status: "sent" };

/**
 * Recibe el formulario público de contacto. No requiere sesión: es un
 * formulario abierto a cualquier visitante.
 *
 * TODO: enviar el mensaje al equipo con Resend (ver CLAUDE.md) cuando esté
 * configurado. Hasta entonces el mensaje se valida pero NO llega a nadie.
 * Nunca registrar los datos en logs: son datos personales.
 */
export async function sendContactMessage(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const result = validateContactForm(formData);

  if (!result.ok) {
    const values = Object.fromEntries(
      [...formData.entries()].filter(
        (entry): entry is [ContactField, string] =>
          typeof entry[1] === "string" && !entry[0].startsWith("$ACTION"),
      ),
    );
    return { status: "invalid", errors: result.errors, values };
  }

  return { status: "sent" };
}
