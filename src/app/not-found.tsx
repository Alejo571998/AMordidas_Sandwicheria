import type { Metadata } from "next";
import { Stamp } from "@/components/brand/Brand";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="bg-cream bg-grain py-section">
      <div className="container-page flex flex-col items-center text-center">
        <Stamp spin className="size-32 text-mustard" />
        <p className="eyebrow mt-8 text-orange-600">Error 404</p>
        <h1 className="mt-3 font-display text-display-xl text-charcoal">Esta página se la comieron.</h1>
        <p className="mt-4 max-w-md text-ink-muted">
          Lo que buscabas no está (o ya no existe). El menú, en cambio, sigue ahí esperándote.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/#menu" size="lg">
            Ver el menú
          </ButtonLink>
          <ButtonLink href="/" variant="outline-dark" size="lg">
            Ir al inicio
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
