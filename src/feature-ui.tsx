import { ArrowUpRight, Camera, GitCompareArrows, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { img, pick, type Product } from "./data";
import { availability, freshness, statusLabels } from "./domain";
import { useT } from "./i18n";
import { useStore } from "./store";
export function FeatureIntro({ children }: { children: ReactNode }) {
  return <div className="feature-intro">{children}</div>;
}
export function CompareButton({ id }: { id: string }) {
  const { s, compare } = useStore();
  const t = useT();
  const selected = s.comparison.includes(id);
  return (
    <button
      type="button"
      className={`compare-button ${selected ? "selected" : ""}`}
      aria-pressed={selected}
      onClick={() => compare(id)}
    >
      <GitCompareArrows size={15} />
      {selected
        ? t("Salīdzinājumā", "В сравнении", "Comparing")
        : t("Salīdzināt", "Сравнить", "Compare")}
    </button>
  );
}
export function AvailabilityBadge({ p }: { p: Product }) {
  const { s } = useStore();
  const t = useT();
  const a = availability(s, p.id);
  return (
    <span className={`availability-badge ${a.quantity ? "" : "unavailable"}`}>
      <i />
      {p.seasonal
        ? t("Demo iepriekšpasūtījums", "Демо-предзаказ", "Demo preorder")
        : a.immediate
          ? t("Demo: automātā", "Демо: в автомате", "Demo: in the machine")
          : a.quantity
            ? t("Demo: pieejams", "Демо: доступен", "Demo: available")
            : t("Demo: nav pieejams", "Демо: недоступен", "Demo: unavailable")}
    </span>
  );
}
export function PhotoPreview({ p }: { p: Product }) {
  const { s, actualPhotos, setActualPhoto } = useStore();
  const t = useT();
  const [error, setError] = useState("");
  return (
    <div className="prepared-photo panel">
      <div className="row-between">
        <h3>
          {t(
            "Katalogs un sagatavotais pušķis",
            "Каталог и готовый букет",
            "Catalog & prepared bouquet",
          )}
        </h3>
        <Camera size={21} />
      </div>
      <div className="photo-preview-grid">
        <figure>
          <img src={img(p.photo)} alt={pick(p.name, s.lang)} loading="lazy" />
          <figcaption>
            {t(
              "Kataloga stila foto",
              "Фото стиля из каталога",
              "Catalog style photograph",
            )}
          </figcaption>
        </figure>
        <figure>
          {actualPhotos[p.id] ? (
            <img
              src={actualPhotos[p.id]}
              alt={t(
                "Lietotāja demo foto priekšskatījums",
                "Предпросмотр загруженного демо-фото",
                "Your local demo image preview",
              )}
            />
          ) : (
            <div className="photo-upload-empty">
              <Camera size={35} />
              <span>
                {t(
                  "Pievieno savu testa foto",
                  "Добавьте тестовое фото",
                  "Add a test photo",
                )}
              </span>
            </div>
          )}
          <figcaption>
            {t(
              "Tikai lokāls priekšskatījums",
              "Только локальный предпросмотр",
              "Local preview only",
            )}
          </figcaption>
        </figure>
      </div>
      <label className="upload-label">
        {t(
          "Izvēlies foto (JPG, PNG, WebP; līdz 3 MB)",
          "Выберите фото (JPG, PNG, WebP; до 3 МБ)",
          "Choose a photo (JPG, PNG, WebP; up to 3 MB)",
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (
              !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
              f.size > 3 * 1024 * 1024
            ) {
              setError(
                t(
                  "Izvēlies atbalstītu attēlu līdz 3 MB.",
                  "Выберите поддерживаемое изображение до 3 МБ.",
                  "Choose a supported image up to 3 MB.",
                ),
              );
              e.target.value = "";
              return;
            }
            setError("");
            const reader = new FileReader();
            reader.onload = () => setActualPhoto(p.id, String(reader.result));
            reader.onerror = () =>
              setError(
                t(
                  "Attēlu neizdevās nolasīt.",
                  "Не удалось прочитать изображение.",
                  "Could not read this image.",
                ),
              );
            reader.readAsDataURL(f);
          }}
        />
      </label>
      <p role="alert" className="error">
        {error}
      </p>
      {actualPhotos[p.id] && (
        <button className="text-link" onClick={() => setActualPhoto(p.id)}>
          <Trash2 size={14} />
          {t("Noņemt priekšskatījumu", "Убрать предпросмотр", "Remove preview")}
        </button>
      )}
      <p className="muted">
        {t(
          "Foto netiek augšupielādēts vai saglabāts. Tas pazūd pēc lapas pārlādes. Paraugu attēli neatspoguļo īstus klientu pasūtījumus.",
          "Фото не загружается на сервер и не сохраняется. После обновления страницы оно исчезнет. Примеры не являются фото реальных заказов.",
          "Photos are neither uploaded nor persisted and disappear on refresh. Sample images do not represent real customer orders.",
        )}
      </p>
    </div>
  );
}
export function PassportSnippet({ p }: { p: Product }) {
  const { s } = useStore();
  const t = useT();
  const b = s.batches.find((b) => b.productId === p.id && b.quantity > 0);
  return (
    <div className="passport-snippet">
      <span>✳</span>
      <div>
        <strong>{t("Pušķa pase", "Паспорт букета", "Bouquet passport")}</strong>
        <small>
          {b
            ? pick(statusLabels[freshness(b, s.freshnessRules)], s.lang)
            : t("Sastāvs un kopšana", "Состав и уход", "Composition & care")}
        </small>
      </div>
      <Link className="text-link" to={`/passport/${p.id}`}>
        {t("Atvērt", "Открыть", "Open")}
        <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
