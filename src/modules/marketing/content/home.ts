import type {
  CallToAction,
  Feature,
  ImageAsset,
  ProcessStep,
  Service,
  Stat,
  Testimonial,
  TrustBadge,
} from "../types";

/**
 * Contenido de la portada. Editar textos, cifras, imágenes o el orden de los
 * elementos se hace aquí; los componentes de `components/sections/` no llevan
 * texto dentro.
 *
 * TODO (imágenes): todas las `src` apuntan a URLs temporales de Google que
 * caducan. Descargarlas a `public/` y sustituir por rutas locales
 * (p. ej. `/images/hero.jpg`), lo que además permite quitar `remotePatterns`
 * de `next.config.ts`.
 */

const heroImage: ImageAsset = {
  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZN4kDBUvtADn6PQFlv0ohGsLhL-BXzzBPFxhyKLMEJdLD-kL3uIYIIR_-VAnrm_WlKI4PU90OpfwwqC78dbBlp12Q3445PQNJ2pv3gufGiYdO6vZyqm8NzY4v4L5t3UaaMKpzn9IgU7BzTaf4bKI_DPKyv90GolF0FlwSrh7R6Bvzge1SeHhwxPSQimOM11yX8SV_VHrMUmOarxhQiEJ45tIhxmsGVafRiDf9QRXuBPFaEthBXC0P",
  alt: "Grupo diverso de personas frente al horizonte de una ciudad canadiense",
};

const processImage: ImageAsset = {
  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBngvniFEi6JrufQS9xqv3agImdV65i0mjncR9HCr3jP0unc0jdRfkxf11UK7psQESPZoX5xiJ3qSeh2zH0cOogUcy9dZmN90CR2grBDMFzxEddVclyKtIIEwNcmBnWBUSMUuDE0L_0lMn68K58yP1cMnOpv5n5IDC6yz8oQ1Mx8EPMHXs4Vw7uOMJZiUXnWueM1sdKzVyqGBKH-8GJzGypMDxKoALvIj7hOGX_QwV8Tp5ljP2zL6C0",
  alt: "Escritorio con formularios de inmigración canadiense, un pasaporte y un portátil",
};

const ctaImage: ImageAsset = {
  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZwSYOGor5hN2JZSL3JvLb6PV9ESerm44INFHfIQAbY5DifgtatFWedDQO8ptOU7aU5nrV64OrXoH4SXBtfuUmArryqMUfLZNm7wx0sQR0iMDF8B8xNnfeH_CioJOUZ0ACivRhoi1uj4YPjY7MNuBdyttFTUafjPn4KqybCu5ingT8daNOccDorM-8-324iT9s3FxTZHRq_RsG5_j0p24mJr94YG4RkvuiecllEVWdLLfrrOe7f16Y",
  alt: "Familia al aire libre celebrando su llegada a Canadá",
};

const teamImage: ImageAsset = {
  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWH6hoS368cr-7az6swDiH9Lm6JjdL4-7rC2oJ_aG5-DqNye3B_94CdgdUfZwXDCsaBtwPkoT6QZgtq-ber1tz8CmuGyMz9LjJSIpJvBbazW04WnNCyFOERBcBql4_4HEAAJwXLK6jakRV-4m0YsEX-tPctggZHH3FVm5-pSQcQNK68UKE6Hqgl6N82GUIbjRS4eHmRrb0CfopIjRaIDpGBxRr9z158maNngglXHY",
  alt: "Equipo de consultores regulados (RCIC) y abogados de inmigración en una sala de juntas con vista a Toronto",
};

const heroActions: CallToAction[] = [
  { label: "Iniciar Evaluación", href: "/agendar", icon: "arrow_forward" },
  { label: "Nuestros Programas", href: "#" },
];

const trustBadges: TrustBadge[] = [
  { icon: "gavel", label: "CICC / RCIC" },
  { icon: "school", label: "EduCanada" },
  { icon: "support_agent", label: "Soporte 24/7" },
];

const services: Service[] = [
  {
    icon: "description",
    title: "Visas y Permisos",
    description:
      "Gestión experta de Express Entry, permisos de trabajo, visas de turista y programas de nominación provincial (PNP).",
    action: { label: "Conocer más", href: "#", icon: "arrow_forward" },
  },
  {
    icon: "school",
    title: "Programas de Estudio",
    description:
      "Asesoría para admisiones en Colleges y Universidades canadienses, y trámite completo de tu Study Permit.",
    action: { label: "Explorar programas", href: "#", icon: "arrow_forward" },
  },
  {
    icon: "handshake",
    title: "Asesoría Migratoria",
    description:
      "Consultas legales personalizadas, representación ante el IRCC y estrategias para patrocinios familiares.",
    action: { label: "Agendar cita", href: "/agendar", icon: "arrow_forward" },
  },
];

const processSteps: ProcessStep[] = [
  {
    title: "Evaluación de Perfil",
    description:
      "Analizamos tu elegibilidad para más de 80 programas migratorios federales y provinciales.",
  },
  {
    title: "Estrategia Legal",
    description:
      "Diseñamos una hoja de ruta personalizada y recopilamos toda la documentación requerida con estándares del IRCC.",
  },
  {
    title: "Sometimiento y Representación",
    description:
      "Presentamos tu caso y te representamos oficialmente ante el gobierno canadiense hasta la resolución.",
  },
];

const stats: Stat[] = [
  { icon: "verified", value: "98%", label: "Tasa de Aprobación" },
  { icon: "family_restroom", value: "5000+", label: "Familias Asesoradas" },
  {
    icon: "award_star",
    value: "10+ Años",
    label: "De Experiencia Regulada",
    wide: true,
  },
];

const testimonial: Testimonial = {
  quote:
    "Gracias a Help Immigration, mi sueño de estudiar en Vancouver se hizo realidad. Su equipo me guió en cada paso del trámite de mi Study Permit con una claridad y paciencia increíbles. Hoy estoy en mi segundo semestre y no podría estar más feliz.",
  rating: 5,
  author: {
    name: "María Gómez",
    role: "Estudiante Internacional, Colombia",
    avatar: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxX2jXEI5VpviI7lYapfENM-pM0T94BLxj0N6m3Die_48vWkoHBdL8K-HzsLmTj-WvsLOEGaLSFHQ19o1H9p-fbj6fDM8YuStBtOnOJMGICmDbXfMQViEYzcJ1Up_ys83vmyPLSRimZZpw1gBFOP-tQsBOchtL0CLxK4-nZu8dOpFVpwCAer0XlGG2eJiQfsJQ2ew2TKn6EETPB5UoMjxDKWzTr5NKLEYr8sdELNQlcrPrPoahyhnT",
      alt: "Retrato de María Gómez",
    },
  },
};

const pillars: Feature[] = [
  {
    icon: "gavel",
    title: "Acreditación CICC / RCIC",
    description:
      "Representación legal oficial con números de licencia verificables. No somos intermediarios ni tramitadores informales.",
  },
  {
    icon: "route",
    title: "Estrategia Personalizada",
    description:
      "Cada perfil tiene una ruta idónea (Express Entry, PNP, Study Permits, LMIA). Evaluamos la viabilidad real antes de cualquier contrato.",
  },
  {
    icon: "balance",
    title: "Cero Falsas Promesas",
    description:
      "Honorarios claros en CAD sin costos ocultos y total apego a la ley de inmigración canadiense (IRPA).",
  },
  {
    icon: "support_agent",
    title: "Acompañamiento Integral",
    description:
      "Desde la evaluación de credenciales y preparación de expediente hasta tu llegada y establecimiento formal en Canadá.",
  },
];

const finalCtaActions: CallToAction[] = [
  {
    label: "Comenzar Evaluación Gratuita",
    href: "/agendar",
    icon: "arrow_forward",
  },
  {
    label: "Hablar con un Consultor",
    href: "/contacto",
    icon: "chat",
    iconPosition: "start",
  },
];

export const homeContent = {
  hero: {
    eyebrow: "Asesoría Regulada CICC",
    /** El texto entre `{}` se resalta en color primario. */
    title: "Tu futuro en {Canadá} comienza con los expertos.",
    description:
      "Agencia especializada en procesos migratorios y programas de estudios. Te guiamos en cada paso con transparencia, legalidad y el respaldo de consultores regulados.",
    image: heroImage,
    actions: heroActions,
    highlight: {
      icon: "verified",
      value: "98%",
      label: "Tasa de Aprobación",
      /** Porcentaje de llenado de la barra, de 0 a 100. */
      progress: 98,
    },
  },
  trust: {
    title: "Acreditados y Regulados Por",
    badges: trustBadges,
  },
  services: {
    title: "Soluciones Integrales para tu Camino a Canadá",
    description:
      "Diseñamos estrategias personalizadas basadas en tu perfil para maximizar tus posibilidades de éxito en los programas migratorios y educativos de Canadá.",
    items: services,
  },
  process: {
    title: "Un proceso transparente y estructurado",
    description:
      "Eliminamos la incertidumbre de tu aplicación. Nuestra metodología está diseñada para brindar claridad en cada etapa.",
    image: processImage,
    badge: {
      icon: "flight_takeoff",
      title: "Proceso Simplificado",
      description: "Gestionamos la burocracia por ti.",
    },
    steps: processSteps,
  },
  results: {
    title: "Nuestros Números Hablan por Sí Solos",
    description:
      "Llevamos más de una década construyendo puentes hacia Canadá. Nuestra experiencia se traduce en resultados reales para miles de personas.",
    stats,
    testimonial,
  },
  about: {
    eyebrow: "Firma Regulada en Canadá",
    /** El texto entre `{}` se resalta en color primario. */
    title: "Tu Futuro en Canadá en Manos de {Profesionales Regulados}",
    description:
      "Más de una década brindando asesoría legal migratoria transparente, honesta y respaldada por consultores con licencia activa ante el CICC (College of Immigration and Citizenship Consultants).",
    team: {
      image: teamImage,
      title: "Consultores Regulados RCIC & Abogados de Inmigración",
      subtitle:
        "Sede Central en Toronto, Ontario | Cobertura en todo Canadá y Latinoamérica",
      /*
       * TODO (antes de publicar): este número viene del diseño y casi seguro es
       * inventado. Los números del CICC son públicos y verificables: mostrar uno
       * que no sea de la firma es tergiversar su licencia. Sustituirlo por el real.
       */
      licenseLabel: "Licencia Oficial CICC #R528914",
    },
    pillars,
  },
  finalCta: {
    eyebrow: "Comienza Hoy",
    title: "¿Listo para dar el siguiente paso?",
    description:
      "Agenda una evaluación inicial gratuita con nuestros consultores regulados. Descubre el camino migratorio o educativo que mejor se adapta a tu perfil y metas.",
    actions: finalCtaActions,
    image: ctaImage,
  },
} as const;
