import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { pick, money, type Text } from "./data";
import type { DesignConfig, WrappingConfig } from "./commerce-model";
import {
  defaultDesign,
  defaultWrapping,
  wrappingPrice,
  designPrice,
  giftComponents,
} from "./commerce";
import { useStore } from "./store";
import { Demo, Title, useT } from "./ui";
export function useDraft(key: string, kind: DesignConfig["kind"]) {
  const { s, set } = useStore();
  const value = s.commerce.drafts[key] || defaultDesign(kind);
  return [
    value,
    (v: DesignConfig) =>
      set((o) => ({
        ...o,
        commerce: { ...o.commerce, drafts: { ...o.commerce.drafts, [key]: v } },
      })),
  ] as const;
}
export function CommercePage({
  title,
  children,
}: {
  title: Text;
  children: ReactNode;
}) {
  const { s } = useStore();
  const t = useT();
  return (
    <div className="page commerce-page">
      <Title
        kicker="FLOWER PARADISE · CHRISTMAS ATELIER"
        title={pick(title, s.lang)}
        description={t(
          "Ziemassvētki 2026 · Jaunais gads 2027 · Saglabāts tikai šajā pārlūkā",
          "Рождество 2026 · Новый год 2027 · Сохраняется только в этом браузере",
          "Christmas 2026 · New Year 2027 · Saved in this browser only",
        )}
      />
      <Demo />
      <nav
        className="commerce-links"
        aria-label={t(
          "Svētku rīki",
          "Праздничные инструменты",
          "Holiday tools",
        )}
      >
        {[
          ["/christmas-builder", t("Dāvanas", "Подарки", "Gifts")],
          ["/wrapping-studio", t("Iesaiņojums", "Упаковка", "Wrapping")],
          ["/wreath-builder", t("Vainagi", "Венки", "Wreaths")],
          ["/advent-builder", t("Kalendāri", "Календари", "Calendars")],
          [
            "/gift-finder",
            t("Dāvanu meklētājs", "Подбор подарков", "Gift finder"),
          ],
          [
            "/christmas-collections",
            t("Kolekcijas", "Коллекции", "Collections"),
          ],
          [
            "/christmas-preorders",
            t("Priekšpasūtījumi", "Предзаказы", "Preorders"),
          ],
          ["/wishlists", t("Vēlmju saraksti", "Списки желаний", "Wishlists")],
          ["/corporate-christmas", t("Uzņēmumiem", "Компаниям", "Corporate")],
        ].map(([to, label]) => (
          <Link key={to} to={to}>
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
export function Select({
  label,
  value,
  onChange,
  choices,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  choices: { id: string | number; label: string }[];
}) {
  return (
    <label>
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {choices.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Steps({
  labels,
  step,
  onChange,
}: {
  labels: string[];
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <ol className="commerce-stepper">
      {labels.map((l, i) => (
        <li key={i}>
          <button
            type="button"
            aria-current={i === step ? "step" : undefined}
            onClick={() => onChange(i)}
          >
            <b>{i + 1}</b>
            {l}
          </button>
        </li>
      ))}
    </ol>
  );
}
export function WrappingEditor({
  value,
  onChange,
}: {
  value?: WrappingConfig;
  onChange: (v: WrappingConfig | undefined) => void;
}) {
  const t = useT();
  const { s } = useStore();
  const w = value || defaultWrapping();
  const patch = (v: Partial<WrappingConfig>) => onChange({ ...w, ...v });
  return (
    <fieldset className="wrapping-editor">
      <legend>
        {t("Iesaiņošanas studija", "Студия упаковки", "Gift wrapping studio")}
      </legend>
      <label className="check-label">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) =>
            onChange(e.target.checked ? defaultWrapping() : undefined)
          }
        />
        {t(
          "Pievienot pielāgotu iepakojumu",
          "Добавить индивидуальную упаковку",
          "Add custom packaging",
        )}{" "}
        · {money(wrappingPrice(value), s.lang)}
      </label>
      {value && (
        <>
          <div className="form-grid">
            <Select
              label={t("Kastes izmērs", "Размер коробки", "Box size")}
              value={w.size}
              onChange={(v) => patch({ size: v as WrappingConfig["size"] })}
              choices={["small", "medium", "large"].map((id, i) => ({
                id,
                label: [
                  t("Mazs", "Маленький", "Small"),
                  t("Vidējs", "Средний", "Medium"),
                  t("Liels", "Большой", "Large"),
                ][i],
              }))}
            />
            <label>
              {t("Kastes krāsa", "Цвет коробки", "Box color")}
              <input
                type="color"
                value={w.color}
                onChange={(e) => patch({ color: e.target.value })}
              />
            </label>
            <Select
              label={t("Papīrs", "Бумага", "Wrapping paper")}
              value={w.paper}
              onChange={(v) => patch({ paper: v })}
              choices={[
                { id: "kraft", label: t("Krafts", "Крафт", "Kraft") },
                {
                  id: "ivory",
                  label: t("Ziloņkauls", "Слоновая кость", "Ivory"),
                },
                {
                  id: "snow",
                  label: t("Sniegpārslas", "Снежинки", "Snowflakes"),
                },
              ]}
            />
            <label>
              {t("Lentes krāsa", "Цвет ленты", "Ribbon color")}
              <input
                type="color"
                value={w.ribbon}
                onChange={(e) => patch({ ribbon: e.target.value })}
              />
            </label>
            <Select
              label={t("Lentes stils", "Стиль ленты", "Ribbon style")}
              value={w.ribbonStyle}
              onChange={(v) =>
                patch({ ribbonStyle: v as WrappingConfig["ribbonStyle"] })
              }
              choices={[
                { id: "satin", label: t("Satīns", "Атлас", "Satin") },
                { id: "velvet", label: t("Samts", "Бархат", "Velvet") },
                { id: "twine", label: t("Aukla", "Бечёвка", "Twine") },
              ]}
            />
          </div>
          {(
            [
              [
                "bow",
                t("Dekoratīvs pušķis", "Декоративный бант", "Decorative bow"),
              ],
              ["tag", t("Dāvanu birka", "Подарочная бирка", "Gift tag")],
              [
                "seal",
                t(
                  "Dekoratīvs zīmogs",
                  "Декоративная печать",
                  "Decorative seal",
                ),
              ],
              [
                "accessories",
                t(
                  "Sezonas aksesuāri",
                  "Сезонные аксессуары",
                  "Seasonal accessories",
                ),
              ],
            ] as const
          ).map(([k, l]) => (
            <label className="check-label" key={k}>
              <input
                type="checkbox"
                checked={w[k]}
                onChange={(e) => patch({ [k]: e.target.checked })}
              />
              {l}
            </label>
          ))}
          <label>
            {t("Saņēmēja vārds", "Имя получателя", "Recipient name")}
            <input
              maxLength={80}
              value={w.recipient}
              onChange={(e) => patch({ recipient: e.target.value })}
            />
          </label>
          <label>
            {t("Apsveikuma teksts", "Поздравление", "Greeting message")}
            <textarea
              maxLength={300}
              value={w.message}
              onChange={(e) => patch({ message: e.target.value })}
            />
          </label>
          <WrappingPreview value={w} />
          <p className="muted">
            {t(
              "Shematisks priekšskatījums. Nav precīzs izgatavotā produkta foto.",
              "Схематичный предпросмотр. Не является точным фото готового товара.",
              "Schematic preview, not a photograph of the exact manufactured item.",
            )}
          </p>
        </>
      )}
    </fieldset>
  );
}
export function WrappingPreview({ value: w }: { value: WrappingConfig }) {
  return (
    <div
      className={`wrapping-preview paper-${w.paper} size-${w.size}`}
      style={
        { background: w.color, "--ribbon": w.ribbon } as React.CSSProperties
      }
    >
      <div className="ribbon-horizontal" />
      <div className="ribbon-vertical" />
      {w.bow && <span className="wrapping-bow">⋈</span>}
      {w.tag && (
        <span className="wrapping-tag">{w.recipient || "Flower Paradise"}</span>
      )}
      {w.seal && <span className="wrapping-seal">FP</span>}
      {w.accessories && <span className="wrapping-accessory">✦ ❋ ✦</span>}
    </div>
  );
}

export function ConfigurationSummary({ value: c }: { value: DesignConfig }) {
  const { s } = useStore();
  const t = useT();
  return (
    <div className="configuration-summary">
      <p>
        {t(
          "Konfigurācijas papildinājumi",
          "Дополнения конфигурации",
          "Configuration additions",
        )}
        : {money(designPrice(c), s.lang)}
      </p>
      {c.extras.map((x, i) => {
        const component = giftComponents.find((g) => g.id === x.id);
        return component ? (
          <p key={`${x.id}-${i}`}>
            {pick(component.name, s.lang)} × {x.qty} ·{" "}
            {money(component.price * x.qty, s.lang)}
          </p>
        ) : null;
      })}
      {c.days && (
        <p>
          {t("Kalendāra saturs", "Содержимое календаря", "Calendar contents")}:{" "}
          {c.days.filter((d) => d.content).length}/24
        </p>
      )}
      {c.wrapping && (
        <p>
          {t("Iesaiņojums", "Упаковка", "Wrapping")}: {c.wrapping.size} ·{" "}
          {c.wrapping.paper} · {money(wrappingPrice(c.wrapping), s.lang)}
        </p>
      )}
    </div>
  );
}
