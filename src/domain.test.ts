import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { products } from "./data";
import {
  addDays,
  availability,
  calculateProfit,
  cartTotals,
  collectVending,
  consumeInventory,
  dateKey,
  freshness,
  giftBundles,
  initialState,
  matchProducts,
  migrate,
  prepareReorder,
  reconcile,
  reserveFuture,
  reserveVending,
  sellable,
  variantPrice,
} from "./domain";
import type { InventoryBatch, ProductOptions } from "./models";
import { demoRepository, type KeyValueStorage } from "./repository";
const NOW = "2026-10-28";
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-28T10:00:00Z"));
});
afterEach(() => vi.useRealTimers());
describe("versioned demo repository", () => {
  it("creates four compartments and the full shared catalog", () => {
    const s = initialState();
    expect(s.schemaVersion).toBe(2);
    expect(s.compartments).toHaveLength(4);
    expect(s.catalog).toHaveLength(186);
    expect(s.compartments.filter((c) => c.status === "available")).toHaveLength(
      3,
    );
  });
  it("migrates old valid carts, orders, preferences and reminders without losing records", () => {
    const s = migrate({
      lang: "ru",
      cart: [{ id: "fp-1", qty: 2, price: 37, note: "card" }],
      orders: [
        {
          id: "old",
          date: NOW,
          total: 74,
          items: [{ id: "fp-1", qty: 2 }],
          method: "pickup",
        },
      ],
      reminders: [
        {
          id: "birthday",
          name: "Demo",
          date: "2026-11-04",
          annual: true,
          event: "0",
          days: 7,
          channel: "email",
        },
      ],
      wishlist: ["fp-1"],
      preferences: { channel: "Telegram", fresh: true },
    });
    expect(s.cart[0].qty).toBe(2);
    expect(s.orders[0].id).toBe("old");
    expect(s.reminders[0].name).toBe("Demo");
    expect(s.preferences.channel).toBe("Telegram");
    expect(s.lang).toBe("ru");
  });
  it("filters unknown product IDs, malformed carts and invalid dates", () => {
    const s = migrate({
      lang: "en",
      cart: [
        { id: "unknown", qty: 1 },
        { id: "fp-1", qty: -1 },
        { id: "fp-1", qty: 1.5 },
        { id: "fp-2", qty: 1 },
      ],
      reminders: [
        {
          id: "x",
          name: "x",
          date: "bad",
          annual: true,
          event: "0",
          days: 7,
          channel: "email",
        },
      ],
    });
    expect(s.cart).toEqual([
      { id: "fp-2", qty: 1, note: "", options: undefined },
    ]);
    expect(s.reminders).toHaveLength(0);
  });
  it("does not let saved data replace authoritative photos or composition", () => {
    const s = migrate({
      schemaVersion: 2,
      catalog: [
        {
          ...products[0],
          photo: "javascript:bad",
          composition: ["bad", "bad", "bad"],
          price: 30,
          name: ["A", "Б", "C"],
        },
      ],
    });
    expect(s.catalog[0].photo).toBe(products[0].photo);
    expect(s.catalog[0].composition).toEqual(products[0].composition);
    expect(s.catalog[0].price).toBe(30);
  });
  it("round trips the complete schema safely", () => {
    const s = initialState();
    s.comparison = ["fp-1", "fp-2"];
    s.costs.price = 42;
    s.secretGifts = [
      {
        id: "g",
        productId: "fp-1",
        recipient: "Demo",
        message: "Hello",
        revealDate: NOW,
        animation: "petals",
        pickup: "pickup",
        code: "SG-123456",
        redeemed: false,
        createdAt: new Date().toISOString(),
      },
    ];
    const migrated = migrate(JSON.parse(JSON.stringify(s)));
    expect(migrated.comparison).toEqual(s.comparison);
    expect(migrated.costs.price).toBe(42);
    expect(migrated.secretGifts).toHaveLength(1);
  });
  it("limits comparison to three distinct IDs", () =>
    expect(
      migrate({ comparison: ["fp-1", "fp-1", "fp-2", "fp-3", "fp-4", "x"] })
        .comparison,
    ).toEqual(["fp-1", "fp-2", "fp-3"]));
  it("uses legacy data if the new stored JSON is corrupt", () => {
    const map = new Map([
      ["flower-paradise-v2", "{bad"],
      [
        "flower-paradise-v1",
        JSON.stringify({ lang: "ru", wishlist: ["fp-2"] }),
      ],
    ]);
    const repo = demoRepository({
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => {
        map.set(k, v);
      },
      removeItem: (k) => {
        map.delete(k);
      },
    });
    expect(repo.load().wishlist).toEqual(["fp-2"]);
    expect(repo.load().lang).toBe("ru");
  });
  it("handles disabled/quota storage and still loads a fresh memory demo", () => {
    const storage: KeyValueStorage = {
      getItem: () => {
        throw Error("disabled");
      },
      setItem: () => {
        throw Error("quota");
      },
      removeItem: () => {
        throw Error("disabled");
      },
    };
    const repo = demoRepository(storage);
    expect(repo.load().schemaVersion).toBe(2);
    expect(repo.save(initialState())).toBe(false);
    expect(() => repo.clear()).not.toThrow();
  });
  it("removes the old schema only after a successful save", () => {
    const map = new Map([["flower-paradise-v1", "{}"]]);
    const repo = demoRepository({
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => {
        map.set(k, v);
      },
      removeItem: (k) => {
        map.delete(k);
      },
    });
    expect(repo.save(initialState())).toBe(true);
    expect(map.has("flower-paradise-v1")).toBe(false);
    repo.clear();
    expect(map.size).toBe(0);
  });
});
describe("pricing and budget guardrails", () => {
  const options: ProductOptions = {
    size: "L",
    color: 1,
    wrapping: "kraft",
    card: true,
    extraGift: true,
    method: "delivery",
  };
  it("uses one variant price for the product and cart", () => {
    const p = products[0];
    expect(variantPrice(p, options)).toBe(61.8);
    const s = initialState();
    s.cart = [{ id: p.id, qty: 2, options }];
    expect(cartTotals(s, "delivery")).toEqual({
      subtotal: 123.6,
      discount: 0,
      delivery: 5,
      total: 128.6,
    });
  });
  it("limits campaign discounts to eligible products and ignores inactive codes", () => {
    const s = initialState();
    s.cart = [
      { id: "fp-1", qty: 1 },
      { id: "fp-2", qty: 1 },
    ];
    s.campaigns = [
      {
        id: "test",
        code: "TEST15",
        percent: 15,
        active: true,
        productIds: ["fp-1"],
      },
    ];
    s.promo = "test15";
    expect(cartTotals(s).discount).toBe(4.8);
    s.campaigns[0].active = false;
    expect(cartTotals(s).discount).toBe(0);
  });
  it("never recommends a bundle over the total budget, including delivery", () => {
    for (const budget of [15, 25, 35, 60, 100]) {
      for (const delivery of [true, false]) {
        for (const extras of [true, false]) {
          const rows = giftBundles(products, budget, delivery, extras);
          expect(rows.every((r) => r.total <= budget && r.remaining >= 0)).toBe(
            true,
          );
        }
      }
    }
  });
  it("offers no bundle for an insufficient budget", () =>
    expect(giftBundles(products, 10, true, true)).toHaveLength(0));
});
describe("freshness, capacity and inventory transactions", () => {
  const sample = (
    assembly: string,
    status: InventoryBatch["status"] = "fresh",
  ): InventoryBatch => ({
    id: "test",
    productId: "fp-1",
    quantity: 2,
    assemblyDate: assembly,
    receivedDate: assembly,
    sellBy: "2026-11-15",
    status,
    location: "studio",
    unitCost: 14,
  });
  const rules = { monitor: 2, discount: 3, remove: 5 };
  it.each([
    ["2026-10-28", "fresh"],
    ["2026-10-26", "monitor"],
    ["2026-10-25", "discount"],
    ["2026-10-23", "remove"],
  ])("classifies %s as %s", (date, status) =>
    expect(freshness(sample(date), rules, NOW)).toBe(status),
  );
  it("never sells removed, discarded or zero-quantity batches", () => {
    expect(sellable(sample(NOW, "remove"), rules, NOW)).toBe(false);
    expect(sellable(sample(NOW, "discarded"), rules, NOW)).toBe(false);
    expect(sellable({ ...sample(NOW), quantity: 0 }, rules, NOW)).toBe(false);
  });
  it("applies sell-by even when age rules would still allow sale", () =>
    expect(
      freshness({ ...sample(NOW), sellBy: "2026-10-27" }, rules, NOW),
    ).toBe("remove"));
  it("does not apply fresh-cut age rules to preserved roses", () =>
    expect(
      freshness({ ...sample("2026-01-01"), productId: "fp-22" }, rules, NOW),
    ).toBe("fresh"));
  it("reserves a slot once and synchronizes immediate availability", () => {
    const s = initialState();
    const first = reserveVending(s, "slot-0")!;
    expect(first.code).toMatch(/^\d{6}$/);
    expect(availability(first.state, "fp-1").immediate).toBe(false);
    expect(reserveVending(first.state, "slot-0")).toBeNull();
  });
  it("collects once, decrements the physical unit and rejects reuse", () => {
    const s = reserveVending(initialState(), "slot-0")!;
    const next = collectVending(s.state, s.code)!;
    expect(next.compartments[0].status).toBe("collected");
    expect(next.batches.find((b) => b.id === "slot-batch-0")?.quantity).toBe(0);
    expect(collectVending(next, s.code)).toBeNull();
  });
  it("rejects expired codes and releases expired reservations on refresh", () => {
    const r = reserveVending(initialState(), "slot-0")!;
    vi.advanceTimersByTime(31 * 60000);
    expect(collectVending(r.state, r.code)).toBeNull();
    const next = reconcile(r.state);
    expect(next.compartments[0].status).toBe("available");
    expect(next.reservations.find((x) => x.code === r.code)?.status).toBe(
      "expired",
    );
  });
  it("does not dispense a bouquet made unsuitable after reservation", () => {
    const r = reserveVending(initialState(), "slot-0")!;
    r.state.batches.find((b) => b.id === "slot-batch-0")!.status = "remove";
    expect(collectVending(r.state, r.code)).toBeNull();
  });
  it("takes sales from earliest-sell-by inventory without changing unrelated batches", () => {
    const s = initialState();
    const before = s.batches.find((b) => b.productId === "fp-2")!.quantity;
    const next = consumeInventory(s, [{ id: "fp-1", qty: 1 }]);
    expect(next.batches.find((b) => b.id === "batch-fp-1")!.quantity).toBe(
      s.batches.find((b) => b.id === "batch-fp-1")!.quantity - 1,
    );
    expect(next.batches.find((b) => b.productId === "fp-2")!.quantity).toBe(
      before,
    );
  });
  it("prevents future conflicts and allocates a studio unit", () => {
    const s = initialState();
    const input = {
      product: "fp-1",
      date: "2026-11-01",
      time: "12:00",
      method: "vending",
      message: "Demo",
    };
    const r = reserveFuture(s, input);
    expect("state" in r).toBe(true);
    if (!("state" in r)) return;
    expect(availability(r.state, "fp-1").studio).toBe(
      availability(s, "fp-1").studio - 1,
    );
    expect(reserveFuture(r.state, input)).toEqual({ error: "conflict" });
  });
  it("rejects past reservations and nonexistent inventory", () => {
    const s = initialState();
    expect(
      reserveFuture(s, {
        product: "fp-1",
        date: NOW,
        time: "12:00",
        method: "vending",
        message: "",
      }),
    ).toEqual({ error: "date" });
    s.batches = s.batches.map((b) => ({ ...b, quantity: 0 }));
    expect(
      reserveFuture(s, {
        product: "fp-1",
        date: "2026-11-01",
        time: "12:00",
        method: "vending",
        message: "",
      }),
    ).toEqual({ error: "unavailable" });
  });
  it("restores current variant prices while preserving options and rejecting unavailable products", () => {
    const s = initialState();
    s.catalog[0] = { ...s.catalog[0], price: 40 };
    const options: ProductOptions = {
      size: "L",
      color: 1,
      wrapping: "rose",
      card: true,
      extraGift: false,
      method: "pickup",
    };
    const r = prepareReorder(s, [
      { id: "fp-1", qty: 1, price: 20, options },
      { id: "missing", qty: 1 },
    ]);
    expect(r.added).toBe(1);
    expect(r.cart[0].price).toBe(61);
    expect(r.cart[0].options).toEqual(options);
    expect(r.unavailable).toEqual(["missing"]);
  });
});
describe("transparent Flower Match", () => {
  it("returns three ranked bouquets under budget with explanation reasons", () => {
    const r = matchProducts(initialState(), {
      recipient: "friend",
      occasion: 0,
      budget: 50,
      color: 0,
      style: "all",
      avoid: "",
      immediate: false,
    });
    expect(r).toHaveLength(3);
    expect(
      r.every((x) => x.product.price <= 50 && x.reasons.includes("budget")),
    ).toBe(true);
    expect(r[0].score).toBeGreaterThanOrEqual(r[1].score);
  });
  it("excludes unwanted stems in all supported languages", () => {
    for (const avoid of ["roses", "розы", "rozes"])
      expect(
        matchProducts(initialState(), {
          recipient: "friend",
          occasion: 0,
          budget: 150,
          color: -1,
          style: "all",
          avoid,
          immediate: false,
        }).every(
          (x) =>
            !x.product.composition.some((c) => c.toLowerCase().includes(avoid)),
        ),
      ).toBe(true);
  });
  it("limits immediate recommendations to available compartments", () => {
    const s = initialState();
    const r = matchProducts(s, {
      recipient: "friend",
      occasion: 0,
      budget: 150,
      color: -1,
      style: "all",
      avoid: "",
      immediate: true,
    });
    expect(r.every((x) => availability(s, x.product.id).immediate)).toBe(true);
    expect(r).toHaveLength(3);
  });
});
describe("editable financial assumptions", () => {
  it("matches the stated €35 / €19 / €500 reference scenario", () => {
    const r = calculateProfit(initialState().costs);
    expect(r.revenue).toBe(4200);
    expect(r.variable).toBe(2280);
    expect(r.fixed).toBe(500);
    expect(r.profit).toBe(1420);
    expect(r.breakEven).toBe(32);
    expect(r.payback).toBe(8.87);
  });
  it("caps demand at four slots times replenishments", () => {
    const r = calculateProfit({
      ...initialState().costs,
      dailySales: 20,
      restocksPerDay: 1,
    });
    expect(r.capacity).toBe(8);
    expect(r.daily).toBe(8);
    expect(r.lostDailySales).toBe(12);
    expect(r.restocksNeeded).toBe(1);
  });
  it("accounts for spoilage, payment fees and recorded waste separately", () => {
    const c = {
      ...initialState().costs,
      spoilagePercent: 20,
      feePercent: 2,
      useRecordedWaste: true,
    };
    const r = calculateProfit(c, 28);
    expect(r.unitVariable).toBe(24.45);
    expect(r.variable).toBe(2962);
    expect(r.profit).toBe(738);
  });
  it("reports no payback and no feasible break-even for a negative contribution margin", () => {
    const r = calculateProfit({ ...initialState().costs, price: 10 });
    expect(r.margin).toBe(-9);
    expect(r.breakEven).toBeNull();
    expect(r.payback).toBeNull();
  });
  it("does not double count the machine in startup budget and applies grant funding", () => {
    const r = calculateProfit({ ...initialState().costs, grant: 5000 });
    expect(r.investment).toBe(7600);
    expect(r.payback).toBe(5.35);
  });
  it("handles zero operating days and extreme allowed spoilage without NaN", () => {
    const r = calculateProfit({
      ...initialState().costs,
      days: 0,
      spoilagePercent: 95,
    });
    expect(r.revenue).toBe(0);
    expect(r.profit).toBe(-500);
    expect(Number.isFinite(r.unitVariable)).toBe(true);
    expect(r.payback).toBeNull();
  });
});
describe("Riga calendar dates", () => {
  it("uses Riga time at UTC date boundaries", () =>
    expect(dateKey(new Date("2026-10-28T22:30:00Z"))).toBe("2026-10-29"));
  it("adds calendar days across month and year boundaries", () => {
    expect(addDays(1, "2026-12-31")).toBe("2027-01-01");
    expect(addDays(1, "2028-02-28")).toBe("2028-02-29");
  });
});
