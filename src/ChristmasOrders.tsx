import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { money, pick } from "./data";
import { availability, reserveFuture, variantPrice, dateKey } from "./domain";
import {
  christmasDates,
  defaultDesign,
  isVisible,
  slotIssue,
  windows,
} from "./commerce";
import type { DesignConfig } from "./commerce-model";
import type { ProductOptions } from "./models";
import { useStore, uid } from "./store";
import { useT } from "./ui";
import { CommercePage, Select, WrappingEditor } from "./CommerceUI";
export default function ChristmasOrders() {
  const p = useLocation().pathname;
  return p === "/corporate-christmas" ? (
    <Corporate />
  ) : p === "/order-confidence" ? (
    <OrderConfidence />
  ) : (
    <Preorders />
  );
}
function Preorders() {
  const { s, set } = useStore();
  const t = useT();
  const [id, setId] = useState("xm-031");
  const [qty, setQty] = useState(1);
  const [date, setDate] = useState(christmasDates[0]);
  const [time, setTime] = useState(windows[0]);
  const [method, setMethod] = useState<"pickup" | "delivery">("pickup");
  const [c, setC] = useState(defaultDesign("gift"));
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const p = s.catalog.find((p) => p.id === id)!;
  const options: ProductOptions = {
    size: "M",
    color: p.color,
    wrapping: "kraft",
    card: false,
    extraGift: false,
    method,
    date,
    time,
    locationId: method === "delivery" ? "dvp-delivery" : "dvp-studio",
    configuration: c,
  };
  const total =
    variantPrice(p, options) * qty + (method === "delivery" ? 5 : 0);
  const issue = slotIssue(
    date,
    time,
    qty,
    p.seasonal?.preparationDays || 1,
    s.commerce.slots,
    s.reservations,
  );
  const issueText: Record<string, string> = {
    invalid: t(
      "Izvēlies derīgu svētku datumu un daudzumu",
      "Выберите корректную праздничную дату и количество",
      "Choose a valid holiday date and quantity",
    ),
    cutoff: t(
      "Sagatavošanas termiņš vai pieņemšanas laiks ir beidzies",
      "Не соблюдён срок подготовки или время отсечения",
      "Preparation lead time or cutoff has passed",
    ),
    closed: t(
      "Šis demo datums ir slēgts",
      "Эта демо-дата закрыта",
      "This demo date is closed",
    ),
    capacity: t(
      "Demo laika loga ietilpība ir izsmelta",
      "Демо-лимит временного окна исчерпан",
      "The demo time window is at capacity",
    ),
  };
  const remaining =
    s.commerce.slots.capacity -
    s.reservations
      .filter(
        (r) =>
          r.date === date &&
          r.time.slice(0, 5) === time.slice(0, 5) &&
          r.status === "reserved",
      )
      .reduce((n, r) => n + (r.quantity || 1), 0);
  return (
    <CommercePage
      title={[
        "Ziemassvētku priekšpasūtījumu kalendārs",
        "Календарь рождественских предзаказов",
        "Christmas Preorder Calendar",
      ]}
    >
      <div className="commerce-columns">
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            if (issue) {
              setError(issueText[issue]);
              return;
            }
            if (
              !isVisible(p, s.commerce) ||
              s.seasonal.discovery.unavailableLocations.includes(
                options.locationId!,
              )
            ) {
              setError(
                t(
                  "Saņemšana nav demo-pieejama",
                  "Получение недоступно в демо",
                  "Fulfilment is unavailable in the demo",
                ),
              );
              return;
            }
            const result = reserveFuture(
              s,
              {
                product: id,
                date,
                time: time.slice(0, 5),
                quantity: qty,
                method,
                wrapping: "kraft",
                message,
              },
              dateKey(),
            );
            if ("error" in result) {
              setError(
                t(
                  "Rezervācijas konflikts vai nepietiekams demo atlikums",
                  "Конфликт бронирования или недостаточный демо-запас",
                  "Reservation conflict or insufficient demo stock",
                ),
              );
              return;
            }
            set({
              ...result.state,
              reservations: result.state.reservations.map((r) =>
                r.code === result.code
                  ? { ...r, configuration: c, quotedTotal: total }
                  : r,
              ),
            });
            setConfirmation(result.code);
          }}
        >
          <p>
            {t(
              "Visi laiki Europe/Riga. Tikai simulēti laika logi — nav reālas piegādes garantijas.",
              "Все даты и время — Europe/Riga. Слоты смоделированы, реальная доставка не гарантируется.",
              "All dates and times use Europe/Riga. Slots are simulated; real delivery is not guaranteed.",
            )}
          </p>
          <Select
            label={t("Produkts", "Товар", "Product")}
            value={id}
            onChange={setId}
            choices={s.catalog
              .filter((p) => p.seasonal && isVisible(p, s.commerce))
              .map((p) => ({ id: p.id, label: pick(p.name, s.lang) }))}
          />
          <label>
            {t("Daudzums", "Количество", "Quantity")}
            <input
              type="number"
              min={1}
              max={20}
              value={qty}
              onChange={(e) =>
                setQty(
                  Math.max(
                    1,
                    Math.min(20, Math.floor(Number(e.target.value) || 1)),
                  ),
                )
              }
            />
          </label>
          <div className="holiday-date-grid">
            {christmasDates.map((d) => (
              <button
                className={date === d ? "selected" : ""}
                type="button"
                key={d}
                aria-pressed={date === d}
                onClick={() => setDate(d)}
              >
                <small>
                  {new Intl.DateTimeFormat(s.lang, {
                    month: "long",
                    timeZone: "Europe/Riga",
                  }).format(new Date(d + "T12:00:00Z"))}
                </small>
                <strong>{d.slice(-2)}</strong>
                <span>{d.slice(0, 4)}</span>
              </button>
            ))}
          </div>
          <label>
            {t("Vēlamais datums", "Желаемая дата", "Preferred date")}
            <input
              type="date"
              min="2026-12-24"
              max="2027-01-01"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <Select
            label={t("Laika logs", "Временное окно", "Time window")}
            value={time}
            onChange={setTime}
            choices={windows.map((id) => ({ id, label: id }))}
          />
          <Select
            label={t(
              "Saņemšanas veids",
              "Способ получения",
              "Fulfilment method",
            )}
            value={method}
            onChange={(v) => setMethod(v as typeof method)}
            choices={[
              {
                id: "pickup",
                label: t(
                  "Pašizvešana · Koncepts",
                  "Самовывоз · Концепт",
                  "Pickup · Concept",
                ),
              },
              {
                id: "delivery",
                label: t(
                  "Piegāde · €5 · Koncepts",
                  "Доставка · €5 · Концепт",
                  "Delivery · €5 · Concept",
                ),
              },
            ]}
          />
          <WrappingEditor
            value={c.wrapping}
            onChange={(wrapping) => setC({ ...c, wrapping })}
          />
          <label>
            {t(
              "Dāvanas ziņa / personalizācija",
              "Послание / персонализация",
              "Gift message / personalization",
            )}
            <textarea
              maxLength={300}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <button
            className="btn"
            disabled={!!issue || qty > availability(s, id).studio}
          >
            {t(
              "Rezervēt demo laika logu",
              "Забронировать демо-слот",
              "Reserve demo slot",
            )}
          </button>
          {error && <p role="alert">{error}</p>}
          {confirmation && (
            <p role="status">
              {t("Demo kods", "Демо-код", "Demo code")}: {confirmation}
            </p>
          )}
        </form>
        <aside className="panel form-panel commerce-summary">
          <h2>{pick(p.name, s.lang)}</h2>
          <p>
            {date} · {time} · Europe/Riga
          </p>
          <p>
            {t(
              "Sagatavošanas laiks",
              "Срок подготовки",
              "Preparation lead time",
            )}
            :{" "}
            {Math.max(
              p.seasonal?.preparationDays || 1,
              s.commerce.slots.leadDays,
            )}{" "}
            {t("dienas", "дня", "days")}
          </p>
          <p>
            {t("Pieņemšanas beigas", "Время отсечения", "Cutoff")}:{" "}
            {s.commerce.slots.cutoffHour}:00 · Europe/Riga
          </p>
          <p>
            {t(
              "Atlikušie simulētie laika loga vienību limiti",
              "Осталось условных единиц в окне",
              "Remaining simulated window units",
            )}
            : {Math.max(0, remaining)}
          </p>
          <div className="summary-total">{money(total, s.lang)}</div>
          {issue && (
            <p className="error" role="status">
              {issueText[issue]}
            </p>
          )}
          <Link to="/account?tab=reservations">
            {t(
              "Manas demo rezervācijas",
              "Мои демо-бронирования",
              "My demo reservations",
            )}{" "}
            →
          </Link>
          <p className="muted">
            {t(
              "Adrese vēl nav apstiprināta. Nav īsta maksājuma vai piegādes.",
              "Адрес пока не подтверждён. Нет реальной оплаты или доставки.",
              "Address is unconfirmed. No real payment or delivery.",
            )}
          </p>
        </aside>
      </div>
    </CommercePage>
  );
}
function Corporate() {
  const { s, set } = useStore();
  const t = useT();
  const [id, setId] = useState("xm-087");
  const [qty, setQty] = useState(20);
  const [budget, setBudget] = useState(100);
  const [c, setC] = useState<DesignConfig>(defaultDesign("gift"));
  const [delivery, setDelivery] = useState(false);
  const [saved, setSaved] = useState(false);
  const p = s.catalog.find((p) => p.id === id)!;
  const opts: ProductOptions = {
    size: "M",
    color: p.color,
    wrapping: "kraft",
    card: false,
    extraGift: false,
    method: delivery ? "delivery" : "pickup",
    configuration: c,
  };
  const unit = variantPrice(p, opts);
  const total = unit * qty + (delivery ? 5 : 0);
  return (
    <CommercePage
      title={[
        "Korporatīvās Ziemassvētku dāvanas",
        "Корпоративные рождественские подарки",
        "Corporate Christmas Orders",
      ]}
    >
      <div className="commerce-columns">
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (unit > budget) return;
            const f = new FormData(e.currentTarget);
            set((o) => ({
              ...o,
              commerce: {
                ...o.commerce,
                corporate: [
                  ...o.commerce.corporate,
                  {
                    id: uid(),
                    company: String(f.get("company")),
                    contact: String(f.get("contact")),
                    productId: id,
                    quantity: qty,
                    budget,
                    date: String(f.get("date")),
                    method: delivery ? "delivery" : "pickup",
                    branding: String(f.get("branding")),
                    configuration: c,
                    total,
                    status: "draft" as const,
                  },
                ].slice(-100),
              },
            }));
            setSaved(true);
          }}
        >
          <p>
            {t(
              "Izmanto tikai izdomātus uzņēmuma un kontaktu datus. Pieprasījums netiek nosūtīts uzņēmumam.",
              "Используйте только вымышленные компанию и контакты. Запрос не отправляется бизнесу.",
              "Use fictional company and contact details only. This inquiry is not sent to the business.",
            )}
          </p>
          <label>
            {t(
              "Izdomāts uzņēmuma nosaukums",
              "Вымышленное название компании",
              "Fictional company name",
            )}
            <input
              required
              name="company"
              maxLength={80}
              defaultValue="Demo Company"
            />
          </label>
          <label>
            {t(
              "Demo e-pasts (@example.com)",
              "Демо-почта (@example.com)",
              "Demo email (@example.com)",
            )}
            <input
              required
              name="contact"
              type="email"
              pattern="[a-zA-Z0-9._%+\-]+@example\.(com|org|net)"
              defaultValue="gifts@example.com"
              maxLength={100}
            />
          </label>
          <Select
            label={t(
              "Dāvanu kolekcija",
              "Подарочная коллекция",
              "Gift collection",
            )}
            value={id}
            onChange={setId}
            choices={s.catalog
              .filter((p) => p.seasonal && isVisible(p, s.commerce))
              .map((p) => ({ id: p.id, label: pick(p.name, s.lang) }))}
          />
          <div className="form-grid">
            <label>
              {t(
                "Saņēmēju skaits",
                "Количество получателей",
                "Recipient count",
              )}
              <input
                type="number"
                min={1}
                max={500}
                value={qty}
                onChange={(e) =>
                  setQty(
                    Math.max(
                      1,
                      Math.min(500, Math.floor(Number(e.target.value) || 1)),
                    ),
                  )
                }
              />
            </label>
            <label>
              {t(
                "Budžets personai (€)",
                "Бюджет на человека (€)",
                "Budget per recipient (€)",
              )}
              <input
                type="number"
                min={1}
                max={10000}
                value={budget}
                onChange={(e) =>
                  setBudget(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </label>
          </div>
          <WrappingEditor
            value={c.wrapping}
            onChange={(wrapping) => setC({ ...c, wrapping })}
          />
          <label>
            {t("Vēlamais datums", "Желаемая дата", "Requested date")}
            <input
              required
              name="date"
              type="date"
              min="2026-12-01"
              max="2027-01-07"
              defaultValue="2026-12-23"
            />
          </label>
          <label>
            {t(
              "Zīmola / personalizācijas iecere",
              "Идея брендинга / персонализации",
              "Branding / personalization concept",
            )}
            <textarea name="branding" maxLength={300} />
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={delivery}
              onChange={(e) => setDelivery(e.target.checked)}
            />
            {t(
              "Piegādes koncepts · €5",
              "Концепция доставки · €5",
              "Delivery concept · €5",
            )}
          </label>
          <button className="btn" disabled={unit > budget}>
            {t(
              "Saglabāt demo pieprasījumu",
              "Сохранить демо-запрос",
              "Save demo inquiry",
            )}
          </button>
          {saved && (
            <p role="status">
              {t(
                "Saglabāts lokāli. Uzņēmums neko nesaņēma.",
                "Сохранено локально. Компания ничего не получила.",
                "Saved locally. The business received nothing.",
              )}
            </p>
          )}
        </form>
        <aside className="panel form-panel commerce-summary">
          <h2>{pick(p.name, s.lang)}</h2>
          <p>
            {qty} × {money(unit, s.lang)}
          </p>
          <div className="summary-total">{money(total, s.lang)}</div>
          {unit > budget && (
            <p role="alert">
              {t(
                "Pārsniegts budžets personai",
                "Превышен бюджет на человека",
                "Per-recipient budget exceeded",
              )}
            </p>
          )}
          <p>
            {t(
              "Aprēķins nav komerciāls piedāvājums vai krājumu rezervācija.",
              "Расчёт не является коммерческим предложением или резервом товара.",
              "This estimate is not a commercial offer or stock reservation.",
            )}
          </p>
        </aside>
      </div>
    </CommercePage>
  );
}
function OrderConfidence() {
  const { s, set, actualPhotos, setActualPhoto } = useStore();
  const t = useT();
  const [id, setId] = useState(s.orders[0]?.id || "sample-order");
  const stage = s.commerce.orderStages[id] || "confirmed";
  return (
    <CommercePage
      title={[
        "Pasūtījuma sagatavošanas priekšskatījums",
        "Предпросмотр подготовки заказа",
        "Order Preparation & Photo Preview",
      ]}
    >
      <div className="panel form-panel">
        <p>
          {t(
            "Tikai demo statusi. Kataloga attēli nekad netiek rādīti kā faktiska pasūtījuma fotogrāfijas. Augšupielāde paliek atmiņā un pazūd pēc pārlādes.",
            "Только демо-статусы. Каталожные изображения не выдаются за фото настоящего заказа. Загруженное фото хранится в памяти до перезагрузки.",
            "Demo statuses only. Catalog images are never presented as actual order photography. Uploads stay in memory until reload.",
          )}
        </p>
        <Select
          label={t("Pasūtījums", "Заказ", "Order")}
          value={id}
          onChange={setId}
          choices={[
            {
              id: "sample-order",
              label: t("Parauga pasūtījums", "Образец заказа", "Sample order"),
            },
            ...s.orders.map((o) => ({ id: o.id, label: o.id.slice(0, 8) })),
          ]}
        />
        <ol className="order-stage-list">
          {[
            ["confirmed", t("Apstiprināts", "Подтверждён", "Confirmed")],
            ["preparing", t("Sagatavošanā", "Готовится", "Preparing")],
            [
              "photo-review",
              t("Foto apskate", "Просмотр фото", "Photo review"),
            ],
            [
              "ready",
              t("Gatavs saņemšanai", "Готов к получению", "Pickup ready"),
            ],
            ["collected", t("Saņemts", "Получен", "Collected")],
          ].map(([key, label]) => (
            <li key={key} className={key === stage ? "selected" : ""}>
              {label}
            </li>
          ))}
        </ol>
        {actualPhotos[id] ? (
          <figure>
            <img
              className="order-local-photo"
              src={actualPhotos[id]}
              alt={t(
                "Lietotāja lokāls demo foto",
                "Локальное демо-фото пользователя",
                "User-provided local demo photo",
              )}
            />
            <figcaption>
              {t(
                "Tavs lokālais augšupielādētais attēls — nav verificēta uzņēmuma foto.",
                "Ваш локально загруженный снимок — не проверенное фото от компании.",
                "Your local upload — not a verified business order photo.",
              )}
            </figcaption>
          </figure>
        ) : (
          <div className="actual-photo-placeholder">
            {t(
              "Faktiska pasūtījuma foto vēl nav pievienots",
              "Фото фактического заказа ещё не добавлено",
              "No actual order photograph has been supplied",
            )}
          </div>
        )}
        <label>
          {t(
            "Lokāls foto priekšskatījums (līdz 4 MB)",
            "Локальный предпросмотр фото (до 4 МБ)",
            "Local photo preview (up to 4 MB)",
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (
                f &&
                f.size <= 4e6 &&
                ["image/png", "image/jpeg", "image/webp"].includes(f.type)
              ) {
                if (actualPhotos[id]) URL.revokeObjectURL(actualPhotos[id]);
                setActualPhoto(id, URL.createObjectURL(f));
              }
            }}
          />
        </label>
        <button
          className="btn outline"
          disabled={!actualPhotos[id]}
          onClick={() =>
            set((o) => ({
              ...o,
              commerce: {
                ...o.commerce,
                orderStages: { ...o.commerce.orderStages, [id]: "ready" },
              },
            }))
          }
        >
          {t(
            "Apstiprināt demo foto",
            "Подтвердить демо-фото",
            "Approve demo photo",
          )}
        </button>
        <button
          className="text-link"
          disabled={!actualPhotos[id]}
          onClick={() => {
            URL.revokeObjectURL(actualPhotos[id]);
            setActualPhoto(id);
          }}
        >
          {t(
            "Noņemt lokālo foto",
            "Убрать локальное фото",
            "Remove local photo",
          )}
        </button>
        <p className="muted">
          {t(
            "Nākotnes drošai fotogrāfiju piegādei nepieciešams autentificēts serveris un atļauju pārbaude. Paziņojumi netiek sūtīti.",
            "Для будущей безопасной передачи фото нужен сервер с аутентификацией и проверкой прав. Уведомления не отправляются.",
            "Future secure photo delivery requires an authenticated server and permission checks. No notifications are sent.",
          )}
        </p>
      </div>
    </CommercePage>
  );
}
