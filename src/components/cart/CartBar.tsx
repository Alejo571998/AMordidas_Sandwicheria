"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn, formatPrice, pluralize } from "@/lib/format";
import { useCart } from "./CartProvider";

/** Barra flotante "Ver pedido" + aviso al agregar. Visible solo con productos en el pedido. */
export function CartBar() {
  const { summary, hydrated, isCartOpen, openCart, lastAdded, dismissNotice } = useCart();
  const { itemCount, total, hasPendingPrices } = summary;
  const visible = hydrated && itemCount > 0 && !isCartOpen;

  useEffect(() => {
    if (!lastAdded) return;
    const t = setTimeout(dismissNotice, 2800);
    return () => clearTimeout(t);
  }, [lastAdded, dismissNotice]);

  const totalLabel = hasPendingPrices ? "Total a confirmar" : total !== null ? formatPrice(total) : "";

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {lastAdded
          ? `Agregaste ${lastAdded.quantity} ${lastAdded.product.name}. Tu pedido tiene ${pluralize(itemCount, "producto", "productos")}.`
          : ""}
      </div>

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-300 ease-[var(--ease-out-quart)] md:inset-x-auto md:right-6 md:bottom-6 md:p-0",
          visible ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0",
        )}
      >
        {lastAdded && visible ? (
          <div
            key={`toast-${lastAdded.key}`}
            role="status"
            className="pointer-events-auto mx-auto mb-2 flex max-w-md animate-fade-up items-center gap-3 rounded-lg bg-orange-600 px-4 py-3 text-[0.875rem] text-white shadow-float md:max-w-[22rem]"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cream text-orange-700">
              <Icon name="check" size={16} />
            </span>
            <span className="min-w-0 flex-1 truncate">
              Sumaste{" "}
              <strong>
                {lastAdded.quantity}× <span translate="no">{lastAdded.product.name}</span>
              </strong>
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={openCart}
          tabIndex={visible ? 0 : -1}
          aria-hidden={!visible}
          key={`bar-${itemCount}`}
          className="pointer-events-auto mx-auto flex w-full max-w-md animate-bump items-center gap-3 rounded-xl bg-charcoal p-2 pl-3 text-left text-cream shadow-float md:w-[22rem]"
        >
          <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-cream/10">
            <Icon name="bag" size={22} />
            <span className="tabular absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-mustard px-1 text-[0.6875rem] font-bold text-charcoal">
              {itemCount}
            </span>
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[0.75rem] text-cream/70">{pluralize(itemCount, "producto", "productos")}</span>
            {hasPendingPrices ? (
              <span className="block truncate text-[0.8125rem] font-bold">
                <span className="max-[359px]:hidden">Total a confirmar</span>
                <span className="min-[360px]:hidden">A confirmar</span>
              </span>
            ) : (
              <span className="tabular block truncate font-bold">{totalLabel}</span>
            )}
          </span>
          <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-olive-600 px-4 text-[0.8125rem] max-[359px]:px-3 font-bold tracking-[0.06em] text-white uppercase">
            Ver pedido
            <Icon name="arrowRight" size={16} className="max-[389px]:hidden" />
          </span>
        </button>
      </div>
    </>
  );
}
