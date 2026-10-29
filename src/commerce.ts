import type { Product, Text } from "./data";
import type {
  CommerceState,
  DesignConfig,
  WrappingConfig,
  CalendarDay,
  Lifecycle,
} from "./commerce-model";
export const lifecycle: { id: Lifecycle; label: Text }[] = [
  { id: "concept", label: ["Koncepts", "Концепт", "Concept"] },
  {
    id: "research",
    label: ["Piegādātāja izpēte", "Поиск поставщика", "Supplier Research"],
  },
  {
    id: "handmade",
    label: ["Var izgatavot", "Можно изготовить вручную", "Can Be Handmade"],
  },
  {
    id: "made-to-order",
    label: ["Pēc pasūtījuma", "Под заказ", "Made to Order"],
  },
  {
    id: "ready",
    label: ["Gatavs pārdošanai", "Готов к продаже", "Ready for Sale"],
  },
  {
    id: "unavailable",
    label: [
      "Pagaidām nav pieejams",
      "Временно недоступен",
      "Temporarily Unavailable",
    ],
  },
  { id: "archived", label: ["Arhivēts", "Архивирован", "Archived"] },
];
export const giftComponents = [
  {
    id: "candle",
    name: [
      "Dekoratīva svece",
      "Декоративная свеча",
      "Decorative candle",
    ] as Text,
    price: 6,
    material: "wax",
    fits: ["large", "medium"],
  },
  {
    id: "chocolate",
    name: ["Šokolāde", "Шоколад", "Chocolate"] as Text,
    price: 3,
    material: "food",
    fits: ["small", "medium", "large"],
  },
  {
    id: "tea",
    name: ["Tējas paciņa", "Пакетик чая", "Tea sachet"] as Text,
    price: 1,
    material: "food",
    fits: ["small", "medium", "large"],
  },
  {
    id: "cocoa",
    name: ["Kakao paciņa", "Пакетик какао", "Cocoa sachet"] as Text,
    price: 2,
    material: "food",
    fits: ["medium", "large"],
  },
  {
    id: "ornament",
    name: ["Mini rotājums", "Мини-украшение", "Mini ornament"] as Text,
    price: 4,
    material: "ornament",
    fits: ["medium", "large"],
  },
  {
    id: "note",
    name: [
      "Apsveikuma zīmīte",
      "Поздравительная записка",
      "Greeting note",
    ] as Text,
    price: 0,
    material: "paper",
    fits: ["small", "medium", "large"],
  },
  {
    id: "toy",
    name: [
      "Mini dekoratīva rotaļlieta",
      "Миниатюрная декоративная игрушка",
      "Mini decorative toy",
    ] as Text,
    price: 5,
    material: "textile",
    fits: ["large"],
  },
  {
    id: "keepsake",
    name: [
      "Personalizēts suvenīrs",
      "Именной сувенир",
      "Personalized keepsake",
    ] as Text,
    price: 7,
    material: "wood",
    fits: ["medium", "large"],
  },
];
export const roundMoney = (n: number) =>
  Math.round((n + Number.EPSILON) * 100) / 100;
export const defaultWrapping = (): WrappingConfig => ({
  size: "medium",
  color: "#e8d8bd",
  paper: "kraft",
  ribbon: "#7e233b",
  ribbonStyle: "satin",
  bow: true,
  tag: true,
  recipient: "",
  message: "",
  seal: false,
  accessories: false,
});
export const defaultDesign = (
  kind: DesignConfig["kind"] = "gift",
): DesignConfig => ({
  kind,
  recipient: kind === "gift" ? "parents" : "",
  budget: 150,
  packaging: "box",
  extras: [],
  ...(kind === "calendar"
    ? { days: Array.from({ length: 24 }, () => ({ content: "", message: "" })) }
    : {}),
  ...(kind === "wreath"
    ? {
        wreath: { type: 0, greenery: 0, candles: 3, decorations: [], color: 0 },
      }
    : {}),
});
export function wrappingPrice(w?: WrappingConfig) {
  return w
    ? roundMoney(
        { small: 3, medium: 5, large: 8 }[w.size] +
          { satin: 1, velvet: 2, twine: 0 }[w.ribbonStyle] +
          (w.bow ? 1 : 0) +
          (w.tag ? 1 : 0) +
          (w.seal ? 1 : 0) +
          (w.accessories ? 3 : 0),
      )
    : 0;
}
export function designPrice(c?: DesignConfig) {
  if (!c) return 0;
  return roundMoney(
    wrappingPrice(c.wrapping) +
      (c.packaging === "basket" ? 5 : 0) +
      c.extras.reduce(
        (n, x) =>
          n + (giftComponents.find((g) => g.id === x.id)?.price || 0) * x.qty,
        0,
      ) +
      (c.days?.reduce(
        (n, d) =>
          n + (giftComponents.find((g) => g.id === d.content)?.price || 0),
        0,
      ) || 0) +
      (c.wreath
        ? c.wreath.decorations.length * 2 +
          ([5, 8, 6, 0][c.wreath.candles] || 0) +
          ([0, 3, 5, 2, 1][c.wreath.type] || 0)
        : 0),
  );
}
export function calendarErrors(
  days: CalendarDay[],
  size: WrappingConfig["size"] = "medium",
) {
  const errors: string[] = [];
  if (days.length !== 24) errors.push("24");
  days.forEach((d, i) => {
    const g = giftComponents.find((g) => g.id === d.content);
    if (
      !g ||
      !g.fits.includes(size) ||
      (d.content === "note" && !d.message.trim())
    )
      errors.push(String(i + 1));
  });
  return errors;
}
const object = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const text = (x: unknown, max = 2000): x is string =>
  typeof x === "string" && x.length <= max;
const triple = (x: unknown): x is Text =>
  Array.isArray(x) && x.length === 3 && x.every((v) => text(v) && v.trim());
export function validDesign(x: unknown): x is DesignConfig {
  if (
    !object(x) ||
    !["gift", "wrapping", "wreath", "calendar"].includes(String(x.kind)) ||
    !text(x.recipient, 80) ||
    typeof x.budget !== "number" ||
    !Number.isFinite(x.budget) ||
    x.budget < 1 ||
    x.budget > 10000 ||
    !["box", "basket"].includes(String(x.packaging)) ||
    !Array.isArray(x.extras) ||
    x.extras.length > 20 ||
    !x.extras.every(
      (e) =>
        object(e) &&
        giftComponents.some((g) => g.id === e.id) &&
        Number.isInteger(e.qty) &&
        Number(e.qty) > 0 &&
        Number(e.qty) <= 100,
    )
  )
    return false;
  if (x.wrapping !== undefined) {
    const w = x.wrapping;
    if (
      !object(w) ||
      !["small", "medium", "large"].includes(String(w.size)) ||
      !["satin", "velvet", "twine"].includes(String(w.ribbonStyle)) ||
      !["kraft", "ivory", "snow"].includes(String(w.paper)) ||
      !text(w.color, 7) ||
      !/^#[a-f0-9]{6}$/i.test(w.color) ||
      !text(w.ribbon, 7) ||
      !/^#[a-f0-9]{6}$/i.test(w.ribbon) ||
      !text(w.recipient, 80) ||
      !text(w.message, 300) ||
      !["bow", "tag", "seal", "accessories"].every(
        (k) => typeof w[k] === "boolean",
      )
    )
      return false;
  }
  if (x.message !== undefined && !text(x.message, 300)) return false;
  if (x.card !== undefined && typeof x.card !== "boolean") return false;
  if (
    x.draftSize !== undefined &&
    !["S", "M", "L"].includes(String(x.draftSize))
  )
    return false;
  if (
    x.draftDate !== undefined &&
    (!text(x.draftDate, 10) || !/^\d{4}-\d{2}-\d{2}$/.test(x.draftDate))
  )
    return false;
  if (
    x.lines !== undefined &&
    (!Array.isArray(x.lines) ||
      x.lines.length > 5 ||
      !x.lines.every(
        (l) =>
          object(l) &&
          text(l.id, 80) &&
          Number.isInteger(l.qty) &&
          Number(l.qty) > 0 &&
          Number(l.qty) <= 20,
      ))
  )
    return false;
  if (
    x.days !== undefined &&
    (!Array.isArray(x.days) ||
      x.days.length !== 24 ||
      !x.days.every(
        (d) =>
          object(d) &&
          text(d.content, 30) &&
          (d.content === "" ||
            giftComponents.some((g) => g.id === d.content)) &&
          text(d.message, 100),
      ))
  )
    return false;
  if (x.wreath !== undefined) {
    const w = x.wreath;
    if (
      !object(w) ||
      !Number.isInteger(w.type) ||
      Number(w.type) < 0 ||
      Number(w.type) > 4 ||
      !Number.isInteger(w.greenery) ||
      Number(w.greenery) < 0 ||
      Number(w.greenery) > 4 ||
      !Number.isInteger(w.candles) ||
      Number(w.candles) < 0 ||
      Number(w.candles) > 3 ||
      !Number.isInteger(w.color) ||
      Number(w.color) < 0 ||
      Number(w.color) > 5 ||
      !Array.isArray(w.decorations) ||
      w.decorations.length > 9 ||
      new Set(w.decorations).size !== w.decorations.length ||
      !w.decorations.every(
        (n) => Number.isInteger(n) && Number(n) >= 0 && Number(n) < 9,
      )
    )
      return false;
  }
  return true;
}
export function commerceDefaults(): CommerceState {
  return {
    drafts: {},
    wishlists: [],
    corporate: [],
    productMeta: {},
    customProducts: [],
    edits: {},
    deleted: [],
    media: [],
    slots: { capacity: 12, cutoffHour: 18, leadDays: 1, closed: [] },
    materialPrices: {
      greenery: 8,
      wax: 3,
      ribbon: 1,
      box: 4,
      ornament: 2,
      packaging: 2,
      food: 3,
      textile: 4,
      wood: 3,
      paper: 1,
      metal: 2,
      glass: 2,
    },
    events: [],
    orderStages: {},
    banner: [
      "Ziemassvētki 2026 · Jaunais gads 2027",
      "Рождество 2026 · Новый год 2027",
      "Christmas 2026 · New Year 2027",
    ],
    countdown: "christmas",
  };
}
export function validProduct(p: unknown): p is Product {
  return (
    object(p) &&
    text(p.id, 80) &&
    /^[a-zA-Z0-9-]+$/.test(p.id) &&
    triple(p.name) &&
    triple(p.description) &&
    triple(p.composition) &&
    triple(p.care) &&
    typeof p.price === "number" &&
    p.price >= 1 &&
    p.price <= 500 &&
    Number.isInteger(p.category) &&
    Number(p.category) >= 0 &&
    Number(p.category) <= 20 &&
    text(p.photo, 100) &&
    /^[\w-]+$/.test(p.photo) &&
    text(p.size, 100) &&
    Number.isInteger(p.color) &&
    Number(p.color) >= 0 &&
    Number(p.color) < 4 &&
    Number.isInteger(p.occasion) &&
    Number(p.occasion) >= 0 &&
    Number(p.occasion) < 5 &&
    (p.seasonal === undefined ||
      (object(p.seasonal) &&
        triple(p.seasonal.materials) &&
        triple(p.seasonal.safety) &&
        Array.isArray(p.seasonal.variants) &&
        p.seasonal.variants.length > 0 &&
        p.seasonal.variants.length <= 10 &&
        p.seasonal.variants.every(triple) &&
        Array.isArray(p.seasonal.related) &&
        p.seasonal.related.every((id) => text(id, 80)) &&
        Array.isArray(p.seasonal.materialTags) &&
        p.seasonal.materialTags.every((t) => text(t, 50)) &&
        Array.isArray(p.seasonal.recipients) &&
        p.seasonal.recipients.every((t) => text(t, 50)) &&
        typeof p.seasonal.preparationDays === "number" &&
        Number.isInteger(p.seasonal.preparationDays) &&
        p.seasonal.preparationDays >= 0 &&
        p.seasonal.preparationDays <= 30 &&
        typeof p.seasonal.perishable === "boolean" &&
        typeof p.seasonal.natural === "boolean" &&
        typeof p.seasonal.indoor === "boolean")) &&
    typeof p.stock === "number" &&
    p.stock >= 0 &&
    p.stock <= 1000
  );
}
export function migrateCommerce(raw: unknown): CommerceState {
  const d = commerceDefaults();
  if (!object(raw)) return d;
  if (object(raw.drafts))
    for (const [k, v] of Object.entries(raw.drafts).slice(0, 20))
      if (k !== "__proto__" && validDesign(v)) d.drafts[k] = v;
  if (Array.isArray(raw.wishlists))
    d.wishlists = raw.wishlists
      .filter(
        (w) =>
          object(w) &&
          text(w.id, 80) &&
          text(w.name, 80) &&
          Array.isArray(w.items) &&
          w.items.length <= 100 &&
          w.items.every((i) => text(i, 80)),
      )
      .slice(0, 20);
  if (object(raw.productMeta))
    for (const [k, v] of Object.entries(raw.productMeta))
      if (
        object(v) &&
        lifecycle.some((l) => l.id === v.status) &&
        typeof v.visible === "boolean" &&
        typeof v.seasonal === "boolean"
      )
        d.productMeta[k] = v as unknown as CommerceState["productMeta"][string];
  if (Array.isArray(raw.customProducts))
    d.customProducts = raw.customProducts
      .filter((p) => validProduct(p) && p.id.startsWith("demo-"))
      .slice(0, 100);
  if (object(raw.edits))
    for (const [k, v] of Object.entries(raw.edits))
      if (validProduct(v) && v.id === k) d.edits[k] = v;
  if (Array.isArray(raw.deleted))
    d.deleted = raw.deleted.filter((i) => text(i, 80));
  if (object(raw.slots)) {
    const v = raw.slots;
    for (const [k, min, max] of [
      ["capacity", 1, 500],
      ["cutoffHour", 0, 23],
      ["leadDays", 0, 30],
    ] as const) {
      const n = Number(v[k]);
      if (Number.isInteger(n) && n >= min && n <= max) d.slots[k] = n;
    }
    if (Array.isArray(v.closed))
      d.slots.closed = v.closed.filter(
        (i) => typeof i === "string" && /^202[67]-\d{2}-\d{2}$/.test(i),
      );
  }
  if (object(raw.materialPrices))
    for (const [k, v] of Object.entries(raw.materialPrices))
      if (
        Object.hasOwn(d.materialPrices, k) &&
        typeof v === "number" &&
        Number.isFinite(v) &&
        v >= 0 &&
        v <= 1000
      )
        d.materialPrices[k] = v;
  if (Array.isArray(raw.corporate))
    d.corporate = raw.corporate
      .filter(
        (x) =>
          object(x) &&
          text(x.id, 80) &&
          text(x.company, 80) &&
          text(x.contact, 100) &&
          text(x.productId, 80) &&
          Number.isInteger(x.quantity) &&
          Number(x.quantity) > 0 &&
          Number(x.quantity) <= 500 &&
          typeof x.total === "number" &&
          Number.isFinite(x.total) &&
          validDesign(x.configuration) &&
          ["draft", "review", "prepared"].includes(String(x.status)) &&
          text(x.date, 10),
      )
      .slice(0, 100);
  if (Array.isArray(raw.media))
    d.media = raw.media
      .filter(
        (x) =>
          object(x) &&
          text(x.id, 80) &&
          text(x.photo, 100) &&
          /^[\w-]+$/.test(String(x.photo)) &&
          triple(x.alt) &&
          text(x.source, 500) &&
          text(x.license, 500),
      )
      .slice(0, 200);
  if (Array.isArray(raw.events))
    d.events = raw.events
      .filter(
        (x) =>
          object(x) &&
          text(x.kind, 40) &&
          text(x.product, 80) &&
          text(x.date, 40),
      )
      .slice(-500);
  if (object(raw.orderStages))
    for (const [k, v] of Object.entries(raw.orderStages))
      if (
        [
          "confirmed",
          "preparing",
          "photo-review",
          "ready",
          "collected",
        ].includes(String(v))
      )
        d.orderStages[k] = String(v);
  if (triple(raw.banner)) d.banner = raw.banner;
  if (raw.countdown === "new-year") d.countdown = "new-year";
  return d;
}
export function materialCost(
  p: Product,
  c: CommerceState["materialPrices"],
  design?: DesignConfig,
) {
  const tags = p.seasonal?.materialTags || ["greenery"];
  return roundMoney(
    tags.reduce((n, t) => n + (c[t] || 0), 0) +
      (c.packaging || 0) +
      (design ? designPrice(design) * 0.45 : 0),
  );
}
export function isVisible(p: Product, c: CommerceState) {
  const m = c.productMeta[p.id];
  return (
    !c.deleted.includes(p.id) &&
    (!m || (m.visible && !["archived", "unavailable"].includes(m.status)))
  );
}
export const readiness = (
  p: Product,
): "now" | "same-day" | "next-day" | "made-to-order" =>
  p.seasonal?.readiness || "made-to-order";
export function shareWishlist(name: string, ids: string[]) {
  const data = JSON.stringify({
    v: 1,
    name: name.slice(0, 60),
    ids: [...new Set(ids)].slice(0, 30),
  });
  const encoded = encodeURIComponent(data);
  if (encoded.length > 3500) throw Error("size");
  return encoded;
}
export function readSharedWishlist(encoded: string, catalog: Product[]) {
  if (encoded.length > 3500) throw Error("size");
  const x: unknown = JSON.parse(decodeURIComponent(encoded));
  if (
    !object(x) ||
    x.v !== 1 ||
    !text(x.name, 60) ||
    !Array.isArray(x.ids) ||
    x.ids.length > 30 ||
    !x.ids.every(
      (i) => typeof i === "string" && catalog.some((p) => p.id === i),
    )
  )
    throw Error("schema");
  return { name: x.name, items: [...new Set(x.ids)] as string[] };
}
export interface GiftAnswers {
  recipient: string;
  age: string;
  budget: number;
  style: string;
  type: string;
  personal: boolean;
  needed: string;
}
export function recommendChristmas(catalog: Product[], a: GiftAnswers) {
  return catalog
    .filter(
      (p) =>
        p.seasonal &&
        p.price <= a.budget &&
        (!a.personal || p.customizable) &&
        (a.needed !== "soon" || ["now", "same-day"].includes(readiness(p))) &&
        (!(a.age === "child") || ![13, 17].includes(p.category)),
    )
    .map((p) => {
      const reasons: string[] = ["budget"];
      let score = 1;
      if (p.seasonal!.recipients.includes(a.recipient)) {
        score += 4;
        reasons.push("recipient");
      }
      if (a.type === "all" || String(p.category) === a.type) {
        score += 3;
        reasons.push("type");
      }
      if (a.style === "playful" && p.category === 14) {
        score += 2;
        reasons.push("playful");
      }
      if (a.age === "child" && p.category === 14) {
        score += 1;
        reasons.push("age");
      }
      if (a.personal && p.customizable) {
        score += 4;
        reasons.push("personal");
      }
      if (
        a.style === "natural" &&
        p.seasonal!.materialTags.includes("greenery")
      ) {
        score += 2;
        reasons.push("natural");
      }
      if (a.style === "luxury" && p.price >= 45) {
        score += 2;
        reasons.push("luxury");
      }
      if (a.needed === "soon" && ["now", "same-day"].includes(readiness(p))) {
        score += 3;
        reasons.push("soon");
      }
      return { product: p, score, reasons };
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, 6);
}
export const christmasDates = [
  "2026-12-24",
  "2026-12-25",
  "2026-12-26",
  "2026-12-31",
  "2027-01-01",
];
export const windows = ["09:00–12:00", "12:00–15:00", "15:00–18:00"];
export function rigaClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Riga",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (k: string) => parts.find((p) => p.type === k)?.value || "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
  };
}
export function slotIssue(
  date: string,
  time: string,
  qty: number,
  lead: number,
  settings: CommerceState["slots"],
  reservations: {
    date: string;
    time: string;
    quantity?: number;
    status: string;
  }[],
  now = new Date(),
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !christmasDates.includes(date) ||
    !windows.includes(time) ||
    !Number.isInteger(qty) ||
    qty < 1 ||
    qty > 20
  )
    return "invalid";
  const today = rigaClock(now);
  const days = (Date.parse(date) - Date.parse(today.date)) / 86400000;
  if (
    days < Math.max(lead, settings.leadDays) ||
    (days === Math.max(lead, settings.leadDays) &&
      today.hour >= settings.cutoffHour)
  )
    return "cutoff";
  if (settings.closed.includes(date)) return "closed";
  const used = reservations
    .filter(
      (r) =>
        r.status === "reserved" &&
        r.date === date &&
        r.time.slice(0, 5) === time.slice(0, 5),
    )
    .reduce((n, r) => n + (r.quantity || 1), 0);
  return used + qty > settings.capacity ? "capacity" : "";
}
