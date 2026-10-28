import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Flower2,
  Gift,
  GitCompareArrows,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { colors, img, money, occasions, pick, type Text } from "./data";
import {
  availability,
  giftBundles,
  matchProducts,
  methodLabel,
  type MatchAnswers,
} from "./domain";
import { AvailabilityBadge } from "./feature-ui";
import { useStore } from "./store";
import { Demo, Empty, ProductCard, Title, useT } from "./ui";
export default function Discovery() {
  const path = useLocation().pathname;
  return path === "/match" ? (
    <FlowerMatch />
  ) : path === "/available" ? (
    <AvailableNow />
  ) : path === "/compare" ? (
    <Comparison />
  ) : path === "/gift-builder" ? (
    <BudgetBuilder />
  ) : (
    <Discover />
  );
}
export const featureLinks: {
  url: string;
  title: Text;
  description: Text;
  icon: string;
}[] = [
  {
    url: "/match",
    title: ["Atrodi savus ziedus", "Найдите свои цветы", "Find your flowers"],
    description: [
      "7 mazi soļi līdz piemērotam pušķim.",
      "7 простых шагов к подходящему букету.",
      "Seven little steps to a thoughtful match.",
    ],
    icon: "flower",
  },
  {
    url: "/available",
    title: ["Pieejams tagad", "Доступно сейчас", "Available now"],
    description: [
      "Demo pušķi, kas gaida automātā.",
      "Демо-букеты, ожидающие в автомате.",
      "Demo bouquets waiting in the vending machine.",
    ],
    icon: "clock",
  },
  {
    url: "/gift-builder",
    title: [
      "Dāvana tavā budžetā",
      "Подарок в вашем бюджете",
      "A gift within your budget",
    ],
    description: [
      "Ziedi, kartīte un dāvana vienā komplektā.",
      "Цветы, открытка и подарок в одном наборе.",
      "Flowers, a card and a thoughtful extra.",
    ],
    icon: "gift",
  },
  {
    url: "/secret-gift",
    title: ["Slepenā dāvana", "Тайный подарок", "A secret little gift"],
    description: [
      "Personisks pārsteigums ar atklāšanas animāciju.",
      "Личный сюрприз с анимированным раскрытием.",
      "A personal surprise with an animated reveal.",
    ],
    icon: "heart",
  },
  {
    url: "/planner",
    title: [
      "Gads ar skaistiem mirkļiem",
      "Год прекрасных моментов",
      "A year of lovely moments",
    ],
    description: [
      "Svarīgi datumi un pārdomāts dāvanu budžets.",
      "Важные даты и продуманный бюджет подарков.",
      "Important dates and a considered gifting budget.",
    ],
    icon: "calendar",
  },
  {
    url: "/compare",
    title: ["Salīdzini pušķus", "Сравните букеты", "Compare your favourites"],
    description: [
      "Līdz trim pušķiem, detaļas vienuviet.",
      "До трёх букетов, все детали рядом.",
      "Up to three bouquets, all the details together.",
    ],
    icon: "compare",
  },
];
function Discover() {
  const { s } = useStore();
  const t = useT();
  return (
    <div className="page">
      <Title
        kicker={t(
          "DOMĀTS AR SIRDI",
          "ПРОДУМАНО С ДУШОЙ",
          "THOUGHTFUL, BY NATURE",
        )}
        title={t(
          "Atklāj savu mazo paradīzi.",
          "Откройте свой маленький рай.",
          "Find your little paradise.",
        )}
        description={t(
          "Mazāk minēšanas, vairāk skaistu mirkļu. Atklāj rīkus personiskai dāvanai.",
          "Меньше догадок, больше прекрасных моментов. Откройте инструменты для личного подарка.",
          "Less guesswork, more lovely moments. Discover little tools for wonderfully personal gifts.",
        )}
      />
      <Demo />
      <div className="discovery-grid">
        {featureLinks.map((f, i) => (
          <Link to={f.url} key={f.url} className="discovery-card">
            <div className="discovery-photo">
              <img
                src={img(s.catalog[[0, 4, 27, 9, 18, 3][i]].photo)}
                alt=""
                loading="lazy"
              />
              <span>0{i + 1}</span>
            </div>
            <div>
              <span className="eyebrow">FLOWER PARADISE</span>
              <h2>{pick(f.title, s.lang)}</h2>
              <p>{pick(f.description, s.lang)}</p>
              <ArrowUpRight size={20} />
            </div>
          </Link>
        ))}
      </div>
      <div className="service-grid section slim">
        {[
          ["/about", t("Mūsu stāsts", "Наша история", "Our story")],
          [
            "/delivery",
            t(
              "Piegāde un saņemšana",
              "Доставка и самовывоз",
              "Delivery & pickup",
            ),
          ],
          [
            "/contact",
            t("Sazinies ar mums", "Свяжитесь с нами", "Get in touch"),
          ],
        ].map(([url, label]) => (
          <Link className="service-card" key={url} to={url}>
            <Flower2 />
            <h3>{label}</h3>
            <ArrowUpRight size={18} />
          </Link>
        ))}
      </div>
    </div>
  );
}
const reasonLabels: Record<string, Text> = {
  budget: ["Iekļaujas budžetā", "В рамках бюджета", "Within your budget"],
  occasion: ["Atbilst notikumam", "Подходит к поводу", "Fits the occasion"],
  color: ["Vēlamie toņi", "Предпочитаемые оттенки", "Your preferred shades"],
  style: ["Piemērots stils", "Подходящий стиль", "A style you like"],
  immediate: [
    "Demo saņemšana tagad",
    "Демо-получение сейчас",
    "Demo pickup now",
  ],
};
function FlowerMatch() {
  const { s } = useStore();
  const t = useT();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [a, setA] = useState<MatchAnswers>({
    recipient: "someone",
    occasion: 0,
    budget: 50,
    color: -1,
    style: "all",
    avoid: "",
    immediate: false,
  });
  const titles = [
    t(
      "Kam tu dāvāsi ziedus?",
      "Кому вы дарите цветы?",
      "Who is this little gesture for?",
    ),
    t("Kāds ir notikums?", "Какой повод?", "What’s the occasion?"),
    t("Tavs ziedu budžets", "Ваш бюджет на цветы", "Your flower budget"),
    t("Kādi toņi priecē?", "Какие оттенки радуют?", "Which shades feel right?"),
    t(
      "Kāds stils patīk?",
      "Какой стиль нравится?",
      "What’s their kind of lovely?",
    ),
    t(
      "Vai kādus ziedus izvairīties?",
      "Каких цветов избегать?",
      "Any flowers to leave out?",
    ),
    t(
      "Cik drīz vajadzīgi ziedi?",
      "Как скоро нужны цветы?",
      "When do you need that little smile?",
    ),
  ];
  const results = matchProducts(s, a);
  return (
    <div className="page">
      <Title
        kicker="FLOWER MATCH"
        title={t(
          "Pušķis, kas jūt līdzi.",
          "Букет, который понимает.",
          "A bouquet that gets them.",
        )}
        description={t(
          "Vienkāršs noteikumu algoritms: budžets, notikums, toņi un stils. Rezultāts nav mākslīgā intelekta vērtējums.",
          "Простой алгоритм правил: бюджет, повод, оттенки и стиль. Результат не является оценкой ИИ.",
          "A simple rule-based match: budget, occasion, shades and style. Scores are a transparent demo, not an AI assessment.",
        )}
      />
      <Demo />
      {!done ? (
        <div className="match-layout">
          <div className="match-image">
            <img
              src={img(s.catalog[0].photo, 1000)}
              alt={t(
                "Ziedu iedvesma",
                "Цветочное вдохновение",
                "Floral inspiration",
              )}
            />
            <div>
              <Flower2 size={35} />
              <h2>
                {t(
                  "Sāksim ar sajūtu.",
                  "Начнём с чувства.",
                  "Start with a feeling.",
                )}
              </h2>
            </div>
          </div>
          <div className="panel match-panel">
            <div className="wizard-progress" aria-label={`${step + 1}/7`}>
              {titles.map((x, i) => (
                <span key={x} className={i <= step ? "completed" : ""} />
              ))}
            </div>
            <span className="eyebrow">0{step + 1} / 07</span>
            <h2>{titles[step]}</h2>
            {step === 0 ? (
              <label>
                {t("Saņēmējs", "Получатель", "Recipient")}
                <select
                  value={a.recipient}
                  onChange={(e) => setA({ ...a, recipient: e.target.value })}
                >
                  {[
                    [
                      "someone",
                      t(
                        "Īpašs cilvēks",
                        "Особенный человек",
                        "Someone special",
                      ),
                    ],
                    ["family", t("Ģimene", "Семья", "Family")],
                    ["friend", t("Draugs", "Друг", "A friend")],
                    ["colleague", t("Kolēģis", "Коллега", "A colleague")],
                    ["self", t("Es pats", "Для себя", "Myself")],
                  ].map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ) : step === 1 ? (
              <div className="quiz-options">
                {occasions.map((o, i) => (
                  <button
                    key={i}
                    className={a.occasion === i ? "selected" : ""}
                    onClick={() => setA({ ...a, occasion: i })}
                  >
                    {pick(o, s.lang)}
                    {a.occasion === i && <Check size={17} />}
                  </button>
                ))}
              </div>
            ) : step === 2 ? (
              <label className="budget-control">
                <strong>{money(a.budget, s.lang)}</strong>
                <input
                  type="range"
                  min={10}
                  max={150}
                  step={5}
                  value={a.budget}
                  onChange={(e) =>
                    setA({ ...a, budget: Number(e.target.value) })
                  }
                />
                <span>€10 — €150</span>
              </label>
            ) : step === 3 ? (
              <div className="quiz-options">
                {[
                  t("Visi toņi", "Все оттенки", "Any lovely shade"),
                  ...colors.map((c) => pick(c, s.lang)),
                ].map((c, i) => (
                  <button
                    key={i}
                    className={a.color === i - 1 ? "selected" : ""}
                    onClick={() => setA({ ...a, color: i - 1 })}
                  >
                    {c}
                    {a.color === i - 1 && <Check size={17} />}
                  </button>
                ))}
              </div>
            ) : step === 4 ? (
              <div className="quiz-options">
                {(
                  [
                    [
                      "all",
                      t(
                        "Florista izvēle",
                        "Выбор флориста",
                        "Let the florist decide",
                      ),
                    ],
                    [
                      "mini",
                      t("Mazs un mīļš", "Маленький и милый", "Little & lovely"),
                    ],
                    [
                      "premium",
                      t(
                        "Iespaidīgs žests",
                        "Впечатляющий жест",
                        "A grand gesture",
                      ),
                    ],
                    [
                      "natural",
                      t(
                        "Dabisks un brīvs",
                        "Природный и свободный",
                        "Natural & gathered",
                      ),
                    ],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    className={a.style === v ? "selected" : ""}
                    onClick={() => setA({ ...a, style: v })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : step === 5 ? (
              <>
                <label>
                  {t(
                    "Nevēlamie ziedi (atdali ar komatiem)",
                    "Нежелательные цветы (через запятую)",
                    "Flowers to avoid (comma separated)",
                  )}
                  <input
                    value={a.avoid}
                    onChange={(e) => setA({ ...a, avoid: e.target.value })}
                    maxLength={100}
                    placeholder={t(
                      "Piemēram: rozes",
                      "Например: розы",
                      "For example: roses",
                    )}
                  />
                </label>
                <p>
                  {t(
                    "Tiek pārbaudīti kataloga sastāva nosaukumi visās trīs valodās. Šis nav alergēnu drošības filtrs.",
                    "Проверяются названия состава на трёх языках. Это не фильтр безопасности для аллергиков.",
                    "Matches composition names in all three languages. This is not an allergen safety filter.",
                  )}
                </p>
              </>
            ) : (
              <div className="quiz-options">
                <button
                  className={!a.immediate ? "selected" : ""}
                  onClick={() => setA({ ...a, immediate: false })}
                >
                  {t("Varu ieplānot", "Могу запланировать", "I can plan ahead")}
                  <CalendarDays size={20} />
                </button>
                <button
                  className={a.immediate ? "selected" : ""}
                  onClick={() => setA({ ...a, immediate: true })}
                >
                  {t(
                    "Demo saņemšana tagad",
                    "Демо-получение сейчас",
                    "Demo pickup now",
                  )}
                  <Clock3 size={20} />
                </button>
              </div>
            )}
            <div className="wizard-actions">
              <button
                className="text-link"
                disabled={step === 0}
                onClick={() => setStep(Math.max(0, step - 1))}
              >
                <ArrowLeft size={16} />
                {t("Atpakaļ", "Назад", "Back")}
              </button>
              <button
                className="btn"
                onClick={() => (step === 6 ? setDone(true) : setStep(step + 1))}
              >
                {step === 6
                  ? t(
                      "Atrast manus ziedus",
                      "Найти мои цветы",
                      "Find my flowers",
                    )
                  : t("Turpināt", "Продолжить", "Continue")}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="row-between result-heading">
            <div>
              <span className="eyebrow">
                {t(
                  "TAVA PERSONISKĀ IZLASE",
                  "ВАША ЛИЧНАЯ ПОДБОРКА",
                  "YOUR THOUGHTFUL LITTLE EDIT",
                )}
              </span>
              <h2>
                {t(
                  "Sajūta ir atrasta.",
                  "Чувство найдено.",
                  "That feels like them.",
                )}
              </h2>
            </div>
            <button
              className="btn outline"
              onClick={() => {
                setDone(false);
                setStep(0);
              }}
            >
              {t("Mainīt izvēles", "Изменить ответы", "Refine my choices")}
            </button>
          </div>
          {results.length ? (
            <div className="recommendation-grid">
              {results.map(({ product, score, reasons }) => (
                <div className="panel recommendation" key={product.id}>
                  <div className="match-score">
                    <Flower2 size={17} />
                    {score}%{" "}
                    {t("demo atbilstība", "демо-совпадение", "demo match")}
                  </div>
                  <ProductCard p={product} />
                  <ul>
                    {reasons.map((r) => (
                      <li key={r}>
                        <Check size={13} />
                        {pick(reasonLabels[r], s.lang)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              text={t(
                "Šīm izvēlēm nav piemērotu demo pušķu. Maini budžetu vai filtrus.",
                "Для этих условий нет демо-букетов. Измените бюджет или фильтры.",
                "No demo bouquets match these choices. Adjust your budget or filters.",
              )}
            />
          )}
          <details className="panel scoring">
            <summary>
              {t(
                "Kā rodas atbilstība?",
                "Как рассчитывается совпадение?",
                "How is the score calculated?",
              )}
            </summary>
            <p>
              {t(
                "50 punkti par iekļaušanos budžetā, 20 par notikumu, 15 par toņiem, 10 par stilu un 5 par tūlītēju demo saņemšanu. Norādītie nevēlamie ziedi tiek izslēgti. Saņēmēja tips netiek izmantots stereotipu veidošanai.",
                "50 баллов за бюджет, 20 за повод, 15 за оттенки, 10 за стиль и 5 за немедленное демо-получение. Указанные нежелательные цветы исключаются. Тип получателя не используется для стереотипных рекомендаций.",
                "50 points for budget, 20 for occasion, 15 for shades, 10 for style and 5 for immediate demo pickup. Stems you exclude are filtered out. Recipient type is not used to make stereotyped recommendations.",
              )}
            </p>
          </details>
          <Link className="btn outline" to="/compare">
            <GitCompareArrows size={16} />
            {t(
              "Salīdzināt izvēlētos",
              "Сравнить выбранные",
              "Compare selected bouquets",
            )}
          </Link>
        </>
      )}
    </div>
  );
}
function AvailableNow() {
  const { s } = useStore();
  const t = useT();
  const [sort, setSort] = useState("low");
  const [max, setMax] = useState(150);
  const [color, setColor] = useState("");
  const list = s.catalog
    .filter(
      (p) =>
        availability(s, p.id).immediate &&
        p.price <= max &&
        (color === "" || p.color === Number(color)),
    )
    .sort((a, b) => (sort === "low" ? a.price - b.price : b.price - a.price));
  return (
    <div className="page">
      <Title
        kicker={t(
          "NEGAIDI ĪPAŠU IEMESLU",
          "НЕ ЖДИТЕ ОСОБОГО ПОВОДА",
          "THE MOMENT IS NOW",
        )}
        title={t(
          "Ziedi, kas jau gaida.",
          "Цветы, которые уже ждут.",
          "A little lovely, ready now.",
        )}
        description={t(
          "Tikai pieejamie demo automāta nodalījumi. Rezervācijas un saņemšana uzreiz atjaunina šo sarakstu. Nav īstu krājumu datu.",
          "Только доступные демо-ячейки автомата. Бронирование и получение сразу обновляют список. Это не реальные остатки.",
          "Only available demo vending compartments. Reservations and pickup update this list immediately. This is not live inventory.",
        )}
      />
      <Demo />
      <div className="available-filters panel">
        <SlidersHorizontal size={20} />
        <label>
          {t("Cena līdz", "Цена до", "Budget up to")} {money(max, s.lang)}
          <input
            type="range"
            min={10}
            max={150}
            step={5}
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
          />
        </label>
        <label>
          {t("Krāsa", "Цвет", "Colour")}
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            <option value="">{t("Visas", "Все", "All")}</option>
            {colors.map((c, i) => (
              <option key={i} value={i}>
                {pick(c, s.lang)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Kārtot", "Сортировка", "Sort")}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="low">
              {t("Cena: augoši", "Цена: по возрастанию", "Price: low to high")}
            </option>
            <option value="high">
              {t("Cena: dilstoši", "Цена: по убыванию", "Price: high to low")}
            </option>
          </select>
        </label>
      </div>
      {list.length ? (
        <div className="recommendation-grid">
          {list.map((p) => (
            <div className="available-card" key={p.id}>
              <ProductCard p={p} />
              <div className="available-details">
                <AvailabilityBadge p={p} />
                <p>
                  {t("Nodalījums", "Ячейка", "Compartment")}{" "}
                  {availability(s, p.id)
                    .slots.map((c) =>
                      String(Number(c.id.split("-")[1]) + 1).padStart(2, "0"),
                    )
                    .join(", ")}{" "}
                  · 24/7
                </p>
                <Link
                  className="btn full"
                  to={`/vending?slot=${availability(s, p.id).slots[0].id}`}
                >
                  {t(
                    "Rezervēt un saņemt",
                    "Забронировать и получить",
                    "Reserve & collect",
                  )}
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          text={t(
            "Šobrīd nav atbilstošu demo nodalījumu. Atjauno krājumus admin skatā vai ieplāno saņemšanu.",
            "Сейчас нет подходящих демо-ячеек. Пополните запас в админ-панели или запланируйте получение.",
            "No matching demo compartments right now. Restock in the admin demo or plan a future pickup.",
          )}
        />
      )}
      <Link className="text-link" to="/reserve">
        {t(
          "Izvēlēties nākotnes datumu",
          "Выбрать будущую дату",
          "Plan a future moment",
        )}
        <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
function Comparison() {
  const { s, set } = useStore();
  const t = useT();
  const list = s.catalog.filter((p) => s.comparison.includes(p.id));
  return (
    <div className="page">
      <Title
        kicker={t(
          "DETAĻAS, KAS PALĪDZ IZVĒLĒTIES",
          "ДЕТАЛИ, КОТОРЫЕ ПОМОГАЮТ ВЫБРАТЬ",
          "THE LITTLE DETAILS THAT HELP YOU CHOOSE",
        )}
        title={t(
          "Kurš pasaka vairāk?",
          "Какой скажет больше?",
          "Which one feels just right?",
        )}
        description={t(
          "Salīdzini līdz trim pušķiem. Cenas un pieejamība ir demonstrācija.",
          "Сравните до трёх букетов. Цены и доступность — демонстрация.",
          "Compare up to three bouquets. Prices and availability are a demonstration.",
        )}
      >
        <button
          className="btn outline"
          disabled={!list.length}
          onClick={() => set((o) => ({ ...o, comparison: [] }))}
        >
          {t("Notīrīt", "Очистить", "Clear comparison")}
        </button>
      </Title>
      <Demo />
      {list.length ? (
        <div className="comparison-grid">
          {list.map((p) => (
            <article className="panel comparison-card" key={p.id}>
              <ProductCard p={p} />
              <dl>
                <div>
                  <dt>{t("Izmērs", "Размер", "Size")}</dt>
                  <dd>{p.size}</dd>
                </div>
                <div>
                  <dt>{t("Sastāvs", "Состав", "Stems")}</dt>
                  <dd>{pick(p.composition, s.lang)}</dd>
                </div>
                <div>
                  <dt>{t("Krāsa", "Цвет", "Colour")}</dt>
                  <dd>{pick(colors[p.color], s.lang)}</dd>
                </div>
                <div>
                  <dt>{t("Notikums", "Повод", "Occasion")}</dt>
                  <dd>{pick(occasions[p.occasion], s.lang)}</dd>
                </div>
                <div>
                  <dt>{t("Pieejamība", "Доступность", "Availability")}</dt>
                  <dd>
                    <AvailabilityBadge p={p} />
                  </dd>
                </div>
                <div>
                  <dt>{t("Saņemšana", "Получение", "Pickup")}</dt>
                  <dd>
                    {availability(s, p.id).immediate
                      ? methodLabel("vending", s.lang)
                      : methodLabel("pickup", s.lang)}
                  </dd>
                </div>
                <div>
                  <dt>{t("Pielāgošana", "Настройка", "Customization")}</dt>
                  <dd>
                    {p.customizable
                      ? t("Jā", "Да", "Yes")
                      : t(
                          "Dāvanu noformējums",
                          "Подарочное оформление",
                          "Gift finishing",
                        )}
                  </dd>
                </div>
              </dl>
              <p className="muted">{pick(p.care, s.lang)}</p>
              <Link className="text-link" to={`/passport/${p.id}`}>
                {t(
                  "Svaiguma un kopšanas pase",
                  "Паспорт свежести и ухода",
                  "Freshness & care passport",
                )}
                <ArrowUpRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          text={t(
            "Katalogā atzīmē līdz trim pušķiem salīdzināšanai",
            "Отметьте в каталоге до трёх букетов для сравнения",
            "Choose up to three bouquets in the catalog to compare",
          )}
        />
      )}
    </div>
  );
}
function BudgetBuilder() {
  const { s, add, toast } = useStore();
  const t = useT();
  const [budget, setBudget] = useState(60);
  const [delivery, setDelivery] = useState(false);
  const [extras, setExtras] = useState(true);
  const bundles = giftBundles(
    s.catalog.filter((p) => availability(s, p.id).quantity > 0),
    budget,
    delivery,
    extras,
  );
  return (
    <div className="page">
      <Title
        kicker={t(
          "MAZA CENA. LIELA DOMA.",
          "ВАЖНА НЕ ЦЕНА, А ЗАБОТА",
          "THOUGHTFUL, AT EVERY BUDGET",
        )}
        title={t(
          "Visa dāvana. Viens budžets.",
          "Весь подарок. Один бюджет.",
          "The whole gift. One little budget.",
        )}
        description={t(
          "Pušķis, kartīte, iesaiņojums un papildu dāvana — ar pārskatāmu kopsummu.",
          "Букет, открытка, упаковка и дополнение — с понятной общей суммой.",
          "A bouquet, a card, the wrapping and a thoughtful extra — with a total that makes sense.",
        )}
      />
      <Demo />
      <div className="budget-builder panel">
        <label className="budget-control">
          {t("Kopējais budžets (€)", "Общий бюджет (€)", "Total budget (€)")}
          <input
            type="number"
            min={15}
            max={250}
            step={1}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={delivery}
            onChange={(e) => setDelivery(e.target.checked)}
          />
          {t(
            "Iekļaut demo piegādi · €5",
            "Включить демо-доставку · €5",
            "Include demo delivery · €5",
          )}
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={extras}
            onChange={(e) => setExtras(e.target.checked)}
          />
          {t(
            "Salds papildinājums · €12",
            "Сладкое дополнение · €12",
            "A sweet little extra · €12",
          )}
        </label>
      </div>
      {bundles.length ? (
        <div className="recommendation-grid">
          {bundles.map((b) => (
            <div className="panel bundle-card" key={b.product.id}>
              <img
                src={img(b.product.photo)}
                alt={pick(b.product.name, s.lang)}
                loading="lazy"
              />
              <h2>{pick(b.product.name, s.lang)}</h2>
              <dl>
                {[
                  [t("Pušķis", "Букет", "Bouquet"), b.product.price],
                  [t("Kartīte", "Открытка", "Card"), b.card],
                  [t("Iesaiņojums", "Упаковка", "Wrapping"), 0],
                  [t("Papildu dāvana", "Дополнение", "Extra gift"), b.gift],
                  [t("Piegāde", "Доставка", "Delivery"), b.delivery],
                ].map(([label, v]) => (
                  <div key={String(label)}>
                    <dt>{label}</dt>
                    <dd>{money(Number(v), s.lang)}</dd>
                  </div>
                ))}
              </dl>
              <div className="summary-total">
                <span>{t("Kopā", "Итого", "Total")}</span>
                <b>{money(b.total, s.lang)}</b>
              </div>
              <p className="budget-remaining">
                {t(
                  "Budžetā paliek",
                  "Остаётся в бюджете",
                  "Room left in your budget",
                )}
                : {money(b.remaining, s.lang)}
              </p>
              <button
                className="btn full"
                onClick={() => {
                  if (
                    add(
                      b.product.id,
                      1,
                      t(
                        "Budžeta dāvanu komplekts",
                        "Подарочный набор по бюджету",
                        "Budget gift bundle",
                      ),
                      undefined,
                      {
                        size: "M",
                        color: b.product.color,
                        wrapping: "ivory",
                        card: true,
                        extraGift: extras,
                        method: delivery ? "delivery" : "pickup",
                      },
                    )
                  )
                    toast(
                      t(
                        "Dāvana pievienota. Piegāde aprēķināsies noformēšanā.",
                        "Подарок добавлен. Доставка будет учтена при оформлении.",
                        "Gift added. Delivery is included when you choose delivery at checkout.",
                      ),
                    );
                }}
              >
                <Gift size={16} />
                {t(
                  "Pievienot komplektu",
                  "Добавить набор",
                  "Add this little gift",
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          text={t(
            "Šim budžetam nav komplektu. Samazini papildinājumus vai palielini budžetu.",
            "Для этого бюджета нет наборов. Уберите дополнения или увеличьте бюджет.",
            "No bundles fit this budget. Remove extras or increase your budget.",
          )}
        />
      )}
    </div>
  );
}
