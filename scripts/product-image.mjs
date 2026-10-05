#!/usr/bin/env node
/**
 * Genera la foto de un producto con el estilo de la carta:
 * recorte sin fondo (PNG transparente) sobre papel kraft, con sombra suave.
 *
 * Uso:
 *   npm run product-image -- <recorte.png> <id-del-producto>
 *
 * Ejemplo:
 *   npm run product-image -- "C:/fotos/milandwich-sin-fondo.png" milandwich-pollo
 *
 * Resultado: src/assets/products/<id>.webp (1200×900). Después importalo en src/data/products.ts.
 * Para quitar el fondo de una foto podés usar Photoroom, remove.bg o similar.
 */
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const [input, id] = process.argv.slice(2);
if (!input || !id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  console.error('Uso: npm run product-image -- <recorte.png> <id-del-producto>   (id en minúsculas con guiones, ej: "a-pollo")');
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`No encuentro el archivo: ${input}`);
  process.exit(1);
}

const W = 1200;
const H = 900;
const PAPER = { r: 0xf0, g: 0xe2, b: 0xd0 }; // --color-paper
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "src/assets/products");
const out = resolve(outDir, `${id}.webp`);

const meta = await sharp(input).metadata();
if (!meta.hasAlpha) {
  console.warn("⚠ La imagen no tiene transparencia: se va a ver el fondo original. Ideal: PNG sin fondo.");
}

const trimmed = await sharp(input).ensureAlpha().trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
const scale = Math.min((W * 0.86) / trimmed.info.width, (H * 0.74) / trimmed.info.height);
const w = Math.round(trimmed.info.width * scale);
const h = Math.round(trimmed.info.height * scale);
const product = await sharp(trimmed.data).resize(w, h, { kernel: "lanczos3" }).toBuffer();
const left = Math.round((W - w) / 2);
const top = Math.round(H * 0.88 - h);

const shadow = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g"><stop offset="0" stop-color="#5a4630" stop-opacity="0.38"/><stop offset="0.6" stop-color="#5a4630" stop-opacity="0.12"/><stop offset="1" stop-color="#5a4630" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="${W / 2}" cy="${top + h * 0.98}" rx="${w * 0.52}" ry="${Math.max(26, h * 0.07)}" fill="url(#g)"/></svg>`);

mkdirSync(outDir, { recursive: true });
await sharp({ create: { width: W, height: H, channels: 3, background: PAPER } })
  .composite([{ input: shadow }, { input: product, left, top }])
  .webp({ quality: 86 })
  .toFile(out);

console.log(`✓ Listo: src/assets/products/${id}.webp`);
console.log(`  Importalo en src/data/products.ts:  import ${id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Img from "@/assets/products/${id}.webp";`);
