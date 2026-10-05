"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
import { summarizeCart, type CartSummary } from "@/lib/cart/selectors";
import { cartStore } from "@/lib/cart/store";
import { emptyCheckout, type CheckoutForm } from "@/lib/checkout";
import type { Category, Product } from "@/types/product";

export interface AddedNotice {
  key: number;
  product: Product;
  quantity: number;
}

interface CartContextValue {
  products: Product[];
  categories: Category[];
  summary: CartSummary;
  /** false durante el render del servidor / hidratación: evita un carrito vacío que después "salta". */
  hydrated: boolean;
  quantityOf: (productId: string) => number;
  addItem: (product: Product, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;

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

export function CartProvider({
  products,
  categories,
  children,
}: {
  products: Product[];
  categories: Category[];
  children: ReactNode;
}) {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<AddedNotice | null>(null);
  const [checkout, setCheckout] = useState<CheckoutForm>(emptyCheckout);
  const noticeKey = useRef(0);

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const summary = useMemo(() => summarizeCart(cart.lines, productsById), [cart.lines, productsById]);

  const quantityOf = useCallback(
    (productId: string) => cart.lines.find((l) => l.productId === productId)?.quantity ?? 0,
    [cart.lines],
  );

  const addItem = useCallback((product: Product, quantity: number) => {
    if (!product.available || quantity <= 0) return;
    cartStore.dispatch({ type: "add", productId: product.id, quantity });
    noticeKey.current += 1;
    setLastAdded({ key: noticeKey.current, product, quantity });
    track("add_to_cart", { product_id: product.id, product_name: product.name, quantity, price: product.price });
  }, []);

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

  const value = useMemo<CartContextValue>(
    () => ({
      products,
      categories,
      summary,
      hydrated,
      quantityOf,
      addItem,
      increment: (productId) => cartStore.dispatch({ type: "increment", productId }),
      decrement,
      removeItem,
      clearCart: () => cartStore.dispatch({ type: "clear" }),
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
    [products, categories, summary, hydrated, quantityOf, addItem, decrement, removeItem, isCartOpen, lastAdded, checkout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return ctx;
}
