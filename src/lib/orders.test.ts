import { describe, expect, it } from "vitest";
import { normalizeOrderItems, parsePlaceOrderResult } from "./orders";

const known = new Set(["gula", "milandwich-carne"]);

describe("normalizeOrderItems", () => {
  it("suma repetidos y devuelve un renglón por producto", () => {
    expect(
      normalizeOrderItems(
        [
          { productId: "gula", quantity: 1 },
          { productId: "gula", quantity: 2 },
          { productId: "milandwich-carne", quantity: 1 },
        ],
        known,
      ),
    ).toEqual([
      { productId: "gula", quantity: 3 },
      { productId: "milandwich-carne", quantity: 1 },
    ]);
  });

  it.each([
    ["vacío", []],
    ["no es lista", { productId: "gula", quantity: 1 }],
    ["producto desconocido", [{ productId: "pizza", quantity: 1 }]],
    ["cantidad 0", [{ productId: "gula", quantity: 0 }]],
    ["cantidad con decimales", [{ productId: "gula", quantity: 1.5 }]],
    ["cantidad como texto", [{ productId: "gula", quantity: "2" }]],
    ["más de 20 sumando repetidos", [{ productId: "gula", quantity: 15 }, { productId: "gula", quantity: 6 }]],
  ])("rechaza: %s", (_label, input) => {
    expect(normalizeOrderItems(input, known)).toBeNull();
  });
});

describe("parsePlaceOrderResult", () => {
  it("pedido aceptado", () => {
    expect(parsePlaceOrderResult({ ok: true, order_id: 7, sold_out: ["gula"] })).toEqual({ kind: "ok", soldOut: ["gula"] });
  });

  it("falta stock", () => {
    expect(
      parsePlaceOrderResult({ ok: false, reason: "stock", shortages: [{ product_id: "milandwich-carne", available: 1 }] }),
    ).toEqual({ kind: "stock", shortages: [{ productId: "milandwich-carne", available: 1 }] });
  });

  it("freno contra abusos y respuestas raras", () => {
    expect(parsePlaceOrderResult({ ok: false, reason: "throttled" })).toEqual({ kind: "throttled" });
    expect(parsePlaceOrderResult(null)).toEqual({ kind: "unknown" });
    expect(parsePlaceOrderResult({ ok: false, reason: "stock", shortages: [{ product_id: 1, available: -2 }] })).toEqual({
      kind: "unknown",
    });
  });
});
