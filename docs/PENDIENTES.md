# Pendientes y decisiones a confirmar

Ningún dato del negocio se inventó. Esto es lo que falta o tiene versiones distintas en el material de la marca.

## Faltan (la web funciona igual, con un texto honesto en su lugar)

| Dato | Estado en la web | Dónde se carga |
| --- | --- | --- |
| **Precios** de los 7 productos | "Precio a confirmar"; el pedido llega con "Total: a confirmar" | `src/data/products.ts` → `price` |
| **Dirección de retiro** | "Retiro: coordinamos el punto por WhatsApp" | `src/config/site.ts` → `location.streetAddress` |
| Dominio propio | Usa `a-mordidas-sandwicheria.vercel.app` | Variable `NEXT_PUBLIC_SITE_URL` en Vercel |

Las únicas cifras encontradas eran de combos promocionales vencidos (31/8), por eso no se usaron.

## Versiones distintas en el material (se eligió la más reciente; confirmar)

| Tema | Opciones encontradas | Usado |
| --- | --- | --- |
| WhatsApp | 342 569-5781 (sitio anterior y bio de IG) / 342 428-1946 (feed 19/9) | **342 428-1946** (confirmado) |
| Cierre de la noche | 01:00 (historia FAQ, 2/8) / 00:30 (historia "Todos los días", 3/8) | **00:30** |
| Medios de pago | Efectivo y transferencia (FAQ) / débito, crédito, efectivo, Mercado Pago (sitio anterior) | **Todos**: efectivo, transferencia, Mercado Pago, débito y crédito |
| Crudo | Pan de campo (sitio anterior) / pan de molde (feed 19/9) | **Pan de molde** |
| Milandwich | Focaccia (sitio anterior) / pan de lomo gratinado (feed 19/9) | **Pan de lomo gratinado** |
| Brunchwich y Capresse | En el sitio anterior, no en el feed de septiembre | **Fuera de carta** (`active: false`, se reactivan con un cambio) |

## Fuentes usadas

- Logo y colores: carpeta `A MORDIDAS/LOGO` y `COLORES A MORDIDAS.docx`.
- Carta e ingredientes: `INSTAGRAM/DEFINITIVOS PARA FEED/Sanguches` (19/9/2026).
- Preguntas frecuentes, horarios, zona de envío: `INSTAGRAM/HISTORIAS`.
- Fotos de cocina reales: `INSTAGRAM/POR ORDENAR` (12/8 y 19/8).
- Historia de Alejo y Clarisa: texto y foto del sitio anterior.

## Para revisar con el equipo

- Las fotos de producto de Classic, Crudo y El Derretido son las mismas que usa el feed (estilo estudio). Si tienen fotos propias recientes de esos productos, conviene reemplazarlas con `npm run product-image`.
- Si el envío tiene costo, sumarlo como texto en `src/config/site.ts` → `delivery.note`.
