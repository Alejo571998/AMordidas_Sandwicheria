import type { ReactNode } from "react";
import { Sparks } from "@/components/brand/Brand";
import { OrderButton } from "@/components/cart/OrderButton";
import { Icon, type IconName } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { formatRanges } from "@/lib/hours";

const steps: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "bag", title: "Elegí", text: "Mirá el menú y sumá lo que se te antoje. Las cantidades las cambiás cuando quieras." },
  { icon: "pin", title: "Completá tus datos", text: "Tu nombre y si lo retirás o te lo llevamos. Sin cuentas ni contraseñas." },
  { icon: "whatsapp", title: "Envialo por WhatsApp", text: "Se abre el chat con tu pedido ya escrito. Lo mandás y te confirmamos." },
];

const [firstRange, ...restRanges] = siteConfig.hours.ranges;

/** Preguntas frecuentes reales (historias destacadas de Instagram). */
const faqs: Array<{ q: string; a: ReactNode }> = [
  {
    q: "¿Hacen delivery?",
    a: (
      <>
        ¡Claro! Llevamos <span translate="no">A Mordidas</span> hasta tu puerta. O si preferís, podés pasar a retirarlo
        {siteConfig.location.streetAddress ? ` por ${siteConfig.location.streetAddress}` : ""}.
      </>
    ),
  },
  { q: "¿Hasta dónde hacen envíos?", a: `Dentro de ${siteConfig.delivery.area}. ${siteConfig.delivery.note}` },
  {
    q: "¿Qué horarios tienen?",
    a: `Todos los días, de ${firstRange.open} a ${firstRange.close}${restRanges.map((r) => ` y de ${r.open} a ${r.close}`).join("")}.`,
  },
  {
    q: "¿Puedo hacer un pedido anticipado?",
    a: "Por supuesto. Lo dejás encargado y lo retirás o lo recibís a la hora que necesites.",
  },
  {
    q: "¿Tienen opción vegetariana?",
    a: (
      <>
        Sí. <span translate="no">El Derretido</span> no lleva carne, y siempre podés consultarnos por más opciones.
      </>
    ),
  },
  { q: "¿Qué medios de pago aceptan?", a: `${siteConfig.paymentMethods.join(", ").replace(/, ([^,]*)$/, " y $1")}.` },
];

export function HowToOrder() {
  return (
    <section id="como-pedir" aria-labelledby="como-pedir-title" className="bg-cream py-section">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="eyebrow text-orange-600">Cómo pedir</p>
            <h2 id="como-pedir-title" className="relative mt-3 font-display text-display-xl text-charcoal">
              Pedir es así de fácil.
              <Sparks className="ml-2 inline-block size-8 -translate-y-6 text-orange-500" />
            </h2>
            <ol className="mt-10 space-y-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4" data-reveal>
                  <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-olive-900 text-cream">
                    <Icon name={s.icon} size={24} />
                    <span className="tabular absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-orange-600 text-[0.75rem] font-bold text-white">
                      {i + 1}
                    </span>
                  </span>
                  <div>
                    <h3 className="font-display text-[1.75rem] leading-none">{s.title}</h3>
                    <p className="mt-1.5 text-ink-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <OrderButton size="lg" className="mt-10">
              Armar mi pedido
              <Icon name="arrowRight" size={18} />
            </OrderButton>
            <p className="mt-4 flex items-center gap-2 text-[0.875rem] text-ink-muted">
              <Icon name="clock" size={16} className="text-olive-700" />
              Todos los días · {formatRanges(siteConfig.hours.ranges)}
            </p>
          </div>

          <div>
            <h3 className="font-display text-display-md text-olive-700">Lo que siempre nos preguntan</h3>
            <dl className="mt-6 grid gap-x-8 gap-y-7 border-t border-charcoal/10 pt-7 sm:grid-cols-2">
              {faqs.map((f) => (
                <div key={f.q} data-reveal>
                  <dt className="font-bold text-charcoal">{f.q}</dt>
                  <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-muted">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
