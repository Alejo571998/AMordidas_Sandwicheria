import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { OrdersToday, type OrderSummaryRow } from "@/components/admin/OrdersToday";
import { SettingsEditor, type EditableProduct } from "@/components/admin/SettingsEditor";
import { siteConfig } from "@/config/site";
import { getAdminSession } from "@/lib/admin/session";
import { startOfLocalDay } from "@/lib/hours";
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

  // select("*"): funciona antes y después de la migración de stock (002_stock.sql).
  const [{ data, error }, stockProbe] = await Promise.all([
    session.supabase.from("product_settings").select("*"),
    session.supabase.from("product_settings").select("stock").limit(1),
  ]);

  if (error) {
    return (
      <AdminNotice title="No pudimos leer la carta">
        <p>La base de datos no respondió. Probá recargar la página en un rato.</p>
      </AdminNotice>
    );
  }

  const stockEnabled = !stockProbe.error;
  const settings = parseSettingsRows(data, knownProductIds);
  const { categories, products } = getAdminCatalog(settings);
  const updates = [...settings.values()].map((s) => s.updatedAt).filter((d): d is string => d !== null);
  const lastUpdate = updates.sort().at(-1) ?? null;

  // El editor muestra el interruptor tal como está guardado (no el "agotado" que se deduce del stock en 0).
  const items: EditableProduct[] = products.map((p) => {
    const saved = settings.get(p.id);
    return {
      id: p.id,
      name: p.name,
      categoryId: p.category,
      image: p.image,
      price: p.price,
      available: saved ? saved.available : p.available,
      active: p.active,
      stock: saved?.stock ?? null,
    };
  });

  const orders = stockEnabled ? await loadOrdersToday(session.supabase, new Map(products.map((p) => [p.id, p.name]))) : [];

  return (
    <SettingsEditor
      categories={categories.map((c) => ({ id: c.id, label: c.label }))}
      items={items}
      version={lastUpdate ?? "base"}
      lastUpdate={lastUpdate}
      stockEnabled={stockEnabled}
      aside={stockEnabled ? <OrdersToday orders={orders} /> : null}
    />
  );
}

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: siteConfig.hours.timeZone,
});

async function loadOrdersToday(supabase: SupabaseClient, names: Map<string, string>): Promise<OrderSummaryRow[]> {
  const { data, error } = await supabase
    .from("order_log")
    .select("id, created_at, items")
    .gte("created_at", startOfLocalDay(siteConfig.hours.timeZone))
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !Array.isArray(data)) return [];
  return data.flatMap((row) => {
    if (typeof row.id !== "number" || typeof row.created_at !== "string" || !Array.isArray(row.items)) return [];
    const detail = (row.items as unknown[])
      .flatMap((it) => {
        const { product_id, quantity } = (it ?? {}) as Record<string, unknown>;
        return typeof product_id === "string" && typeof quantity === "number"
          ? [`${quantity}× ${names.get(product_id) ?? product_id}`]
          : [];
      })
      .join(" · ");
    return [{ id: row.id, time: timeFormatter.format(new Date(row.created_at)), detail }];
  });
}
