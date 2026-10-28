import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Check,
  Clock3,
  Leaf,
  Package,
  Percent,
  Plus,
  Thermometer,
  Trash2,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { money, pick, type Text } from "./data";
import {
  addDays,
  calculateProfit,
  dateKey,
  freshness,
  round,
  statusLabels,
} from "./domain";
import type {
  Costs,
  InventoryBatch,
  MaintenanceRecord,
  MaintenanceType,
} from "./models";
import { uid, useStore } from "./store";
import { Empty, Modal, useT } from "./ui";
export default function Operations({ tab }: { tab: string }) {
  return tab === "profitability" ? (
    <Profitability />
  ) : tab === "maintenance" ? (
    <Maintenance />
  ) : tab === "discounts" ? (
    <Discounts />
  ) : (
    <Inventory mode={tab} />
  );
}
const wasteReasons: Record<string, Text> = {
  wilted: ["Novītis", "Увядание", "Wilted"],
  damaged: ["Bojāts", "Повреждение", "Damaged"],
  expired: ["Termiņš beidzies", "Истёк срок", "Past sell-by"],
  rotation: ["Krājumu rotācija", "Ротация запаса", "Inventory rotation"],
  other: ["Cits", "Другое", "Other"],
};
function Inventory({ mode }: { mode: string }) {
  const { s, set, toast } = useStore();
  const t = useT();
  const [filter, setFilter] = useState("all");
  const [edit, setEdit] = useState<InventoryBatch | null>(null);
  const [wasteBatch, setWasteBatch] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [ruleEdit, setRuleEdit] = useState(false);
  const batches = s.batches
    .filter(
      (b) =>
        (filter === "all" || freshness(b, s.freshnessRules) === filter) &&
        (mode !== "freshness" ||
          s.catalog.find((p) => p.id === b.productId)!.category < 7),
    )
    .sort((a, b) => a.sellBy.localeCompare(b.sellBy));
  const wasteTotal = round(
    s.waste.reduce((n, w) => n + w.quantity * w.unitCost, 0),
  );
  const remove = s.batches.filter(
    (b) =>
      b.quantity > 0 &&
      ["remove", "discarded"].includes(freshness(b, s.freshnessRules)),
  ).length;
  const expiring = s.batches.filter(
    (b) =>
      b.quantity > 0 &&
      ["monitor", "discount"].includes(freshness(b, s.freshnessRules)),
  ).length;
  const fresh = s.batches.filter(
    (b) => b.quantity > 0 && freshness(b, s.freshnessRules) === "fresh",
  ).length;
  const target = s.batches.find((b) => b.id === wasteBatch);
  return (
    <>
      <div className="stats-grid operations-stats">
        {[
          {
            icon: <Leaf />,
            n: fresh,
            label: t(
              "Svaigas demo partijas",
              "Свежие демо-партии",
              "Fresh demo batches",
            ),
          },
          {
            icon: <Clock3 />,
            n: expiring,
            label: t("Pārskatīt drīzumā", "Скоро проверить", "Review soon"),
          },
          {
            icon: <AlertTriangle />,
            n: remove,
            label: t(
              "Nepiedāvāt pārdošanā",
              "Не продавать",
              "Do not offer for sale",
            ),
          },
          {
            icon: <BarChart3 />,
            n: money(wasteTotal, s.lang),
            label: t(
              "Reģistrēto zudumu izmaksas",
              "Стоимость записанных потерь",
              "Recorded waste cost",
            ),
          },
        ].map((x) => (
          <div className="panel stat" key={x.label}>
            {x.icon}
            <span>{x.label}</span>
            <strong>{x.n}</strong>
          </div>
        ))}
      </div>
      {mode === "waste" ? (
        <>
          <div className="section-heading">
            <div>
              <h2>
                {t(
                  "Katra zieda vērtība.",
                  "Ценность каждого цветка.",
                  "Every stem has value.",
                )}
              </h2>
              <p>
                {t(
                  "Zudumi tiek aprēķināti kā vienību skaits × partijas iepirkuma cena. Norakstot daudzums samazinās; nederīgi ziedi netiek piedāvāti.",
                  "Потери: количество × закупочная цена партии. Списание уменьшает остаток; неподходящие цветы не продаются.",
                  "Waste is quantity × batch purchase cost. Recording waste reduces stock; unsuitable flowers are never offered for sale.",
                )}
              </p>
            </div>
            <button
              className="btn"
              disabled={!s.batches.some((b) => b.quantity > 0)}
              onClick={() =>
                setWasteBatch(s.batches.find((b) => b.quantity > 0)?.id ?? null)
              }
            >
              <Plus size={16} />
              {t("Reģistrēt zudumu", "Записать потери", "Record waste")}
            </button>
          </div>
          {s.waste.length ? (
            <div className="record-list">
              {s.waste.map((w) => (
                <div className="panel record" key={w.id}>
                  <Trash2 size={20} />
                  <div>
                    <h3>
                      {pick(
                        s.catalog.find((p) => p.id === w.productId)!.name,
                        s.lang,
                      )}
                    </h3>
                    <p>
                      {w.date} ·{" "}
                      {pick(
                        wasteReasons[w.reason] ?? wasteReasons.other,
                        s.lang,
                      )}{" "}
                      · {w.quantity} × {money(w.unitCost, s.lang)}
                    </p>
                  </div>
                  <strong>{money(w.quantity * w.unitCost, s.lang)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="panel empty">
              <Leaf size={35} />
              <h3>
                {t(
                  "Vēl nav reģistrētu zudumu",
                  "Записанных потерь пока нет",
                  "No waste recorded yet",
                )}
              </h3>
              <p>
                {t(
                  "Ieraksti ir lokālas demo darbības, nevis īsti biznesa dati.",
                  "Записи — локальные демо-действия, а не реальные данные бизнеса.",
                  "Records are local demo actions rather than real business data.",
                )}
              </p>
            </div>
          )}
          <Link className="text-link" to="/admin?view=profitability">
            {t(
              "Pievienot zudumus finanšu modelim",
              "Учесть потери в финансовой модели",
              "Include waste in the financial model",
            )}
            <ArrowUpRight size={16} />
          </Link>
        </>
      ) : (
        <>
          <div className="operations-toolbar">
            <label>
              {t("Partijas statuss", "Статус партии", "Batch status")}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">
                  {t("Visi statusi", "Все статусы", "All statuses")}
                </option>
                {Object.entries(statusLabels).map(([k, label]) => (
                  <option key={k} value={k}>
                    {pick(label, s.lang)}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn outline" onClick={() => setRuleEdit(true)}>
              {t("Svaiguma noteikumi", "Правила свежести", "Freshness rules")}
            </button>
            <button
              className="btn"
              onClick={() =>
                setEdit({
                  id: uid(),
                  productId: s.catalog[0].id,
                  quantity: 1,
                  receivedDate: dateKey(),
                  assemblyDate: dateKey(),
                  sellBy: addDays(5),
                  unitCost: 14,
                  status: "fresh",
                  location: "studio",
                })
              }
            >
              <Plus size={16} />
              {t("Jauna partija", "Новая партия", "New batch")}
            </button>
          </div>
          <div className="rotation-note">
            <Leaf size={20} />
            <p>
              {t(
                "Rotācija: vispirms pārskati partijas ar tuvāko pārdošanas datumu. “Izņemt no pārdošanas” un “Norakstīts” automātiski pazūd no pirkšanas un automāta pieejamības. Paraugu datumi nav svaiguma garantija.",
                "Ротация: сначала проверяйте партии с ближайшей датой продажи. «Снять с продажи» и «Списан» автоматически исключаются из покупок и доступности автомата. Примерные даты не гарантируют свежесть.",
                "Rotation: review batches with the earliest sell-by first. “Remove from sale” and “Discarded” are automatically excluded from purchases and machine availability. Sample dates are not a freshness guarantee.",
              )}
            </p>
          </div>
          <div className="batch-grid">
            {batches.map((b) => {
              const p = s.catalog.find((p) => p.id === b.productId)!;
              const status = freshness(b, s.freshnessRules);
              return (
                <article className="panel batch-card" key={b.id}>
                  <div className="row-between">
                    <span className="eyebrow">
                      {b.location === "studio"
                        ? t("STUDIJA", "СТУДИЯ", "STUDIO")
                        : b.location.replace(
                            "slot-",
                            t("NODALĪJUMS ", "ЯЧЕЙКА ", "COMPARTMENT "),
                          )}
                    </span>
                    <span className={`freshness-pill status-${status}`}>
                      {pick(statusLabels[status], s.lang)}
                    </span>
                  </div>
                  <h3>{pick(p.name, s.lang)}</h3>
                  <span className="muted batch-id">{b.id}</span>
                  <dl>
                    <div>
                      <dt>{t("Vienības", "Количество", "Units")}</dt>
                      <dd>{b.quantity}</dd>
                    </div>
                    <div>
                      <dt>{t("Saņemts", "Получено", "Received")}</dt>
                      <dd>{b.receivedDate}</dd>
                    </div>
                    <div>
                      <dt>{t("Sagatavots", "Собрано", "Assembled")}</dt>
                      <dd>{b.assemblyDate}</dd>
                    </div>
                    <div>
                      <dt>
                        {t(
                          "Ieteicams pārdot līdz",
                          "Рекомендуется продать до",
                          "Recommended sell-by",
                        )}
                      </dt>
                      <dd>{b.sellBy}</dd>
                    </div>
                    <div>
                      <dt>
                        {t(
                          "Iepirkuma cena",
                          "Закупочная цена",
                          "Purchase cost",
                        )}
                      </dt>
                      <dd>{money(b.unitCost, s.lang)}</dd>
                    </div>
                  </dl>
                  {status === "discount" && (
                    <p className="discount-advice">
                      {t(
                        "Ieteicamā demo atlaide: 15%, tikai pēc fiziskas kvalitātes pārbaudes.",
                        "Пример рекомендуемой скидки: 15%, только после физической проверки качества.",
                        "Suggested demo discount: 15%, only after a physical quality check.",
                      )}
                    </p>
                  )}
                  {["remove", "discarded"].includes(status) && (
                    <p className="error">
                      {t(
                        "Nepārdot. Pārbaudi un reģistrē norakstīšanu, ja nepieciešams.",
                        "Не продавать. Проверьте и при необходимости спишите.",
                        "Do not sell. Inspect and record waste where appropriate.",
                      )}
                    </p>
                  )}
                  <div className="choice-row">
                    <button
                      className="text-link"
                      onClick={() => setEdit({ ...b })}
                    >
                      {t("Rediģēt partiju", "Изменить партию", "Edit batch")}
                    </button>
                    <button
                      disabled={!b.quantity}
                      className="text-link"
                      onClick={() => setWasteBatch(b.id)}
                    >
                      {t("Norakstīt", "Списать", "Record waste")}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {!batches.length && (
            <Empty
              text={t(
                "Šim filtram nav partiju",
                "Для этого фильтра нет партий",
                "No batches match this filter",
              )}
            />
          )}
        </>
      )}
      {edit && (
        <Modal
          title={t(
            "Demo krājumu partija",
            "Демо-партия запаса",
            "Demo inventory batch",
          )}
          close={() => {
            setEdit(null);
            setError("");
          }}
        >
          <form
            className="form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              if (
                edit.receivedDate > edit.assemblyDate ||
                edit.assemblyDate > edit.sellBy
              ) {
                setError(
                  t(
                    "Pārbaudi datumu secību: saņemšana, sagatavošana, pārdošana.",
                    "Проверьте порядок дат: получение, сборка, продажа.",
                    "Check date order: receipt, assembly, sell-by.",
                  ),
                );
                return;
              }
              set((o) => ({
                ...o,
                batches: o.batches.some((b) => b.id === edit.id)
                  ? o.batches.map((b) => (b.id === edit.id ? edit : b))
                  : [...o.batches, edit],
              }));
              setEdit(null);
              setError("");
              toast(
                t(
                  "Partija saglabāta lokāli",
                  "Партия сохранена локально",
                  "Batch saved locally",
                ),
              );
            }}
          >
            <label>
              {t("Produkts", "Товар", "Product")}
              <select
                value={edit.productId}
                disabled={edit.location !== "studio"}
                onChange={(e) =>
                  setEdit({ ...edit, productId: e.target.value })
                }
              >
                {s.catalog.map((p) => (
                  <option key={p.id} value={p.id}>
                    {pick(p.name, s.lang)}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                {t("Daudzums", "Количество", "Quantity")}
                <input
                  required
                  type="number"
                  min={0}
                  max={edit.location === "studio" ? 1000 : 1}
                  value={edit.quantity}
                  onChange={(e) =>
                    setEdit({ ...edit, quantity: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                {t(
                  "Vienības iepirkuma cena (€)",
                  "Закупочная цена единицы (€)",
                  "Unit purchase cost (€)",
                )}
                <input
                  required
                  type="number"
                  min={0}
                  max={500}
                  step="0.01"
                  value={edit.unitCost}
                  onChange={(e) =>
                    setEdit({ ...edit, unitCost: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <div className="form-grid">
              <label>
                {t("Saņemšanas datums", "Дата получения", "Receipt date")}
                <input
                  required
                  type="date"
                  max={dateKey()}
                  value={edit.receivedDate}
                  onChange={(e) =>
                    setEdit({ ...edit, receivedDate: e.target.value })
                  }
                />
              </label>
              <label>
                {t("Sagatavošanas datums", "Дата сборки", "Assembly date")}
                <input
                  required
                  type="date"
                  max={dateKey()}
                  value={edit.assemblyDate}
                  onChange={(e) =>
                    setEdit({ ...edit, assemblyDate: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              {t(
                "Ieteicamā pārdošana līdz",
                "Рекомендуемая продажа до",
                "Recommended sell-by date",
              )}
              <input
                required
                type="date"
                min={edit.assemblyDate}
                value={edit.sellBy}
                onChange={(e) => setEdit({ ...edit, sellBy: e.target.value })}
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={
                  edit.status === "remove" || edit.status === "discarded"
                }
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    status: e.target.checked ? "remove" : "fresh",
                  })
                }
              />
              {t(
                "Izņemt no pārdošanas neatkarīgi no datuma",
                "Снять с продажи независимо от даты",
                "Remove from sale regardless of date",
              )}
            </label>
            <p className="error" role="alert">
              {error}
            </p>
            <button className="btn">
              <Check size={16} />
              {t("Saglabāt partiju", "Сохранить партию", "Save batch")}
            </button>
          </form>
        </Modal>
      )}
      {target && (
        <Modal
          title={t(
            "Reģistrēt demo zudumu",
            "Записать демо-потери",
            "Record demo waste",
          )}
          close={() => setWasteBatch(null)}
        >
          <form
            className="form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const n = Number(f.get("quantity"));
              if (n < 1 || n > target.quantity) return;
              set((o) => ({
                ...o,
                batches: o.batches.map((b) =>
                  b.id === target.id
                    ? {
                        ...b,
                        quantity: b.quantity - n,
                        status: b.quantity === n ? "discarded" : b.status,
                      }
                    : b,
                ),
                waste: [
                  ...o.waste,
                  {
                    id: uid(),
                    batchId: target.id,
                    productId: target.productId,
                    quantity: n,
                    unitCost: target.unitCost,
                    reason: String(f.get("reason")),
                    date: dateKey(),
                  },
                ],
              }));
              setWasteBatch(null);
              toast(
                t(
                  "Zudums reģistrēts; demo krājums atjaunots",
                  "Потери записаны; демо-остаток обновлён",
                  "Waste recorded; demo stock updated",
                ),
              );
            }}
          >
            <label>
              {t("Partija", "Партия", "Batch")}
              <select
                value={target.id}
                onChange={(e) => setWasteBatch(e.target.value)}
              >
                {s.batches
                  .filter((b) => b.quantity > 0)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {pick(
                        s.catalog.find((p) => p.id === b.productId)!.name,
                        s.lang,
                      )}{" "}
                      · {b.id}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              {t(
                "Norakstāmais daudzums",
                "Количество к списанию",
                "Quantity to discard",
              )}
              <input
                required
                type="number"
                name="quantity"
                min={1}
                max={target.quantity}
                defaultValue={1}
              />
            </label>
            <label>
              {t("Iemesls", "Причина", "Reason")}
              <select name="reason">
                {Object.entries(wasteReasons).map(([v, label]) => (
                  <option key={v} value={v}>
                    {pick(label, s.lang)}
                  </option>
                ))}
              </select>
            </label>
            <p>
              {t("Vienības izmaksas", "Стоимость единицы", "Unit cost")}:{" "}
              {money(target.unitCost, s.lang)}
            </p>
            <button className="btn">
              <Trash2 size={16} />
              {t(
                "Reģistrēt norakstīšanu",
                "Записать списание",
                "Record discard",
              )}
            </button>
          </form>
        </Modal>
      )}
      {ruleEdit && (
        <Modal
          title={t(
            "Demo svaiguma noteikumi",
            "Демо-правила свежести",
            "Demo freshness rules",
          )}
          close={() => setRuleEdit(false)}
        >
          <form
            className="form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const monitor = Number(f.get("monitor")),
                discount = Number(f.get("discount")),
                remove = Number(f.get("remove"));
              if (monitor > discount || discount >= remove) {
                setError(
                  t(
                    "Jābūt: uzraudzīt ≤ atlaide < izņemšana.",
                    "Должно быть: контроль ≤ скидка < снятие.",
                    "Use: monitor ≤ discount < remove.",
                  ),
                );
                return;
              }
              set((o) => ({
                ...o,
                freshnessRules: { monitor, discount, remove },
              }));
              setRuleEdit(false);
              setError("");
            }}
          >
            <p>
              {t(
                "Dienas pēc sagatavošanas. Partijas pārdošanas datums ir papildu ierobežojums. Šie ir demo pieņēmumi, nevis reāli pārtikas vai ziedu drošības standarti.",
                "Дни после сборки. Дата продажи партии — дополнительное ограничение. Это демо-допущения, а не реальные стандарты безопасности.",
                "Days after assembly. Batch sell-by is an additional limit. These are demo assumptions rather than real safety standards.",
              )}
            </p>
            {Object.entries(s.freshnessRules).map(([key, v]) => (
              <label key={key}>
                {pick(
                  statusLabels[
                    key === "monitor"
                      ? "monitor"
                      : key === "discount"
                        ? "discount"
                        : "remove"
                  ],
                  s.lang,
                )}
                <input
                  required
                  type="number"
                  name={key}
                  min={key === "remove" ? 1 : 0}
                  max={30}
                  defaultValue={v}
                />
              </label>
            ))}
            <p className="error" role="alert">
              {error}
            </p>
            <button className="btn">
              {t("Saglabāt noteikumus", "Сохранить правила", "Save rules")}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
const maintenanceLabels: Record<MaintenanceType, Text> = {
  inspection: ["Pārbaude", "Осмотр", "Inspection"],
  temperature: ["Temperatūra", "Температура", "Temperature"],
  cleaning: ["Tīrīšana", "Уборка", "Cleaning"],
  restock: ["Papildināšana", "Пополнение", "Restocking"],
  compartment: ["Nodalījums", "Ячейка", "Compartment"],
  payment: ["Maksājumu terminālis", "Платёжный терминал", "Payment terminal"],
  connectivity: ["Savienojums", "Соединение", "Connectivity"],
  lock: ["Slēdzene", "Замок", "Lock"],
  fault: ["Bojājums", "Неисправность", "Fault report"],
};
function Maintenance() {
  const { s, set, toast } = useStore();
  const t = useT();
  const [edit, setEdit] = useState<MaintenanceRecord | null>(null);
  const [filter, setFilter] = useState("all");
  const records = s.maintenance
    .filter(
      (r) => filter === "all" || (filter === "open" ? !r.resolved : r.resolved),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <div className="rotation-note">
        <Thermometer size={23} />
        <p>
          {t(
            "Visi temperatūras, savienojuma un maksājumu termināļa ieraksti ir manuāli demo dati. Nav sensoru vai aparatūras savienojuma.",
            "Все записи температуры, соединения и терминала — ручные демо-данные. Нет подключения к датчикам или оборудованию.",
            "All temperature, connectivity and payment-terminal entries are manual demo records. No sensors or hardware are connected.",
          )}
        </p>
      </div>
      <div className="operations-toolbar">
        <label>
          {t("Ieraksti", "Записи", "Records")}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{t("Visi", "Все", "All")}</option>
            <option value="open">
              {t("Neatrisināti", "Открытые", "Open")}
            </option>
            <option value="resolved">
              {t("Pabeigti", "Завершённые", "Resolved")}
            </option>
          </select>
        </label>
        <button
          className="btn"
          onClick={() =>
            setEdit({
              id: uid(),
              type: "inspection",
              date: dateKey(),
              due: addDays(1),
              compartment: "all",
              notes: "",
              resolved: false,
            })
          }
        >
          <Plus size={16} />
          {t("Pievienot ierakstu", "Добавить запись", "Add maintenance entry")}
        </button>
      </div>
      <div className="stats-grid">
        <div className="panel stat">
          <Wrench />
          <span>{t("Neatrisināti", "Открытые", "Open records")}</span>
          <strong>{s.maintenance.filter((r) => !r.resolved).length}</strong>
        </div>
        <div className="panel stat">
          <Clock3 />
          <span>
            {t(
              "Pārbaudes līdz rītdienai",
              "Проверки до завтра",
              "Checks due by tomorrow",
            )}
          </span>
          <strong>
            {
              s.maintenance.filter((r) => !r.resolved && r.due <= addDays(1))
                .length
            }
          </strong>
        </div>
      </div>
      <div className="maintenance-grid">
        {records.map((r) => (
          <article className="panel maintenance-card" key={r.id}>
            <div className="row-between">
              <span className="badge-static">
                {r.sample
                  ? t("Parauga ieraksts", "Пример записи", "Sample record")
                  : t(
                      "Lokāls demo ieraksts",
                      "Локальная демо-запись",
                      "Local demo record",
                    )}
              </span>
              <button
                className="icon-btn"
                aria-label={t(
                  "Dzēst ierakstu",
                  "Удалить запись",
                  "Delete entry",
                )}
                onClick={() =>
                  set((o) => ({
                    ...o,
                    maintenance: o.maintenance.filter((x) => x.id !== r.id),
                  }))
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
            <h2>{pick(maintenanceLabels[r.type], s.lang)}</h2>
            <p>
              {r.date} ·{" "}
              {r.compartment === "all"
                ? t("Visi nodalījumi", "Все ячейки", "All compartments")
                : r.compartment}
            </p>
            {r.temperature !== undefined && (
              <strong className="temperature-value">
                {r.temperature} °C <small>DEMO</small>
              </strong>
            )}
            <p>
              {r.notes ||
                t(
                  "Standarta demo pārbaude.",
                  "Стандартная демо-проверка.",
                  "A routine demonstration check.",
                )}
            </p>
            <p className="muted">
              {t("Nākamā pārbaude", "Следующая проверка", "Next check")}:{" "}
              {r.due}
            </p>
            <label className="check-label">
              <input
                type="checkbox"
                checked={r.resolved}
                onChange={(e) =>
                  set((o) => ({
                    ...o,
                    maintenance: o.maintenance.map((x) =>
                      x.id === r.id ? { ...x, resolved: e.target.checked } : x,
                    ),
                  }))
                }
              />
              {t(
                "Atrisināts / pabeigts",
                "Решено / завершено",
                "Resolved / complete",
              )}
            </label>
            <button className="text-link" onClick={() => setEdit({ ...r })}>
              {t("Rediģēt ierakstu", "Изменить запись", "Edit entry")}
            </button>
          </article>
        ))}
      </div>
      {edit && (
        <Modal
          title={t(
            "Apkopes demo ieraksts",
            "Демо-запись обслуживания",
            "Demo maintenance entry",
          )}
          close={() => setEdit(null)}
        >
          <form
            className="form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              set((o) => ({
                ...o,
                maintenance: o.maintenance.some((r) => r.id === edit.id)
                  ? o.maintenance.map((r) => (r.id === edit.id ? edit : r))
                  : [...o.maintenance, edit],
              }));
              setEdit(null);
              toast(
                t(
                  "Apkopes ieraksts saglabāts",
                  "Запись обслуживания сохранена",
                  "Maintenance entry saved",
                ),
              );
            }}
          >
            <label>
              {t("Veids", "Тип", "Type")}
              <select
                value={edit.type}
                onChange={(e) =>
                  setEdit({ ...edit, type: e.target.value as MaintenanceType })
                }
              >
                {Object.entries(maintenanceLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {pick(label, s.lang)}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                {t("Pārbaudes datums", "Дата проверки", "Check date")}
                <input
                  required
                  type="date"
                  value={edit.date}
                  onChange={(e) => setEdit({ ...edit, date: e.target.value })}
                />
              </label>
              <label>
                {t("Nākamā pārbaude", "Следующая проверка", "Next due")}
                <input
                  required
                  type="date"
                  min={edit.date}
                  value={edit.due}
                  onChange={(e) => setEdit({ ...edit, due: e.target.value })}
                />
              </label>
            </div>
            <label>
              {t("Nodalījums", "Ячейка", "Compartment")}
              <select
                value={edit.compartment}
                onChange={(e) =>
                  setEdit({ ...edit, compartment: e.target.value })
                }
              >
                <option value="all">{t("Visi", "Все", "All")}</option>
                {s.compartments.map((c) => (
                  <option key={c.id}>{c.id}</option>
                ))}
              </select>
            </label>
            {edit.type === "temperature" && (
              <label>
                {t(
                  "Demo temperatūra (°C)",
                  "Демо-температура (°C)",
                  "Demo temperature (°C)",
                )}
                <input
                  required
                  type="number"
                  min={-50}
                  max={70}
                  step="0.1"
                  value={edit.temperature ?? 6}
                  onChange={(e) =>
                    setEdit({ ...edit, temperature: Number(e.target.value) })
                  }
                />
              </label>
            )}
            <label>
              {t("Piezīmes", "Заметки", "Notes")}
              <textarea
                maxLength={500}
                value={edit.notes}
                onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={edit.resolved}
                onChange={(e) =>
                  setEdit({ ...edit, resolved: e.target.checked })
                }
              />
              {t("Atrisināts", "Решено", "Resolved")}
            </label>
            <button className="btn">
              <Check size={16} />
              {t("Saglabāt ierakstu", "Сохранить запись", "Save entry")}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
const costFields: {
  key: Exclude<keyof Costs, "useRecordedWaste">;
  label: Text;
  unit: string;
  max: number;
  step?: number;
}[] = [
  {
    key: "price",
    label: [
      "Vidējā pušķa cena",
      "Средняя цена букета",
      "Average bouquet price",
    ],
    unit: "€",
    max: 500,
  },
  {
    key: "flowers",
    label: ["Ziedu pašizmaksa", "Себестоимость цветов", "Flower cost"],
    unit: "€",
    max: 500,
  },
  {
    key: "packaging",
    label: ["Iesaiņojums", "Упаковка", "Packaging"],
    unit: "€",
    max: 100,
  },
  {
    key: "feePercent",
    label: ["Maksājuma komisija", "Комиссия платежа", "Payment fee"],
    unit: "%",
    max: 30,
  },
  {
    key: "spoilagePercent",
    label: ["Zudumu pieņēmums", "Допущение порчи", "Spoilage assumption"],
    unit: "%",
    max: 95,
  },
  { key: "rent", label: ["Noma", "Аренда", "Rent"], unit: "€/mo", max: 100000 },
  {
    key: "electricity",
    label: ["Elektrība", "Электричество", "Electricity"],
    unit: "€/mo",
    max: 100000,
  },
  {
    key: "transport",
    label: ["Transports", "Транспорт", "Transport"],
    unit: "€/mo",
    max: 100000,
  },
  {
    key: "maintenance",
    label: ["Apkope", "Обслуживание", "Maintenance"],
    unit: "€/mo",
    max: 100000,
  },
  {
    key: "marketing",
    label: ["Mārketings", "Маркетинг", "Marketing"],
    unit: "€/mo",
    max: 100000,
  },
  {
    key: "dailySales",
    label: ["Pieprasījums dienā", "Спрос в день", "Daily sales demand"],
    unit: "units",
    max: 1000,
    step: 1,
  },
  {
    key: "days",
    label: [
      "Darba dienas mēnesī",
      "Рабочие дни в месяц",
      "Operating days per month",
    ],
    unit: "days",
    max: 31,
    step: 1,
  },
  {
    key: "restocksPerDay",
    label: [
      "Papildināšanas reizes dienā",
      "Пополнения в день",
      "Restocks per day",
    ],
    unit: "×",
    max: 24,
    step: 1,
  },
  {
    key: "machine",
    label: ["Automāta cena", "Стоимость автомата", "Machine cost"],
    unit: "€",
    max: 1000000,
  },
  {
    key: "startup",
    label: [
      "Kopējais sākuma budžets",
      "Общий стартовый бюджет",
      "Total startup budget",
    ],
    unit: "€",
    max: 1000000,
  },
  {
    key: "grant",
    label: [
      "Pieņēmums par grantu",
      "Допущение гранта",
      "Grant funding assumption",
    ],
    unit: "€",
    max: 1000000,
  },
];
function Profitability() {
  const { s, set } = useStore();
  const t = useT();
  const [selected, setSelected] = useState(1);
  const [costs, setCosts] = [
    s.costs,
    (next: Costs) => set((o) => ({ ...o, costs: next })),
  ] as const;
  const waste = s.waste.reduce((n, x) => n + x.unitCost * x.quantity, 0);
  const result = calculateProfit(costs, waste);
  const scenarios = [0.75, 1, 1.25].map((factor) =>
    calculateProfit(
      {
        ...costs,
        dailySales: Math.max(0, Math.round(costs.dailySales * factor)),
      },
      waste,
    ),
  );
  const max = Math.max(1, ...scenarios.map((x) => Math.abs(x.profit)));
  return (
    <>
      <div className="finance-banner">
        <BarChart3 size={27} />
        <div>
          <h2>
            {t(
              "Pieņēmumi, kurus vari pārbaudīt.",
              "Допущения, которые можно проверить.",
              "Assumptions you can explore.",
            )}
          </h2>
          <p>
            {t(
              "Visi skaitļi ir rediģējami demo pieņēmumi, nevis apstiprināti rezultāti vai garantēta peļņa. Summas pirms nodokļiem, bez PVN aprēķina.",
              "Все цифры — изменяемые демо-допущения, а не подтверждённые результаты или гарантированная прибыль. Суммы до налогов, без расчёта НДС.",
              "All figures are editable demo assumptions, not verified results or guaranteed returns. Amounts are before tax, without VAT calculations.",
            )}
          </p>
        </div>
      </div>
      <div className="finance-layout">
        <form
          className="panel finance-inputs"
          onSubmit={(e) => e.preventDefault()}
        >
          <h2>{t("Tavs modelis", "Ваша модель", "Your little model")}</h2>
          <div className="form-grid">
            {costFields.map((f) => (
              <label key={f.key}>
                {pick(f.label, s.lang)}{" "}
                <small>
                  {f.unit === "€/mo"
                    ? t("€/mēn.", "€/мес.", "€/month")
                    : f.unit === "units"
                      ? t("vienības", "шт.", "units")
                      : f.unit === "days"
                        ? t("dienas", "дни", "days")
                        : f.unit}
                </small>
                <input
                  required
                  type="number"
                  min={0}
                  max={f.max}
                  step={f.step ?? 0.01}
                  value={costs[f.key]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v) && v >= 0 && v <= f.max)
                      setCosts({ ...costs, [f.key]: v });
                  }}
                />
              </label>
            ))}
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={costs.useRecordedWaste}
              onChange={(e) =>
                setCosts({ ...costs, useRecordedWaste: e.target.checked })
              }
            />
            {t(
              "Papildus iekļaut reģistrētos demo zudumus",
              "Дополнительно учесть записанные демо-потери",
              "Also include recorded demo waste",
            )}{" "}
            ({money(waste, s.lang)})
          </label>
          <p className="muted">
            {t(
              "Procentuālie zudumi palielina nepieciešamo iegādi; reģistrētie zudumi ir papildu norakstīšana. Neieslēdz abus par tiem pašiem zudumiem.",
              "Процент порчи увеличивает необходимые закупки; записанные потери — дополнительное списание. Не учитывайте одни и те же потери дважды.",
              "Spoilage increases required purchases; recorded waste is an additional write-off. Do not count the same waste twice.",
            )}
          </p>
        </form>
        <div className="finance-results">
          <div className={`profit-card ${result.profit < 0 ? "negative" : ""}`}>
            <span className="eyebrow">
              {t(
                "MĒNEŠA DARBĪBAS REZULTĀTS PIRMS NODOKĻIEM",
                "ОПЕРАЦИОННЫЙ РЕЗУЛЬТАТ МЕСЯЦА ДО НАЛОГОВ",
                "MONTHLY OPERATING RESULT BEFORE TAX",
              )}
            </span>
            <strong>{money(result.profit, s.lang)}</strong>
            <p>
              {t(
                "Demo prognoze pēc izvēlētajiem pieņēmumiem",
                "Демо-прогноз по выбранным допущениям",
                "Demo projection from your selected assumptions",
              )}
            </p>
          </div>
          <div className="panel">
            <dl className="finance-totals">
              {[
                [
                  t("Apgrozījums", "Выручка", "Revenue"),
                  money(result.revenue, s.lang),
                ],
                [
                  t(
                    "Mainīgās izmaksas",
                    "Переменные расходы",
                    "Variable costs",
                  ),
                  money(result.variable, s.lang),
                ],
                [
                  t(
                    "Seguma summa",
                    "Маржинальный доход",
                    "Contribution margin",
                  ),
                  money(result.contribution, s.lang),
                ],
                [
                  t("Pastāvīgās izmaksas", "Постоянные расходы", "Fixed costs"),
                  money(result.fixed, s.lang),
                ],
                [
                  t(
                    "Izmaksas par pārdotu vienību",
                    "Расходы на проданную единицу",
                    "Variable cost per sold unit",
                  ),
                  money(result.unitVariable, s.lang),
                ],
                [
                  t(
                    "Bezzaudējumu apjoms mēnesī",
                    "Безубыточность в месяц",
                    "Monthly break-even units",
                  ),
                  result.breakEven === null
                    ? t(
                        "Nav sasniedzams ar šo maržu",
                        "Недостижимо при этой марже",
                        "Not achievable at this margin",
                      )
                    : String(result.breakEven),
                ],
                [
                  t(
                    "Atmaksāšanās perioda aplēse",
                    "Оценка окупаемости",
                    "Estimated payback",
                  ),
                  result.payback === null
                    ? t(
                        "Nav pozitīvas peļņas",
                        "Нет положительной прибыли",
                        "No positive profit",
                      )
                    : `${result.payback} ${t("mēneši", "месяцев", "months")}`,
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="panel capacity-card">
            <Package size={23} />
            <h3>
              {t(
                "Četri nodalījumi. Pārdomāta loģistika.",
                "Четыре ячейки. Продуманная логистика.",
                "Four compartments. Considered logistics.",
              )}
            </h3>
            <p>
              {t("Dienas ietilpība", "Дневная ёмкость", "Daily capacity")}:{" "}
              {result.capacity} ·{" "}
              {t(
                "Modelētā pārdošana",
                "Смоделированные продажи",
                "Modeled sales",
              )}
              : {result.daily}
            </p>
            <p>
              {t(
                "Papildināšana nepieciešama vismaz",
                "Минимум пополнений",
                "Minimum restocks needed",
              )}
              : {result.restocksNeeded} / {t("dienā", "день", "day")}
            </p>
            {result.lostDailySales > 0 && (
              <p className="error">
                {t(
                  "Pieprasījums pārsniedz ietilpību; aprēķins ierobežots. Neapkalpotais pieprasījums dienā",
                  "Спрос превышает ёмкость; расчёт ограничен. Необслуженный спрос в день",
                  "Demand exceeds capacity; the model is capped. Unserved daily demand",
                )}
                : {result.lostDailySales}
              </p>
            )}
            <p className="muted">
              {t(
                "Sākuma ieguldījums pēc granta",
                "Стартовые вложения после гранта",
                "Startup investment after grant",
              )}
              : {money(result.investment, s.lang)}.{" "}
              {t(
                "Sākuma budžets ietver automātu, tāpēc tā cena netiek pieskaitīta divreiz.",
                "Стартовый бюджет включает автомат: его цена не учитывается дважды.",
                "The startup budget includes the machine, so its cost is not counted twice.",
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="panel sensitivity">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t(
                "KĀ MAINĀS REZULTĀTS",
                "КАК МЕНЯЕТСЯ РЕЗУЛЬТАТ",
                "WHAT CHANGES THE PICTURE",
              )}
            </span>
            <h2>
              {t(
                "Trīs pieprasījuma scenāriji",
                "Три сценария спроса",
                "Three little demand scenarios",
              )}
            </h2>
          </div>
        </div>
        <div className="scenario-grid">
          {scenarios.map((r, i) => (
            <button
              aria-pressed={selected === i}
              key={i}
              className={`scenario-card ${selected === i ? "selected" : ""}`}
              onClick={() => setSelected(i)}
            >
              <span>
                {
                  [
                    t("Mierīgāks · −25%", "Спокойнее · −25%", "Quieter · −25%"),
                    t(
                      "Pamata pieņēmums",
                      "Базовое допущение",
                      "Base assumption",
                    ),
                    t("Aktīvāks · +25%", "Активнее · +25%", "Busier · +25%"),
                  ][i]
                }
              </span>
              <div className="scenario-track">
                <i
                  className={r.profit < 0 ? "negative" : ""}
                  style={{
                    width: `${Math.max(2, (Math.abs(r.profit) / max) * 100)}%`,
                  }}
                />
              </div>
              <strong>{money(r.profit, s.lang)}</strong>
              <small>
                {r.units}{" "}
                {t("vienības mēnesī", "шт. в месяц", "units per month")}
              </small>
            </button>
          ))}
        </div>
        <p className="chart-detail" role="status">
          {t(
            "Izvēlētā scenārija apgrozījums",
            "Выручка выбранного сценария",
            "Selected scenario revenue",
          )}
          : {money(scenarios[selected].revenue, s.lang)} ·{" "}
          {t("Rezultāts", "Результат", "Operating result")}:{" "}
          {money(scenarios[selected].profit, s.lang)}
        </p>
      </div>
    </>
  );
}
function Discounts() {
  const { s, set, toast } = useStore();
  const t = useT();
  const [code, setCode] = useState("SEASON15");
  const [percent, setPercent] = useState(15);
  const [scope, setScope] = useState("eligible");
  const [error, setError] = useState("");
  const eligible = [
    ...new Set(
      s.batches
        .filter(
          (b) =>
            b.quantity > 0 && freshness(b, s.freshnessRules) === "discount",
        )
        .map((b) => b.productId),
    ),
  ];
  return (
    <>
      <div className="checkout-layout">
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            const c = code.trim().toUpperCase();
            if (s.campaigns.some((x) => x.code === c)) {
              setError(
                t(
                  "Šāds kods jau pastāv.",
                  "Такой код уже существует.",
                  "That code already exists.",
                ),
              );
              return;
            }
            if (scope === "eligible" && !eligible.length) {
              setError(
                t(
                  "Nav piemērotu demo partiju atlaidei.",
                  "Нет подходящих демо-партий для скидки.",
                  "No demo batches are eligible for discount.",
                ),
              );
              return;
            }
            set((o) => ({
              ...o,
              campaigns: [
                ...o.campaigns,
                {
                  id: uid(),
                  code: c,
                  percent,
                  productIds: scope === "eligible" ? eligible : [],
                  active: true,
                },
              ],
            }));
            setError("");
            toast(
              t(
                "Demo akcija saglabāta. Kods darbojas grozā.",
                "Демо-акция сохранена. Код работает в корзине.",
                "Demo campaign saved. The code works in the bag.",
              ),
            );
          }}
        >
          <h2>
            {t(
              "Pārdomāta akcija",
              "Продуманная акция",
              "A considered little promotion",
            )}
          </h2>
          <label>
            {t("Kods", "Код", "Code")}
            <input
              required
              pattern="[A-Za-z0-9-]{3,24}"
              maxLength={24}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          <label>
            {t("Atlaide (%)", "Скидка (%)", "Discount (%)")}
            <input
              required
              type="number"
              min={1}
              max={50}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
            />
          </label>
          <label>
            {t("Piemērot", "Применить к", "Apply to")}
            <select value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="eligible">
                {t(
                  "Piemērotās nesenākās partijas",
                  "Подходящие партии по свежести",
                  "Freshness-eligible products",
                )}
              </option>
              <option value="all">
                {t(
                  "Visi demo produkti",
                  "Все демо-товары",
                  "All demo products",
                )}
              </option>
            </select>
          </label>
          <p className="error" role="alert">
            {error}
          </p>
          <button className="btn">
            <Percent size={16} />
            {t(
              "Izveidot demo akciju",
              "Создать демо-акцию",
              "Create demo campaign",
            )}
          </button>
        </form>
        <div className="panel">
          <h2>
            {t(
              "Droša demonstrācija",
              "Безопасная демонстрация",
              "A careful demonstration",
            )}
          </h2>
          <p>
            {t(
              "Atlaide nepadara nederīgu pušķi piemērotu pārdošanai. No pārdošanas izņemtie un norakstītie krājumi paliek nepieejami neatkarīgi no koda. Fiziska kvalitātes pārbaude īstajā pakalpojumā būtu obligāta.",
              "Скидка не делает непригодный букет пригодным к продаже. Снятые и списанные остатки остаются недоступными независимо от кода. В реальном сервисе необходима физическая проверка качества.",
              "A discount never makes an unsuitable bouquet fit for sale. Removed and discarded stock stays unavailable regardless of code. The real service would require a physical quality check.",
            )}
          </p>
          <p>
            {eligible.length}{" "}
            {t(
              "demo produkti piemēroti atlaides priekšskatījumam",
              "демо-товаров подходят для предпросмотра скидки",
              "demo products eligible for a discount preview",
            )}
          </p>
          <Link className="text-link" to="/admin?view=freshness">
            {t("Pārskatīt svaigumu", "Проверить свежесть", "Review freshness")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="record-list campaign-list">
        {s.campaigns.map((c) => (
          <div className="panel record" key={c.id}>
            <Percent size={20} />
            <div>
              <h3>
                {c.code} · −{c.percent}%
              </h3>
              <p>
                {c.productIds.length
                  ? `${c.productIds.length} ${t("produkti", "товаров", "products")}`
                  : t(
                      "Visi demo produkti",
                      "Все демо-товары",
                      "All demo products",
                    )}
              </p>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={c.active}
                onChange={(e) =>
                  set((o) => ({
                    ...o,
                    campaigns: o.campaigns.map((x) =>
                      x.id === c.id ? { ...x, active: e.target.checked } : x,
                    ),
                  }))
                }
              />
              {t("Aktīvs", "Активен", "Active")}
            </label>
            <button
              className="icon-btn"
              aria-label={t("Dzēst akciju", "Удалить акцию", "Delete campaign")}
              onClick={() =>
                set((o) => ({
                  ...o,
                  campaigns: o.campaigns.filter((x) => x.id !== c.id),
                }))
              }
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
