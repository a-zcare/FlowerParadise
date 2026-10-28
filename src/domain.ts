import { seasonalDefaults, migrateSeasonal } from "./seasonal-state";
import { pick, products, type Lang, type Product, type Text } from "./data";
import { addDays, dateKey } from "./date-utils";
import type {
  CartItem,
  Costs,
  DemoState,
  FreshnessRules,
  FreshnessStatus,
  InventoryBatch,
  ProductOptions,
  Reservation,
  SecretGift,
} from "./models";
export const STORAGE_KEY = "flower-paradise-v2";
export { addDays, dateKey } from "./date-utils";
export const round = (v: number) =>
  Math.round((v + Number.EPSILON) * 100) / 100;
export const id = () =>
  globalThis.crypto?.randomUUID?.() ??
  `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
export const code = (existing: string[] = []) => {
  let c = "";
  do {
    const bytes = new Uint32Array(1);
    globalThis.crypto?.getRandomValues(bytes);
    c = String(
      100000 + ((bytes[0] || Math.floor(Math.random() * 900000)) % 900000),
    );
  } while (existing.includes(c));
  return c;
};
export const statusLabels: Record<FreshnessStatus, Text> = {
  fresh: ["Svaigs", "Свежий", "Fresh"],
  monitor: ["Uzraudzīt", "Контроль", "Monitor"],
  discount: ["Atlaide pieļaujama", "Допустима скидка", "Discount eligible"],
  remove: ["Izņemt no pārdošanas", "Снять с продажи", "Remove from sale"],
  discarded: ["Norakstīts", "Списан", "Discarded"],
};
export const methodLabel = (method: string, lang: Lang) =>
  pick(
    method === "delivery"
      ? ["Piegāde", "Доставка", "Delivery"]
      : method === "vending"
        ? ["Automāts 24/7", "Автомат 24/7", "24/7 vending"]
        : ["Saņemšana", "Самовывоз", "Pickup"],
    lang,
  );
export function freshness(
  batch: InventoryBatch,
  rules: FreshnessRules,
  now = dateKey(),
): FreshnessStatus {
  if (batch.status === "discarded" || batch.status === "remove")
    return batch.status;
  const p = products.find((p) => p.id === batch.productId);
  if (p && (p.seasonal ? !p.seasonal.perishable : p.category >= 7))
    return "fresh";
  const age = Math.max(
    0,
    Math.floor((Date.parse(now) - Date.parse(batch.assemblyDate)) / 86400000),
  );
  if (now > batch.sellBy || age >= rules.remove) return "remove";
  return age >= rules.discount
    ? "discount"
    : age >= rules.monitor
      ? "monitor"
      : "fresh";
}
export const sellable = (
  b: InventoryBatch,
  rules: FreshnessRules,
  now = dateKey(),
) =>
  b.quantity > 0 && !["remove", "discarded"].includes(freshness(b, rules, now));
export function availability(
  s: Pick<
    DemoState,
    "batches" | "freshnessRules" | "compartments" | "reservations"
  >,
  productId: string,
  now = dateKey(),
) {
  const studio = s.batches
    .filter(
      (b) =>
        b.productId === productId &&
        b.location === "studio" &&
        sellable(b, s.freshnessRules, now),
    )
    .reduce((n, b) => n + b.quantity, 0);
  const slots = s.compartments.filter(
    (c) =>
      c.productId === productId &&
      c.status === "available" &&
      s.batches.some(
        (b) => b.id === c.batchId && sellable(b, s.freshnessRules, now),
      ),
  );
  const allocated = s.reservations
    .filter((r) => r.product === productId && r.status === "reserved")
    .reduce((n, r) => n + (r.quantity ?? 1), 0);
  return {
    quantity: Math.max(0, studio - allocated) + slots.length,
    studio: Math.max(0, studio - allocated),
    slots,
    immediate: slots.length > 0,
  };
}
export function variantPrice(p: Product, options?: ProductOptions) {
  if (!options) return p.price;
  return round(
    p.price * { S: 0.8, M: 1, L: 1.4 }[options.size] +
      (options.card ? 5 : 0) +
      (options.extraGift ? 12 : 0),
  );
}
export const linePrice = (item: CartItem, catalog: Product[]) => {
  const p = catalog.find((p) => p.id === item.id);
  return p
    ? item.options
      ? variantPrice(p, item.options)
      : (item.price ?? p.price)
    : 0;
};
export function cartTotals(
  s: Pick<DemoState, "cart" | "catalog" | "promo" | "campaigns">,
  method = "pickup",
) {
  const subtotal = round(
    s.cart.reduce((n, item) => n + linePrice(item, s.catalog) * item.qty, 0),
  );
  const campaign = s.campaigns.find(
    (c) => c.active && c.code === s.promo.trim().toUpperCase(),
  );
  const eligible = s.cart.reduce(
    (n, item) =>
      n +
      (!campaign?.productIds.length || campaign.productIds.includes(item.id)
        ? linePrice(item, s.catalog) * item.qty
        : 0),
    0,
  );
  const discount = campaign
    ? round((eligible * Math.min(50, Math.max(0, campaign.percent))) / 100)
    : 0;
  const delivery = method === "delivery" ? 5 : 0;
  return {
    subtotal,
    discount,
    delivery,
    total: round(subtotal - discount + delivery),
  };
}
export function calculateProfit(c: Costs, wasteCost = 0) {
  const days = Math.max(0, c.days),
    capacity = 4 * (1 + Math.max(0, Math.floor(c.restocksPerDay))),
    daily = Math.min(Math.max(0, c.dailySales), capacity),
    units = daily * days;
  const spoil = Math.min(0.95, Math.max(0, c.spoilagePercent / 100));
  const unitVariable =
    (c.flowers + c.packaging) / (1 - spoil) + (c.price * c.feePercent) / 100;
  const revenue = units * c.price,
    variable = units * unitVariable + (c.useRecordedWaste ? wasteCost : 0),
    fixed = c.rent + c.electricity + c.transport + c.maintenance + c.marketing;
  const margin = c.price - unitVariable,
    profit = revenue - variable - fixed,
    investment = Math.max(0, Math.max(c.startup, c.machine) - c.grant);
  const breakEven =
    margin > 0
      ? Math.ceil((fixed + (c.useRecordedWaste ? wasteCost : 0)) / margin)
      : null;
  return {
    capacity,
    daily,
    units,
    revenue: round(revenue),
    variable: round(variable),
    unitVariable: round(unitVariable),
    contribution: round(revenue - variable),
    margin: round(margin),
    fixed: round(fixed),
    profit: round(profit),
    breakEven,
    payback: profit > 0 ? round(investment / profit) : null,
    investment,
    restocksNeeded: Math.max(0, Math.ceil(daily / 4) - 1),
    lostDailySales: Math.max(0, c.dailySales - capacity),
  };
}
export interface MatchAnswers {
  recipient: string;
  occasion: number;
  budget: number;
  color: number;
  style: "all" | "mini" | "premium" | "natural";
  avoid: string;
  immediate: boolean;
}
export function matchProducts(s: DemoState, a: MatchAnswers) {
  const avoid = a.avoid
    .toLocaleLowerCase()
    .split(/[,;]+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return s.catalog
    .filter(
      (p) =>
        p.category < 9 &&
        p.price <= a.budget &&
        availability(s, p.id).quantity > 0 &&
        (!a.immediate || availability(s, p.id).immediate) &&
        !avoid.some((x) =>
          p.composition.some((v) => v.toLocaleLowerCase().includes(x)),
        ),
    )
    .map((p) => {
      const reasons: string[] = ["budget"];
      let score = 50;
      if (p.occasion === a.occasion) {
        score += 20;
        reasons.push("occasion");
      }
      if (a.color < 0 || p.color === a.color) {
        score += 15;
        reasons.push("color");
      }
      if (
        a.style === "all" ||
        (a.style === "mini" && p.category === 2) ||
        (a.style === "premium" && p.category === 6) ||
        (a.style === "natural" && [1, 5, 8].includes(p.category))
      ) {
        score += 10;
        reasons.push("style");
      }
      if (availability(s, p.id).immediate) {
        score += 5;
        reasons.push("immediate");
      }
      return { product: p, score: Math.min(100, score), reasons };
    })
    .sort((a, b) => b.score - a.score || b.product.price - a.product.price)
    .slice(0, 3);
}
export function giftBundles(
  catalog: Product[],
  budget: number,
  delivery: boolean,
  extras: boolean,
) {
  const addOns = (extras ? 17 : 5) + (delivery ? 5 : 0);
  return catalog
    .filter((p) => p.category < 7 && p.price + addOns <= budget)
    .sort((a, b) => b.price - a.price)
    .slice(0, 3)
    .map((p) => ({
      product: p,
      card: 5,
      wrapping: 0,
      gift: extras ? 12 : 0,
      delivery: delivery ? 5 : 0,
      total: round(p.price + addOns),
      remaining: round(budget - p.price - addOns),
    }));
}
export function initialState(now = dateKey()): DemoState {
  const batches: InventoryBatch[] = products.map((p, i) => ({
    id: `batch-${p.id}`,
    productId: p.id,
    quantity: p.stock,
    receivedDate: addDays(-(i % 4), now),
    assemblyDate: addDays(-(i % 4), now),
    sellBy: addDays(5 - (i % 4), now),
    status: "fresh",
    location: "studio",
    unitCost: round(p.price * 0.43),
  }));
  const slotIds = ["fp-1", "fp-5", "fp-10", "fp-19"];
  const compartments = slotIds.map((productId, i) => ({
    id: `slot-${i}`,
    productId,
    batchId: `slot-batch-${i}`,
    status: i === 3 ? ("reserved" as const) : ("available" as const),
    reservationId: i === 3 ? "sample-slot-4" : undefined,
  }));
  compartments.forEach((c, i) => {
    batches.push({
      id: c.batchId,
      productId: c.productId,
      quantity: 1,
      receivedDate: now,
      assemblyDate: now,
      sellBy: addDays(5, now),
      status: "fresh",
      location: c.id,
      unitCost: 14 + i * 2,
    });
  });
  return {
    schemaVersion: 2,
    seasonal: seasonalDefaults(),
    lang: "lv",
    dark: false,
    cart: [],
    wishlist: [],
    reservations: [
      {
        id: "sample-slot-4",
        product: "slot-3",
        date: now,
        time: "24/7",
        method: "vending",
        code: "DEMO-OCCUPIED",
        status: "reserved",
        expiresAt: addDays(1, now) + "T23:59:59+02:00",
      },
    ],
    reminders: [],
    orders: [],
    subscriptions: [],
    gifts: [],
    catalog: products.map((p) => ({
      ...p,
      name: [...p.name] as Text,
      stock: batches
        .filter(
          (b) =>
            b.productId === p.id &&
            sellable(b, { monitor: 2, discount: 3, remove: 5 }, now),
        )
        .reduce((n, b) => n + b.quantity, 0),
    })),
    picked: [],
    preferences: { channel: "email", fresh: false },
    promo: "",
    comparison: [],
    batches,
    compartments,
    freshnessRules: { monitor: 2, discount: 3, remove: 5 },
    waste: [],
    maintenance: [
      {
        id: "sample-check",
        type: "inspection",
        date: now,
        due: addDays(1, now),
        compartment: "all",
        notes: "",
        resolved: true,
        sample: true,
      },
      {
        id: "sample-temperature",
        type: "temperature",
        date: now,
        due: addDays(1, now),
        temperature: 6,
        compartment: "all",
        notes: "",
        resolved: true,
        sample: true,
      },
      {
        id: "sample-clean",
        type: "cleaning",
        date: addDays(-1, now),
        due: addDays(1, now),
        compartment: "all",
        notes: "",
        resolved: false,
        sample: true,
      },
    ],
    costs: {
      price: 35,
      flowers: 16,
      packaging: 3,
      feePercent: 0,
      spoilagePercent: 0,
      rent: 250,
      electricity: 60,
      transport: 80,
      maintenance: 60,
      marketing: 50,
      dailySales: 4,
      days: 30,
      machine: 10000,
      startup: 12600,
      grant: 0,
      restocksPerDay: 1,
      useRecordedWaste: false,
    },
    giftPlans: [],
    secretGifts: [],
    campaigns: [
      {
        id: "bloom10",
        code: "BLOOM10",
        percent: 10,
        productIds: [],
        active: true,
      },
    ],
  };
}
const obj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const finite = (v: unknown, min = 0, max = 1e7): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const str = (v: unknown) => typeof v === "string";
const date = (v: unknown) =>
  str(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v));
const array = <T>(
  v: unknown,
  test: (x: Record<string, unknown>) => boolean,
): T[] => (Array.isArray(v) ? (v.filter((x) => obj(x) && test(x)) as T[]) : []);
export function migrate(raw: unknown, now = dateKey()): DemoState {
  const base = initialState(now);
  if (!obj(raw)) return base;
  base.seasonal = migrateSeasonal(raw.seasonal);
  if (["lv", "ru", "en"].includes(String(raw.lang)))
    base.lang = raw.lang as Lang;
  base.dark = raw.dark === true;
  const ids = new Set(products.map((p) => p.id));
  const validItem = (x: Record<string, unknown>) =>
    str(x.id) &&
    ids.has(x.id) &&
    finite(x.qty, 1, 20) &&
    Number.isInteger(x.qty) &&
    (x.price === undefined || finite(x.price, 0, 10000));
  base.cart = array<CartItem>(raw.cart, validItem).map((x) => ({
    ...x,
    note: str(x.note) ? x.note.slice(0, 500) : "",
    options: validOptions(x.options) ? x.options : undefined,
  }));
  base.wishlist = Array.isArray(raw.wishlist)
    ? raw.wishlist.filter((x): x is string => str(x) && ids.has(x))
    : [];
  base.comparison = Array.isArray(raw.comparison)
    ? [
        ...new Set(
          raw.comparison.filter((x): x is string => str(x) && ids.has(x)),
        ),
      ].slice(0, 3)
    : [];
  base.catalog = products.map((p) => {
    const saved = Array.isArray(raw.catalog)
      ? raw.catalog.find((x) => obj(x) && x.id === p.id)
      : null;
    if (!obj(saved)) return p;
    return {
      ...p,
      price: finite(saved.price, 1, 500) ? saved.price : p.price,
      name:
        Array.isArray(saved.name) &&
        saved.name.length === 3 &&
        saved.name.every((x) => str(x) && x.length > 0)
          ? (saved.name as Text)
          : p.name,
    };
  });
  base.orders = array(
    raw.orders,
    (x) =>
      str(x.id) &&
      date(x.date) &&
      finite(x.total) &&
      Array.isArray(x.items) &&
      x.items.every((y) => obj(y) && validItem(y)) &&
      str(x.method),
  );
  base.reservations = array<Reservation>(
    raw.reservations,
    (x) =>
      str(x.id) &&
      str(x.product) &&
      (ids.has(x.product) || /^slot-[0-3]$/.test(x.product)) &&
      date(x.date) &&
      str(x.code) &&
      str(x.time) &&
      ["reserved", "collected", "cancelled", "expired"].includes(
        String(x.status),
      ) &&
      str(x.method) &&
      (x.quantity === undefined ||
        (finite(x.quantity, 1, 20) && Number.isInteger(x.quantity))),
  );
  if (!base.reservations.some((r) => r.product === "slot-3"))
    base.reservations.push(initialState(now).reservations[0]);
  base.reminders = array(
    raw.reminders,
    (x) =>
      str(x.id) &&
      str(x.name) &&
      date(x.date) &&
      finite(x.days, 0, 365) &&
      finite(Number(x.event), 0, 8) &&
      str(x.channel) &&
      typeof x.annual === "boolean",
  );
  base.gifts = array(
    raw.gifts,
    (x) =>
      str(x.id) &&
      finite(x.amount, 1, 1000) &&
      str(x.code) &&
      str(x.message) &&
      typeof x.redeemed === "boolean",
  );
  base.subscriptions = array(
    raw.subscriptions,
    (x) =>
      str(x.id) &&
      ["weekly", "biweekly", "monthly"].includes(String(x.frequency)) &&
      finite(x.months, 1, 12) &&
      finite(x.price) &&
      str(x.method) &&
      str(x.preference),
  );
  if (obj(raw.preferences))
    base.preferences = {
      channel: ["email", "Telegram", "WhatsApp"].includes(
        String(raw.preferences.channel),
      )
        ? String(raw.preferences.channel)
        : "email",
      fresh: raw.preferences.fresh === true,
    };
  base.promo = str(raw.promo) ? raw.promo : "";
  if (raw.schemaVersion === 2) {
    const batches = array<InventoryBatch>(
      raw.batches,
      (x) =>
        str(x.id) &&
        str(x.productId) &&
        ids.has(x.productId) &&
        finite(x.quantity, 0, 1000) &&
        date(x.assemblyDate) &&
        date(x.receivedDate) &&
        date(x.sellBy) &&
        finite(x.unitCost) &&
        str(x.location) &&
        Object.hasOwn(statusLabels, String(x.status)),
    );
    if (Array.isArray(raw.batches)) {
      const previousIds = new Set(
        Array.isArray(raw.catalog)
          ? raw.catalog.filter(obj).map((p) => p.id)
          : products.map((p) => p.id),
      );
      base.batches = [
        ...batches,
        ...base.batches.filter((b) => !previousIds.has(b.productId)),
      ];
    }
    const slots = array<DemoState["compartments"][number]>(
      raw.compartments,
      (x) =>
        /^slot-[0-3]$/.test(String(x.id)) &&
        str(x.productId) &&
        ids.has(x.productId) &&
        str(x.batchId) &&
        base.batches.some((b) => b.id === x.batchId) &&
        ["available", "reserved", "collected", "maintenance"].includes(
          String(x.status),
        ),
    );
    if (slots.length === 4 && new Set(slots.map((x) => x.id)).size === 4)
      base.compartments = slots;
    if (
      obj(raw.freshnessRules) &&
      finite(raw.freshnessRules.monitor, 0, 30) &&
      finite(raw.freshnessRules.discount, 0, 30) &&
      finite(raw.freshnessRules.remove, 1, 30) &&
      Number(raw.freshnessRules.monitor) <=
        Number(raw.freshnessRules.discount) &&
      Number(raw.freshnessRules.discount) < Number(raw.freshnessRules.remove)
    )
      base.freshnessRules = raw.freshnessRules as unknown as FreshnessRules;
    base.waste = array(
      raw.waste,
      (x) =>
        str(x.id) &&
        str(x.batchId) &&
        str(x.productId) &&
        finite(x.quantity, 1, 1000) &&
        finite(x.unitCost) &&
        str(x.reason) &&
        date(x.date),
    );
    base.maintenance = array(
      raw.maintenance,
      (x) =>
        str(x.id) &&
        [
          "inspection",
          "temperature",
          "cleaning",
          "restock",
          "compartment",
          "payment",
          "connectivity",
          "lock",
          "fault",
        ].includes(String(x.type)) &&
        date(x.date) &&
        date(x.due) &&
        str(x.compartment) &&
        str(x.notes) &&
        typeof x.resolved === "boolean" &&
        (x.temperature === undefined || finite(x.temperature, -50, 70)),
    );
    base.giftPlans = array(
      raw.giftPlans,
      (x) =>
        finite(x.year, 2020, 2200) &&
        str(x.reminderId) &&
        base.reminders.some((r) => r.id === x.reminderId) &&
        str(x.productId) &&
        ids.has(x.productId) &&
        finite(x.budget, 1, 5000) &&
        typeof x.completed === "boolean",
    );
    base.secretGifts = array<SecretGift>(
      raw.secretGifts,
      (x) =>
        str(x.id) &&
        str(x.productId) &&
        ids.has(x.productId) &&
        str(x.recipient) &&
        str(x.message) &&
        (!x.revealDate || date(x.revealDate)) &&
        ["petals", "envelope", "simple"].includes(String(x.animation)) &&
        ["vending", "pickup"].includes(String(x.pickup)) &&
        str(x.code) &&
        typeof x.redeemed === "boolean" &&
        str(x.createdAt),
    );
    base.campaigns = array(
      raw.campaigns,
      (x) =>
        str(x.id) &&
        str(x.code) &&
        finite(x.percent, 1, 50) &&
        Array.isArray(x.productIds) &&
        x.productIds.every((y) => str(y) && ids.has(y)) &&
        typeof x.active === "boolean",
    );
    if (obj(raw.costs)) {
      const c = raw.costs;
      Object.keys(base.costs).forEach((key) => {
        if (
          key !== "useRecordedWaste" &&
          finite(
            c[key],
            0,
            key === "spoilagePercent" ? 95 : key === "feePercent" ? 30 : 1e7,
          )
        )
          (base.costs as unknown as Record<string, unknown>)[key] = c[key];
      });
      base.costs.useRecordedWaste = c.useRecordedWaste === true;
    }
  } else {
    base.compartments = base.compartments.map((c) => {
      const r = base.reservations.find(
        (r) =>
          r.product === c.id && ["reserved", "collected"].includes(r.status),
      );
      return r
        ? {
            ...c,
            status: r.status as "reserved" | "collected",
            reservationId: r.id,
          }
        : c;
    });
  }
  return reconcile(base, undefined, now);
}
export function validOptions(v: unknown): v is ProductOptions {
  return (
    obj(v) &&
    ["S", "M", "L"].includes(String(v.size)) &&
    finite(v.color, 0, 3) &&
    ["ivory", "kraft", "rose"].includes(String(v.wrapping)) &&
    typeof v.card === "boolean" &&
    typeof v.extraGift === "boolean" &&
    ["pickup", "delivery"].includes(String(v.method))
  );
}
export function reconcile(
  next: DemoState,
  previous?: DemoState,
  now = dateKey(),
): DemoState {
  let batches = next.batches.map((b) => ({
    ...b,
    quantity: Math.max(0, Math.min(1000, Math.floor(b.quantity))),
  }));
  if (previous && next.batches === previous.batches) {
    for (const p of next.catalog) {
      const old = previous.catalog.find((x) => x.id === p.id);
      if (old && old.stock !== p.stock) {
        const slotUnits = batches
          .filter((b) => b.productId === p.id && b.location !== "studio")
          .reduce((a, b) => a + b.quantity, 0);
        let first = true;
        batches = batches.map((b) => {
          if (b.productId !== p.id || b.location !== "studio") return b;
          if (first) {
            first = false;
            return { ...b, quantity: Math.max(0, p.stock - slotUnits) };
          }
          return { ...b, quantity: 0 };
        });
      }
    }
  }
  const reservations = next.reservations.map((r) =>
    r.status === "reserved" &&
    ((r.expiresAt && Date.parse(r.expiresAt) <= Date.now()) || r.date < now)
      ? { ...r, status: "expired" }
      : r,
  );
  const compartments = next.compartments.map((c) => {
    const r = reservations.find((r) => r.id === c.reservationId);
    return c.status === "reserved" &&
      r &&
      ["expired", "cancelled"].includes(r.status)
      ? { ...c, status: "available" as const, reservationId: undefined }
      : c;
  });
  const catalog = next.catalog.map((p) => ({
    ...p,
    stock: batches
      .filter(
        (b) => b.productId === p.id && sellable(b, next.freshnessRules, now),
      )
      .reduce((n, b) => n + b.quantity, 0),
  }));
  return {
    ...next,
    schemaVersion: 2,
    seasonal: seasonalDefaults(),
    batches,
    catalog,
    reservations,
    compartments,
    comparison: [...new Set(next.comparison)].slice(0, 3),
    giftPlans: next.giftPlans.filter((p) =>
      next.reminders.some((r) => r.id === p.reminderId),
    ),
    picked: compartments
      .filter((c) => c.status === "collected")
      .map((c) => Number(c.id.split("-")[1])),
  };
}
export function consumeInventory(s: DemoState, items: CartItem[]): DemoState {
  const batches = s.batches.map((b) => ({ ...b }));
  let slots = s.compartments.map((c) => ({ ...c }));
  for (const item of items) {
    let needed = item.qty;
    const eligible = batches
      .filter(
        (b) =>
          b.productId === item.id &&
          sellable(b, s.freshnessRules) &&
          (b.location === "studio" ||
            slots.some((c) => c.batchId === b.id && c.status === "available")),
      )
      .sort((a, b) => a.sellBy.localeCompare(b.sellBy));
    for (const batch of eligible) {
      const take = Math.min(needed, batch.quantity);
      batch.quantity -= take;
      needed -= take;
      if (batch.quantity === 0 && batch.location !== "studio")
        slots = slots.map((c) =>
          c.batchId === batch.id ? { ...c, status: "collected" } : c,
        );
      if (!needed) break;
    }
  }
  return reconcile({ ...s, batches, compartments: slots });
}

/** Local transactions are the future backend adapter boundary. No hardware or messages. */
export function reserveVending(s: DemoState, slotId: string, now = Date.now()) {
  const slot = s.compartments.find((c) => c.id === slotId);
  if (
    !slot ||
    !availability(s, slot.productId, dateKey(new Date(now))).slots.some(
      (c) => c.id === slotId,
    )
  )
    return null;
  const pin = code(s.reservations.map((r) => r.code));
  const reservationId = id();
  return {
    code: pin,
    state: reconcile(
      {
        ...s,
        compartments: s.compartments.map((c) =>
          c.id === slotId ? { ...c, status: "reserved", reservationId } : c,
        ),
        reservations: [
          ...s.reservations,
          {
            id: reservationId,
            product: slotId,
            date: dateKey(new Date(now)),
            time: "24/7",
            method: "vending",
            code: pin,
            status: "reserved",
            expiresAt: new Date(now + 30 * 60000).toISOString(),
          },
        ],
      },
      undefined,
      dateKey(new Date(now)),
    ),
  };
}
export function collectVending(s: DemoState, value: string, now = Date.now()) {
  const r = s.reservations.find(
    (r) =>
      r.code === value.trim() &&
      r.status === "reserved" &&
      r.product.startsWith("slot-") &&
      (!r.expiresAt || Date.parse(r.expiresAt) > now),
  );
  if (!r) return null;
  const slot = s.compartments.find(
    (c) =>
      c.id === r.product && c.reservationId === r.id && c.status === "reserved",
  );
  if (
    !slot ||
    !s.batches.some(
      (b) =>
        b.id === slot.batchId &&
        sellable(b, s.freshnessRules, dateKey(new Date(now))),
    )
  )
    return null;
  return reconcile(
    {
      ...s,
      reservations: s.reservations.map((x) =>
        x.id === r.id ? { ...x, status: "collected" } : x,
      ),
      compartments: s.compartments.map((c) =>
        c.id === slot.id ? { ...c, status: "collected" } : c,
      ),
      batches: s.batches.map((b) =>
        b.id === slot.batchId
          ? { ...b, quantity: Math.max(0, b.quantity - 1) }
          : b,
      ),
    },
    undefined,
    dateKey(new Date(now)),
  );
}
export function reserveFuture(
  s: DemoState,
  input: {
    product: string;
    date: string;
    time: string;
    method: string;
    message: string;
    quantity?: number;
    wrapping?: string;
  },
  now = dateKey(),
):
  | { error: "date" | "conflict" | "unavailable" }
  | { state: DemoState; code: string } {
  if (
    input.date <= now ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
    !Number.isFinite(Date.parse(input.date)) ||
    !["vending", "pickup", "delivery"].includes(input.method) ||
    !Number.isInteger(input.quantity ?? 1) ||
    (input.quantity ?? 1) < 1 ||
    (input.quantity ?? 1) > 20 ||
    !["09:00", "12:00", "15:00", "18:00", "21:00"].includes(input.time)
  )
    return { error: "date" };
  if (
    s.reservations.some(
      (r) =>
        r.status === "reserved" &&
        r.date === input.date &&
        r.time === input.time &&
        r.method === input.method,
    )
  )
    return { error: "conflict" };
  if (availability(s, input.product, now).studio < (input.quantity ?? 1))
    return { error: "unavailable" };
  const pin = code(s.reservations.map((r) => r.code));
  return {
    code: pin,
    state: reconcile(
      {
        ...s,
        reservations: [
          ...s.reservations,
          {
            ...input,
            id: id(),
            code: pin,
            status: "reserved",
            expiresAt: addDays(1, input.date) + "T21:59:59Z",
          },
        ],
      },
      undefined,
      now,
    ),
  };
}
export function prepareReorder(s: DemoState, items: CartItem[]) {
  let added = 0;
  const unavailable: string[] = [];
  const cart = [...s.cart];
  for (const item of items) {
    const p = s.catalog.find((p) => p.id === item.id);
    const inBag = cart
      .filter((x) => x.id === item.id)
      .reduce((n, x) => n + x.qty, 0);
    if (
      !p ||
      availability(s, item.id).quantity < item.qty + inBag ||
      item.qty + inBag > 20
    ) {
      unavailable.push(item.id);
      continue;
    }
    cart.push({
      ...item,
      price: item.options ? variantPrice(p, item.options) : p.price,
    });
    added += item.qty;
  }
  return { cart, added, unavailable };
}
