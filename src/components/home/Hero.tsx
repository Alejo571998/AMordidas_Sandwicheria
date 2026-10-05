import Image from "next/image";
import type { CSSProperties } from "react";
import gulaCutout from "@/assets/hero/gula.webp";
import milandwichCutout from "@/assets/hero/milandwich-carne.webp";
import { Brush, Stamp } from "@/components/brand/Brand";
import { OrderButton } from "@/components/cart/OrderButton";
import { OpenStatus } from "@/components/layout/OpenStatus";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Mobile: fondo naranja (la marca entra con energía, como en las historias de IG).
 * Desktop: fondo marfil con composición editorial y pincelada naranja.
 */
export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative z-10 overflow-x-clip bg-orange-600 bg-grain text-white lg:bg-cream lg:text-charcoal"
    >
      <Brush name="band" className="absolute bottom-0 left-[-10%] h-40 w-[130%] text-orange-700 sm:h-56 lg:hidden" />
      <Brush
        name="swatch"
        className="absolute bottom-[2.5rem] left-[47%] hidden h-56 w-[58%] -rotate-3 text-orange-600 lg:block"
      />

      <div className="container-page relative grid items-center gap-6 pt-8 sm:pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:pt-14 lg:pb-16">
        <div className="relative z-10 max-w-[38rem]">
          <p className="hero-enter eyebrow text-cream lg:text-orange-600" style={stagger(0)}>
            Sanguchería · <span translate="no">Deli House</span> · Santa Fe
          </p>

          <h1 id="hero-title" className="mt-4 font-display text-display-2xl uppercase lg:text-[clamp(4.25rem,0.5rem+6.4vw,6.75rem)]">
            <span className="hero-rise block" style={stagger(1)}>
              Sanguches que
            </span>
            <span className="hero-rise block" style={stagger(2)}>
              valen cada{" "}
              <span className="relative inline-block text-charcoal lg:text-orange-600">
                mordida.
                <Brush name="underline" className="absolute -bottom-1 left-0 h-[0.16em] w-full text-cream lg:text-mustard" />
              </span>
            </span>
          </h1>

          <p
            className="hero-rise mt-5 max-w-[30rem] text-base leading-relaxed text-white sm:mt-6 sm:text-lg lg:text-charcoal/80"
            style={stagger(3)}
          >
            Pan gratinado de 20 cm, milanesas crocantes y hamburguesas smash. Hechos a mano, en el momento.
          </p>

          <div className="hero-enter mt-7 grid grid-cols-2 gap-2.5 sm:mt-8 sm:flex sm:flex-wrap sm:gap-3" style={stagger(4)}>
            <ButtonLink
              href="#menu"
              variant="cream"
              size="lg"
              className="px-4 sm:px-7 lg:bg-orange-600 lg:text-white lg:shadow-cta lg:hover:bg-orange-700"
            >
              Ver menú
              <Icon name="arrowDown" size={18} />
            </ButtonLink>
            <OrderButton variant="action-dark" size="lg" className="px-4 sm:px-7 lg:bg-olive-600 lg:text-white lg:hover:bg-olive-700">
              Pedir ahora
            </OrderButton>
          </div>

          <ul
            className="hero-enter mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.875rem] text-white/90 lg:text-charcoal/80"
            style={stagger(5)}
          >
            <li>
              <OpenStatus tone="hero" />
            </li>
            <li className="inline-flex items-center gap-2">
              <Icon name="scooter" size={18} className="text-cream lg:text-orange-600" />
              Envíos en {siteConfig.delivery.area}
            </li>
          </ul>
        </div>

        <div className="relative -mr-[6vw] -mb-14 sm:mx-auto sm:-mb-20 sm:w-[72%] lg:mr-0 lg:-mb-28 lg:w-auto">
          <Stamp
            spin
            className="absolute top-[-20%] right-[4%] size-20 text-cream/90 min-[460px]:top-0 sm:right-[-6%] sm:size-32 lg:top-[-12%] lg:right-auto lg:left-[2%] lg:size-36 lg:text-orange-600"
          />
          <Image
            src={gulaCutout}
            alt=""
            aria-hidden
            sizes="300px"
            className="hero-product absolute top-[-34%] right-[-6%] hidden w-[34%] rotate-[10deg] lg:block"
          />
          <div aria-hidden className="absolute inset-x-[8%] bottom-[4%] h-[18%] rounded-[50%] bg-black/40 blur-2xl lg:bg-[#4a3418]/35" />
          <Image
            src={milandwichCutout}
            alt="Milandwich de carne recién armado: pan de lomo gratinado, milanesa, queso sardo, rúcula y tomate"
            sizes="(min-width: 1024px) 640px, (min-width: 640px) 72vw, 105vw"
            loading="eager"
            fetchPriority="high"
            className="hero-product relative z-10 w-full -rotate-3"
          />
        </div>
      </div>
    </section>
  );
}
