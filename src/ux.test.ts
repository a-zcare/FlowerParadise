import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { initialState, availability, reserveVending, migrate } from "./domain";
import { pickupLocations, locationMatches } from "./pickup";
import { filterCatalog } from "./catalog";
import { guides } from "./guides";
import { seasonalDefaults, migrateSeasonal } from "./seasonal-state";
const filters = {
  scope: "all" as const,
  query: "",
  category: "",
  occasion: "",
  color: "",
  max: 500,
};
describe("location-aware discovery", () => {
  it("shows only current sellable machine inventory and respects reservations", () => {
    const s = initialState();
    const slot = s.compartments.find((c) => c.status === "available")!;
    expect(locationMatches(s, slot.productId, "dvp-vending-01")).toBe(true);
    const result = reserveVending(s, slot.id);
    expect(result).not.toBeNull();
    if (result)
      expect(
        locationMatches(result.state, slot.productId, "dvp-vending-01"),
      ).toBe(false);
    const list = filterCatalog(
      s.catalog,
      { ...filters, method: "vending" },
      "en",
      s,
    );
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => availability(s, p.id).immediate)).toBe(true);
  });
  it("intersects pickup method and location, rejects unknown locations", () => {
    const s = initialState();
    expect(
      filterCatalog(
        s.catalog,
        { ...filters, locationId: "dvp-vending-01", method: "delivery" },
        "en",
        s,
      ),
    ).toHaveLength(0);
    expect(locationMatches(s, s.catalog[0].id, "invented-address")).toBe(false);
    expect(
      pickupLocations.every(
        (l) =>
          l.address === null &&
          l.coordinates === null &&
          l.availability === "planned",
      ),
    ).toBe(true);
  });
  it("hides machine inventory during local maintenance and blocks reservation", () => {
    const s = initialState();
    s.seasonal.discovery.unavailableLocations = ["dvp-vending-01"];
    expect(
      filterCatalog(s.catalog, { ...filters, method: "vending" }, "en", s),
    ).toHaveLength(0);
    expect(availability(s, s.compartments[0].productId).immediate).toBe(false);
    expect(reserveVending(s, s.compartments[0].id)).toBeNull();
  });
  it("rejects unavailable studio and delivery locations", () => {
    const s = initialState();
    s.seasonal.discovery.unavailableLocations = ["dvp-studio", "dvp-delivery"];
    expect(
      filterCatalog(
        s.catalog,
        { ...filters, locationId: "dvp-studio" },
        "en",
        s,
      ),
    ).toHaveLength(0);
    expect(locationMatches(s, "xm-001", "dvp-delivery")).toBe(false);
  });
});
describe("editorial and migration", () => {
  it("provides ten original translated guides with local imagery", () => {
    const s = initialState();
    expect(guides).toHaveLength(10);
    expect(new Set(guides.map((g) => g.id)).size).toBe(10);
    for (const g of guides) {
      expect(g.title).toHaveLength(3);
      expect(g.intro).toHaveLength(3);
      expect(g.paragraphs.length).toBeGreaterThanOrEqual(2);
      for (const p of g.paragraphs)
        expect(p.every((text) => text.length > 90)).toBe(true);
      const photo = s.catalog.find((p) => p.id === g.photo)?.photo || g.photo;
      expect(existsSync(`public/images/${photo}.webp`), g.id).toBe(true);
    }
  });
  it("adds defaults to legacy local records and preserves new settings", () => {
    expect(migrateSeasonal({ campaign: { enabled: false } }).discovery).toEqual(
      seasonalDefaults().discovery,
    );
    const s = initialState();
    s.seasonal.discovery.defaultTheme = "nordic-bloom";
    s.seasonal.discovery.hiddenArticles = ["family-gifts"];
    s.seasonal.discovery.articleNotes = {
      "family-gifts": ["Piezīme", "Заметка", "Note"],
    };
    expect(migrate(JSON.parse(JSON.stringify(s))).seasonal.discovery).toEqual(
      s.seasonal.discovery,
    );
  });
  it("ignores malformed translations in saved editorial data", () => {
    const raw = {
      discovery: {
        faqAnswer: ["one"],
        articleNotes: { a: ["bad"] },
        hiddenArticles: [12, "family-gifts"],
      },
    };
    const d = migrateSeasonal(raw).discovery;
    expect(d.faqAnswer).toBe(null);
    expect(d.articleNotes).toEqual({});
    expect(d.hiddenArticles).toEqual(["family-gifts"]);
  });
});
