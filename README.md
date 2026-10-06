# A Mordidas — Deli House

Sitio de la sanguchería A Mordidas (Santa Fe). Menú interactivo, carrito y pedidos por WhatsApp.

**Flujo:** ver → elegir → agregar → revisar → pedir por WhatsApp (el mensaje se arma solo).

## Stack

- Next.js 16 (App Router, la web pública es estática) · React 19 · TypeScript · Tailwind CSS 4
- La carta vive en `src/data/products.ts`. Precio, stock y visibilidad se pueden manejar desde el **panel `/admin`** (Supabase Auth + RLS), que queda apagado hasta cargar las variables de Supabase.
- Deploy en Vercel (`vercel.json`: framework y tarea diaria `/api/keepalive`).

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
| `npm test` | Tests unitarios (carrito, WhatsApp, horarios, catálogo, precios del panel) |
| `npm run product-image -- <png> <id>` | Genera la foto de un producto con el estilo de la carta |

## Estructura

```
src/
  app/
    (site)/       web pública: layout (carrito, header, footer) y home
    admin/        panel: login, precios y stock, acciones del servidor
    api/keepalive tarea diaria (mantiene activo Supabase)
                  + layout raíz (SEO, fuentes), 404, error, sitemap, robots, íconos, OG
  components/
    admin/        LoginForm, SettingsEditor, AdminNotice
    brand/        Wordmark, Brush, Stamp, Sparks
    home/         Hero, Marquee, StorySection, HowToOrder
    menu/         MenuSection (filtros), ProductCard
    cart/         CartProvider, CartBar, CartDrawer, CartLines, CheckoutForm, OrderButton
    layout/       SiteShell, Header, Footer, OpenStatus
    ui/           Button, Icon, QuantityStepper
  config/site.ts  WhatsApp, horarios, dirección, pagos, envíos
  data/           products.ts, categories.ts
  lib/            catálogo, ajustes del panel, Supabase, carrito, WhatsApp, checkout, horarios, analytics, SEO
  proxy.ts        renueva la sesión del panel (solo /admin)
docs/             ADMIN.md · PENDIENTES.md · DESIGN-SYSTEM.md
supabase/         schema.sql (tablas, RLS y permisos del panel) + migrations/002_stock.sql (stock por unidades)
scripts/          product-image.mjs
```

## Documentación

- [docs/ADMIN.md](docs/ADMIN.md): panel de administrador (cómo activarlo) y cómo cambiar precios, agotados, fotos y datos del negocio.
- [docs/PENDIENTES.md](docs/PENDIENTES.md): datos que faltan y decisiones a confirmar.
- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md): colores, tipografía, componentes, contraste.

## Sitio anterior

La versión HTML + Bootstrap quedó en el tag `v1-sitio-estatico`. Sus URLs (`/pages/nuestro%20menu.html`, `/pages/contacto.html`) redirigen al sitio nuevo.
