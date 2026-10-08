import type { Feature } from "../../types";
import { Icon } from "./icon";

/**
 * Tarjeta de un pilar de confianza. Como en `ServiceCard`, ninguna va destacada
 * de antemano: el icono se resalta en la tarjeta que está bajo el cursor.
 */
export function PillarCard({ icon, title, description }: Feature) {
  return (
    <div className="group flex h-full flex-col rounded-xl border border-surface-container bg-surface-container-lowest p-6 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-on-surface transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon name={icon} className="text-[24px]" />
      </div>
      <h3 className="mb-2 font-headline-md text-[18px] font-bold text-on-surface">
        {title}
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}
