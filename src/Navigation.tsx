import { ChevronDown, ArrowUpRight } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { categories, pick, img } from "./data";
import { useStore } from "./store";
import { useT } from "./ui";
export default function Navigation() {
  const t = useT();
  const { s } = useStore();
  return (
    <>
      <NavLink to="/christmas">
        {t(
          "Ziemassvētki un Jaunais gads",
          "Рождество и Новый год",
          "Christmas & New Year",
        )}
      </NavLink>
      <details
        className="nav-disclosure"
        name="boutique-navigation"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.currentTarget.open = false;
            e.currentTarget.querySelector("summary")?.focus();
          }
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a"))
            e.currentTarget.open = false;
        }}
      >
        <summary>
          {t("Svētku dekori", "Праздничный декор", "Christmas decorations")}
          <ChevronDown size={12} />
        </summary>
        <div className="nav-mega">
          <div>
            <img
              className="mega-feature-image"
              src={`${import.meta.env.BASE_URL}seasonal/christmas-hero-small.webp`}
              alt=""
            />
            <small>CHRISTMAS ATELIER · 2026</small>
            <h2>
              {t(
                "Radīts svētku sajūtai",
                "Для праздничного настроения",
                "Made for a little wonder",
              )}
            </h2>
            <p>
              {t(
                "Skujas, dabiskas faktūras un pārdomātas detaļas. Koncepta kolekcija.",
                "Хвоя, природные фактуры и продуманные детали. Концептуальная коллекция.",
                "Evergreens, natural textures and considered details. A concept collection.",
              )}
            </p>
            <Link className="text-link" to="/christmas">
              {t("Visa kolekcija", "Вся коллекция", "View collection")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="nav-collections">
            {categories.slice(12, 20).map((cat, i) => (
              <Link to={`/christmas?category=${i + 12}`} key={i}>
                <img
                  src={img(s.catalog.find((p) => p.category === i + 12)!.photo)}
                  alt=""
                  loading="lazy"
                />
                {pick(cat, s.lang)}
              </Link>
            ))}
            {[15, 25, 50].map((n) => (
              <Link key={n} to={`/christmas?max=${n}`}>
                {t("Līdz", "До", "Under")} €{n}
              </Link>
            ))}
            <Link to="/last-minute">
              {t("Ātrās dāvanas", "Быстрые подарки", "Last-minute gifts")}
            </Link>
            <Link to="/advent">
              {t("Adventes kalendārs", "Адвент-календарь", "Advent calendar")}
            </Link>
          </div>
        </div>
      </details>
      <details
        className="nav-disclosure"
        name="boutique-navigation"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.currentTarget.open = false;
            e.currentTarget.querySelector("summary")?.focus();
          }
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a"))
            e.currentTarget.open = false;
        }}
      >
        <summary>
          {t("Dāvanas", "Подарки", "Gifts")}
          <ChevronDown size={12} />
        </summary>
        <div className="nav-gifts">
          {[
            [
              "/gift-studio",
              t(
                "Ziemassvētku dāvanu konstruktors",
                "Конструктор рождественских подарков",
                "Christmas gift builder",
              ),
            ],
            [
              "/wreath-builder",
              t("Vainaga konstruktors", "Конструктор венка", "Wreath builder"),
            ],
            [
              "/advent-builder",
              t(
                "Adventes kalendāra konstruktors",
                "Конструктор адвент-календаря",
                "Advent calendar builder",
              ),
            ],
            [
              "/wrapping-studio",
              t("Iesaiņošanas studija", "Студия упаковки", "Wrapping Studio"),
            ],
            [
              "/gift-finder",
              t("Dāvanu meklētājs", "Подбор подарков", "Gift Finder"),
            ],
            [
              "/christmas-collections",
              t(
                "Svētku kolekcijas",
                "Праздничные коллекции",
                "Christmas Collections",
              ),
            ],
            [
              "/corporate-christmas",
              t("Uzņēmumiem", "Компаниям", "Corporate Christmas"),
            ],
            ["/wishlists", t("Vēlmju saraksti", "Списки желаний", "Wishlists")],
            [
              "/gifts",
              t(
                "Dāvanu kolekcijas",
                "Подарочные коллекции",
                "Gift collections",
              ),
            ],
            [
              "/secret-gift",
              t("Slepenā dāvana", "Тайный подарок", "Secret gift"),
            ],
            [
              "/certificates",
              t("Dāvanu kartes", "Подарочные сертификаты", "Gift certificates"),
            ],
            ["/guides", t("Dāvanu ceļveži", "Гиды по подаркам", "Gift guides")],
          ].map(([url, label]) => (
            <Link key={url} to={url}>
              {label}
              <ArrowUpRight size={14} />
            </Link>
          ))}
        </div>
      </details>
      <NavLink to="/shop">{t("Ziedi", "Цветы", "Flowers")}</NavLink>
      <NavLink to="/available">
        {t("Pieejams tagad", "Доступно сейчас", "Available now")}
        <small className="nav-demo">DEMO</small>
      </NavLink>
      <NavLink to="/vending">
        {t("Ziedi 24/7", "Цветы 24/7", "Flowers 24/7")}
      </NavLink>
      <NavLink to="/how-it-works">
        {t("Kā tas darbojas", "Как это работает", "How it works")}
      </NavLink>
    </>
  );
}
