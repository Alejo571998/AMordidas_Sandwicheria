import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { applySettings, parseSettingsRows } from "./menu-settings";

const known = new Set(products.map((p) => p.id));

describe("parseSettingsRows", () => {
  it("toma filas válidas de productos conocidos", () => {
    const map = parseSettingsRows(
      [
        { product_id: "gula", price: 9000, available: false, active: true, updated_at: "2026-10-05T12:00:00Z" },
        { product_id: "classic", price: null, available: true, active: false, updated_at: null },
      ],
      known,
    );
    expect(map.get("gula")).toEqual({
      productId: "gula",
      price: 9000,
      available: false,
      active: true,
      updatedAt: "2026-10-05T12:00:00Z",
    });
    expect(map.get("classic")?.price).toBeNull();
    expect(map.size).toBe(2);
  });

  it("ignora basura, ids desconocidos y precios inválidos", () => {
    const map = parseSettingsRows(
      [
        null,
        "gula",
        { product_id: "no-existe", price: 100, available: true, active: true },
        { product_id: "gula", price: -5, available: true, active: true },
        { product_id: "crudo", price: 10.5, available: true, active: true },
        { product_id: "classic", price: "9000", available: true, active: true },
        { product_id: "a-pollo", price: 9000, available: "sí", active: true },
        { product_id: "el-derretido", price: 2_000_000, available: true, active: true },
      ],
      known,
    );
    expect(map.size).toBe(0);
  });

  it("si la respuesta no es una lista, no aplica nada", () => {
    expect(parseSettingsRows({ message: "error" }, known).size).toBe(0);
    expect(parseSettingsRows(undefined, known).size).toBe(0);
  });
});

describe("applySettings", () => {
  it("pisa precio, stock y visibilidad; el resto queda como en products.ts", () => {
    const map = parseSettingsRows([{ product_id: "gula", price: 9999, available: false, active: true }], known);
    const result = applySettings(products, map);
    const gula = result.find((p) => p.id === "gula")!;
    const original = products.find((p) => p.id === "gula")!;
    expect(gula.price).toBe(9999);
    expect(gula.available).toBe(false);
    expect(gula.name).toBe(original.name);
    expect(gula.ingredients).toEqual(original.ingredients);
    // Los demás no cambian
    expect(result.find((p) => p.id === "classic")).toBe(products.find((p) => p.id === "classic"));
  });

  it("puede ocultar y volver a mostrar un producto", () => {
    const hidden = parseSettingsRows([{ product_id: "capresse", price: 10300, available: true, active: false }], known);
    expect(applySettings(products, hidden).find((p) => p.id === "capresse")?.active).toBe(false);
    const shown = parseSettingsRows([{ product_id: "capresse", price: 10300, available: true, active: true }], known);
    expect(applySettings(products, shown).find((p) => p.id === "capresse")?.active).toBe(true);
  });

  it("sin filas devuelve la carta tal cual", () => {
    expect(applySettings(products, new Map())).toBe(products);
  });
});
