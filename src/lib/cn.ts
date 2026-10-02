/**
 * Une clases CSS descartando las vacías, `null`, `undefined` y `false`.
 * Permite escribir `cn("base", isActive && "text-primary", className)`.
 *
 * No resuelve conflictos entre utilidades de Tailwind (no es `tailwind-merge`):
 * si dos clases tocan la misma propiedad, gana la que el CSS declare después,
 * no el orden de los argumentos. Por eso los componentes exponen variantes
 * explícitas en lugar de dejar que quien los usa sobreescriba estilos base.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
