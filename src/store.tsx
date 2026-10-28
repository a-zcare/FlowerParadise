import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { pick, type Lang } from "./data";
import {
  STORAGE_KEY,
  availability,
  code,
  collectVending,
  consumeInventory,
  id,
  initialState,
  linePrice,
  prepareReorder,
  reconcile,
  reserveVending,
  variantPrice,
} from "./domain";
import type { CartItem, DemoState, ProductOptions } from "./models";
import { demoRepository } from "./repository";
export type {
  CartItem,
  Gift,
  Order,
  Reminder,
  Reservation,
  Subscription,
} from "./models";
export { consumeInventory, linePrice };
const initial = initialState();
export function readState(): DemoState {
  try {
    return demoRepository(localStorage).load();
  } catch {
    return initialState();
  }
}
interface Store {
  s: DemoState;
  set: Dispatch<SetStateAction<DemoState>>;
  toast: (v: string) => void;
  add: (
    id: string,
    qty?: number,
    note?: string,
    price?: number,
    options?: ProductOptions,
  ) => boolean;
  compare: (id: string) => void;
  reset: () => void;
  reserveSlot: (slotId: string) => string | null;
  redeemPickup: (value: string) => boolean;
  reorder: (items: CartItem[]) => { added: number; unavailable: string[] };
  actualPhotos: Record<string, string>;
  setActualPhoto: (id: string, url?: string) => void;
}
const Context = createContext<Store>({
  s: initial,
  set: () => {},
  toast: () => {},
  add: () => false,
  compare: () => {},
  reset: () => {},
  reserveSlot: () => null,
  redeemPickup: () => false,
  reorder: () => ({ added: 0, unavailable: [] }),
  actualPhotos: {},
  setActualPhoto: () => {},
});
export function Provider({ children }: { children: ReactNode }) {
  const [s, rawSet] = useState<DemoState>(readState);
  const [msg, toast] = useState("");
  const [actualPhotos, setPhotos] = useState<Record<string, string>>({});
  const set: Dispatch<SetStateAction<DemoState>> = useCallback(
    (action) =>
      rawSet((old) =>
        reconcile(typeof action === "function" ? action(old) : action, old),
      ),
    [],
  );
  const local = (lv: string, ru: string, en: string) =>
    pick([lv, ru, en], s.lang);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) rawSet(readState());
    };
    window.addEventListener("storage", sync);
    const timer = setInterval(() => rawSet((old) => reconcile(old)), 60000);
    return () => {
      window.removeEventListener("storage", sync);
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    try {
      demoRepository(localStorage).save(s);
    } catch {
      /* Continue in memory when storage is unavailable. */
    }
    document.documentElement.lang = s.lang;
    document.documentElement.dataset.theme = s.dark ? "dark" : "light";
  }, [s]);
  useEffect(() => {
    if (!msg) return;
    const timer = setTimeout(() => toast(""), 4000);
    return () => clearTimeout(timer);
  }, [msg]);
  function add(
    productId: string,
    qty = 1,
    note = "",
    price?: number,
    options?: ProductOptions,
  ) {
    const p = s.catalog.find((p) => p.id === productId);
    const existing = s.cart
      .filter((x) => x.id === productId)
      .reduce((n, x) => n + x.qty, 0);
    if (
      !p ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      existing + qty > Math.min(20, availability(s, productId).quantity)
    ) {
      toast(
        local(
          "Nepietiek demo krājumu. Izvēlies citu pušķi.",
          "Недостаточно демо-запаса. Выберите другой букет.",
          "Not enough demo stock. Choose another bouquet.",
        ),
      );
      return false;
    }
    const actualPrice = options ? variantPrice(p, options) : price;
    set((old) => {
      const found = old.cart.find(
        (x) =>
          x.id === productId &&
          x.note === note &&
          x.price === actualPrice &&
          JSON.stringify(x.options) === JSON.stringify(options),
      );
      return {
        ...old,
        cart: found
          ? old.cart.map((x) =>
              x === found ? { ...x, qty: Math.min(20, x.qty + qty) } : x,
            )
          : [
              ...old.cart,
              { id: productId, qty, note, price: actualPrice, options },
            ],
      };
    });
    return true;
  }
  function compare(productId: string) {
    if (s.comparison.includes(productId)) {
      set((o) => ({
        ...o,
        comparison: o.comparison.filter((x) => x !== productId),
      }));
      return;
    }
    if (s.comparison.length === 3) {
      toast(
        local(
          "Salīdzini ne vairāk par trim pušķiem.",
          "Сравнить можно не более трёх букетов.",
          "Compare up to three bouquets.",
        ),
      );
      return;
    }
    set((o) => ({ ...o, comparison: [...o.comparison, productId] }));
    toast(
      local(
        "Pievienots salīdzināšanai",
        "Добавлено к сравнению",
        "Added to comparison",
      ),
    );
  }
  function reset() {
    try {
      localStorage.removeItem("flower-paradise-v1");
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* In-memory reset is still available. */
    }
    setPhotos({});
    rawSet({ ...initialState(), lang: s.lang, dark: s.dark });
    toast(
      local(
        "Visi demo dati atiestatīti. Valoda un tēma saglabāta.",
        "Все демо-данные сброшены. Язык и тема сохранены.",
        "All demo data reset. Language and theme kept.",
      ),
    );
  }
  function reserveSlot(slotId: string) {
    const result = reserveVending(s, slotId);
    if (!result) return null;
    set(result.state);
    return result.code;
  }
  function redeemPickup(value: string) {
    const next = collectVending(s, value);
    if (!next) return false;
    set(next);
    return true;
  }
  function reorder(items: CartItem[]) {
    const result = prepareReorder(s, items);
    set((o) => ({ ...o, cart: result.cart }));
    return { added: result.added, unavailable: result.unavailable };
  }
  return (
    <Context.Provider
      value={{
        s,
        set,
        toast,
        add,
        compare,
        reset,
        reserveSlot,
        redeemPickup,
        reorder,
        actualPhotos,
        setActualPhoto: (productId, url) =>
          setPhotos((old) => {
            const copy = { ...old };
            if (url) copy[productId] = url;
            else delete copy[productId];
            return copy;
          }),
      }}
    >
      {children}
      <div className="toast" role="status" aria-live="polite">
        {msg}
      </div>
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
export const uid = id;
export const pickupCode = code;
export const locale = (lang: Lang) =>
  ({ lv: "lv-LV", ru: "ru-LV", en: "en-IE" })[lang];
