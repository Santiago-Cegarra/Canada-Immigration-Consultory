import { describe, expect, it } from "vitest";
import { FORM_SECTION_BY_KEY } from "./sections";
import { resolveFormSections } from "./composition";
import { sanitizeSubmission } from "./submission-validation";

const personal = FORM_SECTION_BY_KEY.get("personal-data")!;
const criminal = FORM_SECTION_BY_KEY.get("criminal-history")!;

function validPersonalAnswers() {
  return {
    "personal-data.givenNames": "Ana",
    "personal-data.surnames": "Pérez",
    "personal-data.hasOtherNames": "no",
    "personal-data.documentSex": "F",
    "personal-data.birthDate": "1990-01-02",
    "personal-data.birthCity": "Bogotá",
    "personal-data.birthCountry": "Colombia",
    "personal-data.nationalities": "Colombiana",
    "personal-data.desiredProcess": "Permiso de estudios",
  };
}

describe("validación de respuestas reutilizables", () => {
  it("guarda campos normales con IDs estables y deriva el nombre", () => {
    const result = sanitizeSubmission([personal], validPersonalAnswers());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.personName).toBe("Ana Pérez");
    expect(result.data).toMatchObject({
      "personal-data": { givenNames: "Ana", surnames: "Pérez" },
    });
    expect(result.sensitiveData).toEqual({});
  });

  it("separa los bloques sensibles", () => {
    const result = sanitizeSubmission([criminal], {
      "criminal-history.hasCriminalHistory": "no",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual({});
    expect(result.sensitiveData).toEqual({
      "criminal-history": { hasCriminalHistory: "no" },
    });
  });

  it("extrae el correo consultable y conserva las respuestas por bloque", () => {
    const sections = resolveFormSections([
      "q:personal-data:givenNames",
      "q:personal-data:surnames",
      "q:address-contact:email",
    ]);
    const result = sanitizeSubmission(sections, {
      "personal-data.givenNames": "Ana",
      "personal-data.surnames": "Pérez",
      "address-contact.email": "Ana@Example.com",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.personEmail).toBe("ana@example.com");
    expect(result.data["address-contact"]).toEqual({
      email: "Ana@Example.com",
    });
  });

  it("rechaza campos inventados por el cliente", () => {
    const result = sanitizeSubmission([personal], {
      ...validPersonalAnswers(),
      "personal-data.admin": "true",
    });
    expect(result).toEqual({
      ok: false,
      message: "El formulario contiene un campo inválido.",
    });
  });

  it("valida los nuevos campos numéricos del IMM 0008", () => {
    const result = sanitizeSubmission([personal], {
      ...validPersonalAnswers(),
      "personal-data.heightCentimetres": "no es un número",
    });
    expect(result).toEqual({
      ok: false,
      message: "Número inválido: Altura en centímetros",
    });
  });

  it("no guarda secciones de adultos para una persona menor de 18", () => {
    const result = sanitizeSubmission(
      [personal, criminal],
      {
        ...validPersonalAnswers(),
        "personal-data.birthDate": "2015-01-01",
        "criminal-history.hasCriminalHistory": "no",
      },
      new Date("2026-11-02T12:00:00Z"),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.sensitiveData).toEqual({});
  });
});
