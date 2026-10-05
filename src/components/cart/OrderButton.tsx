"use client";

import type { MouseEvent, ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useCart } from "./CartProvider";

/**
 * "Pedir": si ya hay productos abre el pedido; si no, lleva al menú.
 * Es un link real a #menu, así funciona incluso antes de cargar JavaScript.
 */
export function OrderButton({
  children = "Pedir",
  variant = "primary",
  size = "md",
  className,
  showCount = false,
}: {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  showCount?: boolean;
}) {
  const { summary, hydrated, openCart } = useCart();
  const count = hydrated ? summary.itemCount + summary.unavailable.length : 0;

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (count > 0) {
      e.preventDefault();
      openCart();
    }
  };

  return (
    <a
      href="#menu"
      onClick={onClick}
      className={buttonClasses({ variant, size, className })}
      aria-label={count > 0 ? `Ver mi pedido, ${summary.itemCount} productos` : undefined}
    >
      {showCount && count > 0 ? <Icon name="bag" size={18} className="max-[359px]:hidden" /> : null}
      {children}
      {showCount && count > 0 ? (
        <span
          key={summary.itemCount}
          className="tabular -mr-2 grid h-6 min-w-6 animate-pop place-items-center rounded-full bg-mustard px-1.5 text-[0.75rem] text-charcoal"
          aria-hidden
        >
          {summary.itemCount}
        </span>
      ) : null}
    </a>
  );
}
