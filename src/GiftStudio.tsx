import { useState } from "react";
import { Link } from "react-router-dom";
import { categories, img, money, pick, type Text } from "./data";
import { variantPrice } from "./domain";
import { defaultDesign, giftComponents, isVisible } from "./commerce";
import type { ProductOptions } from "./models";
import { useStore } from "./store";
import { useT } from "./ui";
import {
  CommercePage,
  Select,
  Steps,
  useDraft,
  WrappingEditor,
} from "./CommerceUI";
export const recipientChoices: Text[] = [
  ["Vecākiem", "Родителям", "Parents"],
  ["Viņai", "Ей", "Her"],
  ["Viņam", "Ему", "Him"],
  ["Pārim", "Паре", "Couple"],
  ["Kolēģiem", "Коллегам", "Colleagues"],
  ["Skolotājiem", "Учителям", "Teachers"],
  ["Bērniem", "Детям", "Children"],
  ["Uzņēmumam", "Компании", "Corporate"],
];
export const recipientIds = [
  "parents",
  "her",
  "him",
  "couples",
  "colleagues",
  "teachers",
  "children",
  "corporate",
];
export default function GiftStudio() {
  const { s, addMany, toast } = useStore();
  const t = useT();
  const [c, save] = useDraft("gift-studio", "gift");
  const [step, setStep] = useState(0);
  const message = c.message || "";
  const card = c.card || false;
  const setMessage = (message: string) => save({ ...c, message });
  const setCard = (card: boolean) => save({ ...c, card });
  const [filter, setFilter] = useState("");
  const lines = c.lines?.length ? c.lines : [{ id: "xm-076", qty: 1 }];
  const patch = (v: Partial<typeof c>) => save({ ...c, lines, ...v });
  const opts: ProductOptions = {
    size: "M",
    color: 3,
    wrapping: "kraft",
    card,
    extraGift: false,
    method: "pickup",
    locationId: "dvp-studio",
    configuration: { ...c, lines: undefined },
  };
  const total = lines.reduce((n, l, i) => {
    const p = s.catalog.find((p) => p.id === l.id);
    return (
      n +
      (p
        ? variantPrice(p, {
            ...opts,
            card: i === 0 && card,
            configuration: i === 0 ? opts.configuration : undefined,
          }) * l.qty
        : 0)
    );
  }, 0);
  const catalog = s.catalog.filter(
    (p) =>
      p.seasonal &&
      isVisible(p, s.commerce) &&
      (!filter || String(p.category) === filter) &&
      (lines.some((l) => l.id === p.id) || p.price <= c.budget),
  );
  const labels = [
    t("Saņēmējs", "Получатель", "Recipient"),
    t("Budžets", "Бюджет", "Budget"),
    t("Kaste", "Коробка", "Container"),
    t("Galvenā dāvana", "Главный подарок", "Main gift"),
    t("Papildinājumi", "Дополнения", "Extras"),
    t("Iesaiņojums", "Упаковка", "Wrapping"),
    t("Kartīte", "Открытка", "Card"),
    t("Vēstījums", "Послание", "Message"),
    t("Pārskats", "Обзор", "Review"),
    t("Grozs", "Корзина", "Bag"),
  ];
  function choose(id: string) {
    patch({
      lines: [{ id, qty: 1 }, ...lines.slice(1).filter((l) => l.id !== id)],
    });
  }
  return (
    <CommercePage
      title={[
        "Dāvanu konstruktors 2.0",
        "Конструктор подарков 2.0",
        "Gift Builder 2.0",
      ]}
    >
      <Steps labels={labels} step={step} onChange={setStep} />
      <div className="commerce-columns">
        <section className="panel form-panel">
          <h2>{labels[step]}</h2>
          {step === 0 && (
            <Select
              label={labels[0]}
              value={c.recipient}
              onChange={(v) => patch({ recipient: v })}
              choices={recipientIds.map((id, i) => ({
                id,
                label: pick(recipientChoices[i], s.lang),
              }))}
            />
          )}
          {step === 1 && (
            <label>
              {t(
                "Kopējais budžets (€)",
                "Общий бюджет (€)",
                "Total budget (€)",
              )}
              <input
                type="number"
                min={1}
                max={10000}
                value={c.budget}
                onChange={(e) =>
                  patch({
                    budget: Math.max(
                      1,
                      Math.min(10000, Number(e.target.value) || 1),
                    ),
                  })
                }
              />
            </label>
          )}
          {step === 2 && (
            <Select
              label={labels[2]}
              value={c.packaging}
              onChange={(v) => patch({ packaging: v as "box" | "basket" })}
              choices={[
                {
                  id: "box",
                  label: t(
                    "Dāvanu kaste · Iekļauta",
                    "Подарочная коробка · Включена",
                    "Gift box · Included",
                  ),
                },
                {
                  id: "basket",
                  label: t("Grozs · +€5", "Корзина · +€5", "Basket · +€5"),
                },
              ]}
            />
          )}
          {(step === 3 || step === 4) && (
            <>
              <Select
                label={t("Kolekcija", "Коллекция", "Collection")}
                value={filter}
                onChange={setFilter}
                choices={[
                  { id: "", label: t("Visas", "Все", "All") },
                  ...categories.slice(12, 21).map((v, i) => ({
                    id: String(i + 12),
                    label: pick(v, s.lang),
                  })),
                ]}
              />
              <div className="component-grid">
                {catalog.slice(0, filter ? 50 : 24).map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className={
                      lines.some((l) => l.id === p.id) ? "selected" : ""
                    }
                    onClick={() =>
                      step === 3
                        ? choose(p.id)
                        : patch({
                            lines: lines.some((l) => l.id === p.id)
                              ? lines.filter((l) => l.id !== p.id)
                              : lines.length < 5
                                ? [...lines, { id: p.id, qty: 1 }]
                                : lines,
                          })
                    }
                  >
                    <img src={img(p.photo)} alt="" loading="lazy" />
                    <span>{pick(p.name, s.lang)}</span>
                    <b>{money(p.price, s.lang)}</b>
                  </button>
                ))}
              </div>
              {step === 4 && (
                <>
                  <h3>
                    {t(
                      "Mazie papildinājumi",
                      "Небольшие дополнения",
                      "Little extras",
                    )}
                  </h3>
                  {giftComponents.map((g) => (
                    <label className="quantity-line" key={g.id}>
                      {pick(g.name, s.lang)} · {money(g.price, s.lang)}
                      <input
                        aria-label={pick(g.name, s.lang)}
                        type="number"
                        min={0}
                        max={20}
                        value={c.extras.find((x) => x.id === g.id)?.qty || 0}
                        onChange={(e) =>
                          patch({
                            extras: [
                              ...c.extras.filter((x) => x.id !== g.id),
                              {
                                id: g.id,
                                qty: Math.max(
                                  0,
                                  Math.min(
                                    20,
                                    Math.floor(Number(e.target.value) || 0),
                                  ),
                                ),
                              },
                            ].filter((x) => x.qty > 0),
                          })
                        }
                      />
                    </label>
                  ))}
                  <p className="muted">
                    {t(
                      "Pārtikas sastāvs un alergēni jāapstiprina. Dekoratīvās rotaļlietas nav sertificētas bērnu rotaļlietas.",
                      "Состав и аллергены еды требуют проверки. Декоративные игрушки не сертифицированы для детей.",
                      "Food ingredients and allergens require confirmation. Decorative toys are not certified children’s toys.",
                    )}
                  </p>
                </>
              )}
            </>
          )}
          {step === 5 && (
            <WrappingEditor
              value={c.wrapping}
              onChange={(v) => patch({ wrapping: v })}
            />
          )}
          {step === 6 && (
            <label className="check-label">
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
          )}
          {step === 7 && (
            <label>
              {t("Personiska ziņa", "Личное послание", "Personal message")}
              <textarea
                maxLength={300}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
          )}
          {step >= 8 && (
            <>
              <p>
                {t(
                  "Pārbaudi daudzumu un budžetu. Piegāde pēc izvēles noformēšanā maksā €5.",
                  "Проверьте количество и бюджет. Доставка при оформлении стоит €5.",
                  "Review quantities and budget. Optional delivery at checkout adds €5.",
                )}
              </p>
              <WrappingEditor
                value={c.wrapping}
                onChange={(v) => patch({ wrapping: v })}
              />
            </>
          )}
          <div className="row-between">
            <button
              type="button"
              className="btn outline"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              {t("Atpakaļ", "Назад", "Back")}
            </button>
            <button
              type="button"
              className="btn"
              disabled={step === 9}
              onClick={() => setStep(step + 1)}
            >
              {t("Tālāk", "Далее", "Next")}
            </button>
          </div>
          <p className="muted">
            {t(
              "Konfigurācija saglabājas lokāli automātiski.",
              "Конфигурация автоматически сохраняется локально.",
              "Configuration saves locally automatically.",
            )}
          </p>
        </section>
        <aside className="panel form-panel commerce-summary">
          <h2>{t("Tavs komplekts", "Ваш набор", "Your bundle")}</h2>
          {lines.map((l, i) => {
            const p = s.catalog.find((p) => p.id === l.id);
            return (
              p && (
                <div className="bundle-line" key={l.id}>
                  <Link to={`/product/${p.id}`}>{pick(p.name, s.lang)}</Link>
                  <input
                    aria-label={`${t("Daudzums", "Количество", "Quantity")}: ${p.id}`}
                    type="number"
                    min={1}
                    max={5}
                    value={l.qty}
                    onChange={(e) =>
                      patch({
                        lines: lines.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                qty: Math.max(
                                  1,
                                  Math.min(
                                    5,
                                    Math.floor(Number(e.target.value) || 1),
                                  ),
                                ),
                              }
                            : x,
                        ),
                      })
                    }
                  />
                  <button
                    className="text-link"
                    disabled={lines.length === 1}
                    onClick={() =>
                      patch({ lines: lines.filter((x) => x.id !== l.id) })
                    }
                  >
                    {t("Noņemt", "Убрать", "Remove")}
                  </button>
                </div>
              )
            );
          })}
          <p>
            {t(
              "Cenā: preces, papildinājumi, iepakojums un kartīte. Atlaide nav piemērota.",
              "Цена включает товары, дополнения, упаковку и открытку. Скидка не применяется.",
              "Includes products, extras, packaging and card. No discount applied.",
            )}
          </p>
          <div className="summary-total">
            <span>{t("Kopā", "Итого", "Total")}</span>
            <strong>{money(total, s.lang)}</strong>
          </div>
          <p role="status" className={total > c.budget ? "error" : ""}>
            {t("Budžetā atlicis", "Осталось в бюджете", "Budget remaining")}:{" "}
            {money(c.budget - total, s.lang)}
          </p>
          <button
            className="btn"
            disabled={total > c.budget}
            onClick={() => {
              const ok = addMany(
                lines.map((l, i) => ({
                  id: l.id,
                  qty: l.qty,
                  note: `${message} · ${pick(recipientChoices[Math.max(0, recipientIds.indexOf(c.recipient))], s.lang)}`,
                  options: {
                    ...opts,
                    card: i === 0 && card,
                    configuration: i === 0 ? opts.configuration : undefined,
                  },
                })),
              );
              if (ok)
                toast(
                  t(
                    "Komplekts grozā",
                    "Набор в корзине",
                    "Bundle added to bag",
                  ),
                );
            }}
          >
            {t(
              "Pievienot komplektu grozam",
              "Добавить набор в корзину",
              "Add configured bundle to bag",
            )}
          </button>
          <Link to="/cart">
            {t("Atvērt grozu", "Открыть корзину", "View bag")} →
          </Link>
          <Link to="/christmas-builder">
            {t(
              "Klasiskais konstruktors",
              "Классический конструктор",
              "Classic gift builder",
            )}
          </Link>
          <button
            className="text-link"
            onClick={() => {
              save(defaultDesign("gift"));
              setStep(0);
            }}
          >
            {t("Jauns melnraksts", "Новый черновик", "New draft")}
          </button>
        </aside>
      </div>
    </CommercePage>
  );
}
