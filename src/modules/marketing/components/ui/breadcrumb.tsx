import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type BreadcrumbItem = {
  label: string;
  /** Sin `href` es la página actual: va al final y no enlaza. */
  href?: string;
};

type BreadcrumbProps = {
  /** Nombre accesible de la navegación. */
  label: string;
  items: readonly BreadcrumbItem[];
};

/** Ruta de navegación para fondos oscuros (cabecera de una página interior). */
export function Breadcrumb({ label, items }: BreadcrumbProps) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 font-caption text-caption text-white/75">
        {items.map((item, index) => (
          <li
            key={item.label}
            // En móvil se omite la página actual: es el título que va justo
            // debajo, y con nombres largos partía la ruta en varias líneas.
            className={cn(
              "items-center gap-1",
              item.href ? "flex" : "hidden sm:flex",
            )}
          >
            {index > 0 && (
              <Icon
                name="chevron_right"
                className="text-[16px] text-white/50"
              />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="rounded underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-white">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
