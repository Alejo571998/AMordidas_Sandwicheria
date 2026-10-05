import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { SettingsEditor, type EditableProduct } from "@/components/admin/SettingsEditor";
import { getAdminSession } from "@/lib/admin/session";
import { getAdminCatalog, knownProductIds } from "@/lib/catalog";
import { parseSettingsRows } from "@/lib/menu-settings";
import { logout } from "./actions";

export const metadata: Metadata = { title: { absolute: "Precios y stock | Panel A Mordidas" } };

export default async function AdminPage() {
  const session = await getAdminSession();

  if (session.status === "off") {
    return (
      <AdminNotice title="El panel todavía no está activo">
        <p>
          Cuando esté conectado, desde acá vas a poder cambiar precios, marcar lo que se agotó en el día y elegir qué
          se muestra en la carta.
        </p>
      </AdminNotice>
    );
  }

  if (session.status === "anonymous") redirect("/admin/login");

  if (session.status === "forbidden") {
    return (
      <AdminNotice title="Esta cuenta no tiene acceso">
        <p>
          Entraste como <strong className="text-charcoal">{session.email ?? "otra cuenta"}</strong>, que no figura
          como administradora del panel.
        </p>
        <form action={logout}>
          <button type="submit" className="font-semibold text-charcoal underline underline-offset-4">
            Entrar con otra cuenta
          </button>
        </form>
      </AdminNotice>
    );
  }

  const { data, error } = await session.supabase
    .from("product_settings")
    .select("product_id, price, available, active, updated_at");

  if (error) {
    return (
      <AdminNotice title="No pudimos leer la carta">
        <p>La base de datos no respondió. Probá recargar la página en un rato.</p>
      </AdminNotice>
    );
  }

  const settings = parseSettingsRows(data, knownProductIds);
  const { categories, products } = getAdminCatalog(settings);
  const updates = [...settings.values()].map((s) => s.updatedAt).filter((d): d is string => d !== null);
  const lastUpdate = updates.sort().at(-1) ?? null;

  const items: EditableProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    categoryId: p.category,
    image: p.image,
    price: p.price,
    available: p.available,
    active: p.active,
  }));

  return (
    <SettingsEditor
      categories={categories.map((c) => ({ id: c.id, label: c.label }))}
      items={items}
      version={lastUpdate ?? "base"}
      lastUpdate={lastUpdate}
    />
  );
}
