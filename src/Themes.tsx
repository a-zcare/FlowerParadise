import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { Check, Heart, Palette, RotateCcw, Search, X } from "lucide-react";
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
    root.dataset.themeTone = current.dark ? "dark" : "light";
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
          tone: current.dark ? "dark" : "light",
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
  const { state, apply } = useThemes();
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="theme-switcher icon-btn"
        aria-haspopup="dialog"
        aria-label={t(
          "Izvēlēties dizainu",
          "Выбрать дизайн",
          "Choose visual theme",
        )}
        onClick={() => setOpen(true)}
      >
        <Palette size={19} />
        <span>{themeById(state.current).name.split(" /")[0]}</span>
      </button>
      {open && (
        <Modal
          title={t(
            "Tava dizaina noskaņa",
            "Ваше настроение дизайна",
            "Your design mood",
          )}
          close={() => setOpen(false)}
        >
          <p className="muted">
            {t(
              "Dizains mainās uzreiz. Grozs un valoda saglabājas.",
              "Дизайн меняется мгновенно. Корзина и язык сохраняются.",
              "Instant visual changes. Your bag and language stay with you.",
            )}
          </p>
          <div className="theme-picker">
            {themes.map((th) => (
              <button
                key={th.id}
                className={th.id === state.current ? "selected" : ""}
                aria-pressed={th.id === state.current}
                onClick={() => {
                  apply(th.id);
                  setOpen(false);
                }}
              >
                <Swatches theme={th} />
                <span>{th.name}</span>
                {th.id === state.current && <Check size={17} />}
              </button>
            ))}
          </div>
          <div className="row-between">
            <button
              className="text-link"
              onClick={() => {
                apply("original");
                setOpen(false);
              }}
            >
              <RotateCcw size={15} />
              {t("Sākotnējais dizains", "Исходный дизайн", "Reset to Original")}
            </button>
            <Link className="btn" to="/themes" onClick={() => setOpen(false)}>
              {t("Dizainu galerija", "Галерея тем", "Theme Gallery")}
            </Link>
          </div>
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
export default function ThemeGallery() {
  const t = useT();
  const { s } = useStore();
  const { state, apply, favorite } = useThemes();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [compared, setCompared] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
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
    <div className="page theme-gallery">
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
        <button className="btn outline" onClick={() => apply("original")}>
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
                  onClick={() => apply(th.id)}
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
              </div>
            </div>
          </article>
        ))}
      </div>
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
          <div className="theme-compare-grid">
            {compared.map((id) => {
              const th = themeById(id);
              return (
                <section key={id}>
                  <h3>{th.name}</h3>
                  <ThemeSample theme={th} full />
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
