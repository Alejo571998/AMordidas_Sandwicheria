import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/format";

export type ButtonVariant =
  | "primary"
  | "action"
  | "action-dark"
  | "cream"
  | "outline-light"
  | "outline-dark"
  | "whatsapp"
  | "dark"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-sans font-bold uppercase tracking-[0.06em] " +
  "transition-[transform,background-color,color,box-shadow,border-color] duration-200 ease-[var(--ease-out-quart)] " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 select-none whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-orange-600 text-white shadow-cta hover:bg-orange-700 hover:-translate-y-px",
  /** Acciones del pedido (Agregar, Ver pedido, Continuar): verde oliva de marca. */
  action: "bg-olive-600 text-white shadow-cta-olive hover:bg-olive-700 hover:-translate-y-px",
  /** Acción sobre fondos naranjas. */
  "action-dark": "bg-olive-900 text-cream shadow-cta-olive hover:bg-olive-950 hover:-translate-y-px",
  cream: "bg-cream text-charcoal shadow-[0_10px_24px_-12px_rgb(20_20_10/0.45)] hover:bg-white hover:-translate-y-px",
  "outline-light": "border-2 border-cream/70 text-cream hover:bg-cream hover:text-olive-900",
  "outline-dark": "border-2 border-charcoal/80 text-charcoal hover:bg-charcoal hover:text-cream",
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-700 hover:-translate-y-px shadow-[0_10px_24px_-12px_rgb(31_122_67/0.7)]",
  dark: "bg-charcoal text-cream hover:bg-olive-950",
  ghost: "text-charcoal underline-offset-4 hover:underline normal-case tracking-normal font-semibold",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[0.75rem]",
  md: "h-12 px-6 text-[0.8125rem]",
  lg: "h-14 px-7 text-[0.875rem]",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant, size, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...rest} />;
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant; size?: ButtonSize };

/** Link con apariencia de botón (navegación o enlaces externos como WhatsApp). */
export function ButtonLink({ variant, size, className, ...rest }: ButtonLinkProps) {
  return <a className={buttonClasses({ variant, size, className })} {...rest} />;
}
