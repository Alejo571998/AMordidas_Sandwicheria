export type DeliveryMode = "envio" | "retiro";

export interface CheckoutForm {
  name: string;
  mode: DeliveryMode;
  address: string;
  notes: string;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export const CHECKOUT_LIMITS = { name: 60, address: 140, notes: 280 } as const;

export const emptyCheckout: CheckoutForm = { name: "", mode: "envio", address: "", notes: "" };

export const deliveryModeLabel: Record<DeliveryMode, string> = {
  envio: "Envío a domicilio",
  retiro: "Retiro",
};

/** Normaliza texto libre: sin espacios sobrantes ni saltos de línea múltiples. */
export function cleanText(value: string, maxLength: number, { multiline = false } = {}): string {
  const normalized = multiline
    ? value.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n")
    : value.replace(/\s+/g, " ");
  return normalized
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim()
    .slice(0, maxLength);
}

export function normalizeCheckout(form: CheckoutForm): CheckoutForm {
  return {
    name: cleanText(form.name, CHECKOUT_LIMITS.name),
    mode: form.mode,
    address: form.mode === "envio" ? cleanText(form.address, CHECKOUT_LIMITS.address) : "",
    notes: cleanText(form.notes, CHECKOUT_LIMITS.notes, { multiline: true }),
  };
}

export function validateCheckout(form: CheckoutForm): CheckoutErrors {
  const data = normalizeCheckout(form);
  const errors: CheckoutErrors = {};
  if (data.name.length < 2) errors.name = "Decinos tu nombre para saber de quién es el pedido.";
  if (data.mode !== "envio" && data.mode !== "retiro") errors.mode = "Elegí si lo retirás o te lo enviamos.";
  if (data.mode === "envio" && data.address.length < 5) {
    errors.address = "Necesitamos la dirección completa: calle, número y piso o depto si corresponde.";
  }
  return errors;
}
