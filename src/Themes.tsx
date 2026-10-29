import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronDown,
  Heart,
  Palette,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { themes, themeById, themeTokens } from "./themes";
import type { VisualTheme } from "./themes";
import { img, pick, money } from "./data";
import { useStore } from "./store";
import { useT } from "./i18n";
import { Modal, Title } from "./ui";
const KEY = "flower-paradise-visual-v1";
interface ThemeState {
  current: string;
  favorites: string[];
  recent: string[];
}
function load(): ThemeState {
  try {
    const x = JSON.parse(localStorage.getItem(KEY) || "{}");
    return {
      current: themeById(x.current).id,
      favorites: Array.isArray(x.favorites)
        ? x.favorites.filter((id: string) => themes.some((t) => t.id === id))
        : [],
      recent: Array.isArray(x.recent)
        ? x.recent
            .filter((id: string) => themes.some((t) => t.id === id))
            .slice(0, 5)
        : [],
    };
  } catch {
    return { current: "original", favorites: [], recent: [] };
  }
}
const ThemeContext = createContext<{
  state: ThemeState;
  apply: (id: string) => void;
  favorite: (id: string) => void;
}>({ state: load(), apply: () => {}, favorite: () => {} });
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { s } = useStore();
  const [state, setState] = useState(load);
  const current = themeById(state.current);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.visualTheme = current.id;
    root.dataset.themeDetail = current.detail;
    root.dataset.themeTone = current.dark || s.dark ? "dark" : "light";
    for (const [k, v] of Object.entries(themeTokens(current, s.dark)))
      root.style.setProperty(k, String(v));
    root.style.colorScheme = current.dark || s.dark ? "dark" : "light";
  }, [current, s.dark]);
  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          ...state,
          tokens: themeTokens(current, s.dark),
          detail: current.detail,
          tone: current.dark || s.dark ? "dark" : "light",
          dark: s.dark,
        }),
      );
    } catch {
      /* Usable without persistence. */
    }
  }, [state, current, s.dark]);
  return (
    <ThemeContext.Provider
      value={{
        state,
        apply: (id) =>
          setState((o) => ({
            ...o,
            current: themeById(id).id,
            recent: [id, ...o.recent.filter((x) => x !== id)].slice(0, 5),
          })),
        favorite: (id) =>
          setState((o) => ({
            ...o,
            favorites: o.favorites.includes(id)
              ? o.favorites.filter((x) => x !== id)
              : [...o.favorites, id],
          })),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
export const useThemes = () => useContext(ThemeContext);
function Swatches({ theme }: { theme: VisualTheme }) {
  return (
    <span className="theme-swatches" aria-label={theme.colors.join(", ")}>
      {theme.colors.map((c) => (
        <i key={c} style={{ background: c }} />
      ))}
    </span>
  );
}
export function ThemeSwitcher() {
  const { state } = useThemes();
  const t = useT();
  const [open, setOpen] = useState(false);
  const theme = themeById(state.current);
  return (
    <>
      <button
        className="theme-switcher icon-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        title={t(
          "Izvēlies vietnes dizainu",
          "Выберите стиль сайта",
          "Choose your website style",
        )}
        aria-label={t(
          "Izvēlēties dizainu",
          "Выбрать дизайн",
          "Choose visual theme",
        )}
        onClick={() => setOpen(true)}
      >
        <Palette size={19} />
        <span className="theme-control-label">
          {t("Stili", "Стили", "Styles")} <b>· {theme.name.split(" /")[0]}</b>
        </span>
        <Swatches theme={theme} />
        <ChevronDown size={14} className="theme-chevron" />
      </button>
      {open && (
        <Modal
          title={t(
            "Izvēlies savas vietnes stilu",
            "Выберите стиль сайта",
            "Choose your website style",
          )}
          close={() => setOpen(false)}
        >
          <ThemeGallery compact onApply={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}
function ThemeSample({
  theme,
  full = false,
}: {
  theme: VisualTheme;
  full?: boolean;
}) {
  const t = useT();
  const { s } = useStore();
  return (
    <div
      className={`theme-sample detail-${theme.detail}`}
      style={themeTokens(theme)}
    >
      <div className="sample-header">
        <span>FLOWER PARADISE</span>
        <Palette size={14} />
      </div>
      <div className="sample-hero">
        <small>FLOWERS. FEELINGS. ALWAYS.</small>
        <h3>
          {t(
            "Skaistums tavā ritmā.",
            "Красота в вашем ритме.",
            "Beauty, in your own rhythm.",
          )}
        </h3>
        <button tabIndex={-1} className="sample-button">
          {t("Atklāj kolekciju", "Открыть коллекцию", "Explore the collection")}
        </button>
      </div>
      <div className="sample-product">
        <img
          src={img("1680563899402-26c3a712831f")}
          alt={t("Rozā pušķis", "Розовый букет", "Blush bouquet")}
          loading="lazy"
        />
        <div>
          <small>
            {t("FLORISTA IZLASE", "ВЫБОР ФЛОРИСТА", "FLORIST’S EDIT")}
          </small>
          <h4>{t("Rozā sapnis", "Розовая мечта", "Blush reverie")}</h4>
          <span>{money(32, s.lang)}</span>
        </div>
      </div>
      {full && (
        <>
          <label>
            {t("Dāvanas ziņa", "Послание", "Gift message")}
            <input
              readOnly
              value={t(
                "Tev, ar mīlestību",
                "Тебе, с любовью",
                "For you, with love",
              )}
              tabIndex={-1}
            />
          </label>
          <div className="sample-summary">
            <span>{t("Groza kopsumma", "Итого в корзине", "Bag total")}</span>
            <strong>{money(32, s.lang)}</strong>
          </div>
          <div className="sample-dashboard">
            <small>{t("MANS PROFILS", "МОЙ КАБИНЕТ", "MY DASHBOARD")}</small>
            <h4>
              {t("Nākamais mirklis", "Следующий момент", "Your next moment")}
            </h4>
            <span>
              25.12.2026 · {t("Dāvanu plāns", "План подарков", "Gift plan")}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
export default function ThemeGallery({
  compact = false,
  onApply,
}: {
  compact?: boolean;
  onApply?: () => void;
}) {
  const t = useT();
  const { s } = useStore();
  const { state, apply, favorite } = useThemes();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [compared, setCompared] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [viewport, setViewport] = useState<1440 | 390>(1440);
  const cats = [
    ["all", t("Visi", "Все", "All")],
    ["floral", t("Romantiski", "Романтика", "Floral")],
    ["botanical", t("Dabiski", "Природа", "Botanical")],
    ["minimal", t("Minimāli", "Минимализм", "Minimal")],
    ["luxury", t("Grezni", "Роскошь", "Luxury")],
    ["colourful", t("Krāsaini", "Яркие", "Colourful")],
    ["favorites", t("Iecienītie", "Избранные", "Favorites")],
    ["recent", t("Nesenie", "Недавние", "Recent")],
  ];
  const list = themes.filter(
    (th) =>
      (category === "all" ||
        th.category === category ||
        (category === "favorites" && state.favorites.includes(th.id)) ||
        (category === "recent" && state.recent.includes(th.id))) &&
      `${th.name} ${pick(th.description, s.lang)}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <div
      className={compact ? "theme-gallery theme-panel" : "page theme-gallery"}
    >
      {!compact && (
        <Title
          kicker="FLOWER PARADISE · DESIGN ATELIER"
          title={t(
            "Viena paradīze. Tavs noskaņojums.",
            "Один Paradise. Ваше настроение.",
            "One paradise. Your kind of beautiful.",
          )}
          description={t(
            "15 dizaini vienam veikalam. Salīdzini vienādu saturu, izvēlies savu un turpini iepirkties.",
            "15 дизайнов одного магазина. Сравните одинаковое содержимое и выберите свой.",
            "15 distinct designs for one boutique. Compare identical content, choose a mood and keep exploring.",
          )}
        />
      )}
      {compact && (
        <p className="muted">
          {t(
            "Dizains mainās uzreiz. Grozs un valoda saglabājas.",
            "Дизайн меняется мгновенно. Корзина и язык сохраняются.",
            "Instant style changes. Your page, bag and language stay with you.",
          )}
        </p>
      )}
      <div className="theme-tools">
        <label>
          <Search size={17} />
          <input
            aria-label={t("Meklēt dizainus", "Поиск тем", "Search themes")}
            placeholder={t("Meklēt dizainu…", "Найти тему…", "Find your mood…")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <button
          className="btn outline"
          onClick={() => {
            apply("original");
            onApply?.();
          }}
        >
          <RotateCcw size={16} />
          {t("Sākotnējais", "Исходный", "Reset to Original")}
        </button>
      </div>
      <div className="theme-categories">
        {cats.map(([id, label]) => (
          <button
            key={id}
            aria-pressed={category === id}
            className={category === id ? "selected" : ""}
            onClick={() => setCategory(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {compared.length > 0 && (
        <div className="theme-compare-bar">
          <span>
            {compared.length}/3{" "}
            {t("salīdzināšanai", "для сравнения", "to compare")}
          </span>
          <button
            className="btn"
            disabled={compared.length < 2}
            onClick={() => setCompareOpen(true)}
          >
            {t("Salīdzināt dizainus", "Сравнить темы", "Compare themes")}
          </button>
          <button
            aria-label={t(
              "Notīrīt izvēli",
              "Очистить выбор",
              "Clear selection",
            )}
            onClick={() => setCompared([])}
          >
            <X size={19} />
          </button>
        </div>
      )}
      <div className="theme-grid">
        {list.map((th) => (
          <article className="theme-card" key={th.id}>
            <ThemeSample theme={th} />
            <div className="theme-card-copy">
              <div className="row-between">
                <h2>{th.name}</h2>
                <button
                  className="icon-btn"
                  aria-label={`${t("Iecienīts dizains", "Избранная тема", "Favorite theme")}: ${th.name}`}
                  aria-pressed={state.favorites.includes(th.id)}
                  onClick={() => favorite(th.id)}
                >
                  <Heart
                    size={18}
                    fill={
                      state.favorites.includes(th.id) ? "currentColor" : "none"
                    }
                  />
                </button>
              </div>
              <Swatches theme={th} />
              <p>{pick(th.description, s.lang)}</p>
              <div className="row-between">
                <button
                  className="btn"
                  aria-pressed={state.current === th.id}
                  aria-label={
                    compact
                      ? `${th.name} · ${t("Lietot dizainu", "Применить", "Apply Theme")}`
                      : undefined
                  }
                  onClick={() => {
                    apply(th.id);
                    onApply?.();
                  }}
                >
                  {state.current === th.id ? (
                    <Check size={16} />
                  ) : (
                    <Palette size={16} />
                  )}{" "}
                  {state.current === th.id
                    ? t("Izvēlēts", "Выбрано", "Applied")
                    : t("Lietot dizainu", "Применить", "Apply Theme")}
                </button>
                {!compact && (
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={compared.includes(th.id)}
                      disabled={
                        compared.length === 3 && !compared.includes(th.id)
                      }
                      onChange={() =>
                        setCompared((o) =>
                          o.includes(th.id)
                            ? o.filter((x) => x !== th.id)
                            : [...o, th.id],
                        )
                      }
                    />
                    {t("Salīdzināt", "Сравнить", "Compare")}
                  </label>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      {compact && (
        <Link className="btn outline full" to="/themes" onClick={onApply}>
          {t(
            "Atvērt galeriju un salīdzināt",
            "Галерея и сравнение тем",
            "Open gallery & compare themes",
          )}
        </Link>
      )}
      {list.length === 0 && (
        <div className="empty">
          <Search />
          <p>
            {t(
              "Nekas nav atrasts.",
              "Ничего не найдено.",
              "No themes match your search.",
            )}
          </p>
          <button
            className="btn"
            onClick={() => {
              setCategory("all");
              setQ("");
            }}
          >
            {t("Rādīt visus", "Показать все", "Show all themes")}
          </button>
        </div>
      )}
      {compareOpen && (
        <Modal
          title={t(
            "Vienāds saturs. Dažādas sajūtas.",
            "Одно содержимое. Разные ощущения.",
            "Same content. Different feeling.",
          )}
          close={() => setCompareOpen(false)}
        >
          <div
            className="preview-toolbar"
            role="group"
            aria-label={t(
              "Priekšskatījuma izmērs",
              "Размер предпросмотра",
              "Preview viewport",
            )}
          >
            {[1440, 390].map((v) => (
              <button
                key={v}
                className="btn outline"
                aria-pressed={viewport === v}
                onClick={() => setViewport(v as 1440 | 390)}
              >
                {v === 1440
                  ? t("Dators", "Компьютер", "Desktop")
                  : t("Tālrunis", "Телефон", "Mobile")}{" "}
                · {v}px
              </button>
            ))}
            <span className="muted">
              {t(
                "Mērogoti dzīvi komponenti",
                "Масштабируемые живые компоненты",
                "Scaled live components",
              )}
            </span>
          </div>
          <div className="theme-compare-grid">
            {compared.map((id) => {
              const th = themeById(id);
              return (
                <section key={id}>
                  <h3>{th.name}</h3>
                  <ResponsiveThemePreview theme={th} viewport={viewport} />
                  <button className="btn" onClick={() => apply(id)}>
                    {t("Lietot dizainu", "Применить тему", "Apply Theme")}
                  </button>
                </section>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}

function ResponsiveThemePreview({
  theme,
  viewport,
}: {
  theme: VisualTheme;
  viewport: 1440 | 390;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);
  const t = useT();
  const { s } = useStore();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width),
    );
    r.observe(el);
    return () => r.disconnect();
  }, []);
  const scale = Math.min(1, width / viewport);
  const mobile = viewport === 390;
  return (
    <div
      ref={ref}
      className="responsive-theme-preview"
      style={{ height: (mobile ? 1590 : 1090) * scale }}
    >
      <div
        className={`live-theme-preview detail-${theme.detail} ${mobile ? "mobile-preview" : ""}`}
        style={{
          ...themeTokens(theme),
          width: viewport,
          transform: `scale(${scale})`,
        }}
      >
        <div className="live-header">
          <strong>❋ FLOWER PARADISE</strong>
          <span>
            {t(
              "Ziemassvētki · Ziedi · Saņemšana",
              "Рождество · Цветы · Получение",
              "Christmas · Flowers · Pickup",
            )}
          </span>
          <Palette />
        </div>
        <div className="live-hero">
          <div>
            <small>CHRISTMAS 2026 · NEW YEAR 2027</small>
            <h3>
              {t(
                "Mazliet brīnuma. No sirds.",
                "Немного чуда. От всего сердца.",
                "A little wonder. From the heart.",
              )}
            </h3>
            <p>
              {t(
                "Pārdomātas dāvanas un ziedi katram mirklim.",
                "Продуманные подарки и цветы для тёплых моментов.",
                "Thoughtful gifts and flowers for the moments that matter.",
              )}
            </p>
            <span className="sample-button">
              {t("Atklāt kolekciju", "Открыть коллекцию", "Explore collection")}
            </span>
            <span className="sample-button secondary">
              {t("Kā tas darbojas", "Как это работает", "How it works")}
            </span>
          </div>
          <img
            src={`${import.meta.env.BASE_URL}seasonal/christmas-hero-small.webp`}
            alt=""
          />
        </div>
        <div className="live-search">
          ⌕ <span>{t("Meklēt dāvanu…", "Найти подарок…", "Find a gift…")}</span>
          <span>
            {t(
              "Kategorija · Cena · Saņemšana",
              "Категория · Цена · Получение",
              "Category · Price · Pickup",
            )}
          </span>
        </div>
        <div className="live-content">
          <div className="live-products">
            {[s.catalog.find((p) => p.id === "xm-001")!, s.catalog[0]].map(
              (p) => (
                <div className="live-product" key={p.id}>
                  <img src={img(p.photo)} alt="" loading="lazy" />
                  <small>
                    {p.seasonal ? "CHRISTMAS 2026" : "FLOWER ATELIER"} · DEMO
                  </small>
                  <h4>{pick(p.name, s.lang)}</h4>
                  <b>{money(p.price, s.lang)}</b>
                  <span className="sample-button">
                    {t("Pievienot", "В корзину", "Add to bag")}
                  </span>
                </div>
              ),
            )}
          </div>
          <div className="live-detail">
            <h4>
              {t(
                "Detaļas, kas nozīmē vairāk",
                "Детали со смыслом",
                "Details that mean more",
              )}
            </h4>
            <p>
              {t(
                "Samta lente · Dāvanu iesaiņojums · Personalizācija",
                "Бархатная лента · Подарочная упаковка · Персонализация",
                "Velvet ribbon · Gift wrapping · Personalization",
              )}
            </p>
            <label>
              {t("Dāvanas ziņa", "Послание", "Gift message")}
              <input
                readOnly
                value={t(
                  "Tev, ar mīlestību",
                  "Тебе, с любовью",
                  "For you, with love",
                )}
                tabIndex={-1}
              />
            </label>
            <div className="sample-summary">
              <span>
                {t(
                  "Grozs · 2 produkti",
                  "Корзина · 2 товара",
                  "Bag · 2 products",
                )}
              </span>
              <b>{money(65, s.lang)}</b>
            </div>
            <div className="sample-dashboard">
              <small>{t("MANS PROFILS", "МОЙ КАБИНЕТ", "MY DASHBOARD")}</small>
              <h4>
                {t("Nākamā dāvana", "Следующий подарок", "Your next gift")}
              </h4>
              <span>
                25.12.2026 · {t("Plānots", "Запланировано", "Planned")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
