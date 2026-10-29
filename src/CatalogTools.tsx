import { useState } from "react";
import { categories, pick, money } from "./data";
import { round } from "./domain";
import { parseCatalogEdits } from "./catalog-admin";
import type { CatalogEdit } from "./catalog-admin";
import { useStore } from "./store";
import { useT } from "./ui";
export default function CatalogTools() {
  const { s, set } = useStore();
  const t = useT();
  const [category, setCategory] = useState("");
  const [percent, setPercent] = useState(0);
  const [json, setJson] = useState("");
  const [preview, setPreview] = useState<CatalogEdit[]>([]);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const selected = s.catalog.filter(
    (p) => !category || p.category === Number(category),
  );
  function prepare() {
    try {
      setPreview(parseCatalogEdits(json, s.catalog));
      setError(false);
      setSaved(false);
    } catch {
      setError(true);
      setPreview([]);
    }
  }
  function apply() {
    set((o) => ({
      ...o,
      catalog: o.catalog.map((p) => {
        const edit = preview.find((x) => x.id === p.id);
        return edit ? { ...p, name: edit.name, price: edit.price } : p;
      }),
    }));
    setPreview([]);
    setSaved(true);
  }
  function exportJson() {
    const content = JSON.stringify(
      selected.map(({ id, name, price }) => ({ id, name, price })),
      null,
      2,
    );
    setJson(content);
    setPreview([]);
    setError(false);
    const url = URL.createObjectURL(
      new Blob([content], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "flower-paradise-catalog.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="panel form-panel">
      <h2>
        {t("Kataloga darbnīca", "Мастерская каталога", "Catalog workshop")}
      </h2>
      <p className="muted">
        {t(
          "Cenu un nosaukumu izmaiņas darbojas tikai šajā pārlūkā. Importē tikai zināmus ID; atlikumi tiek pārvaldīti krājumu sadaļā.",
          "Изменения цен и названий действуют только в этом браузере. Импорт поддерживает известные ID; остатки меняются в разделе склада.",
          "Price and name changes affect this browser only. Import accepts known IDs; stock is managed in the inventory section.",
        )}
      </p>
      <label>
        {t("Kolekcija", "Коллекция", "Collection")}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPreview([]);
          }}
        >
          <option value="">
            {t("Visi produkti", "Все товары", "All products")}
          </option>
          {categories.map((c, i) => (
            <option key={i} value={i}>
              {pick(c, s.lang)}
            </option>
          ))}
        </select>
      </label>
      <div className="atelier-links">
        <button className="btn outline" onClick={exportJson}>
          {t("Eksportēt JSON", "Экспортировать JSON", "Export JSON")} ·{" "}
          {selected.length}
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(false);
          setError(false);
          setPreview(
            selected.map(({ id, name, price }) => ({
              id,
              name,
              price: Math.min(
                500,
                Math.max(1, round(price * (1 + percent / 100))),
              ),
            })),
          );
        }}
      >
        <label>
          {t("Cenu maiņa (%)", "Изменение цен (%)", "Price adjustment (%)")}
          <input
            type="number"
            min={-50}
            max={100}
            step={1}
            required
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
          />
        </label>
        <button className="btn outline">
          {t(
            "Priekšskatīt cenu maiņu",
            "Предпросмотр изменения цен",
            "Preview price adjustment",
          )}
        </button>
      </form>
      <label>
        {t("Importa JSON", "JSON для импорта", "Import JSON")}
        <textarea
          rows={8}
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            setPreview([]);
            setError(false);
          }}
        />
      </label>
      <label>
        {t("Atvērt JSON failu", "Открыть JSON-файл", "Open JSON file")}
        <input
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 200000) {
              setError(true);
              return;
            }
            try {
              setJson(await f.text());
              setPreview([]);
              setError(false);
            } catch {
              setError(true);
            }
          }}
        />
      </label>
      <button className="btn outline" onClick={prepare}>
        {t("Pārbaudīt importu", "Проверить импорт", "Validate import")}
      </button>
      {error && (
        <p className="error" role="alert">
          {t(
            "Nederīgs imports. Nepieciešami unikāli zināmi ID, trīs nosaukumi un cena no €1 līdz €500. Izmaiņas nav veiktas.",
            "Неверный импорт. Нужны уникальные известные ID, три названия и цена от €1 до €500. Изменения не применены.",
            "Invalid import. Use unique known IDs, three names and a price from €1 to €500. No changes applied.",
          )}
        </p>
      )}
      {preview.length > 0 && (
        <div>
          <h3>
            {t(
              "Izmaiņu priekšskatījums",
              "Предпросмотр изменений",
              "Change preview",
            )}{" "}
            · {preview.length}
          </h3>
          <div className="catalog-edit-preview">
            {preview.map((p) => (
              <div className="summary-line" key={p.id}>
                <span>
                  {p.id} · {pick(p.name, s.lang)}
                </span>
                <strong>
                  {money(s.catalog.find((x) => x.id === p.id)!.price, s.lang)} →{" "}
                  {money(p.price, s.lang)}
                </strong>
              </div>
            ))}
          </div>
          <button className="btn" onClick={apply}>
            {t(
              "Piemērot pārbaudītās izmaiņas",
              "Применить проверенные изменения",
              "Apply validated changes",
            )}
          </button>
        </div>
      )}
      {saved && (
        <p role="status">
          {t(
            "Katalogs atjaunināts šajā pārlūkā",
            "Каталог обновлён в этом браузере",
            "Catalog updated in this browser",
          )}
        </p>
      )}
    </div>
  );
}
