import { MAX_PRICE } from "@/lib/menu-settings";

export type PriceParseResult = { ok: true; value: number | null } | { ok: false; error: string };

/**
 * Lo que escribe el dueño en el campo de precio → pesos enteros.
 * Acepta "11690", "11.690", "$ 11.690". Vacío = "a confirmar" (null).
 */
export function parsePriceInput(raw: string): PriceParseResult {
  const text = raw.replace(/[$\s ]/g, "");
  if (text === "") return { ok: true, value: null };
  if (/,/.test(text)) return { ok: false, error: "Sin centavos: escribí solo el número, por ejemplo 11690." };

  let digits: string;
  if (/^\d+$/.test(text)) digits = text;
  else if (/^\d{1,3}(\.\d{3})+$/.test(text)) digits = text.replace(/\./g, "");
  else return { ok: false, error: "Escribí solo números, por ejemplo 11690." };

  const value = Number(digits);
  if (!Number.isSafeInteger(value) || value <= 0) return { ok: false, error: "El precio tiene que ser mayor a $ 0." };
  if (value > MAX_PRICE) return { ok: false, error: "Ese precio parece demasiado alto. Revisalo." };
  return { ok: true, value };
}

/** 11690 → "11.690" (para mostrar en el campo). */
export function formatPriceInput(value: number | null): string {
  return value === null ? "" : new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value);
}
