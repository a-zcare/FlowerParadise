import {
  ArrowUpRight,
  Check,
  Flower2,
  LockKeyhole,
  Package,
  UnlockKeyhole,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { img, money, pick } from "./data";
import { addDays, availability, dateKey, sellable } from "./domain";
import { uid, useStore } from "./store";
import { Demo, Title, useT } from "./ui";
export default function Vending() {
  const { s, reserveSlot, redeemPickup, toast } = useStore();
  const t = useT();
  const [params] = useSearchParams();
  const [selected, select] = useState<string | null>(params.get("slot"));
  const [receipt, setReceipt] = useState("");
  const [code, setCode] = useState("");
  const [opened, setOpened] = useState<string | null>(null);
  const [error, setError] = useState("");
  const c = s.compartments.find((c) => c.id === selected);
  const p = s.catalog.find((p) => p.id === c?.productId);
  const canReserve =
    !!c && availability(s, c.productId).slots.some((x) => x.id === c.id);
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
          "Četri demo nodalījumi, kopīgi krājumi un vienreizēji saņemšanas kodi. Pieejamība ir simulēta, nevis īsta.",
          "Четыре демо-ячейки, общие остатки и одноразовые коды. Доступность имитируется и не является реальной.",
          "Four demo compartments, shared inventory and one-time pickup codes. Availability is simulated rather than live.",
        )}
      />
      <Demo />
      <div className="vending-layout">
        <div className="machine">
          <div className="machine-brand">
            <Flower2 /> FLOWER PARADISE <span>24/7</span>
          </div>
          <div className="machine-grid">
            {s.compartments.map((slot, i) => {
              const product = s.catalog.find((p) => p.id === slot.productId)!;
              const available = availability(s, product.id).slots.some(
                (x) => x.id === slot.id,
              );
              const label =
                slot.status === "reserved"
                  ? t("Rezervēts", "Забронирован", "Reserved")
                  : slot.status === "collected"
                    ? t("Saņemts", "Получен", "Collected")
                    : slot.status === "maintenance"
                      ? t("Apkope", "Обслуживание", "Maintenance")
                      : available
                        ? t("Pieejams", "Доступен", "Available")
                        : t("Nav pārdošanā", "Не продаётся", "Not for sale");
              return (
                <button
                  key={slot.id}
                  className={`compartment ${selected === slot.id ? "selected" : ""} ${opened === slot.id ? "unlocked" : ""} ${slot.status === "collected" ? "collected" : ""}`}
                  aria-label={`${String(i + 1).padStart(2, "0")} ${label} ${pick(product.name, s.lang)}`}
                  disabled={!available}
                  onClick={() => {
                    select(slot.id);
                    setReceipt("");
                    setError("");
                  }}
                >
                  <div className="slot-top">
                    <span>0{i + 1}</span>
                    <span
                      className={`status-dot ${available ? "" : "occupied"}`}
                    >
                      {label}
                    </span>
                  </div>
                  <img
                    src={img(product.photo)}
                    alt={pick(product.name, s.lang)}
                  />
                  <div className="slot-bottom">
                    <div>
                      <strong>{pick(product.name, s.lang)}</strong>
                      <small>{money(product.price, s.lang)}</small>
                    </div>
                    {opened === slot.id ? (
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
            {p && canReserve ? (
              <>
                <div className="selection-preview">
                  <img src={img(p.photo, 200)} alt="" />
                  <div>
                    <h3>{pick(p.name, s.lang)}</h3>
                    <p>
                      {t("Nodalījums", "Ячейка", "Compartment")} 0
                      {Number(c!.id.split("-")[1]) + 1}
                    </p>
                    <strong>{money(p.price, s.lang)}</strong>
                  </div>
                </div>
                <button
                  className="btn full"
                  onClick={() => {
                    const pin = reserveSlot(c!.id);
                    if (pin) {
                      setReceipt(pin);
                      select(null);
                    } else
                      setError(
                        t(
                          "Šis nodalījums vairs nav pieejams.",
                          "Эта ячейка больше недоступна.",
                          "This compartment is no longer available.",
                        ),
                      );
                  }}
                >
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
                  "Pieskaries pieejamam nodalījumam. Rezervācija derēs 30 minūtes.",
                  "Нажмите на доступную ячейку. Бронь будет действовать 30 минут.",
                  "Tap an available compartment. Your reservation will last 30 minutes.",
                )}
              </p>
            )}
            {receipt && (
              <div className="code-receipt">
                <Check size={22} />
                <p>
                  {t(
                    "Tavs vienreizējais demo kods · 30 minūtes",
                    "Ваш одноразовый демо-код · 30 минут",
                    "Your one-time demo code · 30 minutes",
                  )}
                </p>
                <strong>{receipt}</strong>
                <button className="text-link" onClick={() => setCode(receipt)}>
                  {t(
                    "Izmantot kodu zemāk",
                    "Использовать код ниже",
                    "Use this code below",
                  )}
                </button>
              </div>
            )}
          </div>
          <form
            className="panel"
            onSubmit={(e) => {
              e.preventDefault();
              const reservation = s.reservations.find(
                (r) => r.code === code.trim(),
              );
              if (!redeemPickup(code)) {
                setError(
                  t(
                    "Kods nav derīgs, ir beidzies vai jau izmantots.",
                    "Код неверный, просрочен или уже использован.",
                    "Code is invalid, expired or already used.",
                  ),
                );
                return;
              }
              setOpened(reservation!.product);
              setCode("");
              setReceipt("");
              setError("");
              toast(
                t(
                  "Nodalījums atvērts! Demo saņemšana pabeigta.",
                  "Ячейка открыта! Демо-получение завершено.",
                  "Your compartment is open! Demo pickup complete.",
                ),
              );
            }}
          >
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
              "Nav īsta maksājuma vai aparatūras savienojuma. Nodalījums 04 sākotnēji rāda parauga rezervāciju. Iztukšotos nodalījumus var papildināt admin demonstrācijā.",
              "Нет реальной оплаты и подключения оборудования. Ячейка 04 изначально показывает пример брони. Пустые ячейки можно пополнить в админ-демонстрации.",
              "No real payment or hardware connection. Compartment 04 initially shows a sample reservation. Empty compartments can be restocked in the admin demo.",
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
          <Link className="text-link" to="/available">
            {t(
              "Pieejamie pušķi tagad",
              "Доступные букеты сейчас",
              "See what’s ready now",
            )}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <section className="section slim">
        <h2>
          {t(
            "Tā varētu darboties īstais pakalpojums",
            "Как мог бы работать реальный сервис",
            "How the real service could work",
          )}
        </h2>
        <div className="service-grid">
          {[
            t(
              "Tiešsaistē izvēlies pieejamu pušķi.",
              "Выберите доступный букет онлайн.",
              "Choose an available bouquet online.",
            ),
            t(
              "Pēc pārbaudīta maksājuma saņem vienreizēju kodu.",
              "После проверенного платежа получите одноразовый код.",
              "Receive a one-time code after a verified payment.",
            ),
            t(
              "Saņem pušķi ērtā laikā. Īstais pakalpojums vēl tiek plānots.",
              "Заберите букет в удобное время. Реальный сервис ещё планируется.",
              "Collect at a convenient time. The real service is still being planned.",
            ),
          ].map((text, i) => (
            <div className="service-card" key={text}>
              <span className="eyebrow">0{i + 1}</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
export function AdminVending() {
  const { s, set, toast } = useStore();
  const t = useT();
  const [choices, setChoices] = useState<Record<string, string>>({});
  function restock(slotId: string) {
    const slot = s.compartments.find((c) => c.id === slotId)!;
    const productId = choices[slotId] ?? slot.productId;
    const source = s.batches
      .filter(
        (b) =>
          b.productId === productId &&
          b.location === "studio" &&
          sellable(b, s.freshnessRules),
      )
      .sort((a, b) => a.sellBy.localeCompare(b.sellBy))[0];
    if (!source || slot.status === "reserved") {
      toast(
        t(
          "Nav piemērota demo krājuma vai nodalījums rezervēts.",
          "Нет подходящего демо-запаса или ячейка забронирована.",
          "No suitable demo stock or compartment is reserved.",
        ),
      );
      return;
    }
    const outgoing = s.batches.find((b) => b.id === slot.batchId)!;
    set((o) => ({
      ...o,
      batches: [
        ...o.batches.map((b) =>
          b.id === source.id
            ? { ...b, quantity: b.quantity - 1 }
            : b.id === slot.batchId
              ? { ...source, id: slot.batchId, quantity: 1, location: slot.id }
              : b,
        ),
        ...(outgoing.quantity > 0
          ? [{ ...outgoing, id: `returned-${uid()}`, location: "studio" }]
          : []),
      ],
      compartments: o.compartments.map((c) =>
        c.id === slotId
          ? { ...c, productId, status: "available", reservationId: undefined }
          : c,
      ),
      maintenance: [
        ...o.maintenance,
        {
          id: uid(),
          type: "restock",
          date: dateKey(),
          due: addDays(1),
          compartment: slotId,
          notes: pick(o.catalog.find((p) => p.id === productId)!.name, o.lang),
          resolved: true,
        },
      ],
    }));
    toast(
      t(
        "Demo nodalījums papildināts; kustība reģistrēta apkopes žurnālā.",
        "Демо-ячейка пополнена; движение записано в журнал обслуживания.",
        "Demo compartment restocked; movement recorded in maintenance.",
      ),
    );
  }
  return (
    <>
      <div className="rotation-note">
        <Package size={22} />
        <p>
          {t(
            "Četri nodalījumi, katrā viens demo pušķis. Papildināšana pārvieto vienību no studijas krājuma un saglabā partijas vecumu. Nav reāla automāta vadības.",
            "Четыре ячейки, по одному демо-букету в каждой. Пополнение перемещает единицу из студии и сохраняет возраст партии. Реальный автомат не управляется.",
            "Four compartments, one demo bouquet each. Restocking moves a studio unit and keeps its batch age. This does not control real hardware.",
          )}
        </p>
      </div>
      <div className="admin-vending-grid">
        {s.compartments.map((c, i) => {
          const p = s.catalog.find((p) => p.id === c.productId)!;
          return (
            <div className="panel" key={c.id}>
              <div className="row-between">
                <h2>0{i + 1}</h2>
                <span className="badge-static">
                  {c.status === "reserved"
                    ? t("Rezervēts", "Забронирован", "Reserved")
                    : c.status === "maintenance"
                      ? t("Apkope", "Обслуживание", "Maintenance")
                      : c.status === "collected"
                        ? t("Tukšs", "Пусто", "Empty")
                        : t("Piepildīts", "Заполнено", "Stocked")}
                </span>
              </div>
              <img
                className="admin-slot-photo"
                src={img(p.photo)}
                alt={pick(p.name, s.lang)}
              />
              <h3>{pick(p.name, s.lang)}</h3>
              <label>
                {t("Papildināt ar", "Пополнить букетом", "Restock with")}
                <select
                  value={choices[c.id] ?? c.productId}
                  onChange={(e) =>
                    setChoices({ ...choices, [c.id]: e.target.value })
                  }
                >
                  {s.catalog
                    .filter((p) => p.category < 7)
                    .map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={availability(s, p.id).studio < 1}
                      >
                        {pick(p.name, s.lang)} ({availability(s, p.id).studio})
                      </option>
                    ))}
                </select>
              </label>
              <button
                className="btn full"
                disabled={c.status === "reserved"}
                onClick={() => restock(c.id)}
              >
                <Package size={16} />
                {t(
                  "Papildināt demo nodalījumu",
                  "Пополнить демо-ячейку",
                  "Restock demo compartment",
                )}
              </button>
              {c.status === "reserved" ? (
                <button
                  className="text-link"
                  onClick={() =>
                    set((o) => ({
                      ...o,
                      reservations: o.reservations.map((r) =>
                        r.id === c.reservationId
                          ? { ...r, status: "cancelled" }
                          : r,
                      ),
                    }))
                  }
                >
                  {t(
                    "Atcelt demo rezervāciju",
                    "Отменить демо-бронь",
                    "Cancel demo reservation",
                  )}
                </button>
              ) : (
                <button
                  className="text-link"
                  onClick={() =>
                    set((o) => ({
                      ...o,
                      compartments: o.compartments.map((x) =>
                        x.id === c.id
                          ? {
                              ...x,
                              status:
                                x.status === "maintenance"
                                  ? o.batches.find((b) => b.id === x.batchId)!
                                      .quantity
                                    ? "available"
                                    : "collected"
                                  : "maintenance",
                            }
                          : x,
                      ),
                    }))
                  }
                >
                  <Wrench size={14} />
                  {c.status === "maintenance"
                    ? t(
                        "Pabeigt apkopi",
                        "Завершить обслуживание",
                        "Finish maintenance",
                      )
                    : t(
                        "Apturēt apkopei",
                        "Остановить на обслуживание",
                        "Take offline for maintenance",
                      )}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <Link className="text-link" to="/vending">
        {t("Klienta skatījums", "Вид клиента", "Customer view")}
        <ArrowUpRight size={16} />
      </Link>
    </>
  );
}
