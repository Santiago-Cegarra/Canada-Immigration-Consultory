import { cn } from "@/lib/cn";
import type { MaterialSymbol } from "../../types";
import { Icon } from "./icon";

type FilterChipProps = {
  label: string;
  icon: MaterialSymbol;
  /** Filtro seleccionado: se rellena el chip y su icono. */
  active: boolean;
  onClick: () => void;
};

/**
 * Chip para elegir un filtro. Es un botón de verdad (no navega): `aria-pressed`
 * comunica a los lectores de pantalla cuál está activo, algo que el HTML original
 * solo expresaba con colores.
 */
export function FilterChip({ label, icon, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-full px-6 py-3 font-label-md text-label-md transition-all",
        active
          ? "bg-primary text-on-primary shadow-md shadow-primary/10"
          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
      )}
    >
      <Icon name={icon} filled={active} className="text-[18px]" />
      {label}
    </button>
  );
}
