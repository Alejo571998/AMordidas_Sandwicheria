import { MAX_QUANTITY_PER_ITEM } from "@/lib/cart/reducer";
import type { Product } from "@/types/product";

/** Con esta cantidad o menos se muestra "¡Quedan N!" sobre la foto. */
export const LOW_STOCK_THRESHOLD = 5;
export const MAX_STOCK = 10_000;

/** Cuántas unidades de este producto pueden ir en un pedido (tope general o stock del día). */
export function orderLimit(product: Pick<Product, "stock">): number {
  const stock = product.stock ?? null;
  return stock === null ? MAX_QUANTITY_PER_ITEM : Math.min(MAX_QUANTITY_PER_ITEM, stock);
}

/** true si lo que frena la cantidad es el stock del día (y no el tope general de 20). */
export function isStockLimited(product: Pick<Product, "stock">): boolean {
  const stock = product.stock ?? null;
  return stock !== null && stock < MAX_QUANTITY_PER_ITEM;
}

/** "Hay para 1 solo." / "Hay para 3 nomás." */
export function stockLeftMessage(stock: number): string {
  return stock === 1 ? "Hay para 1 solo." : `Hay para ${stock} nomás.`;
}

/** "¡Queda 1!" / "¡Quedan 3!" */
export function lowStockBadge(stock: number): string {
  return stock === 1 ? "¡Queda 1!" : `¡Quedan ${stock}!`;
}
