import { describe, expect, it } from "vitest";
import {
  bookingPath,
  findService,
  findServiceBySlug,
  serviceCategories,
  serviceLabel,
  servicePath,
} from "./services";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const processes = serviceCategories.flatMap(({ processes }) => processes);

describe("catálogo de servicios", () => {
  it("tiene las 9 categorías con sus trámites", () => {
    expect(serviceCategories.map(({ processes }) => processes.length)).toEqual([
      9, 6, 5, 5, 5, 5, 6, 5, 9,
    ]);
  });

  it("usa slugs válidos y únicos, porque forman las URL", () => {
    const categorySlugs = serviceCategories.map(({ slug }) => slug);
    const processSlugs = processes.map(({ slug }) => slug);

    for (const slug of [...categorySlugs, ...processSlugs]) {
      expect(slug, slug).toMatch(SLUG_PATTERN);
    }
    expect(new Set(categorySlugs).size).toBe(categorySlugs.length);
    // Únicos en todo el catálogo: `/agendar?servicio=<slug>` no lleva categoría.
    expect(new Set(processSlugs).size).toBe(processSlugs.length);
  });

  it("completa los textos de cada trámite", () => {
    for (const process of processes) {
      expect(process.summary.length, process.slug).toBeGreaterThan(20);
      expect(process.audience.length, process.slug).toBeGreaterThan(20);
      expect(process.includes.length, process.slug).toBeGreaterThanOrEqual(3);
      expect(process.includes.length, process.slug).toBeLessThanOrEqual(4);
    }
  });

  it("encuentra un trámite por su ruta y por su slug", () => {
    const match = findService("permisos-de-trabajo", "pgwp");
    expect(match?.process.slug).toBe("pgwp");
    expect(findServiceBySlug("pgwp")).toEqual(match);
    expect(match && servicePath(match)).toBe(
      "/servicios/permisos-de-trabajo/pgwp",
    );
    expect(match && bookingPath(match.process)).toBe("/agendar?servicio=pgwp");
    expect(match && serviceLabel(match)).toContain("Permisos de trabajo — ");
  });

  it("no encuentra trámites inexistentes ni de otra categoría", () => {
    expect(findService("permisos-de-trabajo", "no-existe")).toBeNull();
    expect(findService("estudios-en-canada", "pgwp")).toBeNull();
    expect(findServiceBySlug("../admin")).toBeNull();
    expect(findServiceBySlug("")).toBeNull();
  });
});
