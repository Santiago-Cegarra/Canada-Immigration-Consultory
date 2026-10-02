import Link from "next/link";
import { cn } from "@/lib/cn";
import type { CallToAction } from "../../types";
import { Icon } from "./icon";

/**
 * `primary` sirve sobre fondo claro u oscuro. `secondary` es el botón de contorno
 * para fondo claro (p. ej. dentro de una tarjeta). `outline` y `ghost` están
 * pensadas para fondos oscuros (hero y CTA final): su color de texto es el de
 * superficie clara, así que sobre fondo blanco no se leerían.
 */
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

/**
 * `lg` para las llamadas a la acción de sección; `md` para la del header; `sm`
 * para acciones dentro de una tarjeta.
 */
type ButtonSize = "sm" | "md" | "lg";

const BASE_CLASSES =
  "group flex items-center justify-center gap-2 rounded-lg text-center font-label-md text-label-md transition-all";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:shadow-[0_4px_20px_rgba(188,1,0,0.3)]",
  secondary:
    "border border-outline-variant text-on-surface hover:border-primary hover:text-primary",
  outline:
    "border-2 border-surface-container-lowest bg-transparent text-surface-container-lowest hover:bg-surface-container-lowest/10",
  ghost:
    "border border-surface-container-lowest/20 bg-surface-container-lowest/10 text-surface-container-lowest hover:bg-surface-container-lowest/20",
};

/*
 * Alturas MÍNIMAS, no fijas: si la etiqueta es larga y salta de línea en una
 * pantalla estrecha, el botón crece en vez de desbordar su contenido.
 */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2",
  md: "px-6 py-2.5",
  lg: "min-h-[56px] px-8 py-3",
};

const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-[16px]",
  md: "text-[20px]",
  lg: "text-[20px]",
};

type ButtonLinkProps = {
  action: CallToAction;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

/**
 * Botón de navegación. Es un enlace, no un `<button>`: en el HTML original
 * estos elementos llevaban a otra página, y un `<button>` no se puede abrir en
 * otra pestaña ni lo indexa un buscador.
 *
 * El contenido (texto, destino, icono) viene de los datos; la apariencia la
 * decide quien lo renderiza mediante `variant` y `size`.
 */
export function ButtonLink({
  action,
  variant = "primary",
  size = "lg",
  className,
}: ButtonLinkProps) {
  const { label, href, icon, iconPosition = "end" } = action;
  const iconSize = ICON_SIZE_CLASSES[size];

  return (
    <Link
      href={href}
      className={cn(
        BASE_CLASSES,
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
    >
      {icon && iconPosition === "start" && (
        <Icon name={icon} className={iconSize} />
      )}
      {label}
      {icon && iconPosition === "end" && (
        <Icon
          name={icon}
          className={cn(
            iconSize,
            "transition-transform group-hover:translate-x-1",
          )}
        />
      )}
    </Link>
  );
}
