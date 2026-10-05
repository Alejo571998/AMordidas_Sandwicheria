"use client";

import { useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";
import { getOpenStatus } from "@/lib/hours";
import { cn } from "@/lib/format";

const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
};
const currentMinute = () => Math.floor(Date.now() / 60_000);

const tones = {
  dark: "bg-cream/10 text-cream",
  light: "bg-charcoal/6 text-charcoal",
  /** Naranja en mobile, marfil en desktop. */
  hero: "bg-white/15 text-white lg:bg-charcoal/6 lg:text-charcoal",
} as const;

/** "Abierto ahora · hasta 17:00" / "Cerrado · abrimos 19:00". Se calcula en el navegador, en hora de Santa Fe. */
export function OpenStatus({ tone = "dark", className }: { tone?: keyof typeof tones; className?: string }) {
  const minute = useSyncExternalStore(subscribe, currentMinute, () => null);
  if (minute === null) return <span className={cn("inline-block h-7 w-44", className)} aria-hidden />;

  const status = getOpenStatus(siteConfig.hours.ranges, new Date(minute * 60_000), siteConfig.hours.timeZone);
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full px-3 text-[0.75rem] font-bold",
        tones[tone],
        className,
      )}
    >
      <span className="relative flex size-2">
        {status.open ? (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7bd88f] opacity-60 motion-reduce:hidden" />
        ) : null}
        <span className={cn("relative inline-flex size-2 rounded-full", status.open ? "bg-[#5cc272]" : tone === "hero" ? "bg-charcoal lg:bg-orange-600" : "bg-orange-400")} />
      </span>
      {status.open ? `Abierto ahora · hasta las ${status.next}` : `Cerrado · abrimos a las ${status.next}`}
    </span>
  );
}
