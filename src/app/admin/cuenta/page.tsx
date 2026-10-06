import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { Icon } from "@/components/ui/Icon";
import { getAdminSession } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Tu cuenta" };

export default async function AccountPage() {
  const session = await getAdminSession();
  if (session.status === "anonymous") redirect("/admin/login");
  if (session.status !== "admin" || !session.email) redirect("/admin");

  return (
    <section className="container-page max-w-xl pt-6 pb-16 sm:pt-10">
      <a
        href="/admin"
        className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[0.875rem] font-semibold text-ink-muted hover:text-charcoal"
      >
        <Icon name="arrowLeft" size={18} />
        Volver a precios y stock
      </a>

      <h1 className="mt-4 font-display text-display-lg text-charcoal">Tu cuenta</h1>
      <p className="mt-2 text-ink-muted">
        Entraste como <strong className="break-all text-charcoal">{session.email}</strong>.
      </p>

      <div className="mt-8 rounded-xl bg-white p-5 shadow-card sm:p-7">
        <h2 className="font-display text-display-sm text-charcoal">Cambiar contraseña</h2>
        <p className="mt-2 text-[0.9375rem] text-ink-muted">
          Usá una que no uses en otro lado. Al cambiarla se cierran las sesiones abiertas en otros dispositivos.
        </p>
        <PasswordForm email={session.email} />
      </div>
    </section>
  );
}
