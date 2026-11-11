/**
 * Tipos del contenido de marketing.
 *
 * El contenido de la página vive como datos (ver `content/`), no dentro del
 * markup. Estos tipos son el contrato entre ambos: si falta un campo o se
 * escribe mal el nombre de un icono, falla el typecheck y no en producción.
 */

/**
 * Iconos de Material Symbols en uso. Es una unión cerrada a propósito: la fuente
 * usa ligaduras, así que un nombre mal escrito no da error — renderiza el texto
 * literal a la vista del usuario. Para usar un icono nuevo, añádelo aquí.
 */
export type MaterialSymbol =
  | "account_balance"
  | "apartment"
  | "arrow_forward"
  | "assignment"
  | "award_star"
  | "badge"
  | "balance"
  | "calendar_month"
  | "call"
  | "chat"
  | "check"
  | "check_circle"
  | "chevron_left"
  | "chevron_right"
  | "close"
  | "credit_card"
  | "dataset"
  | "description"
  | "diversity_1"
  | "error"
  | "event_available"
  | "event_busy"
  | "expand_more"
  | "family_restroom"
  | "flight_takeoff"
  | "gavel"
  | "groups"
  | "handshake"
  | "help"
  | "home"
  | "hourglass_top"
  | "link"
  | "location_on"
  | "lock"
  | "mail"
  | "map"
  | "menu"
  | "open_in_new"
  | "payments"
  | "person"
  | "public"
  | "route"
  | "schedule"
  | "school"
  | "send"
  | "shield"
  | "speed"
  | "star"
  | "strategy"
  | "support_agent"
  | "verified"
  | "verified_user"
  | "videocam"
  | "visibility"
  | "work";

export type ImageAsset = {
  src: string;
  /** Vacío solo si la imagen es puramente decorativa. */
  alt: string;
};

export type NavItem = {
  label: string;
  href: string;
};

/** Una acción que el usuario puede tomar. El estilo lo decide quien la renderiza. */
export type CallToAction = NavItem & {
  icon?: MaterialSymbol;
  /** `end` añade el desplazamiento del icono al pasar el cursor. Por defecto `end`. */
  iconPosition?: "start" | "end";
};

export type TrustBadge = {
  icon: MaterialSymbol;
  label: string;
};

export type Service = {
  icon: MaterialSymbol;
  title: string;
  description: string;
  action: CallToAction;
};

export type ProcessStep = {
  title: string;
  description: string;
};

export type Stat = {
  icon: MaterialSymbol;
  value: string;
  label: string;
  /** Ocupa el ancho completo de la rejilla de estadísticas. */
  wide?: boolean;
};

export type Testimonial = {
  quote: string;
  /** Estrellas de 0 a 5. */
  rating: number;
  author: {
    name: string;
    role: string;
    avatar: ImageAsset;
  };
};

export type FooterLinkGroup = {
  title: string;
  items: NavItem[];
};

/**
 * Un trámite concreto dentro de una categoría de servicios. Tiene su propia
 * página en `/servicios/<categoria>/<proceso>`.
 */
export type ServiceProcess = {
  /** Único en TODO el catálogo: también viaja en `/agendar?servicio=<slug>`. */
  slug: string;
  title: string;
  /** Descripción corta, 1–2 frases. */
  summary: string;
  /** "¿Para quién es?", 1–2 frases. */
  audience: string;
  /** "Qué incluye nuestra asesoría", 3–4 viñetas. */
  includes: readonly string[];
};

/** Una categoría de servicios: una tarjeta del catálogo con sus trámites. */
export type ServiceCategory = {
  slug: string;
  title: string;
  icon: MaterialSymbol;
  /** `null` mientras falte la foto: la tarjeta usa un fondo de marca. */
  image: ImageAsset | null;
  processes: readonly ServiceProcess[];
};

/** Argumento de venta con icono, título y texto corto. */
export type Feature = {
  icon: MaterialSymbol;
  title: string;
  description: string;
  /** Etiqueta breve al pie de la tarjeta (p. ej. "Tarifas en CAD"). */
  tag?: string;
};
