# Design system — A Mordidas Deli House

Tokens en `src/app/globals.css` (`@theme` de Tailwind v4). Todo color, radio y sombra sale de ahí.

## Color

Derivado del documento de colores de la marca y medido sobre las piezas de Instagram.

| Token | Hex | Uso |
| --- | --- | --- |
| `--color-orange` / `-500` | `#d4561a` | Títulos grandes y acentos sobre marfil |
| `--color-orange-600` | `#c2480f` | Hero y header mobile, CTA principal, aviso "Sumaste" |
| `--color-orange-400` | `#ee8048` | Naranja sobre fondos oliva |
| `--color-olive` / `-700` | `#5c5a2c` | Texto oliva, badges |
| `--color-olive-600` | `#676538` | **Acciones del pedido**: Agregar, Ver pedido, Continuar |
| `--color-olive-900` | `#3a3d1f` | Cinta, filtros activos, botón "Pedir" sobre naranja |
| `--color-olive-950` | `#2b2d17` | Footer |
| `--color-mustard` | `#d9a441` | Sello, contadores, estado "Agregado", subrayados |
| `--color-charcoal` | `#1f1f1f` | Texto principal, anillo de foco |
| `--color-cream` | `#f8f5ef` | Fondo general (marfil de marca), hero desktop |
| `--color-paper` | `#f0e2d0` | Papel kraft: fondo de las fotos de producto |
| `--color-whatsapp` | `#1f7a43` | Botones que abren WhatsApp |

**Jerarquía de botones:** naranja = descubrir (Ver menú) · verde oliva = armar el pedido (Agregar, Ver pedido, Continuar) · verde WhatsApp = enviar.

### Contraste (WCAG 2.2 AA)

| Par | Ratio |
| --- | --- |
| Blanco sobre naranja-600 | 4.97 |
| Blanco sobre oliva-600 | 6.01 |
| Marfil sobre oliva-900 | 10.34 |
| Carbón sobre marfil | 15.15 |
| Naranja-600 sobre marfil | 4.56 |
| Carbón sobre naranja-600 (solo títulos grandes) | 3.32 |
| Carbón sobre mostaza | 7.33 |
| Blanco sobre verde WhatsApp | 5.35 |

## Tipografía (1 display + 1 texto, autoalojadas con `next/font`)

- **Bebas Neue**: titulares, nombres de producto, precios. Siempre en mayúsculas, como en las piezas.
- **Montserrat**: texto, botones, etiquetas.
- El wordmark "A Mordidas" es el logo original vectorizado (`public/brand/wordmark.svg`); no es una tipografía.

Escala fluida: `text-display-2xl` (hero) · `-xl` (títulos de sección) · `-lg` · `-md` (productos) · `-sm`. Etiquetas con la utilidad `eyebrow`.

## Recursos gráficos

- `Brush` (`underline`, `swatch`, `torn`, `band`): trazos de pincel de las piezas, en SVG.
- `Stamp`: sello "Simple. Honesto. Delicioso." (gira lento, respeta `prefers-reduced-motion`).
- `Sparks`: los tres trazos de "¡ojo acá!".
- `bg-grain`: textura de papel (PNG de 6 KB).

## Espaciado, radios, sombras

- Secciones: `py-section` (fluido 72–128 px). Contenedor: `container-page` (máx. 1280 px, gutter 16–40 px).
- Radios: `xs` 4 · `sm` 8 · `md` 14 · `lg` 20 · `xl` 28 (más chicos adentro, más suaves en contenedores).
- Sombras teñidas de marrón cálido: `shadow-card`, `shadow-lift`, `shadow-float`, `shadow-cta`, `shadow-cta-olive`.

## Movimiento

- Revelado al hacer scroll 100% CSS (`data-reveal`, scroll-driven animations). Sin soporte: contenido visible directo.
- Entrada del hero sin partir de opacidad 0 (no retrasa el LCP).
- Feedback al agregar: botón → "Agregado" (mostaza), contador con "pop", barra con "bump", aviso naranja.
- Todo se desactiva con `prefers-reduced-motion`.

## Accesibilidad

- Diálogos nativos `<dialog>` (foco atrapado, Escape, scroll bloqueado).
- Anillo de foco de 3 px: carbón por defecto, mostaza en zonas oscuras (`focus-on-dark`).
- Áreas táctiles ≥ 44 px, link "Saltar al contenido", `aria-live` para lo que se agrega al pedido, errores de formulario asociados con `aria-describedby`.
- Nombres de productos y de la marca con `translate="no"`: el traductor del navegador los respeta (sin esto, "Gula" se traducía como "Azúcar"). Al agregar un lugar nuevo donde se muestre un nombre de producto, mantener el atributo.
