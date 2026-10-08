import type {
  CallToAction,
  FooterLinkGroup,
  ImageAsset,
  NavItem,
} from "../types";

/**
 * Identidad, navegación y pie de página: lo que se repite en todas las páginas
 * públicas. El contenido específico de la portada está en `home.ts`.
 *
 * NOTA: los `href: "#"` son marcadores. Cuando existan las rutas reales
 * (`/servicios`, `/agendar`, …) se cambian aquí y quedan cambiadas en todo el
 * sitio, porque header, footer y secciones leen de este archivo.
 */

/** Emblema circular de la marca. El favicon es el mismo archivo (`app/icon.jpg`). */
const logo: ImageAsset = {
  src: "/logo.jpg",
  alt: "Help Immigration Canada",
};

const primaryNav: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/servicios" },
  { label: "Estudios", href: "#" },
  { label: "Sobre Nosotros", href: "/#sobre-nosotros" },
];

const headerAction: CallToAction = { label: "Contacto", href: "/contacto" };

const socialLinks: CallToAction[] = [
  { label: "Sitio web", href: "#", icon: "public" },
  { label: "Escríbenos", href: "#", icon: "mail" },
];

const footerGroups: FooterLinkGroup[] = [
  {
    title: "Servicios",
    items: [
      { label: "Express Entry", href: "#" },
      { label: "Permisos de Trabajo", href: "#" },
      { label: "Patrocinio Familiar", href: "#" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Términos de Servicio", href: "#" },
      { label: "Política de Privacidad", href: "#" },
      { label: "Cumplimiento IRCC", href: "#" },
    ],
  },
];

export const siteContent = {
  /** Nombre en mayúsculas como lo muestra la cabecera. */
  name: "HELP IMMIGRATION CANADA",
  /** Razón social para avisos legales y el copyright del pie. */
  legalName: "Help Immigration Canada",
  description:
    "Asesoría migratoria experta y transparente para transformar tu futuro en Canadá.",
  logo,
  primaryNav,
  headerAction,
  footer: {
    tagline:
      "Asesoría migratoria experta y transparente para transformar tu futuro en Canadá.",
    groups: footerGroups,
    contact: {
      title: "Contacto",
      location: "390 Queens Quay W, Toronto, ON M5V 3A6",
      email: "info@helpimmigrationcanada.net",
      social: socialLinks,
    },
    legalNotice: "Miembros autorizados por el CICC.",
    flag: {
      // TODO: mover a `public/` junto con el resto de assets.
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTwT0NV8ZcWYD0fgPMto_5kAhUJ5ncknv63eiTQXPhM3buV2JVR4YEpxYJIJGGLfsYrJ_53q1Rl2Hv1N9vDdoHZHpKCoYoS2M2OYCLZjdR15VNKLQm4r3oMbpNP8I53be-1Ks-gvrt97_sqlWd5THrCQv6kzglJ1Ffi-JGkeJPlMarUfK1hPNIuS0HdLksBY8DcdIBNfR8PLc8-3c91F-MzSEHsR7RMH_qnAMYrR09BWrqsJzWXbY-",
      alt: "Bandera de Canadá",
    },
    flagLabel: "Proudly Canadian",
  },
} as const;
