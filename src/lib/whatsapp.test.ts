import { describe, expect, it } from "vitest";
import type { Product } from "@/types/product";
import { summarizeCart } from "./cart/selectors";
import { validateCheckout, type CheckoutForm } from "./checkout";
import { formatPrice } from "./format";
import { buildOrderMessage, buildWhatsAppUrl } from "./whatsapp";

const p = (id: string, name: string, price: number | null): Product => ({
  id,
  name,
  category: "sanguches",
  description: "",
  ingredients: ["Pan"],
  price,
  image: { src: "/x.webp", alt: "x" },
  available: true,
  active: true,
  order: 1,
});

const catalog = new Map([
  ["milandwich-pollo", p("milandwich-pollo", "Milandwich Pollo", 12500)],
  ["crudo", p("crudo", "Crudo", 11000)],
  ["gula", p("gula", "Gula", null)],
]);

const form = (over: Partial<CheckoutForm> = {}): CheckoutForm => ({
  name: "Alejo",
  mode: "envio",
  address: "Bv. Pellegrini 1234",
  notes: "Sin cebolla",
  ...over,
});

describe("formatPrice", () => {
  it("formatea pesos argentinos sin decimales", () => {
    expect(formatPrice(12500)).toBe("$ 12.500");
    expect(formatPrice(1250000)).toBe("$ 1.250.000");
  });
});

describe("buildOrderMessage", () => {
  const summary = summarizeCart(
    [
      { productId: "milandwich-pollo", quantity: 2 },
      { productId: "crudo", quantity: 1 },
    ],
    catalog,
  );

  it("arma el pedido con envío", () => {
    const msg = buildOrderMessage(summary, form());
    expect(msg).toContain("Hola A Mordidas! 👋");
    expect(msg).toContain("2x Milandwich Pollo — $ 25.000");
    expect(msg).toContain("1x Crudo — $ 11.000");
    expect(msg).toContain("*Total: $ 36.000*");
    expect(msg).toContain("👤 *Nombre:* Alejo");
    expect(msg).toContain("🛵 *Modalidad:* Envío a domicilio");
    expect(msg).toContain("📍 *Dirección:* Bv. Pellegrini 1234");
    expect(msg).toContain("📝 *Observaciones:* Sin cebolla");
    expect(msg.trim().endsWith("¡Gracias!")).toBe(true);
  });

  it("con retiro no incluye dirección aunque se haya escrito", () => {
    const msg = buildOrderMessage(summary, form({ mode: "retiro", address: "No debería salir" }));
    expect(msg).toContain("*Modalidad:* Retiro");
    expect(msg).not.toContain("Dirección");
    expect(msg).not.toContain("No debería salir");
  });

  it("omite observaciones vacías y limpia espacios", () => {
    const msg = buildOrderMessage(summary, form({ name: "   Clari   ", notes: "   " }));
    expect(msg).toContain("*Nombre:* Clari\n");
    expect(msg).not.toContain("Observaciones");
  });

  it("con precios pendientes muestra el total a confirmar", () => {
    const pending = summarizeCart([{ productId: "gula", quantity: 2 }], catalog);
    const msg = buildOrderMessage(pending, form());
    expect(msg).toContain("2x Gula\n");
    expect(msg).toContain("*Total: a confirmar*");
  });
});

describe("buildWhatsAppUrl", () => {
  it("usa wa.me con el número y el texto codificado", () => {
    const url = buildWhatsAppUrl("Hola", "54 9 342 428-1946");
    expect(url).toBe("https://wa.me/5493424281946?text=Hola");
  });

  it("codifica caracteres especiales, emojis y saltos de línea sin perder nada", () => {
    const text = 'Ñandú & "Crudo" #2 + 50% ¿sin cebolla? 🍔\nDepto 3°B / Piso 1\n¡Gracias!';
    const url = buildWhatsAppUrl(text, "5493424281946");
    const encoded = url.split("?text=")[1];
    expect(encoded).not.toMatch(/[\s&#?"+]/);
    expect(encoded).toContain("%0A");
    expect(decodeURIComponent(encoded)).toBe(text);
    expect(new URL(url).searchParams.get("text")).toBe(text);
  });

  it("el mensaje completo de un pedido real sobrevive el ida y vuelta", () => {
    const summary = summarizeCart([{ productId: "crudo", quantity: 3 }], catalog);
    const msg = buildOrderMessage(summary, form({ address: "Calle 25 de Mayo 2150, 4° \"A\" & timbre #3", notes: "Línea 1\n\n\n\nLínea 2" }));
    const url = buildWhatsAppUrl(msg, "5493424281946");
    expect(new URL(url).searchParams.get("text")).toBe(msg);
    expect(msg).toContain("Línea 1\n\nLínea 2");
  });
});

describe("validateCheckout", () => {
  it("pide nombre y dirección cuando es envío", () => {
    expect(validateCheckout(form({ name: " ", address: "" }))).toMatchObject({
      name: expect.any(String),
      address: expect.any(String),
    });
  });

  it("con retiro la dirección no es obligatoria", () => {
    expect(validateCheckout(form({ mode: "retiro", address: "" }))).toEqual({});
  });

  it("un pedido completo es válido", () => {
    expect(validateCheckout(form())).toEqual({});
  });
});
