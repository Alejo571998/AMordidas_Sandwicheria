"use client";

import { useId, useState, type FormEvent } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { CHECKOUT_LIMITS, validateCheckout, type CheckoutErrors, type DeliveryMode } from "@/lib/checkout";
import { cn } from "@/lib/format";
import { useCart } from "./CartProvider";

export const CHECKOUT_FORM_ID = "checkout-form";

const fieldBase =
  "w-full rounded-md border-[1.5px] bg-white px-4 text-base text-charcoal placeholder:text-[#8a8270] transition-[border-color,box-shadow] duration-150 " +
  "focus:border-olive-700 focus:shadow-[0_0_0_4px_rgb(92_90_44/0.15)] focus:outline-none";

const modes: Array<{ id: DeliveryMode; title: string; hint: string; icon: IconName }> = [
  { id: "envio", title: "Envío", hint: `A tu puerta, en ${siteConfig.delivery.area}`, icon: "scooter" },
  { id: "retiro", title: "Retiro", hint: "Pasás a buscarlo, coordinamos por WhatsApp", icon: "walk" },
];

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[0.8125rem] font-semibold text-danger">
      <Icon name="info" size={16} className="mt-0.5 shrink-0" />
      {message}
    </p>
  );
}

export function CheckoutForm({ onValid }: { onValid: () => void }) {
  const { checkout, updateCheckout } = useCart();
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    address: `${uid}-address`,
    notes: `${uid}-notes`,
    nameErr: `${uid}-name-err`,
    addressErr: `${uid}-address-err`,
    addressHint: `${uid}-address-hint`,
    notesHint: `${uid}-notes-hint`,
  };

  const set = <K extends keyof typeof checkout>(key: K, value: (typeof checkout)[K]) => {
    updateCheckout({ [key]: value });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateCheckout(checkout);
    setErrors(found);
    const first = (["name", "address"] as const).find((k) => found[k]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    onValid();
  };

  const notesLeft = CHECKOUT_LIMITS.notes - checkout.notes.length;

  return (
    <form id={CHECKOUT_FORM_ID} noValidate onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor={ids.name} className="mb-1.5 block text-[0.875rem] font-bold">
          Tu nombre
        </label>
        <input
          id={ids.name}
          name="name"
          autoComplete="given-name"
          enterKeyHint="next"
          maxLength={CHECKOUT_LIMITS.name}
          value={checkout.name}
          onChange={(e) => set("name", e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? ids.nameErr : undefined}
          placeholder="Ej: Sofía"
          className={cn(fieldBase, "h-12", errors.name ? "border-danger" : "border-charcoal/15")}
          required
        />
        <FieldError id={ids.nameErr} message={errors.name} />
      </div>

      <fieldset>
        <legend className="mb-1.5 text-[0.875rem] font-bold">¿Cómo lo querés?</legend>
        <div className="grid grid-cols-2 gap-2">
          {modes.map((m) => {
            const checked = checkout.mode === m.id;
            return (
              <label
                key={m.id}
                className={cn(
                  "relative flex flex-col gap-1 rounded-md border-[1.5px] p-3 transition-colors duration-150",
                  "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-charcoal",
                  checked ? "border-olive-700 bg-olive-100/60" : "border-charcoal/15 bg-white hover:border-charcoal/35",
                )}
              >
                <input
                  type="radio"
                  name="mode"
                  value={m.id}
                  checked={checked}
                  onChange={() => set("mode", m.id)}
                  className="sr-only"
                />
                <span className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-bold">
                    <Icon name={m.icon} size={20} className="text-olive-700" />
                    {m.title}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-5 place-items-center rounded-full border-2",
                      checked ? "border-olive-700 bg-olive-700 text-cream" : "border-charcoal/25",
                    )}
                  >
                    {checked ? <Icon name="check" size={12} /> : null}
                  </span>
                </span>
                <span className="text-[0.75rem] leading-snug text-ink-muted">{m.hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {checkout.mode === "envio" ? (
        <div className="animate-fade-up">
          <label htmlFor={ids.address} className="mb-1.5 block text-[0.875rem] font-bold">
            Dirección de entrega
          </label>
          <input
            id={ids.address}
            name="address"
            autoComplete="street-address"
            enterKeyHint="next"
            maxLength={CHECKOUT_LIMITS.address}
            value={checkout.address}
            onChange={(e) => set("address", e.target.value)}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={[ids.addressHint, errors.address ? ids.addressErr : ""].filter(Boolean).join(" ")}
            placeholder="Calle, número, piso/depto"
            className={cn(fieldBase, "h-12", errors.address ? "border-danger" : "border-charcoal/15")}
            required
          />
          <p id={ids.addressHint} className="mt-1.5 text-[0.75rem] text-ink-muted">
            Hacemos envíos dentro de {siteConfig.delivery.area}. {siteConfig.delivery.note}
          </p>
          <FieldError id={ids.addressErr} message={errors.address} />
        </div>
      ) : null}

      <div>
        <label htmlFor={ids.notes} className="mb-1.5 flex items-baseline justify-between text-[0.875rem] font-bold">
          Observaciones <span className="text-[0.75rem] font-normal text-ink-muted">Opcional</span>
        </label>
        <textarea
          id={ids.notes}
          name="notes"
          rows={3}
          maxLength={CHECKOUT_LIMITS.notes}
          value={checkout.notes}
          onChange={(e) => set("notes", e.target.value)}
          aria-describedby={ids.notesHint}
          placeholder="Ej: el Classic sin ketchup, tocar timbre 2B, lo quiero para las 21 hs."
          className={cn(fieldBase, "resize-none border-charcoal/15 py-3 leading-snug")}
        />
        <p id={ids.notesHint} className="mt-1.5 text-right text-[0.75rem] text-ink-muted" aria-live="polite">
          {notesLeft <= 60 ? `Te quedan ${notesLeft} caracteres` : " "}
        </p>
      </div>
    </form>
  );
}
