import { MAX_STOCK } from "@/lib/stock";

export type StockParseResult = { ok: true; value: number | null } | { ok: false; error: string };

/** Campo "Unidades hoy" → número entero. Vacío = sin límite (null). */
export function parseStockInput(raw: string): StockParseResult {
  const text = raw.replace(/\s/g, "");
  if (text === "") return { ok: true, value: null };
  const digits = /^\d{1,3}(\.\d{3})+$/.test(text) ? text.replace(/\./g, "") : text;
  if (!/^\d+$/.test(digits)) return { ok: false, error: "Solo números enteros, por ejemplo 12." };
  const value = Number(digits);
  if (value > MAX_STOCK) return { ok: false, error: "Es demasiado. Revisá el número." };
  return { ok: true, value };
}

export function formatStockInput(value: number | null): string {
  return value === null ? "" : String(value);
}
