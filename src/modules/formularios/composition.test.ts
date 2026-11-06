import { describe, expect, it } from "vitest";
import {
  addCompositionPart,
  groupPartKey,
  includesPart,
  isValidComposition,
  parseCompositionPart,
  questionPartKey,
  removeGroupField,
  removeQuestionFromSection,
  resolveFormSections,
} from "./composition";
import { sanitizeSubmission } from "./submission-validation";

describe("composición de formularios", () => {
  it("conserva las plantillas antiguas de bloques y rechaza selecciones falsas o duplicadas", () => {
    expect(isValidComposition(["personal-data", "passport"])).toBe(true);
    expect(isValidComposition(["q:personal-data:givenNames"])).toBe(true);
    expect(isValidComposition(["q:personal-data:inventada"])).toBe(false);
    expect(
      isValidComposition(["personal-data", "q:personal-data:givenNames"]),
    ).toBe(false);
    expect(
      isValidComposition([
        "q:personal-data:givenNames",
        "q:personal-data:givenNames",
      ]),
    ).toBe(false);
    expect(
      parseCompositionPart("g:personal-data:dependants:wrongField"),
    ).toBeNull();
  });

  it("une preguntas seleccionadas de un grupo y permite quitarlas sin perder las demás", () => {
    const first = groupPartKey("residence-status", "previousCountries", [
      "country",
    ]);
    const second = groupPartKey("residence-status", "previousCountries", [
      "status",
    ]);
    const combined = addCompositionPart([first], second);
    expect(combined).toEqual([
      groupPartKey("residence-status", "previousCountries", [
        "country",
        "status",
      ]),
    ]);
    expect(includesPart(combined, parseCompositionPart(first)!)).toBe(true);
    expect(
      removeGroupField(
        combined,
        "residence-status",
        "previousCountries",
        "country",
      ),
    ).toEqual([second]);

    expect(addCompositionPart(combined, "residence-status")).toEqual([
      "residence-status",
    ]);
  });

  it("permite quitar una sola pregunta de un bloque completo", () => {
    const trimmed = removeQuestionFromSection(
      ["passport"],
      "passport",
      "passportNumber",
    );
    expect(isValidComposition(trimmed)).toBe(true);
    expect(trimmed).not.toContain("passport");
    expect(trimmed).not.toContain(
      questionPartKey("passport", "passportNumber"),
    );
    expect(trimmed).toContain(questionPartKey("passport", "hasValidPassport"));
  });

  it("muestra una pregunta aislada aunque su condición dependa de una pregunta no elegida", () => {
    const isolated = resolveFormSections([
      questionPartKey("personal-data", "otherNames"),
    ]);
    const item = isolated[0].items[0];
    expect(item.visibleWhen).toBeUndefined();

    const paired = resolveFormSections([
      questionPartKey("personal-data", "hasOtherNames"),
      questionPartKey("personal-data", "otherNames"),
    ]);
    expect(paired[0].items[1].visibleWhen).toEqual({
      fieldId: "hasOtherNames",
      equals: true,
    });
  });

  it("guarda respuestas de preguntas separadas del mismo bloque y solo campos elegidos del grupo", () => {
    const sections = resolveFormSections([
      questionPartKey("personal-data", "givenNames"),
      questionPartKey("residence-status", "lastCanadaEntryPlace"),
      questionPartKey("personal-data", "surnames"),
      groupPartKey("residence-status", "previousCountries", ["country"]),
    ]);
    const result = sanitizeSubmission(sections, {
      "personal-data.givenNames": "Ana",
      "personal-data.surnames": "Pérez",
      "residence-status.lastCanadaEntryPlace": "Toronto",
      "residence-status.previousCountries.0.country": "Colombia",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.personName).toBe("Ana Pérez");
    expect(result.data).toEqual({
      "personal-data": { givenNames: "Ana", surnames: "Pérez" },
      "residence-status": {
        lastCanadaEntryPlace: "Toronto",
        previousCountries: [{ country: "Colombia" }],
      },
    });

    expect(
      sanitizeSubmission(sections, {
        "personal-data.givenNames": "Ana",
        "personal-data.surnames": "Pérez",
        "residence-status.previousCountries.0.status": "Visitante",
      }),
    ).toEqual({
      ok: false,
      message: "El formulario contiene un campo inválido.",
    });
  });
});
