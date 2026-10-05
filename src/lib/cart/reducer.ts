export const MAX_QUANTITY_PER_ITEM = 20;

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartState {
  lines: CartLine[];
}

export type CartAction =
  | { type: "add"; productId: string; quantity: number }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "increment"; productId: string }
  | { type: "decrement"; productId: string }
  | { type: "remove"; productId: string }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] };

export const emptyCart: CartState = { lines: [] };

const clamp = (n: number) => Math.max(0, Math.min(MAX_QUANTITY_PER_ITEM, Math.floor(n)));

function upsert(lines: CartLine[], productId: string, quantity: number): CartLine[] {
  const q = clamp(quantity);
  const exists = lines.some((l) => l.productId === productId);
  if (q === 0) return lines.filter((l) => l.productId !== productId);
  if (!exists) return [...lines, { productId, quantity: q }];
  return lines.map((l) => (l.productId === productId ? { ...l, quantity: q } : l));
}

const quantityOf = (state: CartState, productId: string) =>
  state.lines.find((l) => l.productId === productId)?.quantity ?? 0;

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add":
      if (!Number.isFinite(action.quantity) || action.quantity <= 0) return state;
      return { lines: upsert(state.lines, action.productId, quantityOf(state, action.productId) + action.quantity) };
    case "setQuantity":
      if (!Number.isFinite(action.quantity)) return state;
      return { lines: upsert(state.lines, action.productId, action.quantity) };
    case "increment":
      return { lines: upsert(state.lines, action.productId, quantityOf(state, action.productId) + 1) };
    case "decrement":
      return { lines: upsert(state.lines, action.productId, quantityOf(state, action.productId) - 1) };
    case "remove":
      return { lines: state.lines.filter((l) => l.productId !== action.productId) };
    case "clear":
      return emptyCart;
    case "hydrate":
      return { lines: sanitizeLines(action.lines) };
  }
}

/** Limpia datos que vienen de afuera (localStorage): tipos, duplicados y cantidades. */
export function sanitizeLines(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];
  const merged = new Map<string, number>();
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const { productId, quantity } = raw as Record<string, unknown>;
    if (typeof productId !== "string" || typeof quantity !== "number" || !Number.isFinite(quantity)) continue;
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }
  return [...merged]
    .map(([productId, quantity]) => ({ productId, quantity: clamp(quantity) }))
    .filter((l) => l.quantity > 0);
}
