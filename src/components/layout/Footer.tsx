import { Brush, Stamp, Wordmark } from "@/components/brand/Brand";
import { OrderButton } from "@/components/cart/OrderButton";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl, contactMessages } from "@/lib/whatsapp";
import { OpenStatus } from "./OpenStatus";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow text-mustard">{title}</h3>
      <div className="mt-3 space-y-1.5 text-[0.9375rem] text-cream/80">{children}</div>
    </div>
  );
}

const linkClass =
  "flex w-fit min-h-11 items-center gap-2 font-semibold text-cream underline-offset-4 hover:text-mustard hover:underline";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contacto" aria-labelledby="contacto-title" className="focus-on-dark relative mt-6 bg-olive-950 bg-grain text-cream">
      <Brush name="torn" className="absolute -top-[22px] left-0 h-6 w-full text-olive-950" />

      <div className="container-page pt-20 pb-32 md:pb-14">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <h2 id="contacto-title" className="font-display text-display-xl">
              ¿Se te <span className="text-orange-400">antojó?</span>
            </h2>
            <p className="mt-4 max-w-md text-[1.0625rem] text-cream/80">
              Armá tu pedido acá mismo o escribinos por WhatsApp. Lo preparamos en el momento.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <OrderButton size="lg">Pedir ahora</OrderButton>
              <ButtonLink href={buildWhatsAppUrl(contactMessages.general)} {...external} variant="outline-light" size="lg">
                <Icon name="whatsapp" size={20} />
                Escribinos
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <InfoBlock title="Horarios">
              <p className="font-semibold text-cream">Todos los días</p>
              {siteConfig.hours.ranges.map((r) => (
                <p key={r.open} className="tabular">
                  {r.open} a {r.close} hs
                </p>
              ))}
              <OpenStatus className="mt-2" />
            </InfoBlock>

            <InfoBlock title="Envíos y retiro">
              <p className="flex items-start gap-2">
                <Icon name="scooter" size={18} className="mt-1 shrink-0 text-mustard" />
                Envíos dentro de {siteConfig.delivery.area}.
              </p>
              <p className="flex items-start gap-2">
                <Icon name="pin" size={18} className="mt-1 shrink-0 text-mustard" />
                {siteConfig.location.streetAddress
                  ? `Retiro en ${siteConfig.location.streetAddress}.`
                  : "Retiro: coordinamos el punto por WhatsApp."}
              </p>
            </InfoBlock>

            <InfoBlock title="Pedidos y redes">
              <a href={buildWhatsAppUrl(contactMessages.general)} {...external} className={linkClass}>
                <Icon name="whatsapp" size={18} />
                {siteConfig.whatsapp.display}
              </a>
              <a href={siteConfig.instagram.url} {...external} className={linkClass}>
                <Icon name="instagram" size={18} />@{siteConfig.instagram.handle}
              </a>
              <a href={siteConfig.pedidosYa} {...external} className={linkClass}>
                <Icon name="bag" size={18} />
                También en PedidosYa
              </a>
            </InfoBlock>

            <InfoBlock title="Medios de pago">
              <ul className="space-y-1.5">
                {siteConfig.paymentMethods.map((m) => (
                  <li key={m} className="flex items-center gap-2">
                    <Icon name="check" size={16} className="text-mustard" />
                    {m}
                  </li>
                ))}
              </ul>
            </InfoBlock>
          </div>
        </div>

        <div className="mt-16 grid gap-4 border-y border-cream/10 py-6 text-[0.9375rem] sm:grid-cols-2">
          <a href={buildWhatsAppUrl(contactMessages.work)} {...external} className={linkClass}>
            ¿Querés trabajar con nosotros? Contanos
            <Icon name="arrowRight" size={16} />
          </a>
          <a href={buildWhatsAppUrl(contactMessages.review)} {...external} className={`${linkClass} sm:justify-self-end`}>
            ¿Ya nos probaste? Dejanos tu reseña
            <Icon name="arrowRight" size={16} />
          </a>
        </div>

        <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-5">
            <div>
              <Wordmark className="h-16 text-cream sm:h-20" />
              <p className="mt-2 flex items-center gap-2 pl-2 text-[0.75rem] font-bold tracking-[0.32em] text-mustard">
                <span className="h-px w-6 bg-mustard/60" />
                DELI HOUSE
                <span className="h-px w-6 bg-mustard/60" />
              </p>
            </div>
            <Stamp spin className="hidden size-24 text-mustard/80 sm:block" />
          </div>
          <div className="space-y-1 text-[0.8125rem] text-cream/60 md:text-right">
            <p>
              © {year} {siteConfig.name} — {siteConfig.tagline}. {siteConfig.location.city}, Argentina.
            </p>
            <p>No guardamos tus datos: tu pedido viaja directo a nuestro WhatsApp.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
