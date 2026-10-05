import Image, { type StaticImageData } from "next/image";
import armado from "@/assets/story/armado-a-mano.webp";
import founders from "@/assets/story/alejo-y-clarisa.webp";
import listo from "@/assets/story/listo-para-viajar.webp";
import producto from "@/assets/story/milandwich-recien-hecho.webp";
import pan from "@/assets/story/pan-20cm.webp";
import { Brush, Stamp } from "@/components/brand/Brand";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/format";

interface Step {
  label: string;
  title: string;
  text: string;
  image: StaticImageData;
  alt: string;
}

const steps: Step[] = [
  {
    label: "Ingredientes",
    title: "Así arrancan nuestros sanguches.",
    text: "Pan de lomo gratinado de 20 centímetros. Y todavía falta llenarlo.",
    image: pan,
    alt: "Mano sosteniendo un pan de lomo gratinado con queso de 20 centímetros",
  },
  {
    label: "Elaboración",
    title: "Hecho a mano, en el momento.",
    text: "Cada sanguche se arma cuando entra tu pedido. Como tiene que ser.",
    image: armado,
    alt: "Manos armando un sanguche: milanesa, lechuga y rodajas de tomate sobre el pan",
  },
  {
    label: "Producto",
    title: "Grandes por fuera, gigantes en sabor.",
    text: "Milanesa crocante, sardo, rúcula y tomate. Bien cargado, sin vueltas.",
    image: producto,
    alt: "Milandwich de carne recién hecho, con rúcula, tomate y queso sardo",
  },
  {
    label: "Experiencia",
    title: "Envuelto y listo para viajar.",
    text: `Te lo llevamos a tu puerta en ${siteConfig.delivery.area}, o pasás a buscarlo.`,
    image: listo,
    alt: "Sanguches envueltos en papel aluminio con el sticker de A Mordidas, listos para entregar",
  },
];

export function StorySection() {
  return (
    <section id="historia" aria-labelledby="historia-title" className="relative overflow-x-clip bg-paper bg-grain py-section">
      <div className="container-page grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <figure className="relative mx-auto w-full max-w-[22rem] -rotate-2 lg:max-w-[26rem]" data-reveal>
          <span aria-hidden className="absolute -top-3 left-8 z-10 h-7 w-24 -rotate-6 bg-mustard/75" />
          <span aria-hidden className="absolute -top-2 right-6 z-10 h-7 w-20 rotate-[8deg] bg-mustard/75" />
          <div className="rounded-xs bg-white p-3 pb-16 shadow-lift">
            <Image
              src={founders}
              alt="Alejo y Clarisa con su hijo en brazos, los creadores de A Mordidas"
              placeholder="blur"
              sizes="(min-width: 1024px) 26rem, 22rem"
              className="aspect-square w-full object-cover"
            />
          </div>
          <figcaption className="absolute inset-x-0 bottom-4 text-center font-display text-[1.75rem] leading-none text-charcoal">
            Alejo &amp; Clarisa
          </figcaption>
          <Stamp className="absolute -right-8 -bottom-10 size-28 rotate-12 text-orange-600 sm:-right-14" />
        </figure>

        <div className="max-w-xl">
          <p className="eyebrow text-orange-600">Nuestra historia</p>
          <h2 id="historia-title" className="mt-3 font-display text-display-lg text-charcoal">
            De una decisión de vida nació una forma de hacer las cosas.
          </h2>
          <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed text-charcoal/85">
            <p>
              Alejo y Clarisa dejaron el ritmo de Capital Federal y, con su hijo recién nacido, empezaron de nuevo en Santa
              Fe. Buscaban tiempo, raíces y un proyecto propio.
            </p>
            <p>
              Tenían algo más en común: una debilidad seria por los buenos sanguches. Así nació {siteConfig.name}:
              ingredientes elegidos con cuidado, todo hecho a mano y sin apuro.
            </p>
            <p className="font-display text-display-sm text-olive-700">
              Porque cuando algo está hecho con amor, vale cada mordida.
            </p>
          </div>
        </div>
      </div>

      <div className="container-page mt-24 lg:mt-32">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="relative font-display text-display-lg text-charcoal">
            Del pan a tu mano
            <Brush name="underline" className="absolute -bottom-2 left-0 h-3 w-full text-orange-500" />
          </h3>
          <p className="max-w-sm text-ink-muted">Fotos reales de nuestra cocina. Sin filtros raros: así sale cada pedido.</p>
        </div>

        <ol className="scrollbar-none -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:pb-12">
          {steps.map((step, i) => (
            <li
              key={step.label}
              data-reveal
              className={cn("w-[78%] shrink-0 snap-start sm:w-auto", i % 2 === 1 && "lg:translate-y-12")}
            >
              <div className="relative overflow-hidden rounded-lg bg-paper-deep">
                <Image
                  src={step.image}
                  alt={step.alt}
                  placeholder="blur"
                  sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 78vw"
                  className="aspect-[4/5] w-full object-cover"
                />
                <span className="absolute top-3 left-3 rounded-xs bg-cream/95 px-2 py-1 text-[0.6875rem] font-bold tracking-[0.12em] text-olive-700 uppercase">
                  {String(i + 1).padStart(2, "0")} · {step.label}
                </span>
              </div>
              <h4 className="mt-4 font-display text-[1.75rem] leading-[0.95] text-charcoal">{step.title}</h4>
              <p className="mt-2 text-[0.9375rem] text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
