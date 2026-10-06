"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { validatePasswordChange, type PasswordErrors } from "@/lib/admin/password";
import { getAdminSession } from "@/lib/admin/session";
import { parsePriceInput } from "@/lib/admin/price";
import { parseStockInput } from "@/lib/admin/stock-input";
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

  type Row = { product_id: string; price: number | null; available: boolean; active: boolean; stock?: number | null };
  const rows: Row[] = [];
  // Errores por campo: "<id>" para el precio y "<id>:stock" para las unidades.
  const errors: Record<string, string> = {};
  for (const change of changes) {
    if (!change || typeof change !== "object") return fail("Cambios inválidos. Recargá la página.");
    const { productId, price, available, active, stock } = change as Record<string, unknown>;
    if (typeof productId !== "string" || !knownProductIds.has(productId)) {
      return fail("Hay un producto que no existe en la carta. Recargá la página.");
    }
    if (typeof available !== "boolean" || typeof active !== "boolean" || typeof price !== "string") {
      errors[productId] = "Datos inválidos.";
      continue;
    }
    if (stock !== undefined && typeof stock !== "string") {
      errors[`${productId}:stock`] = "Datos inválidos.";
      continue;
    }
    const parsedPrice = parsePriceInput(price);
    if (!parsedPrice.ok) errors[productId] = parsedPrice.error;
    const parsedStock = stock === undefined ? null : parseStockInput(stock);
    if (parsedStock && !parsedStock.ok) errors[`${productId}:stock`] = parsedStock.error;
    if (!parsedPrice.ok || (parsedStock && !parsedStock.ok)) continue;

    const row: Row = { product_id: productId, price: parsedPrice.value, available, active };
    // Solo si el panel mandó unidades (la base puede no tener todavía la columna `stock`).
    if (parsedStock?.ok) row.stock = parsedStock.value;
    rows.push(row);
  }
  if (Object.keys(errors).length > 0) return fail("Revisá los campos marcados en rojo.", errors);

  // La base vuelve a verificar que la cuenta sea admin (RLS): esto no depende solo de este chequeo.
  const { error } = await session.supabase.from("product_settings").upsert(rows, { onConflict: "product_id" });
  if (error) {
    if (error.code === "PGRST204") return fail("Falta actualizar la base para guardar unidades (ver docs/ADMIN.md).");
    return fail("No se pudo guardar. Probá de nuevo en un rato.");
  }

  // La web pública deja de usar la versión cacheada: el próximo visitante ya ve los cambios.
  updateTag(MENU_CACHE_TAG);
  return {
    status: "saved",
    message: `Listo: ${pluralize(rows.length, "cambio guardado", "cambios guardados")}. Ya se ve en la web.`,
    errors: {},
  };
}

export interface PasswordState {
  status: "idle" | "saved" | "error";
  message: string | null;
  errors: PasswordErrors;
}

export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const session = await getAdminSession();
  if (session.status !== "admin" || !session.email) {
    return { status: "error", message: "Tu sesión se cerró. Entrá de nuevo para cambiar la contraseña.", errors: {} };
  }

  const current = String(formData.get("current") ?? "").slice(0, 200);
  const next = String(formData.get("next") ?? "").slice(0, 200);
  const confirm = String(formData.get("confirm") ?? "").slice(0, 200);
  const errors = validatePasswordChange({ current, next, confirm });
  if (Object.keys(errors).length > 0) return { status: "error", message: "Revisá los campos marcados.", errors };

  const { supabase, email } = session;

  // Se verifica la contraseña actual siempre, aunque el proyecto de Supabase no lo exija:
  // así nadie puede cambiarla con una sesión que quedó abierta en otro dispositivo.
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password: current });
  if (authError) {
    if (authError.status === 429) {
      return { status: "error", message: "Demasiados intentos. Esperá unos minutos y probá de nuevo.", errors: {} };
    }
    return { status: "error", message: "Revisá los campos marcados.", errors: { current: "La contraseña actual no es correcta." } };
  }

  const { error } = await supabase.auth.updateUser({ password: next, current_password: current });
  if (error) {
    if (error.code === "same_password") {
      return { status: "error", message: "Revisá los campos marcados.", errors: { next: "Tiene que ser distinta de la actual." } };
    }
    if (error.code === "weak_password") {
      return {
        status: "error",
        message: "Revisá los campos marcados.",
        errors: { next: "Es muy fácil de adivinar. Probá con una frase más larga." },
      };
    }
    if (error.status === 429) {
      return { status: "error", message: "Demasiados intentos. Esperá unos minutos y probá de nuevo.", errors: {} };
    }
    return { status: "error", message: "No se pudo cambiar la contraseña. Probá de nuevo en un rato.", errors: {} };
  }

  // Cierra las sesiones abiertas en otros dispositivos; esta queda activa.
  await supabase.auth.signOut({ scope: "others" });
  return { status: "saved", message: "Listo: tu contraseña cambió. Se cerraron las sesiones de otros dispositivos.", errors: {} };
}
