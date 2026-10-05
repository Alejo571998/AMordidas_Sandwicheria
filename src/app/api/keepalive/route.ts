import { revalidateTag } from "next/cache";
import { MENU_CACHE_TAG } from "@/lib/menu-settings";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Lo llama el cron de Vercel una vez por día (vercel.json).
 * - Mantiene activo el proyecto de Supabase: el plan gratis pausa los proyectos sin uso por 7 días.
 * - Refresca la carta por si alguien editó la tabla directo en Supabase y no desde el panel.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const env = getSupabaseEnv();
  if (!env) return Response.json({ ok: true, panel: "apagado" });

  const res = await fetch(`${env.url}/rest/v1/product_settings?select=product_id&limit=1`, {
    headers: { apikey: env.key },
    cache: "no-store",
  }).catch(() => null);

  if (!res?.ok) return Response.json({ ok: false, panel: "sin respuesta" }, { status: 502 });

  revalidateTag(MENU_CACHE_TAG, "max");
  return Response.json({ ok: true, panel: "activo" });
}
