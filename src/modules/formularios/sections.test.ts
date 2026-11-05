import { describe, expect, it } from "vitest";
import { FORM_SECTIONS, SECTION_KEYS, type VisibilityRule } from "./sections";

function referencedFieldIds(rule: VisibilityRule | undefined): string[] {
  if (!rule) return [];
  return "anyOf" in rule
    ? rule.anyOf.map(({ fieldId }) => fieldId)
    : [rule.fieldId];
}

describe("banco de secciones de formularios", () => {
  it("contiene exactamente los 17 bloques de forms.txt, en orden", () => {
    expect(FORM_SECTIONS).toHaveLength(17);
    expect(FORM_SECTIONS.map(({ number }) => number)).toEqual(
      Array.from({ length: 17 }, (_, index) => index + 1),
    );
    expect(FORM_SECTIONS.map(({ key }) => key)).toEqual(SECTION_KEYS);
  });

  it("mantiene IDs únicos dentro de cada ámbito", () => {
    for (const section of FORM_SECTIONS) {
      const itemIds = section.items.map(({ id }) => id);
      expect(new Set(itemIds).size, section.title).toBe(itemIds.length);

      for (const item of section.items) {
        if (item.kind !== "repeatable") continue;
        const fieldIds = item.fields.map(({ id }) => id);
        expect(new Set(fieldIds).size, `${section.title}: ${item.title}`).toBe(
          fieldIds.length,
        );
      }
    }
  });

  it("solo referencia preguntas existentes en las reglas condicionales", () => {
    for (const section of FORM_SECTIONS) {
      const topLevelQuestionIds = new Set(
        section.items
          .filter((item) => item.kind === "question")
          .map(({ id }) => id),
      );

      for (const item of section.items) {
        for (const fieldId of referencedFieldIds(item.visibleWhen)) {
          expect(
            topLevelQuestionIds.has(fieldId),
            `${section.title}: ${fieldId}`,
          ).toBe(true);
        }
      }
    }
  });

  it("marca como sensibles y solo para adultos las secciones 12 a 16", () => {
    for (const section of FORM_SECTIONS) {
      const isRestricted = section.number >= 12 && section.number <= 16;
      expect(Boolean(section.sensitive), section.title).toBe(isRestricted);
      expect(section.minimumAge, section.title).toBe(
        isRestricted ? 18 : undefined,
      );
    }
  });
});
