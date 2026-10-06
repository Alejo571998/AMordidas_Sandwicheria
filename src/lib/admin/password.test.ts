import { describe, expect, it } from "vitest";
import { validatePasswordChange } from "./password";

const ok = { current: "contraseña vieja 1", next: "mostaza tostada 2474", confirm: "mostaza tostada 2474" };

describe("validatePasswordChange", () => {
  it("acepta un cambio válido", () => {
    expect(validatePasswordChange(ok)).toEqual({});
  });

  it("pide la contraseña actual", () => {
    expect(validatePasswordChange({ ...ok, current: "" }).current).toBeDefined();
  });

  it("exige al menos 10 caracteres", () => {
    expect(validatePasswordChange({ ...ok, next: "corta123", confirm: "corta123" }).next).toMatch(/10/);
  });

  it("rechaza más de 72 bytes (límite de bcrypt), contando acentos y emojis", () => {
    const long = "ñ".repeat(37); // 74 bytes en UTF-8
    expect(validatePasswordChange({ ...ok, next: long, confirm: long }).next).toMatch(/larga/);
  });

  it("rechaza espacios al principio o al final", () => {
    expect(validatePasswordChange({ ...ok, next: " mostaza tostada", confirm: " mostaza tostada" }).next).toMatch(/espacios/);
  });

  it("tiene que ser distinta de la actual", () => {
    expect(validatePasswordChange({ ...ok, next: ok.current, confirm: ok.current }).next).toMatch(/distinta/);
  });

  it("la confirmación tiene que coincidir", () => {
    expect(validatePasswordChange({ ...ok, confirm: "otra cosa distinta" }).confirm).toBeDefined();
  });
});
