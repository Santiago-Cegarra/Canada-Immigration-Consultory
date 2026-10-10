import { CONSULTATION, formatPrice } from "@/modules/citas/schedule";
import type { Feature, ImageAsset, MaterialSymbol } from "../types";
import { siteContent } from "./site";

/**
 * Contenido de "Acerca de Nosotros" (`/nosotros`).
 *
 * Esta página existe para que el cliente confíe en la firma, así que solo
 * publica datos que se puedan sostener (PRODUCT.md, principio 1). Lo que el
 * diseño traía y queda FUERA hasta confirmarlo:
 *
 * - Fotos de los directores: las del diseño son caras generadas por IA. Poner
 *   una cara inventada junto al nombre de un profesional regulado es engañoso.
 *   → Añadir las fotos reales en `public/equipo/` y rellenar `photo`.
 * - Números de licencia: el diseño traía RCIC "R528912" y CAPIC "#R21088", que
 *   no coinciden con diseños anteriores ("R528914").
 *   → Rellenar `licenseNumber` con el número exacto del registro oficial.
 * - Cifras: "10+ años", "98% de aprobación", "+5.000 familias".
 * - Imágenes de "sede": la del hero muestra el rótulo de otro bufete real
 *   (Davies Ward Phillips & Vineberg) y la de la oficina es generada.
 * - Dirección y correo del diseño ("Financial District, M5H 2N2",
 *   legal@…ca): se usan los del sitio (`site.ts`) para no contradecirlo.
 * - "Honorarios deducibles", "cifrado de grado bancario", "respuesta en menos
 *   de 24 h", "clientes en más de 20 países", "evaluación gratuita".
 */

/** Registros públicos oficiales donde cualquiera puede verificar una licencia. */
const REGISTERS = {
  cicc: "https://register.college-ic.ca/Public-Register-EN/RCIC_Search.aspx",
  lso: "https://lso.ca/public-resources/finding-a-lawyer-or-paralegal/directory-search",
} as const;

export type Director = {
  name: string;
  /** Iniciales para el avatar mientras no haya foto real. */
  initials: string;
  /** Foto real del director. Sin ella se muestran las iniciales. */
  photo?: ImageAsset;
  /** Icono de la insignia sobre el avatar. */
  badgeIcon: MaterialSymbol;
  credential: string;
  role: string;
  regulator: string;
  /** Número de licencia tal como figura en el registro oficial. */
  licenseNumber?: string;
  registerUrl: string;
  bio: string;
  specialties: string[];
  location: string;
};

export type FactItem = {
  icon: MaterialSymbol;
  title: string;
  description: string;
};

export type InfoItem = {
  icon: MaterialSymbol;
  title: string;
  value: string;
  href?: string;
  note?: string;
};

const directors: Director[] = [
  {
    name: "Diego Galvis",
    initials: "DG",
    badgeIcon: "gavel",
    credential: "Licencia LSO • Notario Público",
    role: "Licensed Paralegal & Notary Public",
    regulator: "Law Society of Ontario (LSO)",
    registerUrl: REGISTERS.lso,
    bio: "Especialista en derecho administrativo, comparecencias, apelaciones y fe pública. Con amplia trayectoria brindando certeza procesal y validación documental notarial para expedientes complejos ante las autoridades migratorias y regulatorias provinciales y federales. Su enfoque combina rigurosidad probatoria con un trato cercano y empático hacia cada cliente.",
    specialties: [
      "Litigio migratorio menor y audiencias de admisibilidad",
      "Certificaciones notariales, affidavits y declaraciones juradas",
      "Permisos de trabajo y residencia por razones humanitarias (H&C)",
    ],
    location: "Toronto, Ontario",
  },
  {
    name: "Gilberto Prieto",
    initials: "GP",
    badgeIcon: "verified",
    credential: "Licencia CICC • Miembro CAPIC",
    role: "Regulated Canadian Immigration Consultant (RCIC)",
    regulator: "College of Immigration and Citizenship Consultants (CICC)",
    registerUrl: REGISTERS.cicc,
    bio: "Consultor migratorio colegiado ante el College of Immigration and Citizenship Consultants (CICC). Estructura hojas de ruta migratorias para postulantes de Express Entry, Nominaciones Provinciales (PNP), Study Permits y Patrocinio Familiar. Firme defensor de la transparencia radical y de eliminar las falsas expectativas en los procesos migratorios.",
    specialties: [
      "Express Entry y optimización integral del puntaje CRS",
      "Vías académicas y laborales (DLI, PGWP, LMIA)",
      "Reunificación familiar y patrocinio conyugal",
    ],
    location: "Toronto, Ontario",
  },
];

/*
 * TODO (cifras del diseño, sin confirmar): "10+ años de experiencia
 * combinada", "98% de aprobación documentada", "+5.000 familias asesoradas".
 * Si son reales y verificables, pueden sustituir a estas tarjetas.
 */
const facts: FactItem[] = [
  {
    icon: "badge",
    title: "Licencia activa",
    description:
      "Cada caso lo lleva un profesional regulado por el CICC o la Law Society of Ontario.",
  },
  {
    icon: "verified_user",
    title: "Verificable",
    description:
      "Nuestras licencias constan en los registros públicos oficiales de Canadá.",
  },
  {
    icon: "account_balance",
    title: "Sede en Toronto",
    description:
      "Atendemos desde Ontario a clientes de Canadá y de toda Latinoamérica.",
  },
  {
    icon: "lock",
    title: "Privacidad PIPEDA",
    description:
      "Tus datos personales, protegidos por la ley federal de privacidad de Canadá.",
  },
];

const values: Feature[] = [
  {
    icon: "verified_user",
    title: "Rigor Regulatorio",
    description:
      "Cumplimiento estricto del código de ética del CICC y de la Law Society of Ontario. Cada documento se revisa conforme a las directrices procesales vigentes.",
    tag: "Revisión rigurosa",
  },
  {
    icon: "balance",
    title: "Cero Falsas Promesas",
    description:
      "Evaluamos la viabilidad real con honestidad antes de asumir cualquier caso. No aceptamos solicitudes inviables que arriesguen tu patrimonio.",
    tag: "Honestidad probatoria",
  },
  {
    icon: "groups",
    title: "Atención Personalizada",
    description:
      "Cada expediente lo revisa y firma directamente Diego Galvis o Gilberto Prieto, nunca asistentes ni intermediarios no regulados.",
    tag: "Representación 1:1",
  },
  {
    icon: "payments",
    title: "Transparencia Total",
    description:
      "Presupuestos claros en dólares canadienses (CAD), sin cobros ocultos ni sorpresas contractuales. Facturación transparente por etapas.",
    tag: "Tarifas en CAD",
  },
];

const { location: address, email } = siteContent.footer.contact;

const headquartersInfo: InfoItem[] = [
  {
    icon: "schedule",
    title: "Horarios de Atención",
    // Mismo horario que la página de contacto.
    value: "Lunes a viernes, 9:00 a 18:00 (hora de Toronto)",
    note: "Citas presenciales y consultas por videollamada",
  },
  {
    icon: "lock",
    title: "Privacidad y Protección de Datos",
    value:
      "Cumplimiento de la ley federal PIPEDA (Personal Information Protection and Electronic Documents Act).",
  },
  {
    icon: "mail",
    title: "Contacto Directo",
    value: email,
    href: `mailto:${email}`,
  },
];

const price = formatPrice(CONSULTATION.priceCents);

export const nosotrosContent = {
  seo: {
    title: "Acerca de Nosotros",
    description:
      "Conoce a los profesionales regulados de Help Immigration Canada: licencias verificables ante el CICC y la Law Society of Ontario, sede en Toronto y transparencia en cada caso.",
  },
  accreditation: {
    title: "Firma regulada en Canadá",
    items: [
      { icon: "verified", label: "Law Society of Ontario (LSO)" },
      { icon: "gavel", label: "Licencia CICC activa" },
      { icon: "shield", label: "Miembros de CAPIC" },
    ] satisfies { icon: MaterialSymbol; label: string }[],
  },
  hero: {
    eyebrow: "Nuestra firma legal y migratoria",
    title: "Defendiendo Tu Futuro en Canadá con Rigor Legal y Calidez Humana",
    description:
      "Somos una firma constituida por profesionales regulados en Canadá. Nuestro compromiso es brindar representación ética, transparente y estratégica ante las autoridades canadienses (IRCC, CBSA y tribunales pertinentes).",
    facts,
  },
  leadership: {
    eyebrow: "Dirección y supervisión directa",
    title: "Conoce a Nuestros Directores",
    description:
      "La experiencia y la supervisión directa de nuestros dos directores en cada caso aseguran una estrategia sólida frente a IRCC y los tribunales administrativos.",
    specialtiesTitle: "Especialidades clave",
    verifyLabel: "Verificar licencia",
    licenseLabel: "Licencia N.º",
    bookLabel: "Agenda tu consulta",
    directors,
  },
  values: {
    eyebrow: "Código de ética y rigor",
    title: "Nuestros Valores y Compromiso Deontológico",
    description:
      "Establecemos un estándar absoluto de transparencia para desmitificar las complejidades migratorias y proteger tu inversión de vida.",
    items: values,
  },
  headquarters: {
    eyebrow: "Presencia en Canadá",
    title: "Nuestra Sede en Toronto",
    description:
      "Desde Toronto coordinamos citas presenciales para residentes en Canadá y consultas por videollamada con clientes en cualquier país.",
    address,
    addressLabel: "Sede central",
    mapLabel: "Abrir en Google Maps",
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    remoteNote: "Consultas por videollamada desde cualquier país",
    info: headquartersInfo,
  },
  cta: {
    eyebrow: "Consulta inicial",
    title: "¿Listo para analizar tu perfil con nuestros profesionales?",
    description: `Agenda una consulta inicial de ${CONSULTATION.durationMinutes} minutos con uno de nuestros profesionales regulados y recibe una estrategia personalizada: viabilidad, tiempos y presupuesto.`,
    primary: {
      label: `Agendar consulta (${price})`,
      href: "/agendar",
      icon: "arrow_forward",
    },
    secondary: { label: "Escríbenos", href: "/contacto" },
    trust: [
      { icon: "credit_card", label: "Pago seguro con Stripe en CAD" },
      {
        icon: "videocam",
        label: `Consulta de ${CONSULTATION.durationMinutes} min por videollamada`,
      },
      { icon: "lock", label: "Confidencialidad protegida por PIPEDA" },
    ] satisfies { icon: MaterialSymbol; label: string }[],
  },
} as const;
