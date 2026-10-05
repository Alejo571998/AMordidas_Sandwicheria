import { describe, expect, it } from "vitest";
import type { Product } from "@/types/product";
import { cartReducer, emptyCart, MAX_QUANTITY_PER_ITEM, sanitizeLines, type CartState } from "./reducer";
import { summarizeCart } from "./selectors";
import { CART_TTL_MS, parseStoredCart, serializeCart } from "./storage";

const product = (over: Partial<Product>): Product => ({
  id: "classic",
  name: "Classic",
  category: "sanguches",
  description: "",
  ingredients: ["Pan"],
  price: 10000,
  image: { src: "/x.webp", alt: "x" },
  available: true,
  active: true,
  order: 1,
  ...over,
});

const run = (...actions: Parameters<typeof cartReducer>[1][]): CartState => actions.reduce(cartReducer, emptyCart);

describe("cartReducer", () => {
  it("agrega y acumula cantidades del mismo producto", () => {
    const s = run({ type: "add", productId: "a", quantity: 2 }, { type: "add", productId: "a", quantity: 1 });
    expect(s.lines).toEqual([{ productId: "a", quantity: 3 }]);
  });

  it("ignora cantidades 0, negativas o inválidas al agregar", () => {
    const s = run(
      { type: "add", productId: "a", quantity: 0 },
      { type: "add", productId: "a", quantity: -3 },
      { type: "add", productId: "a", quantity: Number.NaN },
    );
    expect(s.lines).toEqual([]);
  });

  it("respeta el máximo por producto", () => {
    const s = run({ type: "add", productId: "a", quantity: 15 }, { type: "add", productId: "a", quantity: 15 });
    expect(s.lines[0].quantity).toBe(MAX_QUANTITY_PER_ITEM);
    expect(cartReducer(s, { type: "increment", productId: "a" }).lines[0].quantity).toBe(MAX_QUANTITY_PER_ITEM);
  });

  it("al disminuir a 0 elimina la línea", () => {
    const s = run({ type: "add", productId: "a", quantity: 1 }, { type: "decrement", productId: "a" });
    expect(s.lines).toEqual([]);
  });

  it("setQuantity(0) elimina y remove/clear vacían", () => {
    const base = run({ type: "add", productId: "a", quantity: 2 }, { type: "add", productId: "b", quantity: 1 });
    expect(cartReducer(base, { type: "setQuantity", productId: "a", quantity: 0 }).lines).toEqual([{ productId: "b", quantity: 1 }]);
    expect(cartReducer(base, { type: "remove", productId: "b" }).lines).toEqual([{ productId: "a", quantity: 2 }]);
    expect(cartReducer(base, { type: "clear" }).lines).toEqual([]);
  });

  it("mantiene el orden en que se agregaron los productos", () => {
    const s = run(
      { type: "add", productId: "b", quantity: 1 },
      { type: "add", productId: "a", quantity: 1 },
      { type: "increment", productId: "b" },
    );
    expect(s.lines.map((l) => l.productId)).toEqual(["b", "a"]);
  });
});

describe("sanitizeLines", () => {
  it("descarta basura, fusiona duplicados y limita cantidades", () => {
    expect(
      sanitizeLines([
        { productId: "a", quantity: 2 },
        { productId: "a", quantity: 3 },
        { productId: 5, quantity: 1 },
        null,
        "x",
        { productId: "b", quantity: 99 },
        { productId: "c", quantity: 0 },
      ]),
    ).toEqual([
      { productId: "a", quantity: 5 },
      { productId: "b", quantity: MAX_QUANTITY_PER_ITEM },
    ]);
    expect(sanitizeLines({ not: "an array" })).toEqual([]);
  });
});

describe("persistencia", () => {
  it("serializa y recupera el carrito", () => {
    const now = 1_000_000;
    const raw = serializeCart([{ productId: "a", quantity: 2 }], now);
    expect(parseStoredCart(raw, now + 1000)).toEqual([{ productId: "a", quantity: 2 }]);
  });

  it("descarta carritos vencidos, de otra versión o corruptos", () => {
    const now = 1_000_000;
    const raw = serializeCart([{ productId: "a", quantity: 2 }], now);
    expect(parseStoredCart(raw, now + CART_TTL_MS + 1)).toEqual([]);
    expect(parseStoredCart(JSON.stringify({ version: 2, savedAt: now, lines: [] }), now)).toEqual([]);
    expect(parseStoredCart("{roto", now)).toEqual([]);
    expect(parseStoredCart(null, now)).toEqual([]);
  });
});

describe("summarizeCart", () => {
  const catalog = new Map([
    ["classic", product({ id: "classic", price: 10000 })],
    ["crudo", product({ id: "crudo", name: "Crudo", price: 12500 })],
    ["gula", product({ id: "gula", name: "Gula", price: null })],
    ["agotado", product({ id: "agotado", name: "Agotado", available: false })],
  ]);

  it("calcula subtotal, total y cantidad de productos", () => {
    const s = summarizeCart(
      [
        { productId: "classic", quantity: 2 },
        { productId: "crudo", quantity: 1 },
      ],
      catalog,
    );
    expect(s.itemCount).toBe(3);
    expect(s.subtotal).toBe(32500);
    expect(s.total).toBe(32500);
    expect(s.hasPendingPrices).toBe(false);
  });

  it("con precios pendientes el total queda 'a confirmar' (null)", () => {
    const s = summarizeCart(
      [
        { productId: "classic", quantity: 1 },
        { productId: "gula", quantity: 2 },
      ],
      catalog,
    );
    expect(s.total).toBeNull();
    expect(s.hasPendingPrices).toBe(true);
    expect(s.subtotal).toBe(10000);
    expect(s.itemCount).toBe(3);
  });

  it("separa productos agotados y descarta ids desconocidos", () => {
    const s = summarizeCart(
      [
        { productId: "agotado", quantity: 1 },
        { productId: "fantasma", quantity: 4 },
        { productId: "classic", quantity: 1 },
      ],
      catalog,
    );
    expect(s.lines.map((l) => l.product.id)).toEqual(["classic"]);
    expect(s.unavailable.map((l) => l.product.id)).toEqual(["agotado"]);
    expect(s.itemCount).toBe(1);
  });

  it("carrito vacío", () => {
    const s = summarizeCart([], catalog);
    expect(s).toMatchObject({ itemCount: 0, subtotal: 0, total: 0, hasPendingPrices: false });
  });
});
