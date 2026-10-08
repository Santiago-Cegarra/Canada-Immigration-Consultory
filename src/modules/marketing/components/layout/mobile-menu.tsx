"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CallToAction, NavItem } from "../../types";
import { ButtonLink } from "../ui/button-link";
import { Icon } from "../ui/icon";

type MobileMenuProps = {
  items: NavItem[];
  action: CallToAction;
};

/**
 * Menú de navegación para móvil: despliega un panel con los mismos enlaces del
 * escritorio.
 *
 * - Al abrir, el foco pasa al primer enlace para poder navegar con teclado.
 * - Se cierra con Escape (el foco vuelve al botón), al tocar fuera del menú o
 *   al elegir un enlace.
 */
export function MobileMenu({ items, action }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    firstLinkRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      toggleRef.current?.focus();
    };
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="lg:hidden">
      <button
        ref={toggleRef}
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
            {items.map((item, index) => (
              <Link
                key={item.label}
                ref={index === 0 ? firstLinkRef : undefined}
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
