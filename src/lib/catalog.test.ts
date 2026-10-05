import { describe, expect, it } from "vitest";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import type { Product } from "@/types/product";
import { buildMenu, CatalogError, validateCatalog } from "./catalog";

describe("catálogo real", () => {
  it("es válido", () => {
    expect(() => validateCatalog(categories, products)).not.toThrow();
  });

  it("la carta muestra solo productos activos, agrupados y ordenados", () => {
    const menu = buildMenu(categories, products);
    expect(menu.products.every((p) => p.active)).toBe(true);
    expect(menu.products.map((p) => p.id)).toEqual([
      "milandwich-carne",
      "milandwich-pollo",
      "a-pollo",
      "crudo",
      "classic",
      "el-derretido",
      "gula",
    ]);
    expect(menu.categories.map((c) => c.id)).toEqual(["sanguches", "hamburguesas"]);
  });

  it("ningún precio inventado: todo precio es null o un entero positivo", () => {
    for (const p of products) expect(p.price === null || (Number.isInteger(p.price) && p.price > 0)).toBe(true);
  });
});

describe("validateCatalog", () => {
  const ok = products[0];
  const withProduct = (over: Partial<Product>) => [{ ...ok, ...over }];

  it.each([
    ["id con espacios", { id: "Milandwich Pollo" }],
    ["categoría inexistente", { category: "postres" as Product["category"] }],
    ["precio con decimales", { price: 99.5 }],
    ["precio negativo", { price: -1 }],
    ["sin ingredientes", { ingredients: [] }],
    ["sin texto alternativo", { image: { src: "/a.webp", alt: " " } }],
  ])("rechaza %s", (_label, over) => {
    expect(() => validateCatalog(categories, withProduct(over))).toThrow(CatalogError);
  });

  it("rechaza ids duplicados", () => {
    expect(() => validateCatalog(categories, [ok, ok])).toThrow(/duplicado/);
  });

  it("oculta categorías sin productos activos", () => {
    const menu = buildMenu(categories, [{ ...ok, category: "sanguches" }]);
    expect(menu.categories.map((c) => c.id)).toEqual(["sanguches"]);
  });
});
