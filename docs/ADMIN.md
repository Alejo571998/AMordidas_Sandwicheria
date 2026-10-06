# Administrar la carta y los datos del negocio

Hay dos formas de cambiar la carta:

| Qué querés cambiar | Dónde |
| --- | --- |
| **Precio, "agotado por hoy", mostrar u ocultar un producto** | Panel **/admin** (cuando esté conectado) o `src/data/products.ts` |
| Nombres, descripciones, ingredientes, fotos, productos nuevos | `src/data/products.ts` |
| Categorías (Sanguches, Hamburguesas…) | `src/data/categories.ts` |
| WhatsApp, Instagram, PedidosYa, horarios, zona de envío, medios de pago, dirección de retiro | `src/config/site.ts` |

---

## Panel de administrador (/admin)

Página privada para que el dueño cambie, desde el celular y sin tocar código:

- **Precio** de cada producto (vacío = "Precio a confirmar").
- **Hay stock hoy**: apagado muestra "Por hoy se fue de vacaciones 😴" y no se puede pedir.
- **Se muestra en la carta**: apagado lo oculta de la web.
- **Su contraseña** (*Tu cuenta y contraseña*).

Los cambios se ven en la web apenas se guardan.

**Estado actual: ACTIVO** (conectado el 5/10/2026). Las variables están cargadas solo para *Production*: en los deploys de *Preview* el panel aparece apagado y se usan los precios de `src/data/products.ts`.

Si alguna vez `/admin` dice "El panel todavía no está activo", faltan las variables de Supabase en Vercel o no se hizo *Redeploy* después de cargarlas (paso 5).

### Cómo se protege

- Entra solo quien tenga **usuario y contraseña** creados en Supabase **y** figure en la tabla `admins`. Una cuenta que no esté en esa tabla no puede cambiar nada, aunque logre entrar.
- La base vuelve a verificar cada cambio con **RLS** (Row Level Security): aunque alguien llamara a la API directamente, sin ser admin no puede escribir.
- Las cookies de sesión solo viajan a `/admin`, no se pueden leer con JavaScript y exigen HTTPS.
- La web usa solo la **clave publicable**. La clave secreta (`service_role` / `sb_secret_…`) **no se usa ni se carga en ningún lado**. Si alguien la pega por error, el sitio se niega a arrancar.
- `/admin` no aparece en Google (`noindex` + `robots.txt`).

### Activarlo (una sola vez, ~15 minutos)

**1. Crear el proyecto en Supabase** (con la cuenta que se vaya a usar)

- [supabase.com](https://supabase.com) → *New project*. Nombre: `a-mordidas`. Región: **South America (São Paulo)**. Plan gratis.
- Guardá la contraseña de la base en un lugar seguro (no se carga en la web).

**2. Crear las tablas**

- En el proyecto: *SQL Editor* → *New query* → pegá todo el contenido de [`supabase/schema.sql`](../supabase/schema.sql) → *Run*.

**3. Cerrar el registro y crear la cuenta del dueño**

- *Authentication* → *Sign In / Providers* → *Email*: dejá activado Email, **desactivá "Allow new users to sign up"** y guardá.
- *Authentication* → *Users* → *Add user* → *Create new user*: email del dueño y una contraseña larga. Tildá **Auto Confirm User**.

**4. Darle permiso de administrador**

- *SQL Editor* → nueva consulta (reemplazá el email):

  ```sql
  insert into public.admins (user_id)
  select id from auth.users where email = 'email-del-dueno@ejemplo.com';
  ```

**5. Conectar la web (Vercel)**

- En Supabase: *Project Settings* → *API Keys*: copiá la **Publishable key** (`sb_publishable_…`). En *Data API* (o *Connect*), copiá la **Project URL**.
- En Vercel: proyecto `a-mordidas-sandwicheria` → *Settings* → *Environment Variables* → agregá (para *Production* y *Preview*):

  | Nombre | Valor |
  | --- | --- |
  | `NEXT_PUBLIC_SUPABASE_URL` | la Project URL (`https://xxxx.supabase.co`) |
  | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | la Publishable key |
  | `CRON_SECRET` | una frase larga al azar (protege la tarea diaria) |

- *Deployments* → último deploy → *Redeploy*.

**6. Probar**

- Entrá a `https://a-mordidas-sandwicheria.vercel.app/admin`, iniciá sesión, cambiá un precio y guardá. Abrí la web en otra pestaña: tiene que verse el precio nuevo.

### Bueno saber

- **Primer guardado:** mientras un producto no se haya guardado nunca desde el panel, usa el valor de `products.ts`. Después de guardarlo, manda lo del panel.
- **Supabase gratis se pausa** si pasa una semana sin uso. Para evitarlo, Vercel corre todos los días una tarea (`/api/keepalive`, configurada en `vercel.json`) que hace una consulta liviana. Si igual se pausara: en Supabase, *Restore project*.
- **Si la base no responde**, la web sigue mostrando la última versión buena (no vuelve a precios viejos). Un deploy nuevo con la base caída falla a propósito, con un mensaje claro, y Vercel deja publicada la versión anterior.
- **Cambiar la contraseña:** desde el panel, *Tu cuenta y contraseña* (arriba a la derecha en "Precios y stock"). Pide la actual, exige al menos 10 caracteres y cierra las sesiones abiertas en otros dispositivos.
- **Si el dueño se olvida la contraseña:** Supabase → *Authentication* → *Users* → borrar el usuario → crearlo de nuevo con una contraseña nueva (paso 3) → repetir el `insert` en `admins` (paso 4). Después la puede cambiar él desde el panel.
- **Sumar otra persona:** crear su usuario (paso 3) y agregarla a `admins` (paso 4). Para quitarle el acceso: `delete from public.admins where user_id = '…';`.

---

## Editar la carta en el código (`src/data/products.ts`)

Después de editar: guardar, hacer commit y push. Vercel publica solo en ~1 minuto.
Si un dato está mal cargado (ej: precio con coma, id repetido), **el build falla con un mensaje en castellano** que dice qué producto revisar: la web publicada nunca queda rota.

Cada producto es un bloque así:

```ts
{
  id: "milandwich-pollo",            // no cambiar una vez publicado (lo usan el carrito y el panel)
  name: "Milandwich Pollo",
  category: "sanguches",             // "sanguches" | "hamburguesas"
  description: "Milanesa de pollo crocante y bien cargado. El que nunca falla.",
  ingredients: ["Pan de lomo gratinado", "Mostanesa", "Milanesa de pollo", "Queso sardo", "Rúcula", "Tomate"],
  price: 10400,                      // pesos SIN puntos. null = "Precio a confirmar"
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

> Con el panel conectado, `price`, `available` y `active` de este archivo son solo el valor inicial: lo que se guarde en el panel tiene prioridad.

### Tareas comunes

- **Producto nuevo:** copiá un bloque, cambiá `id` (minúsculas con guiones), nombre, ingredientes y foto. Aparece solo en el panel.
- **Foto nueva:**
  1. Recortá el producto sin fondo (Photoroom, remove.bg) y guardalo como PNG.
  2. `npm run product-image -- "ruta/al/recorte.png" id-del-producto`
  3. Se crea `src/assets/products/id-del-producto.webp` con el fondo papel y la sombra de la carta.
  4. Importalo arriba de `products.ts` y usalo en `image.src`.

## Datos del negocio (`src/config/site.ts`)

- `whatsapp.number`: formato internacional sin `+` ni espacios (`549` + característica + número). Es el número al que llegan los pedidos.
- `hours.ranges`: horarios de todos los días. Si el cierre es menor que la apertura (19:00 → 00:30) se entiende que cierra al día siguiente. El cartel "Abierto ahora / Cerrado" se calcula solo, en hora de Santa Fe.
- `location.streetAddress`: dirección de retiro. Aparece en el footer (con link a Google Maps), en el pedido y en Google (datos estructurados).
- `paymentMethods`, `delivery.area`, `pedidosYa`, `instagram`.

## Medición (analytics)

`src/lib/analytics.ts` ya emite estos eventos: `menu_view`, `product_view`, `add_to_cart`, `remove_from_cart`, `checkout_start`, `whatsapp_order_click`.
Para medirlos, instalá Google Tag Manager (los eventos van a `window.dataLayer`) o agregá la llamada de la plataforma dentro de `track()`. No hay que tocar componentes.
