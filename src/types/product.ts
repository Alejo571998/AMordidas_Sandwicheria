import type { StaticImageData } from "next/image";

export type CategoryId = "sanguches" | "hamburguesas";

export interface Category {
  id: CategoryId;
  /** Nombre en plural, como aparece en filtros y títulos. */
  label: string;
  /** Nombre en singular, para la etiqueta de cada producto. */
  singular: string;
  /** Bajada corta debajo del título de la categoría. */
  description: string;
  order: number;
}

export type DietaryTag = "vegetariano";

export interface ProductImage {
  /** Import estático (con blur automático) o URL absoluta (ej: Supabase Storage). */
  src: StaticImageData | string;
  alt: string;
}

export interface Product {
  /** Identificador estable. Se usa en el carrito guardado: no lo cambies una vez publicado. */
  id: string;
  name: string;
  category: CategoryId;
  /** Una línea con personalidad. Sin repetir los ingredientes. */
  description: string;
  ingredients: string[];
  /** Precio en pesos, entero. `null` = precio pendiente de cargar (se muestra "a confirmar"). */
  price: number | null;
  image: ProductImage;
  /** `false` = agotado por hoy: se muestra en la carta pero no se puede agregar. */
  available: boolean;
  /** `false` = no aparece en la carta (producto discontinuado o en pausa). */
  active: boolean;
  /** Unidades que quedan hoy (se cargan desde el panel). Ausente o `null` = sin límite. */
  stock?: number | null;
  featured?: boolean;
  /** Etiqueta destacada sobre la foto. Ej: "Nuevo". */
  badge?: string | null;
  tags?: DietaryTag[];
  /** Dato de tamaño visible en la card. Ej: "20 cm". */
  size?: string | null;
  /** Orden dentro de su categoría (menor = primero). */
  order: number;
}
