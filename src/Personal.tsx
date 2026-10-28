import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { img, money, pick } from "./data";
import {
  addDays,
  availability,
  dateKey,
  methodLabel,
  round,
  sellable,
  variantPrice,
} from "./domain";
import type { GiftPlan, Order, SecretGift } from "./models";
import { consumeInventory, pickupCode, uid, useStore } from "./store";
import { Demo, Modal, Title, useT } from "./ui";
export default function Personal() {
  return useLocation().pathname === "/planner" ? (
    <AnnualPlanner />
  ) : (
    <SecretGiftPage />
  );
}
function AnnualPlanner() {
  const { s, set, toast } = useStore();
  const t = useT();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [edit, setEdit] = useState<GiftPlan | null>(null);
  const entries = s.reminders
    .filter(
      (r) => !r.dismissed && (r.annual || Number(r.date.slice(0, 4)) === year),
    )
    .map((r) => {
      const d = new Date(r.date + "T12:00:00");
      if (r.annual) d.setFullYear(year);
      const plan = s.giftPlans.find(
        (p) => p.reminderId === r.id && p.year === year,
      );
      return { r, d, plan, budget: plan?.budget ?? 35 };
    })
    .sort((a, b) => a.d.getTime() - b.d.getTime());
  const total = round(entries.reduce((n, x) => n + x.budget, 0));
  const completed = entries.filter((x) => x.plan?.completed);
  return (
    <div className="page">
      <Title
        kicker={t(
          "GADS AR RŪPĒM",
          "ГОД С ЗАБОТОЙ",
          "A YEAR OF THOUGHTFUL LITTLE THINGS",
        )}
        title={t(
          "Katram datumam — sava dāvana.",
          "Каждой дате — свой подарок.",
          "A little thought for every date.",
        )}
        description={t(
          "Tie paši atgādinājumi, tagad ar dāvanu idejām un gada budžetu. Summas ir aptuvenas demo izmaksas bez piegādes.",
          "Те же напоминания — теперь с идеями подарков и бюджетом на год. Суммы — примерные демо-расходы без доставки.",
          "Your existing reminders, with gift ideas and a yearly budget. All amounts are demo estimates excluding delivery.",
        )}
      >
        <Link className="btn" to="/reminders">
          <CalendarDays size={17} />
          {t(
            "Pievienot svarīgu datumu",
            "Добавить важную дату",
            "Add an important date",
          )}
        </Link>
      </Title>
      <Demo />
      <div className="planner-stats stats-grid">
        <div className="panel stat">
          <Gift />
          <span>
            {t(
              "Gada dāvanu budžets",
              "Бюджет подарков на год",
              "Estimated yearly gifts",
            )}
          </span>
          <strong>{money(total, s.lang)}</strong>
        </div>
        <div className="panel stat">
          <CalendarDays />
          <span>{t("Notikumi", "События", "Meaningful dates")}</span>
          <strong>{entries.length}</strong>
        </div>
        <div className="panel stat">
          <Check />
          <span>
            {t("Pabeigti plāni", "Завершённые планы", "Completed plans")}
          </span>
          <strong>{completed.length}</strong>
        </div>
        <div className="panel stat">
          <Heart />
          <span>
            {t(
              "Atlikušais plāna budžets",
              "Оставшийся бюджет плана",
              "Remaining planned budget",
            )}
          </span>
          <strong>
            {money(
              entries
                .filter((x) => !x.plan?.completed)
                .reduce((n, x) => n + x.budget, 0),
              s.lang,
            )}
          </strong>
        </div>
      </div>
      <div className="row-between planner-year">
        <button
          className="icon-btn"
          aria-label={t(
            "Iepriekšējais gads",
            "Предыдущий год",
            "Previous year",
          )}
          onClick={() => setYear(year - 1)}
        >
          <ChevronLeft />
        </button>
        <h2>{year}</h2>
        <button
          className="icon-btn"
          aria-label={t("Nākamais gads", "Следующий год", "Next year")}
          onClick={() => setYear(year + 1)}
        >
          <ChevronRight />
        </button>
      </div>
      <div className="year-grid">
        {Array.from({ length: 12 }, (_, m) => {
          const e = entries.filter((x) => x.d.getMonth() === m);
          return (
            <button
              className={`month-tile ${month === m ? "selected" : ""}`}
              key={m}
              onClick={() => setMonth(m)}
            >
              <strong>
                {new Date(year, m, 1).toLocaleDateString(s.lang, {
                  month: "long",
                })}
              </strong>
              <span>
                {e.length} {t("notikumi", "событий", "occasions")}
              </span>
              <b>
                {money(
                  e.reduce((n, x) => n + x.budget, 0),
                  s.lang,
                )}
              </b>
              <div className="month-dots">
                {e.slice(0, 12).map((x) => (
                  <i
                    key={x.r.id}
                    className={x.plan?.completed ? "completed" : ""}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
      <div className="section-heading planner-heading">
        <div>
          <span className="eyebrow">
            {t("DĀVANAS AR DOMU", "ПОДАРКИ СО СМЫСЛОМ", "THOUGHTFUL PLANS")}
          </span>
          <h2>
            {new Date(year, month, 1).toLocaleDateString(s.lang, {
              month: "long",
            })}
          </h2>
        </div>
        <span className="muted">
          {money(
            entries
              .filter((x) => x.d.getMonth() === month)
              .reduce((n, x) => n + x.budget, 0),
            s.lang,
          )}
        </span>
      </div>
      {entries.filter((x) => x.d.getMonth() === month).length ? (
        <div className="record-list">
          {entries
            .filter((x) => x.d.getMonth() === month)
            .map((x) => {
              const product = s.catalog.find((p) => p.id === x.plan?.productId);
              return (
                <div className="panel planner-event" key={x.r.id}>
                  <div className="event-day">
                    <b>{x.d.getDate()}</b>
                    <span>
                      {x.d.toLocaleDateString(s.lang, { weekday: "short" })}
                    </span>
                  </div>
                  <div>
                    <h3>{x.r.name}</h3>
                    <p>
                      {product
                        ? pick(product.name, s.lang)
                        : t(
                            "Vēl neizvēlēts pušķis",
                            "Букет ещё не выбран",
                            "A bouquet still to choose",
                          )}
                    </p>
                    <span>
                      {money(x.budget, s.lang)} ·{" "}
                      {x.plan?.completed
                        ? t("Pabeigts", "Завершён", "Completed")
                        : t("Plānots", "Запланирован", "Planned")}
                    </span>
                  </div>
                  <button
                    className="btn outline"
                    onClick={() =>
                      setEdit(
                        x.plan ?? {
                          reminderId: x.r.id,
                          year,
                          budget: 35,
                          completed: false,
                          productId: s.catalog.find(
                            (p) => p.price <= 35 && p.category < 7,
                          )!.id,
                        },
                      )
                    }
                  >
                    {t("Dāvanas plāns", "План подарка", "Plan this gift")}
                  </button>
                  <Link
                    className="text-link"
                    to={product ? `/product/${product.id}` : "/match"}
                  >
                    {product
                      ? t(
                          "Skatīt pušķi",
                          "Посмотреть букет",
                          "Meet the bouquet",
                        )
                      : t("Atrast pušķi", "Найти букет", "Find a bouquet")}
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="panel empty">
          <CalendarDays size={35} />
          <h3>
            {t(
              "Mēnesis vēl gaida stāstus.",
              "Этот месяц ещё ждёт историй.",
              "A month waiting for little stories.",
            )}
          </h3>
          <Link className="text-link" to="/reminders">
            {t("Pievienot datumu", "Добавить дату", "Add a date")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
      {edit && (
        <Modal
          title={t("Dāvanas plāns", "План подарка", "A thoughtful gift plan")}
          close={() => setEdit(null)}
        >
          <form
            className="form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              set((o) => ({
                ...o,
                giftPlans: o.giftPlans.some(
                  (p) => p.reminderId === edit.reminderId && p.year === year,
                )
                  ? o.giftPlans.map((p) =>
                      p.reminderId === edit.reminderId && p.year === year
                        ? edit
                        : p,
                    )
                  : [...o.giftPlans, edit],
              }));
              setEdit(null);
              toast(
                t(
                  "Dāvanas plāns saglabāts",
                  "План подарка сохранён",
                  "Gift plan saved",
                ),
              );
            }}
          >
            <label>
              {t("Budžets (€)", "Бюджет (€)", "Budget (€)")}
              <input
                required
                min={s.catalog.find((p) => p.id === edit.productId)?.price ?? 5}
                max={1000}
                type="number"
                value={edit.budget}
                onChange={(e) =>
                  setEdit({ ...edit, budget: Number(e.target.value) })
                }
              />
            </label>
            <label>
              {t("Vēlamais pušķis", "Желаемый букет", "Bouquet idea")}
              <select
                value={edit.productId}
                onChange={(e) =>
                  setEdit({ ...edit, productId: e.target.value })
                }
              >
                {s.catalog
                  .filter((p) => p.category < 9)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {pick(p.name, s.lang)} · {money(p.price, s.lang)}
                    </option>
                  ))}
              </select>
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={edit.completed}
                onChange={(e) =>
                  setEdit({ ...edit, completed: e.target.checked })
                }
              />
              {t(
                "Dāvanas plāns pabeigts (neveido pasūtījumu)",
                "План подарка завершён (не создаёт заказ)",
                "Mark plan completed (does not place an order)",
              )}
            </label>
            <button className="btn">
              <Check size={16} />
              {t("Saglabāt plānu", "Сохранить план", "Save gift plan")}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
function SecretGiftPage() {
  const { s, set, reserveSlot, redeemPickup, toast } = useStore();
  const t = useT();
  const [params, setParams] = useSearchParams();
  const [product, setProduct] = useState(s.catalog.find(p => p.id === params.get("product"))?.id ?? s.catalog[0].id);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [revealDate, setRevealDate] = useState(dateKey());
  const [animation, setAnimation] = useState<SecretGift["animation"]>("petals");
  const [pickup, setPickup] = useState<"pickup" | "vending">("pickup");
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);
  const [senderPreview, setSenderPreview] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const selected = s.secretGifts.find((g) => g.id === params.get("gift"));
  const p = s.catalog.find((p) => p.id === (selected?.productId ?? product))!;
  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!availability(s, product).quantity) {
      setError(
        t(
          "Pušķis demo krājumos nav pieejams.",
          "Букет недоступен в демо-запасе.",
          "This bouquet is unavailable in demo inventory.",
        ),
      );
      return;
    }
    const giftId = uid();
    let pin: string;
    let reservationId: string;
    let slotId: string | undefined;
    if (pickup === "vending") {
      if (revealDate !== dateKey()) {
        setError(
          t(
            "Automāta demo der tikai šodienai; nākotnei izvēlies saņemšanu.",
            "Демо-автомат доступен только на сегодня; для будущей даты выберите самовывоз.",
            "Vending demo is for today; choose pickup for a future reveal.",
          ),
        );
        return;
      }
      const slot = availability(s, product).slots[0];
      if (!slot) {
        setError(
          t(
            "Izvēlētajam pušķim nav brīva nodalījuma.",
            "Для букета нет свободной ячейки.",
            "No free compartment holds this bouquet.",
          ),
        );
        return;
      }
      const c = reserveSlot(slot.id);
      if (!c) return;
      pin = c;
      slotId = slot.id;
      reservationId = "";
    } else {
      if (!availability(s, product).studio) {
        setError(
          t(
            "Studijas demo krājumi nav pieejami. Izvēlies automātu vai citu pušķi.",
            "Нет демо-запаса в студии. Выберите автомат или другой букет.",
            "No demo studio stock. Choose vending or another bouquet.",
          ),
        );
        return;
      }
      pin = pickupCode(s.reservations.map((r) => r.code));
      reservationId = `secret-${giftId}`;
    }
    const gift: SecretGift = {
      id: giftId,
      productId: product,
      recipient,
      message,
      revealDate,
      animation,
      pickup,
      code: `SG-${pin}`,
      pickupCode: pin,
      reservationId,
      slotId,
      redeemed: false,
      createdAt: new Date().toISOString(),
    };
    set((o) => ({
      ...o,
      secretGifts: [...o.secretGifts, gift],
      reservations:
        pickup === "vending"
          ? o.reservations
          : [
              ...o.reservations,
              {
                id: reservationId,
                product,
                date: revealDate,
                time: "12:00",
                method: "pickup",
                code: pin,
                status: "reserved",
                message,
                expiresAt: addDays(1, revealDate) + "T21:59:59Z",
              },
            ],
    }));
    setParams({ gift: giftId });
    setOpened(false);
    setError("");
  }
  function redeem() {
    if (!selected || selected.redeemed) return;
    if (
      selected.revealDate > dateKey() ||
      redeemCode.trim().toUpperCase() !== selected.code
    ) {
      setError(
        t(
          "Pārbaudi kodu un atklāšanas datumu.",
          "Проверьте код и дату раскрытия.",
          "Check the gift code and reveal date.",
        ),
      );
      return;
    }
    if (selected.pickup === "vending") {
      if (!redeemPickup(selected.pickupCode || "")) {
        setError(
          t(
            "Nodalījuma rezervācija vairs nav derīga.",
            "Бронь ячейки больше не действует.",
            "The compartment reservation is no longer valid.",
          ),
        );
        return;
      }
    } else {
      const r = s.reservations.find(
        (r) => r.id === selected.reservationId && r.status === "reserved",
      );
      if (!r) {
        setError(
          t(
            "Rezervācija vairs nav derīga.",
            "Бронь больше не действует.",
            "This reservation is no longer valid.",
          ),
        );
        return;
      }
      const usable = s.batches.some(
        (b) =>
          b.productId === selected.productId &&
          b.quantity > 0 &&
          b.location === "studio" &&
          sellable(b, s.freshnessRules),
      );
      if (!usable) {
        setError(
          t(
            "Pušķis vairs nav pieejams. Izvēlies citu dāvanu.",
            "Букет больше недоступен. Выберите другой подарок.",
            "This bouquet is no longer available. Choose another gift.",
          ),
        );
        return;
      }
      set((o) =>
        consumeInventory(
          {
            ...o,
            reservations: o.reservations.map((r) =>
              r.id === selected.reservationId
                ? { ...r, status: "collected" }
                : r,
            ),
          },
          [{ id: selected.productId, qty: 1 }],
        ),
      );
    }
    set((o) => ({
      ...o,
      secretGifts: o.secretGifts.map((g) =>
        g.id === selected.id ? { ...g, redeemed: true } : g,
      ),
    }));
    setError("");
    toast(
      t(
        "Demo dāvana saņemta!",
        "Демо-подарок получен!",
        "Your demo gift is collected!",
      ),
    );
  }
  return (
    <div className="page">
      <Title
        kicker={t(
          "MAZS NOSLĒPUMS. LIELS SMAIDS.",
          "МАЛЕНЬКИЙ СЕКРЕТ. БОЛЬШАЯ УЛЫБКА.",
          "A LITTLE SECRET. A VERY BIG SMILE.",
        )}
        title={t(
          "Daži pārsteigumi zied.",
          "Некоторые сюрпризы расцветают.",
          "Some surprises bloom.",
        )}
        description={t(
          "Personiska dāvana ar saņēmēja priekšskatījumu. Viss darbojas tikai šajā pārlūkā; saite nenodrošina privātu vai drošu kopīgošanu.",
          "Личный подарок с предпросмотром для получателя. Всё работает только в этом браузере; ссылка не обеспечивает приватную или защищённую передачу.",
          "A personal gift with a recipient preview. Everything works only in this browser; the link does not provide private or secure sharing.",
        )}
      />
      <Demo />
      {selected ? (
        <div className="secret-recipient-layout">
          <div
            className={`secret-reveal ${opened ? "opened" : ""} animation-${selected.animation}`}
          >
            <div className="petals-decoration" aria-hidden="true">
              ✳ ❋ ✳
            </div>
            {!opened ? (
              <div className="secret-envelope">
                <Gift size={55} strokeWidth={1} />
                <span className="eyebrow">FLOWER PARADISE</span>
                <h2>{selected.recipient},</h2>
                <p>
                  {t(
                    "tevi gaida mazs pārsteigums.",
                    "вас ждёт маленький сюрприз.",
                    "a little surprise is waiting for you.",
                  )}
                </p>
                <button
                  className="btn ivory"
                  disabled={selected.revealDate > dateKey() && !senderPreview}
                  onClick={() => setOpened(true)}
                >
                  {t("Atklāt dāvanu", "Раскрыть подарок", "Reveal my gift")}
                  <Heart size={16} />
                </button>
                {selected.revealDate > dateKey() && (
                  <p>
                    {t("Atklāšanas datums", "Дата раскрытия", "Reveal date")}:{" "}
                    {selected.revealDate}
                  </p>
                )}
              </div>
            ) : (
              <div className="revealed-gift">
                <img src={img(p.photo, 1000)} alt={pick(p.name, s.lang)} />
                <span className="eyebrow">
                  {t(
                    "TEV, AR MĪLESTĪBU",
                    "ТЕБЕ, С ЛЮБОВЬЮ",
                    "FOR YOU, WITH LOVE",
                  )}
                </span>
                <h2>{selected.recipient}</h2>
                <p className="personal-greeting">{selected.message}</p>
                <h3>{pick(p.name, s.lang)}</h3>
                <span>
                  {methodLabel(selected.pickup, s.lang)} · {selected.revealDate}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="panel">
              <span className="eyebrow">
                {t("DEMO SAŅEMŠANA", "ДЕМО-ПОЛУЧЕНИЕ", "DEMO COLLECTION")}
              </span>
              <h2>
                {selected.redeemed
                  ? t(
                      "Prieks ir saņemts.",
                      "Радость получена.",
                      "A little lovely, collected.",
                    )
                  : t(
                      "Tava dāvana jau gaida.",
                      "Ваш подарок уже ждёт.",
                      "Your little gift is waiting.",
                    )}
              </h2>
              <p className="large-code secret-code">{selected.code}</p>
              <p>
                {selected.pickup === "vending"
                  ? t(
                      "Nodalījums rezervēts uz 30 minūtēm. Dāvanas saņemšana atvērs arī demo nodalījumu.",
                      "Ячейка забронирована на 30 минут. Получение подарка откроет и демо-ячейку.",
                      "The compartment is reserved for 30 minutes. Gift redemption also unlocks the demo compartment.",
                    )
                  : t(
                      "Demo saņemšana studijā izvēlētajā datumā. Īsta adrese vēl nav paziņota.",
                      "Демо-самовывоз в выбранную дату. Реальный адрес пока не объявлен.",
                      "Demo studio pickup on the selected date. An operating address has not been announced.",
                    )}
              </p>
              {!selected.redeemed && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    redeem();
                  }}
                >
                  <label>
                    {t(
                      "Demo dāvanas kods",
                      "Демо-код подарка",
                      "Demo gift code",
                    )}
                    <input
                      required
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value)}
                      placeholder="SG-000000"
                    />
                  </label>
                  <button className="btn full">
                    <Check size={16} />
                    {t(
                      "Saņemt demo dāvanu",
                      "Получить демо-подарок",
                      "Collect demo gift",
                    )}
                  </button>
                </form>
              )}
              <p className="error" role="alert">
                {error}
              </p>
            </div>
            <div className="panel sender-tools">
              <h3>
                {t(
                  "Sūtītāja rīki",
                  "Инструменты отправителя",
                  "Sender’s preview tools",
                )}
              </h3>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={senderPreview}
                  onChange={(e) => setSenderPreview(e.target.checked)}
                />
                {t(
                  "Atļaut priekšskatījumu pirms datuma",
                  "Разрешить предпросмотр до даты",
                  "Preview before the reveal date",
                )}
              </label>
              <p className="muted">
                {t(
                  "Priekšskatījums neatceļ saņemšanas datuma pārbaudi. Nav īstas privātuma aizsardzības.",
                  "Предпросмотр не отменяет проверку даты получения. Реальной защиты приватности нет.",
                  "Preview does not bypass the collection date check. This is not a privacy or security boundary.",
                )}
              </p>
              <button
                className="text-link"
                onClick={() => {
                  setParams({});
                  setOpened(false);
                  setSenderPreview(false);
                }}
              >
                {t(
                  "Izveidot vēl vienu pārsteigumu",
                  "Создать ещё один сюрприз",
                  "Create another little surprise",
                )}
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="checkout-layout">
          <form className="panel form-panel" onSubmit={create}>
            <h2>
              {t(
                "Sagatavo savu pārsteigumu",
                "Подготовьте свой сюрприз",
                "Put a little thought into it",
              )}
            </h2>
            <label>
              {t("Izvēlies pušķi", "Выберите букет", "Choose a bouquet")}
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                {s.catalog
                  .filter((p) => p.category < 9)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {pick(p.name, s.lang)} · {money(p.price, s.lang)}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              {t(
                "Izdomāts saņēmēja vārds",
                "Вымышленное имя получателя",
                "Fictional recipient display name",
              )}
              <input
                required
                maxLength={80}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Alex Demo"
              />
            </label>
            <label>
              {t(
                "Personisks sveiciens",
                "Личное поздравление",
                "A personal greeting",
              )}
              <textarea
                required
                maxLength={300}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <div className="form-grid">
              <label>
                {t("Atklāšanas datums", "Дата раскрытия", "Reveal date")}
                <input
                  required
                  type="date"
                  min={dateKey()}
                  value={revealDate}
                  onChange={(e) => setRevealDate(e.target.value)}
                />
              </label>
              <label>
                {t("Animācija", "Анимация", "Reveal animation")}
                <select
                  value={animation}
                  onChange={(e) =>
                    setAnimation(e.target.value as SecretGift["animation"])
                  }
                >
                  <option value="petals">
                    {t("Ziedlapas", "Лепестки", "Petals")}
                  </option>
                  <option value="envelope">
                    {t("Vēstule", "Письмо", "An envelope")}
                  </option>
                  <option value="simple">
                    {t("Maiga pāreja", "Плавный переход", "A soft reveal")}
                  </option>
                </select>
              </label>
            </div>
            <label>
              {t("Saņemšana", "Получение", "Collection")}
              <select
                value={pickup}
                onChange={(e) =>
                  setPickup(e.target.value as "pickup" | "vending")
                }
              >
                <option value="pickup">
                  {t(
                    "Studijas demo saņemšana",
                    "Демо-самовывоз в студии",
                    "Demo studio pickup",
                  )}
                </option>
                <option value="vending">
                  {t(
                    "Automāts šodien · 30 minūtes",
                    "Автомат сегодня · 30 минут",
                    "Vending today · 30 minutes",
                  )}
                </option>
              </select>
            </label>
            <p className="error" role="alert">
              {error}
            </p>
            <button className="btn">
              <Gift size={16} />
              {t(
                "Izveidot un priekšskatīt",
                "Создать и посмотреть",
                "Create & preview the surprise",
              )}
            </button>
          </form>
          <aside className="panel secret-preview">
            <img src={img(p.photo)} alt={pick(p.name, s.lang)} />
            <h2>
              {recipient ||
                t("Kādam īpašam", "Кому-то особенному", "For someone special")}
            </h2>
            <p>
              {message ||
                t(
                  "Daži vārdi no sirds…",
                  "Несколько слов от души…",
                  "A few words from the heart…",
                )}
            </p>
            <span className="muted">
              {pick(p.name, s.lang)} · {money(p.price, s.lang)}
            </span>
          </aside>
        </div>
      )}
      {s.secretGifts.length > 0 && !selected && (
        <section className="section slim">
          <h2>
            {t(
              "Mani demo pārsteigumi",
              "Мои демо-сюрпризы",
              "My little demo surprises",
            )}
          </h2>
          <div className="record-list">
            {s.secretGifts.map((g) => (
              <Link
                className="panel record"
                key={g.id}
                to={`/secret-gift?gift=${g.id}`}
              >
                <Gift />
                <div>
                  <h3>{g.recipient}</h3>
                  <p>
                    {g.revealDate} ·{" "}
                    {g.redeemed
                      ? t("Saņemts", "Получен", "Collected")
                      : t(
                          "Gaida atklāšanu",
                          "Ожидает раскрытия",
                          "Waiting to bloom",
                        )}
                  </p>
                </div>
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
export function ReorderButton({ order }: { order: Order }) {
  const { s, reorder, toast } = useStore();
  const t = useT();
  const [open, setOpen] = useState(false);
  const list = order.items.map((item) => {
    const p = s.catalog.find((p) => p.id === item.id)!;
    return {
      item,
      p,
      available: availability(s, p.id).quantity >= item.qty,
      price: item.options ? variantPrice(p, item.options) : p.price,
    };
  });
  return (
    <>
      <button className="text-link" onClick={() => setOpen(true)}>
        <RotateCcw size={14} />
        {t("Atkārtot", "Повторить", "Order these again")}
      </button>
      {open && (
        <Modal
          title={t(
            "Vēl viens skaists mirklis",
            "Ещё один прекрасный момент",
            "Another little lovely moment",
          )}
          close={() => setOpen(false)}
        >
          <Demo />
          <p className="muted">
            {t(
              "Pārbaudi pašreizējās demo cenas un pieejamību. Iepriekšējās strukturētās izvēles saglabājas. Veciem pasūtījumiem paliek piezīmes, bet sarežģītās izvēles jāizveido no jauna. Nekas netiks pasūtīts automātiski.",
              "Проверьте текущие демо-цены и доступность. Структурированные варианты сохраняются. У старых заказов сохраняются заметки, но сложные варианты нужно настроить заново. Заказ не оформляется автоматически.",
              "Review current demo prices and availability. Structured options are kept. Legacy orders retain their notes; complex options need reconfiguration. No order is placed automatically.",
            )}
          </p>
          {list.map(({ item, p, available, price }, i) => (
            <div className="reorder-line" key={i}>
              <img src={img(p.photo, 200)} alt="" />
              <div>
                <h3>
                  {pick(p.name, s.lang)} × {item.qty}
                </h3>
                <p>{item.note}</p>
                <strong>{money(price * item.qty, s.lang)}</strong>
              </div>
              {!available && (
                <Link className="text-link" to={`/shop?category=${p.category}`}>
                  {t(
                    "Atrast alternatīvu",
                    "Найти замену",
                    "Find an alternative",
                  )}
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          ))}
          <div className="summary-total">
            <span>
              {t(
                "Pieejamo preču cena",
                "Цена доступных товаров",
                "Available items total",
              )}
            </span>
            <b>
              {money(
                list
                  .filter((x) => x.available)
                  .reduce((n, x) => n + x.price * x.item.qty, 0),
                s.lang,
              )}
            </b>
          </div>
          <button
            className="btn full"
            disabled={!list.some((x) => x.available)}
            onClick={() => {
              const result = reorder(order.items);
              toast(
                t(
                  `Grozam pievienotas ${result.added} vienības. Nepieejamas: ${result.unavailable.length}.`,
                  `В корзину добавлено ${result.added} шт. Недоступно: ${result.unavailable.length}.`,
                  `${result.added} units added to your bag. Unavailable: ${result.unavailable.length}.`,
                ),
              );
              setOpen(false);
            }}
          >
            {t(
              "Pievienot pieejamo grozam",
              "Добавить доступное в корзину",
              "Add available items to bag",
            )}
            <ArrowUpRight size={16} />
          </button>
        </Modal>
      )}
    </>
  );
}
