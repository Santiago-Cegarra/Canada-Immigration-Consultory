import { describe, expect, it } from "vitest";
import {
  decryptAccessKey,
  encryptAccessKey,
  generateAccessKey,
  hashAccessKey,
} from "./access-crypto";

describe("claves de acceso compartidas", () => {
  it("genera exactamente 8 caracteres fáciles de copiar", () => {
    const key = generateAccessKey();
    expect(key).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
  });

  it("puede recuperarlas cifradas sin guardar el texto como hash", () => {
    process.env.AUTH_SECRET ??= "test-only-secret";
    const key = "AB12CD34";
    const encrypted = encryptAccessKey(key);
    expect(encrypted).not.toContain(key);
    expect(decryptAccessKey(encrypted)).toBe(key);
    expect(hashAccessKey(key)).toHaveLength(64);
  });
});
