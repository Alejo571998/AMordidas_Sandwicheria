/**
 * Datos del negocio. Única fuente de verdad para contacto, horarios y pagos.
 * Todo lo que figure como `null` o con "PENDIENTE" está documentado en docs/PENDIENTES.md.
 */

export interface TimeRange {
  /** "HH:MM" en hora de Santa Fe. */
  open: string;
  /** "HH:MM". Si es menor que `open`, cierra al día siguiente (ej: 19:00 → 00:30). */
  close: string;
}

export const siteConfig = {
  name: "A Mordidas",
  tagline: "Deli House",
  descriptor: "Sanguchería artesanal",
  motto: "Simple. Honesto. Delicioso.",
  description:
    "Sanguchería artesanal en Santa Fe. Sanguches en pan de lomo gratinado y pan de molde, milanesas y hamburguesas smash. Hechos en el momento. Envíos en Santa Fe Capital y retiro.",

  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://a-mordidas-sandwicheria.vercel.app",
  locale: "es_AR",

  whatsapp: {
    /** Formato internacional sin "+" ni espacios: 54 + 9 + característica + número. */
    number: "5493424281946",
    display: "342 428-1946",
  },
  instagram: {
    handle: "amordidas.ca",
    url: "https://www.instagram.com/amordidas.ca/",
  },
  pedidosYa:
    "https://www.pedidosya.com.ar/restaurantes/santa-fe/a-mordidas-10931aab-121b-469a-ae6a-1cef789a0ce0-menu",

  location: {
    city: "Santa Fe",
    region: "Santa Fe",
    country: "AR",
    /** PENDIENTE: dirección de retiro. Mientras sea null, el retiro se coordina por WhatsApp. */
    streetAddress: null as string | null,
  },

  delivery: {
    area: "Santa Fe Capital",
    note: "Consultanos tu zona y te confirmamos.",
  },

  /** Todos los días. Fuente: historia "Todos los días" (3/8/2026). */
  hours: {
    timeZone: "America/Argentina/Cordoba",
    ranges: [
      { open: "10:30", close: "17:30" },
      { open: "19:00", close: "00:30" },
    ] satisfies TimeRange[],
  },

  paymentMethods: ["Efectivo", "Transferencia", "Mercado Pago", "Tarjeta de débito y crédito"],
  currency: "ARS",
} as const;

export type SiteConfig = typeof siteConfig;
