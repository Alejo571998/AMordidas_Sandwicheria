"use client";

import Image from "next/image";
import { useActionState, useMemo, useState, type ReactNode } from "react";
import { saveSettings, type SaveState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPriceInput, parsePriceInput } from "@/lib/admin/price";
import { formatStockInput, parseStockInput } from "@/lib/admin/stock-input";
import { cn, formatPrice, pluralize } from "@/lib/format";
import type { ProductImage } from "@/types/product";

export interface EditableProduct {
  id: string;
  name: string;
  categoryId: string;
  image: ProductImage;
  price: number | null;
  available: boolean;
  active: boolean;
  /** Unidades que quedan hoy. null = sin límite. */
  stock: number | null;
}

interface Draft {
  price: string;
  /** Texto del campo "Unidades hoy" ("" = sin límite). */
  stock: string;
  available: boolean;
  active: boolean;
}

const initialSaveState: SaveState = { status: "idle", message: null, errors: {} };

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "America/Argentina/Cordoba",
});

interface SettingsEditorProps {
  categories: Array<{ id: string; label: string }>;
  items: EditableProduct[];
  /** Cambia cada vez que se guarda: reinicia los borradores con lo que quedó en la base. */
  version: string;
  lastUpdate: string | null;
  /** La base ya tiene la columna de unidades (migración 002_stock.sql). */
  stockEnabled: boolean;
  /** Contenido extra debajo de la carta (pedidos de hoy). */
  aside?: ReactNode;
}

/**
 * Editor de precio, stock y visibilidad. El mensaje de "Guardado" vive acá afuera para
 * sobrevivir al reinicio de los campos después de guardar.
 */
export function SettingsEditor({ categories, items, version, lastUpdate, stockEnabled, aside }: SettingsEditorProps) {
  const [state, formAction, pending] = useActionState(saveSettings, initialSaveState);

  return (
    <form action={formAction} className="container-page max-w-3xl pt-8 pb-40 sm:pt-12">
      <header>
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-orange-600">Panel</p>
          <a
            href="/admin/cuenta"
            className="-mr-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[0.8125rem] font-semibold text-ink-muted hover:text-charcoal"
          >
            Tu cuenta y contraseña
            <Icon name="arrowRight" size={16} />
          </a>
        </div>
        <h1 className="mt-2 font-display text-display-lg text-charcoal">Precios y stock</h1>
        <p className="mt-2 text-ink-muted">
          Lo que guardes acá se ve en la web al instante.
          {lastUpdate ? (
            <span className="block text-[0.8125rem]">Último cambio: {dateFormatter.format(new Date(lastUpdate))} hs</span>
          ) : null}
        </p>
        {!stockEnabled ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-paper/70 px-3 py-2.5 text-[0.8125rem] text-ink-muted">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" />
            Para cargar unidades por producto falta un paso en la base de datos (docs/ADMIN.md, &quot;Stock por
            unidades&quot;).
          </p>
        ) : null}
      </header>

      <EditorFields
        key={version}
        categories={categories}
        items={items}
        serverErrors={state.errors}
        pending={pending}
        message={state.message}
        messageStatus={state.status}
        stockEnabled={stockEnabled}
      />
      {aside}
    </form>
  );
}

function toDraft(item: EditableProduct): Draft {
  return { price: formatPriceInput(item.price), stock: formatStockInput(item.stock), available: item.available, active: item.active };
}

function priceKey(raw: string): string {
  const parsed = parsePriceInput(raw);
  return parsed.ok ? String(parsed.value) : `invalid:${raw}`;
}

function stockKey(raw: string): string {
  const parsed = parseStockInput(raw);
  return parsed.ok ? String(parsed.value) : `invalid:${raw}`;
}

interface EditorFieldsProps {
  categories: SettingsEditorProps["categories"];
  items: EditableProduct[];
  serverErrors: Record<string, string>;
  pending: boolean;
  message: string | null;
  messageStatus: SaveState["status"];
  stockEnabled: boolean;
}

function EditorFields({ categories, items, serverErrors, pending, message, messageStatus, stockEnabled }: EditorFieldsProps) {
  const original = useMemo(() => new Map(items.map((i) => [i.id, toDraft(i)])), [items]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => Object.fromEntries(original));

  const isDirty = (id: string) => {
    const a = drafts[id];
    const b = original.get(id)!;
    return (
      priceKey(a.price) !== priceKey(b.price) ||
      stockKey(a.stock) !== stockKey(b.stock) ||
      a.available !== b.available ||
      a.active !== b.active
    );
  };
  const dirtyIds = items.filter((i) => isDirty(i.id)).map((i) => i.id);
  // Errores por campo: "<id>" para el precio y "<id>:stock" para las unidades (igual que el servidor).
  const localErrors = Object.fromEntries(
    dirtyIds.flatMap((id) => {
      const price = parsePriceInput(drafts[id].price);
      const stock = parseStockInput(drafts[id].stock);
      return [
        ...(price.ok ? [] : [[id, price.error]]),
        ...(stock.ok || !stockEnabled ? [] : [[`${id}:stock`, stock.error]]),
      ];
    }),
  ) as Record<string, string>;
  const hasErrors = Object.keys(localErrors).length > 0;
  const changes = JSON.stringify(
    dirtyIds.map((productId) => {
      const { price, stock, available, active } = drafts[productId];
      return { productId, price, available, active, ...(stockEnabled ? { stock } : {}) };
    }),
  );

  const update = (id: string, patch: Partial<Draft>) => setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  const discard = () => setDrafts(Object.fromEntries(original));

  const showSaved = messageStatus === "saved" && dirtyIds.length === 0;
  const showError = messageStatus === "error" && message;

  return (
    <>
      <input type="hidden" name="changes" value={changes} />

      <div className="mt-8 space-y-10">
        {categories.map((category) => {
          const rows = items.filter((i) => i.categoryId === category.id);
          if (rows.length === 0) return null;
          return (
            <section key={category.id} aria-labelledby={`admin-cat-${category.id}`}>
              <h2 id={`admin-cat-${category.id}`} className="font-display text-display-sm text-olive-700">
                {category.label}
              </h2>
              <ul className="mt-3 space-y-3">
                {rows.map((item) => (
                  <ProductRow
                    key={item.id}
                    item={item}
                    draft={drafts[item.id]}
                    dirty={dirtyIds.includes(item.id)}
                    error={localErrors[item.id] ?? serverErrors[item.id]}
                    stockError={localErrors[`${item.id}:stock`] ?? serverErrors[`${item.id}:stock`]}
                    stockEnabled={stockEnabled}
                    onChange={(patch) => update(item.id, patch)}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-cream/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md",
          "transition-transform duration-300 ease-[var(--ease-out-quart)]",
          dirtyIds.length > 0 || showSaved || showError ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <p role="status" aria-live="polite" className="min-w-0 text-[0.875rem] font-semibold sm:flex-1">
            {dirtyIds.length > 0 ? (
              <span className={hasErrors ? "text-danger" : "text-charcoal"}>
                {hasErrors
                  ? "Hay un dato para corregir."
                  : `${pluralize(dirtyIds.length, "cambio", "cambios")} sin guardar`}
              </span>
            ) : showSaved ? (
              <span className="inline-flex items-center gap-1.5 text-olive-700">
                <Icon name="check" size={18} />
                {message}
              </span>
            ) : showError ? (
              <span className="text-danger">{message}</span>
            ) : null}
          </p>
          {dirtyIds.length > 0 ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={discard}
                disabled={pending}
                className="h-12 rounded-full px-4 text-[0.8125rem] font-semibold text-ink-muted hover:bg-charcoal/6 hover:text-charcoal"
              >
                Descartar
              </button>
              <Button type="submit" variant="action" disabled={pending || hasErrors} className="flex-1 sm:flex-none">
                {pending ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function statusText(draft: Draft): { text: string; orderable: boolean } {
  if (!draft.active) return { text: "Oculto: no aparece en la web", orderable: false };
  const stock = parseStockInput(draft.stock);
  if (!draft.available || (stock.ok && stock.value === 0)) return { text: "Agotado por hoy", orderable: false };
  if (stock.ok && stock.value !== null) {
    return { text: stock.value === 1 ? "En la carta · queda 1" : `En la carta · quedan ${stock.value}`, orderable: true };
  }
  return { text: "En la carta", orderable: true };
}

interface ProductRowProps {
  item: EditableProduct;
  draft: Draft;
  dirty: boolean;
  error: string | undefined;
  stockError: string | undefined;
  stockEnabled: boolean;
  onChange: (patch: Partial<Draft>) => void;
}

const inputBase =
  "tabular h-12 w-full rounded-md border-[1.5px] bg-white pr-3 text-lg font-bold text-charcoal " +
  "transition-[border-color,box-shadow] duration-150 placeholder:text-[0.9375rem] placeholder:font-normal placeholder:text-[#8a8270] " +
  "focus:border-olive-700 focus:shadow-[0_0_0_4px_rgb(92_90_44/0.15)] focus:outline-none";

function ProductRow({ item, draft, dirty, error, stockError, stockEnabled, onChange }: ProductRowProps) {
  const priceId = `price-${item.id}`;
  const stockId = `stock-${item.id}`;
  const parsed = parsePriceInput(draft.price);
  const stock = parseStockInput(draft.stock);
  const status = statusText(draft);

  const onStockChange = (value: string) => {
    const next = parseStockInput(value);
    // Cargar unidades vuelve a habilitar el producto (si se había agotado solo).
    const reenable = next.ok && next.value !== null && next.value > 0 && !draft.available;
    onChange(reenable ? { stock: value, available: true } : { stock: value });
  };

  return (
    <li className={cn("rounded-xl bg-white p-4 shadow-card sm:p-5", dirty && "ring-2 ring-mustard")}>
      <div className="flex items-center gap-3">
        <div className={cn("relative size-14 shrink-0 overflow-hidden rounded-md bg-paper", !draft.active && "opacity-50 grayscale")}>
          <Image src={item.image.src} alt="" fill sizes="56px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p translate="no" className="font-display text-[1.5rem] leading-[0.95] text-charcoal">
            {item.name}
          </p>
          <p className={cn("mt-1 text-[0.75rem] font-semibold", status.orderable ? "text-olive-700" : "text-ink-muted")}>
            {status.text}
          </p>
        </div>
        {dirty ? (
          <span className="shrink-0 rounded-full bg-mustard px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.1em] text-charcoal uppercase">
            Sin guardar
          </span>
        ) : null}
      </div>

      <div className={cn("mt-4 grid gap-3", stockEnabled ? "grid-cols-2" : "sm:max-w-[13rem]")}>
        <div className="min-w-0">
          <label htmlFor={priceId} className="mb-1.5 block text-[0.8125rem] font-bold">
            Precio
          </label>
          <div className="relative">
            <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-semibold text-ink-muted">
              $
            </span>
            <input
              id={priceId}
              inputMode="numeric"
              autoComplete="off"
              value={draft.price}
              placeholder="A confirmar"
              onChange={(e) => onChange({ price: e.target.value })}
              onBlur={() => {
                if (parsed.ok) onChange({ price: formatPriceInput(parsed.value) });
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={`${priceId}-msg`}
              className={cn(inputBase, "pl-8", error ? "border-danger" : "border-charcoal/15")}
            />
          </div>
          <p id={`${priceId}-msg`} className={cn("mt-1.5 text-[0.75rem]", error ? "font-semibold text-danger" : "text-ink-muted")}>
            {error ?? (parsed.ok && parsed.value !== null ? `En la web: ${formatPrice(parsed.value)}` : "Vacío = \"Precio a confirmar\"")}
          </p>
        </div>

        {stockEnabled ? (
          <div className="min-w-0">
            <label htmlFor={stockId} className="mb-1.5 block text-[0.8125rem] font-bold">
              Unidades hoy
            </label>
            <input
              id={stockId}
              inputMode="numeric"
              autoComplete="off"
              value={draft.stock}
              placeholder="Sin límite"
              onChange={(e) => onStockChange(e.target.value)}
              aria-invalid={Boolean(stockError)}
              aria-describedby={`${stockId}-msg`}
              className={cn(inputBase, "pl-3.5", stockError ? "border-danger" : "border-charcoal/15")}
            />
            <p id={`${stockId}-msg`} className={cn("mt-1.5 text-[0.75rem]", stockError ? "font-semibold text-danger" : "text-ink-muted")}>
              {stockError ??
                (!stock.ok || stock.value === null
                  ? "Vacío = sin límite"
                  : stock.value === 0
                    ? "En 0 aparece agotado"
                    : "Baja sola con cada pedido")}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Switch
          label="Hay stock hoy"
          hint={
            !draft.available
              ? "Muestra \"Por hoy se fue de vacaciones\""
              : stock.ok && stock.value === 0
                ? "Sin unidades: cargá más para venderlo"
                : "Se puede pedir"
          }
          checked={draft.available}
          onChange={(available) => onChange({ available })}
        />
        <Switch
          label="Se muestra en la carta"
          hint={draft.active ? "Visible en la web" : "Oculto para los clientes"}
          checked={draft.active}
          onChange={(active) => onChange({ active })}
        />
      </div>
    </li>
  );
}

function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-md border-[1.5px] border-charcoal/10 bg-cream/60 px-3 py-2 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-charcoal">
      <span className="min-w-0">
        <span className="block text-[0.875rem] font-bold text-charcoal">{label}</span>
        <span className="block text-[0.6875rem] leading-snug text-ink-muted">{hint}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-olive-600" : "bg-charcoal/20",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[var(--ease-out-quart)]",
            checked && "translate-x-5",
          )}
        />
      </span>
    </label>
  );
}
