import { ArrowUpRight, Flower2, Heart, Plus, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { categories, img, money, pick, type Product } from "./data";
import { AvailabilityBadge, CompareButton } from "./feature-ui";
import { useT } from "./i18n";
import { useStore } from "./store";
export { useT } from "./i18n";
export function IconButton({
  label,
  children,
  onClick,
  active = false,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`icon-btn ${active ? "active" : ""}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function Demo() {
  const t = useT();
  return (
    <div className="demo">
      <Flower2 size={15} />
      {t(
        "Interaktīva demonstrācija · Nav īstu pasūtījumu vai maksājumu",
        "Интерактивная демонстрация · Без реальных заказов и платежей",
        "Interactive demo · No real orders or payments",
      )}
    </div>
  );
}
export function Title({
  kicker,
  title,
  description,
  children,
}: {
  kicker?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {kicker && <span className="eyebrow">{kicker}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function Empty({ text }: { text: string }) {
  const t = useT();
  return (
    <div className="empty">
      <Flower2 size={40} />
      <h3>{text}</h3>
      <Link className="btn" to="/shop">
        {t("Atklāt kolekciju", "Открыть коллекцию", "Discover the collection")}{" "}
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}
export function ProductCard({
  p,
  onQuick,
}: {
  p: Product;
  onQuick?: (p: Product) => void;
}) {
  const { s, set, add, toast } = useStore();
  const t = useT();
  const saved = s.wishlist.includes(p.id);
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/product/${p.id}`}>
          <img
            src={img(p.photo)}
            alt={
              p.seasonal
                ? t(
                    "Svētku stila iedvesmas attēls",
                    "Изображение праздничного стиля",
                    "Holiday style inspiration image",
                  )
                : pick(p.name, s.lang)
            }
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = p.seasonal
                ? `${import.meta.env.BASE_URL}favicon.svg`
                : img("1525310072745-f49212b5ac6d");
              e.currentTarget.alt = t(
                "Attēls nav pieejams",
                "Изображение недоступно",
                "Image unavailable",
              );
            }}
          />
        </Link>
        {p.seasonal && (
          <span className="seasonal-badge">CHRISTMAS 2026 / 2027</span>
        )}
        {p.stock < 3 && (
          <span className="badge">
            {t("Mazā izlasē", "Малая серия", "Small batch")}
          </span>
        )}
        <IconButton
          label={t(
            "Saglabāt vēlmju sarakstā",
            "Сохранить в избранное",
            "Save to wishlist",
          )}
          active={saved}
          onClick={() =>
            set((o) => ({
              ...o,
              wishlist: saved
                ? o.wishlist.filter((x) => x !== p.id)
                : [...o.wishlist, p.id],
            }))
          }
        >
          <Heart size={19} fill={saved ? "currentColor" : "none"} />
        </IconButton>
        {onQuick && (
          <button type="button" className="quick" onClick={() => onQuick(p)}>
            {t("Ātrais skats", "Быстрый просмотр", "Quick view")}
          </button>
        )}
      </div>
      {p.seasonal && (
        <small className="concept-caption">
          {t(
            "Stila iedvesma · Demo produkts",
            "Пример стиля · Демо-товар",
            "Style inspiration · Demo product",
          )}
        </small>
      )}
      <div className="product-meta">
        <span>{pick(categories[p.category], s.lang)}</span>
        <span>€</span>
      </div>
      <div className="product-bottom">
        <Link to={`/product/${p.id}`}>
          <h3>{pick(p.name, s.lang)}</h3>
          <span>{money(p.price, s.lang)}</span>
        </Link>
        <IconButton
          label={t("Pievienot grozam", "Добавить в корзину", "Add to bag")}
          onClick={() => {
            if (!add(p.id)) return;
            toast(
              t(
                "Pievienots grozam",
                "Добавлено в корзину",
                "Added to your bag",
              ),
            );
          }}
        >
          <Plus size={19} />
        </IconButton>
      </div>
      <div className="product-utilities">
        <AvailabilityBadge p={p} />
        <CompareButton id={p.id} />
      </div>
    </article>
  );
}
export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    const previous = document.activeElement as HTMLElement;
    el?.showModal();
    return () => {
      el?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <IconButton label="Close / Aizvērt / Закрыть" onClick={close}>
          <X />
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}
