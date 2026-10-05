import type { ReactNode } from "react";
import { Stamp } from "@/components/brand/Brand";

/** Pantallas de aviso del panel (apagado, sin permiso, error de lectura). */
export function AdminNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="container-page flex justify-center py-16 sm:py-24">
      <div className="flex max-w-md flex-col items-center text-center">
        <Stamp className="size-24 text-mustard" />
        <h1 className="mt-6 font-display text-display-md text-charcoal">{title}</h1>
        <div className="mt-3 space-y-3 text-ink-muted">{children}</div>
      </div>
    </section>
  );
}
