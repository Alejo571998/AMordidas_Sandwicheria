import type { TimeRange } from "@/config/site";

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Minutos desde la medianoche en la zona horaria del local. */
export function localMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

/** Rango abierto en ese minuto (soporta rangos que cruzan la medianoche). */
function containsMinute(range: TimeRange, minute: number): boolean {
  const open = toMinutes(range.open);
  const close = toMinutes(range.close);
  return open <= close ? minute >= open && minute < close : minute >= open || minute < close;
}

export interface OpenStatus {
  open: boolean;
  /** Hora "HH:MM" del próximo cambio: cierre si está abierto, apertura si está cerrado. */
  next: string;
}

export function getOpenStatus(ranges: readonly TimeRange[], date: Date, timeZone: string): OpenStatus {
  const minute = localMinutes(date, timeZone);
  const current = ranges.find((r) => containsMinute(r, minute));
  if (current) return { open: true, next: current.close };

  // Próxima apertura: la más cercana hacia adelante (todos los días abre igual).
  const upcoming = [...ranges]
    .map((r) => ({ r, wait: (toMinutes(r.open) - minute + 1440) % 1440 }))
    .sort((a, b) => a.wait - b.wait)[0];
  return { open: false, next: upcoming.r.open };
}

/** Medianoche de hoy en la zona horaria del negocio, en ISO (para filtrar "lo de hoy" en la base). */
export function startOfLocalDay(timeZone: string, now: Date = new Date()): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, Number(p.value)]),
  ) as Record<string, number>;
  const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const offsetMs = localAsUtc - Math.floor(now.getTime() / 1000) * 1000;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day) - offsetMs).toISOString();
}

/** "10:30 a 17:30 · 19:00 a 00:30" */
export function formatRanges(ranges: readonly TimeRange[]): string {
  return ranges.map((r) => `${r.open} a ${r.close}`).join(" · ");
}
