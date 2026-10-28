import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Lang, Product } from "./data";
import { products } from "./data";
export interface CartItem {
  id: string;
  qty: number;
  note?: string;
  price?: number;
}
export interface Reservation {
  id: string;
  product: string;
  date: string;
  time: string;
  method: string;
  code: string;
  status: string;
  message?: string;
}
export interface Reminder {
  id: string;
  name: string;
  event: string;
  date: string;
  annual: boolean;
  days: number;
  channel: string;
  snoozed?: boolean;
  dismissed?: boolean;
}
export interface Order {
  time?: string;
  message?: string;
  id: string;
  date: string;
  total: number;
  items: CartItem[];
  method: string;
}
export interface Subscription {
  id: string;
  frequency: string;
  months: number;
  price: number;
  method: string;
  preference: string;
}
export interface Gift {
  recipient?: string;
  date?: string;
  id: string;
  amount: number;
  message: string;
  code: string;
  redeemed: boolean;
}
interface State {
  lang: Lang;
  dark: boolean;
  cart: CartItem[];
  wishlist: string[];
  reservations: Reservation[];
  reminders: Reminder[];
  orders: Order[];
  subscriptions: Subscription[];
  gifts: Gift[];
  catalog: Product[];
  picked: number[];
  preferences: { channel: string; fresh: boolean };
  promo: string;
}
const initial: State = {
  lang: "lv",
  dark: false,
  cart: [],
  wishlist: [],
  reservations: [],
  reminders: [],
  orders: [],
  subscriptions: [],
  gifts: [],
  catalog: products,
  picked: [],
  preferences: { channel: "email", fresh: false },
  promo: "",
};
export function readState(): State {
  try {
    const saved: Partial<State> = JSON.parse(
      localStorage.getItem("flower-paradise-v1") || "null",
    );
    if (
      !saved ||
      !Array.isArray(saved.cart) ||
      !["lv", "ru", "en"].includes(saved.lang || "")
    )
      return initial;
    const catalog = products.map((p) => {
      const custom = saved.catalog?.find((x) => x.id === p.id);
      return custom
        ? { ...p, name: custom.name, price: custom.price, stock: custom.stock }
        : p;
    });
    return { ...initial, ...saved, catalog };
  } catch {
    return initial;
  }
}
const Context = createContext<{
  s: State;
  set: React.Dispatch<React.SetStateAction<State>>;
  toast: (v: string) => void;
  add: (id: string, qty?: number, note?: string, price?: number) => void;
}>({ s: initial, set: () => {}, toast: () => {}, add: () => {} });
export function Provider({ children }: { children: ReactNode }) {
  const [s, set] = useState<State>(readState);
  const [msg, toast] = useState("");
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === "flower-paradise-v1") set(readState());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("flower-paradise-v1", JSON.stringify(s));
    } catch {
      /* Full or disabled storage: the demo remains usable in memory. */
    }
    document.documentElement.lang = s.lang;
    document.documentElement.dataset.theme = s.dark ? "dark" : "light";
  }, [s]);
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => toast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [msg]);
  const add = (id: string, qty = 1, note = "", price?: number) =>
    set((old) => {
      const found = old.cart.find(
        (x) => x.id === id && x.note === note && x.price === price,
      );
      return {
        ...old,
        cart: found
          ? old.cart.map((x) =>
              x === found ? { ...x, qty: Math.min(x.qty + qty, 20) } : x,
            )
          : [...old.cart, { id, qty, note, price }],
      };
    });
  return (
    <Context.Provider value={{ s, set, toast, add }}>
      {children}
      <div className="toast" role="status">
        {msg}
      </div>
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
export const pickupCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));
