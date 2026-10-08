import { describe, expect, it } from "vitest";
import { validateContactForm } from "./validation";

function buildForm(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  const values = {
    nombre: "Ana Pérez",
    email: "ana@example.com",
    telefono: "+57 300 123 4567",
    pais: "Colombia",
    tramite: "Visa de estudiante",
    mensaje: "Quiero estudiar un college en Toronto el próximo año.",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

describe("validateContactForm", () => {
  it("acepta un formulario completo y recorta espacios", () => {
    const result = validateContactForm(buildForm({ nombre: "  Ana Pérez  " }));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.nombre).toBe("Ana Pérez");
  });

  it("rechaza campos vacíos con un mensaje por campo", () => {
    const result = validateContactForm(new FormData());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(
        ["email", "mensaje", "nombre", "pais", "telefono", "tramite"].sort(),
      );
    }
  });

  it("rechaza un tipo de trámite que no está en la lista", () => {
    const result = validateContactForm(buildForm({ tramite: "Ciudadanía" }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.tramite).toBeDefined();
  });

  it("rechaza correos y teléfonos mal formados", () => {
    const result = validateContactForm(
      buildForm({ email: "ana@", telefono: "abc" }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toBeDefined();
      expect(result.errors.telefono).toBeDefined();
    }
  });

  it("rechaza textos que superan el límite", () => {
    const result = validateContactForm(
      buildForm({ mensaje: "a".repeat(3001) }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.mensaje).toBeDefined();
  });
});
