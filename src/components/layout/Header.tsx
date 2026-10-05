"use client";

import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/brand/Brand";
import { OrderButton } from "@/components/cart/OrderButton";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { formatRanges } from "@/lib/hours";
import { cn } from "@/lib/format";
import { buildWhatsAppUrl, contactMessages } from "@/lib/whatsapp";
import { OpenStatus } from "./OpenStatus";

const navItems = [
  { href: "#inicio", label: "Inicio" },
  { href: "#menu", label: "Menú" },
  { href: "#historia", label: "Nuestra historia" },
  { href: "#contacto", label: "Contacto" },
];
const mobileItems = [...navItems.slice(0, 3), { href: "#como-pedir", label: "Cómo pedir" }, navItems[3]];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#inicio");
  const sheetRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = mobileItems
      .map((i) => document.querySelector<HTMLElement>(i.href))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const closeSheet = () => sheetRef.current?.close();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-[var(--header-h)] bg-orange-600 text-white transition-shadow duration-300",
        "lg:border-b lg:border-charcoal/8 lg:bg-cream/95 lg:text-charcoal lg:backdrop-blur-md",
        scrolled && "shadow-[0_10px_30px_-18px_rgb(20_20_10/0.6)]",
      )}
    >
      <div className="container-page flex h-full items-center gap-4">
        <a href="#inicio" className="group -m-1 flex flex-col items-start gap-0.5 rounded-sm p-1" aria-label={`${siteConfig.name} ${siteConfig.tagline} — inicio`}>
          <Wordmark className="h-7 text-white transition-transform duration-300 group-hover:-rotate-2 lg:h-8 lg:text-charcoal" label="" />
          <span aria-hidden className="flex w-full items-center gap-1.5 pl-1 text-[0.5625rem] font-bold tracking-[0.32em] whitespace-nowrap text-cream max-[359px]:tracking-[0.2em] lg:text-orange-600">
            <span className="h-px flex-1 bg-current opacity-50" />
            DELI HOUSE
            <span className="h-px flex-1 bg-current opacity-50" />
          </span>
        </a>

        <nav aria-label="Principal" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={active === item.href ? "location" : undefined}
                  className={cn(
                    "relative inline-flex h-11 items-center px-4 text-[0.8125rem] font-bold tracking-[0.1em] uppercase transition-colors",
                    "after:absolute after:inset-x-4 after:bottom-2 after:h-0.5 after:origin-left after:scale-x-0 after:bg-orange-600 after:transition-transform after:duration-300",
                    "hover:text-orange-600 hover:after:scale-x-100",
                    active === item.href && "text-orange-600 after:scale-x-100",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <OrderButton variant="action-dark" size="sm" showCount className="h-11 px-5 max-[359px]:px-4 lg:bg-olive-600 lg:text-white lg:hover:bg-olive-700">
            Pedir
          </OrderButton>
          <button
            type="button"
            onClick={() => sheetRef.current?.showModal()}
            className="grid size-11 place-items-center rounded-full text-white hover:bg-white/15 lg:hidden"
            aria-label="Abrir menú de navegación"
            aria-haspopup="dialog"
          >
            <Icon name="menu" size={26} />
          </button>
        </div>
      </div>

      <dialog ref={sheetRef} className="sheet focus-on-dark bg-grain lg:hidden" aria-label="Menú de navegación">
        <div className="flex h-full flex-col">
          <div className="container-page flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <Wordmark className="h-7 text-cream" />
            <button
              type="button"
              onClick={closeSheet}
              className="grid size-11 place-items-center rounded-full bg-cream/10 hover:bg-cream hover:text-olive-900"
              aria-label="Cerrar menú"
            >
              <Icon name="close" size={24} />
            </button>
          </div>
          <nav aria-label="Principal (mobile)" className="container-page flex-1 overflow-y-auto pt-6">
            <ul>
              {mobileItems.map((item, i) => (
                <li key={item.href} className="border-b border-cream/10">
                  <a
                    href={item.href}
                    onClick={closeSheet}
                    aria-current={active === item.href ? "location" : undefined}
                    className="flex items-center justify-between py-4 font-display text-[2.75rem] leading-none hover:text-mustard aria-[current]:text-mustard"
                  >
                    <span>
                      <span className="mr-3 align-top font-sans text-[0.75rem] font-bold tracking-[0.1em] text-cream/40">
                        0{i + 1}
                      </span>
                      {item.label}
                    </span>
                    <Icon name="arrowRight" size={22} className="text-cream/40" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-3 pb-8 text-[0.9375rem] text-cream/80">
              <OpenStatus />
              <p className="flex items-center gap-2">
                <Icon name="clock" size={18} className="text-mustard" />
                Todos los días · {formatRanges(siteConfig.hours.ranges)}
              </p>
              <p className="flex items-center gap-2">
                <Icon name="scooter" size={18} className="text-mustard" />
                Envíos en {siteConfig.delivery.area} y retiro
              </p>
            </div>
          </nav>
          <div className="container-page grid shrink-0 grid-cols-2 gap-2 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <ButtonLink href="#menu" onClick={closeSheet} size="lg">
              Ver menú
            </ButtonLink>
            <ButtonLink
              href={buildWhatsAppUrl(contactMessages.general)}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline-light"
              size="lg"
            >
              <Icon name="whatsapp" size={18} />
              Consultar
            </ButtonLink>
          </div>
        </div>
      </dialog>
    </header>
  );
}
