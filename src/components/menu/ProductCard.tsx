"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Brush } from "@/components/brand/Brand";
import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { track } from "@/lib/analytics";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/cart/reducer";
import { cn, formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

const viewedThisSession = new Set<string>();

interface ProductCardProps {
  product: Product;
  categoryLabel: string;
  layout?: "card" | "wide";
}

export function ProductCard({ product, categoryLabel, layout = "card" }: ProductCardProps) {
  const { addItem, quantityOf, hydrated, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const titleId = useId();
  const ref = useRef<HTMLElement>(null);
  const addedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inCart = hydrated && product.available ? quantityOf(product.id) : 0;
  // Tope por producto: el selector nunca ofrece más de lo que entra en el pedido.
  const remaining = MAX_QUANTITY_PER_ITEM - inCart;
  const atLimit = remaining <= 0;
  const qty = Math.min(quantity, Math.max(1, remaining));
  const isWide = layout === "wide";
  const isVeggie = product.tags?.includes("vegetariano");

  // product_view: una vez por sesión, cuando la card se ve al menos a la mitad.
  useEffect(() => {
    const el = ref.current;
    if (!el || viewedThisSession.has(product.id)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || viewedThisSession.has(product.id)) return;
        viewedThisSession.add(product.id);
        track("product_view", { product_id: product.id, product_name: product.name, category: product.category });
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [product.id, product.name, product.category]);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const handleAdd = () => {
    if (atLimit) return;
    addItem(product, qty);
    setQuantity(1);
    setJustAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <article
      ref={ref}
      aria-labelledby={titleId}
      data-reveal
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-card transition-shadow duration-300 hover:shadow-lift",
        isWide && "md:grid md:grid-cols-[1.15fr_1fr]",
      )}
    >
      <div className={cn("relative aspect-[3/2] overflow-hidden bg-paper sm:aspect-[4/3]", isWide && "md:aspect-auto md:min-h-full")}>
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes={isWide ? "(min-width: 768px) 640px, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
          placeholder={typeof product.image.src === "string" ? "empty" : "blur"}
          className={cn(
            "object-cover object-[50%_65%] transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.04]",
            isWide && "md:object-contain",
            !product.available && "opacity-60 grayscale-[0.55]",
          )}
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.badge ? (
            <span className="rounded-xs bg-orange-600 px-2 py-1 text-[0.6875rem] font-bold tracking-[0.12em] text-white uppercase">
              {product.badge}
            </span>
          ) : null}
          {isVeggie ? (
            <span className="inline-flex items-center gap-1 rounded-xs bg-olive-700 px-2 py-1 text-[0.6875rem] font-bold tracking-[0.12em] text-cream uppercase">
              <Icon name="leaf" size={12} />
              Veggie
            </span>
          ) : null}
        </div>

        {inCart > 0 ? (
          <button
            type="button"
            onClick={openCart}
            key={inCart}
            className="absolute top-3 right-3 inline-flex animate-pop items-center gap-1.5 rounded-full bg-charcoal py-1.5 pr-3 pl-2 text-[0.75rem] font-bold text-cream shadow-float hover:bg-olive-900"
          >
            <Icon name="bag" size={14} />
            <span>
              En tu pedido: <span className="tabular">{inCart}</span>
            </span>
          </button>
        ) : null}

        {product.price === null && product.available ? (
          <p className="absolute bottom-3 left-3 rounded-full bg-cream/90 px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.06em] text-ink-muted uppercase backdrop-blur-sm">
            Precio a confirmar
          </p>
        ) : null}

        {!product.available ? (
          <div className="absolute inset-0 grid place-items-center p-6">
            <p className="relative -rotate-3 px-6 py-3 text-center">
              <Brush name="swatch" className="absolute inset-0 size-full text-mustard" />
              <span className="relative font-display text-2xl leading-none text-charcoal">
                Por hoy se fue de vacaciones 😴
              </span>
            </p>
          </div>
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col p-4 sm:p-6", isWide && "md:justify-center md:p-10")}>
        <div>
        <p className="eyebrow flex flex-wrap items-center gap-x-2 text-olive-700">
          <span>{categoryLabel}</span>
          {product.size ? (
            <>
              <span aria-hidden className="text-olive-300">
                /
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="ruler" size={13} />
                {product.size}
              </span>
            </>
          ) : null}
        </p>
        </div>

        <div className="mt-2 flex items-start justify-between gap-3">
          {/* translate="no": los nombres son marcas. Sin esto, el traductor de Chrome convierte "Gula" en "Azúcar". */}
          <h3 id={titleId} translate="no" className={cn("font-display text-charcoal", isWide ? "text-display-lg" : "text-display-md")}>
            {product.name}
          </h3>
          {product.price !== null ? (
            <p className="tabular shrink-0 font-display text-[1.875rem] leading-none text-orange-600">
              <span className="sr-only">Precio: </span>
              {formatPrice(product.price)}
            </p>
          ) : null}
        </div>

        <p className="mt-2 text-[0.9375rem] leading-snug text-ink-muted">{product.description}</p>

        <ul aria-label={`Ingredientes de ${product.name}`} className="dot-list mt-3 flex flex-wrap text-[0.8125rem] leading-relaxed text-charcoal/85">
          {product.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>

        {/* @container: el total dentro del botón solo aparece si entra (en tarjetas angostas se ve al lado del nombre). */}
        <div className="@container mt-auto pt-5">
          {product.available ? (
            <div className="flex items-center gap-2">
              <QuantityStepper
                value={qty}
                max={Math.max(1, remaining)}
                itemLabel={product.name}
                onDecrement={() => setQuantity(Math.max(1, qty - 1))}
                onIncrement={() => setQuantity(qty + 1)}
                tone="paper"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={atLimit && !justAdded}
                aria-label={
                  justAdded
                    ? `${product.name} agregado al pedido`
                    : atLimit
                      ? `Ya tenés el máximo de ${product.name} en tu pedido`
                      : `Agregar ${qty} ${product.name} al pedido`
                }
                className={cn(
                  "inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-4 text-[0.8125rem] font-bold tracking-[0.06em] whitespace-nowrap uppercase",
                  "transition-[background-color,transform] duration-200 active:scale-[0.97]",
                  justAdded
                    ? "bg-mustard text-charcoal"
                    : "bg-olive-600 text-white shadow-cta-olive hover:bg-olive-700 disabled:bg-charcoal/10 disabled:text-ink-muted disabled:shadow-none",
                )}
              >
                {justAdded ? (
                  <>
                    <Icon name="check" size={18} className="animate-pop" />
                    Agregado
                  </>
                ) : atLimit ? (
                  <span className="leading-tight whitespace-normal text-balance">Máximo {MAX_QUANTITY_PER_ITEM} por pedido</span>
                ) : (
                  <>
                    <Icon name="plus" size={18} />
                    Agregar
                    {product.price !== null ? (
                      <span className="tabular hidden @min-[20rem]:inline">· {formatPrice(product.price * qty)}</span>
                    ) : null}
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled
              className="h-12 w-full rounded-full bg-charcoal/10 text-[0.8125rem] font-bold tracking-[0.06em] text-ink-muted uppercase"
            >
              Agotado por hoy
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
