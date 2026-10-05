import type { Product } from "@/types/product";
import type { CartLine } from "./reducer";

export interface ResolvedLine {
  product: Product;
  quantity: number;
  /** null si el producto todavía no tiene precio cargado. */
  lineTotal: number | null;
}

export interface CartSummary {
  /** Líneas que van al pedido. */
  lines: ResolvedLine[];
  /** Productos guardados que se agotaron o salieron de carta: se avisan y no se envían. */
  unavailable: ResolvedLine[];
  itemCount: number;
  /** Suma de las líneas con precio. */
  subtotal: number;
  /** Total final. null cuando hay al menos un precio pendiente: se confirma por WhatsApp. */
  total: number | null;
  hasPendingPrices: boolean;
}

/**
 * Cruza el carrito guardado con la carta vigente. Los precios salen siempre de la carta
 * (nunca del navegador). Los ids que ya no existen se descartan.
 */
export function summarizeCart(lines: CartLine[], productsById: ReadonlyMap<string, Product>): CartSummary {
  const orderable: ResolvedLine[] = [];
  const unavailable: ResolvedLine[] = [];
  for (const line of lines) {
    const product = productsById.get(line.productId);
    if (!product) continue;
    const resolved: ResolvedLine = {
      product,
      quantity: line.quantity,
      lineTotal: product.price === null ? null : product.price * line.quantity,
    };
    (product.active && product.available ? orderable : unavailable).push(resolved);
  }
  const itemCount = orderable.reduce((n, l) => n + l.quantity, 0);
  const subtotal = orderable.reduce((n, l) => n + (l.lineTotal ?? 0), 0);
  const hasPendingPrices = orderable.some((l) => l.lineTotal === null);
  return {
    lines: orderable,
    unavailable,
    itemCount,
    subtotal,
    total: hasPendingPrices ? null : subtotal,
    hasPendingPrices,
  };
}
