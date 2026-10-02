import { cn } from "@/lib/cn";
import type { MaterialSymbol } from "../../types";

type IconProps = {
  name: MaterialSymbol;
  className?: string;
  /**
   * Material Symbols es una fuente variable: el icono relleno se consigue con
   * el eje `FILL`, no con `fill-current` (esa clase es para SVG y aquí no hace
   * nada).
   */
  filled?: boolean;
};

/**
 * Icono de Material Symbols. El nombre del icono es el contenido del elemento
 * porque la fuente usa ligaduras; va `aria-hidden` para que los lectores de
 * pantalla no lean el texto literal ("arrow_forward").
 *
 * Si un icono es la única etiqueta de un control, el texto accesible va en el
 * `aria-label` del botón o enlace que lo contiene, no aquí.
 */
export function Icon({ name, className, filled = false }: IconProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "material-symbols-outlined",
        filled && "icon-filled",
        className,
      )}
    >
      {name}
    </span>
  );
}
