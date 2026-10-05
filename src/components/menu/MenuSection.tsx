"use client";

import { useEffect, useRef, useState } from "react";
import { Brush, Sparks } from "@/components/brand/Brand";
import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/format";
import type { CategoryId } from "@/types/product";
import { ProductCard } from "./ProductCard";

type Filter = "todos" | CategoryId;

export function MenuSection() {
  const { products, categories } = useCart();
  const [filter, setFilter] = useState<Filter>("todos");
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        track("menu_view", {});
        io.disconnect();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const filters: Array<{ id: Filter; label: string; count: number }> = [
    { id: "todos", label: "Todos", count: products.length },
    ...categories.map((c) => ({ id: c.id, label: c.label, count: products.filter((p) => p.category === c.id).length })),
  ];
  const visible = filter === "todos" ? categories : categories.filter((c) => c.id === filter);
  const hasPendingPrices = products.some((p) => p.price === null);
  const veggie = products.filter((p) => p.tags?.includes("vegetariano") && p.available);

  const choose = (id: Filter) => {
    setFilter(id);
    const list = listRef.current;
    if (list && list.getBoundingClientRect().top < 0) list.scrollIntoView({ block: "start" });
  };

  return (
    <section id="menu" ref={sectionRef} aria-labelledby="menu-title" className="relative bg-cream py-section">
      <div className="container-page">
        <header className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow text-orange-600">El menú</p>
            <h2 id="menu-title" className="mt-3 font-display text-display-xl text-charcoal">
              ¿Qué vas a comer hoy?
              <Sparks className="ml-1 inline-block size-8 -translate-y-7 text-orange-500 sm:size-10" />
            </h2>
          </div>
          <div className="max-w-md lg:justify-self-end">
            <p className="font-display text-display-sm text-olive-700">Hechos a mano. Pensados para vos.</p>
            <p className="mt-2 text-ink-muted">
              Elegí, sumá al pedido y lo mandás por WhatsApp. Lo preparamos en el momento.
            </p>
          </div>
        </header>
      </div>

      <div className="sticky top-[var(--header-h)] z-20 mt-10 border-y border-charcoal/8 bg-cream/92 backdrop-blur-md">
        <div className="container-page">
          <div role="toolbar" aria-label="Filtrar el menú" className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 py-3">
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => choose(f.id)}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[0.8125rem] font-bold tracking-[0.08em] uppercase transition-colors duration-200",
                    active
                      ? "bg-olive-900 text-cream"
                      : "bg-white text-charcoal shadow-[inset_0_0_0_1.5px_rgb(31_31_31/0.14)] hover:bg-paper",
                  )}
                >
                  {f.label}
                  <span className={cn("tabular text-[0.75rem]", active ? "text-mustard" : "text-ink-muted")}>{f.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div ref={listRef} className="container-page scroll-mt-[calc(var(--header-h)+4.5rem)] pt-10">
        {hasPendingPrices ? (
          <p className="mb-8 flex items-start gap-2 rounded-md bg-paper/70 px-4 py-3 text-[0.875rem] text-ink-muted">
            <Icon name="info" size={18} className="mt-0.5 shrink-0 text-olive-700" />
            Algunos precios se confirman por WhatsApp al tomar tu pedido. Armalo igual: te respondemos con el total.
          </p>
        ) : null}

        <div className="space-y-16">
          {visible.map((category) => {
            const items = products.filter((p) => p.category === category.id);
            const single = items.length === 1;
            return (
              <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
                  <h3 id={`cat-${category.id}`} className="relative font-display text-display-lg text-charcoal">
                    {category.label}
                    <Brush name="underline" className="absolute -bottom-2 left-0 h-3 w-full text-orange-500" />
                  </h3>
                  <p className="text-[0.9375rem] text-ink-muted">{category.description}</p>
                </div>
                <div className={cn("grid gap-5 sm:gap-6", single ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3")}>
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryLabel={category.singular}
                      layout={single ? "wide" : "card"}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <ul className="mt-14 grid gap-3 text-[0.9375rem] sm:grid-cols-2">
          {veggie.length > 0 ? (
            <li className="flex items-start gap-3 rounded-lg bg-olive-100/70 p-4">
              <Icon name="leaf" size={20} className="mt-0.5 shrink-0 text-olive-700" />
              <span>
                <strong className="font-bold">¿Sin carne?</strong> {veggie.map((p) => p.name).join(" y ")}{" "}
                {veggie.length === 1 ? "es vegetariano" : "son vegetarianos"}. Consultanos por más opciones.
              </span>
            </li>
          ) : null}
          <li className="flex items-start gap-3 rounded-lg bg-paper/70 p-4">
            <Icon name="clock" size={20} className="mt-0.5 shrink-0 text-orange-600" />
            <span>
              <strong className="font-bold">¿Para más tarde?</strong> Tomamos pedidos anticipados: lo retirás o te llega a la
              hora que necesites.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
