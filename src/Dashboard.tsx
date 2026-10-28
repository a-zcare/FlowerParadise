import {
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Flower2,
  Gift,
  Heart,
  Leaf,
  Package,
  Pencil,
  Plus,
  Settings,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { categories, future, money, nextEvent, pick, type Text } from "./data";
import Operations from "./Operations";
import { ReorderButton } from "./Personal";
import { uid, useStore, type Reminder } from "./store";
import { Demo, Empty, IconButton, Modal, ProductCard, Title, useT } from "./ui";
import { AdminVending } from "./Vending";
export default function Dashboard() {
  const path = useLocation().pathname;
  return path === "/reminders" ? (
    <Reminders />
  ) : path === "/admin" ? (
    <Admin />
  ) : (
    <Account />
  );
}
const eventNames: Text[] = [
  ["Dzimšanas diena", "День рождения", "Birthday"],
  ["Kāzu gadadiena", "Годовщина свадьбы", "Wedding anniversary"],
  ["Attiecību gadadiena", "Годовщина отношений", "Relationship anniversary"],
  ["Valentīna diena", "День святого Валентина", "Valentine’s Day"],
  ["Mātes diena", "День матери", "Mother’s Day"],
  ["Sieviešu diena", "Международный женский день", "International Women’s Day"],
  ["Cits notikums", "Другое событие", "Custom event"],
];
const frequencies: Record<string, Text> = {
  weekly: ["Katru nedēļu", "Еженедельно", "Weekly"],
  biweekly: ["Ik pēc divām nedēļām", "Раз в две недели", "Biweekly"],
  monthly: ["Katru mēnesi", "Ежемесячно", "Monthly"],
};
function Reminders() {
  const { s, set, toast } = useStore();
  const t = useT();
  const [edit, setEdit] = useState<Reminder | null>(null);
  const [preview, setPreview] = useState<Reminder | null>(null);
  const [calendar, setCalendar] = useState(false);
  const fresh = (): Reminder => ({
    id: uid(),
    name: "",
    event: "0",
    date: future(7),
    annual: true,
    days: 7,
    channel: "email",
  });
  const active = s.reminders
    .filter((r) => !r.dismissed)
    .sort(
      (a, b) =>
        nextEvent(a.date, a.annual).getTime() -
        nextEvent(b.date, b.annual).getTime(),
    );
  const now = new Date();
  return (
    <div className="page">
      <Title
        kicker={t(
          "ATCERĒTIES NOZĪMĒ RŪPĒTIES",
          "ПОМНИТЬ — ЗНАЧИТ ЗАБОТИТЬСЯ",
          "REMEMBERING IS A KIND OF LOVE",
        )}
        title={t(
          "Svarīgi datumi. Silti žesti.",
          "Важные даты. Тёплые жесты.",
          "Their moments. Remembered.",
        )}
        description={t(
          "Dzimšanas dienas, gadadienas un visi jūsu īpašie mirkļi vienuviet.",
          "Дни рождения, годовщины и все ваши особенные моменты в одном месте.",
          "Birthdays, anniversaries and all your meaningful little moments, in one place.",
        )}
      >
        <button className="btn" onClick={() => setEdit(fresh())}>
          <Plus size={17} />
          {t("Pievienot datumu", "Добавить дату", "Add a date")}
        </button>
      </Title>
      <Demo />
      <div className="reminder-intro">
        <Bell size={28} />
        <div>
          <h3>
            {t(
              "Mazs atgādinājums. Liela nozīme.",
              "Маленькое напоминание. Большое значение.",
              "A small reminder. A meaningful gesture.",
            )}
          </h3>
          <p>
            {t(
              "Paziņojumi ir tikai priekšskatījumi. Telegram, WhatsApp un e-pasts nav savienoti.",
              "Уведомления — только предпросмотр. Telegram, WhatsApp и e-mail не подключены.",
              "Notifications are previews only. Telegram, WhatsApp and email are not connected.",
            )}
          </p>
        </div>
        <button className="btn outline" onClick={() => setCalendar(!calendar)}>
          <CalendarDays size={17} />
          {calendar
            ? t("Saraksts", "Список", "List")
            : t("Kalendārs", "Календарь", "Calendar")}
        </button>
      </div>
      {!active.length ? (
        <Empty
          text={t(
            "Pievieno datumu, kas ir atcerēšanās vērts",
            "Добавьте дату, о которой стоит помнить",
            "Add a date worth remembering",
          )}
        />
      ) : calendar ? (
        <div className="calendar-list">
          {active.map((r) => (
            <div className="calendar-event" key={r.id}>
              <div>
                <strong>
                  {nextEvent(r.date, r.annual).toLocaleDateString(s.lang, {
                    day: "numeric",
                  })}
                </strong>
                <span>
                  {nextEvent(r.date, r.annual).toLocaleDateString(s.lang, {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h3>{r.name}</h3>
              <p>{pick(eventNames[Number(r.event)], s.lang)}</p>
              <button className="btn outline" onClick={() => setPreview(r)}>
                {t("Priekšskatījums", "Предпросмотр", "Preview")}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="reminder-grid">
          {active.map((r) => {
            const days = Math.ceil(
              (nextEvent(r.date, r.annual).getTime() - now.getTime()) /
                86400000,
            );
            return (
              <article className="panel reminder-card" key={r.id}>
                <div className="row-between">
                  <span className="eyebrow">
                    {pick(eventNames[Number(r.event)], s.lang)}
                  </span>
                  <div className="row">
                    <IconButton
                      label={t("Rediģēt", "Изменить", "Edit")}
                      onClick={() => setEdit({ ...r })}
                    >
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton
                      label={t("Dzēst", "Удалить", "Delete")}
                      onClick={() => {
                        set((o) => ({
                          ...o,
                          reminders: o.reminders.filter((x) => x.id !== r.id),
                        }));
                        toast(
                          t(
                            "Atgādinājums dzēsts",
                            "Напоминание удалено",
                            "Reminder deleted",
                          ),
                        );
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </div>
                <h2>{r.name}</h2>
                <p>
                  <CalendarDays size={15} />{" "}
                  {nextEvent(r.date, r.annual).toLocaleDateString(s.lang, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="days-pill">
                  {days >= 0
                    ? `${days} ${t("dienas līdz notikumam", "дней до события", "days to go")}`
                    : t("Pagātnes notikums", "Прошедшее событие", "Past event")}
                </div>
                <p className="muted">
                  {r.channel} · {r.days}{" "}
                  {t("dienas iepriekš", "дней заранее", "days before")}
                  {r.annual ? " · ↻" : ""}
                  {r.snoozed ? ` · ${t("Atlikts", "Отложено", "Snoozed")}` : ""}
                </p>
                <button className="text-link" onClick={() => setPreview(r)}>
                  {t(
                    "Paziņojuma priekšskatījums",
                    "Предпросмотр уведомления",
                    "Preview notification",
                  )}
                  <ArrowUpRight size={16} />
                </button>
              </article>
            );
          })}
        </div>
      )}
      {edit && (
        <Modal
          title={t("Svarīgais datums", "Важная дата", "A date that matters")}
          close={() => setEdit(null)}
        >
          <form
            className="form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              set((o) => ({
                ...o,
                reminders: o.reminders.some((x) => x.id === edit.id)
                  ? o.reminders.map((x) => (x.id === edit.id ? edit : x))
                  : [...o.reminders, edit],
              }));
              setEdit(null);
              toast(
                t(
                  "Atgādinājums saglabāts",
                  "Напоминание сохранено",
                  "Your reminder is saved",
                ),
              );
            }}
          >
            <label>
              {t(
                "Izdomāts vārds vai nosaukums",
                "Вымышленное имя или название",
                "Fictional name or title",
              )}
              <input
                required
                maxLength={80}
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                placeholder={t(
                  "Mammas dzimšanas diena",
                  "День рождения мамы",
                  "Mum’s birthday",
                )}
              />
            </label>
            <label>
              {t("Notikums", "Событие", "Event")}
              <select
                value={edit.event}
                onChange={(e) => setEdit({ ...edit, event: e.target.value })}
              >
                {eventNames.map((x, i) => (
                  <option key={i} value={i}>
                    {pick(x, s.lang)}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                {t("Datums", "Дата", "Date")}
                <input
                  type="date"
                  required
                  value={edit.date}
                  onChange={(e) => setEdit({ ...edit, date: e.target.value })}
                />
              </label>
              <label>
                {t(
                  "Atgādināt iepriekš",
                  "Напомнить заранее",
                  "Remind me before",
                )}
                <select
                  value={edit.days}
                  onChange={(e) =>
                    setEdit({ ...edit, days: Number(e.target.value) })
                  }
                >
                  {[1, 3, 7, 14].map((n) => (
                    <option key={n} value={n}>
                      {n} {t("dienas", "дней", "days")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={edit.annual}
                onChange={(e) => setEdit({ ...edit, annual: e.target.checked })}
              />
              {t(
                "Atkārtot katru gadu",
                "Повторять ежегодно",
                "Repeat every year",
              )}
            </label>
            <label>
              {t(
                "Demo paziņojuma kanāls",
                "Демо-канал уведомления",
                "Demo notification channel",
              )}
              <select
                value={edit.channel}
                onChange={(e) => setEdit({ ...edit, channel: e.target.value })}
              >
                <option value="email">E-mail</option>
                <option>Telegram</option>
                <option>WhatsApp</option>
              </select>
            </label>
            <button className="btn">
              <Check size={16} />
              {t("Saglabāt datumu", "Сохранить дату", "Save the date")}
            </button>
          </form>
        </Modal>
      )}
      {preview && (
        <Modal
          title={`${preview.channel} · ${t("Demo paziņojums", "Демо-уведомление", "Demo notification")}`}
          close={() => setPreview(null)}
        >
          <div className="notification-preview large">
            <Bell />
            <span>Flower Paradise</span>
            <h3>{preview.name}</h3>
            <p>
              {t(
                `Līdz īpašajam datumam ${preview.days} dienas. Vai vēlies iepriecināt ar ziediem?`,
                `До особенной даты ${preview.days} дней. Хотите порадовать цветами?`,
                `${preview.days} days before their special date. Would you like to send a little happiness?`,
              )}
            </p>
            <ProductCard p={s.catalog[3]} />
          </div>
          <div className="choice-row">
            <Link className="btn" to="/shop">
              {t("Izvēlēties ziedus", "Выбрать цветы", "Choose flowers")}
            </Link>
            <button
              className="btn outline"
              onClick={() => {
                set((o) => ({
                  ...o,
                  reminders: o.reminders.map((r) =>
                    r.id === preview.id ? { ...r, snoozed: true } : r,
                  ),
                }));
                setPreview(null);
                toast(
                  t(
                    "Demo atgādinājums atlikts",
                    "Демо-напоминание отложено",
                    "Demo reminder snoozed",
                  ),
                );
              }}
            >
              {t("Atgādināt vēlāk", "Напомнить позже", "Remind later")}
            </button>
            <button
              className="text-link"
              onClick={() => {
                set((o) => ({
                  ...o,
                  reminders: o.reminders.map((r) =>
                    r.id === preview.id ? { ...r, dismissed: true } : r,
                  ),
                }));
                setPreview(null);
              }}
            >
              {t("Noraidīt", "Отклонить", "Dismiss")}
            </button>
          </div>
          <Demo />
        </Modal>
      )}
    </div>
  );
}
function Account() {
  const { s, set, toast, reset } = useStore();
  const t = useT();
  const [params, setParams] = useSearchParams();
  const tab =
    useLocation().pathname === "/wishlist"
      ? "wishlist"
      : params.get("tab") || "overview";
  const tabs = [
    ["overview", t("Pārskats", "Обзор", "Overview")],
    ["wishlist", t("Vēlmju saraksts", "Избранное", "Wishlist")],
    ["orders", t("Pasūtījumi", "Заказы", "Orders")],
    ["reservations", t("Rezervācijas", "Бронирования", "Reservations")],
    ["subscriptions", t("Abonementi", "Подписки", "Subscriptions")],
    ["gifts", t("Dāvanu kartes", "Подарочные карты", "Gift certificates")],
    ["loyalty", t("Lojalitāte", "Лояльность", "Loyalty")],
    ["settings", t("Iestatījumi", "Настройки", "Preferences")],
  ];
  return (
    <div className="page">
      <Title
        kicker={t(
          "TAVA MAZĀ ZIEDU PASAULE",
          "ВАШ МАЛЕНЬКИЙ МИР ЦВЕТОВ",
          "YOUR LITTLE WORLD OF FLOWERS",
        )}
        title={t(
          "Prieks tevi redzēt.",
          "Рады вас видеть.",
          "Lovely to see you.",
        )}
        description={t(
          "Demo profils bez konta izveides. Viss paliek šajā pārlūkā.",
          "Демо-кабинет без регистрации. Всё остаётся в этом браузере.",
          "A demo dashboard without an account. Everything stays in this browser.",
        )}
      />
      <Demo />
      <div className="tabs">
        {tabs.map(([id, label]) => (
          <button
            className={id === tab ? "selected" : ""}
            key={id}
            onClick={() => setParams({ tab: id })}
          >
            {label}
          </button>
        ))}
        <Link to="/cart">
          <ShoppingBag size={16} />
          {t("Grozs", "Корзина", "Bag")} ({s.cart.length})
        </Link>
        <Link to="/planner">
          <CalendarDays size={16} />
          {t(
            "Gada dāvanu plāns",
            "План подарков на год",
            "Annual gift planner",
          )}
        </Link>
        <Link to="/reminders">
          <Bell size={16} />
          {t("Svarīgie datumi", "Важные даты", "Important dates")}
        </Link>
      </div>
      {tab === "overview" ? (
        <>
          <div className="stats-grid">
            {[
              {
                n: s.orders.length,
                l: t("Demo pasūtījumi", "Демо-заказы", "Demo orders"),
                i: <ShoppingBag />,
              },
              {
                n: s.reservations.filter((r) => r.status === "reserved").length,
                l: t(
                  "Gaidāmie mirkļi",
                  "Предстоящие моменты",
                  "Upcoming moments",
                ),
                i: <CalendarDays />,
              },
              {
                n: s.wishlist.length,
                l: t(
                  "Saglabātie favorīti",
                  "Сохранённые любимые",
                  "Saved favourites",
                ),
                i: <Heart />,
              },
              {
                n: s.reminders.filter((r) => !r.dismissed).length,
                l: t("Svarīgie datumi", "Важные даты", "Important dates"),
                i: <Bell />,
              },
            ].map((x) => (
              <div className="panel stat" key={x.l}>
                {x.i}
                <strong>{x.n}</strong>
                <span>{x.l}</span>
              </div>
            ))}
          </div>
          <div className="service-grid">
            <Link className="service-card" to="/reserve">
              <CalendarDays />
              <h3>
                {t(
                  "Ieplāno pārsteigumu",
                  "Запланируйте сюрприз",
                  "Plan a little surprise",
                )}
              </h3>
              <p>
                {t(
                  "Rezervē ziedus īpašam datumam.",
                  "Зарезервируйте цветы на особый день.",
                  "Reserve flowers for a meaningful date.",
                )}
              </p>
              <ArrowUpRight />
            </Link>
            <Link className="service-card" to="/reminders">
              <Bell />
              <h3>
                {t(
                  "Tuvākie notikumi",
                  "Ближайшие события",
                  "Coming up in your world",
                )}
              </h3>
              {s.reminders
                .filter((r) => !r.dismissed)
                .sort(
                  (a, b) =>
                    nextEvent(a.date, a.annual).getTime() -
                    nextEvent(b.date, b.annual).getTime(),
                )
                .slice(0, 3)
                .map((r) => (
                  <p key={r.id}>
                    {r.name} ·{" "}
                    {nextEvent(r.date, r.annual).toLocaleDateString(s.lang)}
                  </p>
                ))}
              {!s.reminders.length && (
                <p>
                  {t(
                    "Pievieno savu pirmo svarīgo datumu.",
                    "Добавьте первую важную дату.",
                    "Add your first important date.",
                  )}
                </p>
              )}
              <ArrowUpRight />
            </Link>
            <Link className="service-card" to="/subscriptions">
              <Leaf />
              <h3>
                {t(
                  "Skaistums regulāri",
                  "Красота регулярно",
                  "A regular little lovely",
                )}
              </h3>
              <p>
                {s.subscriptions.length}{" "}
                {t("demo abonementi", "демо-подписок", "demo subscriptions")}
              </p>
              <ArrowUpRight />
            </Link>
          </div>
        </>
      ) : tab === "wishlist" ? (
        s.wishlist.length ? (
          <div className="product-grid">
            {s.catalog
              .filter((p) => s.wishlist.includes(p.id))
              .map((p) => (
                <ProductCard p={p} key={p.id} />
              ))}
          </div>
        ) : (
          <Empty
            text={t(
              "Saglabā savus mīļākos ziedus",
              "Сохраните любимые цветы",
              "Save the flowers you love",
            )}
          />
        )
      ) : tab === "orders" ? (
        s.orders.length ? (
          <div className="record-list">
            {s.orders.map((o) => (
              <div className="panel record" key={o.id}>
                <Package />
                <div>
                  <h3>#{o.id.slice(0, 8)}</h3>
                  <p>
                    {o.date} · {o.time} ·{" "}
                    {o.method === "pickup"
                      ? t("Saņemšana", "Самовывоз", "Pickup")
                      : t("Piegāde", "Доставка", "Delivery")}
                  </p>
                  {o.items.map((x, i) => (
                    <span className="record-item" key={i}>
                      {pick(s.catalog.find((p) => p.id === x.id)!.name, s.lang)}{" "}
                      × {x.qty}
                    </span>
                  ))}
                </div>
                <ReorderButton order={o} />
                <strong>{money(o.total, s.lang)}</strong>
                <span className="badge-static">
                  {t("Demo apstiprināts", "Демо подтверждён", "Demo confirmed")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            text={t(
              "Vēl nav demo pasūtījumu",
              "Демо-заказов пока нет",
              "No demo orders yet",
            )}
          />
        )
      ) : tab === "reservations" ? (
        s.reservations.length ? (
          <div className="record-list">
            {s.reservations.map((r) => (
              <div className="panel record" key={r.id}>
                <CalendarDays />
                <div>
                  <h3>
                    {r.product.startsWith("slot-")
                      ? `${t("Nodalījums", "Ячейка", "Compartment")} 0${Number(r.product.split("-")[1]) + 1}`
                      : pick(
                          s.catalog.find((p) => p.id === r.product)!.name,
                          s.lang,
                        )}
                  </h3>
                  <p>
                    {r.date} · {r.time}
                  </p>
                  <small>
                    {t("Demo kods", "Демо-код", "Demo code")}: {r.code}
                  </small>
                </div>
                <span className="badge-static">
                  {r.status === "reserved"
                    ? t("Rezervēts", "Забронирован", "Reserved")
                    : r.status === "cancelled"
                      ? t("Atcelts", "Отменён", "Cancelled")
                      : t("Saņemts", "Получен", "Collected")}
                </span>
                {r.status === "reserved" && (
                  <button
                    className="text-link"
                    onClick={() =>
                      set((o) => ({
                        ...o,
                        reservations: o.reservations.map((x) =>
                          x.id === r.id ? { ...x, status: "cancelled" } : x,
                        ),
                      }))
                    }
                  >
                    {t("Atcelt", "Отменить", "Cancel")}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty
            text={t(
              "Vēl nav rezervāciju",
              "Бронирований пока нет",
              "No reservations yet",
            )}
          />
        )
      ) : tab === "subscriptions" ? (
        s.subscriptions.length ? (
          <div className="record-list">
            {s.subscriptions.map((p) => (
              <div className="panel record" key={p.id}>
                <Flower2 />
                <div>
                  <h3>{pick(frequencies[p.frequency], s.lang)}</h3>
                  <p>
                    {p.months} {t("mēneši", "месяцев", "months")} ·{" "}
                    {money(p.price, s.lang)}/{t("mēn.", "мес.", "mo.")}
                  </p>
                </div>
                <button
                  className="btn outline"
                  onClick={() =>
                    set((o) => ({
                      ...o,
                      subscriptions: o.subscriptions.filter(
                        (x) => x.id !== p.id,
                      ),
                    }))
                  }
                >
                  {t(
                    "Atcelt demo abonementu",
                    "Отменить демо-подписку",
                    "Cancel demo plan",
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            text={t(
              "Izveido ziedu abonementu",
              "Создайте цветочную подписку",
              "Start your flower habit",
            )}
          />
        )
      ) : tab === "gifts" ? (
        s.gifts.length ? (
          <div className="record-list">
            {s.gifts.map((g) => (
              <div className="panel record" key={g.id}>
                <Gift />
                <div>
                  <h3>
                    {money(g.amount, s.lang)} · {g.code}
                  </h3>
                  <p>{g.message}</p>
                  <small>
                    {g.recipient} · {g.date}
                  </small>
                </div>
                <span>
                  {g.redeemed
                    ? t("Saņemta", "Активирована", "Redeemed")
                    : t(
                        "Pieejama · Demo",
                        "Доступна · Демо",
                        "Available · Demo",
                      )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            text={t(
              "Vēl nav dāvanu karšu",
              "Подарочных карт пока нет",
              "No gift certificates yet",
            )}
          />
        )
      ) : tab === "loyalty" ? (
        <div className="service-grid">
          <div className="panel">
            <Gift />
            <h2>
              {s.orders.length * 25}{" "}
              {t("ziedu punkti", "цветочных баллов", "bloom points")}
            </h2>
            <p>
              {t(
                "25 demo punkti par demo pasūtījumu. Nav naudas vērtības.",
                "25 демо-баллов за демо-заказ. Без денежной стоимости.",
                "25 demo points per demo order. No monetary value.",
              )}
            </p>
          </div>
          <div className="panel">
            <h2>
              {t(
                "Dalies ar skaistumu",
                "Делитесь красотой",
                "Share a little lovely",
              )}
            </h2>
            <p>PARADISE-FRIEND</p>
            <button
              className="text-link"
              onClick={() => {
                navigator.clipboard
                  ?.writeText("PARADISE-FRIEND")
                  .then(() =>
                    toast(
                      t(
                        "Demo kods nokopēts",
                        "Демо-код скопирован",
                        "Demo code copied",
                      ),
                    ),
                  )
                  .catch(() => toast("PARADISE-FRIEND"));
              }}
            >
              <Copy size={16} />
              {t(
                "Kopēt ieteikuma demo kodu",
                "Копировать демо-код",
                "Copy demo referral code",
              )}
            </button>
          </div>
          <div className="panel">
            <h2>
              {t(
                "Dzimšanas dienas prieks",
                "Радость в день рождения",
                "Birthday lovely",
              )}
            </h2>
            <p>
              {t(
                "Izmēģini BLOOM10: 10% demo atlaide grozā.",
                "Попробуйте BLOOM10: 10% демо-скидка в корзине.",
                "Try BLOOM10 for a 10% demo discount in your bag.",
              )}
            </p>
            <Link to="/shop" className="text-link">
              {t("Izvēlēties dāvanu", "Выбрать подарок", "Find a gift")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="panel form-panel settings-panel">
          <h2>{t("Tavas vēlmes", "Ваши предпочтения", "Your preferences")}</h2>
          <label>
            {t(
              "Paziņojumu kanāls (tikai priekšskatījumi)",
              "Канал уведомлений (только предпросмотр)",
              "Notification channel (previews only)",
            )}
            <select
              value={s.preferences.channel}
              onChange={(e) =>
                set((o) => ({
                  ...o,
                  preferences: { ...o.preferences, channel: e.target.value },
                }))
              }
            >
              <option value="email">E-mail</option>
              <option>Telegram</option>
              <option>WhatsApp</option>
            </select>
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={s.preferences.fresh}
              onChange={(e) =>
                set((o) => ({
                  ...o,
                  preferences: { ...o.preferences, fresh: e.target.checked },
                }))
              }
            />
            {t(
              "Svaigu pušķu un sezonas jaunumu demo paziņojumi",
              "Демо-уведомления о свежих букетах и новинках",
              "Demo fresh bouquet & seasonal notifications",
            )}
          </label>
          <p>
            {t(
              "Izvēles saglabājas automātiski. Dati glabājas tikai šajā ierīcē. Sensitīva informācija netiek prasīta.",
              "Настройки сохраняются автоматически, только на этом устройстве. Конфиденциальные данные не запрашиваются.",
              "Preferences save automatically on this device only. No sensitive information is requested.",
            )}
          </p>
          <button className="btn outline" onClick={reset}>
            {t(
              "Atiestatīt visus demo datus",
              "Сбросить все демо-данные",
              "Reset all demo data",
            )}
          </button>
        </div>
      )}
    </div>
  );
}
function Admin() {
  const { s, set, toast } = useStore();
  const t = useT();
  const [adminParams, setAdminParams] = useSearchParams();
  const tab = adminParams.get("view") || "overview";
  const setTab = (view: string) => setAdminParams({ view });
  const [month, setMonth] = useState(0);
  const [bar, setBar] = useState<number | null>(null);
  const [edit, setEdit] = useState<string | null>(null);
  const [promo, setPromo] = useState("BLOOM10");
  const [discount, setDiscount] = useState(10);
  const [notice, setNotice] = useState(false);
  const tabs = [
    ["overview", t("Pārskats", "Обзор", "Overview")],
    ["products", t("Produkti", "Товары", "Products")],
    [
      "inventory",
      t("Krājumi un svaigums", "Остатки и свежесть", "Stock & freshness"),
    ],
    ["vending", t("Automāts", "Автомат", "Vending")],
    ["orders", t("Pasūtījumi", "Заказы", "Orders")],
    ["reservations", t("Rezervācijas", "Бронирования", "Reservations")],
    ["delivery", t("Piegāžu grafiks", "График доставок", "Delivery schedule")],
    ["analytics", t("Analītika", "Аналитика", "Analytics")],
    ["marketing", t("Mārketings", "Маркетинг", "Marketing")],
    ["reminders", t("Atgādinājumi", "Напоминания", "Reminders")],
    ["subscriptions", t("Abonementi", "Подписки", "Subscriptions")],
    ["freshness", t("Svaigums", "Свежесть", "Freshness")],
    ["waste", t("Zudumi", "Потери", "Waste")],
    ["maintenance", t("Apkope", "Обслуживание", "Maintenance")],
    [
      "profitability",
      t("Finanšu modelis", "Финансовая модель", "Profitability"),
    ],
    ["discounts", t("Atlaides", "Скидки", "Discounts")],
    ["settings", t("Iestatījumi", "Настройки", "Settings")],
  ];
  const p = s.catalog.find((p) => p.id === edit);
  const sample = [42, 65, 48, 85, 61, 94, 73];
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-mark">
          <Flower2 />
          <span>
            PARADISE
            <small>
              {t(
                "BIZNESA STUDIJA · DEMO",
                "БИЗНЕС-СТУДИЯ · ДЕМО",
                "BUSINESS STUDIO · DEMO",
              )}
            </small>
          </span>
        </div>
        {tabs.map(([id, label]) => (
          <button
            className={tab === id ? "selected" : ""}
            key={id}
            onClick={() => setTab(id)}
          >
            {id === "overview" ? (
              <BarChart3 size={17} />
            ) : id === "products" ? (
              <Flower2 size={17} />
            ) : id === "settings" ? (
              <Settings size={17} />
            ) : (
              <Leaf size={17} />
            )}{" "}
            {label}
          </button>
        ))}
        <Link to="/">
          {t("Uz veikalu", "В магазин", "Back to boutique")}
          <ArrowUpRight size={16} />
        </Link>
      </aside>
      <div className="admin-content">
        <Title
          kicker={t(
            "FLOWER PARADISE · BIZNESA STUDIJA",
            "FLOWER PARADISE · БИЗНЕС-СТУДИЯ",
            "FLOWER PARADISE · BUSINESS STUDIO",
          )}
          title={tabs.find((x) => x[0] === tab)![1]}
          description={t(
            "Ilustratīvi paraugu dati un šīs pārlūkprogrammas demo darbības. Nav īstu pārdošanas rezultātu.",
            "Иллюстративные данные и демо-действия в этом браузере. Это не реальные продажи.",
            "Illustrative sample data alongside this browser’s demo activity. These are not real sales.",
          )}
        />
        <Demo />
        {tab === "overview" || tab === "analytics" ? (
          <>
            <div className="stats-grid">
              {[
                {
                  n: money(2480 + month * 320, s.lang),
                  l: t(
                    "Parauga apgrozījums",
                    "Пример выручки",
                    "Sample revenue",
                  ),
                  icon: <BarChart3 />,
                },
                {
                  n: 64 + month * 8,
                  l: t("Parauga pasūtījumi", "Пример заказов", "Sample orders"),
                  icon: <ShoppingBag />,
                },
                {
                  n: s.catalog.reduce((a, p) => a + p.stock, 0),
                  l: t("Demo krājumi", "Демо-остаток", "Demo units in stock"),
                  icon: <Package />,
                },
                {
                  n: s.orders.length,
                  l: t(
                    "Šī pārlūka pasūtījumi",
                    "Заказы в этом браузере",
                    "This browser’s orders",
                  ),
                  icon: <Clock3 />,
                },
              ].map((x) => (
                <div className="panel stat" key={x.l}>
                  {x.icon}
                  <span>{x.l}</span>
                  <strong>{x.n}</strong>
                  <small>{t("Demo dati", "Демо-данные", "Demo data")}</small>
                </div>
              ))}
            </div>
            <div className="analytics-grid">
              <div className="panel">
                <div className="row-between">
                  <h2>
                    {t(
                      "Nedēļas pārskats",
                      "Недельный обзор",
                      "The week in bloom",
                    )}
                  </h2>
                  <select
                    aria-label={t(
                      "Pārskata periods",
                      "Период отчёта",
                      "Reporting period",
                    )}
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                  >
                    <option value={0}>
                      {t(
                        "Parauga periods A",
                        "Пример периода A",
                        "Sample period A",
                      )}
                    </option>
                    <option value={1}>
                      {t(
                        "Parauga periods B",
                        "Пример периода B",
                        "Sample period B",
                      )}
                    </option>
                  </select>
                </div>
                <p className="muted">
                  {t(
                    "Parauga apgrozījums (€). Izvēlies stabiņu, lai apskatītu vērtību.",
                    "Пример выручки (€). Выберите столбец для просмотра.",
                    "Sample revenue (€). Select a bar to inspect its value.",
                  )}
                </p>
                <div className="bar-chart">
                  {sample.map((n, i) => (
                    <button
                      aria-label={`${t("Diena", "День", "Day")} ${i + 1}: €${(n + month * 5) * 5}`}
                      key={i}
                      className={bar === i ? "selected" : ""}
                      style={{ height: `${n}%` }}
                      onClick={() => setBar(i)}
                    >
                      <span>{(n + month * 5) * 5} €</span>
                      <small>
                        {
                          [
                            t("P", "Пн", "M"),
                            t("O", "Вт", "T"),
                            t("T", "Ср", "W"),
                            t("C", "Чт", "T"),
                            t("P", "Пт", "F"),
                            t("S", "Сб", "S"),
                            t("Sv", "Вс", "S"),
                          ][i]
                        }
                      </small>
                    </button>
                  ))}
                </div>
                <div className="chart-detail">
                  {bar !== null
                    ? `${t("Izvēlētā diena", "Выбранный день", "Selected day")} ${bar + 1}: ${money((sample[bar] + month * 5) * 5, s.lang)}`
                    : t(
                        "7 dienu ilustratīvi dati",
                        "Иллюстративные данные за 7 дней",
                        "7 days of illustrative data",
                      )}
                </div>
              </div>
              <div className="panel">
                <h2>
                  {t(
                    "Populārākās kolekcijas",
                    "Популярные коллекции",
                    "Most-loved collections",
                  )}
                </h2>
                {[0, 1, 6, 9].map((c, i) => (
                  <button
                    className="popularity"
                    key={c}
                    onClick={() => {
                      setTab("products");
                    }}
                  >
                    <div>
                      <span>{pick(categories[c], s.lang)}</span>
                      <b>{[38, 27, 21, 14][i]}%</b>
                    </div>
                    <span style={{ width: `${[95, 67, 52, 35][i]}%` }} />
                  </button>
                ))}
                <p className="muted">
                  {t(
                    "Ilustratīvs sadalījums, nav īsti klientu dati.",
                    "Иллюстративная статистика, не реальные данные клиентов.",
                    "Illustrative distribution, not real customer data.",
                  )}
                </p>
              </div>
            </div>
            <div className="service-grid">
              <div className="panel">
                <h3>
                  {t(
                    "Krājumu brīdinājumi",
                    "Предупреждения об остатках",
                    "Stock alerts",
                  )}
                </h3>
                {s.catalog
                  .filter((p) => p.stock <= 3)
                  .slice(0, 3)
                  .map((p) => (
                    <p key={p.id}>
                      {pick(p.name, s.lang)} · {p.stock}
                    </p>
                  ))}
                <button
                  className="text-link"
                  onClick={() => setTab("inventory")}
                >
                  {t("Pārvaldīt", "Управлять", "Manage")}
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="panel">
                <h3>
                  {t(
                    "Pārlūka aktivitāte",
                    "Активность браузера",
                    "Browser activity",
                  )}
                </h3>
                <p>
                  {s.wishlist.length} {t("favorīti", "избранных", "favourites")}{" "}
                  · {s.cart.length}{" "}
                  {t("groza pozīcijas", "позиций в корзине", "bag lines")}
                </p>
                <p>
                  {s.reminders.length}{" "}
                  {t("svarīgie datumi", "важных дат", "important dates")}
                </p>
              </div>
              <div className="panel">
                <h3>
                  {t("Ziedu svaigums", "Свежесть цветов", "Flower freshness")}
                </h3>
                <p>
                  {t(
                    "Pārbaudes paraugs: 24 stundu cikls. Nav reālu sensoru datu.",
                    "Пример проверки: цикл 24 часа. Без реальных данных датчиков.",
                    "Sample check: a 24-hour cycle. No real sensor readings.",
                  )}
                </p>
                <button
                  className="text-link"
                  onClick={() => setTab("inventory")}
                >
                  {t("Skatīt izlasi", "Посмотреть выборку", "Inspect sample")}
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : [
            "inventory",
            "freshness",
            "waste",
            "maintenance",
            "profitability",
            "discounts",
          ].includes(tab) ? (
          <Operations tab={tab} />
        ) : tab === "products" ? (
          <div className="panel table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("Produkts", "Товар", "Product")}</th>
                  <th>{t("Kolekcija", "Коллекция", "Collection")}</th>
                  <th>{t("Cena", "Цена", "Price")}</th>
                  <th>{t("Krājums", "Остаток", "Stock")}</th>

                  <th>{t("Darbība", "Действие", "Action")}</th>
                </tr>
              </thead>
              <tbody>
                {s.catalog.map((p) => (
                  <tr key={p.id}>
                    <td>{pick(p.name, s.lang)}</td>
                    <td>{pick(categories[p.category], s.lang)}</td>
                    <td>{money(p.price, s.lang)}</td>
                    <td>
                      <span
                        className={p.stock < 3 ? "low-stock" : "badge-static"}
                      >
                        {p.stock}
                      </span>
                    </td>

                    <td>
                      <button
                        className="text-link"
                        onClick={() => setEdit(p.id)}
                      >
                        <Pencil size={14} />
                        {t("Rediģēt", "Изменить", "Edit")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === "vending" ? (
          <AdminVending />
        ) : tab === "orders" ? (
          <AdminRecords
            rows={s.orders.map((o) => ({
              id: o.id,
              title: `#${o.id.slice(0, 8)}`,
              detail: `${o.date} · ${money(o.total, s.lang)}`,
              status: t(
                "Demo apstiprināts",
                "Демо подтверждён",
                "Demo confirmed",
              ),
            }))}
          />
        ) : tab === "reservations" || tab === "delivery" ? (
          <AdminRecords
            rows={s.reservations
              .filter((r) => tab !== "delivery" || r.method === "delivery")
              .map((r) => ({
                id: r.id,
                title: r.product,
                detail: `${r.date} · ${r.time} · ${r.code}`,
                status:
                  r.status === "reserved"
                    ? t("Rezervēts", "Забронирован", "Reserved")
                    : r.status === "collected"
                      ? t("Saņemts", "Получен", "Collected")
                      : t("Atcelts", "Отменён", "Cancelled"),
              }))
              .concat(
                tab === "delivery"
                  ? s.orders
                      .filter((o) => o.method === "delivery")
                      .map((o) => ({
                        id: o.id,
                        title: `#${o.id.slice(0, 8)}`,
                        detail: o.date,
                        status: t(
                          "Demo piegāde",
                          "Демо-доставка",
                          "Demo delivery",
                        ),
                      }))
                  : [],
              )}
          />
        ) : tab === "marketing" ? (
          <div className="service-grid">
            <form
              className="panel form-panel"
              onSubmit={(e) => {
                e.preventDefault();
                toast(
                  t(
                    "Priekšskatījums atjaunots. Grozā darbojas BLOOM10.",
                    "Предпросмотр обновлён. В корзине работает BLOOM10.",
                    "Preview updated. BLOOM10 works in the demo bag.",
                  ),
                );
              }}
            >
              <h2>
                {t(
                  "Akcijas priekšskatījums",
                  "Предпросмотр акции",
                  "Promotion preview",
                )}
              </h2>
              <label>
                {t("Kods", "Код", "Code")}
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  maxLength={30}
                />
              </label>
              <label>
                {t("Atlaide (%)", "Скидка (%)", "Discount (%)")}
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </label>
              <div className="notification-preview">
                {promo}: −{discount}% · DEMO
              </div>
              <button className="btn">
                {t("Priekšskatīt", "Предпросмотр", "Preview")}
              </button>
              <small>
                {t(
                  "Konfigurācijas priekšskatījums. Grozā atbalstīts tikai BLOOM10.",
                  "Предпросмотр настройки. В корзине поддерживается только BLOOM10.",
                  "Configuration preview. Checkout supports BLOOM10 only.",
                )}
              </small>
            </form>
            <div className="panel">
              <h2>
                {t("Sezonas jaunumi", "Сезонные новинки", "Seasonal news")}
              </h2>
              <p>
                {t(
                  "Svaigu pušķu, sezonas akciju un atlikumu atlaižu paziņojumu piemēri.",
                  "Примеры уведомлений о свежих букетах, сезонных акциях и скидках на остатки.",
                  "Preview fresh bouquet alerts, seasonal promotions and suitable remaining-stock offers.",
                )}
              </p>
              <button className="btn outline" onClick={() => setNotice(true)}>
                <Bell size={16} />
                {t(
                  "Paziņojuma paraugs",
                  "Пример уведомления",
                  "Preview notification",
                )}
              </button>
            </div>
            <div className="panel">
              <Gift />
              <h2>
                {t(
                  "Dāvanu kartes un lojalitāte",
                  "Карты и лояльность",
                  "Gifts & loyalty",
                )}
              </h2>
              <p>
                {s.gifts.length}{" "}
                {t("demo kartes", "демо-карт", "demo certificates")} ·{" "}
                {s.orders.length * 25}{" "}
                {t("demo punkti", "демо-баллов", "demo points")}
              </p>
              <Link className="text-link" to="/account?tab=loyalty">
                {t("Klienta skatījums", "Вид клиента", "Customer view")}
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        ) : tab === "reminders" ? (
          <>
            <AdminRecords
              rows={s.reminders.map((r) => ({
                id: r.id,
                title: r.name,
                detail: `${r.date} · ${r.channel}`,
                status: r.annual
                  ? t("Katru gadu", "Ежегодно", "Annual")
                  : t("Vienreiz", "Однократно", "Once"),
              }))}
            />
            <Link className="btn" to="/reminders">
              {t(
                "Pārvaldīt demo atgādinājumus",
                "Управлять демо-напоминаниями",
                "Configure demo reminders",
              )}
              <ArrowUpRight size={16} />
            </Link>
          </>
        ) : tab === "subscriptions" ? (
          <AdminRecords
            rows={s.subscriptions.map((p) => ({
              id: p.id,
              title: pick(frequencies[p.frequency], s.lang),
              detail: `${p.months} × ${money(p.price, s.lang)}`,
              status: t("Demo aktīvs", "Демо активна", "Demo active"),
            }))}
          />
        ) : (
          <div className="panel form-panel settings-panel">
            <h2>
              {t(
                "Demonstrācijas iestatījumi",
                "Настройки демонстрации",
                "Demonstration settings",
              )}
            </h2>
            <p>
              {t(
                "Nav aizmugursistēmas, reālu klientu datu, maksājumu vai automāta savienojuma. Kataloga labojumi saglabājas tikai šajā pārlūkā.",
                "Нет сервера, реальных данных клиентов, платежей и подключения автомата. Изменения каталога сохраняются только в этом браузере.",
                "No backend, real customer records, payments or hardware connection. Catalog edits remain in this browser only.",
              )}
            </p>
            <label>
              {t(
                "Paziņojumu kanāls",
                "Канал уведомлений",
                "Notification channel",
              )}
              <select
                value={s.preferences.channel}
                onChange={(e) =>
                  set((o) => ({
                    ...o,
                    preferences: { ...o.preferences, channel: e.target.value },
                  }))
                }
              >
                <option value="email">E-mail</option>
                <option>Telegram</option>
                <option>WhatsApp</option>
              </select>
            </label>
            <p className="success">
              <Check size={16} />
              {t(
                "Saglabājas automātiski",
                "Сохраняется автоматически",
                "Saved automatically",
              )}
            </p>
          </div>
        )}
        {p && (
          <Modal
            title={t(
              "Rediģēt demo produktu",
              "Изменить демо-товар",
              "Edit demo product",
            )}
            close={() => setEdit(null)}
          >
            <form
              className="form-panel"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                set((o) => ({
                  ...o,
                  catalog: o.catalog.map((x) =>
                    x.id === p.id
                      ? {
                          ...x,
                          price: Number(f.get("price")),
                          stock: Number(f.get("stock")),
                          name: [
                            String(f.get("lv")),
                            String(f.get("ru")),
                            String(f.get("en")),
                          ],
                        }
                      : x,
                  ),
                }));
                setEdit(null);
                toast(
                  t(
                    "Produkts atjaunots šajā pārlūkā",
                    "Товар обновлён в этом браузере",
                    "Product updated in this browser",
                  ),
                );
              }}
            >
              {(["lv", "ru", "en"] as const).map((l, i) => (
                <label key={l}>
                  {t("Nosaukums", "Название", "Name")} · {l.toUpperCase()}
                  <input
                    name={l}
                    required
                    defaultValue={p.name[i]}
                    maxLength={90}
                  />
                </label>
              ))}
              <div className="form-grid">
                <label>
                  {t("Cena (€)", "Цена (€)", "Price (€)")}
                  <input
                    name="price"
                    type="number"
                    min={1}
                    max={500}
                    step="0.01"
                    required
                    defaultValue={p.price}
                  />
                </label>
                <label>
                  {t("Krājums", "Остаток", "Stock")}
                  <input
                    name="stock"
                    type="number"
                    min={0}
                    max={1000}
                    required
                    defaultValue={p.stock}
                  />
                </label>
              </div>
              <button className="btn">
                {t("Saglabāt lokāli", "Сохранить локально", "Save locally")}
              </button>
            </form>
          </Modal>
        )}
        {notice && (
          <Modal
            title={t(
              "Paziņojuma priekšskatījums",
              "Предпросмотр уведомления",
              "Notification preview",
            )}
            close={() => setNotice(false)}
          >
            <div className="notification-preview large">
              <Bell />
              <h3>Flower Paradise · {s.preferences.channel}</h3>
              <p>
                {t(
                  "Jauns sezonas pušķis jau gaida! Iepazīsti mūsu florista jaunāko izlasi.",
                  "Новый сезонный букет уже ждёт! Откройте свежую подборку флориста.",
                  "A new seasonal bouquet is waiting! Discover the florist’s latest edit.",
                )}
              </p>
              <Link className="btn" to="/shop?category=5">
                {t("Atklāt", "Открыть", "Discover")}
                <ArrowUpRight size={15} />
              </Link>
            </div>
            <Demo />
          </Modal>
        )}
      </div>
    </div>
  );
}
function AdminRecords({
  rows,
}: {
  rows: { id: string; title: string; detail: string; status: string }[];
}) {
  const t = useT();
  return rows.length ? (
    <div className="record-list">
      {rows.map((r) => (
        <div className="panel record" key={r.id}>
          <Package />
          <div>
            <h3>{r.title}</h3>
            <p>{r.detail}</p>
          </div>
          <span className="badge-static">{r.status}</span>
        </div>
      ))}
    </div>
  ) : (
    <div className="panel empty">
      <Package size={40} />
      <h3>
        {t(
          "Šajā pārlūkā vēl nav demo ierakstu",
          "В этом браузере пока нет демо-записей",
          "No demo records in this browser yet",
        )}
      </h3>
      <p>
        {t(
          "Izmēģini klienta plūsmu — tās rezultāti parādīsies šeit.",
          "Попробуйте клиентский сценарий — результаты появятся здесь.",
          "Try the customer flow and its results will appear here.",
        )}
      </p>
      <Link className="btn" to="/shop">
        {t("Izmēģināt veikalu", "Попробовать магазин", "Try the boutique")}
        <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
