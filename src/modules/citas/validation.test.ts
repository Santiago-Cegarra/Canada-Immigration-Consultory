import { describe, expect, it } from "vitest";
import { zonedTimeToUtc } from "./schedule";
import { validateBooking } from "./validation";

const now = new Date("2026-10-09T12:00:00Z");
const validSlot = zonedTimeToUtc("2026-10-14", "09:30", "America/Toronto");

function buildForm(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  const values = {
    horario: validSlot.toISOString(),
    nombre: "Ana Pérez",
    email: "Ana@Example.com",
    telefono: "",
    politica: "acepto",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

describe("validateBooking", () => {
  it("acepta una reserva completa y normaliza el correo", () => {
    const result = validateBooking(buildForm(), now);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.start.toISOString()).toBe(validSlot.toISOString());
      expect(result.data.email).toBe("ana@example.com");
      expect(result.data.telefono).toBeNull();
    }
  });

  it("rechaza un horario que la agenda no ofrece", () => {
    const thursday = zonedTimeToUtc("2026-10-15", "09:30", "America/Toronto");
    const result = validateBooking(
      buildForm({ horario: thursday.toISOString() }),
      now,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.horario).toBeDefined();
  });

  it("exige nombre, correo válido y aceptar la política", () => {
    const result = validateBooking(
      buildForm({ nombre: " ", email: "sin-arroba", politica: "" }),
      now,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "email",
        "nombre",
        "politica",
      ]);
    }
  });

  it("acepta el teléfono vacío pero valida uno mal escrito", () => {
    expect(
      validateBooking(buildForm({ telefono: "+57 300 123 4567" }), now).ok,
    ).toBe(true);

    const result = validateBooking(buildForm({ telefono: "abc" }), now);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.telefono).toBeDefined();
  });
});
