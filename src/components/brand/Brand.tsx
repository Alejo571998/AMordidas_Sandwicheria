import type { CSSProperties, SVGProps } from "react";
import { cn } from "@/lib/format";
import { brushPaths, type BrushName } from "./brush-paths";

/**
 * Wordmark "A Mordidas" (vectorizado del logo original, con la A mordida).
 * Se pinta con `currentColor` vía máscara, así funciona sobre cualquier fondo.
 */
export function Wordmark({ className, label = "A Mordidas" }: { className?: string; label?: string }) {
  const mask: CSSProperties = {
    WebkitMaskImage: "url(/brand/wordmark.svg)",
    maskImage: "url(/brand/wordmark.svg)",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "left center",
    maskPosition: "left center",
  };
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return <span {...a11y} className={cn("block aspect-[1852/562] bg-current", className)} style={mask} />;
}

/** Trazo de pincel (subrayados, parches detrás de etiquetas, bordes rasgados). */
export function Brush({
  name,
  className,
  preserveAspectRatio = "none",
  ...rest
}: { name: BrushName } & SVGProps<SVGSVGElement>) {
  const { viewBox, d } = brushPaths[name];
  return (
    <svg viewBox={viewBox} preserveAspectRatio={preserveAspectRatio} aria-hidden focusable={false} className={className} {...rest}>
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/** Sello circular "Simple. Honesto. Delicioso." */
export function Stamp({ className, spin = false }: { className?: string; spin?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden focusable={false} className={cn(className, spin && "motion-safe:animate-spin-slow")}>
      <defs>
        <path id="stamp-circle" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="currentColor" strokeWidth="2" />
      <text
        fill="currentColor"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 21, letterSpacing: "0.12em" }}
      >
        <textPath href="#stamp-circle" startOffset="0">
          SIMPLE. HONESTO. DELICIOSO. •
        </textPath>
      </text>
      <path
        d="M100 128s-24-14-24-31a13.5 13.5 0 0 1 24-8.6A13.5 13.5 0 0 1 124 97c0 17-24 31-24 31Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tres trazos cortos tipo "¡ojo acá!" de las piezas de la marca. */
export function Sparks({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden focusable={false} className={className} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
      <path d="M8 22 2.5 19M13 13 9.5 4.5M23 10.5 25 2" />
    </svg>
  );
}
