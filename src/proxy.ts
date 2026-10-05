import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Solo corre en /admin: renueva la sesión del panel. El sitio público no pasa por acá.
 * No es la barrera de seguridad: cada página y cada acción del panel verifica al usuario,
 * y la base lo vuelve a verificar con RLS.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
