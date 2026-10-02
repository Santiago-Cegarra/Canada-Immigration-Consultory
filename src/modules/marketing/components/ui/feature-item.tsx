import type { Feature } from "../../types";
import { Icon } from "./icon";

/** Argumento de venta centrado: icono en círculo, título y texto. */
export function FeatureItem({ icon, title, description }: Feature) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed/30 text-primary">
        <Icon name={icon} className="text-[32px]" />
      </div>
      <h3 className="mb-4 font-headline-md text-headline-md text-on-surface">
        {title}
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}
