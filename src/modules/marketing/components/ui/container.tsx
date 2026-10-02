import { cn } from "@/lib/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Centra el contenido y fija el ancho máximo de la página.
 * Sustituye el `max-w-[1280px] mx-auto px-gutter` que el HTML repetía en cada
 * sección: si cambia el ancho del sitio, se cambia aquí y en ningún otro sitio.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-page px-gutter", className)}>
      {children}
    </div>
  );
}
