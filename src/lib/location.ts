import { siteConfig } from "@/config/site";

/** Link de Google Maps a la dirección de retiro, o null si todavía no hay dirección cargada. */
export function pickupMapsUrl(): string | null {
  const { streetAddress, city, region } = siteConfig.location;
  if (!streetAddress) return null;
  const query = `${streetAddress}, ${city}, ${region}, Argentina`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
