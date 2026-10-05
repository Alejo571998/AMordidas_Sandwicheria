import { sanitizeLines, type CartLine } from "./reducer";

export const CART_STORAGE_KEY = "amordidas:cart:v1";
/** Un pedido armado y no enviado se conserva 24 h (recargas, volver atrás, cerrar la pestaña). */
export const CART_TTL_MS = 24 * 60 * 60 * 1000;

interface StoredCart {
  version: 1;
  savedAt: number;
  lines: CartLine[];
}

export function serializeCart(lines: CartLine[], now = Date.now()): string {
  const payload: StoredCart = { version: 1, savedAt: now, lines };
  return JSON.stringify(payload);
}

export function parseStoredCart(raw: string | null, now = Date.now()): CartLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as Partial<StoredCart>;
    if (data.version !== 1 || typeof data.savedAt !== "number") return [];
    if (now - data.savedAt > CART_TTL_MS) return [];
    return sanitizeLines(data.lines);
  } catch {
    return [];
  }
}

export function loadCart(): CartLine[] {
  try {
    return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    return []; // modo privado / storage bloqueado: el carrito funciona igual, sin persistir
  }
}

export function saveCart(lines: CartLine[]): void {
  try {
    if (lines.length === 0) window.localStorage.removeItem(CART_STORAGE_KEY);
    else window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(lines));
  } catch {
    // sin persistencia disponible
  }
}
