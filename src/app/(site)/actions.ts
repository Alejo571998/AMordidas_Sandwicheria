"use server";

import { revalidateTag } from "next/cache";
import { knownProductIds } from "@/lib/catalog";
import { MENU_CACHE_TAG } from "@/lib/menu-settings";
import { normalizeOrderItems, parsePlaceOrderResult, type Shortage } from "@/lib/orders";
import { getSupabaseEnv } from "@/lib/supabase/env";

export type ReserveResult =
  /** Stock descontado: abrir WhatsApp. */
  | { status: "reserved"; soldOut: string[] }
  /** No se controló stock (panel apagado, base sin la función, error técnico): el pedido sale igual. */
  | { status: "skipped" }
  /** No alcanza: no se descontó nada. */
  | { status: "shortage"; shortages: Shortage[] };

/**
 * Se llama al tocar "Enviar pedido". Descuenta el stock de forma atómica en la base.
 * Ante cualquier problema técnico deja pasar el pedido: nunca se pierde una venta por la web.
 * Es un punto de entrada público: valida todo y no confía en el navegador.
 */
export async function reserveOrder(items: unknown): Promise<ReserveResult> {
  const env = getSupabaseEnv();
  if (!env) return { status: "skipped" };

  const normalized = normalizeOrderItems(items, knownProductIds);
  if (!normalized) return { status: "skipped" };

  let json: unknown;
  try {
    const res = await fetch(`${env.url}/rest/v1/rpc/place_order`, {
      method: "POST",
      headers: { apikey: env.key, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: normalized.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      }),
      cache: "no-store",
    });
    if (!res.ok) return { status: "skipped" };
    json = await res.json();
  } catch {
    return { status: "skipped" };
  }

  const result = parsePlaceOrderResult(json);
  if (result.kind === "stock") return { status: "shortage", shortages: result.shortages };
  if (result.kind !== "ok") return { status: "skipped" };

  // El stock cambió: el próximo visitante ve las unidades nuevas (o "agotado por hoy").
  revalidateTag(MENU_CACHE_TAG, { expire: 0 });
  return { status: "reserved", soldOut: result.soldOut };
}
