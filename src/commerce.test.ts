import { describe, it, expect } from "vitest";
import { products, flowerProducts, type Product } from "./data";
import { appendCart } from "./commerce-cart";
import {
  calendarErrors,
  commerceDefaults,
  defaultDesign,
  defaultWrapping,
  designPrice,
  isVisible,
  materialCost,
  migrateCommerce,
  readSharedWishlist,
  recommendChristmas,
  shareWishlist,
  slotIssue,
  validDesign,
  wrappingPrice,
  rigaClock,
} from "./commerce";
import { initialState, migrate, variantPrice, cartTotals } from "./domain";
import { exportProductCsv, previewProductCsv, readCsv } from "./product-csv";
const images = new Set(products.map((p) => p.photo));
describe("complete seasonal catalog", () => {
  it("preserves flower IDs and provides eight category minimums plus seven physical calendars", () => {
    expect(flowerProducts.map((p) => p.id)).toEqual(
      Array.from({ length: 36 }, (_, i) => `fp-${i + 1}`),
    );
    expect(products.length).toBe(193);
    expect(new Set(products.map((p) => p.id)).size).toBe(193);
    for (let c = 12; c < 20; c++)
      expect(products.filter((p) => p.category === c).length).toBe(
        c < 18 ? 20 : 15,
      );
    expect(products.filter((p) => p.category === 20)).toHaveLength(7);
  });
  it("provides localized unique names, preparation rules, dimensions and images", () => {
    for (let l = 0; l < 3; l++)
      expect(
        new Set(products.filter((p) => p.seasonal).map((p) => p.name[l])).size,
      ).toBe(157);
    for (const p of products.filter((p) => p.seasonal)) {
      expect(p.seasonal!.preparationDays).toBeGreaterThanOrEqual(0);
      expect(p.seasonal!.materials.every((t) => t.length > 10)).toBe(true);
      expect(p.size).toMatch(/cm/);
      expect(p.seasonal!.variants.length).toBeGreaterThan(0);
    }
  });
});
describe("one authoritative configuration quote", () => {
  it("itemizes wrapping without hidden discounts", () => {
    const w = defaultWrapping();
    expect(wrappingPrice(w)).toBe(8);
    expect(
      wrappingPrice({
        ...w,
        size: "large",
        ribbonStyle: "velvet",
        seal: true,
        accessories: true,
      }),
    ).toBe(16);
  });
  it("cart totals use the same component quote including quantities", () => {
    const s = initialState("2026-10-29");
    const configuration = {
      ...defaultDesign(),
      wrapping: defaultWrapping(),
      extras: [
        { id: "tea", qty: 3 },
        { id: "chocolate", qty: 2 },
      ],
    };
    const options = {
      size: "M" as const,
      color: 3,
      wrapping: "kraft" as const,
      card: true,
      extraGift: false,
      method: "pickup" as const,
      configuration,
    };
    const p = s.catalog.find((p) => p.id === "xm-076")!;
    const cart = appendCart(s, [{ id: p.id, qty: 2, options }])!;
    expect(cart[0].price).toBe(p.price + 8 + 3 + 6 + 5);
    expect(cartTotals({ ...s, cart }).subtotal).toBe(
      variantPrice(p, options) * 2,
    );
  });
  it("rejects a whole bundle when a single product exceeds stock", () => {
    const s = initialState("2026-10-29");
    expect(
      appendCart(s, [
        { id: "xm-076", qty: 1 },
        { id: "xm-077", qty: 6 },
      ]),
    ).toBeNull();
    expect(s.cart).toHaveLength(0);
  });
  it("checks repeated product quantities across all added lines", () => {
    const s = initialState();
    expect(
      appendCart(s, [
        { id: "xm-076", qty: 3 },
        { id: "xm-076", qty: 3 },
      ]),
    ).toBeNull();
  });
  it("rejects archived products in discovery and cart", () => {
    const s = initialState();
    s.commerce.productMeta["xm-076"] = {
      status: "archived",
      visible: true,
      seasonal: true,
    };
    expect(
      isVisible(s.catalog.find((p) => p.id === "xm-076")!, s.commerce),
    ).toBe(false);
    expect(appendCart(s, [{ id: "xm-076", qty: 1 }])).toBeNull();
  });
  it("rejects invalid wrapping CSS and unbounded component quantities", () => {
    expect(
      validDesign({ ...defaultDesign(), extras: [{ id: "tea", qty: 1000 }] }),
    ).toBe(false);
    expect(
      validDesign({
        ...defaultDesign(),
        wrapping: { ...defaultWrapping(), color: "url(evil)" },
      }),
    ).toBe(false);
  });
  it("preserves drafts, configured prices and customer preferences through migration", () => {
    const s = initialState("2026-10-29");
    s.commerce.drafts.gift = {
      ...defaultDesign(),
      card: true,
      message: "Christmas Demo",
      lines: [{ id: "xm-076", qty: 2 }],
      wrapping: defaultWrapping(),
    };
    s.lang = "ru";
    s.wishlist = ["xm-101"];
    const next = migrate(JSON.parse(JSON.stringify(s)), "2026-10-29");
    expect(next.commerce.drafts.gift).toEqual(s.commerce.drafts.gift);
    expect(next.wishlist).toEqual(s.wishlist);
    expect(next.lang).toBe("ru");
  });
});
describe("wreath and physical calendar rules", () => {
  it("quotes wreath decorations and LED candles through shared pricing", () => {
    const c = defaultDesign("wreath");
    expect(designPrice(c)).toBe(0);
    c.wreath = {
      type: 2,
      greenery: 1,
      candles: 2,
      decorations: [0, 1, 7],
      color: 1,
    };
    expect(designPrice(c)).toBe(17);
  });
  it("requires 24 filled compatible compartments", () => {
    const days = Array.from({ length: 24 }, () => ({
      content: "tea",
      message: "",
    }));
    expect(calendarErrors(days)).toEqual([]);
    expect(calendarErrors(days.slice(1))).toContain("24");
    days[0] = { content: "toy", message: "" };
    expect(calendarErrors(days, "medium")).toContain("1");
    expect(calendarErrors(days, "large")).toEqual([]);
    days[1] = { content: "note", message: "" };
    expect(calendarErrors(days, "large")).toContain("2");
  });
  it("counts every filled day in the budget", () => {
    const c = defaultDesign("calendar");
    c.days = Array.from({ length: 24 }, () => ({
      content: "chocolate",
      message: "",
    }));
    expect(designPrice(c)).toBe(72);
  });
});
describe("wishlists and deterministic recommendations", () => {
  it("shares an immutable bounded ID snapshot without device synchronization", () => {
    const link = shareWishlist("Christmas", ["xm-001", "xm-001", "xm-076"]);
    expect(readSharedWishlist(link, products)).toEqual({
      name: "Christmas",
      items: ["xm-001", "xm-076"],
    });
    expect(() =>
      readSharedWishlist(
        encodeURIComponent(
          JSON.stringify({ v: 1, name: "a", ids: ["unknown"] }),
        ),
        products,
      ),
    ).toThrow();
    expect(() => readSharedWishlist("x".repeat(3501), products)).toThrow();
  });
  it("returns six explainable personalized choices within budget", () => {
    const r = recommendChristmas(products, {
      recipient: "parents",
      age: "adult",
      budget: 70,
      style: "natural",
      type: "all",
      personal: true,
      needed: "planned",
    });
    expect(r.length).toBe(6);
    expect(
      r.every(
        (x) =>
          x.product.price <= 70 &&
          x.product.customizable &&
          x.reasons.includes("budget"),
      ),
    ).toBe(true);
    expect(r).toEqual(
      recommendChristmas(products, {
        recipient: "parents",
        age: "adult",
        budget: 70,
        style: "natural",
        type: "all",
        personal: true,
        needed: "planned",
      }),
    );
  });
});
describe("Latvia seasonal slot constraints", () => {
  const config = commerceDefaults().slots;
  it("uses Riga calendar dates across the UTC boundary", () => {
    expect(rigaClock(new Date("2026-12-23T22:30:00Z")).date).toBe("2026-12-24");
  });
  it("enforces preparation cutoff in Riga time", () => {
    expect(
      slotIssue(
        "2026-12-24",
        "09:00–12:00",
        1,
        2,
        config,
        [],
        new Date("2026-12-22T15:59:00Z"),
      ),
    ).toBe("");
    expect(
      slotIssue(
        "2026-12-24",
        "09:00–12:00",
        1,
        2,
        config,
        [],
        new Date("2026-12-22T16:00:00Z"),
      ),
    ).toBe("cutoff");
  });
  it("rejects closed dates, overcapacity and invalid holiday dates", () => {
    expect(
      slotIssue(
        "2026-12-24",
        "09:00–12:00",
        1,
        1,
        { ...config, closed: ["2026-12-24"] },
        [],
        new Date("2026-10-29"),
      ),
    ).toBe("closed");
    expect(
      slotIssue(
        "2026-12-24",
        "09:00–12:00",
        3,
        1,
        { ...config, capacity: 4 },
        [
          {
            date: "2026-12-24",
            time: "09:00",
            quantity: 2,
            status: "reserved",
          },
        ],
        new Date("2026-10-29"),
      ),
    ).toBe("capacity");
    expect(
      slotIssue(
        "2026-12-27",
        "09:00–12:00",
        1,
        1,
        config,
        [],
        new Date("2026-10-29"),
      ),
    ).toBe("invalid");
  });
});
describe("safe CSV and admin persistence", () => {
  it("roundtrips translated multiline and quoted catalog data", () => {
    const p = {
      ...products[0],
      name: ["=SUM(A1)", 'Пример, "цитата"', "Line\nTwo"],
    } as Product;
    const csv = exportProductCsv([p], {});
    expect(csv).toContain("'=SUM");
    const result = previewProductCsv(csv, products, images);
    expect(result.errors).toEqual([]);
    expect(result.rows[0].product.name).toEqual(p.name);
  });
  it("rejects duplicate IDs and malformed CSV before any mutation", () => {
    const csv = exportProductCsv([products[0], products[0]], {});
    expect(previewProductCsv(csv, products, images).errors.join()).toContain(
      "duplicate",
    );
    expect(() => readCsv('"broken')).toThrow();
    expect(products[0].price).toBe(32);
  });
  it("requires explicit safe IDs for new records and known image assets", () => {
    const custom = { ...products[36], id: "demo-new" };
    expect(
      previewProductCsv(exportProductCsv([custom], {}), products, images)
        .rows[0].action,
    ).toBe("create");
    expect(
      previewProductCsv(
        exportProductCsv([{ ...custom, photo: "missing" }], {}),
        products,
        images,
      ).errors.join(),
    ).toContain("image");
  });
  it("persists new products, edited metadata and reversible archival", () => {
    const s = initialState("2026-10-29");
    const custom = {
      ...structuredClone(s.catalog[36]),
      id: "demo-new",
      stock: 0,
    };
    s.catalog.push(custom);
    s.commerce.customProducts = [custom];
    s.commerce.edits["xm-001"] = { ...s.catalog[36], price: 88 };
    s.commerce.productMeta["xm-001"] = {
      status: "research",
      visible: false,
      seasonal: true,
    };
    s.commerce.deleted = ["demo-new"];
    const next = migrate(JSON.parse(JSON.stringify(s)), "2026-10-29");
    expect(next.catalog.find((p) => p.id === "demo-new")).toBeTruthy();
    expect(next.catalog.find((p) => p.id === "xm-001")!.price).toBe(88);
    expect(next.commerce.productMeta["xm-001"].status).toBe("research");
    expect(isVisible(custom, next.commerce)).toBe(false);
  });
  it("calculates material assumptions independently from retail prices", () => {
    const p = products.find((p) => p.id === "xm-001")!;
    expect(materialCost(p, commerceDefaults().materialPrices)).toBe(17);
    expect(
      migrateCommerce({ materialPrices: { greenery: -5 } }).materialPrices
        .greenery,
    ).toBe(8);
  });
});
