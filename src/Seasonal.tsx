import { HolidayCountdown } from "./HolidayCountdown";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bell,
  Check,
  Gift,
  Heart,
  LockKeyhole,
  Sparkles,
  TreePine,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { money, pick, type Product } from "./data";
import { dateKey, id } from "./domain";
import { holidayCategories } from "./holiday";
import { useT } from "./i18n";
import type { SeasonalState, NotificationKind } from "./seasonal-state";
import {
  leadAdapter,
  notificationLabels,
  notificationTemplates,
} from "./seasonal-state";
import { useStore } from "./store";
import { Demo, Modal, ProductCard, Title } from "./ui";
export function campaignActive(c: SeasonalState["campaign"], now = dateKey()) {
  return c.enabled && now >= c.start && now <= c.end;
}
function useSeasonal() {
  const store = useStore();
  return {
    ...store,
    update: (action: (o: SeasonalState) => SeasonalState) =>
      store.set((o) => ({ ...o, seasonal: action(o.seasonal) })),
  };
}
export function InterestButton({ product }: { product: Product }) {
  const { s, update } = useSeasonal();
  const t = useT();
  const selected = s.seasonal.interests.includes(product.id);
  return (
    <button
      className={`interest-button ${selected ? "selected" : ""}`}
      aria-pressed={selected}
      onClick={() =>
        update((o) => ({
          ...o,
          interests: selected
            ? o.interests.filter((x) => x !== product.id)
            : [...o.interests, product.id],
        }))
      }
    >
      <Heart size={15} fill={selected ? "currentColor" : "none"} />
      {selected
        ? t(
            "Interese saglabāta lokāli",
            "Интерес сохранён локально",
            "Interest saved locally",
          )
        : t("Mani interesē", "Мне интересно", "I’m interested")}
    </button>
  );
}
export function SeasonalHome({ original }: { original: React.ReactNode }) {
  const { s } = useStore();
  return campaignActive(s.seasonal.campaign) ? (
    <>
      <ChristmasHome />
      <div className="christmas-flower-continuation">{original}</div>
    </>
  ) : (
    <>{original}</>
  );
}
function ChristmasHome() {
  const { s } = useStore();
  const t = useT();
  const seasonal = s.catalog.filter((p) => p.seasonal);
  return (
    <>
      <section className="christmas-hero">
        <img
          src={`${import.meta.env.BASE_URL}seasonal/christmas-hero.webp`}
          srcSet={`${import.meta.env.BASE_URL}seasonal/christmas-hero-small.webp 768w, ${import.meta.env.BASE_URL}seasonal/christmas-hero.webp 1536w`}
          sizes="100vw"
          alt={t(
            "Skuju lācīša, Adventes vainaga un rūķa oriģināla koncepta vizualizācija",
            "Оригинальная визуализация хвойного мишки, адвентского венка и гнома",
            "Original concept visualization of an evergreen bear, Advent wreath and gnome",
          )}
          fetchPriority="high"
        />
        <div className="christmas-hero-copy">
          <span className="eyebrow">CHRISTMAS 2026 · NEW YEAR 2027</span>
          <h1>
            {t("Mazliet brīnuma.", "Немного чуда.", "A little wonder.")}
            <em>{t("No sirds.", "От всего сердца.", "Made to give.")}</em>
          </h1>
          <p>
            {t(
              "Skuju meža maģija, samta lentītes un pārdomātas dāvanas. Iepazīsti mūsu nākotnes Ziemassvētku kolekciju.",
              "Магия хвойного леса, бархатные ленты и продуманные подарки. Откройте нашу будущую рождественскую коллекцию.",
              "Evergreen magic, velvet ribbons and thoughtful little gifts. Discover our future Christmas collection.",
            )}
          </p>
          <div className="hero-buttons">
            <Link className="btn ivory" to="/christmas">
              {t(
                "Atklāt svētku kolekciju",
                "Открыть праздничную коллекцию",
                "Explore Christmas",
              )}
              <ArrowUpRight size={17} />
            </Link>
            <Link className="christmas-secondary" to="/launch">
              {t("Pirms atklāšanas", "До открытия", "Before we open")}
              <ArrowRight size={15} />
            </Link>
          </div>
          <small>
            {t(
              "Drīzumā · Koncepta vizualizācija · Nav reālu krājumu",
              "Скоро · Визуализация концепта · Не реальный запас",
              "Coming soon · Concept visualization · Not physical inventory",
            )}
          </small>
        </div>
        <div className="holiday-edition">
          THE WINTER ATELIER
          <br />
          <span>Flower Paradise</span>
        </div>
      </section>
      <HolidayCountdown />
      <section className="section featured-holiday">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t(
                "DĀVANAS AR NOSKAŅU",
                "ПОДАРКИ С НАСТРОЕНИЕМ",
                "THE GIFT OF A FEELING",
              )}
            </span>
            <h2>
              {t(
                "Lietas, kas rada brīnumu.",
                "Вещи, которые дарят чудо.",
                "Little things. Lasting wonder.",
              )}
            </h2>
          </div>
          <Link className="text-link" to="/christmas">
            {t("Visa kolekcija", "Вся коллекция", "The whole collection")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {s.seasonal.campaign.featured
            .map((id) => s.catalog.find((p) => p.id === id))
            .filter((p): p is Product => !!p)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
        </div>
      </section>
      {s.seasonal.campaign.sections.map((group, index) => {
        const ps = seasonal.filter((p) => p.category === group + 12);
        return (
          <section
            className={`holiday-collection section ${index % 2 ? "tinted" : ""}`}
            key={group}
          >
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  0{index + 1} · THE WINTER ATELIER
                </span>
                <h2>{pick(holidayCategories[group], s.lang)}</h2>
                <p>
                  {t(
                    "Pārdomāti koncepti svētku mājām un sirsnīgām dāvanām.",
                    "Продуманные идеи для праздничного дома и тёплых подарков.",
                    "Considered concepts for festive homes and thoughtful gifting.",
                  )}
                </p>
              </div>
              <Link
                className="text-link"
                to={`/christmas?category=${group + 12}`}
              >
                {t(
                  "Atklāt kolekciju",
                  "Открыть коллекцию",
                  "Explore collection",
                )}
                <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="holiday-product-grid">
              {ps
                .filter((_, i) => [0, 4, 9].includes(i))
                .map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
            </div>
          </section>
        );
      })}
      <section className="advent-promo section">
        <div>
          <span className="eyebrow">24 LITTLE MOMENTS</span>
          <h2>
            {t(
              "Katru dienu — mazs brīnums.",
              "Каждый день — маленькое чудо.",
              "A little wonder, every day.",
            )}
          </h2>
          <p>
            {t(
              "Digitāls Adventes kalendārs ar idejām, iedvesmu un demonstrācijas pārsteigumiem.",
              "Цифровой адвент-календарь с идеями, вдохновением и демо-сюрпризами.",
              "A digital Advent calendar of ideas, inspiration and demonstration surprises.",
            )}
          </p>
          <Link className="btn" to="/advent">
            {t(
              "Atvērt Adventes kalendāru",
              "Открыть адвент-календарь",
              "Open the Advent calendar",
            )}
            <Gift size={16} />
          </Link>
        </div>
        <div className="advent-promo-doors" aria-hidden="true">
          {[1, 7, 12, 18, 21, 24].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </section>
      <section className="section">
        <span className="eyebrow">CHRISTMAS ATELIER</span>
        <h2>
          {t(
            "Izveido dāvanu ar savu stāstu",
            "Создайте подарок со своей историей",
            "Create a gift with your own story",
          )}
        </h2>
        <div className="holiday-tool-grid">
          {[
            [
              "/gift-studio",
              t(
                "Dāvanu konstruktors 2.0",
                "Конструктор подарков 2.0",
                "Gift Builder 2.0",
              ),
            ],
            [
              "/wrapping-studio",
              t("Iesaiņošanas studija", "Студия упаковки", "Wrapping Studio"),
            ],
            [
              "/wreath-builder",
              t(
                "Tavs Adventes vainags",
                "Ваш адвентский венок",
                "Your Advent wreath",
              ),
            ],
            [
              "/advent-builder",
              t(
                "24 personiskas dāvanas",
                "24 личных подарка",
                "24 personal surprises",
              ),
            ],
          ].map(([url, label]) => (
            <Link key={url} to={url}>
              <small>CREATE · PERSONALIZE · DEMO</small>
              {label}
              <ArrowUpRight size={20} />
            </Link>
          ))}
        </div>
      </section>
      <section className="section holiday-recipients">
        <span className="eyebrow">
          {t(
            "VIŅIEM, KURI IR SVARĪGI",
            "ДЛЯ ТЕХ, КТО ДОРОГ",
            "FOR THE ONES WHO MATTER",
          )}
        </span>
        <h2>
          {t(
            "Katram savs prieks.",
            "Для каждого — своя радость.",
            "A little something for everyone.",
          )}
        </h2>
        <div className="recipient-links">
          {[
            ["her", t("Viņai", "Для неё", "For her")],
            ["him", t("Viņam", "Для него", "For him")],
            ["children", t("Bērniem", "Для детей", "For children")],
            ["parents", t("Vecākiem", "Для родителей", "For parents")],
            ["couples", t("Pāriem", "Для пары", "For couples")],
            ["colleagues", t("Kolēģiem", "Для коллег", "For colleagues")],
            ["teachers", t("Skolotājiem", "Для учителей", "For teachers")],
            ["corporate", t("Uzņēmumiem", "Для бизнеса", "Corporate gifts")],
          ].map(([key, label]) => (
            <Link key={key} to={`/christmas?recipient=${key}`}>
              {label}
              <ArrowUpRight size={14} />
            </Link>
          ))}
        </div>
        <div className="holiday-budget">
          {[15, 25, 50].map((n) => (
            <Link key={n} to={`/christmas?max=${n}`}>
              {t("Līdz", "До", "Under")} {money(n, s.lang)}
              <ArrowUpRight size={15} />
            </Link>
          ))}
          <Link to="/christmas-builder">
            {t("Izveidot dāvanu", "Собрать подарок", "Build a gift")}
            <Gift size={16} />
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="holiday-tool-grid">
          {[
            [
              "/gift-finder",
              t("Palīdzi man izvēlēties", "Помогите выбрать", "Help me choose"),
            ],
            [
              "/christmas-collections",
              t(
                "Gatavas kolekcijas",
                "Готовые коллекции",
                "Curated collections",
              ),
            ],
            [
              "/last-minute",
              t(
                "Dāvana pēdējā brīdī",
                "Подарок в последний момент",
                "Last-minute gifts",
              ),
            ],
            [
              "/corporate-christmas",
              t("Uzņēmumu dāvanas", "Корпоративные подарки", "Corporate gifts"),
            ],
          ].map(([url, label]) => (
            <Link key={url} to={url}>
              {label}
              <ArrowUpRight size={20} />
            </Link>
          ))}
        </div>
      </section>
      <section className="holiday-preorder section">
        <TreePine size={35} strokeWidth={1} />
        <div>
          <h2>
            {t(
              "Ieplāno skaistu svētku mirkli.",
              "Запланируйте красивый праздник.",
              "Make room for a lovely Christmas.",
            )}
          </h2>
          <p>
            {t(
              "Izmēģini iepriekšpasūtījumu, saņemšanas laiku vai dāvanas piegādes priekšskatījumu. Viss notiek tikai šajā pārlūkā.",
              "Попробуйте предзаказ, время самовывоза или просмотр доставки подарка. Всё происходит только в этом браузере.",
              "Try a preorder, pickup time or gift delivery preview. Everything happens only in this browser.",
            )}
          </p>
        </div>
        <Link className="btn" to="/christmas-preorders">
          {t("Demo iepriekšpasūtījums", "Демо-предзаказ", "Demo preorder")}
          <ArrowUpRight size={16} />
        </Link>
      </section>
      <div className="section regular-intro">
        <span className="eyebrow">FLOWERS. FEELINGS. ALWAYS.</span>
        <h2>
          {t(
            "Un vienmēr — ziedi.",
            "И всегда — цветы.",
            "And always, flowers.",
          )}
        </h2>
        <Link className="text-link" to="/shop">
          {t(
            "Ikdienas ziedu kolekcija",
            "Основная цветочная коллекция",
            "Our everyday flower collection",
          )}
          <ArrowRight size={16} />
        </Link>
      </div>
    </>
  );
}
function Advent() {
  const { s, update } = useSeasonal();
  const t = useT();
  const [preview, setPreview] = useState(false);
  const [day, setDay] = useState<number | null>(null);
  const now = dateKey();
  const unlocked = (n: number) =>
    preview || now >= `2026-12-${String(n).padStart(2, "0")}`;
  const product = s.catalog.filter((p) => p.seasonal)[(day ?? 1) - 1];
  return (
    <div className="page advent-page">
      <Title
        kicker="THE WINTER ATELIER · 2026"
        title={t(
          "24 mazi prieka mirkļi.",
          "24 маленьких момента радости.",
          "24 little moments of wonder.",
        )}
        description={t(
          "Atver pa lodziņam no 1. līdz 24. decembrim Rīgas laikā. Demo režīms ļauj ieskatīties jau tagad. Nav īstu balvu.",
          "Открывайте по окошку с 1 по 24 декабря по рижскому времени. Демо-режим позволяет заглянуть заранее. Реальных призов нет.",
          "Open a window each day from 1–24 December, Riga time. Preview mode lets you explore early. No real prizes.",
        )}
      />
      <Demo />
      <label className="check advent-preview">
        <input
          type="checkbox"
          checked={preview}
          onChange={(e) => setPreview(e.target.checked)}
        />
        {t(
          "Priekšskatīt visus lodziņus (demo)",
          "Предпросмотр всех окошек (демо)",
          "Preview all windows (demo)",
        )}
      </label>
      <div className="advent-grid">
        {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            className={`advent-door ${s.seasonal.adventOpened.includes(n) ? "opened" : ""}`}
            disabled={!unlocked(n)}
            aria-label={`${t("Lodziņš", "Окошко", "Window")} ${n}`}
            onClick={() => {
              setDay(n);
              update((o) => ({
                ...o,
                adventOpened: [...new Set([...o.adventOpened, n])],
              }));
            }}
          >
            <small>
              {unlocked(n) ? "DECEMBER" : <LockKeyhole size={13} />}
            </small>
            <strong>{n}</strong>
            <span>
              {s.seasonal.adventOpened.includes(n) ? (
                <Check size={19} />
              ) : (
                <Sparkles size={17} />
              )}
            </span>
          </button>
        ))}
      </div>
      {day && (
        <Modal
          title={`${day} · ${t("Mazs brīnums", "Маленькое чудо", "A little wonder")}`}
          close={() => setDay(null)}
        >
          <p className="advent-message">
            {t(
              "Šodien uzdāvini kādam savu laiku un siltu vārdu. Skaistākās dāvanas sākas ar uzmanību.",
              "Сегодня подарите кому-нибудь время и доброе слово. Лучшие подарки начинаются с внимания.",
              "Give someone a little time and a kind word today. The loveliest gifts start with thoughtfulness.",
            )}
          </p>
          {day % 6 === 0 && (
            <p className="demo">
              {t(
                "Demo ideja: 10% kupons ADVENT10. Nav komerciāla piedāvājuma.",
                "Демо-идея: купон ADVENT10 на 10%. Не коммерческое предложение.",
                "Demo idea: ADVENT10 for 10%. Not a commercial offer.",
              )}
            </p>
          )}
          <ProductCard p={product} />
          {day % 6 === 0 && <AdventCoupon />}
        </Modal>
      )}
    </div>
  );
}
function AdventCoupon() {
  const { s, set, toast } = useStore();
  const t = useT();
  return (
    <button
      className="btn"
      onClick={() => {
        set((o) => ({
          ...o,
          campaigns: o.campaigns.some((c) => c.code === "ADVENT10")
            ? o.campaigns
            : [
                ...o.campaigns,
                {
                  id: "advent10",
                  code: "ADVENT10",
                  percent: 10,
                  productIds: s.catalog
                    .filter((p) => p.seasonal)
                    .map((p) => p.id),
                  active: true,
                },
              ],
        }));
        toast(
          t(
            "Demo kupons aktivizēts",
            "Демо-купон активирован",
            "Demo coupon activated",
          ),
        );
      }}
    >
      {t(
        "Aktivizēt demo kuponu",
        "Активировать демо-купон",
        "Activate demo coupon",
      )}
    </button>
  );
}
export function NotificationCenter() {
  const { s, update } = useSeasonal();
  const t = useT();
  const [kind, setKind] = useState<NotificationKind>("order");
  const n = s.seasonal.notifications;
  const admin = [
    "corporateInquiry",
    "materialShortage",
    "newOrder",
    "newLead",
    "lowStock",
    "expiring",
    "fault",
    "temperature",
    "summary",
  ].includes(kind);
  const marketing = ["launch", "stock", "offer"].includes(kind);
  const enabled = admin ? n.admin : marketing ? n.marketing : n.transactional;
  return (
    <div className="page notification-center">
      <Title
        kicker="DEMO · NO MESSAGES SENT"
        title={t(
          "Ziņas, tavā ritmā.",
          "Уведомления в вашем ритме.",
          "Good news, on your terms.",
        )}
        description={t(
          "Tikai lokāli priekšskatījumi. Kanāli nav savienoti ar ārējiem pakalpojumiem.",
          "Только локальные предпросмотры. Каналы не подключены к внешним сервисам.",
          "Local previews only. Channels are not connected to external services.",
        )}
      />
      <Demo />
      <div className="notification-layout">
        <div className="panel form-panel">
          <h2>{t("Tavas izvēles", "Ваши настройки", "Your preferences")}</h2>
          {(["transactional", "marketing", "admin"] as const).map((key, i) => (
            <label className="check" key={key}>
              <input
                type="checkbox"
                checked={n[key]}
                onChange={(e) =>
                  update((o) => ({
                    ...o,
                    notifications: {
                      ...o.notifications,
                      [key]: e.target.checked,
                    },
                  }))
                }
              />
              {
                [
                  t(
                    "Darījumu demo ziņas",
                    "Демо-уведомления о действиях",
                    "Transactional demo updates",
                  ),
                  t(
                    "Mārketinga demo ziņas (pēc izvēles)",
                    "Демо-маркетинг (по желанию)",
                    "Marketing demo updates (optional)",
                  ),
                  t(
                    "Administratora demo brīdinājumi",
                    "Демо-оповещения администратора",
                    "Admin demo alerts",
                  ),
                ][i]
              }
            </label>
          ))}
          <label>
            {t(
              "Priekšskatījuma kanāls",
              "Канал предпросмотра",
              "Preview channel",
            )}
            <select
              value={n.channel}
              onChange={(e) =>
                update((o) => ({
                  ...o,
                  notifications: {
                    ...o.notifications,
                    channel: e.target.value,
                  },
                }))
              }
            >
              <option>Email</option>
              <option>Telegram</option>
              <option disabled>
                SMS · {t("Nākotnē", "В будущем", "Future")}
              </option>
              <option disabled>
                WhatsApp · {t("Nākotnē", "В будущем", "Future")}
              </option>
            </select>
          </label>
          <label>
            {t("Ziņas veids", "Тип уведомления", "Notification template")}
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as NotificationKind)}
            >
              {Object.entries(notificationLabels).map(([k, l]) => (
                <option key={k} value={k}>
                  {pick(l, s.lang)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="panel form-panel">
          <span className="eyebrow">{n.channel} · DEMO PREVIEW</span>
          <h2>{pick(notificationLabels[kind], s.lang)}</h2>
          <div className="notification-bubble">
            <Bell size={23} />
            <p>{pick(notificationTemplates[kind], s.lang)}</p>
          </div>
          <button
            className="btn"
            disabled={!enabled}
            onClick={() =>
              update((o) => ({
                ...o,
                notifications: {
                  ...o.notifications,
                  log: [
                    ...o.notifications.log,
                    {
                      id: id(),
                      kind,
                      channel: n.channel,
                      date: new Date().toISOString(),
                    },
                  ].slice(-50),
                },
              }))
            }
          >
            {t(
              "Pievienot simulāciju žurnālam",
              "Добавить симуляцию в журнал",
              "Add simulation to log",
            )}
          </button>
          {!enabled && (
            <p role="status">
              {t(
                "Vispirms ieslēdz šīs kategorijas demo ziņas.",
                "Сначала включите демо-уведомления этой категории.",
                "Enable this category of demo updates first.",
              )}
            </p>
          )}
          <p className="muted">
            {t(
              "Nav nosūtīts ne e-pasts, ne Telegram ziņa.",
              "Ни email, ни сообщение Telegram не отправлены.",
              "No email or Telegram message is sent.",
            )}
          </p>
        </div>
      </div>
      <section className="panel form-panel">
        <div className="row-between">
          <h2>
            {t("Simulāciju žurnāls", "Журнал симуляций", "Simulation log")}
          </h2>
          <button
            className="text-link"
            onClick={() =>
              update((o) => ({
                ...o,
                notifications: { ...o.notifications, log: [] },
              }))
            }
          >
            {t("Notīrīt", "Очистить", "Clear")}
          </button>
        </div>
        {n.log.length === 0 ? (
          <p className="muted">
            {t(
              "Vēl nav lokālu simulāciju.",
              "Локальных симуляций пока нет.",
              "No local simulations yet.",
            )}
          </p>
        ) : (
          n.log
            .slice()
            .reverse()
            .map((e) => (
              <div className="notification-log-row" key={e.id}>
                <Bell size={16} />
                <div>
                  <strong>{pick(notificationLabels[e.kind], s.lang)}</strong>
                  <p>{pick(notificationTemplates[e.kind], s.lang)}</p>
                </div>
                <small>
                  {e.channel} ·{" "}
                  {new Intl.DateTimeFormat(s.lang, {
                    timeZone: "Europe/Riga",
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(e.date))}
                </small>
              </div>
            ))
        )}
      </section>
    </div>
  );
}
export function Launch() {
  const { s, update } = useSeasonal();
  const t = useT();
  const [prepared, setPrepared] = useState(false);
  const [email, setEmail] = useState("alex@example.com");
  return (
    <div className="page launch-page">
      <Title
        kicker="DAUGAVPILS · COMING SOON"
        title={t(
          "Palīdzi paradīzei uzziedēt.",
          "Помогите Paradise расцвести.",
          "Help our little paradise bloom.",
        )}
        description={t(
          "Pirms ieguldījuma automātā pētām nākotnes konceptu. Šī forma ir tikai demonstrācija: uzņēmums neredz šajā pārlūkā saglabātās izvēles.",
          "До покупки автомата мы изучаем будущий концепт. Эта форма — только демонстрация: бизнес не видит сохранённые в этом браузере ответы.",
          "We are exploring demand before investing in a machine. This form is only a demonstration: the business cannot see choices stored in this browser.",
        )}
      />
      <Demo />
      <div className="launch-layout">
        <div className="launch-art">
          <img
            src={`${import.meta.env.BASE_URL}seasonal/christmas-hero-small.webp`}
            alt={t(
              "Svētku koncepta iedvesma",
              "Праздничный концепт",
              "Holiday concept inspiration",
            )}
          />
          <div>
            <span>FLOWER PARADISE</span>
            <h2>
              {t(
                "Drīzumā, Daugavpilī.",
                "Скоро, в Даугавпилсе.",
                "Coming soon, Daugavpils.",
              )}
            </h2>
            <Link className="text-link" to="/christmas">
              {t(
                "Iepazīt kolekciju",
                "Посмотреть коллекцию",
                "Explore the collection",
              )}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <form
          className="panel form-panel"
          onSubmit={async (e) => {
            e.preventDefault();
            await leadAdapter.submitDemo();
            update((o) => ({ ...o, survey: { ...o.survey, completed: true } }));
            setPrepared(true);
          }}
        >
          <h2>
            {t(
              "Tavs nākotnes veikals",
              "Ваш будущий магазин",
              "Your future boutique",
            )}
          </h2>
          {(
            [
              [
                "budget",
                t(
                  "Vēlamais dāvanas budžets",
                  "Предпочитаемый бюджет подарка",
                  "Preferred gift budget",
                ),
                [
                  ["under25", "< €25"],
                  ["25-50", "€25–50"],
                  ["over50", "€50+"],
                ],
              ],
              [
                "location",
                t(
                  "Vēlamā saņemšanas zona",
                  "Предпочитаемая зона самовывоза",
                  "Preferred pickup area",
                ),
                [
                  ["centre", t("Centrs", "Центр", "City centre")],
                  [
                    "neighbourhood",
                    t("Dzīvojamais rajons", "Жилой район", "Residential area"),
                  ],
                  [
                    "shopping",
                    t(
                      "Tirdzniecības centrs",
                      "Торговый центр",
                      "Shopping centre",
                    ),
                  ],
                ],
              ],
              [
                "time",
                t("Ērtākais laiks", "Удобное время", "Preferred purchase time"),
                [
                  ["morning", t("Rīts", "Утро", "Morning")],
                  ["day", t("Diena", "День", "Daytime")],
                  ["evening", t("Vakars", "Вечер", "Evening")],
                  ["night", t("Nakts", "Ночь", "Night")],
                ],
              ],
              [
                "giftType",
                t(
                  "Vēlamā dāvana",
                  "Предпочитаемый подарок",
                  "Preferred gift type",
                ),
                [
                  ["any", t("Jebkura", "Любой", "Any")],
                  ["decor", t("Dekors", "Декор", "Decorations")],
                  [
                    "box",
                    t("Dāvanu kaste", "Подарочная коробка", "Gift boxes"),
                  ],
                  ["flowers", t("Ziedi", "Цветы", "Flowers")],
                ],
              ],
              [
                "vending",
                t(
                  "Vai interesē saņemšana 24/7?",
                  "Интересно получение 24/7?",
                  "Interested in 24/7 pickup?",
                ),
                [
                  ["yes", t("Jā", "Да", "Yes")],
                  ["maybe", t("Iespējams", "Возможно", "Maybe")],
                  ["no", t("Nē", "Нет", "No")],
                ],
              ],
            ] as [keyof SeasonalState["survey"], string, string[][]][]
          ).map(([key, label, options]) => (
            <label key={key}>
              {label}
              <select
                value={String(s.seasonal.survey[key])}
                onChange={(e) =>
                  update((o) => ({
                    ...o,
                    survey: { ...o.survey, [key]: e.target.value },
                  }))
                }
              >
                {options.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button className="btn">
            {t(
              "Saglabāt atbildes lokāli",
              "Сохранить ответы локально",
              "Save answers locally",
            )}
            <Check size={16} />
          </button>
          {(prepared || s.seasonal.survey.completed) && (
            <p role="status">
              {t(
                "Saglabāts šajā pārlūkā. Nekas nav nosūtīts.",
                "Сохранено в этом браузере. Ничего не отправлено.",
                "Saved in this browser. Nothing was submitted.",
              )}
            </p>
          )}
        </form>
      </div>
      <form
        className="launch-signup panel"
        onSubmit={(e) => {
          e.preventDefault();
          update((o) => ({ ...o, launchInterest: true }));
          setEmail("alex@example.com");
        }}
      >
        <div>
          <h2>
            {t(
              "Atklāšanas ziņu priekšskatījums",
              "Предпросмотр новостей запуска",
              "A preview of launch updates",
            )}
          </h2>
          <p>
            {t(
              "Lieto izdomātu adresi. Saglabājam tikai interesi, nevis ievadīto adresi. Nav īsta abonementa.",
              "Используйте вымышленный адрес. Сохраняется только интерес, а не адрес. Реальной подписки нет.",
              "Use a fictional address. Only interest is saved, not the entered address. No real subscription.",
            )}
          </p>
        </div>
        <label>
          {t("Demo e-pasts", "Демо-email", "Demo email")}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button className="btn">
          {s.seasonal.launchInterest
            ? t("Interese saglabāta", "Интерес сохранён", "Interest saved")
            : t("Izmēģināt", "Попробовать", "Try it")}
        </button>
      </form>
      <div className="panel form-panel">
        <h2>{t("Tavas idejas", "Ваши идеи", "Your saved ideas")}</h2>
        <p>
          {t(
            "Šī pārlūka interese:",
            "Интерес в этом браузере:",
            "Interest in this browser:",
          )}{" "}
          {s.seasonal.interests.length}
        </p>
        <div className="holiday-product-grid">
          {s.catalog
            .filter((p) => s.seasonal.interests.includes(p.id))
            .map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
        </div>
      </div>
    </div>
  );
}
export function SeasonalAdmin() {
  const { s, update } = useSeasonal();
  const t = useT();
  const c = s.seasonal.campaign;
  const change = (p: Partial<typeof c>) =>
    update((o) => ({ ...o, campaign: { ...o.campaign, ...p } }));
  return (
    <div className="seasonal-admin">
      <Demo />
      <div className="panel form-panel">
        <h2>
          {t(
            "Ziemassvētku studija",
            "Рождественская студия",
            "Christmas studio",
          )}
        </h2>
        <label className="check">
          <input
            type="checkbox"
            checked={c.enabled}
            onChange={(e) => change({ enabled: e.target.checked })}
          />
          {t(
            "Ieslēgt Ziemassvētku galveno lapu",
            "Включить рождественскую главную",
            "Enable Christmas homepage",
          )}
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={c.prelaunch}
            onChange={(e) => change({ prelaunch: e.target.checked })}
          />
          {t("Pirms atklāšanas režīms", "Режим до открытия", "Pre-launch mode")}
        </label>
        <div className="form-grid">
          <label>
            {t("Kampaņas sākums", "Начало кампании", "Campaign start")}
            <input
              type="date"
              min="2026-01-01"
              max="2026-12-31"
              value={c.start}
              onChange={(e) =>
                e.target.value &&
                e.target.value <= c.end &&
                change({ start: e.target.value })
              }
            />
          </label>
          <label>
            {t("Kampaņas beigas", "Конец кампании", "Campaign end")}
            <input
              type="date"
              min={c.start}
              max="2027-01-31"
              value={c.end}
              onChange={(e) =>
                e.target.value >= c.start && change({ end: e.target.value })
              }
            />
          </label>
        </div>
        <p>
          {t(
            "Izmaiņas redzamas uzreiz tikai šajā pārlūkā.",
            "Изменения видны сразу только в этом браузере.",
            "Changes apply immediately only in this browser.",
          )}
        </p>
        <Link className="btn" to="/">
          {t(
            "Priekšskatīt galveno lapu",
            "Посмотреть главную",
            "Preview homepage",
          )}
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="panel form-panel">
        <h2>
          {t("Kolekciju secība", "Порядок коллекций", "Collection order")}
        </h2>
        {c.sections.map((g, i) => (
          <div className="section-order-row" key={g}>
            <span>{pick(holidayCategories[g], s.lang)}</span>
            <button
              className="icon-btn"
              disabled={i === 0}
              aria-label={`${t("Uz augšu", "Выше", "Move up")} ${pick(holidayCategories[g], s.lang)}`}
              onClick={() => {
                const n = [...c.sections];
                [n[i - 1], n[i]] = [n[i], n[i - 1]];
                change({ sections: n });
              }}
            >
              <ArrowUp size={16} />
            </button>
            <button
              className="icon-btn"
              disabled={i === c.sections.length - 1}
              aria-label={`${t("Uz leju", "Ниже", "Move down")} ${pick(holidayCategories[g], s.lang)}`}
              onClick={() => {
                const n = [...c.sections];
                [n[i + 1], n[i]] = [n[i], n[i + 1]];
                change({ sections: n });
              }}
            >
              <ArrowDown size={16} />
            </button>
            <button
              className="text-link"
              onClick={() =>
                change({ sections: c.sections.filter((x) => x !== g) })
              }
            >
              {t("Paslēpt", "Скрыть", "Hide")}
            </button>
          </div>
        ))}
        {holidayCategories.map(
          (l, g) =>
            !c.sections.includes(g) && (
              <button
                className="text-link"
                key={g}
                onClick={() => change({ sections: [...c.sections, g] })}
              >
                + {pick(l, s.lang)}
              </button>
            ),
        )}
      </div>
      <div className="panel form-panel">
        <h2>
          {t(
            "Izcelti produkti",
            "Избранные товары витрины",
            "Featured products",
          )}
        </h2>
        <p>
          {t(
            "Līdz 8 izvēlēm. Galvenā lapa rāda pirmās četras.",
            "До 8 товаров. Главная показывает первые четыре.",
            "Choose up to 8. The homepage shows the first four.",
          )}
        </p>
        <div className="featured-editor">
          {s.catalog
            .filter((p) => p.seasonal)
            .map((p) => (
              <label className="check" key={p.id}>
                <input
                  type="checkbox"
                  checked={c.featured.includes(p.id)}
                  disabled={
                    !c.featured.includes(p.id) && c.featured.length >= 8
                  }
                  onChange={() =>
                    change({
                      featured: c.featured.includes(p.id)
                        ? c.featured.filter((x) => x !== p.id)
                        : [...c.featured, p.id],
                    })
                  }
                />
                {pick(p.name, s.lang)}
              </label>
            ))}
        </div>
      </div>
      <div className="panel form-panel">
        <h2>
          {t(
            "Šī pārlūka pieprasījuma demonstrācija",
            "Демо-спрос в этом браузере",
            "Demand demonstration in this browser",
          )}
        </h2>
        <p>
          {t(
            "Lokāli atzīmēti produkti",
            "Локально отмеченные товары",
            "Locally marked products",
          )}
          : {s.seasonal.interests.length}
        </p>
        <p>
          {t("Aptauja pabeigta", "Опрос завершён", "Survey completed")}:{" "}
          {s.seasonal.survey.completed
            ? t("Jā", "Да", "Yes")
            : t("Nē", "Нет", "No")}
        </p>
        <p className="muted">
          {t(
            "Nav apkopotu klientu datu. Citu pārlūku darbības šeit nav redzamas.",
            "Нет собранных клиентских данных. Действия других браузеров здесь не видны.",
            "No aggregated customer data. Activity from other browsers is not visible here.",
          )}
        </p>
        <Link className="text-link" to="/launch">
          {t(
            "Atvērt aptaujas demonstrāciju",
            "Открыть демонстрацию опроса",
            "Open survey demonstration",
          )}
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
export default function Seasonal() {
  const p = useLocation().pathname;
  return p === "/advent" ? (
    <Advent />
  ) : p === "/launch" ? (
    <Launch />
  ) : (
    <NotificationCenter />
  );
}
