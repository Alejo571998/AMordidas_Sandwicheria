import { Fragment } from "react";

const items = [
  "Hecho en el momento",
  "Envíos a domicilio",
  "Pedidos anticipados",
  "Todos los días",
  "Simple. Honesto. Delicioso.",
  "Pedí por WhatsApp",
];

/** Cinta naranja con los "por qué" de la marca. Decorativa: el contenido real está en la página. */
export function Marquee() {
  const row = (
    <span className="flex shrink-0 items-center">
      {items.map((item) => (
        <Fragment key={item}>
          <span className="px-5 whitespace-nowrap">{item}</span>
          <span className="text-mustard">✦</span>
        </Fragment>
      ))}
    </span>
  );
  return (
    <div className="overflow-x-clip">
      <div
        aria-hidden
        className="marquee relative -mx-4 -rotate-[1.6deg] bg-olive-900 py-3.5 font-display text-[1.375rem] tracking-[0.04em] text-cream shadow-[0_14px_30px_-18px_rgb(43_45_23/0.8)] sm:text-[1.625rem]"
      >
        <div className="marquee-track flex w-max">
          {row}
          {row}
        </div>
      </div>
    </div>
  );
}
