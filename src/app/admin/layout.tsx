import type { Metadata } from "next";
import { Wordmark } from "@/components/brand/Brand";
import { Icon } from "@/components/ui/Icon";
import { getAdminSession } from "@/lib/admin/session";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | Panel A Mordidas" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getAdminSession();
  const signedIn = session.status === "admin" || session.status === "forbidden";

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-30 border-b border-charcoal/8 bg-cream/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-3">
          <a href="/admin" className="flex items-center gap-2.5 rounded-sm" aria-label="Panel de A Mordidas — inicio">
            <Wordmark className="h-6 text-charcoal sm:h-7" label="" />
            <span className="rounded-full bg-olive-900 px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.14em] text-cream uppercase">
              Panel
            </span>
          </a>
          <nav aria-label="Panel" className="ml-auto flex items-center gap-1">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="inline-flex h-11 items-center gap-1.5 rounded-full px-2.5 text-[0.8125rem] font-semibold whitespace-nowrap text-charcoal hover:bg-charcoal/6 sm:px-3"
            >
              Ver la web
              <Icon name="arrowRight" size={16} className="hidden -rotate-45 sm:block" />
            </a>
            {signedIn ? (
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center rounded-full px-2.5 text-[0.8125rem] font-semibold text-ink-muted hover:bg-charcoal/6 hover:text-charcoal sm:px-3"
                >
                  Salir
                </button>
              </form>
            ) : null}
          </nav>
        </div>
      </header>
      <main id="contenido" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </div>
  );
}
