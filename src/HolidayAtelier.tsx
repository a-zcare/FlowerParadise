import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { img, money, pick, type Text } from "./data";
import { availability, addDays, variantPrice } from "./domain";
import {
  calendarErrors,
  defaultDesign,
  giftComponents,
  isVisible,
} from "./commerce";
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
export default function HolidayAtelier() {
  const calendar = useLocation().pathname === "/advent-builder";
  return <Atelier key={String(calendar)} calendar={calendar} />;
}
function Atelier({ calendar }: { calendar: boolean }) {
  const { s, add, toast } = useStore();
  const t = useT();
  const [c, save] = useDraft(
    calendar ? "physical-advent" : "wreath",
    calendar ? "calendar" : "wreath",
  );
  const products = s.catalog.filter(
    (p) => p.category === (calendar ? 20 : 13) && isVisible(p, s.commerce),
  );
  const [fallbackId, setFallback] = useState(products[0]?.id || "xm-016");
  const id = c.lines?.[0]?.id || fallbackId;
  const p =
    products.find((p) => p.id === id) ||
    products[0] ||
    s.catalog.find((p) => p.id === "xm-016")!;
  const [size, setSize] = useState<ProductOptions["size"]>(c.draftSize || "M");
  const [name, setName] = useState(c.recipient || "");
  const [date, setDate] = useState(c.draftDate || "");
  const [card, setCard] = useState(false);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [source, setSource] = useState(0);
  const patch = (v: Partial<typeof c>) => {
    save({ ...c, ...v });
    setSaved(false);
  };
  const days =
    c.days || Array.from({ length: 24 }, () => ({ content: "", message: "" }));
  const w = c.wreath || {
    type: 0,
    greenery: 0,
    candles: 3,
    decorations: [],
    color: 0,
  };
  const patchW = (v: Partial<typeof w>) => patch({ wreath: { ...w, ...v } });
  const options: ProductOptions = {
    size,
    color: p.color,
    wrapping: "kraft",
    card,
    extraGift: false,
    method: "pickup",
    locationId: "dvp-studio",
    date: date || undefined,
    configuration: c,
  };
  const price = variantPrice(p, options);
  const errors = calendar
    ? calendarErrors(
        days,
        size === "S" ? "small" : size === "L" ? "large" : "medium",
      )
    : [];
  const unavailable =
    availability(s, p.id).studio <=
      s.cart.filter((x) => x.id === p.id).reduce((n, x) => n + x.qty, 0) ||
    s.seasonal.discovery.unavailableLocations.includes("dvp-studio");
  const tooSoon = !!date && date < addDays(p.seasonal?.preparationDays || 1);
  const labels = calendar
    ? [
        t("Stils", "Стиль", "Style"),
        t("Saņēmējs un budžets", "Получатель и бюджет", "Recipient & budget"),
        t("24 dienas", "24 дня", "24 days"),
        t("Iesaiņojums", "Упаковка", "Wrapping"),
        t("Pārskats", "Обзор", "Review"),
      ]
    : [
        t("Veids", "Тип", "Type"),
        t("Izmērs", "Размер", "Size"),
        t("Skujas", "Хвоя", "Greenery"),
        t("Sveces", "Свечи", "Candles"),
        t("Dekori", "Декор", "Decorations"),
        t("Krāsas", "Цвета", "Colors"),
        t("Pārskats", "Обзор", "Review"),
      ];
  const wreathTypes: Text[] = [
    ["Apaļš vainags", "Круглый венок", "Traditional round wreath"],
    ["Ziemeļu minimālisms", "Северный минимализм", "Minimalist Nordic wreath"],
    ["Koka pamatne", "Деревянная основа", "Wooden-base arrangement"],
    [
      "Piekārts Adventes aplis",
      "Подвесное адвентское кольцо",
      "Hanging Advent ring",
    ],
    ["Galda centrs", "Настольная композиция", "Table centerpiece"],
  ];
  const greenery: Text[] = [
    ["Egle", "Ель", "Spruce"],
    ["Baltegle", "Пихта", "Fir"],
    ["Priede", "Сосна", "Pine"],
    ["Jauktas skujas", "Смешанная хвоя", "Mixed greenery"],
    [
      "Mākslīgais dekors",
      "Искусственная хвоя",
      "Artificial decorative greenery",
    ],
  ];
  const candles: Text[] = [
    [
      "Četras tradicionālas sveces",
      "Четыре традиционные свечи",
      "Four traditional candles",
    ],
    ["Cilindriskas sveces", "Свечи-столбики", "Pillar candles"],
    ["LED sveces", "LED-свечи", "LED candles"],
    ["Bez svecēm", "Без свечей", "No candles"],
  ];
  const decorations: Text[] = [
    ["Čiekuri", "Шишки", "Pinecones"],
    ["Kaltēti apelsīni", "Сушёные апельсины", "Dried oranges"],
    ["Kanēlis", "Корица", "Cinnamon"],
    ["Ziemassvētku rotājumi", "Ёлочные украшения", "Christmas ornaments"],
    ["Dekoratīvas ogas", "Декоративные ягоды", "Decorative berries"],
    ["Zelta akcenti", "Золотые акценты", "Gold accents"],
    ["Sudraba akcenti", "Серебряные акценты", "Silver accents"],
    ["Samta lentes", "Бархатные ленты", "Velvet ribbons"],
    ["Koka dekori", "Деревянные украшения", "Wooden decorations"],
  ];
  const colors: Text[] = [
    ["Sarkans", "Красный", "Classic red"],
    ["Bordo", "Бордо", "Burgundy"],
    ["Zelts", "Золото", "Gold"],
    ["Sudrabs", "Серебро", "Silver"],
    ["Balts", "Белый", "White"],
    ["Dabisks", "Натуральный", "Natural"],
  ];
  return (
    <CommercePage
      title={
        calendar
          ? [
              "24 mazi, personiski mirkļi",
              "24 маленьких личных момента",
              "24 little moments, made personal",
            ]
          : [
              "Tavs Adventes vainags",
              "Ваш адвентский венок",
              "Your own Advent wreath",
            ]
      }
    >
      <div className="holiday-atelier">
        <Steps
          labels={labels}
          step={step}
          onChange={(v) => {
            setStep(v);
            document
              .getElementById(`atelier-${v}`)
              ?.scrollIntoView({ block: "center" });
          }}
        />
        <div className="commerce-columns">
          <form
            className="panel form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              if (errors.length || price > c.budget || unavailable || tooSoon)
                return;
              const note = [
                name,
                ...(calendar
                  ? days.map(
                      (d, i) =>
                        `${i + 1}: ${d.message || pick(giftComponents.find((g) => g.id === d.content)!.name, s.lang)}`,
                    )
                  : [
                      pick(wreathTypes[w.type], s.lang),
                      pick(greenery[w.greenery], s.lang),
                      pick(candles[w.candles], s.lang),
                      ...w.decorations.map((i) => pick(decorations[i], s.lang)),
                    ]),
              ]
                .filter(Boolean)
                .join(" · ");
              if (add(p.id, 1, note, undefined, options)) {
                setSaved(true);
                toast(
                  t(
                    "Koncepts pievienots grozam",
                    "Концепт добавлен в корзину",
                    "Your concept is in the bag",
                  ),
                );
              }
            }}
          >
            <section id="atelier-0">
              <h2>01 · {labels[0]}</h2>
              <Select
                label={t("Koncepta pamats", "Основа концепта", "Concept base")}
                value={p.id}
                onChange={(v) => {
                  setFallback(v);
                  patch({ lines: [{ id: v, qty: 1 }] });
                }}
                choices={products.map((p) => ({
                  id: p.id,
                  label: `${pick(p.name, s.lang)} · ${money(p.price, s.lang)}`,
                }))}
              />
              {!calendar && (
                <Select
                  label={t("Vainaga veids", "Тип венка", "Wreath type")}
                  value={w.type}
                  onChange={(v) => patchW({ type: Number(v) })}
                  choices={wreathTypes.map((n, i) => ({
                    id: i,
                    label: pick(n, s.lang),
                  }))}
                />
              )}
            </section>
            <section id="atelier-1">
              <h2>02 · {labels[1]}</h2>
              <div className="form-grid">
                <Select
                  label={t("Izmērs", "Размер", "Size")}
                  value={size}
                  onChange={(v) => {
                    setSize(v as typeof size);
                    patch({ draftSize: v as typeof size });
                  }}
                  choices={["S", "M", "L"].map((id, i) => ({
                    id,
                    label: `${id} · ${[80, 100, 140][i]}%`,
                  }))}
                />
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
              </div>
              <label>
                {t(
                  "Vārds vai īss teksts",
                  "Имя или короткий текст",
                  "Name or short message",
                )}
                <input
                  maxLength={60}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    patch({ recipient: e.target.value });
                  }}
                />
              </label>
            </section>
            {calendar ? (
              <section id="atelier-2">
                <h2>03 · {labels[2]}</h2>
                <p>
                  {t(
                    "Izvēlies saturu visām 24 dienām. Kabatiņas S/M/L ir ilustratīvas; lielie mini dekori neietilpst mazākajā izmērā.",
                    "Выберите содержимое всех 24 дней. Размеры ячеек S/M/L условные; крупные мини-подарки не помещаются в маленькие.",
                    "Fill all 24 days. S/M/L compartments are illustrative; larger mini gifts cannot fit in small compartments.",
                  )}
                </p>
                <button
                  className="btn outline"
                  type="button"
                  onClick={() =>
                    patch({
                      days: days.map((_, i) => ({
                        content: "note",
                        message: `${i + 1}. ${t("Mazs Ziemassvētku piedzīvojums", "Маленькое рождественское приключение", "A little Christmas adventure")}`,
                      })),
                    })
                  }
                >
                  {t("Ieteikt idejas", "Предложить идеи", "Suggest ideas")}
                </button>
                <div className="calendar-note-grid">
                  {days.map((d, i) => (
                    <div
                      className={`calendar-day ${errors.includes(String(i + 1)) ? "incomplete" : ""}`}
                      key={i}
                    >
                      <label className="check-label">
                        <input
                          type="checkbox"
                          checked={selected.includes(i)}
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? [...selected, i]
                                : selected.filter((j) => j !== i),
                            )
                          }
                        />
                        {t("Diena", "День", "Day")} {i + 1}
                      </label>
                      <Select
                        label={`${t("Saturs", "Содержимое", "Content")} ${i + 1}`}
                        value={d.content}
                        onChange={(v) =>
                          patch({
                            days: days.map((x, j) =>
                              i === j ? { ...x, content: v } : x,
                            ),
                          })
                        }
                        choices={[
                          {
                            id: "",
                            label: t("Izvēlies", "Выберите", "Choose"),
                          },
                          ...giftComponents.map((g) => ({
                            id: g.id,
                            label: `${pick(g.name, s.lang)} · ${money(g.price, s.lang)}`,
                          })),
                        ]}
                      />
                      <label>
                        {t("Ziņa", "Послание", "Message")} {i + 1}
                        <input
                          maxLength={100}
                          value={d.message}
                          onChange={(e) =>
                            patch({
                              days: days.map((x, j) =>
                                j === i ? { ...x, message: e.target.value } : x,
                              ),
                            })
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <Select
                  label={t(
                    "Kopēt no dienas",
                    "Копировать из дня",
                    "Copy from day",
                  )}
                  value={source}
                  onChange={(v) => setSource(Number(v))}
                  choices={days.map((_, i) => ({
                    id: i,
                    label: String(i + 1),
                  }))}
                />
                <button
                  className="btn outline"
                  type="button"
                  disabled={!selected.length}
                  onClick={() =>
                    patch({
                      days: days.map((d, i) =>
                        selected.includes(i) ? { ...days[source] } : d,
                      ),
                    })
                  }
                >
                  {t(
                    "Kopēt uz atlasītajām dienām",
                    "Скопировать в выбранные дни",
                    "Copy to selected days",
                  )}
                </button>
                <p role="status">
                  {t(
                    "Neaizpildītas vai nesaderīgas dienas",
                    "Незаполненные или несовместимые дни",
                    "Unfilled or incompatible days",
                  )}
                  : {errors.length}
                </p>
              </section>
            ) : (
              <>
                <section id="atelier-2">
                  <h2>03 · {labels[2]}</h2>
                  <Select
                    label={labels[2]}
                    value={w.greenery}
                    onChange={(v) => patchW({ greenery: Number(v) })}
                    choices={greenery.map((n, i) => ({
                      id: i,
                      label: pick(n, s.lang),
                    }))}
                  />
                </section>
                <section id="atelier-3">
                  <h2>04 · {labels[3]}</h2>
                  <Select
                    label={labels[3]}
                    value={w.candles}
                    onChange={(v) => patchW({ candles: Number(v) })}
                    choices={candles.map((n, i) => ({
                      id: i,
                      label: `${pick(n, s.lang)} · +€${[5, 8, 6, 0][i]}`,
                    }))}
                  />
                  <p className="error">
                    {t(
                      "Skujas ir degošas. Izvēlies LED sveces. Īstas sveces nedrīkst atstāt bez uzraudzības; konstrukcijas ugunsdrošība nav apstiprināta.",
                      "Хвоя горюча. Предпочтительны LED-свечи. Настоящие свечи нельзя оставлять без присмотра; пожаробезопасность конструкции не подтверждена.",
                      "Greenery is flammable. Prefer LED candles. Never leave real candles unattended; fire safety of the construction is unverified.",
                    )}
                  </p>
                </section>
                <section id="atelier-4">
                  <h2>05 · {labels[4]}</h2>
                  {decorations.map((d, i) => (
                    <label className="check-label" key={i}>
                      <input
                        type="checkbox"
                        checked={w.decorations.includes(i)}
                        onChange={(e) =>
                          patchW({
                            decorations: e.target.checked
                              ? [...w.decorations, i]
                              : w.decorations.filter((j) => j !== i),
                          })
                        }
                      />
                      {pick(d, s.lang)} · €2
                    </label>
                  ))}
                </section>
                <section id="atelier-5">
                  <h2>06 · {labels[5]}</h2>
                  <Select
                    label={labels[5]}
                    value={w.color}
                    onChange={(v) => patchW({ color: Number(v) })}
                    choices={colors.map((n, i) => ({
                      id: i,
                      label: pick(n, s.lang),
                    }))}
                  />
                </section>
              </>
            )}
            <section id={`atelier-${calendar ? 3 : 6}`}>
              <h2>
                {t(
                  "Iesaiņojums un saņemšana",
                  "Упаковка и получение",
                  "Wrapping & collection",
                )}
              </h2>
              <WrappingEditor
                value={c.wrapping}
                onChange={(v) => patch({ wrapping: v })}
              />
              <label>
                {t("Vēlamais datums", "Желаемая дата", "Preferred date")}
                <input
                  type="date"
                  min={addDays(p.seasonal?.preparationDays || 1)}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    patch({ draftDate: e.target.value || undefined });
                  }}
                />
              </label>
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
            </section>
            <button
              className="btn"
              disabled={
                errors.length > 0 || price > c.budget || unavailable || tooSoon
              }
            >
              {t(
                "Pievienot konceptu grozam",
                "Добавить концепт в корзину",
                "Add concept to bag",
              )}{" "}
              · {money(price, s.lang)}
            </button>
            {saved && (
              <p role="status">
                {t(
                  "Saglabāts grozā",
                  "Сохранено в корзине",
                  "Saved in your bag",
                )}
              </p>
            )}
            <Link to="/cart">
              {t("Atvērt grozu", "Открыть корзину", "View bag")} →
            </Link>
            <p className="muted">
              {t(
                "Melnraksts saglabājas automātiski šajā pārlūkā.",
                "Черновик автоматически сохраняется в этом браузере.",
                "Draft saves automatically in this browser.",
              )}
            </p>
          </form>
          <aside className="panel form-panel commerce-summary">
            <h2>{t("Tavs koncepts", "Ваш концепт", "Your concept")}</h2>
            <img
              className="atelier-photo"
              src={img(p.photo)}
              alt={t("Stila iedvesma", "Пример стиля", "Style inspiration")}
            />
            <p className="muted">
              {t(
                "Foto ir stila piemērs. Zemāk — shematisks konfigurācijas priekšskatījums.",
                "Фото — пример стиля. Ниже — схема выбранной конфигурации.",
                "Photo is style inspiration. Below is a schematic configuration preview.",
              )}
            </p>
            {calendar ? (
              <div className="atelier-calendar">
                {days.map((d, i) => (
                  <div key={i}>
                    <b>{i + 1}</b>
                    <span>
                      {giftComponents.find((g) => g.id === d.content)
                        ? pick(
                            giftComponents.find((g) => g.id === d.content)!
                              .name,
                            s.lang,
                          )
                        : "—"}
                    </span>
                    <span>{d.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div
                  className={`atelier-wreath wreath-type-${w.type} greenery-${w.greenery}`}
                  style={
                    {
                      "--decor-color": [
                        "#a62937",
                        "#702b3c",
                        "#b89747",
                        "#a2a5ad",
                        "#f4efdd",
                        "#987754",
                      ][w.color],
                    } as React.CSSProperties
                  }
                >
                  <span>{name || "Flower Paradise"}</span>
                  {w.candles !== 3 &&
                    [0, 1, 2, 3].map((i) => (
                      <i key={i}>{w.candles === 2 ? "✦" : "▮"}</i>
                    ))}
                  <small>
                    {w.decorations
                      .map(
                        (i) =>
                          ["✦", "◉", "∥", "●", "••", "✧", "✧", "⋈", "❋"][i],
                      )
                      .join(" ")}
                  </small>
                </div>
                <p>
                  {pick(wreathTypes[w.type], s.lang)} ·{" "}
                  {pick(greenery[w.greenery], s.lang)} ·{" "}
                  {pick(candles[w.candles], s.lang)}
                </p>
                <p>
                  {w.decorations
                    .map((i) => pick(decorations[i], s.lang))
                    .join(" · ")}
                </p>
              </>
            )}
            <p>
              {t(
                "Aptuvenie izmēri",
                "Примерные размеры",
                "Approximate dimensions",
              )}
              : {p.size} · {size} ({t("Ilustratīvi", "Условно", "Illustrative")}
              )
            </p>
            <p>
              {t(
                "Sagatavošanas koncepts",
                "Концепция подготовки",
                "Preparation concept",
              )}
              : {p.seasonal?.preparationDays || 1} {t("dienas", "дня", "days")}
            </p>
            <p>{pick(p.care, s.lang)}</p>
            <p className="muted">{pick(p.seasonal!.safety, s.lang)}</p>
            <div className="summary-total">{money(price, s.lang)}</div>
            <p role="status" className={price > c.budget ? "error" : ""}>
              {t("Budžetā atlicis", "Осталось в бюджете", "Budget remaining")}:{" "}
              {money(c.budget - price, s.lang)}
            </p>
            <p className="muted">
              {t(
                "Cenā iekļautas visas izvēlētās sastāvdaļas. Saturs, izmēri un izgatavošana jāapstiprina pirms reālas tirdzniecības.",
                "Цена включает выбранные компоненты. Состав, размеры и изготовление требуют подтверждения перед реальными продажами.",
                "Price includes selected components. Contents, dimensions and manufacturing require confirmation before real sales.",
              )}
            </p>
            {calendar && (
              <Link to="/advent">
                {t(
                  "Digitālais Adventes kalendārs",
                  "Цифровой адвент-календарь",
                  "Digital Advent calendar",
                )}{" "}
                →
              </Link>
            )}
            <button
              className="text-link"
              onClick={() =>
                save(defaultDesign(calendar ? "calendar" : "wreath"))
              }
            >
              {t("Jauns melnraksts", "Новый черновик", "New draft")}
            </button>
          </aside>
        </div>
      </div>
    </CommercePage>
  );
}
