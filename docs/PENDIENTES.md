# Pendientes y decisiones a confirmar

Ningún dato del negocio se inventó. Esto es lo que falta o tiene versiones distintas en el material de la marca.

## Faltan

| Dato | Estado en la web | Dónde se carga |
| --- | --- | --- |
| **Panel de administrador** | Programado y apagado: falta conectar Supabase (otra cuenta del dueño) | Pasos en [`docs/ADMIN.md`](ADMIN.md#activarlo-una-sola-vez-15-minutos) |
| Dominio propio | Usa `a-mordidas-sandwicheria.vercel.app` | Variable `NEXT_PUBLIC_SITE_URL` en Vercel |

## Confirmados por el dueño (5/10/2026)

| Dato | Valor |
| --- | --- |
| Precios | Menú vigente: A-Pollo $11.690 · Crudo $14.190 · Capresse $10.300 · Milandwich Carne $12.560 · Milandwich Pollo $10.400 · Classic $9.150 · Brunchwich $11.450 · El Derretido $8.990 · Gula $8.490 |
| Dirección de retiro | San José 2474, Santa Fe |
| Horarios | Todos los días, 10:45 a 17:00 y 19:00 a 00:30 |
| WhatsApp | 342 428-1946 |
| Carta | Se muestran los 9 productos, incluidos Capresse y Brunchwich. Textos como en el feed |
| Crudo | Pan de molde |
| Classic | Jamón natural y muzzarella |
| Nombre | Milandwich |
| Brunchwich | Pan de lomo gratinado |
| Medios de pago | Efectivo y transferencia |

## Fuentes usadas

- Logo y colores: carpeta `A MORDIDAS/LOGO` y `COLORES A MORDIDAS.docx`.
- Carta e ingredientes: `INSTAGRAM/DEFINITIVOS PARA FEED/Sanguches` (19/9/2026).
- Precios: menú vigente que pasó el dueño (5/10/2026).
- Preguntas frecuentes y zona de envío: `INSTAGRAM/HISTORIAS`.
- Fotos de cocina reales: `INSTAGRAM/POR ORDENAR` (12/8 y 19/8).
- Historia de Alejo y Clarisa: texto y foto del sitio anterior.

## Para revisar con el equipo

- Las fotos de producto de Classic, Crudo y El Derretido son las mismas que usa el feed (estilo estudio). Si tienen fotos propias recientes de esos productos, conviene reemplazarlas con `npm run product-image`.
- La foto del Brunchwich es de la versión anterior (en focaccia). Cuando tengan una foto en pan de lomo gratinado, reemplazarla con `npm run product-image -- "recorte.png" brunchwich`.
- Si el envío tiene costo, sumarlo como texto en `src/config/site.ts` → `delivery.note`. Hoy el total del pedido es solo de los productos.
