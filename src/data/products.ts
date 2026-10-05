/**
 * CARTA DE A MORDIDAS — única fuente de verdad de los productos.
 *
 * Cómo editar (ver docs/ADMIN.md):
 * - Precio:          `price: 12500` (pesos, sin puntos). `null` = "a confirmar".
 * - Agotado por hoy: `available: false`.
 * - Sacar de carta:  `active: false`.
 * - Destacar:        `featured: true` / `badge: "Nuevo"`.
 * - Foto nueva:      agregá el .webp en src/assets/products/ y cambiá el import.
 *
 * Ingredientes según las piezas oficiales del feed (19/9/2026).
 */
import type { Product } from "@/types/product";

import aPolloImg from "@/assets/products/a-pollo.webp";
import brunchwichImg from "@/assets/products/brunchwich.webp";
import capresseImg from "@/assets/products/capresse.webp";
import classicImg from "@/assets/products/classic.webp";
import crudoImg from "@/assets/products/crudo.webp";
import elDerretidoImg from "@/assets/products/el-derretido.webp";
import gulaImg from "@/assets/products/gula.webp";
import milandwichCarneImg from "@/assets/products/milandwich-carne.webp";
import milandwichPolloImg from "@/assets/products/milandwich-pollo.webp";

export const products: Product[] = [
  {
    id: "milandwich-carne",
    name: "Milandwich Carne",
    category: "sanguches",
    description: "La milanesa de carne de toda la vida, en versión sanguche XL.",
    ingredients: ["Pan de lomo gratinado", "Mostanesa", "Milanesa de carne", "Queso sardo", "Rúcula", "Tomate"],
    price: null, // PENDIENTE
    image: {
      src: milandwichCarneImg,
      alt: "Milandwich de carne: milanesa, queso sardo, rúcula y tomate en pan de lomo gratinado",
    },
    available: true,
    active: true,
    featured: true,
    size: "20 cm",
    order: 1,
  },
  {
    id: "milandwich-pollo",
    name: "Milandwich Pollo",
    category: "sanguches",
    description: "Milanesa de pollo crocante y bien cargado. El que nunca falla.",
    ingredients: ["Pan de lomo gratinado", "Mostanesa", "Milanesa de pollo", "Queso sardo", "Rúcula", "Tomate"],
    price: null, // PENDIENTE
    image: {
      src: milandwichPolloImg,
      alt: "Milandwich de pollo: milanesa de pollo, queso sardo, rúcula, tomate y mostanesa en pan de lomo gratinado",
    },
    available: true,
    active: true,
    featured: true,
    size: "20 cm",
    order: 2,
  },
  {
    id: "a-pollo",
    name: "A-Pollo",
    category: "sanguches",
    description: "El más nuevo de la casa: cremoso, dulce y salado a la vez.",
    ingredients: [
      "Pan de lomo gratinado",
      "Mostanesa",
      "Pollo cremoso en cubos",
      "Cebolla caramelizada",
      "Queso muzzarella",
    ],
    price: null, // PENDIENTE
    image: {
      src: aPolloImg,
      alt: "Sanguche A-Pollo: pollo cremoso en cubos con cebolla caramelizada y muzzarella en pan de lomo gratinado",
    },
    available: true,
    active: true,
    badge: "Nuevo",
    size: "20 cm",
    order: 3,
  },
  {
    id: "crudo",
    name: "Crudo",
    category: "sanguches",
    description: "Jamón crudo y pesto de albahaca. Un clásico que no falla.",
    ingredients: ["Pan de molde", "Pesto de albahaca", "Jamón crudo", "Queso muzzarella", "Rúcula", "Tomate"],
    price: null, // PENDIENTE
    image: {
      src: crudoImg,
      alt: "Sanguche Crudo: jamón crudo, muzzarella, rúcula y tomate en pan de molde",
    },
    available: true,
    active: true,
    order: 4,
  },
  {
    id: "classic",
    name: "Classic",
    category: "sanguches",
    description: "Jamón y queso con tomates cherry asados. Nunca pasa de moda.",
    ingredients: ["Pan de molde", "Ketchup", "Jamón cocido", "Queso muzzarella", "Tomates cherry asados"],
    price: null, // PENDIENTE
    image: {
      src: classicImg,
      alt: "Sanguche Classic: jamón cocido, muzzarella y tomates cherry asados en pan de molde",
    },
    available: true,
    active: true,
    order: 5,
  },
  {
    id: "el-derretido",
    name: "El Derretido",
    category: "sanguches",
    description: "Dos quesos fundidos y cebolla caramelizada. Para fans del queso.",
    ingredients: ["Pan de molde tostado", "Mostanesa", "Queso muzzarella", "Queso tybo", "Cebolla caramelizada"],
    price: null, // PENDIENTE
    image: {
      src: elDerretidoImg,
      alt: "Sanguche El Derretido: muzzarella y tybo fundidos con cebolla caramelizada en pan de molde tostado",
    },
    available: true,
    active: true,
    tags: ["vegetariano"],
    order: 6,
  },
  {
    id: "gula",
    name: "Gula",
    category: "hamburguesas",
    description: "Doble smash, doble cheddar. El nombre lo dice todo.",
    ingredients: [
      "Pan de hamburguesa gratinado",
      "Mayonesa",
      "Doble medallón smash",
      "Doble queso cheddar",
      "Cebolla caramelizada",
      "Ketchup",
    ],
    price: null, // PENDIENTE
    image: {
      src: gulaImg,
      alt: "Hamburguesa Gula: doble medallón smash, doble cheddar y cebolla caramelizada en pan gratinado",
    },
    available: true,
    active: true,
    featured: true,
    order: 1,
  },

  // --- Fuera de carta (no figuran en el feed de septiembre). Activalos con `active: true`.
  {
    id: "brunchwich",
    name: "Brunchwich",
    category: "sanguches",
    description: "Palta, panceta crocante y huevo a la plancha. Potencia y sabor.",
    ingredients: [
      "Focaccia",
      "Alioli de limón",
      "Palta",
      "Rúcula",
      "Queso muzzarella",
      "Panceta ahumada crocante",
      "Huevo a la plancha",
    ],
    price: null,
    image: {
      src: brunchwichImg,
      alt: "Brunchwich: palta, panceta crocante, huevo a la plancha, rúcula y muzzarella en focaccia",
    },
    available: true,
    active: false,
    order: 7,
  },
  {
    id: "capresse",
    name: "Capresse",
    category: "sanguches",
    description: "La delicia de siempre, dentro de un bagel.",
    ingredients: ["Bagel", "Alioli de limón", "Albahaca", "Queso muzzarella", "Tomates cherry asados"],
    price: null,
    image: {
      src: capresseImg,
      alt: "Sanguche Capresse: muzzarella, albahaca y tomates cherry asados en bagel",
    },
    available: true,
    active: false,
    tags: ["vegetariano"],
    order: 8,
  },
];
