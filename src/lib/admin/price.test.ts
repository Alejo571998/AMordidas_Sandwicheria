import { describe, expect, it } from "vitest";
import { formatPriceInput, parsePriceInput } from "./price";

describe("parsePriceInput", () => {
  it.each([
    ["11690", 11690],
    ["11.690", 11690],
    ["$ 11.690", 11690],
    ["$11690", 11690],
    [" 8.490 ", 8490],
    ["1.000.000", 1_000_000],
    ["950", 950],
  ])("acepta %j → %d", (raw, expected) => {
    expect(parsePriceInput(raw)).toEqual({ ok: true, value: expected });
  });

  it("vacío significa 'a confirmar'", () => {
    expect(parsePriceInput("")).toEqual({ ok: true, value: null });
    expect(parsePriceInput("   ")).toEqual({ ok: true, value: null });
    expect(parsePriceInput("$")).toEqual({ ok: true, value: null });
  });

  it.each(["11690,50", "11,690", "abc", "-500", "0", "11.69", "1.2345", "12e3", "1.000.001"])("rechaza %j", (raw) => {
    expect(parsePriceInput(raw).ok).toBe(false);
  });
});

describe("formatPriceInput", () => {
  it("formatea con punto de miles y deja vacío el null", () => {
    expect(formatPriceInput(11690)).toBe("11.690");
    expect(formatPriceInput(950)).toBe("950");
    expect(formatPriceInput(null)).toBe("");
  });

  it("lo formateado se vuelve a leer igual", () => {
    for (const n of [1, 999, 8490, 14190, 1_000_000]) {
      expect(parsePriceInput(formatPriceInput(n))).toEqual({ ok: true, value: n });
    }
  });
});
