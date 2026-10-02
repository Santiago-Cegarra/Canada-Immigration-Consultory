"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CallToAction, NavItem } from "../../types";
import { ButtonLink } from "../ui/button-link";
import { Icon } from "../ui/icon";

type MobileMenuProps = {
  items: NavItem[];
  action: CallToAction;
};

/**
 * Menú de navegación para móvil. En el HTML original el botón de hamburguesa no
 * abría nada; aquí despliega un panel con los mismos enlaces del escritorio.
 */
export function MobileMenu({ items, action }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setIsOpen((open) => !open)}
        className="p-2 text-on-surface"
      >
        <Icon name={isOpen ? "close" : "menu"} />
      </button>

      {isOpen && (
        <div className="absolute top-20 right-0 left-0 border-t border-surface-container bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <nav className="flex flex-col gap-2 px-margin-mobile py-6">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink action={action} size="md" className="mt-4" />
          </nav>
        </div>
      )}
    </div>
  );
}
