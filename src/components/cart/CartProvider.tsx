"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
import { summarizeCart, type CartSummary } from "@/lib/cart/selectors";
import { cartStore } from "@/lib/cart/store";
import { emptyCheckout, type CheckoutForm } from "@/lib/checkout";
import type { Shortage } from "@/lib/orders";
import { orderLimit } from "@/lib/stock";
import type { Category, Product } from "@/types/product";

export interface AddedNotice {
  key: number;
  product: Product;
  quantity: number;
}

interface CartContextValue {
  /** Carta con el stock más reciente que conoce este navegador. */
  products: Product[];
  categories: Category[];
  summary: CartSummary;
  /** false durante el render del servidor / hidratación: evita un carrito vacío que después "salta". */
  hydrated: boolean;
  /** El stock se controla al enviar (panel conectado). */
  stockControl: boolean;
  quantityOf: (productId: string) => number;
  addItem: (product: Product, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  /** La base avisó que no alcanza: actualiza el stock conocido y baja las cantidades del pedido. */
  applyShortages: (shortages: Shortage[]) => void;

  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  lastAdded: AddedNotice | null;
  dismissNotice: () => void;

  checkout: CheckoutForm;
  updateCheckout: (patch: Partial<CheckoutForm>) => void;
  resetCheckout: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const noopSubscribe = () => () => {};

const currentQuantity = (productId: string) =>
  cartStore.getSnapshot().lines.find((l) => l.productId === productId)?.quantity ?? 0;

export function CartProvider({
  products: baseProducts,
  categories,
  stockControl = false,
  children,
}: {
  products: Product[];
  categories: Category[];
  stockControl?: boolean;
  children: ReactNode;
}) {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<AddedNotice | null>(null);
  const [checkout, setCheckout] = useState<CheckoutForm>(emptyCheckout);
  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>({});
  const noticeKey = useRef(0);

  // La página puede estar abierta hace rato: lo que avisa la base al enviar pisa el stock de la carta.
  const products = useMemo(
    () =>
      baseProducts.map((p) => {
        const stock = stockOverrides[p.id];
        return stock === undefined ? p : { ...p, stock, available: p.available && stock > 0 };
      }),
    [baseProducts, stockOverrides],
  );
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const summary = useMemo(() => summarizeCart(cart.lines, productsById), [cart.lines, productsById]);

  const quantityOf = useCallback(
    (productId: string) => cart.lines.find((l) => l.productId === productId)?.quantity ?? 0,
    [cart.lines],
  );

  const addItem = useCallback(
    (product: Product, quantity: number) => {
      const current = productsById.get(product.id) ?? product;
      if (!current.available || quantity <= 0) return;
      // El aviso y la medición cuentan lo que realmente entró (tope por producto y stock del día).
      const added = Math.min(quantity, orderLimit(current) - currentQuantity(current.id));
      if (added <= 0) return;
      cartStore.dispatch({ type: "add", productId: current.id, quantity: added });
      noticeKey.current += 1;
      setLastAdded({ key: noticeKey.current, product: current, quantity: added });
      track("add_to_cart", { product_id: current.id, product_name: current.name, quantity: added, price: current.price });
    },
    [productsById],
  );

  const increment = useCallback(
    (productId: string) => {
      const product = productsById.get(productId);
      if (product && currentQuantity(productId) >= orderLimit(product)) return;
      cartStore.dispatch({ type: "increment", productId });
    },
    [productsById],
  );

  const removeItem = useCallback(
    (productId: string) => {
      const product = productsById.get(productId);
      const quantity = quantityOf(productId);
      cartStore.dispatch({ type: "remove", productId });
      if (product && quantity > 0) {
        track("remove_from_cart", { product_id: product.id, product_name: product.name, quantity });
      }
    },
    [productsById, quantityOf],
  );

  const decrement = useCallback(
    (productId: string) => {
      if (quantityOf(productId) <= 1) removeItem(productId);
      else cartStore.dispatch({ type: "decrement", productId });
    },
    [quantityOf, removeItem],
  );

  const applyShortages = useCallback((shortages: Shortage[]) => {
    setStockOverrides((prev) => ({ ...prev, ...Object.fromEntries(shortages.map((s) => [s.productId, s.available])) }));
    for (const s of shortages) {
      // Con 0 la línea queda como "Se agotó por hoy" y no se envía; con más, baja a lo que hay.
      if (s.available > 0 && currentQuantity(s.productId) > s.available) {
        cartStore.dispatch({ type: "setQuantity", productId: s.productId, quantity: s.available });
      }
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      products,
      categories,
      summary,
      hydrated,
      stockControl,
      quantityOf,
      addItem,
      increment,
      decrement,
      removeItem,
      clearCart: () => cartStore.dispatch({ type: "clear" }),
      applyShortages,
      isCartOpen,
      openCart: () => {
        setLastAdded(null);
        setCartOpen(true);
      },
      closeCart: () => setCartOpen(false),
      lastAdded,
      dismissNotice: () => setLastAdded(null),
      checkout,
      updateCheckout: (patch) => setCheckout((prev) => ({ ...prev, ...patch })),
      resetCheckout: () => setCheckout(emptyCheckout),
    }),
    [
      products,
      categories,
      summary,
      hydrated,
      stockControl,
      quantityOf,
      addItem,
      increment,
      decrement,
      removeItem,
      applyShortages,
      isCartOpen,
      lastAdded,
      checkout,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return ctx;
}
