"use client";

import { MAX_QUANTITY_PER_ITEM } from "@/lib/cart/reducer";
import { cn } from "@/lib/format";
import { Icon } from "./Icon";

interface QuantityStepperProps {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  /** Nombre del producto, para que el lector de pantalla diga "Sumar un Classic". */
  itemLabel: string;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  /** Con `true`, en 1 el botón de restar se convierte en "quitar". */
  removable?: boolean;
  tone?: "light" | "paper";
  className?: string;
}

export function QuantityStepper({
  value,
  onDecrement,
  onIncrement,
  itemLabel,
  min = 1,
  max = MAX_QUANTITY_PER_ITEM,
  size = "md",
  removable = false,
  tone = "light",
  className,
}: QuantityStepperProps) {
  const willRemove = removable && value <= 1;
  const btn = cn(
    "grid place-items-center rounded-full text-charcoal transition-colors duration-150",
    "hover:bg-charcoal hover:text-cream disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-charcoal",
    size === "md" ? "size-11" : "size-10",
  );
  return (
    <div
      role="group"
      aria-label={`Cantidad de ${itemLabel}`}
      className={cn(
        "inline-flex items-center rounded-full border border-charcoal/15 p-0.5",
        tone === "paper" ? "bg-paper" : "bg-white",
        className,
      )}
    >
      <button
        type="button"
        className={cn(btn, willRemove && "hover:bg-danger")}
        onClick={onDecrement}
        disabled={!removable && value <= min}
        aria-label={willRemove ? `Quitar ${itemLabel} del pedido` : `Restar uno de ${itemLabel}`}
      >
        <Icon name={willRemove ? "trash" : "minus"} size={18} />
      </button>
      <output aria-live="polite" className={cn("tabular text-center font-bold", size === "md" ? "w-8 text-lg" : "w-7 text-base")}>
        {value}
      </output>
      <button
        type="button"
        className={btn}
        onClick={onIncrement}
        disabled={value >= max}
        aria-label={`Sumar uno de ${itemLabel}`}
      >
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}
