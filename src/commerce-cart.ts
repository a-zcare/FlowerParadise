import type { CartItem, DemoState } from "./models";
import { availability, variantPrice, validOptions } from "./domain";
import { isVisible, calendarErrors } from "./commerce";
export function appendCart(s: DemoState, lines: CartItem[]): CartItem[] | null {
  if (!lines.length || lines.length > 30) return null;
  const counts = new Map<string, number>();
  for (const x of [...s.cart, ...lines])
    counts.set(x.id, (counts.get(x.id) || 0) + x.qty);
  for (const x of lines) {
    const p = s.catalog.find((p) => p.id === x.id);
    if (
      !p ||
      !isVisible(p, s.commerce) ||
      !Number.isInteger(x.qty) ||
      x.qty < 1 ||
      x.qty > 20 ||
      (x.options && !validOptions(x.options)) ||
      !Number.isFinite(x.price ?? p.price)
    )
      return null;
    if (
      x.options?.configuration?.kind === "calendar" &&
      calendarErrors(
        x.options.configuration.days || [],
        x.options.size === "S"
          ? "small"
          : x.options.size === "L"
            ? "large"
            : "medium",
      ).length
    )
      return null;
    const a = availability(s, x.id);
    if (
      (counts.get(x.id) || 0) > Math.min(20, x.options ? a.studio : a.quantity)
    )
      return null;
  }
  let cart = [...s.cart];
  for (const x of lines) {
    const p = s.catalog.find((p) => p.id === x.id)!;
    const entry = {
      ...x,
      price: x.options ? variantPrice(p, x.options) : x.price,
    };
    const index = cart.findIndex(
      (o) =>
        o.id === entry.id &&
        o.note === entry.note &&
        o.price === entry.price &&
        JSON.stringify(o.options) === JSON.stringify(entry.options),
    );
    if (index < 0) cart.push(entry);
    else
      cart = cart.map((v, i) =>
        i === index ? { ...v, qty: v.qty + entry.qty } : v,
      );
  }
  return cart;
}
