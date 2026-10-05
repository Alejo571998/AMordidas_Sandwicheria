/**
 * Conexión a Supabase para el panel de administración (ver docs/ADMIN.md).
 *
 * Sin estas dos variables el panel queda apagado y la web usa los valores de src/data/products.ts.
 * La clave publicable es pública por diseño: lo que protege los datos son las políticas RLS.
 * La clave secreta (service_role / sb_secret_) NUNCA va en el frontend ni en variables NEXT_PUBLIC_*.
 */
export interface SupabaseEnv {
  url: string;
  key: string;
}

/** Rechaza claves secretas pegadas por error: darían acceso total a la base desde el navegador. */
function isSecretKey(key: string): boolean {
  if (key.startsWith("sb_secret_")) return true;
  const payload = key.split(".")[1];
  if (!payload) return false;
  try {
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: string };
    return json.role === "service_role";
  } catch {
    return false;
  }
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim();
  if (!url || !key) return null;
  if (isSecretKey(key)) {
    throw new Error(
      "La clave de Supabase configurada es SECRETA (service_role). Usá la clave publicable (sb_publishable_… o anon).",
    );
  }
  return { url: url.replace(/\/+$/, ""), key };
}

export function isPanelEnabled(): boolean {
  return getSupabaseEnv() !== null;
}

/**
 * Cookies de sesión del panel: solo viajan a /admin, no son legibles desde JavaScript
 * y en producción exigen HTTPS. El sitio público nunca las recibe.
 */
export const authCookieOptions = {
  path: "/admin",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
} as const;
