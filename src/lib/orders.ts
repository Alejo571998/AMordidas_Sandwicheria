/**
 * Pedido que se descuenta del stock al tocar "Enviar pedido" (función place_order de la base).
 * Todo lo que llega del navegador o de la base se valida acá.
 */
import { MAX_QUANTITY_PER_ITEM } from "@/lib/cart/reducer";

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Shortage {
  productId: string;
  /** Unidades que quedan (0 = agotado o apagado). */
  available: number;
}

export type PlaceOrderResult =
  | { kind: "ok"; soldOut: string[] }
  | { kind: "stock"; shortages: Shortage[] }
  | { kind: "throttled" }
  | { kind: "unknown" };

const MAX_LINES = 30;

/** Normaliza lo que manda el navegador: ids conocidos, cantidades enteras, repetidos sumados. */
export function normalizeOrderItems(input: unknown, knownIds: ReadonlySet<string>): OrderItem[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_LINES) return null;
  const totals = new Map<string, number>();
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const { productId, quantity } = raw as Record<string, unknown>;
    if (typeof productId !== "string" || !knownIds.has(productId)) return null;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) return null;
    totals.set(productId, (totals.get(productId) ?? 0) + quantity);
  }
  const items = [...totals].map(([productId, quantity]) => ({ productId, quantity }));
  return items.every((i) => i.quantity <= MAX_QUANTITY_PER_ITEM) ? items : null;
}

/** Respuesta de place_order → resultado tipado. Cualquier cosa rara cuenta como "unknown". */
export function parsePlaceOrderResult(json: unknown): PlaceOrderResult {
  if (!json || typeof json !== "object") return { kind: "unknown" };
  const r = json as Record<string, unknown>;
  if (r.ok === true) {
    const soldOut = Array.isArray(r.sold_out) ? r.sold_out.filter((x): x is string => typeof x === "string") : [];
    return { kind: "ok", soldOut };
  }
  if (r.reason === "throttled") return { kind: "throttled" };
  if (r.reason === "stock" && Array.isArray(r.shortages)) {
    const shortages: Shortage[] = [];
    for (const s of r.shortages) {
      if (!s || typeof s !== "object") continue;
      const { product_id, available } = s as Record<string, unknown>;
      if (typeof product_id !== "string" || typeof available !== "number" || !Number.isInteger(available) || available < 0) continue;
      shortages.push({ productId: product_id, available });
    }
    return shortages.length > 0 ? { kind: "stock", shortages } : { kind: "unknown" };
  }
  return { kind: "unknown" };
}
