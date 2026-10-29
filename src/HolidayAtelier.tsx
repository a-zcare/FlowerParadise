import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Gift, ShoppingBag } from "lucide-react";
import { future, img, money, pick, type Text } from "./data";
import { availability, variantPrice } from "./domain";
import type { ProductOptions } from "./models";
import { useStore } from "./store";
import { Demo, Title, useT } from "./ui";

export default function HolidayAtelier() {
  const calendar = useLocation().pathname === "/advent-builder";
  return <Atelier key={calendar ? "calendar" : "wreath"} calendar={calendar} />;
}
function Atelier({ calendar }: { calendar: boolean }) {
  const { s, add, toast } = useStore();
  const t = useT();
  const products = s.catalog.filter((p) => p.category === (calendar ? 20 : 13));
  const [id, setId] = useState(products[0].id);
  const [size, setSize] = useState<ProductOptions["size"]>("M");
  const [wrapping, setWrapping] = useState<ProductOptions["wrapping"]>("kraft");
  const [style, setStyle] = useState(0);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [card, setCard] = useState(false);
  const [notes, setNotes] = useState<string[]>(Array(24).fill(""));
  const [saved, setSaved] = useState(false);
  const p = products.find((p) => p.id === id)!;
  const options: ProductOptions = {
    size,
    color: p.color,
    wrapping,
    card,
    extraGift: false,
    method: "pickup",
    locationId: "dvp-studio",
    date: date || undefined,
  };
  const price = variantPrice(p, options);
  const styles: Text[] = calendar
    ? [
        ["Ģimenes rituāli", "Семейные традиции", "Family rituals"],
        ["Sirsnīgi vārdi", "Тёплые слова", "Kind words"],
        ["Ziemas piedzīvojumi", "Зимние приключения", "Winter adventures"],
      ]
    : [
        [
          "Čiekuri un lina lente",
          "Шишки и льняная лента",
          "Pinecones & linen ribbon",
        ],
        [
          "Bordo samts un ogu dekors",
          "Бордовый бархат и декоративные ягоды",
          "Burgundy velvet & decorative berries",
        ],
        [
          "Zvaigznes un LED sveču iecere",
          "Звёзды и концепция LED-свечей",
          "Stars & LED candle concept",
        ],
      ];
  const inBag = s.cart
    .filter((x) => x.id === id)
    .reduce((n, x) => n + x.qty, 0);
  const unavailable =
    availability(s, id).studio <= inBag ||
    s.seasonal.discovery.unavailableLocations.includes("dvp-studio");
  const suggest = () => {
    const ideas: Text[][] = [
      [
        ["Uzraksti pateicību", "Напишите благодарность", "Write a thank you"],
        ["Pagatavojiet kakao", "Приготовьте какао", "Make cocoa together"],
        ["Izrotājiet logu", "Украсьте окно", "Decorate a window"],
        ["Pastaiga ziemā", "Зимняя прогулка", "Take a winter walk"],
      ],
      [
        ["Tu esi svarīgs", "Ты важен", "You matter"],
        ["Paldies par smaidu", "Спасибо за улыбку", "Thank you for your smile"],
        ["Lai mierīgs vakars", "Уютного вечера", "Have a peaceful evening"],
        ["Prieks būt kopā", "Радость быть вместе", "Happy to be together"],
      ],
      [
        [
          "Atrodi ziemas zvaigzni",
          "Найдите зимнюю звезду",
          "Find a winter star",
        ],
        ["Uzzīmē sniegpārsliņu", "Нарисуйте снежинку", "Draw a snowflake"],
        [
          "Izvēlies svētku dziesmu",
          "Выберите праздничную песню",
          "Choose a festive song",
        ],
        [
          "Iemūžini svētku gaismas",
          "Сфотографируйте праздничные огни",
          "Photograph festive lights",
        ],
      ],
    ];
    setNotes(
      Array.from({ length: 24 }, (_, i) => pick(ideas[style][i % 4], s.lang)),
    );
    setSaved(false);
  };
  return (
    <div className="page holiday-atelier">
      <Title
        kicker="CHRISTMAS ATELIER · 2026 / 2027"
        title={
          calendar
            ? t(
                "24 mazi, personiski mirkļi",
                "24 маленьких личных момента",
                "24 little moments, made personal",
              )
            : t(
                "Tavs Adventes vainags",
                "Ваш адвентский венок",
                "Your own Advent wreath",
              )
        }
        description={t(
          "Izvēlies pamatu, noformējumu un saņemšanas datumu. Koncepta izmaiņas saglabājas grozā.",
          "Выберите основу, оформление и дату получения. Настройки концепта сохраняются в корзине.",
          "Choose a base, finish and collection date. Your concept choices stay in the bag.",
        )}
      />
      <Demo />
      <div className="holiday-builder-grid">
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (unavailable || (date && date < future(1))) return;
            const note = [
              pick(styles[style], s.lang),
              name,
              ...(calendar
                ? notes
                    .map((n, i) => (n ? `${i + 1}: ${n}` : ""))
                    .filter(Boolean)
                : []),
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
          <label>
            {t("Koncepta pamats", "Основа концепта", "Concept base")}
            <select
              aria-label={t(
                "Koncepta pamats",
                "Основа концепта",
                "Concept base",
              )}
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setSaved(false);
              }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {pick(p.name, s.lang)} · {money(p.price, s.lang)}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label>
              {t("Izmērs", "Размер", "Size")}
              <select
                aria-label={t("Izmērs", "Размер", "Size")}
                value={size}
                onChange={(e) => setSize(e.target.value as typeof size)}
              >
                <option value="S">S · 80%</option>
                <option value="M">M · 100%</option>
                <option value="L">L · 140%</option>
              </select>
            </label>
            <label>
              {t("Iesaiņojums", "Упаковка", "Wrapping")}
              <select
                aria-label={t("Iesaiņojums", "Упаковка", "Wrapping")}
                value={wrapping}
                onChange={(e) => setWrapping(e.target.value as typeof wrapping)}
              >
                <option value="kraft">{t("Krafts", "Крафт", "Kraft")}</option>
                <option value="ivory">
                  {t("Ziloņkauls", "Слоновая кость", "Ivory")}
                </option>
                <option value="rose">{t("Rozā", "Розовый", "Rose")}</option>
              </select>
            </label>
          </div>
          <label>
            {calendar
              ? t("Ideju tēma", "Тема идей", "Idea theme")
              : t("Dekoru iecere", "Идея оформления", "Decoration concept")}
            <select
              aria-label={t(
                "Dekoru iecere",
                "Идея оформления",
                "Decoration concept",
              )}
              value={style}
              onChange={(e) => setStyle(Number(e.target.value))}
            >
              {styles.map((v, i) => (
                <option key={i} value={i}>
                  {pick(v, s.lang)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t(
              "Vārds vai īss teksts",
              "Имя или короткий текст",
              "Name or short message",
            )}
            <input
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            {t("Vēlamais datums", "Желаемая дата", "Preferred date")}
            <input
              type="date"
              min={future(1)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
          {calendar && (
            <>
              <h2>
                {t(
                  "Tavi 24 pārsteigumi",
                  "Ваши 24 сюрприза",
                  "Your 24 surprises",
                )}
              </h2>
              <p className="muted">
                {t(
                  "Tikai tekstu un aktivitāšu plāns. Fizisks pildījums nav iekļauts.",
                  "План текстов и занятий. Физическое наполнение не включено.",
                  "A plan for messages and activities. Physical contents are not included.",
                )}
              </p>
              <button className="btn outline" type="button" onClick={suggest}>
                {t("Ieteikt idejas", "Предложить идеи", "Suggest ideas")}
              </button>
              <div className="calendar-note-grid">
                {notes.map((n, i) => (
                  <label key={i}>
                    {t("Diena", "День", "Day")} {i + 1}
                    <input
                      maxLength={100}
                      value={n}
                      onChange={(e) =>
                        setNotes((old) =>
                          old.map((v, j) => (j === i ? e.target.value : v)),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </>
          )}
          <button
            className="btn"
            disabled={unavailable || (!!date && date < future(1))}
          >
            <ShoppingBag size={17} />
            {t(
              "Pievienot konceptu grozam",
              "Добавить концепт в корзину",
              "Add concept to bag",
            )}{" "}
            · {money(price, s.lang)}
          </button>
          {saved && (
            <p role="status">
              {t("Saglabāts grozā", "Сохранено в корзине", "Saved in your bag")}
            </p>
          )}
          <Link className="text-link" to="/cart">
            {t("Atvērt grozu", "Открыть корзину", "View bag")} →
          </Link>
        </form>
        <aside className="panel form-panel atelier-preview">
          <Gift size={26} />
          <h2>{t("Tavs koncepts", "Ваш концепт", "Your concept")}</h2>
          <img
            className="atelier-photo"
            src={img(p.photo)}
            alt={t("Stila iedvesma", "Пример стиля", "Style inspiration")}
          />
          <p className="muted">
            {t(
              "Attēls nemainās līdz ar izvēlēm. Stila iedvesma, nevis precīzs pasūtījuma foto.",
              "Фото не меняется при выборе опций. Пример стиля, а не точное фото заказа.",
              "The photo does not change with options. Style inspiration, not an exact order photograph.",
            )}
          </p>
          <h3>{pick(p.name, s.lang)}</h3>
          <p>
            {pick(styles[style], s.lang)} · {size} · {wrapping}
          </p>
          {calendar ? (
            <div
              className="atelier-calendar"
              aria-label={t("24 dienu plāns", "План на 24 дня", "24 day plan")}
            >
              {notes.map((n, i) => (
                <div key={i} title={n}>
                  <b>{i + 1}</b>
                  <span>{n || "✦"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`atelier-wreath wreath-style-${style}`}
              aria-label={t(
                "Shematisks vainaga plāns",
                "Схематичный план венка",
                "Schematic wreath plan",
              )}
            >
              <span>{name || "Flower Paradise"}</span>
              {[0, 1, 2, 3].map((i) => (
                <i key={i}>✦</i>
              ))}
            </div>
          )}
          <p>{name}</p>
          <div className="summary-total">
            <span>{t("Kopā", "Итого", "Total")}</span>
            <strong>{money(price, s.lang)}</strong>
          </div>
          <p className="muted">
            {t(
              "Noformējuma izvēles bez piemaksas šajā demo. Izmērs maina bāzes cenu, kartīte maksā €5. Ražošana un adrese nav apstiprināta.",
              "Выбор оформления без доплаты в демо. Размер меняет базовую цену, открытка стоит €5. Изготовление и адрес не подтверждены.",
              "Finishes are complimentary in this demo. Size changes the base price; a card adds €5. Manufacturing and pickup address are unconfirmed.",
            )}
          </p>
          <p className="muted">{pick(p.seasonal!.safety, s.lang)}</p>
        </aside>
      </div>
    </div>
  );
}
