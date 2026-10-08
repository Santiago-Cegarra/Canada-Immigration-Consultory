import Link from "next/link";
import type { Service } from "../../types";
import { Icon } from "./icon";

/**
 * Tarjeta de servicio.
 *
 * Las tres tarjetas son idénticas: no hay ninguna destacada de antemano. Toda
 * la jerarquía visual (elevación, barra superior, icono y título en rojo) es el
 * estado de hover de la tarjeta que el usuario está señalando, y se consigue con
 * `group` en el contenedor más `group-hover:` en cada hijo, sin JavaScript ni
 * estado en React.
 */
export function ServiceCard({ icon, title, description, action }: Service) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-surface-container bg-surface-container-lowest p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="absolute top-0 left-0 h-1 w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />

      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-surface-container transition-colors group-hover:bg-primary/10">
        <Icon
          name={icon}
          className="text-[28px] text-on-surface transition-colors group-hover:text-primary"
        />
      </div>

      <h3 className="mb-3 font-headline-md text-headline-md text-on-surface transition-colors group-hover:text-primary">
        {title}
      </h3>
      <p className="mb-6 flex-grow font-body-md text-body-md text-on-surface-variant">
        {description}
      </p>

      <Link
        href={action.href}
        className="group/link relative mt-auto inline-flex items-center gap-1 self-start font-label-md text-label-md text-primary after:absolute after:-inset-x-2 after:-inset-y-2.5"
      >
        {action.label}
        {action.icon && (
          <Icon
            name={action.icon}
            className="text-[18px] transition-transform group-hover/link:translate-x-1"
          />
        )}
      </Link>
    </div>
  );
}
