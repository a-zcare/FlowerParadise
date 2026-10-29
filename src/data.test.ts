import { describe, expect, it } from "vitest";
import {
  categories,
  flowerProducts,
  conflict,
  discounted,
  estimate,
  nextEvent,
  photos,
  pick,
  products,
} from "./data";
describe("catalog integrity", () => {
  it("has 36 unique products and images across all collections", () => {
    expect(flowerProducts).toHaveLength(36);
    expect(products).toHaveLength(186);
    expect(new Set(products.map((p) => p.id)).size).toBe(186);
    expect(new Set(photos).size).toBe(36);
    expect(new Set(products.map((p) => p.category)).size).toBe(
      categories.length,
    );
  });
  it("has three complete translations and sensible prices", () => {
    for (const p of products) {
      expect(p.name).toHaveLength(3);
      p.name.forEach((n) => expect(n.length).toBeGreaterThan(3));
      expect(p.composition).toHaveLength(3);
      expect(p.price).toBeGreaterThan(0);
      expect(p.stock).toBeGreaterThanOrEqual(0);
    }
  });
  it("selects Latvian, Russian and English independently", () => {
    expect(pick(["lv", "ru", "en"], "lv")).toBe("lv");
    expect(pick(["lv", "ru", "en"], "ru")).toBe("ru");
    expect(pick(["lv", "ru", "en"], "en")).toBe("en");
  });
});
describe("demo pricing", () => {
  it("sums selected bouquet options", () => {
    expect(estimate(35, true, true, 8)).toBe(60);
    expect(estimate(25, false, false, 0)).toBe(25);
  });
  it("applies only the supported promo with currency rounding", () => {
    expect(discounted(74, " bloom10 ")).toBe(66.6);
    expect(discounted(74, "UNKNOWN")).toBe(74);
    expect(discounted(12.99, "BLOOM10")).toBe(11.69);
  });
});
describe("reservation availability", () => {
  const rows = [{ date: "2027-01-01", time: "12:00", method: "vending" }];
  it("blocks the same local fulfilment slot", () =>
    expect(conflict(rows, "2027-01-01", "12:00", "vending")).toBe(true));
  it("permits other times and methods", () => {
    expect(conflict(rows, "2027-01-01", "15:00", "vending")).toBe(false);
    expect(conflict(rows, "2027-01-01", "12:00", "delivery")).toBe(false);
  });
});
describe("annual reminders", () => {
  it("rolls past annual dates into the next year", () =>
    expect(
      nextEvent(
        "2020-02-14",
        true,
        new Date("2026-10-28T12:00:00Z"),
      ).getFullYear(),
    ).toBe(2027));
  it("keeps upcoming annual dates in this year", () =>
    expect(
      nextEvent(
        "2020-12-25",
        true,
        new Date("2026-10-28T12:00:00Z"),
      ).getFullYear(),
    ).toBe(2026));
  it("does not change non-recurring dates", () =>
    expect(
      nextEvent("2020-02-14", false, new Date("2026-10-28")).getFullYear(),
    ).toBe(2020));
});
