/**
 * Repositorio del catálogo. Hoy lee de src/data; mañana puede leer de Supabase
 * cambiando solo este archivo (ver docs/ADMIN.md). La UI nunca importa los datos directo.
 */
import { categories as rawCategories } from "@/data/categories";
import { products as rawProducts } from "@/data/products";
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

/** Carta pública: solo productos activos, ordenados por categoría y orden. */
export function buildMenu(categories: Category[], products: Product[]): Menu {
  validateCatalog(categories, products);
  const sortedCategories = [...categories].sort(byOrder);
  const categoryRank = new Map(sortedCategories.map((c, i) => [c.id, i]));
  const active = products
    .filter((p) => p.active)
    .sort((a, b) => (categoryRank.get(a.category)! - categoryRank.get(b.category)!) || byOrder(a, b));
  const usedCategories = sortedCategories.filter((c) => active.some((p) => p.category === c.id));
  return { categories: usedCategories, products: active };
}

export async function getMenu(): Promise<Menu> {
  return buildMenu(rawCategories, rawProducts);
}
