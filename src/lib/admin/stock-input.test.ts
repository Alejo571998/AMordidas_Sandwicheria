import { describe, expect, it } from "vitest";
import { formatStockInput, parseStockInput } from "./stock-input";

describe("parseStockInput", () => {
  it.each([
    ["", null],
    ["  ", null],
    ["0", 0],
    ["1", 1],
    ["12", 12],
    [" 15 ", 15],
    ["1.000", 1000],
    ["10000", 10000],
  ])("acepta %j → %j", (raw, expected) => {
    expect(parseStockInput(raw)).toEqual({ ok: true, value: expected });
  });

  it.each(["-1", "1,5", "2.5", "abc", "10001", "1e3"])("rechaza %j", (raw) => {
    expect(parseStockInput(raw).ok).toBe(false);
  });

  it("vacío y null van y vuelven", () => {
    expect(formatStockInput(null)).toBe("");
    expect(parseStockInput(formatStockInput(7))).toEqual({ ok: true, value: 7 });
  });
});
