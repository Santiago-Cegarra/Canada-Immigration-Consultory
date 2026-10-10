import { CONSULTATION } from "@/modules/citas/schedule";
import type { MaterialSymbol } from "../types";

/**
 * Contenido de la página de reserva (`/agendar`) y de su confirmación.
 *
 * Precio, duración y horarios NO se escriben aquí: salen de la configuración
 * de la agenda (`src/modules/citas/schedule.ts`), para que la página, la
 * validación y el cobro en Stripe nunca muestren cifras distintas.
 *
 * Solo se publican hechos confirmados (PRODUCT.md, principio 1). Quedan fuera
 * hasta que la firma los confirme: nombre y foto del consultor, número de
 * licencia, crédito de la consulta al contratar, informe en PDF e impuestos.
 */

const minutes = CONSULTATION.durationMinutes;

export type AssuranceItem = {
  icon: MaterialSymbol;
  title: string;
  detail: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

/** Zonas horarias que se ofrecen; la del visitante se añade si no está. */
export const BOOKING_TIME_ZONES: readonly { id: string; label: string }[] = [
  { id: "America/Toronto", label: "Toronto" },
  { id: "America/Bogota", label: "Bogotá" },
  { id: "America/Mexico_City", label: "Ciudad de México" },
  { id: "America/Lima", label: "Lima" },
  { id: "America/Caracas", label: "Caracas" },
  { id: "America/Santiago", label: "Santiago de Chile" },
  { id: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { id: "Europe/Madrid", label: "Madrid" },
];

const faq: FaqItem[] = [
  {
    question: "¿Puedo reprogramar mi cita?",
    answer:
      "Sí. Escríbenos desde el correo de confirmación y buscamos contigo otro horario.",
  },
  {
    question: "¿Puedo cancelar y recuperar el pago?",
    answer:
      "No. Las consultas no se cancelan ni se reembolsan; solo se reprograman.",
  },
  {
    question: "¿Cómo es la consulta?",
    answer: `Una videollamada individual de ${minutes} minutos con un consultor regulado para evaluar tu perfil y tus opciones.`,
  },
];

const assurances: AssuranceItem[] = [
  {
    icon: "gavel",
    title: "Consultores regulados",
    detail: "Miembros del CICC",
  },
  {
    icon: "shield",
    title: "Privacidad PIPEDA",
    detail: "Ley federal de protección de datos",
  },
  { icon: "lock", title: "Pago seguro", detail: "Procesado por Stripe" },
];

export const agendarContent = {
  seo: {
    title: "Agenda tu consulta",
    description: `Reserva y paga en línea tu consulta migratoria de ${minutes} minutos por videollamada con un consultor regulado.`,
  },
  steps: ["Fecha y datos", "Pago seguro", "Confirmación"],
  seal: {
    title: "Miembros del CICC",
    subtitle: "Consultores Migratorios Regulados (RCIC)",
  },
  header: {
    eyebrow: "Consulta regulada",
    title: "Agenda tu consulta con un consultor regulado",
    description: `Elige el día y la hora de tu diagnóstico migratorio individual: ${minutes} minutos por videollamada.`,
  },
  timeZone: {
    label: "Zona horaria",
    hint: "Los horarios se muestran en la zona que elijas.",
  },
  calendar: {
    banner: "Días de consulta: miércoles",
    bannerDetail: "Atención individual con un consultor regulado (RCIC)",
    previousMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
    legendSelected: "Seleccionado",
    legendAvailable: "Con horarios",
    legendFull: "Sin cupos",
    slotsPrompt: "Elige la hora de tu videollamada:",
    available: "Disponible",
    taken: "Ocupado",
    selected: "Seleccionado",
    nextDay: "día siguiente",
    linkNote: "Recibirás el enlace de la videollamada en tu correo.",
    empty:
      "No hay horarios disponibles en las próximas semanas. Escríbenos desde la página de contacto y te ayudamos.",
  },
  faqTitle: "Preguntas frecuentes",
  faq,
  assurances,
  summary: {
    consultantRole: "Consultor migratorio regulado",
    consultantTag: "RCIC",
    firm: "Help Immigration Canada",
    includesTitle: "Tu sesión incluye",
    includes: [
      "Evaluación de tu elegibilidad en directo, ya sea una Express Entry, PNP, permisos de estudio o de trabajo.",
      "Análisis completo de tu perfil, y de las opciones provinciales que aplican para ti.",
    ],
    lineLabel: `Consulta migratoria (${minutes} min)`,
    totalLabel: "Total a pagar hoy",
    totalNote: "Pago único, sin cobros recurrentes",
  },
  form: {
    title: "Tus datos",
    slotLabel: "Tu horario",
    slotMissing: "Elige un día y una hora en el calendario.",
    nameLabel: "Nombre completo",
    emailLabel: "Correo electrónico",
    emailHint: "Ahí recibirás la confirmación y el enlace de la videollamada.",
    phoneLabel: "Teléfono / WhatsApp (opcional)",
    policyLabel:
      "Entiendo que puedo reprogramar mi cita, pero que no hay cancelaciones ni reembolsos.",
    submitLabel: "Continuar al pago",
    pendingLabel: "Llevándote al pago seguro…",
    redirectNote:
      "Pagarás en la página segura de Stripe con tarjeta de crédito o débito, Apple Pay o Google Pay.",
    securityNote:
      "Los datos de tu tarjeta los procesa Stripe (PCI-DSS Nivel 1) y nunca pasan por nuestros servidores.",
  },
  confirmation: {
    seoTitle: "Confirmación de tu consulta",
    paidTitle: "¡Tu consulta está agendada!",
    paidBody:
      "Te escribiremos al correo que indicaste con el enlace de la videollamada.",
    paidPolicy:
      "Si necesitas otro horario, responde al correo de confirmación para reprogramar. No hay cancelaciones ni reembolsos.",
    timeZoneNote: "hora de Toronto",
    pendingTitle: "Estamos confirmando tu pago",
    pendingBody:
      "Stripe puede tardar unos segundos en avisarnos. Actualiza esta página en un momento.",
    refreshLabel: "Actualizar",
    missingTitle: "No encontramos tu reserva",
    missingBody:
      "Si completaste el pago, escríbenos desde la página de contacto y lo revisamos. Si no, puedes volver a elegir un horario.",
    backToBooking: "Volver a agendar",
    backHome: "Volver al inicio",
    contact: "Ir a contacto",
  },
} as const;
