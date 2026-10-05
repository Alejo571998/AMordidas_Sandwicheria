"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { track } from "@/lib/analytics";
import { cn, formatPrice, pluralize } from "@/lib/format";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { ClearCartButton, CartLineItem, EmptyCart, OrderSummary, UnavailableLineItem } from "./CartLines";
import { CHECKOUT_FORM_ID, CheckoutForm } from "./CheckoutForm";
import { useCart } from "./CartProvider";

type Step = "cart" | "details" | "confirm" | "sent";

/** Vista previa con el formato de WhatsApp: *texto* en negrita. */
function WhatsAppText({ text }: { text: string }) {
  return text
    .split(/(\*[^*\n]+\*)/g)
    .map((part, i) => (/^\*[^*\n]+\*$/.test(part) ? <strong key={i}>{part.slice(1, -1)}</strong> : part));
}

const titles: Record<Step, string> = {
  cart: "Tu pedido",
  details: "Tus datos",
  confirm: "Tu pedido está listo 🍔",
  sent: "¡Listo!",
};

const progress: Array<{ step: Step; label: string }> = [
  { step: "cart", label: "Pedido" },
  { step: "details", label: "Tus datos" },
  { step: "confirm", label: "Enviar" },
];

export function CartDrawer() {
  const { summary, isCartOpen, closeCart, checkout, clearCart, resetCheckout } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [rawStep, setStep] = useState<Step>("cart");
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sincroniza el <dialog> nativo con el estado global.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isCartOpen && !dialog.open) dialog.showModal();
    if (!isCartOpen && dialog.open) dialog.close();
  }, [isCartOpen]);

  const goTo = (next: Step) => {
    setStep(next);
    requestAnimationFrame(() => titleRef.current?.focus());
  };

  const onDialogClose = () => {
    closeCart();
    setStep("cart");
    setSentMessage(null);
    setCopied(false);
  };

  // Click en el fondo oscuro cierra (el <dialog> ocupa solo el panel).
  const onDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) dialogRef.current?.close();
  };

  const browseMenu = () => {
    dialogRef.current?.close();
    requestAnimationFrame(() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" }));
  };

  const message = buildOrderMessage(summary, checkout);
  const whatsappUrl = buildWhatsAppUrl(sentMessage ?? message);
  const isEmpty = summary.lines.length === 0 && summary.unavailable.length === 0;
  const canContinue = summary.lines.length > 0;
  // Si el pedido queda vacío a mitad del checkout (ej: se vació en otra pestaña), volvemos al paso 1.
  const step: Step = (rawStep === "details" || rawStep === "confirm") && !canContinue ? "cart" : rawStep;

  const startCheckout = () => {
    track("checkout_start", { item_count: summary.itemCount, total: summary.total });
    goTo("details");
  };

  const onSend = () => {
    track("whatsapp_order_click", { item_count: summary.itemCount, total: summary.total, mode: checkout.mode });
    const sent = message;
    // Diferido: el link abre WhatsApp primero; después limpiamos el pedido.
    setTimeout(() => {
      setSentMessage(sent);
      clearCart();
      resetCheckout();
      goTo("sent");
    }, 60);
  };

  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(sentMessage ?? message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const currentIndex = progress.findIndex((p) => p.step === step);

  return (
    <dialog
      ref={dialogRef}
      className="drawer"
      aria-labelledby="cart-title"
      onClose={onDialogClose}
      onClick={onDialogClick}
    >
      <div className="flex h-full flex-col">
        <div aria-hidden className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-charcoal/15 md:hidden" />

        <header className="flex items-center gap-2 px-4 pt-2 pb-3 md:px-6 md:pt-5">
          {step === "details" || step === "confirm" ? (
            <button
              type="button"
              onClick={() => goTo(step === "details" ? "cart" : "details")}
              className="-ml-1 grid size-11 shrink-0 place-items-center rounded-full hover:bg-charcoal/8"
              aria-label="Volver al paso anterior"
            >
              <Icon name="arrowLeft" size={22} />
            </button>
          ) : null}
          <h2 id="cart-title" ref={titleRef} tabIndex={-1} className={cn("flex-1 font-display leading-none outline-none", step === "confirm" ? "text-[1.75rem]" : "text-[2rem]")}>
            {titles[step]}
            {step === "cart" && summary.itemCount > 0 ? (
              <span className="ml-2 align-middle font-sans text-[0.875rem] font-semibold text-ink-muted">
                ({pluralize(summary.itemCount, "producto", "productos")})
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-charcoal/6 hover:bg-charcoal hover:text-cream"
            aria-label="Cerrar pedido"
          >
            <Icon name="close" size={22} />
          </button>
        </header>

        {step !== "sent" && !isEmpty ? (
          <ol className="flex gap-1.5 px-4 pb-3 md:px-6" aria-label="Pasos del pedido">
            {progress.map((p, i) => (
              <li key={p.step} className="flex-1" aria-current={p.step === step ? "step" : undefined}>
                <span className={cn("block h-1 rounded-full", i <= currentIndex ? "bg-orange-600" : "bg-charcoal/12")} />
                <span className={cn("mt-1.5 block text-[0.6875rem] font-bold tracking-[0.1em] uppercase", i <= currentIndex ? "text-charcoal" : "text-ink-muted/70")}>
                  {i + 1}. {p.label}
                </span>
              </li>
            ))}
          </ol>
        ) : null}

        <div className="flex-1 overflow-y-auto overscroll-contain border-t border-charcoal/8 px-4 md:px-6">
          {step === "cart" ? (
            isEmpty ? (
              <EmptyCart onBrowse={browseMenu} />
            ) : (
              <>
                <ul className="divide-y divide-charcoal/8">
                  {summary.lines.map((line) => (
                    <CartLineItem key={line.product.id} line={line} />
                  ))}
                  {summary.unavailable.map((line) => (
                    <UnavailableLineItem key={line.product.id} line={line} />
                  ))}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-charcoal/8 py-3">
                  <button
                    type="button"
                    onClick={browseMenu}
                    className="inline-flex min-h-11 items-center gap-1.5 text-[0.8125rem] font-bold text-olive-700 underline-offset-4 hover:underline"
                  >
                    <Icon name="plus" size={16} />
                    Sumar algo más
                  </button>
                  <ClearCartButton />
                </div>
              </>
            )
          ) : null}

          {step === "details" ? (
            <div className="py-5">
              <CheckoutForm onValid={() => goTo("confirm")} />
              <details className="group mt-6">
                <summary className="flex min-h-11 list-none items-center justify-between font-bold [&::-webkit-details-marker]:hidden">
                  Ver resumen ({pluralize(summary.itemCount, "producto", "productos")})
                  <Icon name="arrowDown" size={18} className="transition-transform group-open:rotate-180" />
                </summary>
                <OrderSummary lines={summary.lines} total={summary.total} className="mt-2" />
              </details>
            </div>
          ) : null}

          {step === "confirm" ? (
            <div className="py-5">
              <p className="text-ink-muted">
                Vamos a abrir WhatsApp con tu pedido ya escrito. <strong className="text-charcoal">Solo tenés que tocar enviar.</strong>
              </p>
              <div className="mt-5 rounded-lg bg-[#e7dfd2] p-3 bg-grain">
                <p className="mb-2 flex items-center gap-2 text-[0.75rem] font-semibold text-ink-muted">
                  <Icon name="whatsapp" size={16} className="text-whatsapp" />
                  Así nos llega tu mensaje
                </p>
                <div className="relative ml-auto max-w-[94%] rounded-lg rounded-tr-xs bg-[#d9fdd3] px-3.5 py-3 text-[0.875rem] leading-relaxed whitespace-pre-wrap text-[#111b21] shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]">
                  <WhatsAppText text={message} />
                </div>
              </div>
            </div>
          ) : null}

          {step === "sent" ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="grid size-20 animate-pop place-items-center rounded-full bg-mustard text-charcoal">
                <Icon name="check" size={40} />
              </span>
              <p className="mt-6 font-display text-display-md">Abrimos WhatsApp con tu pedido</p>
              <p className="mt-2 max-w-xs text-ink-muted">
                Mandá el mensaje y te confirmamos por ahí. Gracias por elegirnos.
              </p>
              <div className="mt-8 w-full rounded-lg bg-paper/70 p-4 text-left">
                <p className="font-bold">¿No se abrió WhatsApp?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ButtonLink href={whatsappUrl} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="sm">
                    <Icon name="whatsapp" size={16} />
                    Abrir de nuevo
                  </ButtonLink>
                  <Button onClick={copyOrder} variant="outline-dark" size="sm">
                    <Icon name={copied ? "check" : "copy"} size={16} />
                    {copied ? "Copiado" : "Copiar pedido"}
                  </Button>
                </div>
                <p className="mt-3 text-[0.8125rem] text-ink-muted">
                  También podés escribirnos al <strong className="text-charcoal">{siteConfig.whatsapp.display}</strong>.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <footer className={cn("border-t border-charcoal/8 bg-cream px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6 md:pb-6", step === "cart" && isEmpty && "hidden")}>
          {step === "cart" && !isEmpty ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className="font-bold">Total</span>
                <span className="tabular font-display text-[2rem] leading-none">
                  {summary.total !== null ? formatPrice(summary.total) : "A confirmar"}
                </span>
              </div>
              {summary.hasPendingPrices ? (
                <p className="mt-1 text-[0.8125rem] text-ink-muted">
                  {summary.subtotal > 0 ? `Subtotal con precio: ${formatPrice(summary.subtotal)}. ` : ""}
                  Te confirmamos el total por WhatsApp.
                </p>
              ) : null}
              <Button onClick={startCheckout} disabled={!canContinue} variant="action" size="lg" className="mt-4 w-full">
                Continuar
                <Icon name="arrowRight" size={18} />
              </Button>
            </>
          ) : null}

          {step === "details" ? (
            <>
              <Button type="submit" form={CHECKOUT_FORM_ID} variant="whatsapp" size="lg" className="w-full">
                <Icon name="whatsapp" size={20} />
                Pedir por WhatsApp
              </Button>
              <p className="mt-2 text-center text-[0.75rem] text-ink-muted">Antes de enviar vas a ver cómo queda el mensaje.</p>
            </>
          ) : null}

          {step === "confirm" ? (
            <>
              <ButtonLink
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onSend}
                variant="whatsapp"
                size="lg"
                className="w-full"
              >
                <Icon name="whatsapp" size={20} />
                Enviar pedido
              </ButtonLink>
              <button
                type="button"
                onClick={() => goTo("details")}
                className="mt-2 min-h-11 w-full text-[0.875rem] font-semibold text-ink-muted underline-offset-4 hover:text-charcoal hover:underline"
              >
                Volver a editar
              </button>
            </>
          ) : null}

          {step === "sent" ? (
            <Button onClick={browseMenu} size="lg" className="w-full">
              Hacer otro pedido
            </Button>
          ) : null}
        </footer>
      </div>
    </dialog>
  );
}
