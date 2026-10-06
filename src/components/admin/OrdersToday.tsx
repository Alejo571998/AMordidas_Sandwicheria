import { Icon } from "@/components/ui/Icon";

export interface OrderSummaryRow {
  id: number;
  /** "14:32" */
  time: string;
  /** "2× Milandwich Carne · 1× Gula" */
  detail: string;
}

/**
 * Pedidos que descontaron stock hoy. Sirve para cruzarlos con los WhatsApp que llegaron:
 * si alguien tocó "Enviar pedido" y no mandó el mensaje, el dueño suma esas unidades de nuevo.
 */
export function OrdersToday({ orders }: { orders: OrderSummaryRow[] }) {
  return (
    <section aria-labelledby="pedidos-hoy" className="mt-12">
      <h2 id="pedidos-hoy" className="font-display text-display-sm text-olive-700">
        Pedidos que descontaron stock hoy
      </h2>
      <p className="mt-1 flex items-start gap-1.5 text-[0.8125rem] text-ink-muted">
        <Icon name="info" size={16} className="mt-0.5 shrink-0" />
        Se descuentan cuando el cliente toca &quot;Enviar pedido&quot;. Si alguno no te llegó por WhatsApp, sumá esas
        unidades de nuevo arriba.
      </p>
      {orders.length === 0 ? (
        <p className="mt-4 rounded-lg bg-white p-4 text-[0.9375rem] text-ink-muted shadow-card">Todavía no hay pedidos hoy.</p>
      ) : (
        <ol className="mt-4 divide-y divide-charcoal/8 rounded-lg bg-white shadow-card">
          {orders.map((o) => (
            <li key={o.id} className="flex gap-3 px-4 py-3 text-[0.9375rem]">
              <span className="tabular shrink-0 font-bold text-charcoal">{o.time}</span>
              <span translate="no" className="min-w-0 text-ink-muted">
                {o.detail}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
