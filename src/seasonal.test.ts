import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { products, flowerProducts, pick, type Lang } from "./data";
import { holidayProducts } from "./holiday";
import { filterCatalog } from "./catalog";
import { themes, themeTokens, themeById } from "./themes";
import {
  migrateSeasonal,
  seasonalDefaults,
  notificationTemplates,
} from "./seasonal-state";
import {
  initialState,
  reconcile,
  migrate,
  reserveFuture,
  availability,
  freshness,
} from "./domain";
const f = {
  scope: "holiday" as const,
  query: "",
  category: "",
  occasion: "",
  color: "",
  max: 500,
};
const now = "2026-10-28";
describe("Christmas catalog and preservation", () => {
  it("preserves 36 flower records and adds 150 distinct holiday products across nine collections", () => {
    expect(flowerProducts).toHaveLength(36);
    expect(holidayProducts).toHaveLength(150);
    expect(products).toHaveLength(186);
    expect(new Set(products.map((p) => p.id)).size).toBe(186);
    expect(new Set(holidayProducts.map((p) => p.name[2])).size).toBe(150);
    expect(
      Array.from(
        { length: 9 },
        (_, g) => holidayProducts.filter((p) => p.category === 12 + g).length,
      ),
    ).toEqual([19, 19, 19, 19, 19, 20, 14, 14, 7]);
  });
  it("supplies all translations, care, safety, materials and images with honest labels", () => {
    for (const p of holidayProducts) {
      for (const l of ["lv", "ru", "en"] as Lang[]) {
        expect(pick(p.name, l).length).toBeGreaterThan(5);
        expect(pick(p.description, l).length).toBeGreaterThan(60);
        expect(pick(p.care, l).length).toBeGreaterThan(20);
        expect(pick(p.seasonal!.safety, l).length).toBeGreaterThan(40);
      }
      expect(p.seasonal!.materialTags.length).toBeGreaterThan(0);
      expect(
        p.seasonal!.related.every((id) => products.some((p) => p.id === id)),
      ).toBe(true);
      for (const size of ["", "-large"]) {
        const path = `public/images/${p.photo}${size}.webp`;
        expect(existsSync(path), path).toBe(true);
        expect(readFileSync(path).byteLength, path).toBeGreaterThan(200);
      }
      expect(p.price).toBeGreaterThanOrEqual(9);
      expect(p.availabilityType).toBe("preorder");
    }
  });
  it("filters holiday and regular flowers through one catalog function", () => {
    expect(filterCatalog(products, f, "en")).toHaveLength(150);
    expect(
      filterCatalog(products, { ...f, scope: "flowers" }, "en"),
    ).toHaveLength(36);
    expect(
      filterCatalog(products, { ...f, category: "12" }, "ru"),
    ).toHaveLength(19);
    expect(
      filterCatalog(products, { ...f, query: "rūķis" }, "lv").length,
    ).toBeGreaterThan(0);
    expect(
      filterCatalog(products, { ...f, recipient: "teachers" }, "en").every(
        (p) => p.seasonal!.recipients.includes("teachers"),
      ),
    ).toBe(true);
    expect(
      filterCatalog(
        products,
        { ...f, personalizable: true, material: "wood", max: 70 },
        "en",
      ).every(
        (p) =>
          p.customizable &&
          p.seasonal!.materialTags.includes("wood") &&
          p.price <= 70,
      ),
    ).toBe(true);
  });
  it("gives perishable winter greenery freshness rules while keeping textile decorations durable", () => {
    const s = initialState(now);
    const bear = s.batches.find((b) => b.productId === "xm-001")!;
    const gnome = s.batches.find((b) => b.productId === "xm-031")!;
    expect(
      freshness({ ...bear, assemblyDate: "2026-10-20" }, s.freshnessRules, now),
    ).toBe("remove");
    expect(
      freshness(
        { ...gnome, assemblyDate: "2026-10-20" },
        s.freshnessRules,
        now,
      ),
    ).toBe("fresh");
  });
  it("reserves the requested preorder quantity and rejects over-allocation", () => {
    const s = initialState(now);
    const result = reserveFuture(
      s,
      {
        product: "xm-031",
        quantity: 3,
        wrapping: "ivory",
        date: "2026-12-15",
        time: "12:00",
        method: "pickup",
        message: "Demo",
      },
      now,
    );
    expect("state" in result).toBe(true);
    if ("state" in result) {
      expect(availability(result.state, "xm-031", now).studio).toBe(2);
      expect(
        reserveFuture(
          result.state,
          {
            product: "xm-031",
            quantity: 3,
            date: "2026-12-16",
            time: "12:00",
            method: "pickup",
            message: "",
          },
          now,
        ),
      ).toEqual({ error: "unavailable" });
      expect(
        migrate(result.state, now).reservations.find(
          (r) => r.product === "xm-031",
        )?.quantity,
      ).toBe(3);
    }
  });
});
describe("Theme registry", () => {
  it("contains Original and fourteen distinct themes with structural variation", () => {
    expect(themes).toHaveLength(15);
    expect(themeById("missing").id).toBe("original");
    expect(new Set(themes.map((t) => t.id)).size).toBe(15);
    expect(new Set(themes.map((t) => t.colors.join())).size).toBe(15);
    expect(new Set(themes.map((t) => t.radius)).size).toBeGreaterThan(6);
    expect(new Set(themes.map((t) => t.detail)).size).toBe(5);
    expect(new Set(themes.map((t) => t.heading)).size).toBe(2);
  });
  function luminance(hex: string) {
    const rgb = hex
      .replace("#", "")
      .match(/.{2}/g)!
      .map((x) => parseInt(x, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  }
  for (const th of themes)
    it(`${th.name} has readable main text and action contrast`, () => {
      for (const color of [th.colors[2], th.colors[3]]) {
        const a = luminance(th.colors[0]),
          b = luminance(color);
        expect(
          (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        ).toBeGreaterThanOrEqual(4.5);
      }
      expect(
        themeTokens(th)[
          "--theme-heading" as keyof ReturnType<typeof themeTokens>
        ],
      ).toBe(th.heading);
    });
});
describe("Safe seasonal settings", () => {
  it("preserves changed seasonal choices through reconciliation, stock updates and storage migration", () => {
    const old = initialState(now);
    const changed = {
      ...old,
      seasonal: {
        ...old.seasonal,
        interests: ["xm-101"],
        launchInterest: true,
        adventOpened: [6],
        campaign: {
          ...old.seasonal.campaign,
          enabled: false,
          sections: [1, 0, 2, 3, 4, 5, 6, 7, 8],
        },
        notifications: {
          ...old.seasonal.notifications,
          marketing: true,
          channel: "Telegram",
          log: [
            {
              id: "preview-1",
              kind: "offer" as const,
              channel: "Telegram",
              date: "2026-10-28T12:00:00Z",
            },
          ],
        },
      },
    };
    const next = reconcile(changed, old, now);
    expect(next.seasonal).toEqual(changed.seasonal);
    expect(migrate(next, now).seasonal).toEqual(changed.seasonal);
  });

  it("starts with only the Christmas 2026 / New Year 2027 campaign", () => {
    const d = seasonalDefaults();
    expect(d.campaign.start).toBe("2026-10-01");
    expect(d.campaign.end).toBe("2027-01-07");
    expect(d.notifications.marketing).toBe(false);
    expect(d.campaign.sections).toHaveLength(8);
  });
  it("migrates absent seasonal state without deleting old cart preferences", () => {
    const old = initialState(now);
    delete (old as Partial<typeof old>).seasonal;
    old.cart = [{ id: "fp-1", qty: 1 }];
    const s = migrate(old, now);
    expect(s.cart).toHaveLength(1);
    expect(s.seasonal).toEqual(seasonalDefaults());
  });
  it("adds new seasonal inventory during the legacy 36-product upgrade and preserves depleted flower batches", () => {
    const old = initialState(now);
    old.catalog = old.catalog.filter((p) => !p.seasonal);
    old.batches = old.batches
      .filter((b) => b.productId.startsWith("fp-"))
      .map((b) => ({ ...b, quantity: 0 }));
    delete (old as Partial<typeof old>).seasonal;
    const upgraded = migrate(old, now);
    expect(availability(upgraded, "xm-001", now).studio).toBe(5);
    expect(availability(upgraded, "fp-1", now).quantity).toBe(0);
    expect(upgraded.catalog).toHaveLength(186);
  });
  it("rejects malformed settings, unknown channels and invalid Advent windows", () => {
    const s = migrateSeasonal({
      adventOpened: [0, 1, 1, 25, "2"],
      notifications: { channel: "Unknown", log: [{ kind: "evil" }] },
      campaign: { sections: [0, 0, 9, 10], featured: ["fp-1", "bad"] },
    });
    expect(s.adventOpened).toEqual([1]);
    expect(s.notifications.channel).toBe("Email");
    expect(s.notifications.log).toHaveLength(0);
    expect(s.campaign.sections).toEqual([0]);
  });
  it("provides all fourteen notification templates in three languages", () => {
    expect(Object.keys(notificationTemplates)).toHaveLength(14);
    for (const tuple of Object.values(notificationTemplates)) {
      expect(tuple).toHaveLength(3);
      expect(tuple.every((t) => t.length > 25)).toBe(true);
    }
  });
});
