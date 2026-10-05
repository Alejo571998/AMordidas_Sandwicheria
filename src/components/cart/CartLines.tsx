"use client";

import Image from "next/image";
import { useState } from "react";
import { Stamp } from "@/components/brand/Brand";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import type { ResolvedLine } from "@/lib/cart/selectors";
import { cn, formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";

function LineThumb({ line }: { line: ResolvedLine }) {
  return (
    <div className="relative size-18 shrink-0 overflow-hidden rounded-md bg-paper">
      <Image src={line.product.image.src} alt="" fill sizes="72px" className="object-cover" />
    </div>
  );
}

export function CartLineItem({ line }: { line: ResolvedLine }) {
  const { increment, decrement } = useCart();
  const { product, quantity, lineTotal } = line;
  return (
    <li className="flex gap-3 py-4">
      <LineThumb line={line} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-[1.375rem] leading-none text-charcoal">{product.name}</p>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">
              {product.price !== null ? `${formatPrice(product.price)} c/u` : "Precio a confirmar"}
            </p>
          </div>
          {lineTotal !== null ? <p className="tabular shrink-0 pt-0.5 font-bold">{formatPrice(lineTotal)}</p> : null}
        </div>
        <QuantityStepper
          size="sm"
          removable
          value={quantity}
          itemLabel={product.name}
          onDecrement={() => decrement(product.id)}
          onIncrement={() => increment(product.id)}
          className="self-start"
        />
      </div>
    </li>
  );
}

export function UnavailableLineItem({ line }: { line: ResolvedLine }) {
  const { removeItem } = useCart();
  return (
    <li className="flex items-center gap-3 py-4 opacity-80">
      <div className="grayscale">
        <LineThumb line={line} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[1.375rem] leading-none text-charcoal line-through decoration-1">
          {line.product.name}
        </p>
        <p className="mt-1 text-[0.8125rem] font-semibold text-danger">Se agotó por hoy. No va en el pedido.</p>
      </div>
      <button
        type="button"
        onClick={() => removeItem(line.product.id)}
        className="grid size-11 place-items-center rounded-full text-charcoal hover:bg-charcoal hover:text-cream"
        aria-label={`Quitar ${line.product.name} del pedido`}
      >
        <Icon name="trash" size={18} />
      </button>
    </li>
  );
}

export function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <Stamp className="size-28 text-mustard" />
      <p className="mt-6 font-display text-display-md text-charcoal">Tu pedido está vacío</p>
      <p className="mt-2 max-w-xs text-ink-muted">Todavía no elegiste nada… y eso tiene arreglo.</p>
      <Button onClick={onBrowse} className="mt-6">
        Ver el menú
      </Button>
    </div>
  );
}

export function ClearCartButton() {
  const { clearCart } = useCart();
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex min-h-11 items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-muted underline-offset-4 hover:text-charcoal hover:underline"
      >
        <Icon name="trash" size={16} />
        Vaciar pedido
      </button>
    );
  }
  return (
    <div role="group" aria-label="Confirmar vaciar pedido" className="flex min-h-11 items-center gap-2 text-[0.8125rem]">
      <span className="font-semibold">¿Vaciamos todo?</span>
      <button
        type="button"
        onClick={() => {
          clearCart();
          setConfirming(false);
        }}
        className="rounded-full bg-danger px-3 py-1.5 font-bold text-white"
      >
        Sí, vaciar
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="rounded-full px-3 py-1.5 font-semibold hover:bg-charcoal/8">
        No
      </button>
    </div>
  );
}

/** Resumen compacto (paso de datos y confirmación). */
export function OrderSummary({ lines, total, className }: { lines: ResolvedLine[]; total: number | null; className?: string }) {
  return (
    <div className={cn("rounded-lg bg-paper/70 p-4", className)}>
      <ul className="space-y-1.5 text-[0.9375rem]">
        {lines.map(({ product, quantity, lineTotal }) => (
          <li key={product.id} className="flex justify-between gap-3">
            <span className="min-w-0">
              <span className="tabular font-bold">{quantity}×</span> {product.name}
            </span>
            <span className="tabular shrink-0 text-ink-muted">{lineTotal !== null ? formatPrice(lineTotal) : "a confirmar"}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-baseline justify-between border-t border-charcoal/10 pt-3">
        <span className="font-bold">Total</span>
        <span className="tabular font-display text-2xl leading-none text-charcoal">
          {total !== null ? formatPrice(total) : "A confirmar"}
        </span>
      </div>
    </div>
  );
}
