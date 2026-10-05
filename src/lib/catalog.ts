/**
 * Repositorio del catálogo. La UI nunca importa los datos directo.
 *
 * - Carta base: src/data (nombres, ingredientes, fotos, precios iniciales).
 * - Panel conectado (Supabase): precio, stock y visibilidad salen de la tabla `product_settings`.
 */
import { categories as rawCategories } from "@/data/categories";
import { products as rawProducts } from "@/data/products";
import { MENU_CACHE_TAG, applySettings, parseSettingsRows, type SettingsMap } from "@/lib/menu-settings";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Category, Product } from "@/types/product";

export interface Menu {
  categories: Category[];
  products: Product[];
}

export class CatalogError extends Error {}

export function validateCatalog(categories: Category[], products: Product[]): void {
  const errors: string[] = [];
  const categoryIds = new Set(categories.map((c) => c.id));
  const seen = new Set<string>();

  for (const p of products) {
    const where = `Producto "${p.id || p.name}"`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id)) errors.push(`${where}: el id debe ser un slug (ej: "milandwich-pollo").`);
    if (seen.has(p.id)) errors.push(`${where}: id duplicado.`);
    seen.add(p.id);
    if (!p.name.trim()) errors.push(`${where}: falta el nombre.`);
    if (!categoryIds.has(p.category)) errors.push(`${where}: categoría inexistente "${p.category}".`);
    if (p.price !== null && (!Number.isInteger(p.price) || p.price <= 0)) {
      errors.push(`${where}: el precio debe ser un entero positivo en pesos, o null.`);
    }
    if (p.ingredients.length === 0) errors.push(`${where}: cargá al menos un ingrediente.`);
    if (!p.image.alt.trim()) errors.push(`${where}: la foto necesita un texto alternativo (alt).`);
  }

  if (errors.length > 0) {
    throw new CatalogError(`Catálogo inválido:\n- ${errors.join("\n- ")}`);
  }
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/** Ordena por categoría y por orden dentro de la categoría. */
export function sortProducts(categories: Category[], products: Product[]): Product[] {
  const rank = new Map([...categories].sort(byOrder).map((c, i) => [c.id, i]));
  return [...products].sort((a, b) => (rank.get(a.category)! - rank.get(b.category)!) || byOrder(a, b));
}

/** Carta pública: solo productos activos, ordenados por categoría y orden. */
export function buildMenu(categories: Category[], products: Product[]): Menu {
  validateCatalog(categories, products);
  const active = sortProducts(categories, products.filter((p) => p.active));
  const usedCategories = [...categories].sort(byOrder).filter((c) => active.some((p) => p.category === c.id));
  return { categories: usedCategories, products: active };
}

export const knownProductIds: ReadonlySet<string> = new Set(rawProducts.map((p) => p.id));

/**
 * Lo guardado desde el panel, para la web pública. Queda cacheado (etiqueta "menu") y se
 * renueva cuando el dueño guarda un cambio. Si la base no responde, falla a propósito:
 * la web sigue mostrando la última versión buena en lugar de precios viejos.
 */
async function fetchPublicSettings(): Promise<SettingsMap> {
  const env = getSupabaseEnv();
  if (!env) return new Map();
  const url = `${env.url}/rest/v1/product_settings?select=product_id,price,available,active,updated_at`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { apikey: env.key, Accept: "application/json" },
      cache: "force-cache",
      next: { tags: [MENU_CACHE_TAG] },
    });
  } catch (cause) {
    throw new CatalogError("No se pudo conectar con Supabase para leer los precios del panel.", { cause });
  }
  if (!res.ok) {
    throw new CatalogError(
      `Supabase respondió ${res.status} al leer los precios del panel. ¿El proyecto está pausado o falta la tabla product_settings?`,
    );
  }
  return parseSettingsRows(await res.json(), knownProductIds);
}

export async function getMenu(): Promise<Menu> {
  const settings = await fetchPublicSettings();
  return buildMenu(rawCategories, applySettings(rawProducts, settings));
}

/** Para el panel: todos los productos (también los ocultos) con lo guardado aplicado. */
export function getAdminCatalog(settings: SettingsMap): { categories: Category[]; products: Product[] } {
  return {
    categories: [...rawCategories].sort(byOrder),
    products: sortProducts(rawCategories, applySettings(rawProducts, settings)),
  };
}
