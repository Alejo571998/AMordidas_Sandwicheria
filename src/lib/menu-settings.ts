/**
 * Lo que el dueño cambia desde el panel: precio, stock del día y visibilidad.
 * El resto del producto (nombre, ingredientes, foto) vive en src/data/products.ts.
 *
 * Las filas vienen de la base: se validan como datos externos antes de usarlas.
 */
import { MAX_STOCK } from "@/lib/stock";
import type { Product } from "@/types/product";

export const MENU_CACHE_TAG = "menu";
export const MAX_PRICE = 1_000_000;

export interface ProductSettings {
  productId: string;
  price: number | null;
  available: boolean;
  active: boolean;
  /** Unidades que quedan hoy. null = sin límite (o base todavía sin la columna `stock`). */
  stock: number | null;
  updatedAt: string | null;
}

export type SettingsMap = Map<string, ProductSettings>;

export function isValidPrice(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isInteger(value) && value > 0 && value <= MAX_PRICE);
}

export function isValidStock(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_STOCK);
}

/** Filas de `product_settings` → mapa por id. Ignora filas mal formadas o de productos que no existen. */
export function parseSettingsRows(rows: unknown, knownIds: ReadonlySet<string>): SettingsMap {
  const map: SettingsMap = new Map();
  if (!Array.isArray(rows)) return map;
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const { product_id, price, available, active, stock = null, updated_at } = row as Record<string, unknown>;
    if (typeof product_id !== "string" || !knownIds.has(product_id)) continue;
    if (!isValidPrice(price) || typeof available !== "boolean" || typeof active !== "boolean") continue;
    if (!isValidStock(stock)) continue;
    map.set(product_id, {
      productId: product_id,
      price,
      available,
      active,
      stock,
      updatedAt: typeof updated_at === "string" ? updated_at : null,
    });
  }
  return map;
}

/**
 * Aplica lo guardado en el panel sobre la carta base. Sin fila, queda el valor de products.ts.
 * Con stock en 0 el producto queda "agotado por hoy" aunque el interruptor siga prendido.
 */
export function applySettings(products: Product[], settings: SettingsMap): Product[] {
  if (settings.size === 0) return products;
  return products.map((p) => {
    const s = settings.get(p.id);
    if (!s) return p;
    return { ...p, price: s.price, available: s.available && s.stock !== 0, active: s.active, stock: s.stock };
  });
}
