import {
  ArrowUpRight,
  Check,
  Heart,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  categories,
  colors,
  future,
  img,
  money,
  occasions,
  pick,
  type Product,
} from "./data";
import {
  availability,
  cartTotals,
  consumeInventory,
  linePrice,
  variantPrice,
} from "./domain";
import {
  AvailabilityBadge,
  CompareButton,
  PassportSnippet,
  PhotoPreview,
} from "./feature-ui";
import type { ProductOptions } from "./models";
import { uid, useStore } from "./store";
import { Demo, Empty, IconButton, Modal, ProductCard, Title, useT } from "./ui";
export default function Shop() {
  const loc = useLocation();
  if (loc.pathname === "/cart") return <Cart />;
  if (loc.pathname === "/checkout") return <Checkout />;
  if (loc.pathname.startsWith("/product/")) return <ProductDetail />;
  return <Catalog />;
}
function Catalog() {
  const { s } = useStore();
  const t = useT();
  const [params, setParams] = useSearchParams();
  const [q, query] = useState("");
  const [sort, sorting] = useState("featured");
  const [color, setColor] = useState("");
  const [filters, setFilters] = useState(false);
  const [quick, setQuick] = useState<Product | null>(null);
  const cat = params.get("category") || "";
  const occasion = params.get("occasion") || "";
  const available = params.get("availability") || "";
  const max = Number(params.get("max") || 150);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };
  const items = s.catalog
    .filter(
      (p) =>
        (!q ||
          `${pick(p.name, s.lang)} ${pick(p.composition, s.lang)} ${pick(categories[p.category], s.lang)}`
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (cat === "" || p.category === Number(cat)) &&
        p.price <= max &&
        (occasion === "" || p.occasion === Number(occasion)) &&
        (color === "" || p.color === Number(color)) &&
        (!available ||
          (available === "now"
            ? availability(s, p.id).immediate
            : availability(s, p.id).quantity > 0)),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : sort === "name"
            ? pick(a.name, s.lang).localeCompare(pick(b.name, s.lang))
            : 0,
    );
  return (
    <div className="page">
      <Title
        kicker={t(
          "IZVĒLĒTS AR SIRDI",
          "ВЫБРАНО С ДУШОЙ",
          "GATHERED WITH FEELING",
        )}
        title={t(
          "Ziedi katram stāstam.",
          "Цветы для каждой истории.",
          "Flowers for every story.",
        )}
        description={t(
          "No maza prieka līdz neaizmirstamam žestam. Atrodi savējo.",
          "От маленькой радости до незабываемого жеста. Найдите свой букет.",
          "From little joys to unforgettable gestures. Find your flowers.",
        )}
      >
        <Link className="btn outline" to="/customize">
          {t("Izveidot savu", "Создать свой", "Make it yours")}
          <ArrowUpRight size={17} />
        </Link>
      </Title>
      <Demo />
      <div className="catalog-toolbar">
        <div className="search-input">
          <Search size={18} />
          <input
            aria-label={t(
              "Meklēt produktus",
              "Поиск товаров",
              "Search products",
            )}
            placeholder={t(
              "Meklē ziedus, noskaņu…",
              "Ищите цветы, настроение…",
              "Search flowers, a feeling…",
            )}
            value={q}
            onChange={(e) => query(e.target.value)}
          />
        </div>
        <button
          className="btn outline filter-toggle"
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal size={17} />
          {t("Filtri", "Фильтры", "Filters")}
        </button>
        <span className="muted results">
          {items.length} {t("izvēles", "вариантов", "lovely finds")}
        </span>
        <select
          aria-label={t("Kārtot", "Сортировка", "Sort")}
          value={sort}
          onChange={(e) => sorting(e.target.value)}
        >
          <option value="featured">
            {t("Florista izlase", "Выбор флориста", "Florist’s selection")}
          </option>
          <option value="low">
            {t("Cena: augoši", "Цена: по возрастанию", "Price: low to high")}
          </option>
          <option value="high">
            {t("Cena: dilstoši", "Цена: по убыванию", "Price: high to low")}
          </option>
          <option value="name">{t("Nosaukums", "Название", "Name")}</option>
        </select>
      </div>
      <div className="catalog-layout">
        <aside className={filters ? "filters visible" : "filters"}>
          <label>
            {t("Pieejamība", "Доступность", "Availability")}
            <select
              value={available}
              onChange={(e) => update("availability", e.target.value)}
            >
              <option value="">
                {t(
                  "Visi demo produkti",
                  "Все демо-товары",
                  "All demo products",
                )}
              </option>
              <option value="stock">
                {t("Demo krājumā", "В демо-запасе", "In demo stock")}
              </option>
              <option value="now">
                {t(
                  "Demo automātā tagad",
                  "В демо-автомате сейчас",
                  "In the demo machine now",
                )}
              </option>
            </select>
          </label>
          <Link className="text-link" to="/match">
            Flower Match <ArrowUpRight size={15} />
          </Link>
          <h4>{t("Kolekcijas", "Коллекции", "Collections")}</h4>
          <button
            className={!cat ? "chosen" : ""}
            onClick={() => update("category", "")}
          >
            {t(
              "Visi ziedi un dāvanas",
              "Все цветы и подарки",
              "All flowers & gifts",
            )}
          </button>
          {categories.map((c, i) => (
            <button
              className={cat === String(i) ? "chosen" : ""}
              key={i}
              onClick={() => update("category", String(i))}
            >
              {pick(c, s.lang)}
              <span>{s.catalog.filter((p) => p.category === i).length}</span>
            </button>
          ))}
          <h4>
            {t("Cena līdz", "Цена до", "Price up to")} {money(max, s.lang)}
          </h4>
          <input
            type="range"
            min="5"
            max="150"
            step="5"
            value={max}
            aria-label={t(
              "Maksimālā cena",
              "Максимальная цена",
              "Maximum price",
            )}
            onChange={(e) => update("max", e.target.value)}
          />
          <label>
            {t("Notikums", "Повод", "Occasion")}
            <select
              value={occasion}
              onChange={(e) => update("occasion", e.target.value)}
            >
              <option value="">
                {t("Visi notikumi", "Все поводы", "Every occasion")}
              </option>
              {occasions.map((x, i) => (
                <option key={i} value={i}>
                  {pick(x, s.lang)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("Krāsa", "Цвет", "Colour")}
            <select value={color} onChange={(e) => setColor(e.target.value)}>
              <option value="">
                {t("Visi toņi", "Все оттенки", "Every shade")}
              </option>
              {colors.map((x, i) => (
                <option key={i} value={i}>
                  {pick(x, s.lang)}
                </option>
              ))}
            </select>
          </label>
          <button
            className="text-link"
            onClick={() => {
              setParams({});
              setColor("");
              query("");
            }}
          >
            {t("Notīrīt filtrus", "Сбросить фильтры", "Clear filters")}
          </button>
          <div className="filter-note">
            <FlowerNote />
            <p>
              {t(
                "Katrs pušķis ir unikāls. Fotogrāfijas ilustrē stilu; ziedu sastāvs sezonā var mainīties.",
                "Каждый букет уникален. Фото иллюстрируют стиль; состав зависит от сезона.",
                "Each bouquet is one of a kind. Photography illustrates the style; stems may vary with the season.",
              )}
            </p>
          </div>
        </aside>
        <div className="catalog-products">
          {items.length ? (
            <div className="product-grid three">
              {items.map((p) => (
                <ProductCard key={p.id} p={p} onQuick={setQuick} />
              ))}
            </div>
          ) : (
            <Empty
              text={t(
                "Neatradām atbilstošus ziedus",
                "Подходящих цветов не найдено",
                "No flowers match these filters",
              )}
            />
          )}
        </div>
      </div>
      {quick && (
        <Modal title={pick(quick.name, s.lang)} close={() => setQuick(null)}>
          <ProductContent p={quick} compact />
        </Modal>
      )}
    </div>
  );
}
function FlowerNote() {
  return <span>✳</span>;
}
function ProductDetail() {
  const { s } = useStore();
  const { id } = useParams();
  const p = s.catalog.find((x) => x.id === id);
  const t = useT();
  if (!p)
    return (
      <Empty
        text={t("Produkts nav atrasts", "Товар не найден", "Product not found")}
      />
    );
  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/shop">{t("Kolekcija", "Коллекция", "Collection")}</Link>
        <span>/</span>
        <span>{pick(p.name, s.lang)}</span>
      </div>
      <ProductContent p={p} />
      <PhotoPreview p={p} />
      <section className="section related">
        <h2>
          {t(
            "Vēl mazliet iedvesmas",
            "Ещё немного вдохновения",
            "A little more inspiration",
          )}
        </h2>
        <div className="product-grid">
          {s.catalog
            .filter(
              (x) =>
                x.id !== p.id &&
                (x.category === p.category || x.color === p.color),
            )
            .slice(0, 4)
            .map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
        </div>
      </section>
    </div>
  );
}
function ProductContent({
  p,
  compact = false,
}: {
  p: Product;
  compact?: boolean;
}) {
  const { s, set, add, toast } = useStore();
  const t = useT();
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [card, setCard] = useState(false);
  const [msg, setMsg] = useState("");
  const [size, setSize] = useState<ProductOptions["size"]>("M");
  const [color, setColor] = useState(p.color);
  const [wrap, setWrap] = useState<ProductOptions["wrapping"]>("ivory");
  const [method, setMethod] = useState<"pickup" | "delivery">("pickup");
  const options: ProductOptions = {
    size,
    color,
    wrapping: wrap,
    card,
    extraGift: false,
    method,
  };
  const price = variantPrice(p, options);
  return (
    <div className={`product-detail ${compact ? "compact" : ""}`}>
      <div className="gallery">
        <div
          className="detail-window"
          onTouchStart={(e) => {
            e.currentTarget.dataset.startX = String(e.touches[0].clientX);
          }}
          onTouchEnd={(e) => {
            if (
              Math.abs(
                e.changedTouches[0].clientX -
                  Number(e.currentTarget.dataset.startX),
              ) > 35
            )
              setPhoto(photo ? 0 : 1);
          }}
        >
          <img
            className={photo ? "detail-image zoomed" : "detail-image"}
            src={img(p.photo, 1100)}
            alt={pick(p.name, s.lang)}
            onError={(e) => {
              e.currentTarget.src = img("1525310072745-f49212b5ac6d");
            }}
          />
        </div>
        <div className="thumbnails">
          {[0, 1].map((n) => (
            <button
              aria-label={
                n
                  ? t("Ziedu detaļa", "Детали цветов", "Flower detail")
                  : t("Pilns skats", "Полный вид", "Full view")
              }
              className={n === photo ? "selected" : ""}
              key={n}
              onClick={() => setPhoto(n)}
            >
              <img
                className={n ? "zoomed" : ""}
                src={img(p.photo, 150)}
                alt=""
              />
            </button>
          ))}
        </div>
      </div>
      <div className="detail-copy">
        <span className="eyebrow">{pick(categories[p.category], s.lang)}</span>
        <h1>{pick(p.name, s.lang)}</h1>
        <div className="detail-price">
          {money(price, s.lang)}
          <span>{t("Demo cena", "Демо-цена", "Demo price")}</span>
        </div>
        <p>{pick(p.description, s.lang)}</p>
        <AvailabilityBadge p={p} />
        <dl>
          <div>
            <dt>{t("Sastāvs", "Состав", "Composition")}</dt>
            <dd>{pick(p.composition, s.lang)}</dd>
          </div>
          <div>
            <dt>{t("Izmērs", "Размер", "Size")}</dt>
            <dd>{p.size}</dd>
          </div>
          <div>
            <dt>{t("Krāsa", "Цвет", "Colour")}</dt>
            <dd>{pick(colors[p.color], s.lang)}</dd>
          </div>
          <div>
            <dt>{t("Pieejamība", "Доступность", "Availability")}</dt>
            <dd>
              {t(
                "Saņemšana / piegāde · Demo",
                "Самовывоз / доставка · Демо",
                "Pickup / delivery · Demo",
              )}
            </dd>
          </div>
        </dl>
        <div className="form-grid product-options">
          <label>
            {t("Izmērs", "Размер", "Size option")}
            <select
              value={size}
              onChange={(e) =>
                setSize(e.target.value as ProductOptions["size"])
              }
            >
              <option>S</option>
              <option>M</option>
              <option>L</option>
            </select>
          </label>
          <label>
            {t("Krāsas izvēle", "Выбор оттенка", "Colour option")}
            <select
              value={color}
              onChange={(e) => setColor(Number(e.target.value))}
            >
              {colors.map((c, i) => (
                <option key={i} value={i}>
                  {pick(c, s.lang)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("Iesaiņojums", "Упаковка", "Wrapping")}
            <select
              value={wrap}
              onChange={(e) =>
                setWrap(e.target.value as ProductOptions["wrapping"])
              }
            >
              <option value="ivory">
                {t(
                  "Ziloņkaula papīrs",
                  "Бумага цвета слоновой кости",
                  "Ivory paper",
                )}
              </option>
              <option value="kraft">
                {t("Kraftpapīrs", "Крафт", "Natural kraft")}
              </option>
              <option value="rose">
                {t("Rozā papīrs", "Розовая бумага", "Dusty rose paper")}
              </option>
            </select>
          </label>
          <label>
            {t("Saņemšanas izvēle", "Выбор получения", "Fulfilment option")}
            <select
              value={method}
              onChange={(e) =>
                setMethod(e.target.value as "pickup" | "delivery")
              }
            >
              <option value="pickup">
                {t("Saņemšana", "Самовывоз", "Pickup")}
              </option>
              <option value="delivery">
                {t(
                  "Piegāde · €5 noformēšanā",
                  "Доставка · €5 при оформлении",
                  "Delivery · €5 at checkout",
                )}
              </option>
            </select>
          </label>
        </div>{" "}
        <label className="check-label">
          <input
            type="checkbox"
            checked={card}
            onChange={(e) => setCard(e.target.checked)}
          />
          {t("Pievienot kartīti", "Добавить открытку", "Add a greeting card")} +
          €5
        </label>
        <label>
          {t("Tava ziņa", "Ваше послание", "Your personal message")}
          <textarea
            maxLength={300}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={t(
              "Daži vārdi no sirds…",
              "Несколько слов от души…",
              "A few words from the heart…",
            )}
          />
        </label>
        <div className="buy-row">
          <div className="quantity">
            <IconButton
              label={t("Samazināt", "Уменьшить", "Decrease")}
              onClick={() => setQty(Math.max(1, qty - 1))}
            >
              <Minus size={16} />
            </IconButton>
            <span>{qty}</span>
            <IconButton
              label={t("Palielināt", "Увеличить", "Increase")}
              onClick={() => setQty(Math.min(20, qty + 1))}
            >
              <Plus size={16} />
            </IconButton>
          </div>
          <button
            className="btn"
            disabled={availability(s, p.id).quantity < 1}
            onClick={() => {
              if (add(p.id, qty, msg, undefined, options))
                toast(
                  t(
                    "Pušķis pievienots grozam",
                    "Букет добавлен в корзину",
                    "Your bouquet is in the bag",
                  ),
                );
            }}
          >
            <ShoppingBag size={17} />
            {t("Pievienot grozam", "Добавить в корзину", "Add to bag")}
          </button>
          <IconButton
            label={t("Saglabāt", "Сохранить", "Save")}
            active={s.wishlist.includes(p.id)}
            onClick={() =>
              set((o) => ({
                ...o,
                wishlist: o.wishlist.includes(p.id)
                  ? o.wishlist.filter((x) => x !== p.id)
                  : [...o.wishlist, p.id],
              }))
            }
          >
            <Heart size={21} />
          </IconButton>
        </div>
        <div className="detail-feature-links">
          <CompareButton id={p.id} />
          <Link className="text-link" to={`/secret-gift?product=${p.id}`}>
            {t(
              "Pārvērst pārsteigumā",
              "Превратить в сюрприз",
              "Make it a surprise",
            )}
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <PassportSnippet p={p} />
        <Link className="text-link" to={`/reserve?product=${p.id}`}>
          {t(
            "Rezervēt īpašam datumam",
            "Зарезервировать на особую дату",
            "Reserve for a special date",
          )}
          <ArrowUpRight size={16} />
        </Link>
        <details open>
          <summary>
            {t(
              "Kopšanas padomi",
              "Советы по уходу",
              "A little care goes a long way",
            )}
          </summary>
          <p>
            {p.category === 7 || p.category === 8
              ? t(
                  "Sargā no mitruma un tiešiem saules stariem. Neliec ūdenī.",
                  "Берегите от влаги и прямого солнца. Не ставьте в воду.",
                  "Keep away from moisture and direct sunlight. Do not place in water.",
                )
              : p.category > 8
                ? t(
                    "Uzglabā sausā vietā. Ievēro komplektā iekļautos norādījumus.",
                    "Храните в сухом месте. Следуйте прилагаемым инструкциям.",
                    "Store in a dry place and follow the included care instructions.",
                  )
                : t(
                    "Atjauno kātu griezumu, maini ūdeni katru otro dienu un novieto vēsumā, prom no saules.",
                    "Подрежьте стебли, меняйте воду через день, держите в прохладе вдали от солнца.",
                    "Trim stems, refresh water every other day and keep cool, away from direct sunlight.",
                  )}
          </p>
        </details>
        <Demo />
      </div>
    </div>
  );
}
function Cart() {
  const { s, set } = useStore();
  const t = useT();
  const [code, setCode] = useState(s.promo);
  const [error, setError] = useState("");
  const totals = cartTotals(s);
  const total = totals.subtotal;
  return (
    <div className="page">
      <Title
        kicker={t(
          "GATAVS IEPRIECINĀT",
          "ГОТОВЫ ДАРИТЬ РАДОСТЬ",
          "A LITTLE HAPPINESS, READY TO GO",
        )}
        title={t(
          "Tavs ziedu grozs",
          "Ваша цветочная корзина",
          "Your bag of lovely things",
        )}
      />
      <Demo />
      {!s.cart.length ? (
        <Empty
          text={t(
            "Tavs grozs vēl gaida ziedus",
            "Ваша корзина ждёт цветов",
            "Your bag is waiting to bloom",
          )}
        />
      ) : (
        <div className="checkout-layout">
          <div>
            {s.cart.map((x, i) => {
              const p = s.catalog.find((p) => p.id === x.id)!;
              return (
                <div className="cart-line" key={`${x.id}-${i}`}>
                  <Link to={`/product/${p.id}`}>
                    <img src={img(p.photo, 200)} alt={pick(p.name, s.lang)} />
                  </Link>
                  <div>
                    <Link to={`/product/${p.id}`}>
                      <h3>{pick(p.name, s.lang)}</h3>
                    </Link>
                    <span>{money(linePrice(x, s.catalog), s.lang)}</span>
                    {x.note && <p className="muted">{x.note}</p>}
                    <div className="quantity">
                      <IconButton
                        label={t("Samazināt", "Уменьшить", "Decrease")}
                        onClick={() =>
                          set((o) => ({
                            ...o,
                            cart: o.cart.map((a, k) =>
                              k === i
                                ? { ...a, qty: Math.max(1, a.qty - 1) }
                                : a,
                            ),
                          }))
                        }
                      >
                        <Minus size={14} />
                      </IconButton>
                      {x.qty}
                      <IconButton
                        label={t("Palielināt", "Увеличить", "Increase")}
                        onClick={() =>
                          set((o) => ({
                            ...o,
                            cart: o.cart.map((a, k) =>
                              k === i
                                ? {
                                    ...a,
                                    qty: Math.min(
                                      20,
                                      a.qty + 1,
                                      Math.max(
                                        1,
                                        availability(o, a.id).quantity -
                                          o.cart
                                            .filter(
                                              (x, n) =>
                                                n !== k && x.id === a.id,
                                            )
                                            .reduce((n, x) => n + x.qty, 0),
                                      ),
                                    ),
                                  }
                                : a,
                            ),
                          }))
                        }
                      >
                        <Plus size={14} />
                      </IconButton>
                    </div>
                  </div>
                  <strong>
                    {money(linePrice(x, s.catalog) * x.qty, s.lang)}
                  </strong>
                  <IconButton
                    label={t("Noņemt", "Удалить", "Remove")}
                    onClick={() =>
                      set((o) => ({
                        ...o,
                        cart: o.cart.filter((_, k) => k !== i),
                      }))
                    }
                  >
                    <Trash2 size={17} />
                  </IconButton>
                </div>
              );
            })}
            <Link className="text-link" to="/shop">
              {t("Turpināt izvēlēties", "Продолжить покупки", "Keep exploring")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <aside className="panel order-summary">
            <h2>
              {t("Tavs kopsavilkums", "Ваш заказ", "Your little summary")}
            </h2>
            <div className="summary-line">
              <span>{t("Preces", "Товары", "Subtotal")}</span>
              <b>{money(total, s.lang)}</b>
            </div>
            {s.promo && (
              <div className="summary-line">
                <span>
                  {s.promo} · −
                  {s.campaigns.find((c) => c.code === s.promo)?.percent ?? 0}%
                </span>
                <b>−{money(totals.discount, s.lang)}</b>
              </div>
            )}
            <p className="muted">
              {t(
                "Piegādes demo maksa: €5. Saņemšana bez maksas.",
                "Демо-доставка: €5. Самовывоз бесплатно.",
                "Demo delivery: €5. Pickup is complimentary.",
              )}
            </p>
            <form
              className="inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  s.campaigns.some(
                    (c) => c.active && c.code === code.trim().toUpperCase(),
                  )
                ) {
                  set((o) => ({ ...o, promo: code.trim().toUpperCase() }));
                  setError("");
                } else {
                  setError(
                    t(
                      "Nederīgs kods. Izmēģini BLOOM10.",
                      "Неверный код. Попробуйте BLOOM10.",
                      "Unknown code. Try BLOOM10.",
                    ),
                  );
                }
              }}
            >
              <input
                aria-label={t("Atlaižu kods", "Промокод", "Promo code")}
                placeholder="BLOOM10"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="btn outline">
                {t("Piemērot", "Применить", "Apply")}
              </button>
            </form>
            <p role="alert" className="error">
              {error}
            </p>
            <div className="summary-total">
              <span>{t("Kopā", "Итого", "Total")}</span>
              <b>{money(totals.total, s.lang)}</b>
            </div>
            <Link className="btn full" to="/checkout">
              {t(
                "Uz demo noformēšanu",
                "Оформить демо-заказ",
                "Continue to demo checkout",
              )}
              <ArrowUpRight size={17} />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
function Checkout() {
  const { s, set } = useStore();
  const t = useT();
  const [method, setMethod] = useState(
    s.cart.some((x) => x.options?.method === "delivery")
      ? "delivery"
      : "pickup",
  );
  const [confirmed, setConfirmed] = useState("");
  const [error, setError] = useState("");
  const totals = cartTotals(s, method);
  const total = totals.total;
  if (confirmed)
    return (
      <div className="page confirmation">
        <div className="success-circle">
          <Check />
        </div>
        <span className="eyebrow">
          {t(
            "MAZS ŽESTS. LIELS PRIEKS.",
            "МАЛЕНЬКИЙ ЖЕСТ. БОЛЬШАЯ РАДОСТЬ.",
            "SMALL GESTURE. BIG FEELING.",
          )}
        </span>
        <h1>
          {t(
            "Tavs demo pasūtījums ir gatavs.",
            "Ваш демо-заказ готов.",
            "Your demo order is all set.",
          )}
        </h1>
        <p>
          {t("Pasūtījums", "Заказ", "Order")} #{confirmed.slice(0, 8)}
        </p>
        <Demo />
        <p>
          {t(
            "Nauda netika iekasēta. Nekas netiks piegādāts. Informācija redzama tavā demo profilā.",
            "Оплата не списана. Доставка не производится. Данные доступны в демо-кабинете.",
            "No money was charged and no delivery will take place. Your demo order is in your dashboard.",
          )}
        </p>
        <Link className="btn" to="/account">
          {t("Mans profils", "Мой кабинет", "View my dashboard")}
          <ArrowUpRight size={17} />
        </Link>
      </div>
    );
  if (!s.cart.length)
    return (
      <div className="page">
        <Empty
          text={t(
            "Vispirms izvēlies ziedus",
            "Сначала выберите цветы",
            "Let’s choose your flowers first",
          )}
        />
      </div>
    );
  return (
    <div className="page">
      <Title
        title={t(
          "Pēdējais solis līdz smaidam.",
          "Последний шаг до улыбки.",
          "One step closer to a smile.",
        )}
        description={t(
          "Lūdzu, izmanto tikai izdomātus datus. Tie netiek nosūtīti.",
          "Используйте только вымышленные данные. Они никуда не отправляются.",
          "Please use fictional details only. They are never sent anywhere.",
        )}
      />
      <Demo />
      <form
        className="checkout-layout"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          if (!form.checkValidity()) return;
          const data = new FormData(form);
          if (String(data.get("date")) < future(1)) {
            form.reportValidity();
            return;
          }
          const counts = new Map<string, number>();
          s.cart.forEach((x) =>
            counts.set(x.id, (counts.get(x.id) || 0) + x.qty),
          );
          if (
            [...counts].some(([id, qty]) => availability(s, id).quantity < qty)
          ) {
            setError(
              t(
                "Nepietiek demo krājumu. Atgriezies grozā un izvēlies alternatīvu.",
                "Недостаточно демо-запаса. Вернитесь в корзину и выберите замену.",
                "Not enough demo stock. Return to the bag and choose an alternative.",
              ),
            );
            return;
          }
          const id = uid();
          set((o) =>
            consumeInventory(
              {
                ...o,
                orders: [
                  ...o.orders,
                  {
                    id,
                    date: String(data.get("date")),
                    time: String(data.get("time")),
                    message: String(data.get("message")),
                    total,
                    items: o.cart,
                    method,
                  },
                ],
                cart: [],
                promo: "",
              },
              o.cart,
            ),
          );
          setConfirmed(id);
        }}
      >
        <div className="panel form-panel">
          <p className="error" role="alert">
            {error}
          </p>
          <h2>{t("Par tevi", "О вас", "A little about you")}</h2>
          <div className="form-grid">
            <label>
              {t("Demo vārds", "Вымышленное имя", "Fictional name")}
              <input
                required
                name="name"
                autoComplete="off"
                maxLength={80}
                placeholder="Alex Demo"
                defaultValue="Alex Demo"
              />
            </label>
            <label>
              {t("Demo e-pasts", "Вымышленный e-mail", "Fictional email")}
              <input
                required
                type="email"
                name="email"
                autoComplete="off"
                placeholder="alex@example.com"
                defaultValue="alex@example.com"
              />
            </label>
          </div>
          <h2>
            {t(
              "Saņemšanas veids",
              "Способ получения",
              "Your flowers, your way",
            )}
          </h2>
          <div className="choice-row">
            {["pickup", "delivery"].map((m) => (
              <button
                type="button"
                className={`choice ${method === m ? "selected" : ""}`}
                key={m}
                onClick={() => setMethod(m)}
              >
                {m === "pickup"
                  ? t(
                      "Saņemšana · bez maksas",
                      "Самовывоз · бесплатно",
                      "Pickup · complimentary",
                    )
                  : t("Piegāde · €5", "Доставка · €5", "Delivery · €5")}
              </button>
            ))}
          </div>
          {method === "delivery" && (
            <label>
              {t(
                "Izdomāta adrese",
                "Вымышленный адрес",
                "Fictional delivery address",
              )}
              <input
                required
                name="address"
                placeholder="Demo street 1, Daugavpils"
                maxLength={150}
              />
            </label>
          )}
          <div className="form-grid">
            <label>
              {t("Vēlamais datums", "Желаемая дата", "Preferred date")}
              <input
                name="date"
                required
                type="date"
                min={future(1)}
                defaultValue={future(1)}
              />
            </label>
            <label>
              {t("Vēlamais laiks", "Желаемое время", "Preferred time")}
              <select name="time">
                <option>09:00–12:00</option>
                <option>12:00–15:00</option>
                <option>15:00–18:00</option>
                <option>18:00–21:00</option>
              </select>
            </label>
          </div>
          <label>
            {t("Dāvanas ziņa", "Послание к подарку", "Gift message")}
            <textarea name="message" maxLength={300} />
          </label>
          <label className="check-label">
            <input type="checkbox" required />
            {t(
              "Saprotu, ka šis ir demonstrācijas pasūtījums.",
              "Я понимаю, что это демонстрационный заказ.",
              "I understand this is a demonstration order.",
            )}
          </label>
        </div>
        <aside className="panel order-summary">
          <h2>{t("Tavs pasūtījums", "Ваш заказ", "Your order")}</h2>
          {s.cart.map((x, i) => (
            <div className="summary-line" key={i}>
              <span>
                {pick(s.catalog.find((p) => p.id === x.id)!.name, s.lang)} ×{" "}
                {x.qty}
              </span>
              <b>{money(linePrice(x, s.catalog) * x.qty, s.lang)}</b>
            </div>
          ))}
          {s.promo && (
            <p>
              {s.promo} · −{money(totals.discount, s.lang)}
            </p>
          )}
          <div className="summary-line">
            <span>{t("Piegāde", "Доставка", "Delivery")}</span>
            <b>{money(method === "delivery" ? 5 : 0, s.lang)}</b>
          </div>
          <div className="summary-total">
            <span>{t("Kopā", "Итого", "Total")}</span>
            <b>{money(total, s.lang)}</b>
          </div>
          <p className="muted">
            {t(
              "Maksājums ir simulēts. Kartes dati nav nepieciešami.",
              "Оплата имитируется. Данные карты не нужны.",
              "Payment is simulated. No card details are required.",
            )}
          </p>
          <button className="btn full">
            {t(
              "Apstiprināt demo pasūtījumu",
              "Подтвердить демо-заказ",
              "Confirm demo order",
            )}
            <ArrowUpRight size={17} />
          </button>
        </aside>
      </form>
    </div>
  );
}
