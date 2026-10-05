"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl, contactMessages } from "@/lib/whatsapp";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="bg-cream py-section">
      <div className="container-page flex max-w-xl flex-col items-center text-center">
        <p className="eyebrow text-orange-600">Algo salió mal</p>
        <h1 className="mt-3 font-display text-display-lg text-charcoal">Se nos quemó el pan.</h1>
        <p className="mt-4 text-ink-muted">
          No pudimos cargar esta parte de la página. Probá de nuevo o, si es urgente, escribinos directo al{" "}
          {siteConfig.whatsapp.display}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} size="lg">
            Reintentar
          </Button>
          <ButtonLink
            href={buildWhatsAppUrl(contactMessages.general)}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            size="lg"
          >
            <Icon name="whatsapp" size={18} />
            Pedir por WhatsApp
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
