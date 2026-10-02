"use client";

import { useState } from "react";
import type { Program, ProgramCategory, ProgramCategoryId } from "../../types";
import { Container } from "../ui/container";
import { FilterChip } from "../ui/filter-chip";
import { ProgramCard } from "../ui/program-card";

/** `"all"` no es una categoría: es la ausencia de filtro. */
type ActiveFilter = ProgramCategoryId | "all";

type ProgramCatalogProps = {
  /** Etiqueta e icono del chip que quita el filtro. */
  allFilter: Pick<ProgramCategory, "label" | "icon">;
  /** Un chip por categoría, en este orden. */
  categories: ProgramCategory[];
  programs: Program[];
  /** Texto del botón de cada tarjeta. */
  detailsLabel: string;
  /** Nombre accesible del grupo de filtros. */
  filtersLabel: string;
};

/** Retraso entre tarjetas consecutivas al aparecer, en milisegundos. */
const CARD_STAGGER_MS = 50;

/**
 * Catálogo de programas con filtro por categoría.
 *
 * Es Client Component solo por `useState` del filtro. Filtrar es una operación
 * sobre datos que ya están en memoria, así que no hay petición ni cambio de URL;
 * a cambio, el filtro elegido no se conserva al recargar ni se puede compartir.
 * Si hiciera falta, el filtro pasaría a `searchParams` (`?categoria=estudio`).
 */
export function ProgramCatalog({
  allFilter,
  categories,
  programs,
  detailsLabel,
  filtersLabel,
}: ProgramCatalogProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const visiblePrograms =
    activeFilter === "all"
      ? programs
      : programs.filter((program) => program.category.id === activeFilter);

  return (
    <section className="w-full pb-12 lg:pb-24">
      <Container>
        {/* En móvil los chips no caben: la fila se desplaza en horizontal. */}
        <div
          role="group"
          aria-label={filtersLabel}
          className="mb-8 no-scrollbar flex gap-4 overflow-x-auto pt-1 pb-4 lg:mb-12"
        >
          <FilterChip
            label={allFilter.label}
            icon={allFilter.icon}
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              label={category.label}
              icon={category.icon}
              active={activeFilter === category.id}
              onClick={() => setActiveFilter(category.id)}
            />
          ))}
        </div>

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {visiblePrograms.map((program, index) => (
            // `key` estable: solo animan las tarjetas que entran al filtrar,
            // no las que ya estaban en pantalla.
            <li
              key={program.title}
              className="motion-safe:animate-card-in"
              style={{ animationDelay: `${index * CARD_STAGGER_MS}ms` }}
            >
              <ProgramCard {...program} actionLabel={detailsLabel} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
