import { Link } from "react-router-dom";
import { money, pick } from "./data";
import { variantPrice } from "./domain";
import { isVisible, wrappingPrice } from "./commerce";
import { useStore } from "./store";
import { useT } from "./ui";
import { CommercePage, Select, useDraft, WrappingEditor } from "./CommerceUI";
export default function WrappingStudio() {
  const { s, add, toast } = useStore();
  const t = useT();
  const [c, save] = useDraft("wrapping", "wrapping");
  const id = c.lines?.[0]?.id || "xm-076";
  const p = s.catalog.find((p) => p.id === id) || s.catalog[0];
  const options = {
    size: "M" as const,
    color: p.color,
    wrapping: "kraft" as const,
    card: false,
    extraGift: false,
    method: "pickup" as const,
    configuration: c,
  };
  return (
    <CommercePage
      title={[
        "Iesaiņošanas studija",
        "Студия подарочной упаковки",
        "Premium Gift Wrapping Studio",
      ]}
    >
      <div className="commerce-columns">
        <div className="panel form-panel">
          <Select
            label={t("Produkts", "Товар", "Product")}
            value={p.id}
            onChange={(v) => save({ ...c, lines: [{ id: v, qty: 1 }] })}
            choices={s.catalog
              .filter((p) => isVisible(p, s.commerce))
              .map((p) => ({ id: p.id, label: pick(p.name, s.lang) }))}
          />
          <WrappingEditor
            value={c.wrapping}
            onChange={(wrapping) => save({ ...c, wrapping })}
          />
        </div>
        <aside className="panel form-panel commerce-summary">
          <h2>{pick(p.name, s.lang)}</h2>
          <p>
            {t("Prece", "Товар", "Product")}: {money(p.price, s.lang)}
          </p>
          <p>
            {t(
              "Iesaiņojuma piemaksa",
              "Доплата за упаковку",
              "Packaging surcharge",
            )}
            : {money(wrappingPrice(c.wrapping), s.lang)}
          </p>
          <div className="summary-total">
            {money(variantPrice(p, options), s.lang)}
          </div>
          <button
            className="btn"
            onClick={() => {
              if (add(p.id, 1, c.wrapping?.message || "", undefined, options))
                toast(
                  t("Pievienots grozam", "Добавлено в корзину", "Added to bag"),
                );
            }}
          >
            {t(
              "Pievienot iesaiņotu dāvanu",
              "Добавить подарок с упаковкой",
              "Add wrapped gift to bag",
            )}
          </button>
          <Link to="/gift-studio">
            {t("Dāvanu komplekts", "Подарочный набор", "Gift bundle")} →
          </Link>
        </aside>
      </div>
    </CommercePage>
  );
}
