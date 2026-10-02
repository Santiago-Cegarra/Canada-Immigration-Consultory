import Link from "next/link";
import { cn } from "@/lib/cn";
import type { CallToAction } from "../../types";
import { Icon } from "./icon";

/**
 * `primary` sobre fondo claro u oscuro. `outline` y `ghost` están pensadas para
 * fondos oscuros (hero y CTA final): su color de texto es el de superficie
 * clara, así que sobre fondo blanco no se leerían.
 */
type ButtonVariant = "primary" | "outline" | "ghost";

/** `lg` para las llamadas a la acción de sección; `md` para la del header. */
type ButtonSize = "md" | "lg";

const BASE_CLASSES =
  "group flex items-center justify-center gap-2 rounded-lg font-label-md text-label-md transition-all";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:shadow-[0_4px_20px_rgba(188,1,0,0.3)]",
  outline:
    "border-2 border-surface-container-lowest bg-transparent text-surface-container-lowest hover:bg-surface-container-lowest/10",
  ghost:
    "border border-surface-container-lowest/20 bg-surface-container-lowest/10 text-surface-container-lowest hover:bg-surface-container-lowest/20",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "px-6 py-2.5",
  lg: "h-[56px] px-8",
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
        <Icon name={icon} className="text-[20px]" />
      )}
      {label}
      {icon && iconPosition === "end" && (
        <Icon
          name={icon}
          className="text-[20px] transition-transform group-hover:translate-x-1"
        />
      )}
    </Link>
  );
}
