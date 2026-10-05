import { siteConfig } from "@/config/site";
import { deliveryModeLabel, normalizeCheckout, type CheckoutForm } from "./checkout";
import type { CartSummary } from "./cart/selectors";
import { formatPrice } from "./format";

/** https://wa.me/<número>?text=<mensaje codificado> */
export function buildWhatsAppUrl(message: string, number: string = siteConfig.whatsapp.number): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Mensaje del pedido, listo para WhatsApp (negritas con *asteriscos*). */
export function buildOrderMessage(summary: Pick<CartSummary, "lines" | "total">, form: CheckoutForm): string {
  const data = normalizeCheckout(form);
  const items = summary.lines.map(({ product, quantity, lineTotal }) =>
    lineTotal === null ? `${quantity}x ${product.name}` : `${quantity}x ${product.name} — ${formatPrice(lineTotal)}`,
  );
  const total = summary.total === null ? "a confirmar" : formatPrice(summary.total);

  const details = [
    `👤 *Nombre:* ${data.name}`,
    `${data.mode === "envio" ? "🛵" : "🏃"} *Modalidad:* ${deliveryModeLabel[data.mode]}`,
    data.mode === "envio" ? `📍 *Dirección:* ${data.address}` : null,
    data.notes ? `📝 *Observaciones:* ${data.notes}` : null,
  ].filter((line): line is string => line !== null);

  return [
    `Hola ${siteConfig.name}! 👋`,
    "Quiero hacer el siguiente pedido:",
    "",
    "🧾 *PEDIDO*",
    ...items,
    "",
    `*Total: ${total}*`,
    "",
    ...details,
    "",
    "¡Gracias!",
  ].join("\n");
}

/** Mensajes prearmados para consultas que no son pedidos. */
export const contactMessages = {
  general: `Hola ${siteConfig.name}! 👋 Tengo una consulta:`,
  work: `Hola ${siteConfig.name}! 👋 Me gustaría trabajar con ustedes. Les cuento un poco sobre mí:`,
  review: `Hola ${siteConfig.name}! 👋 Les quiero dejar mi reseña:`,
} as const;
