import { Link } from "react-router-dom";
import { pick, type Product } from "./data";
import { useStore } from "./store";
import { useT } from "./ui";
export default function ProductConfidence({ p }: { p: Product }) {
  const { s } = useStore();
  const t = useT();
  return (
    <section className="product-confidence">
      <h2>
        {t(
          "Izmēri un materiāli",
          "Размеры и материалы",
          "Size & material guide",
        )}
      </h2>
      <div
        className="size-reference"
        aria-label={t(
          "Ilustratīvs izmēru salīdzinājums",
          "Иллюстративное сравнение размеров",
          "Illustrative size comparison",
        )}
      >
        {["S", "M", "L"].map((size, i) => (
          <figure key={size}>
            <div style={{ height: [88, 110, 154][i], width: [70, 88, 123][i] }}>
              ❋
            </div>
            <figcaption>
              {size} · {[80, 100, 140][i]}%
            </figcaption>
          </figure>
        ))}
      </div>
      <p>
        {t(
          "Shematisks mērogs, nevis precīzs ražošanas rasējums. M bāzes izmēri",
          "Схематичный масштаб, а не точный производственный чертёж. Базовые размеры M",
          "Schematic proportions, not an exact manufacturing drawing. Base M dimensions",
        )}
        : {p.size}.
      </p>
      <dl>
        <div>
          <dt>{t("Materiāli", "Материалы", "Materials")}</dt>
          <dd>{pick(p.composition, s.lang)}</dd>
        </div>
        <div>
          <dt>{t("Komponenti", "Компоненты", "Components")}</dt>
          <dd>
            {p.seasonal
              ? p.seasonal.natural
                ? t(
                    "Dabisku materiālu kompozīcijas koncepts",
                    "Концепция композиции с природными материалами",
                    "Natural-material arrangement concept",
                  )
                : t(
                    "Dekoratīvi / mākslīgi komponenti atbilstoši aprakstam",
                    "Декоративные / искусственные компоненты по описанию",
                    "Decorative / artificial components as described",
                  )
              : t(
                  "Saskaņā ar sastāvu",
                  "Согласно составу",
                  "As listed in composition",
                )}
          </dd>
        </div>
        <div>
          <dt>
            {t(
              "Paredzētais lietojums",
              "Предполагаемое применение",
              "Intended placement",
            )}
          </dt>
          <dd>
            {t(
              "Iekštelpu dekora koncepts; āra noturība nav apstiprināta",
              "Концепт интерьерного декора; уличная стойкость не подтверждена",
              "Indoor decoration concept; outdoor durability unverified",
            )}
          </dd>
        </div>
        <div>
          <dt>{t("Svars", "Вес", "Weight")}</dt>
          <dd>{t("Nav apstiprināts", "Не подтверждён", "Not confirmed")}</dd>
        </div>
        <div>
          <dt>{t("Sagatavošana", "Подготовка", "Preparation")}</dt>
          <dd>
            {p.seasonal?.preparationDays || 1}{" "}
            {t(
              "dienas · Demo aplēse",
              "дня · Демо-оценка",
              "days · Demo estimate",
            )}{" "}
            ·{" "}
            {t(
              "Florista komplektēšanas koncepts",
              "Концепция сборки флористом",
              "Florist assembly concept",
            )}
          </dd>
        </div>
      </dl>
      <p>{pick(p.care, s.lang)}</p>
      {p.seasonal && (
        <p className="product-safety">{pick(p.seasonal.safety, s.lang)}</p>
      )}
      <div className="atelier-links">
        <Link to="/christmas-collections">
          {t(
            "Ieteiktie dāvanu komplekti",
            "Рекомендуемые подарочные наборы",
            "Recommended gift bundles",
          )}{" "}
          →
        </Link>
        <Link to="/christmas-preorders">
          {t(
            "Svētku priekšpasūtījums",
            "Праздничный предзаказ",
            "Christmas preorder",
          )}{" "}
          →
        </Link>
        <Link to="/order-confidence">
          {t(
            "Sagatavošanas foto demo",
            "Демо-фото подготовки",
            "Preparation photo demo",
          )}{" "}
          →
        </Link>
      </div>
    </section>
  );
}
