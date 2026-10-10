import type { CallToAction, MaterialSymbol } from "../types";
import { siteContent } from "./site";

/**
 * Contenido de la página de contacto (`/contacto`). Los textos y datos de
 * contacto se editan aquí; los componentes no llevan texto dentro.
 *
 * TODO: teléfono, WhatsApp, dirección, horario y redes son MARCADORES. Cambiarlos
 * por los datos reales antes de publicar. La ubicación y el correo se leen de
 * `site.ts` para no tenerlos duplicados.
 */

type ContactDetail = {
  icon: MaterialSymbol;
  label: string;
  value: string;
  /** Enlace opcional (`tel:`, `mailto:`, …). */
  href?: string;
};

/** Número de WhatsApp solo con dígitos y código de país, como lo pide `wa.me`. */
const whatsappNumber = "16479042232";

const details: ContactDetail[] = [
  {
    icon: "call",
    label: "Teléfono",
    value: "+1 (647) 904-2232",
    href: "tel:+16479042232",
  },
  {
    icon: "chat",
    label: "WhatsApp",
    value: "+16479042232",
    href: `https://wa.me/${whatsappNumber}`,
  },
  {
    icon: "mail",
    label: "Correo electrónico",
    value: siteContent.footer.contact.email,
    href: `mailto:${siteContent.footer.contact.email}`,
  },
  {
    icon: "location_on",
    label: "Oficina",
    value: siteContent.footer.contact.location,
  },
  {
    icon: "schedule",
    label: "Horario de atención",
    value: "Lunes a viernes, 9:00 a 18:00 (hora de Toronto)",
  },
];

const socialLinks: CallToAction[] = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "TikTok", href: "#" },
];

export const contactoContent = {
  /** Metadatos SEO. El título se completa con " — Help Immigration Canada". */
  seo: {
    title: "Contacto",
    description:
      "Contáctanos y un asesor de Help Immigration Canada te responderá en menos de 24 horas.",
  },
  banner: {
    title: "Contacto",
    description: "Estamos aquí para ayudarte en tu camino a Canadá.",
  },
  form: {
    title: "Contáctanos",
    description:
      "Cuéntanos tu caso y un asesor te responderá en menos de 24 horas.",
    submitLabel: "Enviar mensaje",
    pendingLabel: "Enviando…",
    privacyNote:
      "Tus datos están protegidos y solo se usarán para responder tu consulta.",
    successTitle: "¡Mensaje enviado!",
    successMessage:
      "Gracias por escribirnos. Un asesor revisará tu caso y te contactará pronto.",
    tramitePlaceholder: "Selecciona una opción",
  },
  info: {
    title: "Información de contacto",
    details,
    socialTitle: "Síguenos",
    social: socialLinks,
    map: {
      title: "Mapa de la oficina",
      src: "https://www.google.com/maps?q=390+Queens+Quay+W,+Toronto,+ON+M5V+0X7&output=embed",
    },
    whatsappAction: {
      label: "Escríbenos por WhatsApp",
      href: `https://wa.me/${whatsappNumber}`,
      icon: "chat",
      iconPosition: "start",
    } satisfies CallToAction,
  },
} as const;
