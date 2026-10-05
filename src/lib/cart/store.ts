/**
 * Store del carrito para `useSyncExternalStore`: el reducer es la única forma de
 * modificarlo, persiste en localStorage y se sincroniza entre pestañas.
 */
import { cartReducer, emptyCart, type CartAction, type CartState } from "./reducer";
import { CART_STORAGE_KEY, loadCart, parseStoredCart, saveCart } from "./storage";

let state: CartState = emptyCart;
let loaded = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  state = { lines: loadCart() };
  loaded = true;
}

function onStorage(e: StorageEvent) {
  if (e.key !== CART_STORAGE_KEY) return;
  state = { lines: parseStoredCart(e.newValue) };
  emit();
}

export const cartStore = {
  getSnapshot(): CartState {
    ensureLoaded();
    return state;
  },
  getServerSnapshot(): CartState {
    return emptyCart;
  },
  subscribe(listener: () => void): () => void {
    if (listeners.size === 0) window.addEventListener("storage", onStorage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
  dispatch(action: CartAction): void {
    ensureLoaded();
    const next = cartReducer(state, action);
    if (next === state) return;
    state = next;
    saveCart(state.lines);
    emit();
  },
};
