/**
 * Medición de conversión, lista para conectar a GA4 / GTM / Meta Pixel / Vercel Analytics.
 *
 * Hoy: empuja los eventos a `window.dataLayer` (si existe, ej: GTM) y emite un
 * CustomEvent "amordidas:analytics" en `window`. Para sumar una plataforma,
 * agregá su llamada dentro de `track` — los componentes no cambian.
 */

export interface AnalyticsEvents {
  menu_view: Record<string, never>;
  product_view: { product_id: string; product_name: string; category: string };
  add_to_cart: { product_id: string; product_name: string; quantity: number; price: number | null };
  remove_from_cart: { product_id: string; product_name: string; quantity: number };
  checkout_start: { item_count: number; total: number | null };
  whatsapp_order_click: { item_count: number; total: number | null; mode: string };
}

export type AnalyticsEventName = keyof AnalyticsEvents;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track<E extends AnalyticsEventName>(event: E, params: AnalyticsEvents[E]): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer?.push({ event, ...params });
    window.dispatchEvent(new CustomEvent("amordidas:analytics", { detail: { event, params } }));
    if (process.env.NODE_ENV === "development") console.debug("[analytics]", event, params);
  } catch {
    // la medición nunca debe romper la compra
  }
}
