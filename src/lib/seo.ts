import { siteConfig } from "@/config/site";
import type { Menu } from "./catalog";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Datos estructurados schema.org (Restaurant + Menu). Solo información confirmada. */
export function buildRestaurantJsonLd(menu: Menu) {
  const url = siteConfig.url.replace(/\/$/, "");
  const { location } = siteConfig;

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}/#restaurant`,
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    alternateName: siteConfig.name,
    description: siteConfig.description,
    slogan: siteConfig.motto,
    url,
    logo: `${url}/brand/logo-circular.png`,
    image: `${url}/opengraph-image.jpg`,
    telephone: `+${siteConfig.whatsapp.number}`,
    servesCuisine: ["Sándwiches", "Hamburguesas", "Comida argentina"],
    priceRange: "$$",
    currenciesAccepted: siteConfig.currency,
    paymentAccepted: siteConfig.paymentMethods.join(", "),
    acceptsReservations: false,
    address: {
      "@type": "PostalAddress",
      addressLocality: location.city,
      addressRegion: location.region,
      addressCountry: location.country,
      ...(location.streetAddress ? { streetAddress: location.streetAddress } : {}),
    },
    areaServed: { "@type": "City", name: siteConfig.delivery.area },
    openingHoursSpecification: siteConfig.hours.ranges.map((r) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ALL_DAYS,
      opens: r.open,
      closes: r.close,
    })),
    sameAs: [siteConfig.instagram.url, siteConfig.pedidosYa],
    hasMenu: {
      "@type": "Menu",
      name: "Carta",
      url: `${url}/#menu`,
      hasMenuSection: menu.categories.map((category) => ({
        "@type": "MenuSection",
        name: category.label,
        hasMenuItem: menu.products
          .filter((p) => p.category === category.id)
          .map((p) => ({
            "@type": "MenuItem",
            name: p.name,
            description: `${p.description} ${p.ingredients.join(", ")}.`,
            ...(p.tags?.includes("vegetariano") ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
            ...(p.price !== null
              ? { offers: { "@type": "Offer", price: p.price, priceCurrency: siteConfig.currency } }
              : {}),
          })),
      })),
    },
  };
}
