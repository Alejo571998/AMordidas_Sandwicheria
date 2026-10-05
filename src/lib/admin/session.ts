import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminSession =
  | { status: "off" }
  | { status: "anonymous" }
  | { status: "forbidden"; email: string | null }
  | { status: "admin"; email: string | null; supabase: SupabaseClient };

/**
 * Quién está usando el panel. Se verifica el token (getClaims) y, además, que la cuenta
 * figure en la tabla `admins` de la base. Se llama en cada página y en cada acción.
 */
export const getAdminSession = cache(async (): Promise<AdminSession> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "off" };

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return { status: "anonymous" };
  const email = typeof claims.email === "string" ? claims.email : null;

  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
  if (rpcError || isAdmin !== true) return { status: "forbidden", email };

  return { status: "admin", email, supabase };
});
