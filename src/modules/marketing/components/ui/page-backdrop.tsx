/**
 * Halos de color difuminados que decoran el fondo de una página.
 *
 * Se colocan con `absolute -z-10`, así que el contenedor padre DEBE llevar
 * `relative isolate`. Sin `isolate`, el z-index negativo los manda detrás del
 * fondo de `<main>` y no se ven; `isolate` crea un contexto de apilamiento
 * propio que los deja justo por encima de ese fondo.
 *
 * Tamaños en `rem` y no en porcentajes: el padre es toda la página, y un
 * porcentaje de una página larga y estrecha (móvil) daría óvalos deformados.
 */
export function PageBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-bl from-primary-fixed/20 to-transparent opacity-50 mix-blend-multiply blur-3xl md:h-[40rem] md:w-[40rem]" />
      <div className="absolute top-[40%] -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-secondary-fixed/20 to-transparent opacity-30 mix-blend-multiply blur-3xl md:h-[32rem] md:w-[32rem]" />
    </div>
  );
}
