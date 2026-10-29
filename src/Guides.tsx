import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Gift,
  MapPin,
  CalendarDays,
  Truck,
  SlidersHorizontal,
} from "lucide-react";
import { guides } from "./guides";
import { img, pick } from "./data";
import { useStore } from "./store";
import { Demo, Title, useT } from "./ui";
import { PickupSteps, PickupSelection } from "./Pickup";
export function HowItWorks() {
  const t = useT();
  const [location, setLocation] = useState("dvp-vending-01");
  return (
    <div className="page how-page">
      <Title
        kicker="FLOWER PARADISE · SERVICE ATELIER"
        title={t(
          "No izvēles līdz sirsnīgam mirklim",
          "От выбора до тёплого момента",
          "From a thoughtful choice to a lovely moment",
        )}
        description={t(
          "Izpēti iecerēto pieredzi. Pakalpojumi vēl nav atklāti.",
          "Познакомьтесь с будущим сервисом. Услуги ещё не запущены.",
          "Explore the intended experience. Services have not launched yet.",
        )}
      />
      <Demo />
      <PickupSteps />
      <div className="how-grid">
        {[
          [
            <SlidersHorizontal key="s" />,
            t(
              "Izvēlies savā ritmā",
              "Выбирайте в своём ритме",
              "Discover at your own pace",
            ),
            t(
              "Salīdzini līdz trim produktiem vai izmēģini Flower Match. Filtrē pēc budžeta un saņemšanas veida.",
              "Сравните до трёх товаров или попробуйте Flower Match. Фильтруйте по бюджету и способу получения.",
              "Compare up to three products or try Flower Match. Filter by budget and collection method.",
            ),
            "/match",
          ],
          [
            <Gift key="g" />,
            t(
              "Pievieno personisku detaļu",
              "Добавьте личную деталь",
              "Make it personal",
            ),
            t(
              "Izvēlies iesaiņojumu, kartīti un vēstījumu. Opcijas un cena paliek grozā. Izgatavošana nav apsolīta.",
              "Выберите упаковку, открытку и послание. Опции и цена сохраняются в корзине. Изготовление не обещается.",
              "Choose wrapping, a card and a message. Options and prices stay in the bag. Manufacturing is not promised.",
            ),
            "/christmas-builder",
          ],
          [
            <CalendarDays key="c" />,
            t(
              "Ieplāno rezervāciju",
              "Запланируйте бронь",
              "Plan a reservation",
            ),
            t(
              "Izvēlies nākotnes datumu un laiku. Demo pārbauda konfliktus šajā pārlūkā; svētku priekšpasūtījumi izmanto to pašu loģiku.",
              "Выберите будущую дату и время. Демо проверяет конфликты в этом браузере; праздничные предзаказы используют общую логику.",
              "Choose a future date and time. The demo checks conflicts in this browser; holiday preorders use the same logic.",
            ),
            "/reserve?holiday=1",
          ],
          [
            <Truck key="t" />,
            t(
              "Saņemšana vai piegādes iecere",
              "Самовывоз или концепция доставки",
              "Collection or delivery concept",
            ),
            t(
              "Piegādes zonas, adreses un termiņi nav apstiprināti. Demo noformēšanā izvēlies tikai izdomātus datus.",
              "Зоны доставки, адреса и сроки не утверждены. При демо-оформлении используйте вымышленные данные.",
              "Delivery areas, addresses and times are unconfirmed. Use fictional information in demo checkout.",
            ),
            "/delivery",
          ],
        ].map(([icon, title, body, to]) => (
          <article className="panel" key={String(to)}>
            {icon}
            <h2>{title}</h2>
            <p>{body}</p>
            <Link className="text-link" to={String(to)}>
              {t("Izpētīt", "Подробнее", "Explore")}
              <ArrowUpRight size={16} />
            </Link>
          </article>
        ))}
      </div>
      <section className="pickup-story">
        <div>
          <MapPin />
          <h2>
            {t(
              "Vispirms — ērta saņemšana",
              "Сначала — удобное получение",
              "Collection comes first",
            )}
          </h2>
          <p>
            {t(
              "Daugavpils · Plānošanas posms. Adreses un koordinātas pievienosim pēc apstiprināšanas.",
              "Даугавпилс · Этап планирования. Адреса и координаты появятся после подтверждения.",
              "Daugavpils · Planning stage. Addresses and coordinates will be added once confirmed.",
            )}
          </p>
        </div>
        <PickupSelection value={location} onChange={setLocation} />
      </section>
      <div className="trust-links">
        <Link to="/faq">FAQ</Link>
        <Link to="/guides">
          {t(
            "Padomi un dāvanu ceļveži",
            "Советы и гиды по подаркам",
            "Care & gift guides",
          )}
        </Link>
        <Link to="/contact">
          {t(
            "Saziņa · vēl nav apstiprināta",
            "Контакты · ещё не подтверждены",
            "Contact · to be confirmed",
          )}
        </Link>
        <Link to="/terms">
          {t(
            "Demo noteikumi · juridiski jāpārskata",
            "Демо-условия · требуют юридической проверки",
            "Demo terms · legal review required",
          )}
        </Link>
      </div>
    </div>
  );
}
export default function Guides() {
  const { s } = useStore();
  const t = useT();
  const { id } = useParams();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const article = guides.find(
    (g) => g.id === id && !s.seasonal.discovery.hiddenArticles.includes(g.id),
  );
  const photo = (key: string) =>
    img(s.catalog.find((p) => p.id === key)?.photo || key);
  if (id)
    return (
      <div className="page guide-page">
        {article ? (
          <>
            <Link className="text-link" to="/guides">
              ← {t("Visi ceļveži", "Все статьи", "All guides")}
            </Link>
            <Title
              kicker="FLOWER PARADISE · JOURNAL"
              title={pick(article.title, s.lang)}
              description={pick(article.intro, s.lang)}
            />
            <img
              className="guide-cover"
              src={photo(article.photo)}
              alt={pick(article.title, s.lang)}
            />
            <div className="guide-body">
              <p className="eyebrow">
                {t(
                  "Flower Paradise redakcija · Oriģināls ceļvedis",
                  "Редакция Flower Paradise · Авторский материал",
                  "Flower Paradise editorial · Original guide",
                )}
              </p>
              {article.paragraphs.map((p, i) => (
                <p key={i}>{pick(p, s.lang)}</p>
              ))}
              {s.seasonal.discovery.articleNotes[id] && (
                <aside className="panel">
                  <h2>
                    {t("Studijas piezīme", "Заметка студии", "Studio note")}
                  </h2>
                  <p>{pick(s.seasonal.discovery.articleNotes[id], s.lang)}</p>
                </aside>
              )}
              {article.sources && (
                <div className="guide-sources">
                  <h2>
                    {t(
                      "Papildu informācija",
                      "Дополнительная информация",
                      "Further reading",
                    )}
                  </h2>
                  {article.sources.map((url) => (
                    <a href={url} key={url} target="_blank" rel="noreferrer">
                      {new URL(url).hostname} ↗
                    </a>
                  ))}
                </div>
              )}
              <Link className="btn" to={article.link}>
                {t(
                  "Izpētīt saistīto kolekciju",
                  "Открыть связанную коллекцию",
                  "Explore the related experience",
                )}
                <ArrowUpRight size={16} />
              </Link>
              <p className="muted">
                {t(
                  "Demo kolekcija · Nav reālu krājumu vai pasūtījumu",
                  "Демо-коллекция · Без реальных запасов и заказов",
                  "Demo collection · No real inventory or orders",
                )}
              </p>
            </div>
          </>
        ) : (
          <div className="empty">
            <h1>
              {t(
                "Ceļvedis nav pieejams",
                "Статья недоступна",
                "Guide unavailable",
              )}
            </h1>
            <Link className="btn" to="/guides">
              {t("Visi ceļveži", "Все статьи", "All guides")}
            </Link>
          </div>
        )}
      </div>
    );
  const list = guides.filter(
    (g) =>
      !s.seasonal.discovery.hiddenArticles.includes(g.id) &&
      (category === "all" || g.category === category) &&
      `${pick(g.title, s.lang)} ${pick(g.intro, s.lang)}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="page journal">
      <Title
        kicker="FLOWER PARADISE · JOURNAL"
        title={t(
          "Mazās detaļas. Skaistāki mirkļi.",
          "Маленькие детали. Красивые моменты.",
          "Small details. Lovely moments.",
        )}
        description={t(
          "Praktiska kopšana, dāvanu idejas un skaidri skaidrojumi pirms atklāšanas.",
          "Практический уход, идеи подарков и понятные объяснения до запуска.",
          "Practical care, considered gifts and clear explanations before launch.",
        )}
      />
      <div className="theme-tools">
        <label>
          <BookOpen size={18} />
          <input
            aria-label={t("Meklēt ceļvežus", "Поиск статей", "Search guides")}
            placeholder={t(
              "Atrodi padomu…",
              "Найти совет…",
              "Find a little guidance…",
            )}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="theme-categories">
        {[
          ["all", t("Visi", "Все", "All")],
          ["flowers", t("Ziedi", "Цветы", "Flowers")],
          ["christmas", t("Ziemassvētki", "Рождество", "Christmas")],
          ["service", t("Kā tas darbojas", "Как это работает", "How it works")],
        ].map(([key, label]) => (
          <button
            key={key}
            aria-pressed={category === key}
            className={category === key ? "selected" : ""}
            onClick={() => setCategory(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="guide-grid">
        {list.map((g) => (
          <Link className="guide-card" to={`/guides/${g.id}`} key={g.id}>
            <img
              src={photo(g.photo)}
              loading="lazy"
              alt={pick(g.title, s.lang)}
            />
            <div>
              <small>FLOWER PARADISE · JOURNAL</small>
              <h2>{pick(g.title, s.lang)}</h2>
              <p>{pick(g.intro, s.lang)}</p>
              <span className="text-link">
                {t("Lasīt ceļvedi", "Читать статью", "Read guide")}
                <ArrowUpRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!list.length && (
        <p role="status">
          {t(
            "Nekas nav atrasts. Maini meklēšanu.",
            "Ничего не найдено. Измените поиск.",
            "No guides found. Try another search.",
          )}
        </p>
      )}
    </div>
  );
}
