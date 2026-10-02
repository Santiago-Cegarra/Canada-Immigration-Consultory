"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "../../types";

/**
 * Enlace de navegación que sabe si es la página actual.
 *
 * Es Client Component porque `usePathname` necesita el navegador. El HTML
 * original simulaba este estado con atributos `data-active-classes` y
 * `data-path` que ningún script leía: aquí el estado activo se deriva de la URL
 * real, y se expone a lectores de pantalla con `aria-current`.
 */
export function NavLink({ label, href }: NavItem) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? pathname === href
      : href.startsWith("/") && pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "font-label-md text-label-md transition-colors",
        isActive
          ? "font-bold text-primary"
          : "text-on-surface-variant hover:text-primary",
      )}
    >
      {label}
    </Link>
  );
}
