import type { ReactNode } from "react";
import { CartBar } from "@/components/cart/CartBar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getMenu } from "@/lib/catalog";
import { isPanelEnabled } from "@/lib/supabase/env";

/** Estructura del sitio público: carrito, header, contenido, footer. El panel /admin no la usa. */
export async function SiteShell({ children }: { children: ReactNode }) {
  const menu = await getMenu();
  return (
    <CartProvider products={menu.products} categories={menu.categories} stockControl={isPanelEnabled()}>
      <Header />
      <main id="contenido" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <CartBar />
      <CartDrawer />
    </CartProvider>
  );
}
