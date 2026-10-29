import { useState } from "react";
import { Link } from "react-router-dom";
import {
  categories,
  img,
  money,
  pick,
  products,
  type Product,
  type Text,
  photos,
} from "./data";
import {
  defaultDesign,
  lifecycle,
  materialCost,
  materialRequirements,
  materialLabels,
  christmasDates,
  validProduct,
} from "./commerce";
import type { CommerceState, ProductMeta } from "./commerce-model";
import {
  exportProductCsv,
  previewProductCsv,
  type CsvProduct,
} from "./product-csv";
import { useStore, uid } from "./store";
import { useT } from "./ui";
import { Select } from "./CommerceUI";
export const knownImages = new Set([
  ...photos,
  ...products.map((p) => p.photo),
]);
export default function CommerceAdmin() {
  const { s, set } = useStore();
  const t = useT();
  const [tab, setTab] = useState("products");
  const [id, setId] = useState("xm-001");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] =
    useState<ProductMeta["status"]>("concept");
  const [bulkCategory, setBulkCategory] = useState("12");
  const [percent, setPercent] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<CsvProduct[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [backup, setBackup] = useState<{
    catalog: Product[];
    commerce: CommerceState;
    batches: typeof s.batches;
  } | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [mediaPhoto, setMediaPhoto] = useState(s.catalog[0].photo);
  const [mediaAlt, setMediaAlt] = useState<Text>([
    "Attēls",
    "Изображение",
    "Image",
  ]);
  const [mediaSource, setMediaSource] = useState("Bundled style reference");
  const [mediaLicense, setMediaLicense] = useState(
    "See public/seasonal/image-credits.json",
  );
  const [materialProduct, setMaterialProduct] = useState("xm-001");
  const [costDraft, setCostDraft] = useState("");
  const costConfiguration = s.commerce.drafts[costDraft];
  const p = s.catalog.find((p) => p.id === id) || s.catalog[0];
  const visible = s.catalog.filter((p) =>
    `${p.id} ${pick(p.name, s.lang)}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const patch = (v: Partial<CommerceState>) =>
    set((o) => ({ ...o, commerce: { ...o.commerce, ...v } }));
  const snapshot = () =>
    setBackup({
      catalog: structuredClone(s.catalog),
      commerce: structuredClone(s.commerce),
      batches: structuredClone(s.batches),
    });
  const notify = () =>
    setNotice(
      t(
        "Saglabāts tikai šajā pārlūkā",
        "Сохранено только в этом браузере",
        "Saved in this browser only",
      ),
    );
  function applyRows(rows: CsvProduct[]) {
    snapshot();
    set((o) => {
      const edits = { ...o.commerce.edits };
      const meta = { ...o.commerce.productMeta };
      const custom = [...o.commerce.customProducts];
      for (const r of rows) {
        edits[r.product.id] = r.product;
        meta[r.product.id] = r.meta;
        if (r.action === "create") custom.push(r.product);
      }
      return {
        ...o,
        catalog: [
          ...o.catalog.map((p) => edits[p.id] || p),
          ...rows.filter((r) => r.action === "create").map((r) => r.product),
        ],
        batches: [
          ...o.batches,
          ...rows
            .filter((r) => r.action === "create")
            .map((r) => ({
              id: `batch-${r.product.id}`,
              productId: r.product.id,
              quantity: 0,
              receivedDate: "2026-10-29",
              assemblyDate: "2026-10-29",
              sellBy: "2027-01-07",
              status: "fresh" as const,
              location: "studio",
              unitCost: 0,
            })),
        ],
        commerce: {
          ...o.commerce,
          edits,
          productMeta: meta,
          customProducts: custom,
        },
      };
    });
    setPreview([]);
    notify();
  }
  function bulk(v: Partial<ProductMeta>, category?: number) {
    snapshot();
    set((o) => {
      const meta = { ...o.commerce.productMeta };
      for (const id of selected)
        meta[id] = {
          ...(meta[id] || {
            status: "concept",
            visible: true,
            seasonal: !!o.catalog.find((p) => p.id === id)?.seasonal,
          }),
          ...v,
        };
      const edits = { ...o.commerce.edits };
      const catalog = o.catalog.map((p) => {
        if (!selected.includes(p.id) || category === undefined) return p;
        const template = o.catalog.find((x) => x.category === category);
        const next = {
          ...p,
          category,
          seasonal:
            category >= 12
              ? {
                  ...template!.seasonal!,
                  materials: p.composition,
                  dimensions: p.size,
                  related: template!.seasonal!.related,
                }
              : undefined,
        };
        edits[p.id] = next;
        return next;
      });
      return {
        ...o,
        catalog,
        commerce: { ...o.commerce, productMeta: meta, edits },
      };
    });
    notify();
  }
  const tabs = [
    ["products", t("Produkti", "Товары", "Products")],
    ["csv", "CSV"],
    ["media", t("Mediji", "Медиа", "Media")],
    ["slots", t("Priekšpasūtījumi", "Предзаказы", "Preorders")],
    ["materials", t("Materiāli", "Материалы", "Materials")],
    [
      "corporate",
      t("Uzņēmumu pieprasījumi", "Корпоративные заявки", "Corporate inquiries"),
    ],
    ["analytics", t("Interese", "Интерес", "Interest analytics")],
    ["orders", t("Sagatavošana", "Подготовка", "Preparation")],
    ["campaign", t("Kampaņa", "Кампания", "Campaign")],
  ];
  return (
    <div className="commerce-admin">
      <nav className="commerce-links">
        {tabs.map(([v, l]) => (
          <button
            key={v}
            className={tab === v ? "selected" : ""}
            onClick={() => setTab(v)}
          >
            {l}
          </button>
        ))}
      </nav>
      <p className="muted">
        {t(
          "Lokāls demo. Dzēšana ir atgriezeniska arhivēšana. Statusi ir iekšējai plānošanai un neapliecina reālu pieejamību.",
          "Локальное демо. Удаление — обратимое архивирование. Статусы служат внутреннему планированию и не подтверждают реальное наличие.",
          "Local demo. Deletion is reversible archiving. Internal lifecycle statuses do not certify real customer availability.",
        )}
      </p>
      {notice && <p role="status">{notice}</p>}
      {backup && (
        <button
          className="btn outline"
          onClick={() => {
            set((o) => ({
              ...o,
              catalog: backup.catalog,
              commerce: backup.commerce,
              batches: backup.batches,
            }));
            setBackup(null);
            setConfirm(false);
            notify();
          }}
        >
          {t(
            "Atsaukt pēdējo kataloga izmaiņu",
            "Откатить последнее изменение каталога",
            "Roll back last catalog change",
          )}
        </button>
      )}
      {tab === "products" ? (
        <>
          <div className="panel form-panel">
            <label>
              {t("Meklēt", "Поиск", "Search")}
              <input value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <div className="admin-product-list">
              {visible.map((v) => (
                <div key={v.id} className="admin-product-row">
                  <input
                    type="checkbox"
                    aria-label={`${t("Atlasīt", "Выбрать", "Select")} ${v.id}`}
                    checked={selected.includes(v.id)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, v.id]
                          : selected.filter((x) => x !== v.id),
                      )
                    }
                  />
                  <button className="text-link" onClick={() => setId(v.id)}>
                    {v.id} · {pick(v.name, s.lang)}
                  </button>
                  <span>
                    {money(v.price, s.lang)} ·{" "}
                    {pick(
                      lifecycle.find(
                        (l) =>
                          l.id ===
                          (s.commerce.productMeta[v.id]?.status || "concept"),
                      )!.label,
                      s.lang,
                    )}
                  </span>
                </div>
              ))}
            </div>
            <p>
              {selected.length} {t("atlasīti", "выбрано", "selected")}
            </p>
            <div className="form-grid">
              <Select
                label={t("Statuss", "Статус", "Status")}
                value={bulkStatus}
                onChange={(v) => setBulkStatus(v as ProductMeta["status"])}
                choices={lifecycle.map((l) => ({
                  id: l.id,
                  label: pick(l.label, s.lang),
                }))}
              />
              <Select
                label={t("Kategorija", "Категория", "Category")}
                value={bulkCategory}
                onChange={setBulkCategory}
                choices={categories.map((v, i) => ({
                  id: String(i),
                  label: pick(v, s.lang),
                }))}
              />
            </div>
            <div className="atelier-links">
              <button
                className="btn outline"
                disabled={!selected.length}
                onClick={() => bulk({ status: bulkStatus })}
              >
                {t("Mainīt statusu", "Изменить статус", "Apply status")}
              </button>
              <button
                className="btn outline"
                disabled={!selected.length}
                onClick={() => bulk({}, Number(bulkCategory))}
              >
                {t("Mainīt kategoriju", "Изменить категорию", "Apply category")}
              </button>
              <button
                className="btn outline"
                disabled={!selected.length}
                onClick={() => bulk({ visible: false })}
              >
                {t("Slēpt", "Скрыть", "Hide")}
              </button>
              <button
                className="btn outline"
                disabled={!selected.length}
                onClick={() => bulk({ visible: true })}
              >
                {t("Rādīt", "Показать", "Show")}
              </button>
              <button
                className="btn outline"
                disabled={!selected.length}
                onClick={() => bulk({ seasonal: true })}
              >
                {t(
                  "Piešķirt Ziemassvētkiem",
                  "Назначить Рождеству",
                  "Assign Christmas",
                )}
              </button>
              <button
                className="btn outline"
                disabled={!selected.length}
                onClick={() => bulk({ seasonal: false })}
              >
                {t(
                  "Noņemt sezonas marķieri",
                  "Убрать сезонную метку",
                  "Remove seasonal assignment",
                )}
              </button>
              <button
                className="btn outline"
                disabled={!selected.length}
                onClick={() => bulk({ status: "archived", visible: false })}
              >
                {t(
                  "Arhivēt atlasītos",
                  "Архивировать выбранные",
                  "Archive selected",
                )}
              </button>
            </div>
            <label>
              {t(
                "Cenu izmaiņa (%)",
                "Изменение цен (%)",
                "Price adjustment (%)",
              )}
              <input
                type="number"
                min={-50}
                max={100}
                value={percent}
                onChange={(e) => {
                  setPercent(
                    Math.max(-50, Math.min(100, Number(e.target.value) || 0)),
                  );
                  setConfirm(false);
                }}
              />
            </label>
            <button
              className="btn outline"
              disabled={!selected.length}
              onClick={() => setConfirm(true)}
            >
              {t("Priekšskatīt cenas", "Предпросмотр цен", "Preview prices")}
            </button>
            {confirm && (
              <div>
                <div className="catalog-edit-preview">
                  {s.catalog
                    .filter((p) => selected.includes(p.id))
                    .map((p) => (
                      <p key={p.id}>
                        {p.id}: {money(p.price, s.lang)} →{" "}
                        {money(
                          Math.min(
                            500,
                            Math.max(
                              1,
                              Math.round(p.price * (1 + percent / 100) * 100) /
                                100,
                            ),
                          ),
                          s.lang,
                        )}
                      </p>
                    ))}
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    applyRows(
                      s.catalog
                        .filter((p) => selected.includes(p.id))
                        .map((p) => ({
                          product: {
                            ...p,
                            price: Math.min(
                              500,
                              Math.max(
                                1,
                                Math.round(
                                  p.price * (1 + percent / 100) * 100,
                                ) / 100,
                              ),
                            ),
                          },
                          meta: s.commerce.productMeta[p.id] || {
                            status: "concept",
                            visible: true,
                            seasonal: !!p.seasonal,
                          },
                          action: "update",
                        })),
                    );
                    setConfirm(false);
                  }}
                >
                  {t(
                    "Apstiprināt cenu izmaiņas",
                    "Подтвердить изменение цен",
                    "Confirm price changes",
                  )}
                </button>
              </div>
            )}
          </div>
          <form
            key={p.id}
            className="panel form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const tuple = (key: string) =>
                ["lv", "ru", "en"].map((l) =>
                  String(f.get(`${key}_${l}`)),
                ) as Text;
              const price = Number(f.get("price"));
              const photo = String(f.get("photo"));
              const size = String(f.get("dimensions"));
              const next: Product = {
                ...p,
                name: tuple("name"),
                description: tuple("description"),
                composition: tuple("materials"),
                care: tuple("care"),
                price,
                photo,
                size,
                customizable: f.get("personalizable") === "on",
              };
              if (next.seasonal) {
                const related = String(f.get("related") || "")
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean);
                if (related.some((id) => !s.catalog.some((p) => p.id === id))) {
                  setErrors(["Related product ID"]);
                  return;
                }
                next.seasonal = {
                  ...next.seasonal,
                  materials: next.composition,
                  dimensions: size,
                  personalization: next.customizable,
                  preparationDays: Math.max(
                    0,
                    Math.min(30, Number(f.get("lead")) || 0),
                  ),
                  natural: f.get("natural") === "on",
                  related,
                  variants: ["lv", "ru", "en"]
                    .map((l) => String(f.get(`variants_${l}`)).split("|"))
                    .reduce<Text[]>((rows, v, language) => {
                      v.forEach((text, i) => {
                        if (!rows[i]) rows[i] = ["", "", ""];
                        rows[i][language] = text;
                      });
                      return rows;
                    }, []),
                };
              }
              if (!validProduct(next) || !knownImages.has(photo)) {
                setErrors(["Invalid product or image"]);
                return;
              }
              applyRows([
                {
                  product: next,
                  meta: s.commerce.productMeta[p.id] || {
                    status: "concept",
                    visible: true,
                    seasonal: !!p.seasonal,
                  },
                  action: "update",
                },
              ]);
              setErrors([]);
            }}
          >
            <h2>{p.id}</h2>
            {["lv", "ru", "en"].map((lang, i) => (
              <fieldset key={lang}>
                <legend>{lang.toUpperCase()}</legend>
                {[
                  ["name", t("Nosaukums", "Название", "Name"), p.name[i]],
                  [
                    "description",
                    t("Apraksts", "Описание", "Description"),
                    p.description[i],
                  ],
                  [
                    "materials",
                    t("Materiāli", "Материалы", "Materials"),
                    p.composition[i],
                  ],
                  ["care", t("Kopšana", "Уход", "Care"), p.care[i]],
                ].map(([key, label, value]) => (
                  <label key={key}>
                    {label}
                    <textarea
                      required
                      maxLength={key === "name" ? 160 : 2000}
                      name={`${key}_${lang}`}
                      defaultValue={value}
                    />
                  </label>
                ))}
                {p.seasonal && (
                  <label>
                    {t(
                      "Varianti (| atdalītājs)",
                      "Варианты (разделитель |)",
                      "Variants (separated by |)",
                    )}
                    <input
                      required
                      name={`variants_${lang}`}
                      defaultValue={p.seasonal.variants
                        .map((v) => v[i])
                        .join("|")}
                    />
                  </label>
                )}
              </fieldset>
            ))}
            <div className="form-grid">
              <label>
                {t("Cena (€)", "Цена (€)", "Price (€)")}
                <input
                  name="price"
                  required
                  type="number"
                  min={1}
                  max={500}
                  step="0.01"
                  defaultValue={p.price}
                />
              </label>
              <label>
                {t("Izmēri", "Размеры", "Dimensions")}
                <input
                  name="dimensions"
                  required
                  maxLength={100}
                  defaultValue={p.size}
                />
              </label>
            </div>
            <Select
              label={t("Attēls", "Изображение", "Image")}
              value={mediaPhoto}
              onChange={setMediaPhoto}
              choices={[...knownImages].map((id) => ({ id, label: id }))}
            />
            <label>
              {t(
                "Produkta attēla ID",
                "ID изображения товара",
                "Product image ID",
              )}
              <input name="photo" required defaultValue={p.photo} />
            </label>
            <button
              type="button"
              className="text-link"
              onClick={(e) => {
                const form = e.currentTarget.form!;
                (form.elements.namedItem("photo") as HTMLInputElement).value =
                  mediaPhoto;
              }}
            >
              {t(
                "Piešķirt izvēlēto attēlu",
                "Назначить выбранное изображение",
                "Assign selected image",
              )}
            </button>
            <label className="check-label">
              <input
                type="checkbox"
                name="personalizable"
                defaultChecked={p.customizable}
              />
              {t("Personalizējams", "Персонализируемый", "Personalizable")}
            </label>
            {p.seasonal && (
              <>
                <label>
                  {t(
                    "Sagatavošanas dienas",
                    "Дни подготовки",
                    "Preparation days",
                  )}
                  <input
                    type="number"
                    name="lead"
                    min={0}
                    max={30}
                    defaultValue={p.seasonal.preparationDays}
                  />
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    name="natural"
                    defaultChecked={p.seasonal.natural}
                  />
                  {t(
                    "Dabiski komponenti",
                    "Природные компоненты",
                    "Natural components",
                  )}
                </label>
                <label>
                  {t(
                    "Saistītie ID (komati)",
                    "Связанные ID (запятые)",
                    "Related IDs (commas)",
                  )}
                  <input
                    name="related"
                    defaultValue={p.seasonal.related.join(",")}
                  />
                </label>
              </>
            )}
            <div className="atelier-links">
              <button className="btn">
                {t("Saglabāt produktu", "Сохранить товар", "Save product")}
              </button>
              <button
                type="button"
                className="btn outline"
                onClick={() => {
                  const next = {
                    ...structuredClone(p),
                    id: `demo-${uid()}`,
                    stock: 0,
                    name: p.name.map((n) => `${n} · Demo`) as Text,
                  };
                  applyRows([
                    {
                      product: next,
                      meta: {
                        status: "concept",
                        visible: false,
                        seasonal: !!next.seasonal,
                      },
                      action: "create",
                    },
                  ]);
                  setId(next.id);
                }}
              >
                {t(
                  "Izveidot no šī koncepta",
                  "Создать на основе концепта",
                  "Create from this concept",
                )}
              </button>
              <button
                type="button"
                className="btn outline"
                onClick={() => {
                  snapshot();
                  patch({
                    deleted: [...new Set([...s.commerce.deleted, p.id])],
                  });
                  notify();
                }}
              >
                {t(
                  "Dzēst demo produktu (atgriezeniski)",
                  "Удалить демо-товар (обратимо)",
                  "Delete demo product (reversible)",
                )}
              </button>
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  patch({
                    deleted: s.commerce.deleted.filter((x) => x !== p.id),
                  })
                }
              >
                {t("Atjaunot", "Восстановить", "Restore")}
              </button>
            </div>
          </form>
        </>
      ) : tab === "csv" ? (
        <div className="panel form-panel">
          <h2>CSV · UTF-8</h2>
          <p>
            {t(
              "Visas kolonnas ir obligātas. Esošie ID tiks atjaunināti tikai pēc priekšskatījuma; jauniem ID jāsākas ar demo-. Krājumi netiek importēti.",
              "Все столбцы обязательны. Существующие ID обновляются после предпросмотра; новые ID начинаются с demo-. Остатки не импортируются.",
              "All columns are required. Existing IDs update only after preview; new IDs start with demo-. Stock is not imported.",
            )}
          </p>
          <button
            className="btn outline"
            onClick={() => {
              const text = exportProductCsv(s.catalog, s.commerce.productMeta);
              setCsv(text);
              const url = URL.createObjectURL(
                new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8" }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "flower-paradise-products.csv";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            {t(
              "Eksportēt katalogu",
              "Экспортировать каталог",
              "Export catalog CSV",
            )}
          </button>
          <label>
            CSV
            <textarea
              aria-label="CSV"
              rows={10}
              value={csv}
              onChange={(e) => {
                setCsv(e.target.value);
                setPreview([]);
              }}
            />
          </label>
          <label>
            {t("Atvērt CSV failu", "Открыть CSV-файл", "Open CSV file")}
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f && f.size <= 2e6) {
                  setCsv((await f.text()).replace(/^\ufeff/, ""));
                  setPreview([]);
                }
              }}
            />
          </label>
          <button
            className="btn"
            onClick={() => {
              const r = previewProductCsv(
                csv.replace(/^\ufeff/, ""),
                s.catalog,
                knownImages,
              );
              setPreview(r.rows);
              setErrors(r.errors);
            }}
          >
            {t(
              "Pārbaudīt un priekšskatīt CSV",
              "Проверить и просмотреть CSV",
              "Validate and preview CSV",
            )}
          </button>
          {preview.length > 0 && (
            <>
              <div className="catalog-edit-preview">
                {preview.map((r) => (
                  <p key={r.product.id}>
                    {r.action === "create"
                      ? t("Jauns", "Новый", "Create")
                      : t("Atjauninājums", "Обновление", "Update")}{" "}
                    · {r.product.id} · {pick(r.product.name, s.lang)} ·{" "}
                    {money(r.product.price, s.lang)}
                  </p>
                ))}
              </div>
              <button className="btn" onClick={() => applyRows(preview)}>
                {t("Piemērot importu", "Применить импорт", "Apply CSV import")}
              </button>
            </>
          )}
        </div>
      ) : tab === "media" ? (
        <div className="panel form-panel">
          <h2>{t("Mediju bibliotēka", "Медиатека", "Media library")}</h2>
          <Select
            label={t("Attēla ID", "ID изображения", "Image ID")}
            value={mediaPhoto}
            onChange={setMediaPhoto}
            choices={[...knownImages].map((id) => ({ id, label: id }))}
          />
          <img
            className="media-preview"
            src={img(mediaPhoto)}
            alt={pick(mediaAlt, s.lang)}
          />
          {["lv", "ru", "en"].map((lang, i) => (
            <label key={lang}>
              Alt · {lang}
              <input
                value={mediaAlt[i]}
                onChange={(e) =>
                  setMediaAlt(
                    mediaAlt.map((v, j) =>
                      i === j ? e.target.value : v,
                    ) as Text,
                  )
                }
              />
            </label>
          ))}
          <label>
            {t("Avots", "Источник", "Source")}
            <input
              value={mediaSource}
              maxLength={500}
              onChange={(e) => setMediaSource(e.target.value)}
            />
          </label>
          <label>
            {t("Licence", "Лицензия", "License")}
            <input
              value={mediaLicense}
              maxLength={500}
              onChange={(e) => setMediaLicense(e.target.value)}
            />
          </label>
          <button
            className="btn"
            onClick={() => {
              patch({
                media: [
                  ...s.commerce.media.filter((m) => m.photo !== mediaPhoto),
                  {
                    id: uid(),
                    photo: mediaPhoto,
                    alt: mediaAlt,
                    source: mediaSource,
                    license: mediaLicense,
                  },
                ],
              });
              notify();
            }}
          >
            {t(
              "Saglabāt metadatus",
              "Сохранить метаданные",
              "Save media metadata",
            )}
          </button>
          <p>
            {t(
              "Trūkstoši attēli",
              "Отсутствующие изображения",
              "Missing images",
            )}
            : {s.catalog.filter((p) => !knownImages.has(p.photo)).length}
          </p>
          <p>
            {t(
              "Atkārtoti piemēra attēli",
              "Повторяющиеся изображения-примеры",
              "Repeated reference images",
            )}
            : {s.catalog.length - new Set(s.catalog.map((p) => p.photo)).size}
          </p>
          <p className="muted">
            {t(
              "Atkārtoti attēli ir marķēti kā stila piemēri. Lokāli foto priekšskatījumi nav pastāvīga mediju glabātuve.",
              "Повторные изображения обозначены как примеры стиля. Локальные фото-превью не являются постоянным хранилищем.",
              "Repeated images are labeled as style references. Local photo previews are not persistent media storage.",
            )}
          </p>
          <Link to="/order-confidence">
            {t(
              "Drošs lokāls foto priekšskatījums",
              "Безопасный локальный предпросмотр фото",
              "Safe local photo preview",
            )}{" "}
            →
          </Link>
        </div>
      ) : tab === "slots" ? (
        <div className="panel form-panel">
          <h2>
            {t(
              "Simulētās jaudas iestatījumi",
              "Настройки условной ёмкости",
              "Simulated capacity settings",
            )}
          </h2>
          {[
            [
              "capacity",
              t(
                "Vienības laika logā",
                "Единиц на временное окно",
                "Units per time window",
              ),
              1,
              500,
            ],
            [
              "leadDays",
              t(
                "Minimālās sagatavošanas dienas",
                "Минимальные дни подготовки",
                "Minimum preparation days",
              ),
              0,
              30,
            ],
            [
              "cutoffHour",
              t(
                "Pieņemšanas stunda (Rīga)",
                "Час отсечения (Рига)",
                "Cutoff hour (Riga)",
              ),
              0,
              23,
            ],
          ].map(([key, label, min, max]) => (
            <label key={key}>
              {label}
              <input
                type="number"
                min={min}
                max={max}
                value={
                  s.commerce.slots[
                    key as "capacity" | "leadDays" | "cutoffHour"
                  ]
                }
                onChange={(e) =>
                  patch({
                    slots: {
                      ...s.commerce.slots,
                      [key]: Math.max(
                        Number(min),
                        Math.min(
                          Number(max),
                          Math.floor(Number(e.target.value) || 0),
                        ),
                      ),
                    },
                  })
                }
              />
            </label>
          ))}
          {christmasDates.map((d) => (
            <label className="check-label" key={d}>
              <input
                type="checkbox"
                checked={s.commerce.slots.closed.includes(d)}
                onChange={(e) =>
                  patch({
                    slots: {
                      ...s.commerce.slots,
                      closed: e.target.checked
                        ? [...s.commerce.slots.closed, d]
                        : s.commerce.slots.closed.filter((x) => x !== d),
                    },
                  })
                }
              />
              {d} · {t("Slēgts", "Закрыто", "Closed")}
            </label>
          ))}
          <div className="catalog-edit-preview">
            {s.reservations.map((r) => (
              <p key={r.id}>
                {r.date} · {r.time} · {r.quantity || 1} · {r.status}
              </p>
            ))}
          </div>
        </div>
      ) : tab === "materials" ? (
        <div className="panel form-panel">
          <h2>
            {t(
              "Materiālu izmaksu pieņēmumi",
              "Предположения о стоимости материалов",
              "Material cost assumptions",
            )}
          </h2>
          {Object.keys(s.commerce.materialPrices).map((key) => (
            <label key={key}>
              {
                (
                  {
                    greenery: t("Skujas", "Хвоя", "Greenery"),
                    wax: t("Sveces", "Свечи", "Candles"),
                    ribbon: t("Lentes", "Ленты", "Ribbons"),
                    box: t("Kastes", "Коробки", "Boxes"),
                    ornament: t("Dekori", "Украшения", "Ornaments"),
                    packaging: t("Iepakojums", "Упаковка", "Packaging"),
                    food: t(
                      "Dāvanu saturs",
                      "Подарочное наполнение",
                      "Gift contents",
                    ),
                    textile: t("Tekstils", "Текстиль", "Textile"),
                    wood: t("Koks", "Дерево", "Wood"),
                    paper: t("Papīrs", "Бумага", "Paper"),
                    metal: t("Metāls", "Металл", "Metal"),
                    glass: t("Stikls", "Стекло", "Glass"),
                  } as Record<string, string>
                )[key]
              }{" "}
              (€)
              <input
                type="number"
                min={0}
                max={1000}
                step="0.01"
                value={s.commerce.materialPrices[key]}
                onChange={(e) =>
                  patch({
                    materialPrices: {
                      ...s.commerce.materialPrices,
                      [key]: Math.max(
                        0,
                        Math.min(1000, Number(e.target.value) || 0),
                      ),
                    },
                  })
                }
              />
            </label>
          ))}
          <h3>
            {t(
              "Simulētie materiālu daudzumi",
              "Условные количества материалов",
              "Simulated material quantities",
            )}
          </h3>
          <p className="muted">
            {t(
              "Sākuma daudzumi ir nulle. Tie nav faktiski krājumi.",
              "Начальные количества равны нулю. Это не фактические остатки.",
              "Quantities start at zero. These are not physical stock counts.",
            )}
          </p>
          {Object.keys(s.commerce.materialStock).map((key) => (
            <label key={key}>
              {pick(materialLabels[key], s.lang)} ·{" "}
              {t("Demo vienības", "Демо-единицы", "Demo units")}
              <input
                type="number"
                min={0}
                max={10000}
                value={s.commerce.materialStock[key]}
                onChange={(e) =>
                  patch({
                    materialStock: {
                      ...s.commerce.materialStock,
                      [key]: Math.max(
                        0,
                        Math.min(
                          10000,
                          Math.floor(Number(e.target.value) || 0),
                        ),
                      ),
                    },
                  })
                }
              />
            </label>
          ))}
          <Select
            label={t(
              "Konfigurācijas melnraksts",
              "Черновик конфигурации",
              "Configuration draft",
            )}
            value={costDraft}
            onChange={setCostDraft}
            choices={[
              {
                id: "",
                label: t(
                  "Tikai bāzes produkts",
                  "Только базовый товар",
                  "Base product only",
                ),
              },
              ...Object.keys(s.commerce.drafts).map((id) => ({
                id,
                label: id,
              })),
            ]}
          />
          <Select
            label={t(
              "Aprēķina produkts",
              "Товар для расчёта",
              "Costed product",
            )}
            value={materialProduct}
            onChange={setMaterialProduct}
            choices={s.catalog.map((p) => ({
              id: p.id,
              label: pick(p.name, s.lang),
            }))}
          />
          <p>
            {t(
              "Aptuvenā materiālu pašizmaksa",
              "Оценочная себестоимость материалов",
              "Estimated material cost",
            )}
            :{" "}
            {money(
              materialCost(
                s.catalog.find((p) => p.id === materialProduct)!,
                s.commerce.materialPrices,
                costConfiguration,
              ),
              s.lang,
            )}
          </p>
          <div className="material-requirements">
            {Object.entries(
              materialRequirements(
                s.catalog.find((p) => p.id === materialProduct)!,
                costConfiguration,
              ),
            ).map(([key, qty]) => (
              <p
                key={key}
                className={
                  (s.commerce.materialStock[key] || 0) < qty ? "error" : ""
                }
              >
                {pick(materialLabels[key] || [key, key, key], s.lang)}: {qty} /{" "}
                {s.commerce.materialStock[key] || 0} ·{" "}
                {t(
                  "vajag / demo krājums",
                  "нужно / демо-запас",
                  "required / demo stock",
                )}
              </p>
            ))}
          </div>
          <button
            className="btn"
            onClick={() => {
              const cost = materialCost(
                s.catalog.find((p) => p.id === materialProduct)!,
                s.commerce.materialPrices,
                costConfiguration,
              );
              set((o) => ({
                ...o,
                costs: {
                  ...o.costs,
                  flowers: Math.max(
                    0,
                    cost - o.commerce.materialPrices.packaging,
                  ),
                  packaging: o.commerce.materialPrices.packaging,
                  price: o.catalog.find((p) => p.id === materialProduct)!.price,
                },
              }));
              notify();
            }}
          >
            {t(
              "Izmantot rentabilitātes modelī",
              "Использовать в модели рентабельности",
              "Use in profitability model",
            )}
          </button>
          <Link to="/admin?view=profitability">
            {t(
              "Atvērt finanšu modeli",
              "Открыть финансовую модель",
              "Open profitability model",
            )}{" "}
            →
          </Link>
        </div>
      ) : tab === "corporate" ? (
        <div className="panel form-panel">
          <h2>
            {t("Lokālie pieprasījumi", "Локальные запросы", "Local inquiries")}
          </h2>
          <p>
            {t(
              "Tiek rādīti tikai šajā pārlūkā saglabātie demo pieprasījumi.",
              "Отображаются только сохранённые в этом браузере демо-запросы.",
              "Only demo inquiries saved in this browser are shown.",
            )}
          </p>
          {s.commerce.corporate.map((c) => (
            <article key={c.id}>
              <h3>
                {c.company} · {c.quantity} ×{" "}
                {money(c.total / c.quantity, s.lang)}
              </h3>
              <p>
                {c.contact} · {c.date} · {money(c.total, s.lang)} · {c.branding}
              </p>
              <Select
                label={`${t("Statuss", "Статус", "Status")} ${c.id.slice(0, 8)}`}
                value={c.status}
                onChange={(v) =>
                  patch({
                    corporate: s.commerce.corporate.map((x) =>
                      x.id === c.id
                        ? { ...x, status: v as typeof c.status }
                        : x,
                    ),
                  })
                }
                choices={[
                  { id: "draft", label: t("Melnraksts", "Черновик", "Draft") },
                  {
                    id: "review",
                    label: t("Pārskatīšana", "Рассмотрение", "Review"),
                  },
                  {
                    id: "prepared",
                    label: t(
                      "Sagatavots demo",
                      "Подготовлено в демо",
                      "Prepared demo",
                    ),
                  },
                ]}
              />
            </article>
          ))}
          <button
            className="btn outline"
            onClick={() => {
              const p = s.catalog.find((p) => p.id === "xm-087")!;
              patch({
                corporate: [
                  ...s.commerce.corporate,
                  {
                    id: uid(),
                    company: "DEMO · Sample Company",
                    contact: "sample@example.com",
                    productId: p.id,
                    quantity: 20,
                    budget: 100,
                    date: "2026-12-23",
                    method: "pickup",
                    branding: t(
                      "Parauga zīmola iecere",
                      "Пример идеи брендинга",
                      "Sample branding concept",
                    ),
                    configuration: defaultDesign(),
                    total: p.price * 20,
                    status: "draft",
                  },
                ],
              });
              notify();
            }}
          >
            {t(
              "Pievienot marķētu paraugu",
              "Добавить отмеченный образец",
              "Add labeled sample inquiry",
            )}
          </button>
        </div>
      ) : tab === "analytics" ? (
        <div className="panel form-panel">
          <h2>
            {t(
              "Šī pārlūka aktivitāte",
              "Активность этого браузера",
              "This browser’s activity",
            )}
          </h2>
          <p>
            {t(
              "Nav globālas analītikas un ārējas izsekošanas. Zemāk faktiskas lokālas darbības, nevis ģenerēti pārdošanas dati.",
              "Нет общей аналитики и внешнего отслеживания. Ниже фактические локальные действия, а не сгенерированные продажи.",
              "No aggregated analytics or external tracking. These are actual local interactions, not generated sales figures.",
            )}
          </p>
          <div className="stats-grid">
            {[
              [
                "view",
                t("Preču skatījumi", "Просмотры товаров", "Product views"),
              ],
              [
                "wishlist",
                t(
                  "Pievienots vēlmēm",
                  "Добавления в желания",
                  "Wishlist additions",
                ),
              ],
              [
                "builder",
                t(
                  "Konfiguratoru izmantošana",
                  "Использование конструкторов",
                  "Builder usage",
                ),
              ],
            ].map(([kind, label]) => (
              <div key={kind}>
                <strong>
                  {s.commerce.events.filter((e) => e.kind === kind).length}
                </strong>
                <p>{label}</p>
              </div>
            ))}
            <div>
              <strong>{s.seasonal.interests.length}</strong>
              <p>
                {t(
                  "Interese par produktiem",
                  "Интерес к товарам",
                  "Product interest",
                )}
              </p>
            </div>
            <div>
              <strong>
                {
                  s.reservations.filter((r) => r.product.startsWith("xm-"))
                    .length
                }
              </strong>
              <p>
                {t(
                  "Svētku rezervācijas",
                  "Праздничные бронирования",
                  "Christmas reservations",
                )}
              </p>
            </div>
          </div>
          <p>
            {t("Vēlamais budžets", "Предпочитаемый бюджет", "Preferred budget")}
            : {s.seasonal.survey.budget}
          </p>
          {categories.map((cat, i) => {
            const n = s.commerce.events.filter(
              (e) => s.catalog.find((p) => p.id === e.product)?.category === i,
            ).length;
            return n ? (
              <p key={i}>
                {pick(cat, s.lang)}: {n}
              </p>
            ) : null;
          })}
        </div>
      ) : tab === "orders" ? (
        <div className="panel form-panel">
          {[...s.orders.map((o) => o.id), "sample-order"].map((id) => (
            <Select
              key={id}
              label={`${t("Pasūtījuma statuss", "Статус заказа", "Order status")} ${id.slice(0, 8)}`}
              value={s.commerce.orderStages[id] || "confirmed"}
              onChange={(v) =>
                patch({ orderStages: { ...s.commerce.orderStages, [id]: v } })
              }
              choices={[
                {
                  id: "confirmed",
                  label: t("Apstiprināts", "Подтверждён", "Confirmed"),
                },
                {
                  id: "preparing",
                  label: t("Sagatavošanā", "Готовится", "Preparing"),
                },
                {
                  id: "photo-review",
                  label: t("Foto apskate", "Просмотр фото", "Photo review"),
                },
                { id: "ready", label: t("Gatavs", "Готов", "Ready") },
                {
                  id: "collected",
                  label: t("Saņemts", "Получен", "Collected"),
                },
              ]}
            />
          ))}
          <Link to="/order-confidence">
            {t("Foto galerija", "Галерея фото", "Photo gallery")} →
          </Link>
        </div>
      ) : (
        <div className="panel form-panel">
          {["lv", "ru", "en"].map((l, i) => (
            <label key={l}>
              {t(
                "Paziņojuma josla",
                "Полоса объявления",
                "Announcement banner",
              )}{" "}
              · {l}
              <input
                maxLength={200}
                value={s.commerce.banner[i]}
                onChange={(e) =>
                  patch({
                    banner: s.commerce.banner.map((v, j) =>
                      j === i ? e.target.value : v,
                    ) as Text,
                  })
                }
              />
            </label>
          ))}
          <Select
            label={t("Laika atskaite", "Обратный отсчёт", "Countdown target")}
            value={s.commerce.countdown}
            onChange={(v) =>
              patch({ countdown: v as "christmas" | "new-year" })
            }
            choices={[
              {
                id: "christmas",
                label: t("Ziemassvētki", "Рождество", "Christmas"),
              },
              {
                id: "new-year",
                label: t("Jaunais gads", "Новый год", "New Year"),
              },
            ]}
          />
          <Link to="/admin?view=christmas">
            {t(
              "Kampaņas datumi, sadaļas un piedāvājumi",
              "Даты кампании, разделы и предложения",
              "Campaign dates, sections & featured products",
            )}{" "}
            →
          </Link>
          <p>
            {t(
              "Cenu kampaņas tiek pārvaldītas kopējā atlaižu sadaļā.",
              "Ценовые кампании управляются в общем разделе скидок.",
              "Pricing campaigns use the existing discounts section.",
            )}
          </p>
          <Link to="/admin?view=discounts">
            {t("Atlaižu noteikumi", "Правила скидок", "Discount rules")} →
          </Link>
        </div>
      )}
      {errors.length > 0 && (
        <div role="alert" className="error">
          {t(
            "Importa / datu kļūdas",
            "Ошибки импорта / данных",
            "Import / data errors",
          )}
          <ul>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
