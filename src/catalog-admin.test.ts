import { describe, expect, it } from "vitest";
import { products } from "./data";
import { parseCatalogEdits } from "./catalog-admin";
import { initialState, migrate } from "./domain";
describe("catalog updates", () => {
  const row = {
    id: "xm-150",
    name: ["Vārds", "Название", "Name"],
    price: 25.555,
  };
  it("accepts known translated products and rounds currency", () => {
    expect(parseCatalogEdits(JSON.stringify([row]), products)[0].price).toBe(
      25.56,
    );
  });
  it.each([
    [row, row],
    [{ ...row, id: "unknown" }],
    [{ ...row, price: 0 }],
    [{ ...row, price: 501 }],
    [{ ...row, name: ["a"] }],
    [{ ...row, name: ["a", "", "c"] }],
    [],
    {},
  ])("rejects invalid batches atomically: %j", (rows) => {
    expect(() => parseCatalogEdits(JSON.stringify(rows), products)).toThrow();
  });
  it("adds new catalog inventory without restoring consumed legacy inventory", () => {
    const old = initialState("2026-10-29");
    old.catalog = old.catalog.filter(
      (p) => !/^xm-1(?:1[3-9]|[2-5][0-9])$/.test(p.id),
    );
    old.batches = old.batches.filter((b) =>
      old.catalog.some((p) => p.id === b.productId),
    );
    old.batches.find((b) => b.productId === "xm-001")!.quantity = 0;
    const next = migrate(old, "2026-10-29");
    expect(next.catalog.length).toBe(193);
    expect(next.batches.find((b) => b.productId === "xm-001")!.quantity).toBe(
      0,
    );
    expect(next.batches.find((b) => b.productId === "xm-150")!.quantity).toBe(
      5,
    );
  });
  it("preserves 24 custom calendar messages and scheduled options on refresh", () => {
    const s = initialState("2026-10-29");
    const note = Array.from(
      { length: 24 },
      (_, i) => `${i + 1}: Personal Christmas activity ${i + 1}`,
    ).join(" · ");
    s.cart = [
      {
        id: "xm-150",
        qty: 1,
        note,
        options: {
          size: "L",
          color: 3,
          wrapping: "kraft",
          card: true,
          extraGift: false,
          method: "pickup",
          date: "2026-12-01",
          locationId: "dvp-studio",
        },
      },
    ];
    const next = migrate(s, "2026-10-29");
    expect(next.cart[0].note).toBe(note);
    expect(next.cart[0].options).toEqual(s.cart[0].options);
  });
});
