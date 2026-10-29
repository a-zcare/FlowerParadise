import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { img, money, pick, categories, type Text, type Product } from "./data";
import { variantPrice, availability } from "./domain";
import {
  defaultDesign,
  isVisible,
  recommendChristmas,
  readiness,
  shareWishlist,
  readSharedWishlist,
  type GiftAnswers,
} from "./commerce";
import type { ProductOptions } from "./models";
import { useStore, uid } from "./store";
import { ProductCard, useT } from "./ui";
import { CommercePage, Select, Steps, WrappingEditor } from "./CommerceUI";
import { recipientChoices, recipientIds } from "./GiftStudio";
export default function ChristmasDiscovery() {
  const path = useLocation().pathname;
  return path === "/gift-finder" ? (
    <GiftFinder />
  ) : path === "/wishlists" ? (
    <Wishlists />
  ) : path === "/last-minute" ? (
    <LastMinute />
  ) : (
    <Collections />
  );
}
function GiftFinder() {
  const { s } = useStore();
  const t = useT();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<GiftAnswers>({
    recipient: "parents",
    age: "adult",
    budget: 60,
    style: "natural",
    type: "all",
    personal: false,
    needed: "planned",
  });
  const labels = [
    t("Saņēmējs", "Получатель", "Recipient"),
    t("Vecuma grupa", "Возрастная группа", "Age group"),
    t("Budžets", "Бюджет", "Budget"),
    t("Stils", "Стиль", "Style"),
    t("Dāvanas veids", "Тип подарка", "Gift type"),
    t("Personalizācija", "Персонализация", "Personalization"),
    t("Kad vajag?", "Когда нужен?", "When needed?"),
  ];
  const reasons: Record<string, string> = {
    playful: t("Rotaļīgs dekors", "Игривый декор", "Playful decoration"),
    age: t(
      "Izvēlētās vecuma grupas dāvanu ideja",
      "Подарочная идея для выбранного возраста",
      "Gift idea for the selected age group",
    ),
    budget: t("Ietilpst budžetā", "Укладывается в бюджет", "Within budget"),
    recipient: t(
      "Atbilst saņēmējam",
      "Подходит получателю",
      "Matches recipient",
    ),
    type: t("Izvēlētais veids", "Предпочтительный тип", "Preferred gift type"),
    personal: t(
      "Personalizējams",
      "Можно персонализировать",
      "Can be personalized",
    ),
    natural: t("Dabiskas faktūras", "Природные материалы", "Natural textures"),
    luxury: t(
      "Premium cenu diapazons",
      "Премиальный ценовой диапазон",
      "Premium price range",
    ),
    soon: t(
      "Ātrākas sagatavošanas koncepts",
      "Концепция быстрой подготовки",
      "Quicker preparation concept",
    ),
  };
  const result = recommendChristmas(
    s.catalog.filter((p) => isVisible(p, s.commerce)),
    a,
  );
  return (
    <CommercePage
      title={[
        "Atrodi svētku dāvanu",
        "Найдите праздничный подарок",
        "Smart Christmas Gift Finder",
      ]}
    >
      <Steps labels={labels} step={step} onChange={setStep} />
      <div className="panel form-panel finder-panel">
        {step === 0 && (
          <Select
            label={labels[0]}
            value={a.recipient}
            onChange={(recipient) => setA({ ...a, recipient })}
            choices={recipientIds.map((id, i) => ({
              id,
              label: pick(recipientChoices[i], s.lang),
            }))}
          />
        )}{" "}
        {step === 1 && (
          <Select
            label={labels[1]}
            value={a.age}
            onChange={(age) => setA({ ...a, age })}
            choices={[
              {
                id: "child",
                label: t(
                  "Bērns · Dekori pieaugušo uzraudzībā",
                  "Ребёнок · Декор под присмотром взрослых",
                  "Child · Decorations with adult supervision",
                ),
              },
              { id: "teen", label: t("Pusaudzis", "Подросток", "Teen") },
              { id: "adult", label: t("Pieaugušais", "Взрослый", "Adult") },
              { id: "senior", label: t("Seniors", "Пожилой", "Senior") },
            ]}
          />
        )}{" "}
        {step === 2 && (
          <label>
            {labels[2]} (€)
            <input
              type="number"
              min={5}
              max={1000}
              value={a.budget}
              onChange={(e) =>
                setA({ ...a, budget: Math.max(5, Number(e.target.value) || 5) })
              }
            />
          </label>
        )}
        {step === 3 && (
          <Select
            label={labels[3]}
            value={a.style}
            onChange={(style) => setA({ ...a, style })}
            choices={[
              { id: "natural", label: t("Dabisks", "Натуральный", "Natural") },
              { id: "luxury", label: t("Grezns", "Роскошный", "Luxury") },
              { id: "playful", label: t("Rotaļīgs", "Игривый", "Playful") },
            ]}
          />
        )}{" "}
        {step === 4 && (
          <Select
            label={labels[4]}
            value={a.type}
            onChange={(type) => setA({ ...a, type })}
            choices={[
              { id: "all", label: t("Jebkurš", "Любой", "Any") },
              ...categories.slice(12, 20).map((n, i) => ({
                id: String(i + 12),
                label: pick(n, s.lang),
              })),
            ]}
          />
        )}{" "}
        {step === 5 && (
          <label className="check-label">
            <input
              type="checkbox"
              checked={a.personal}
              onChange={(e) => setA({ ...a, personal: e.target.checked })}
            />
            {t(
              "Personalizācija ir svarīga",
              "Важна персонализация",
              "Personalization matters",
            )}
          </label>
        )}
        {step === 6 && (
          <Select
            label={labels[6]}
            value={a.needed}
            onChange={(needed) => setA({ ...a, needed })}
            choices={[
              {
                id: "soon",
                label: t(
                  "Drīz · Tikai sagatavošanas koncepts",
                  "Скоро · Только концепция подготовки",
                  "Soon · Preparation concept only",
                ),
              },
              {
                id: "planned",
                label: t(
                  "Ieplānota dāvana",
                  "Запланированный подарок",
                  "Planned gift",
                ),
              },
            ]}
          />
        )}
        <div className="row-between">
          <button
            className="btn outline"
            disabled={!step}
            onClick={() => setStep(step - 1)}
          >
            {t("Atpakaļ", "Назад", "Back")}
          </button>
          <button
            className="btn"
            disabled={step === 6}
            onClick={() => setStep(step + 1)}
          >
            {t("Tālāk", "Далее", "Next")}
          </button>
        </div>
      </div>
      <h2 className="commerce-heading">
        {t(
          "Ieteikumi pēc skaidriem noteikumiem",
          "Рекомендации по понятным правилам",
          "Explainable recommendations",
        )}
      </h2>
      <p className="muted">
        {t(
          "Vecuma grupa ir ieteikuma konteksts, nevis drošības sertifikācija. Tiek piemērots budžets un izvēlētie filtri.",
          "Возраст — контекст подбора, а не сертификат безопасности. Применяются бюджет и выбранные предпочтения.",
          "Age is recommendation context, not a safety certification. Budget and selected preferences guide the results.",
        )}
      </p>
      <div className="commerce-product-grid">
        {result.map((r) => (
          <section key={r.product.id}>
            <ProductCard p={r.product} />
            <ul className="match-reasons">
              {r.reasons.map((reason) => (
                <li key={reason}>{reasons[reason]}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {!result.length && (
        <p role="status">
          {t(
            "Nav piemērotu preču. Palielini budžetu vai maini izvēles.",
            "Подходящих товаров нет. Увеличьте бюджет или измените предпочтения.",
            "No matching products. Increase the budget or adjust preferences.",
          )}
        </p>
      )}
    </CommercePage>
  );
}
const collectionTitles: Text[] = [
  [
    "Mājīgs Ziemassvētku vakars",
    "Уютный рождественский вечер",
    "Cozy Christmas Evening",
  ],
  [
    "Ziemassvētku ģimenes vakars",
    "Рождественский семейный вечер",
    "Christmas Family Night",
  ],
  [
    "Romantisks ziemas vakars",
    "Романтический зимний вечер",
    "Romantic Winter Evening",
  ],
  ["Izrotā dzīvokli", "Украсьте квартиру", "Decorate Your Apartment"],
  [
    "Ziemeļu Ziemassvētku mājas",
    "Скандинавский рождественский дом",
    "Nordic Christmas Home",
  ],
  [
    "Grezns svētku galds",
    "Роскошный праздничный стол",
    "Luxury Christmas Table",
  ],
  ["Ziemassvētku rīts", "Рождественское утро", "Christmas Morning"],
  ["Ziemas tējas ceremonija", "Зимняя чайная церемония", "Winter Tea Ceremony"],
  ["Ziemassvētki vecākiem", "Рождество для родителей", "Christmas for Parents"],
  ["Ziemassvētki kolēģiem", "Рождество для коллег", "Christmas for Colleagues"],
  [
    "Korporatīvā svētku kolekcija",
    "Корпоративная праздничная коллекция",
    "Corporate Holiday Collection",
  ],
  [
    "Pēdējā brīža dāvana",
    "Подарок в последний момент",
    "Last-Minute Christmas Gift",
  ],
  [
    "Premium Adventes kolekcija",
    "Премиальная адвентская коллекция",
    "Premium Advent Collection",
  ],
  [
    "Svētku mājas sākuma komplekts",
    "Стартовый набор праздничного дома",
    "Christmas Home Starter Kit",
  ],
  [
    "Flower Paradise izlase",
    "Фирменная коллекция Flower Paradise",
    "Flower Paradise Signature Collection",
  ],
];
export const curatedCollections = collectionTitles.map((title, i) => ({
  id: `collection-${i + 1}`,
  title,
  items: [
    `xm-${String([76, 80, 101, 61, 19, 18, 91, 84, 79, 89, 87, 31, 16, 65, 110][i]).padStart(3, "0")}`,
    `xm-${String([31, 33, 48, 91, 64, 53, 36, 77, 101, 105, 103, 96, 25, 46, 34][i]).padStart(3, "0")}`,
  ],
}));
function Collections() {
  const { s, addMany, toast } = useStore();
  const t = useT();
  const [selected, setSelected] = useState(0);
  const [omit, setOmit] = useState<string[]>([]);
  const [c, setC] = useState(defaultDesign("gift"));
  const [message, setMessage] = useState("");
  const [card, setCard] = useState(false);
  const current = curatedCollections[selected];
  const chosen = current.items
    .filter((id) => !omit.includes(id))
    .map((id) => s.catalog.find((p) => p.id === id))
    .filter((p): p is Product => !!p && isVisible(p, s.commerce));
  const opts: ProductOptions = {
    size: "M",
    color: 3,
    wrapping: "kraft",
    card,
    extraGift: false,
    method: "pickup",
    configuration: c,
  };
  const sum = chosen.reduce(
    (n, p, i) =>
      n +
      variantPrice(p, {
        ...opts,
        card: i === 0 && card,
        configuration: i === 0 ? c : undefined,
      }),
    0,
  );
  return (
    <CommercePage
      title={[
        "Gatavas svētku kolekcijas",
        "Готовые праздничные коллекции",
        "Ready-made Christmas Collections",
      ]}
    >
      <div className="collection-tiles">
        {curatedCollections.map((v, i) => (
          <button
            key={v.id}
            className={i === selected ? "selected" : ""}
            onClick={() => {
              setSelected(i);
              setOmit([]);
            }}
          >
            <img
              src={img(s.catalog.find((p) => p.id === v.items[0])!.photo)}
              alt=""
              loading="lazy"
            />
            <span>{pick(v.title, s.lang)}</span>
          </button>
        ))}
      </div>
      <div className="commerce-columns">
        <section className="panel form-panel">
          <h2>{pick(current.title, s.lang)}</h2>
          {current.items.map((id, i) => {
            const p = s.catalog.find((p) => p.id === id)!;
            return (
              <div className="bundle-line" key={id}>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={!omit.includes(id)}
                    disabled={i === 0}
                    onChange={(e) =>
                      setOmit(
                        e.target.checked
                          ? omit.filter((x) => x !== id)
                          : [...omit, id],
                      )
                    }
                  />
                  {pick(p.name, s.lang)} · {money(p.price, s.lang)}
                </label>
                <Link to={`/product/${id}`}>
                  {t("Detaļas", "Подробнее", "Details")} →
                </Link>
              </div>
            );
          })}
          <WrappingEditor
            value={c.wrapping}
            onChange={(wrapping) => setC({ ...c, wrapping })}
          />
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
          <label>
            {t("Vēstījums", "Послание", "Greeting")}
            <textarea
              maxLength={300}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
        </section>
        <aside className="panel form-panel commerce-summary">
          <p>
            {t("Komponentu summa", "Сумма компонентов", "Component subtotal")}:{" "}
            {money(
              chosen.reduce((n, p) => n + p.price, 0),
              s.lang,
            )}
          </p>
          <div className="summary-total">
            {t("Kopā", "Итого", "Total")}: {money(sum, s.lang)}
          </div>
          <p>
            {t(
              "Nav komplekta atlaides; cena ir izvēlēto detaļu summa.",
              "Скидки за набор нет: цена равна сумме выбранных компонентов.",
              "No bundle discount; the price is the sum of selected components.",
            )}
          </p>
          <button
            className="btn"
            onClick={() => {
              if (
                addMany(
                  chosen.map((p, i) => ({
                    id: p.id,
                    qty: 1,
                    note: message,
                    options: {
                      ...opts,
                      card: i === 0 && card,
                      configuration: i === 0 ? c : undefined,
                    },
                  })),
                )
              )
                toast(
                  t(
                    "Kolekcija grozā",
                    "Коллекция в корзине",
                    "Collection added to bag",
                  ),
                );
            }}
          >
            {t(
              "Pievienot kolekciju",
              "Добавить коллекцию",
              "Add collection to bag",
            )}
          </button>
        </aside>
      </div>
    </CommercePage>
  );
}
function LastMinute() {
  const { s } = useStore();
  const t = useT();
  const [r, setR] = useState("same-day");
  const list = s.catalog.filter(
    (p) =>
      isVisible(p, s.commerce) &&
      (r === "now" ? availability(s, p.id).immediate : readiness(p) === r),
  );
  return (
    <CommercePage
      title={[
        "Pēdējā brīža svētku dāvanas",
        "Праздничные подарки в последний момент",
        "Last-Minute Christmas Gifts",
      ]}
    >
      <div className="panel form-panel">
        <Select
          label={t("Demo gatavība", "Демо-готовность", "Demo readiness")}
          value={r}
          onChange={setR}
          choices={[
            {
              id: "now",
              label: t(
                "Gatavs tagad · Automāta demo krājumi",
                "Готово сейчас · Демо-запас автомата",
                "Ready now · Demo vending stock",
              ),
            },
            {
              id: "same-day",
              label: t(
                "Tās pašas dienas koncepts",
                "Концепция подготовки сегодня",
                "Same-day preparation concept",
              ),
            },
            {
              id: "next-day",
              label: t(
                "Nākamās dienas koncepts",
                "Концепция подготовки завтра",
                "Next-day preparation concept",
              ),
            },
            {
              id: "made-to-order",
              label: t("Pēc pasūtījuma", "Под заказ", "Made to order"),
            },
          ]}
        />
        <p>
          {t(
            "Šis nav solījums par reālu pieejamību vai piegādi šodien.",
            "Это не обещание реального наличия или доставки сегодня.",
            "This is not a promise of physical availability or same-day delivery.",
          )}
        </p>
        <Link to="/certificates">
          {t(
            "Demo dāvanu kartes",
            "Демо-сертификаты",
            "Demo gift certificates",
          )}{" "}
          →
        </Link>
      </div>
      <div className="commerce-product-grid">
        {list.slice(0, 36).map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </CommercePage>
  );
}
function Wishlists() {
  const { s, set } = useStore();
  const t = useT();
  const [params] = useSearchParams();
  const [id, setId] = useState(s.commerce.wishlists[0]?.id || "");
  const [name, setName] = useState(
    t(
      "Ziemassvētku vēlmju saraksts",
      "Рождественский список желаний",
      "Christmas wishlist",
    ),
  );
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [importText, setImportText] = useState("");
  const selected = s.commerce.wishlists.find((w) => w.id === id);
  let shared: { name: string; items: string[] } | null = null;
  try {
    if (params.get("shared"))
      shared = readSharedWishlist(params.get("shared")!, s.catalog);
  } catch {
    shared = null;
  }
  const items = (shared || selected)?.items || s.wishlist;
  const list = s.catalog.filter((p) => items.includes(p.id));
  const update = (items: string[]) => {
    if (selected)
      set((o) => ({
        ...o,
        commerce: {
          ...o.commerce,
          wishlists: o.commerce.wishlists.map((w) =>
            w.id === id ? { ...w, items } : w,
          ),
        },
      }));
    else set((o) => ({ ...o, wishlist: items }));
  };
  return (
    <CommercePage
      title={[
        "Tavi dāvanu saraksti",
        "Ваши списки подарков",
        "Shareable Christmas Wishlists",
      ]}
    >
      <div className="panel form-panel">
        <p>
          {t(
            "Saraksti glabājas šajā pārlūkā. Saite satur līdz 30 preču ID un vispārīgu nosaukumu; tā nav sinhronizācija. Neiekļauj personisku informāciju nosaukumā.",
            "Списки хранятся в этом браузере. Ссылка содержит до 30 ID товаров и общее название; синхронизации нет. Не вводите личные данные в названии.",
            "Lists stay in this browser. Links contain up to 30 product IDs and a generic title; this is not synchronization. Do not include personal information in titles.",
          )}
        </p>
        {shared ? (
          <>
            <h2>{shared.name}</h2>
            <button
              className="btn"
              onClick={() => {
                const newId = uid();
                set((o) => ({
                  ...o,
                  commerce: {
                    ...o.commerce,
                    wishlists: [
                      ...o.commerce.wishlists,
                      { id: newId, ...shared! },
                    ],
                  },
                }));
                setId(newId);
              }}
            >
              {t(
                "Saglabāt lokālu kopiju",
                "Сохранить локальную копию",
                "Save local copy",
              )}
            </button>
          </>
        ) : (
          <>
            <Select
              label={t("Saraksts", "Список", "List")}
              value={id}
              onChange={setId}
              choices={[
                { id: "", label: t("Izlase", "Избранное", "Favorites") },
                ...s.commerce.wishlists.map((w) => ({
                  id: w.id,
                  label: w.name,
                })),
              ]}
            />
            <label>
              {t(
                "Vispārīgs saraksta nosaukums",
                "Общее название списка",
                "Generic list title",
              )}
              <input
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <div className="atelier-links">
              <button
                className="btn outline"
                disabled={!name.trim() || s.commerce.wishlists.length >= 20}
                onClick={() => {
                  const newId = uid();
                  set((o) => ({
                    ...o,
                    commerce: {
                      ...o.commerce,
                      wishlists: [
                        ...o.commerce.wishlists,
                        {
                          id: newId,
                          name: name.trim(),
                          items: [...o.wishlist],
                        },
                      ],
                    },
                  }));
                  setId(newId);
                }}
              >
                {t(
                  "Jauns saraksts no izlases",
                  "Создать список из избранного",
                  "New list from favorites",
                )}
              </button>
              <button
                className="btn outline"
                disabled={!selected}
                onClick={() =>
                  set((o) => ({
                    ...o,
                    commerce: {
                      ...o.commerce,
                      wishlists: o.commerce.wishlists.map((w) =>
                        w.id === id
                          ? {
                              ...w,
                              name: name.trim() || w.name,
                              items: [...new Set([...w.items, ...o.wishlist])],
                            }
                          : w,
                      ),
                    },
                  }))
                }
              >
                {t("Pievienot izlasi", "Добавить избранное", "Add favorites")}
              </button>
              <button
                className="btn outline"
                onClick={() => {
                  try {
                    const data = shareWishlist(selected?.name || name, items);
                    setLink(
                      `${location.origin}${import.meta.env.BASE_URL}#/wishlists?shared=${new URLSearchParams({ x: data }).toString().slice(2)}`,
                    );
                    setImportText(decodeURIComponent(data));
                    setError("");
                  } catch {
                    setError(
                      t(
                        "Saraksts ir pārāk liels",
                        "Список слишком большой",
                        "List is too large",
                      ),
                    );
                  }
                }}
              >
                {t(
                  "Sagatavot saiti un eksportu",
                  "Подготовить ссылку и экспорт",
                  "Prepare share link & export",
                )}
              </button>
            </div>
            <label>
              {t("Kopējama saite", "Ссылка для копирования", "Copyable link")}
              <input readOnly value={link} />
            </label>
            <button
              className="btn outline"
              disabled={!link}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                } catch {
                  setError(
                    t(
                      "Kopē saiti manuāli",
                      "Скопируйте ссылку вручную",
                      "Copy the link manually",
                    ),
                  );
                }
              }}
            >
              {t("Kopēt saiti", "Скопировать ссылку", "Copy link")}
            </button>
            <label>
              {t(
                "JSON eksports / imports",
                "Экспорт / импорт JSON",
                "JSON export / import",
              )}
              <textarea
                value={importText}
                maxLength={3500}
                onChange={(e) => setImportText(e.target.value)}
              />
            </label>
            <button
              className="btn outline"
              onClick={() => {
                try {
                  const v = readSharedWishlist(
                    encodeURIComponent(importText),
                    s.catalog,
                  );
                  const newId = uid();
                  set((o) => ({
                    ...o,
                    commerce: {
                      ...o.commerce,
                      wishlists: [
                        ...o.commerce.wishlists,
                        { id: newId, ...v },
                      ].slice(-20),
                    },
                  }));
                  setId(newId);
                  setError("");
                } catch {
                  setError(
                    t(
                      "Nederīgs saraksts",
                      "Некорректный список",
                      "Invalid wishlist",
                    ),
                  );
                }
              }}
            >
              {t(
                "Importēt lokālu kopiju",
                "Импортировать локальную копию",
                "Import local copy",
              )}
            </button>
          </>
        )}
        {error && <p role="alert">{error}</p>}
        <div className="summary-total">
          {t("Budžeta summa", "Сумма бюджета", "Budget summary")}:{" "}
          {money(
            list.reduce((n, p) => n + p.price, 0),
            s.lang,
          )}
        </div>
      </div>
      <div className="commerce-product-grid">
        {list.map((p) => (
          <section key={p.id}>
            <ProductCard p={p} />
            {!shared && (
              <button
                className="text-link"
                onClick={() => update(items.filter((id) => id !== p.id))}
              >
                {t(
                  "Noņemt no saraksta",
                  "Убрать из списка",
                  "Remove from list",
                )}
              </button>
            )}
          </section>
        ))}
      </div>
    </CommercePage>
  );
}
