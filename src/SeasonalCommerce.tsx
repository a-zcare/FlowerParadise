import { Check, Gift, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { categories, img, money, pick, type Product } from "./data";
import { availability, round, variantPrice } from "./domain";
import { useT } from "./i18n";
import { useStore } from "./store";
import { Demo, Title } from "./ui";
export function HolidayPersonalization({
  p,
  onChange,
}: {
  p: Product;
  onChange: (value: string) => void;
}) {
  const t = useT();
  const { s } = useStore();
  const [name, setName] = useState("");
  const [ribbon, setRibbon] = useState(0);
  const [box, setBox] = useState("kraft");
  const detail = p.seasonal!;
  const labels = useMemo(
    () => ({
      kraft: pick(["Dabīgs krafts", "Натуральный крафт", "Natural kraft"],s.lang),
      ivory: pick(["Ziloņkauls", "Слоновая кость", "Ivory"],s.lang),
      burgundy: pick(["Bordo", "Бордо", "Burgundy"],s.lang),
    }),
    [s.lang],
  );
  useEffect(() => {
    onChange(
      [
        name,
        pick(detail.variants[ribbon], s.lang),
        labels[box as keyof typeof labels],
      ]
        .filter(Boolean)
        .join(" · "),
    );
  }, [name, ribbon, box, s.lang, onChange, detail.variants, labels]);
  return (
    <fieldset className="holiday-personalization">
      <legend>
        {t(
          "Dāvanas detaļas · Demo",
          "Детали подарка · Демо",
          "Gift details · Demo",
        )}
      </legend>
      {detail.personalization && (
        <label>
          {t(
            "Vārds vai rotājuma teksts",
            "Имя или текст украшения",
            "Name or ornament text",
          )}
          <input
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Demo"
          />
        </label>
      )}
      <div className="form-grid">
        <label>
          {t(
            "Lentes un dekoru stils",
            "Стиль ленты и декора",
            "Ribbon & decoration style",
          )}
          <select
            value={ribbon}
            onChange={(e) => setRibbon(Number(e.target.value))}
          >
            {detail.variants.map((v, i) => (
              <option key={i} value={i}>
                {pick(v, s.lang)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t(
            "Dāvanu kastes stils",
            "Стиль подарочной коробки",
            "Gift box style",
          )}
          <select value={box} onChange={(e) => setBox(e.target.value)}>
            {Object.entries(labels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="personalization-preview">
        <small>
          {t(
            "KONCEPTA PRIEKŠSKATĪJUMS",
            "ПРЕДПРОСМОТР КОНЦЕПТА",
            "CONCEPT PREVIEW",
          )}
        </small>
        {name || "Flower Paradise"}
        <small>
          {pick(detail.variants[ribbon], s.lang)} ·{" "}
          {labels[box as keyof typeof labels]}
        </small>
      </div>
      <p className="muted">
        {t(
          "Personalizācija ir demonstrācija. Izgatavošanas iespējas nav apstiprinātas.",
          "Персонализация демонстрационная. Производственные возможности не подтверждены.",
          "Personalization is a demonstration. Manufacturing capabilities are not confirmed.",
        )}
      </p>
    </fieldset>
  );
}
export default function ChristmasGiftBuilder() {
  const { s, add, toast } = useStore();
  const t = useT();
  const [budget, setBudget] = useState(100);
  const [selected, setSelected] = useState<string[]>([]);
  const [group, setGroup] = useState("17");
  const [q, setQ] = useState("");
  const [card, setCard] = useState(true);
  const [delivery, setDelivery] = useState(false);
  const [message, setMessage] = useState("");
  const [wrap, setWrap] = useState<"kraft" | "ivory" | "rose">("kraft");
  const chosen = s.catalog.filter((p) => selected.includes(p.id));
  const subtotal = round(
    chosen.reduce(
      (n, p) =>
        n +
        variantPrice(p, {
          size: "M",
          color: p.color,
          wrapping: wrap,
          card: false,
          extraGift: false,
          method: "pickup",
        }),
      0,
    ) + (card ? 5 : 0),
  );
  const total = subtotal + (delivery ? 5 : 0);
  const remaining = round(budget - total);
  const list = s.catalog.filter(
    (p) =>
      p.seasonal &&
      (!group || p.category === Number(group)) &&
      pick(p.name, s.lang).toLowerCase().includes(q.toLowerCase()),
  );
  const stockOkay = chosen.every(
    (p) =>
      availability(s, p.id).quantity >
      s.cart.filter((x) => x.id === p.id).reduce((n, x) => n + x.qty, 0),
  );
  return (
    <div className="page">
      <Title
        kicker="THE CHRISTMAS GIFT ATELIER"
        title={t(
          "Saliec kopā viņu prieku.",
          "Соберите их маленькую радость.",
          "Put their little happiness together.",
        )}
        description={t(
          "Dekors, rūķis, eglīte vai sveču kompozīcija — viens pārdomāts komplekts tavā budžetā. Tikai demonstrācija.",
          "Декор, гном, ёлочка или свечная композиция — продуманный набор в вашем бюджете. Только демонстрация.",
          "A decoration, gnome, little tree or candle arrangement — a thoughtful combination within your budget. Demonstration only.",
        )}
      />
      <Demo />
      <div className="holiday-builder-grid">
        <section className="panel form-panel">
          <div className="form-grid">
            <label>
              {t(
                "Tavs kopējais budžets (€)",
                "Общий бюджет (€)",
                "Your total budget (€)",
              )}
              <input
                type="number"
                min="5"
                max="1000"
                value={budget}
                onChange={(e) =>
                  setBudget(
                    Math.max(5, Math.min(1000, Number(e.target.value) || 5)),
                  )
                }
              />
            </label>
            <label>
              {t("Kolekcija", "Коллекция", "Collection")}
              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                <option value="">
                  {t(
                    "Visas svētku idejas",
                    "Все праздничные идеи",
                    "All holiday ideas",
                  )}
                </option>
                {categories.map(
                  (c, i) =>
                    i >= 12 && (
                      <option key={i} value={i}>
                        {pick(c, s.lang)}
                      </option>
                    ),
                )}
              </select>
            </label>
          </div>
          <label>
            {t("Meklēt dāvanu", "Найти подарок", "Find a gift")}
            <input value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <p className="muted">
            {t(
              "Līdz pieciem produktiem. Pievienošanas poga darbojas tikai budžeta ietvaros.",
              "До пяти товаров. Добавление доступно только в пределах бюджета.",
              "Up to five products. Adding the bundle is available only within budget.",
            )}
          </p>
          <div className="holiday-builder-products">
            {list.map((p) => (
              <button
                key={p.id}
                className={selected.includes(p.id) ? "selected" : ""}
                aria-pressed={selected.includes(p.id)}
                disabled={!selected.includes(p.id) && selected.length >= 5}
                onClick={() =>
                  setSelected((o) =>
                    o.includes(p.id)
                      ? o.filter((x) => x !== p.id)
                      : [...o, p.id],
                  )
                }
              >
                <img
                  src={img(p.photo)}
                  alt={t("Stila iedvesma", "Пример стиля", "Style inspiration")}
                  loading="lazy"
                />
                {selected.includes(p.id) ? (
                  <Check size={21} />
                ) : (
                  <Plus size={21} />
                )}
                <span>{pick(p.name, s.lang)}</span>
                <strong>{money(p.price, s.lang)}</strong>
              </button>
            ))}
          </div>
        </section>
        <aside className="panel form-panel holiday-builder-summary">
          <Gift size={28} />
          <h2>
            {t(
              "Tavs svētku komplekts",
              "Ваш праздничный набор",
              "Your little Christmas bundle",
            )}
          </h2>
          {chosen.length === 0 ? (
            <p className="muted">
              {t(
                "Izvēlies pirmo dāvanu.",
                "Выберите первый подарок.",
                "Choose the first little gift.",
              )}
            </p>
          ) : (
            chosen.map((p) => (
              <div className="summary-line" key={p.id}>
                <span>{pick(p.name, s.lang)}</span>
                <strong>{money(p.price, s.lang)}</strong>
              </div>
            ))
          )}
          <label className="check">
            <input
              type="checkbox"
              checked={card}
              onChange={(e) => setCard(e.target.checked)}
            />
            {t(
              "Apsveikuma kartīte · €5",
              "Открытка · €5",
              "Greeting card · €5",
            )}
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={delivery}
              onChange={(e) => setDelivery(e.target.checked)}
            />
            {t("Demo piegāde · €5", "Демо-доставка · €5", "Demo delivery · €5")}
          </label>
          <label>
            {t(
              "Iesaiņojums · Iekļauts",
              "Упаковка · Включена",
              "Wrapping · Included",
            )}
            <select
              value={wrap}
              onChange={(e) => setWrap(e.target.value as typeof wrap)}
            >
              <option value="kraft">
                {t("Dabīgs krafts", "Натуральный крафт", "Natural kraft")}
              </option>
              <option value="ivory">
                {t("Ziloņkauls", "Слоновая кость", "Ivory")}
              </option>
              <option value="rose">
                {t("Putekļaini rozā", "Пыльная роза", "Dusty rose")}
              </option>
            </select>
          </label>
          <label>
            {t("Personiska ziņa", "Личное послание", "Personal message")}
            <textarea
              maxLength={300}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <div className="summary-total">
            <span>{t("Kopā", "Итого", "Total")}</span>
            <strong>{money(total, s.lang)}</strong>
          </div>
          <p
            className={remaining < 0 ? "error" : "budget-remaining"}
            role="status"
          >
            {remaining < 0
              ? t(
                  "Budžets pārsniegts par",
                  "Бюджет превышен на",
                  "Over budget by",
                )
              : t("Budžetā atlicis", "Осталось в бюджете", "Budget remaining")}
            : {money(Math.abs(remaining), s.lang)}
          </p>
          <button
            className="btn"
            disabled={!chosen.length || remaining < 0 || !stockOkay}
            onClick={() => {
              for (const [i, p] of chosen.entries())
                add(p.id, 1, i === 0 ? message : "", undefined, {
                  size: "M",
                  color: p.color,
                  wrapping: wrap,
                  card: i === 0 && card,
                  extraGift: false,
                  method: delivery ? "delivery" : "pickup",
                });
              toast(
                t(
                  "Svētku komplekts pievienots grozam",
                  "Праздничный набор добавлен в корзину",
                  "Christmas bundle added to your bag",
                ),
              );
              setSelected([]);
            }}
          >
            {t(
              "Pievienot komplektu grozam",
              "Добавить набор в корзину",
              "Add bundle to bag",
            )}
            <ShoppingBag size={16} />
          </button>
          <Link className="text-link" to="/cart">
            {t("Atvērt grozu", "Открыть корзину", "View bag")}
          </Link>
          <p className="muted">
            {t(
              "Izvēļu maiņa var pārsniegt budžetu; komplektu nevar pievienot, kamēr cena nav samazināta.",
              "Изменение выбора может превысить бюджет; набор нельзя добавить, пока цена не уменьшена.",
              "Changing choices may exceed your budget; the bundle cannot be added until the total is reduced.",
            )}
          </p>
        </aside>
      </div>
    </div>
  );
}
