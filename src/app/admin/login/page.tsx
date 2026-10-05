import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Entrar" };

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session.status === "off" || session.status === "admin") redirect("/admin");

  return (
    <section className="container-page flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-orange-600">Solo para el equipo</p>
        <h1 className="mt-3 font-display text-display-md text-charcoal">Entrar al panel</h1>
        <p className="mt-2 text-ink-muted">Para cambiar precios, stock del día y lo que se ve en la carta.</p>
        <LoginForm />
      </div>
    </section>
  );
}
