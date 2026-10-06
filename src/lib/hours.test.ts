import { describe, expect, it } from "vitest";
import { formatRanges, getOpenStatus, localMinutes, startOfLocalDay } from "./hours";

const TZ = "America/Argentina/Cordoba"; // UTC-3, sin horario de verano
const ranges = [
  { open: "10:30", close: "17:30" },
  { open: "19:00", close: "00:30" },
];
/** Fecha a una hora local de Santa Fe (UTC-3). */
const at = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(2026, 9, 4, h + 3, m));
};

describe("horarios", () => {
  it("convierte a hora local de Santa Fe", () => {
    expect(localMinutes(at("11:15"), TZ)).toBe(11 * 60 + 15);
  });

  it.each([
    ["10:29", false, "10:30"],
    ["10:30", true, "17:30"],
    ["17:29", true, "17:30"],
    ["17:30", false, "19:00"],
    ["18:59", false, "19:00"],
    ["21:00", true, "00:30"],
    ["00:15", true, "00:30"],
    ["00:30", false, "10:30"],
    ["03:00", false, "10:30"],
  ])("a las %s → abierto=%s, próximo cambio %s", (time, open, next) => {
    expect(getOpenStatus(ranges, at(time), TZ)).toEqual({ open, next });
  });

  it("formatea los rangos", () => {
    expect(formatRanges(ranges)).toBe("10:30 a 17:30 · 19:00 a 00:30");
  });
});

describe("startOfLocalDay", () => {
  const tz = "America/Argentina/Cordoba";

  it("a las 23:00 de Santa Fe todavía es el mismo día", () => {
    // 5/10 02:00 UTC = 4/10 23:00 en Argentina
    expect(startOfLocalDay(tz, new Date("2026-10-05T02:00:00Z"))).toBe("2026-10-04T03:00:00.000Z");
  });

  it("después de medianoche ya es el día siguiente", () => {
    // 5/10 03:30 UTC = 5/10 00:30 en Argentina
    expect(startOfLocalDay(tz, new Date("2026-10-05T03:30:00Z"))).toBe("2026-10-05T03:00:00.000Z");
  });
});
