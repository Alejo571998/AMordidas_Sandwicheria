# Administrar la carta y los datos del negocio

Todo lo que cambia seguido está en **dos archivos**. No hace falta tocar componentes.

| Qué querés cambiar | Dónde |
| --- | --- |
| Precios, productos, fotos, agotados, destacados | `src/data/products.ts` |
| Categorías (Sanguches, Hamburguesas…) | `src/data/categories.ts` |
| WhatsApp, Instagram, PedidosYa, horarios, zona de envío, medios de pago, dirección | `src/config/site.ts` |

Después de editar: guardar, hacer commit y push. Vercel publica solo en ~1 minuto.
Si un dato está mal cargado (ej: precio con coma, id repetido), **el build falla con un mensaje en castellano** que dice qué producto revisar: la web publicada nunca queda rota.

---

## Productos (`src/data/products.ts`)

Cada producto es un bloque así:

```ts
{
  id: "milandwich-pollo",            // no cambiar una vez publicado (lo usa el carrito guardado)
  name: "Milandwich Pollo",
  category: "sanguches",             // "sanguches" | "hamburguesas"
  description: "Milanesa de pollo crocante y bien cargado. El que nunca falla.",
  ingredients: ["Pan de lomo gratinado", "Mostanesa", "Milanesa de pollo", "Queso sardo", "Rúcula", "Tomate"],
  price: null,                       // ← poné el precio en pesos SIN puntos: 12500
  image: { src: milandwichPolloImg, alt: "Descripción de la foto" },
  available: true,                   // false = "Por hoy se fue de vacaciones 😴" (no se puede agregar)
  active: true,                      // false = no aparece en la carta
  featured: true,                    // opcional
  badge: "Nuevo",                    // opcional: etiqueta naranja sobre la foto
  tags: ["vegetariano"],             // opcional: muestra "Veggie"
  size: "20 cm",                     // opcional
  order: 2,                          // orden dentro de la categoría
}
```

### Tareas comunes

- **Cargar o cambiar un precio:** `price: 12500`. Con `null` la web muestra "Precio a confirmar" y el total del pedido se confirma por WhatsApp. Cuando todos los productos del pedido tienen precio, el total se calcula solo.
- **Marcar agotado por hoy:** `available: false`. Volver a `true` cuando haya.
- **Sacar de la carta:** `active: false` (Brunchwich y Capresse están así porque no figuran en el feed de septiembre).
- **Producto nuevo:** copiá un bloque, cambiá `id` (minúsculas con guiones), nombre, ingredientes y foto.
- **Foto nueva:**
  1. Recortá el producto sin fondo (Photoroom, remove.bg) y guardalo como PNG.
  2. `npm run product-image -- "ruta/al/recorte.png" id-del-producto`
  3. Se crea `src/assets/products/id-del-producto.webp` con el fondo papel y la sombra de la carta.
  4. Importalo arriba de `products.ts` y usalo en `image.src`.

## Datos del negocio (`src/config/site.ts`)

- `whatsapp.number`: formato internacional sin `+` ni espacios (`549` + característica + número). Es el número al que llegan los pedidos.
- `hours.ranges`: horarios de todos los días. Si el cierre es menor que la apertura (19:00 → 00:30) se entiende que cierra al día siguiente. El cartel "Abierto ahora / Cerrado" se calcula solo, en hora de Santa Fe.
- `location.streetAddress`: si cargás la dirección de retiro, aparece en el footer y en Google (datos estructurados).
- `paymentMethods`, `delivery.area`, `pedidosYa`, `instagram`.

## Medición (analytics)

`src/lib/analytics.ts` ya emite estos eventos: `menu_view`, `product_view`, `add_to_cart`, `remove_from_cart`, `checkout_start`, `whatsapp_order_click`.
Para medirlos, instalá Google Tag Manager (los eventos van a `window.dataLayer`) o agregá la llamada de la plataforma dentro de `track()`. No hay que tocar componentes.

---

## Pasar a Supabase (cuando haga falta un panel)

Hoy no hace falta: la carta cambia poco y editar un archivo es más simple, gratis y sin riesgos de seguridad.
Conviene migrar si quieren cambiar precios o agotados **desde el celular sin tocar código**.

1. Crear proyecto en Supabase y ejecutar `supabase/schema.sql` (tablas + RLS + permisos de admin).
2. Subir las fotos al bucket `products` (Storage, público) y cargar los productos.
3. Variables en Vercel: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (la anon key es pública y está protegida por RLS). **Nunca** usar la `service_role` key en el frontend.
4. Cambiar solo `getMenu()` en `src/lib/catalog.ts` para leer de Supabase. La validación del catálogo y toda la UI siguen igual.
5. Para que los cambios se vean sin redeploy: revalidación por tiempo o `revalidateTag` desde el panel.
6. El panel (`/admin`, con login de Supabase Auth) solo necesita listar productos y editar `price`, `available`, `active`, `badge`.
