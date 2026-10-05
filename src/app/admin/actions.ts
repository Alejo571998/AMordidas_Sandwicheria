"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { parsePriceInput } from "@/lib/admin/price";
import { knownProductIds } from "@/lib/catalog";
import { pluralize } from "@/lib/format";
import { MENU_CACHE_TAG } from "@/lib/menu-settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Cada acción es un punto de entrada público (POST): valida todo y verifica la sesión adentro.

export interface LoginState {
  error: string | null;
  email: string;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(formData.get("password") ?? "").slice(0, 200);
  if (!email || !password) return { error: "Completá tu email y tu contraseña.", email };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "El panel todavía no está activo.", email };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.status === 429) return { error: "Demasiados intentos. Esperá unos minutos y probá de nuevo.", email };
    if (error.code === "email_not_confirmed") return { error: "Tu email todavía no está confirmado.", email };
    // Mensaje único: no revela si el email existe.
    return { error: "Email o contraseña incorrectos.", email };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "Esta cuenta no tiene acceso al panel.", email };
  }

  redirect("/admin");
}

export async function logout(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

export interface SaveState {
  status: "idle" | "saved" | "error";
  message: string | null;
  /** Error por producto (id → mensaje). */
  errors: Record<string, string>;
}

const fail = (message: string, errors: Record<string, string> = {}): SaveState => ({ status: "error", message, errors });

export async function saveSettings(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getAdminSession();
  if (session.status !== "admin") return fail("Tu sesión se cerró. Entrá de nuevo para guardar.");

  let changes: unknown;
  try {
    changes = JSON.parse(String(formData.get("changes") ?? "[]"));
  } catch {
    return fail("No se pudieron leer los cambios. Recargá la página.");
  }
  if (!Array.isArray(changes) || changes.length === 0) return fail("No hay cambios para guardar.");
  if (changes.length > knownProductIds.size) return fail("Demasiados cambios en un solo envío.");

  const rows: Array<{ product_id: string; price: number | null; available: boolean; active: boolean }> = [];
  const errors: Record<string, string> = {};
  for (const change of changes) {
    if (!change || typeof change !== "object") return fail("Cambios inválidos. Recargá la página.");
    const { productId, price, available, active } = change as Record<string, unknown>;
    if (typeof productId !== "string" || !knownProductIds.has(productId)) {
      return fail("Hay un producto que no existe en la carta. Recargá la página.");
    }
    if (typeof available !== "boolean" || typeof active !== "boolean" || typeof price !== "string") {
      errors[productId] = "Datos inválidos.";
      continue;
    }
    const parsed = parsePriceInput(price);
    if (!parsed.ok) {
      errors[productId] = parsed.error;
      continue;
    }
    rows.push({ product_id: productId, price: parsed.value, available, active });
  }
  if (Object.keys(errors).length > 0) return fail("Revisá los precios marcados en rojo.", errors);

  // La base vuelve a verificar que la cuenta sea admin (RLS): esto no depende solo de este chequeo.
  const { error } = await session.supabase.from("product_settings").upsert(rows, { onConflict: "product_id" });
  if (error) return fail("No se pudo guardar. Probá de nuevo en un rato.");

  // La web pública deja de usar la versión cacheada: el próximo visitante ya ve los cambios.
  updateTag(MENU_CACHE_TAG);
  return {
    status: "saved",
    message: `Listo: ${pluralize(rows.length, "cambio guardado", "cambios guardados")}. Ya se ve en la web.`,
    errors: {},
  };
}
