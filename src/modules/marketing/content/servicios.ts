import type {
  CallToAction,
  Feature,
  Program,
  ProgramCategory,
  ProgramCategoryId,
} from "../types";

/**
 * Contenido de la página de servicios (`/servicios`). Editar textos, programas,
 * categorías o imágenes se hace aquí; los componentes no llevan texto dentro.
 *
 * TODO (imágenes): igual que en `home.ts`, todas las `src` son URLs temporales de
 * Google que caducan. Descargarlas a `public/` y sustituirlas por rutas locales.
 *
 * Los `href` de cada programa son marcadores (`"#"`). Cuando exista la página de
 * detalle (p. ej. `/servicios/express-entry`) se cambian aquí.
 */

/*
 * Categorías definidas UNA vez. `satisfies Record<ProgramCategoryId, ...>` obliga
 * a que estén todas las del tipo y a que cada clave coincida con su `id`. Cada
 * programa referencia el objeto (`categories.estudio`), así que su etiqueta no se
 * repite en cada tarjeta como en el HTML original.
 *
 * Para añadir una categoría: sumarla a `ProgramCategoryId` en `types.ts` y
 * definirla aquí. El orden de los chips es el de `Object.values`.
 */
const categories = {
  residencia: {
    id: "residencia",
    label: "Residencia Permanente",
    icon: "home",
  },
  estudio: { id: "estudio", label: "Estudio", icon: "school" },
  trabajo: { id: "trabajo", label: "Trabajo", icon: "work" },
  familia: { id: "familia", label: "Familia", icon: "family_restroom" },
} satisfies Record<ProgramCategoryId, ProgramCategory>;

const programs: Program[] = [
  {
    icon: "speed",
    category: categories.residencia,
    title: "Express Entry",
    description:
      "El sistema de puntos federal para trabajadores calificados. Gestionamos tu perfil para maximizar tu puntaje (CRS) y obtener una Invitación a Aplicar (ITA) rápidamente.",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-PDlanwvYuzDAOw1WX9Yo3eA1SMdOOOdFZCrkg_ywZCtKxjITny95tKLZk4003J2zxdENKkYZMn1JcQxVI6n-bn1aO_YJjUbGSbE9gqQvgFr-p9z8W94fcOGPS92Jgw5o8g0CSkazmti2mA9x3iMMu_883mMvOb4v9JVZYPQPTXuJbuI91furHrwgY6YpTgsQTPt6EjLMwK-FmLJQ6X0_skKXmgmLSDPSrEVWr-q6BvF9ePEZV4Zc",
      alt: "Horizonte de la ciudad de Toronto",
    },
    href: "#",
  },
  {
    icon: "school",
    category: categories.estudio,
    title: "Study Permits",
    description:
      "Accede a instituciones educativas canadienses de clase mundial (DLI). Te guiamos desde la carta de aceptación hasta la obtención de tu permiso de estudio.",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdnc9kFiL4A2YZDy3pqpz4kI4Ot9gnsSQ0Yr786y6assmwtC3T5yx134hfW7n-6MebWViE4YZnT-SMDZZlpYH4c8g_SxcLMI2VSXt06_KvnfgWRFAD4QapP79S9_yLo0NgcBLGh_vrjHAiKcifeEEuqzFnkkkxQq5yogGeK8VAcsDpenJM50tvsJ2SeslVcRFg5SNyqYYWn4ahiyXieu9rNSEPaV9NmKKvyQRCUdxCOEcbrZr_U06R",
      alt: "Estudiantes internacionales en Canadá",
    },
    href: "#",
  },
  {
    icon: "work",
    category: categories.trabajo,
    title: "Work Permits",
    description:
      "Tramitamos permisos de trabajo abiertos y cerrados. Aseguramos que cumplas con todas las normativas laborales canadienses para tu éxito profesional.",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3LS7q76g8ZzQhnAoO--7LSlgLfSfh0Yv9tmkRYhXO_6n1CJfvSseZvgzk49w53HpL1h9WgpmKehtq6STnT8QOXwJXzeP6mgF0QhzxWfccQhBbRwV_YUe9GaYK8L1Y8IIPpcM5FAGJff3t9x9tUr0k5k6oWRXlPPIEs0e85t6w3HaCoqUaG2I9leHDFOhLO3etC83hAg7IqhLjQjRn3GIdMFdTVSFdqbu-SSwFSn5Vs57cB9xVt47C",
      alt: "Profesionales trabajando en una oficina",
    },
    href: "#",
  },
  {
    icon: "diversity_1",
    category: categories.familia,
    title: "Family Sponsorship",
    description:
      "Reúnete con tus seres queridos en Canadá. Asistimos en el patrocinio de cónyuges, hijos dependientes, padres y abuelos con total transparencia.",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfNWUE_Lqz7rCS1d9CV7Xoq2WLtCUHOKoyNW-2PThF3oJQmTLqLPE5PuGwJieC--LOAlShBlvkQW0OF3DFvIpTdbHjg8az8c1ugTGON2dVHCVM1mjRygMt_tvsWOD7F6HAuhSukUNE8w_6fbnCRTdczZFxSlQ-gHIAtZrWspBrJHKxbSi7lcDiBvm4Fpn_qG4GgZ3zoGVsS8klKpnEFBAIKwX4Gzx6dI6hhv-DVke_-wV6nHWNb41v",
      alt: "Familia feliz en Canadá",
    },
    href: "#",
  },
  {
    icon: "map",
    category: categories.residencia,
    title: "Provincial Nominee Programs (PNP)",
    description:
      "Programas nominados por provincias para trabajadores con habilidades específicas que demanda la economía local. Ideal para perfiles especializados.",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvM4pdfeUEh8f3tQFLBdnN_UzxbfoG88ABZtubwnVPIzJ03iVEn9PwWQIoc9kgNpqehjDvw5QI3P30ruKP1FOwZmU_XZ_sipnBtNEehAhen1jqqkvcEjrSldif0qDiWQD5imkgxic96Sq2_V37S4edwEgDmUhUSdwSp2GYeJDU4mjrbXXO-oyXAvt2fsq5EKxGOKK4S6X-tuIzJIA-mmG8QCvisgacUUwseq2kYNOSZSGfUsYWewy2",
      alt: "Paisaje canadiense",
    },
    href: "#",
  },
  {
    icon: "handshake",
    category: categories.residencia,
    title: "Start-up Visa",
    description:
      "Para emprendedores innovadores con respaldo de inversores designados. Convierte tu idea de negocio en una vía directa hacia la residencia permanente.",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCembifzwAaw0z7O1Rwp1hEGkhngyD1hLmm-lHIDIM8cdzd3NIWtUyU6MoLTScZMImJte5MRk7fIaOT_5LAyvTdaBcaF6p85Qewiklqlld1WVyRDnrongiijk_eWl891DAGaSnlihfuOhmUjF3Zsvp4e6n9HNuM-1S_s_KDVoTP3NIL2ImGA5_uhGuc7VZ1ypSJY-vk_OUWkpS5MnGtBCXyi6Utv_7bcxHc_CEnCQRJYpQiHXEHlrbV",
      alt: "Oficina moderna",
    },
    href: "#",
  },
];

const headerAction: CallToAction = {
  label: "Obtén una Evaluación de Perfil",
  href: "#",
  icon: "arrow_forward",
};

const reasons: Feature[] = [
  {
    icon: "verified_user",
    title: "Consultores Regulados",
    description:
      "Contamos con profesionales autorizados por el CICC para garantizar un proceso legal y seguro.",
  },
  {
    icon: "strategy",
    title: "Estrategia Personalizada",
    description:
      "Analizamos cada caso individualmente para encontrar la vía migratoria con mayor probabilidad de éxito.",
  },
  {
    icon: "visibility",
    title: "Transparencia Total",
    description:
      "Sin costos ocultos ni promesas falsas. Te mantenemos informado en cada etapa de tu aplicación.",
  },
];

const ctaAction: CallToAction = {
  label: "Comenzar Evaluación Inicial Gratuita",
  href: "#",
  icon: "assignment",
};

export const serviciosContent = {
  /** Metadatos SEO. El título se completa con " — Help Immigration Canada". */
  seo: {
    title: "Servicios",
    description:
      "Programas de estudio y migración a Canadá: Express Entry, permisos de estudio y trabajo, patrocinio familiar, PNP y Start-up Visa.",
  },
  header: {
    eyebrow: "Nuestros Servicios",
    title: "Programas de Estudio y Migración",
    description:
      "Soluciones migratorias estratégicas diseñadas para profesionales, estudiantes y familias buscando establecerse en Canadá.",
    action: headerAction,
  },
  catalog: {
    allFilter: { label: "Todos los Programas", icon: "dataset" },
    categories: Object.values(categories),
    programs,
    detailsLabel: "Ver detalles del programa",
    filtersLabel: "Filtrar programas por categoría",
  },
  whyChooseUs: {
    title: "¿Por qué elegir Help Immigration Canada?",
    description:
      "Nuestra experiencia y compromiso con la transparencia nos convierten en tu mejor aliado para migrar a Canadá.",
    items: reasons,
  },
  cta: {
    title: "¿No estás seguro de cuál es tu mejor opción?",
    description:
      "La legislación migratoria canadiense es compleja y cambia constantemente. Nuestros consultores regulados (RCIC) evaluarán tu perfil detalladamente para diseñar la estrategia con mayores probabilidades de éxito.",
    action: ctaAction,
    backgroundImage: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBk79WX2qBOcUtxV9RWaNZwExZW0_JbNMYNQR6wgnZvxjbciuTuN4NznwMG7ybltEKeZzRp7qMcw6_yuItKOAln1BPcyf2meUGkRxATuGIWPQCkMKsAXnnRx8U6joDA1e413lTH7XS3GQR07reGMAqbTp7ltVNokANRPNWCq7kPMrt_ELXAXjDUHYejeK42rnScFvxmjqKcrCAPx5-AZpluQch5f1y8T11osbqkvC6KszV_AaQMVOPn",
      alt: "",
    },
  },
} as const;
