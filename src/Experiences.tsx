import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  LockKeyhole,
  UnlockKeyhole,
  Gift,
  Flower2,
  CalendarDays,
  Clock3,
  Leaf,
} from "lucide-react";
import { useStore, uid, pickupCode } from "./store";
import { useT, Title, Demo, Modal, ProductCard } from "./ui";
import { pick, money, img, colors, future, estimate, conflict } from "./data";
export default function Experiences() {
  const path = useLocation().pathname;
  return path === "/vending" ? (
    <Vending />
  ) : path === "/reserve" ? (
    <Reserve />
  ) : path === "/customize" ? (
    <Customize />
  ) : path === "/subscriptions" ? (
    <Subscriptions />
  ) : (
    <Gifts />
  );
}
function Vending() {
  const { s, set, toast } = useStore();
  const t = useT();
  const [selected, select] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [opened, open] = useState<number | null>(null);
  const [receipt, setReceipt] = useState("");
  const [error, setError] = useState("");
  const bouquets = [s.catalog[0], s.catalog[4], s.catalog[9], s.catalog[18]];
  const reservation = (i: number) =>
    s.reservations.find(
      (r) => r.product === `slot-${i}` && r.status === "reserved",
    );
  function reserve() {
    if (selected === null) return;
    const c = pickupCode();
    set((o) => ({
      ...o,
      reservations: [
        ...o.reservations,
        {
          id: uid(),
          product: `slot-${selected}`,
          date: future(0),
          time: "24/7",
          method: "vending",
          code: c,
          status: "reserved",
        },
      ],
    }));
    setReceipt(c);
    select(null);
  }
  function unlock(e: React.FormEvent) {
    e.preventDefault();
    const r = s.reservations.find(
      (r) =>
        r.code === code.trim() &&
        r.product.startsWith("slot-") &&
        r.status === "reserved",
    );
    if (!r) {
      setError(
        t(
          "Kods nav derīgs vai jau izmantots.",
          "Код неверный или уже использован.",
          "That code is invalid or has already been used.",
        ),
      );
      return;
    }
    const n = Number(r.product.split("-")[1]);
    open(n);
    setError("");
    set((o) => ({
      ...o,
      reservations: o.reservations.map((a) =>
        a.id === r.id ? { ...a, status: "collected" } : a,
      ),
      picked: [...o.picked, n],
    }));
    toast(
      t(
        "Nodalījums atvērts! Demo saņemšana pabeigta.",
        "Ячейка открыта! Демо-получение завершено.",
        "Your compartment is open! Demo pickup complete.",
      ),
    );
    setCode("");
  }
  return (
    <div className="page">
      <Title
        kicker={t(
          "MĪLESTĪBAI NAV DARBA LAIKA",
          "У ЛЮБВИ НЕТ РАСПИСАНИЯ",
          "THOUGHTFULNESS, WITHOUT THE OPENING HOURS",
        )}
        title={t(
          "Ziedi. Jebkurā laikā.",
          "Цветы. В любое время.",
          "Flowers. Around the clock.",
        )}
        description={t(
          "Iepazīsti mūsu ziedu automāta konceptu. Izvēlies, rezervē un atver savu ziedu nodalījumu.",
          "Откройте наш концепт цветочного автомата. Выберите, забронируйте и откройте свою ячейку.",
          "Meet our flower vending concept. Choose, reserve and unlock your little moment of happiness.",
        )}
      />
      <Demo />
      <div className="vending-layout">
        <div className="machine">
          <div className="machine-brand">
            <Flower2 /> FLOWER PARADISE <span>24/7</span>
          </div>
          <div className="machine-grid">
            {bouquets.map((p, i) => {
              const r = reservation(i);
              const collected = s.picked.includes(i);
              return (
                <button
                  key={i}
                  className={`compartment ${selected === i ? "selected" : ""} ${opened === i ? "unlocked" : ""} ${collected ? "collected" : ""}`}
                  disabled={!!r || collected || i === 3}
                  onClick={() => {
                    select(i);
                    setReceipt("");
                  }}
                >
                  <div className="slot-top">
                    <span>0{i + 1}</span>
                    <span
                      className={`status-dot ${r || i === 3 ? "occupied" : ""}`}
                    >
                      {collected
                        ? t("Saņemts", "Получен", "Collected")
                        : r || i === 3
                          ? t("Rezervēts", "Забронирован", "Reserved")
                          : t("Pieejams", "Доступен", "Available")}
                    </span>
                  </div>
                  <img src={img(p.photo, 500)} alt={pick(p.name, s.lang)} />
                  <div className="slot-bottom">
                    <div>
                      <strong>{pick(p.name, s.lang)}</strong>
                      <small>{money(p.price)}</small>
                    </div>
                    {opened === i ? (
                      <UnlockKeyhole size={20} />
                    ) : (
                      <LockKeyhole size={20} />
                    )}
                  </div>
                  <div className="door-glint" />
                </button>
              );
            })}
          </div>
          <div className="machine-base">
            <span>
              ❋{" "}
              {t(
                "Svaigi ziedi. Silti mirkļi.",
                "Свежие цветы. Тёплые моменты.",
                "Fresh flowers. Warm feelings.",
              )}
            </span>
            <small>DEMO CONCEPT</small>
          </div>
        </div>
        <div className="vending-controls">
          <div className="panel">
            <span className="eyebrow">
              01 · {t("IZVĒLIES", "ВЫБЕРИТЕ", "CHOOSE")}
            </span>
            <h2>
              {t(
                "Tavs mazais pārsteigums",
                "Ваш маленький сюрприз",
                "Your little surprise",
              )}
            </h2>
            {selected !== null ? (
              <>
                <div className="selection-preview">
                  <img src={img(bouquets[selected].photo, 200)} alt="" />
                  <div>
                    <h3>{pick(bouquets[selected].name, s.lang)}</h3>
                    <p>
                      {t("Nodalījums", "Ячейка", "Compartment")} 0{selected + 1}
                    </p>
                    <strong>{money(bouquets[selected].price)}</strong>
                  </div>
                </div>
                <button className="btn full" onClick={reserve}>
                  {t(
                    "Rezervēt · Simulēt maksājumu",
                    "Бронь · Имитировать оплату",
                    "Reserve · Simulate payment",
                  )}
                  <ArrowUpRight size={17} />
                </button>
              </>
            ) : (
              <p>
                {t(
                  "Pieskaries kādam no pieejamajiem nodalījumiem.",
                  "Нажмите на доступную ячейку.",
                  "Tap an available compartment to meet your bouquet.",
                )}
              </p>
            )}
            {receipt && (
              <div className="code-receipt">
                <Check size={22} />
                <p>
                  {t(
                    "Tavs vienreizējais demo kods",
                    "Ваш одноразовый демо-код",
                    "Your one-time demo pickup code",
                  )}
                </p>
                <strong>{receipt}</strong>
                <button
                  className="text-link"
                  onClick={() => {
                    setCode(receipt);
                    setReceipt("");
                  }}
                >
                  {t(
                    "Izmantot kodu zemāk",
                    "Использовать код ниже",
                    "Use this code below",
                  )}
                </button>
              </div>
            )}
          </div>
          <form className="panel" onSubmit={unlock}>
            <span className="eyebrow">
              02 · {t("SAŅEM", "ПОЛУЧИТЕ", "COLLECT")}
            </span>
            <h2>
              {t(
                "Skaistums aiz sešiem cipariem.",
                "Красота за шестью цифрами.",
                "Six digits to something lovely.",
              )}
            </h2>
            <label>
              {t(
                "Demo saņemšanas kods",
                "Демо-код получения",
                "Demo pickup code",
              )}
              <input
                className="code-input"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                placeholder="000000"
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </label>
            <p className="error" role="alert">
              {error}
            </p>
            <button className="btn outline full">
              <UnlockKeyhole size={17} />
              {t("Atvērt nodalījumu", "Открыть ячейку", "Unlock compartment")}
            </button>
          </form>
          <p className="muted">
            {t(
              "Šis ir pārlūka simulators. Nav savienojuma ar aparatūru, īstiem krājumiem vai maksājumu sistēmu. Nodalījums 04 ir demonstrācijas rezervācija.",
              "Это симулятор в браузере. Нет подключения к оборудованию, реальным остаткам или платежам. Ячейка 04 — пример занятой ячейки.",
              "This browser simulation has no connection to hardware, real inventory or payments. Compartment 04 demonstrates an occupied slot.",
            )}
          </p>
          <Link className="text-link" to="/reserve">
            {t(
              "Plāno īpašu datumu? Rezervē iepriekš.",
              "Планируете особый день? Забронируйте заранее.",
              "Planning a special date? Reserve ahead.",
            )}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <section className="section">
        <h2>
          {t(
            "Tā darbosies īstais pakalpojums",
            "Как будет работать реальный сервис",
            "How the real service could work",
          )}
        </h2>
        <div className="service-grid">
          {[
            t(
              "Tiešsaistē izvēlies svaigu pušķi no pieejamiem nodalījumiem.",
              "Выберите свежий букет в доступной ячейке онлайн.",
              "Choose a fresh bouquet online from the available compartments.",
            ),
            t(
              "Pēc apstiprināta maksājuma saņem vienreizēju kodu.",
              "После подтверждения оплаты получите одноразовый код.",
              "Receive a one-time code after a confirmed payment.",
            ),
            t(
              "Saņem ziedus sev ērtā laikā. Pakalpojums vēl tiek plānots.",
              "Заберите цветы в удобное время. Сервис ещё планируется.",
              "Collect at a time that suits you. The service is still being planned.",
            ),
          ].map((x, i) => (
            <div className="service-card" key={x}>
              <span className="eyebrow">0{i + 1}</span>
              <p>{x}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
function Reserve() {
  const { s, set } = useStore();
  const t = useT();
  const [params] = useSearchParams();
  const [product, setProduct] = useState(
    params.get("product") || s.catalog[0].id,
  );
  const [method, setMethod] = useState("vending");
  const [date, setDate] = useState(future(1));
  const [time, setTime] = useState("12:00");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const p = s.catalog.find((p) => p.id === product)!;
  return (
    <div className="page">
      <Title
        kicker={t(
          "IEPLĀNO MAZU BRĪNUMU",
          "ЗАПЛАНИРУЙТЕ МАЛЕНЬКОЕ ЧУДО",
          "MAKE ROOM FOR SOMETHING LOVELY",
        )}
        title={t(
          "Rezervē īpašu mirkli.",
          "Забронируйте особенный момент.",
          "Reserve a special moment.",
        )}
        description={t(
          "Nākotnes rezervācija ar simulētu pieejamību šajā pārlūkā.",
          "Будущая бронь с имитацией доступности в этом браузере.",
          "A future reservation with simulated availability in this browser.",
        )}
      />
      <Demo />
      {done ? (
        <div className="panel confirmation">
          <Check />
          <h2>
            {t(
              "Demo rezervācija apstiprināta",
              "Демо-бронирование подтверждено",
              "Your demo reservation is confirmed",
            )}
          </h2>
          <p>
            {date} · {time}
          </p>
          <p>
            {t(
              "Nākotnes vienreizējā koda piemērs",
              "Пример будущего одноразового кода",
              "Example future one-time code",
            )}
          </p>
          <strong className="large-code">{done}</strong>
          <p className="muted">
            {t(
              "Kods nav derīgs īstā automātā.",
              "Код не действует в реальном автомате.",
              "This code cannot open real hardware.",
            )}
          </p>
          <Link className="btn" to="/account?tab=reservations">
            {t("Skatīt rezervāciju", "Посмотреть бронь", "View reservation")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <form
          className="checkout-layout"
          onSubmit={(e) => {
            e.preventDefault();
            if (date < future(1)) {
              setError(
                t(
                  "Izvēlies nākotnes datumu.",
                  "Выберите будущую дату.",
                  "Choose a future date.",
                ),
              );
              return;
            }
            if (
              conflict(
                s.reservations.filter((r) => r.status === "reserved"),
                date,
                time,
                method,
              )
            ) {
              setError(
                t(
                  "Šis demo laiks jau rezervēts. Izvēlies citu.",
                  "Это демо-время уже занято. Выберите другое.",
                  "This demo slot is already reserved. Choose another time.",
                ),
              );
              return;
            }
            const code = pickupCode();
            set((o) => ({
              ...o,
              reservations: [
                ...o.reservations,
                {
                  id: uid(),
                  product,
                  date,
                  time,
                  method,
                  code,
                  status: "reserved",
                  message: msg,
                },
              ],
            }));
            setDone(code);
          }}
        >
          <div className="panel form-panel">
            <label>
              {t("Izvēlies pušķi", "Выберите букет", "Choose your bouquet")}
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                {s.catalog
                  .filter((p) => p.category < 9)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {pick(p.name, s.lang)} · {money(p.price)}
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
                  min={future(1)}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                {t("Laiks", "Время", "Time")}
                <select value={time} onChange={(e) => setTime(e.target.value)}>
                  {["09:00", "12:00", "15:00", "18:00", "21:00"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              {t("Saņemšana", "Получение", "Collection")}
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="vending">
                  {t(
                    "Ziedu automāts",
                    "Цветочный автомат",
                    "Flower vending pickup",
                  )}
                </option>
                <option value="delivery">
                  {t("Piegāde · €5", "Доставка · €5", "Delivery · €5")}
                </option>
              </select>
            </label>
            <label>
              {t(
                "Kartītes ziņa (iekļauta demo)",
                "Послание на открытке (включено в демо)",
                "Card message (included in demo)",
              )}
              <textarea
                maxLength={300}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
              />
            </label>
            <p className="error" role="alert">
              {error}
            </p>
            <button className="btn">
              {t(
                "Apstiprināt demo rezervāciju",
                "Подтвердить демо-бронь",
                "Confirm demo reservation",
              )}
              <ArrowUpRight size={16} />
            </button>
          </div>
          <aside className="panel reservation-preview">
            <img src={img(p.photo)} alt={pick(p.name, s.lang)} />
            <h2>{pick(p.name, s.lang)}</h2>
            <strong>{money(p.price + (method === "delivery" ? 5 : 0))}</strong>
            <p>
              {date} · {time}
            </p>
            <p className="muted">
              {t(
                "Īstie krājumi netiek pārbaudīti. Maksājums nav nepieciešams.",
                "Реальные остатки не проверяются. Оплата не требуется.",
                "Real inventory is not checked. No payment is needed.",
              )}
            </p>
          </aside>
        </form>
      )}
    </div>
  );
}
function Customize() {
  const { s, add, toast } = useStore();
  const t = useT();
  const [size, setSize] = useState(35);
  const [color, setColor] = useState(0);
  const [variety, setVariety] = useState(0);
  const [wrap, setWrap] = useState("ivory");
  const [card, setCard] = useState(false);
  const [gift, setGift] = useState(false);
  const [msg, setMsg] = useState("");
  const [date, setDate] = useState(future(1));
  const [method, setMethod] = useState("pickup");
  const price = estimate(size, card, gift, variety);
  return (
    <div className="page">
      <Title
        kicker={t(
          "TAVS STĀSTS. TAVI ZIEDI.",
          "ВАША ИСТОРИЯ. ВАШИ ЦВЕТЫ.",
          "YOUR STORY. YOUR STEMS.",
        )}
        title={t(
          "Izveido kaut ko īpašu.",
          "Создайте нечто особенное.",
          "Make something personal.",
        )}
        description={t(
          "Pušķa konfigurators · demonstrācijas cenas un izvēles.",
          "Конструктор букета · демонстрационные цены и варианты.",
          "Bouquet configurator · demonstration options and estimated prices.",
        )}
      />
      <Demo />
      <div className="customize-layout">
        <div className="custom-preview">
          <img
            src={img(s.catalog[color * 3].photo, 1000)}
            alt={t(
              "Izvēlētā toņa stila piemērs",
              "Пример стиля выбранного оттенка",
              "Style inspiration for your chosen shade",
            )}
          />
          <div>
            <span className="eyebrow">
              {t(
                "TAVS INDIVIDUĀLAIS PUŠĶIS",
                "ВАШ ИНДИВИДУАЛЬНЫЙ БУКЕТ",
                "YOUR BESPOKE BOUQUET",
              )}
            </span>
            <h2>
              {pick(colors[color], s.lang)} ·{" "}
              {size === 25 ? "S" : size === 35 ? "M" : "L"}
            </h2>
            <p>
              {t(
                "Foto ilustrē noskaņu, nevis precīzu sastāvu.",
                "Фото передаёт настроение, а не точный состав.",
                "Photography illustrates a mood, rather than the exact composition.",
              )}
            </p>
          </div>
        </div>
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            const note = `${pick(colors[color], s.lang)} · ${wrap} · ${size === 25 ? "S" : size === 35 ? "M" : "L"} · ${date} · ${method} · ${msg}${card ? t(" · kartīte", " · открытка", " · greeting card") : ""}${gift ? t(" · dāvana", " · подарок", " · gift") : ""}`;
            add("fp-19", 1, note, price);
            toast(
              t(
                "Tavs pušķis pievienots grozam",
                "Ваш букет добавлен в корзину",
                "Your bespoke bouquet is in the bag",
              ),
            );
          }}
        >
          <h3>01 · {t("Izmērs", "Размер", "Size")}</h3>
          <div className="choice-row">
            {[25, 35, 55].map((v, i) => (
              <button
                type="button"
                key={v}
                className={`choice ${size === v ? "selected" : ""}`}
                onClick={() => setSize(v)}
              >
                {["S", "M", "L"][i]}
                <small>{money(v)}</small>
              </button>
            ))}
          </div>
          <h3>
            02 · {t("Krāsa un ziedi", "Оттенок и цветы", "Shades & stems")}
          </h3>
          <div className="color-choices">
            {colors.map((x, i) => (
              <button
                aria-label={pick(x, s.lang)}
                title={pick(x, s.lang)}
                type="button"
                key={i}
                style={{
                  background: [
                    "#d8a8b2",
                    "#a53c4c",
                    "#eee9de",
                    "linear-gradient(120deg,#cb9d99,#e4c961,#9bb49b)",
                  ][i],
                }}
                className={color === i ? "selected" : ""}
                onClick={() => setColor(i)}
              >
                {color === i && <Check size={18} />}
              </button>
            ))}
          </div>
          <label>
            {t("Ziedu izvēle", "Выбор цветов", "Flower preference")}
            <select
              value={variety}
              onChange={(e) => setVariety(Number(e.target.value))}
            >
              <option value="0">
                {t("Sezonas izlase", "Сезонный выбор", "Seasonal selection")}
              </option>
              <option value="8">
                {t("Rozes · +€8", "Розы · +€8", "Roses · +€8")}
              </option>
              <option value="12">
                {t(
                  "Premium jaukts · +€12",
                  "Премиальный микс · +€12",
                  "Premium mixed · +€12",
                )}
              </option>
            </select>
          </label>
          <label>
            {t("Iesaiņojums", "Упаковка", "Wrapping")}
            <select value={wrap} onChange={(e) => setWrap(e.target.value)}>
              <option value="ivory">
                {t(
                  "Ziloņkaula papīrs",
                  "Бумага цвета слоновой кости",
                  "Ivory paper",
                )}
              </option>
              <option value="kraft">
                {t("Dabisks kraftpapīrs", "Натуральный крафт", "Natural kraft")}
              </option>
              <option value="rose">
                {t("Rozā iesaiņojums", "Розовая упаковка", "Dusty rose wrap")}
              </option>
            </select>
          </label>
          <h3>
            03 ·{" "}
            {t(
              "Personisks pieskāriens",
              "Личное прикосновение",
              "The thoughtful touches",
            )}
          </h3>
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
          <label className="check-label">
            <input
              type="checkbox"
              checked={gift}
              onChange={(e) => setGift(e.target.checked)}
            />
            {t(
              "Saldā dāvana · €12",
              "Сладкий подарок · €12",
              "A sweet little gift · €12",
            )}
          </label>
          <label>
            {t("Ziņa", "Послание", "Message")}
            <textarea
              maxLength={300}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
          </label>
          <div className="form-grid">
            <label>
              {t("Vēlamais datums", "Желаемая дата", "Preferred date")}
              <input
                required
                type="date"
                min={future(1)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              {t("Saņemšana", "Получение", "Fulfilment")}
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="pickup">
                  {t("Saņemšana", "Самовывоз", "Pickup")}
                </option>
                <option value="delivery">
                  {t(
                    "Piegāde (maksa noformēšanā)",
                    "Доставка (сбор при оформлении)",
                    "Delivery (fee at checkout)",
                  )}
                </option>
              </select>
            </label>
          </div>
          <div className="summary-total">
            <span>
              {t("Aptuvenā cena", "Примерная цена", "Estimated price")}
            </span>
            <b>{money(price)}</b>
          </div>
          <button className="btn full">
            {t(
              "Pievienot demo grozam",
              "Добавить в демо-корзину",
              "Add to demo bag",
            )}
            <ArrowUpRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
function Subscriptions() {
  const { s, set, toast } = useStore();
  const t = useT();
  const [freq, setFreq] = useState("monthly");
  const [months, setMonths] = useState(3);
  const [method, setMethod] = useState("pickup");
  const [pref, setPref] = useState("seasonal");
  const price =
    (freq === "weekly" ? 4 : freq === "biweekly" ? 2 : 1) * 28 +
    (method === "delivery"
      ? freq === "weekly"
        ? 20
        : freq === "biweekly"
          ? 10
          : 5
      : 0);
  const plans = [
    {
      id: "weekly",
      icon: <Flower2 />,
      title: t("Katru nedēļu", "Каждую неделю", "Every week"),
      sub: t(
        "Skaistums ikdienā",
        "Красота каждый день",
        "For everyday romantics",
      ),
      price: 112,
    },
    {
      id: "biweekly",
      icon: <Leaf />,
      title: t("Ik pēc divām nedēļām", "Каждые две недели", "Every two weeks"),
      sub: t(
        "Mazs prieks regulāri",
        "Маленькая радость регулярно",
        "A little regular happiness",
      ),
      price: 56,
    },
    {
      id: "monthly",
      icon: <CalendarDays />,
      title: t("Katru mēnesi", "Каждый месяц", "Every month"),
      sub: t(
        "Jauns mēnesis, jauni ziedi",
        "Новый месяц — новые цветы",
        "A fresh start, in flowers",
      ),
      price: 28,
    },
  ];
  return (
    <div className="page">
      <Title
        kicker={t(
          "SKAISTUMS AR TURPINĀJUMU",
          "КРАСОТА С ПРОДОЛЖЕНИЕМ",
          "SOMETHING LOVELY TO LOOK FORWARD TO",
        )}
        title={t(
          "Lai zied biežāk.",
          "Пусть цветёт чаще.",
          "Make flowers a little habit.",
        )}
        description={t(
          "Sezonas pušķi mājām, dāvanai vai darbavietai. Abonementu demonstrācija bez maksājumiem.",
          "Сезонные букеты для дома, подарка или работы. Демо-подписка без платежей.",
          "Seasonal bouquets for your home, a thoughtful gift or your workspace. Demo plans without payments.",
        )}
      />
      <Demo />
      <div className="subscription-grid">
        {plans.map((p) => (
          <button
            className={`plan-card ${freq === p.id ? "selected" : ""}`}
            key={p.id}
            onClick={() => setFreq(p.id)}
          >
            {p.icon}
            <span className="eyebrow">{p.sub}</span>
            <h2>{p.title}</h2>
            <strong>
              {money(p.price)}
              <small> / {t("mēnesī", "месяц", "month")}</small>
            </strong>
            <p>
              {t(
                "Florista sezonas izlase · €28 par pušķi",
                "Сезонный выбор флориста · €28 за букет",
                "Florist’s seasonal selection · €28 per bouquet",
              )}
            </p>
            <span className="text-link">
              {freq === p.id ? <Check size={17} /> : <PlusIcon />}
              {freq === p.id
                ? t("Izvēlēts", "Выбрано", "Selected")
                : t("Izvēlēties", "Выбрать", "Choose plan")}
            </span>
          </button>
        ))}
      </div>
      <div className="checkout-layout">
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            set((o) => ({
              ...o,
              subscriptions: [
                ...o.subscriptions,
                {
                  id: uid(),
                  frequency: freq,
                  months,
                  price,
                  method,
                  preference: pref,
                },
              ],
            }));
            toast(
              t(
                "Demo abonements pievienots profilam",
                "Демо-подписка добавлена в кабинет",
                "Your demo subscription is in your dashboard",
              ),
            );
          }}
        >
          <h2>
            {t("Tieši tev piemērots", "Именно для вас", "Make it your own")}
          </h2>
          <div className="form-grid">
            <label>
              {t("Ilgums", "Срок", "Duration")}
              <select
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
              >
                <option value={3}>
                  {t("3 mēneši", "3 месяца", "3 months")}
                </option>
                <option value={6}>
                  {t("6 mēneši", "6 месяцев", "6 months")}
                </option>
              </select>
            </label>
            <label>
              {t("Ziedu vēlmes", "Предпочтения", "Bouquet preference")}
              <select value={pref} onChange={(e) => setPref(e.target.value)}>
                <option value="seasonal">
                  {t(
                    "Sezonas pārsteigums",
                    "Сезонный сюрприз",
                    "Seasonal surprise",
                  )}
                </option>
                <option value="pastel">
                  {t(
                    "Maigi pasteļtoņi",
                    "Нежные пастельные тона",
                    "Soft pastels",
                  )}
                </option>
                <option value="bright">
                  {t(
                    "Koši un krāsaini",
                    "Яркие и красочные",
                    "Bright and colourful",
                  )}
                </option>
              </select>
            </label>
          </div>
          <label>
            {t("Saņemšana", "Получение", "Fulfilment")}
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="pickup">
                {t(
                  "Saņemšana · bez maksas",
                  "Самовывоз · бесплатно",
                  "Pickup · complimentary",
                )}
              </option>
              <option value="delivery">
                {t(
                  "Piegāde · €5 par reizi",
                  "Доставка · €5 за раз",
                  "Delivery · €5 each",
                )}
              </option>
            </select>
          </label>
          <button className="btn">
            {t(
              "Izveidot demo abonementu",
              "Создать демо-подписку",
              "Create demo subscription",
            )}
            <ArrowUpRight size={16} />
          </button>
        </form>
        <aside className="panel">
          <span className="eyebrow">
            {t(
              "TAVA ZIEDU RUTĪNA",
              "ВАША ЦВЕТОЧНАЯ ПРИВЫЧКА",
              "YOUR FLOWER HABIT",
            )}
          </span>
          <h2>
            {money(price)} <small>/ {t("mēnesī", "месяц", "month")}</small>
          </h2>
          <p>
            {months} {t("mēneši", "месяцев", "months")} ·{" "}
            {money(price * months)}
          </p>
          <p>
            {t(
              "Aprēķins izmanto 4 nedēļas mēnesī. Īstā cena un grafiks tiks precizēti pirms pakalpojuma sākuma.",
              "Расчёт: 4 недели в месяце. Реальная цена и график будут уточнены до запуска.",
              "Estimate assumes four weeks per month. Real prices and schedules would be confirmed before launch.",
            )}
          </p>
          <Link className="text-link" to="/account?tab=subscriptions">
            {t(
              "Mani demo abonementi",
              "Мои демо-подписки",
              "My demo subscriptions",
            )}
            <ArrowUpRight size={16} />
          </Link>
        </aside>
      </div>
      <div className="corporate-banner">
        <div>
          <h2>
            {t(
              "Svaigs skats arī darbavietā.",
              "Свежий взгляд и на работе.",
              "Bring a little life to work.",
            )}
          </h2>
          <p>
            {t(
              "Ziedu abonementu koncepts birojiem, viesnīcām un uzņēmumiem.",
              "Концепт цветочной подписки для офисов, гостиниц и бизнеса.",
              "A flower subscription concept for offices, hotels and businesses.",
            )}
          </p>
        </div>
        <Link className="btn outline" to="/gifts?corporate=1">
          {t(
            "Uzņēmumu pieprasījums",
            "Запрос для бизнеса",
            "Corporate inquiry",
          )}
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <p className="muted">
        {s.subscriptions.length}{" "}
        {t(
          "demo abonementi tavā profilā",
          "демо-подписок в кабинете",
          "demo subscriptions in your dashboard",
        )}
      </p>
    </div>
  );
}
function PlusIcon() {
  return <span>+</span>;
}
function Gifts() {
  const { s, set, toast } = useStore();
  const t = useT();
  const [params] = useSearchParams();
  const [amount, setAmount] = useState(50);
  const [msg, setMsg] = useState("");
  const [recipient, setRecipient] = useState("");
  const [date, setDate] = useState(future(1));
  const [code, setCode] = useState("");
  const [created, setCreated] = useState("");
  const [corporate, setCorporate] = useState(params.has("corporate"));
  const [qr, setQr] = useState(params.has("qr"));
  return (
    <div className="page">
      <Title
        kicker={t(
          "NO TAVAS SIRDS VIŅU ROKĀS",
          "ОТ ВАШЕГО СЕРДЦА В ИХ РУКИ",
          "FROM YOUR HEART TO THEIR HANDS",
        )}
        title={t("Dāvā sajūtu.", "Дарите чувства.", "Give a little feeling.")}
        description={t(
          "Pušķi, dāvanu komplekti un personiski pārsteigumi.",
          "Букеты, подарочные наборы и личные сюрпризы.",
          "Bouquets, considered gift bundles and wonderfully personal surprises.",
        )}
      />
      <Demo />
      <div className="product-grid">
        {s.catalog
          .filter((p) => p.category === 9 || p.id === "fp-10")
          .map((p) => (
            <ProductCard p={p} key={p.id} />
          ))}
      </div>
      <section className="section gift-layout">
        <div>
          <span className="eyebrow">
            {t("IZVĒLES BRĪVĪBA", "СВОБОДА ВЫБОРА", "THE GIFT OF CHOICE")}
          </span>
          <h2>
            {t(
              "Skaistums viņu izvēlē.",
              "Красота на их выбор.",
              "Let them choose their lovely.",
            )}
          </h2>
          <div className="gift-certificate">
            <Flower2 size={32} strokeWidth={1} />
            <span>FLOWER PARADISE</span>
            <small>
              {t(
                "DIGITĀLĀ DĀVANU KARTE · DEMO",
                "ЦИФРОВАЯ ПОДАРОЧНАЯ КАРТА · ДЕМО",
                "DIGITAL GIFT CERTIFICATE · DEMO",
              )}
            </small>
            <strong>{money(amount)}</strong>
            <p>
              {msg ||
                t(
                  "Tev, ar mīlestību.",
                  "Тебе, с любовью.",
                  "For you, with love.",
                )}
            </p>
            <span className="gift-code">{created || "FLOWER · DEMO"}</span>
          </div>
          <p className="muted">
            {t(
              "Demo kartei nav naudas vērtības. Der tikai šajā pārlūkā.",
              "Демо-карта не имеет денежной стоимости. Работает только в этом браузере.",
              "This demo certificate has no monetary value. It works only in this browser.",
            )}
          </p>
        </div>
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            const c = `FP-${pickupCode()}`;
            set((o) => ({
              ...o,
              gifts: [
                ...o.gifts,
                {
                  id: uid(),
                  amount,
                  message: msg,
                  code: c,
                  redeemed: false,
                  recipient,
                  date,
                },
              ],
            }));
            setCreated(c);
            toast(
              t(
                "Demo dāvanu karte izveidota",
                "Демо-карта создана",
                "Your demo gift certificate is ready",
              ),
            );
          }}
        >
          <h2>
            {t("Personisks pārsteigums", "Личный сюрприз", "Make their day")}
          </h2>
          <label>
            {t("Vērtība", "Номинал", "Gift value")}
            <select
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            >
              {[25, 50, 75, 100].map((x) => (
                <option key={x} value={x}>
                  {money(x)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t(
              "Izdomāts saņēmēja vārds",
              "Вымышленное имя получателя",
              "Fictional recipient name",
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
              "Sūtīšanas datums (demo)",
              "Дата отправки (демо)",
              "Scheduled date (demo)",
            )}
            <input
              required
              type="date"
              min={future(0)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            {t("Tava ziņa", "Ваше послание", "Your message")}
            <textarea
              value={msg}
              maxLength={300}
              onChange={(e) => setMsg(e.target.value)}
            />
          </label>
          <div className="notification-preview">
            <Gift size={18} />
            <p>
              {recipient || "Alex"},{" "}
              {t(
                "tev ir ziedu pārsteigums!",
                "для вас цветочный сюрприз!",
                "there’s a floral surprise for you!",
              )}{" "}
              {created || "FP-XXXXXX"} · {date}
            </p>
          </div>
          <button className="btn">
            {t(
              "Izveidot demo dāvanu karti",
              "Создать демо-карту",
              "Create demo gift certificate",
            )}
            <ArrowUpRight size={16} />
          </button>
          <p className="muted">
            {t(
              "Nekādi paziņojumi netiek sūtīti.",
              "Уведомления не отправляются.",
              "No notifications are sent.",
            )}
          </p>
        </form>
      </section>
      <div className="panel">
        <h3>
          {t(
            "Izmēģini dāvanas saņemšanu",
            "Попробуйте активацию подарка",
            "Try receiving a gift",
          )}
        </h3>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            const found = s.gifts.find(
              (g) => g.code === code.trim().toUpperCase() && !g.redeemed,
            );
            if (!found) {
              toast(
                t(
                  "Kods nav derīgs vai jau izmantots",
                  "Код неверный или уже использован",
                  "Code is invalid or already redeemed",
                ),
              );
              return;
            }
            set((o) => ({
              ...o,
              gifts: o.gifts.map((g) =>
                g.id === found.id ? { ...g, redeemed: true } : g,
              ),
            }));
            toast(
              t(
                "Demo dāvana saņemta! Nav naudas vērtības.",
                "Демо-подарок получен! Без денежной стоимости.",
                "Demo gift redeemed! No monetary value.",
              ),
            );
          }}
        >
          <input
            required
            aria-label={t(
              "Dāvanu kartes kods",
              "Код подарочной карты",
              "Gift certificate code",
            )}
            placeholder="FP-000000"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="btn outline">
            {t(
              "Saņemt demo dāvanu",
              "Активировать демо-подарок",
              "Redeem demo gift",
            )}
          </button>
        </form>
      </div>
      <div className="service-grid section">
        <Link className="service-card" to="/reserve">
          <Clock3 />
          <h3>
            {t(
              "Pārsteigums nodalījumā",
              "Сюрприз в ячейке",
              "A surprise, waiting to be found",
            )}
          </h3>
          <p>
            {t(
              "Rezervē ziedus un pievieno sirsnīgu ziņu.",
              "Зарезервируйте цветы и добавьте тёплое послание.",
              "Reserve flowers and add a heartfelt message.",
            )}
          </p>
          <ArrowUpRight />
        </Link>
        <button className="service-card" onClick={() => setCorporate(true)}>
          <Leaf />
          <h3>
            {t("Ziedi uzņēmumiem", "Цветы для бизнеса", "Flowers for business")}
          </h3>
          <p>
            {t(
              "Sadarbības pieprasījuma demonstrācija.",
              "Демонстрация запроса на сотрудничество.",
              "A corporate inquiry demonstration.",
            )}
          </p>
          <ArrowUpRight />
        </button>
        <button className="service-card" onClick={() => setQr(true)}>
          <Gift />
          <h3>
            {t("Saņemšana ar QR", "Получение по QR", "Discover QR pickup")}
          </h3>
          <p>
            {t(
              "Drošas saņemšanas koncepts.",
              "Концепт безопасного получения.",
              "A concept for effortless collection.",
            )}
          </p>
          <ArrowUpRight />
        </button>
      </div>
      {corporate && (
        <Modal
          title={t(
            "Sadarbosimies",
            "Давайте сотрудничать",
            "Let’s grow together",
          )}
          close={() => setCorporate(false)}
        >
          <form
            className="form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              toast(
                t(
                  "Demo pieprasījums sagatavots. Nekas nav nosūtīts.",
                  "Демо-запрос подготовлен. Ничего не отправлено.",
                  "Demo inquiry prepared. Nothing was sent.",
                ),
              );
              setCorporate(false);
            }}
          >
            <Demo />
            <label>
              {t(
                "Izdomāts uzņēmums",
                "Вымышленная компания",
                "Fictional company",
              )}
              <input required placeholder="Demo SIA" />
            </label>
            <label>
              {t("Vēlmes", "Пожелания", "What do you have in mind?")}
              <textarea required maxLength={500} />
            </label>
            <button className="btn">
              {t(
                "Sagatavot demo pieprasījumu",
                "Подготовить демо-запрос",
                "Prepare demo inquiry",
              )}
            </button>
          </form>
        </Modal>
      )}
      {qr && (
        <Modal
          title={t(
            "QR saņemšanas koncepts",
            "Концепт получения по QR",
            "QR pickup concept",
          )}
          close={() => setQr(false)}
        >
          <div className="qr-concept">
            <Gift size={80} />
            <h3>DEMO · FP-000000</h3>
            <p>
              {t(
                "Īstajā pakalpojumā QR kods droši atvērtu saņemšanas procesu. Šeit izmanto sešu ciparu demo kodu automāta lapā.",
                "В реальном сервисе QR-код безопасно открывал бы процесс получения. Здесь используйте шестизначный демо-код на странице автомата.",
                "In a real service, a QR code would securely open the pickup flow. Here, use the six-digit demo code on the vending page.",
              )}
            </p>
            <Link className="btn" to="/vending">
              {t("Izmēģināt saņemšanu", "Попробовать получение", "Try pickup")}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}
