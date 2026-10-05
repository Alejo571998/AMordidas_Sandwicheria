# A Mordidas — Deli House

Sitio de la sanguchería A Mordidas (Santa Fe). Menú interactivo, carrito y pedidos por WhatsApp.

**Flujo:** ver → elegir → agregar → revisar → pedir por WhatsApp (el mensaje se arma solo).

## Stack

- Next.js 16 (App Router, todo estático) · React 19 · TypeScript · Tailwind CSS 4
- Sin base de datos ni backend: la carta vive en `src/data/products.ts` (fuente única).
- Deploy en Vercel (`vercel.json` fija el framework).

## Uso

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # lint + typecheck + tests + build
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `start` | Build y servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Tipos de rutas + TypeScript |
| `npm test` | Tests unitarios (carrito, WhatsApp, horarios, catálogo) |
| `npm run product-image -- <png> <id>` | Genera la foto de un producto con el estilo de la carta |

## Estructura

```
src/
  app/            layout (SEO, fuentes), página, 404, error, sitemap, robots, íconos, OG
  components/
    brand/        Wordmark, Brush, Stamp, Sparks
    home/         Hero, Marquee, StorySection, HowToOrder
    menu/         MenuSection (filtros), ProductCard
    cart/         CartProvider, CartBar, CartDrawer, CartLines, CheckoutForm, OrderButton
    layout/       Header, Footer, OpenStatus
    ui/           Button, Icon, QuantityStepper
  config/site.ts  WhatsApp, horarios, pagos, envíos
  data/           products.ts, categories.ts
  lib/            catálogo, carrito (reducer/store/persistencia), WhatsApp, checkout, horarios, analytics, SEO
docs/             ADMIN.md · PENDIENTES.md · DESIGN-SYSTEM.md
supabase/         schema.sql (para un futuro panel; no conectado)
scripts/          product-image.mjs
```

## Documentación

- [docs/ADMIN.md](docs/ADMIN.md): cómo cambiar precios, agotados, fotos y datos del negocio.
- [docs/PENDIENTES.md](docs/PENDIENTES.md): datos que faltan y decisiones a confirmar.
- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md): colores, tipografía, componentes, contraste.

## Sitio anterior

La versión HTML + Bootstrap quedó en el tag `v1-sitio-estatico`. Sus URLs (`/pages/nuestro%20menu.html`, `/pages/contacto.html`) redirigen al sitio nuevo.
