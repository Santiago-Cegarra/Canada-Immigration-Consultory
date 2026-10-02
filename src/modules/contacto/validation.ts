/**
 * Validación del formulario público de contacto. Es la frontera del sistema: el
 * navegador ya valida con `required`/`type="email"`, pero esos atributos se
 * saltan con una petición directa, así que aquí se vuelve a validar todo.
 *
 * Es una función pura (sin `"use server"`) para poder probarla con Vitest.
 */

/** Tipos de trámite del desplegable. Fuente única para la UI y la validación. */
export const TRAMITES = [
  "Visa de estudiante",
  "Permiso de trabajo",
  "Residencia permanente",
  "Visa de turista",
  "Otro",
] as const;

export type Tramite = (typeof TRAMITES)[number];

export type ContactMessage = {
  nombre: string;
  email: string;
  telefono: string;
  pais: string;
  tramite: Tramite;
  mensaje: string;
};

export type ContactField = keyof ContactMessage;

export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactValidation =
  { ok: true; data: ContactMessage } | { ok: false; errors: ContactErrors };

/** Límites generosos: solo evitan cuerpos absurdos, no restringen al usuario. */
const MAX_LENGTH: Record<ContactField, number> = {
  nombre: 120,
  email: 254,
  telefono: 30,
  pais: 80,
  tramite: 40,
  mensaje: 3000,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Dígitos con separadores habituales y `+` inicial opcional. */
const PHONE_PATTERN = /^\+?[\d\s().-]{7,}$/;

function readText(formData: FormData, field: ContactField): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function isTramite(value: string): value is Tramite {
  return (TRAMITES as readonly string[]).includes(value);
}

export function validateContactForm(formData: FormData): ContactValidation {
  const nombre = readText(formData, "nombre");
  const email = readText(formData, "email");
  const telefono = readText(formData, "telefono");
  const pais = readText(formData, "pais");
  const tramite = readText(formData, "tramite");
  const mensaje = readText(formData, "mensaje");

  const errors: ContactErrors = {};

  if (!nombre) errors.nombre = "Escribe tu nombre completo.";
  if (!EMAIL_PATTERN.test(email)) errors.email = "Escribe un correo válido.";
  if (!PHONE_PATTERN.test(telefono)) {
    errors.telefono = "Escribe un teléfono válido, con código de país.";
  }
  if (!pais) errors.pais = "Indica tu país de residencia.";
  if (!isTramite(tramite)) errors.tramite = "Elige un tipo de trámite.";
  if (mensaje.length < 10) {
    errors.mensaje = "Cuéntanos un poco más sobre tu caso.";
  }

  const values = { nombre, email, telefono, pais, tramite, mensaje };
  for (const field of Object.keys(values) as ContactField[]) {
    if (!errors[field] && values[field].length > MAX_LENGTH[field]) {
      errors[field] = "El texto es demasiado largo.";
    }
  }

  if (Object.keys(errors).length > 0 || !isTramite(tramite)) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { nombre, email, telefono, pais, tramite, mensaje },
  };
}
