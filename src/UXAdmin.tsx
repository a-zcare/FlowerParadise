import { useState } from "react";
import { Link } from "react-router-dom";
import { themes, themeById } from "./themes";
import { useThemes } from "./Themes";
import { guides } from "./guides";
import { pickupLocations } from "./pickup";
import { pick, money, type Text } from "./data";
import { useStore } from "./store";
import { useT } from "./ui";
export default function UXAdmin() {
  const { s, set, toast } = useStore();
  const { apply } = useThemes();
  const t = useT();
  const [tab, setTab] = useState("styles");
  const [article, setArticle] = useState(guides[0].id);
  const d = s.seasonal.discovery;
  const notify = () =>
    toast(
      t(
        "Saglabāts tikai šajā pārlūkā",
        "Сохранено только в этом браузере",
        "Saved in this browser only",
      ),
    );
  function patch(v: Partial<typeof d>) {
    set((o) => ({
      ...o,
      seasonal: { ...o.seasonal, discovery: { ...o.seasonal.discovery, ...v } },
    }));
  }
  return (
    <div className="ux-admin">
      <div className="theme-categories">
        {[
          ["styles", t("Dizaini", "Темы", "Styles")],
          [
            "locations",
            t("Saņemšanas vietas", "Точки получения", "Pickup locations"),
          ],
          ["editorial", t("Ceļveži un FAQ", "Статьи и FAQ", "Guides & FAQ")],
          [
            "interest",
            t("Lokālā interese", "Локальный интерес", "Local interest"),
          ],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={tab === id}
            className={tab === id ? "selected" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="muted">
        {t(
          "Visi iestatījumi darbojas šajā pārlūkā. Tie nemaina vietni citiem apmeklētājiem.",
          "Все настройки действуют в этом браузере. Они не меняют сайт для других посетителей.",
          "All settings affect this browser only. They do not change the site for other visitors.",
        )}
      </p>
      {tab === "styles" ? (
        <div className="panel form-panel">
          <h2>
            {t(
              "Studijas noklusējuma dizains",
              "Стиль студии по умолчанию",
              "Studio default style",
            )}
          </h2>
          <label>
            {t(
              "Noklusējuma dizains šajā pārlūkā",
              "Стиль по умолчанию в этом браузере",
              "Default style in this browser",
            )}
            <select
              value={d.defaultTheme}
              onChange={(e) => {
                patch({ defaultTheme: e.target.value });
                notify();
              }}
            >
              {themes.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name}
                </option>
              ))}
            </select>
          </label>
          <p>{pick(themeById(d.defaultTheme).description, s.lang)}</p>
          <button
            className="btn"
            onClick={() => {
              apply(d.defaultTheme);
              notify();
            }}
          >
            {t(
              "Priekšskatīt noklusējuma dizainu",
              "Посмотреть стиль по умолчанию",
              "Preview default style",
            )}
          </button>
          <Link className="text-link" to="/themes">
            {t(
              "Atvērt dizainu galeriju",
              "Открыть галерею тем",
              "Open Theme Gallery",
            )}{" "}
            →
          </Link>
        </div>
      ) : tab === "locations" ? (
        <div className="how-grid">
          {pickupLocations.map((l) => (
            <div className="panel" key={l.id}>
              <small>PRE-LAUNCH · {l.id}</small>
              <h2>{pick(l.name, s.lang)}</h2>
              <p>{pick(l.accessHours, s.lang)}</p>
              <p>
                {t(
                  "Adrese un koordinātas nav apstiprinātas",
                  "Адрес и координаты не подтверждены",
                  "Address and coordinates unconfirmed",
                )}
              </p>
              {l.machineId && (
                <p>
                  {l.machineId} · {l.compartmentCount}{" "}
                  {t("demo nodalījumi", "демо-ячейки", "demo compartments")}
                </p>
              )}
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={d.unavailableLocations.includes(l.id)}
                  onChange={(e) => {
                    patch({
                      unavailableLocations: e.target.checked
                        ? [...d.unavailableLocations, l.id]
                        : d.unavailableLocations.filter((id) => id !== l.id),
                    });
                    notify();
                  }}
                />
                {t(
                  "Atzīmēt kā nepieejamu / apkopē demo",
                  "Отметить недоступным / на обслуживании в демо",
                  "Mark unavailable / under demo maintenance",
                )}
              </label>
              <Link
                className="text-link"
                to={
                  l.method === "vending" ? "/vending" : `/shop?location=${l.id}`
                }
              >
                {t("Priekšskatīt", "Предпросмотр", "Preview")} →
              </Link>
            </div>
          ))}
        </div>
      ) : tab === "editorial" ? (
        <div className="panel form-panel">
          <h2>
            {t("Redakcijas studija", "Редакционная студия", "Editorial studio")}
          </h2>
          <label>
            {t("Ceļvedis", "Статья", "Guide")}
            <select
              value={article}
              onChange={(e) => setArticle(e.target.value)}
            >
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {pick(g.title, s.lang)}
                </option>
              ))}
            </select>
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={!d.hiddenArticles.includes(article)}
              onChange={(e) =>
                patch({
                  hiddenArticles: e.target.checked
                    ? d.hiddenArticles.filter((id) => id !== article)
                    : [...d.hiddenArticles, article],
                })
              }
            />
            {t(
              "Redzams ceļvežu sadaļā",
              "Виден в разделе статей",
              "Visible in the journal",
            )}
          </label>
          <form
            key={article}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              patch({
                articleNotes: {
                  ...d.articleNotes,
                  [article]: ["lv", "ru", "en"].map((lang) =>
                    String(f.get(lang) || ""),
                  ) as Text,
                },
              });
              notify();
            }}
          >
            <h3>
              {t(
                "Pievienot studijas piezīmi",
                "Добавить заметку студии",
                "Add a studio note",
              )}
            </h3>
            {["lv", "ru", "en"].map((lang, i) => (
              <label key={lang}>
                {lang.toUpperCase()}
                <textarea
                  name={lang}
                  maxLength={2000}
                  required
                  defaultValue={d.articleNotes[article]?.[i] || ""}
                />
              </label>
            ))}
            <button className="btn">
              {t("Saglabāt piezīmi", "Сохранить заметку", "Save note")}
            </button>{" "}
            <Link className="text-link" to={`/guides/${article}`}>
              {t("Priekšskatīt rakstu", "Посмотреть статью", "Preview guide")} →
            </Link>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              patch({
                faqAnswer: ["lv", "ru", "en"].map((lang) =>
                  String(f.get(lang) || ""),
                ) as Text,
              });
              notify();
            }}
          >
            <h3>
              {t(
                "FAQ: Vai pakalpojums jau darbojas?",
                "FAQ: Сервис уже работает?",
                "FAQ: Is the service already operating?",
              )}
            </h3>
            {["lv", "ru", "en"].map((lang, i) => (
              <label key={lang}>
                {lang.toUpperCase()}
                <textarea
                  name={lang}
                  required
                  maxLength={2000}
                  defaultValue={
                    d.faqAnswer?.[i] ||
                    [
                      "Vēl ne. Šis ir pārlūka demo pirms atklāšanas.",
                      "Пока нет. Это браузерное демо до запуска.",
                      "Not yet. This is a browser demo before launch.",
                    ][i]
                  }
                />
              </label>
            ))}
            <button className="btn">
              {t("Saglabāt FAQ", "Сохранить FAQ", "Save FAQ")}
            </button>
          </form>
        </div>
      ) : (
        <div className="panel">
          <h2>
            {t(
              "Interese tikai šajā pārlūkā",
              "Интерес только в этом браузере",
              "Interest in this browser only",
            )}
          </h2>
          <div className="stats-grid">
            <div>
              <strong>{s.seasonal.interests.length}</strong>
              <p>
                {t(
                  "Izvēlēti produkti",
                  "Выбранные товары",
                  "Interested products",
                )}
              </p>
            </div>
            <div>
              <strong>
                {
                  s.seasonal.interests.filter((id) => id.startsWith("xm-"))
                    .length
                }
              </strong>
              <p>
                {t(
                  "Ziemassvētku dāvanas",
                  "Рождественские подарки",
                  "Christmas gifts",
                )}
              </p>
            </div>
            <div>
              <strong>{s.seasonal.launchInterest ? 1 : 0}</strong>
              <p>
                {t(
                  "Lokāla atklāšanas interese",
                  "Локальный интерес к запуску",
                  "Local launch interest",
                )}
              </p>
            </div>
          </div>
          <p>
            {t(
              "Uzņēmums šos datus nesaņem. Šis nav klientu pieprasījuma apkopojums.",
              "Компания не получает эти данные. Это не сводная статистика клиентов.",
              "The business does not receive these records. This is not aggregated customer demand.",
            )}
          </p>
          {s.seasonal.survey.completed && (
            <p>
              {t("Vēlamais budžets", "Желаемый бюджет", "Preferred budget")}: €
              {s.seasonal.survey.budget} ·{" "}
              {t(
                "Aptauja saglabāta lokāli",
                "Опрос сохранён локально",
                "Survey saved locally",
              )}
            </p>
          )}
          {s.seasonal.interests.map((id) => {
            const p = s.catalog.find((p) => p.id === id);
            return p ? (
              <p key={id}>
                {pick(p.name, s.lang)} · {money(p.price, s.lang)}
              </p>
            ) : null;
          })}
          <Link className="text-link" to="/launch">
            {t(
              "Atvērt pirmsatklāšanas aptauju",
              "Открыть опрос до запуска",
              "Open pre-launch survey",
            )}{" "}
            →
          </Link>
        </div>
      )}
    </div>
  );
}
