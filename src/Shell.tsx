import {
  ChevronRight,
  Clock3,
  Compass,
  Download,
  Flower2,
  GitCompareArrows,
  RefreshCw,
  ShoppingBag,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { pick, type Text } from "./data";
import { useStore } from "./store";
import { useT } from "./ui";
const labels: Record<string, Text> = {
  "/gift-studio": ["Dāvanas 2.0", "Подарки 2.0", "Gift Builder 2.0"],
  "/wrapping-studio": [
    "Iesaiņošanas studija",
    "Студия упаковки",
    "Wrapping Studio",
  ],
  "/gift-finder": ["Dāvanu meklētājs", "Подбор подарков", "Gift Finder"],
  "/wishlists": ["Vēlmju saraksti", "Списки желаний", "Wishlists"],
  "/last-minute": ["Ātrās dāvanas", "Быстрые подарки", "Last-minute gifts"],
  "/christmas-collections": [
    "Svētku kolekcijas",
    "Праздничные коллекции",
    "Christmas Collections",
  ],
  "/christmas-preorders": ["Priekšpasūtījumi", "Предзаказы", "Preorders"],
  "/corporate-christmas": ["Uzņēmumiem", "Компаниям", "Corporate Christmas"],
  "/order-confidence": ["Sagatavošana", "Подготовка", "Order Preparation"],
  "/wreath-builder": [
    "Vainaga konstruktors",
    "Конструктор венка",
    "Wreath builder",
  ],
  "/advent-builder": [
    "Adventes kalendāra konstruktors",
    "Конструктор адвент-календаря",
    "Advent calendar builder",
  ],
  "/how-it-works": ["Kā tas darbojas", "Как это работает", "How it works"],
  "/guides": ["Ceļveži", "Статьи", "Guides"],
  "/christmas": ["Ziemassvētki 2026", "Рождество 2026", "Christmas 2026"],
  "/christmas-builder": [
    "Svētku dāvanu komplekts",
    "Праздничный подарочный набор",
    "Christmas gift builder",
  ],
  "/advent": ["Adventes kalendārs", "Адвент-календарь", "Advent calendar"],
  "/launch": ["Pirms atklāšanas", "До открытия", "Before we open"],
  "/themes": ["Dizainu galerija", "Галерея тем", "Theme Gallery"],
  "/notifications": ["Paziņojumi", "Уведомления", "Notifications"],
  "/shop": ["Ziedi un dāvanas", "Цветы и подарки", "Flowers & gifts"],
  "/discover": ["Atklāj", "Откройте", "Discover"],
  "/match": ["Flower Match", "Flower Match", "Flower Match"],
  "/available": ["Pieejams tagad", "Доступно сейчас", "Available now"],
  "/compare": ["Salīdzināšana", "Сравнение", "Comparison"],
  "/gift-builder": [
    "Budžeta dāvana",
    "Подарок по бюджету",
    "Budget gift builder",
  ],
  "/secret-gift": ["Slepenā dāvana", "Тайный подарок", "Secret gift"],
  "/planner": [
    "Gada dāvanu plāns",
    "План подарков на год",
    "Annual gift planner",
  ],
  "/customize": ["Tavs pušķis", "Ваш букет", "Your bouquet"],
  "/certificates": ["Dāvanu kartes", "Подарочные карты", "Gift certificates"],
  "/gifts": ["Dāvanas", "Подарки", "Gifts"],
  "/vending": ["Ziedi 24/7", "Цветы 24/7", "Flowers 24/7"],
  "/reserve": ["Rezervācija", "Бронирование", "Reservation"],
  "/delivery": [
    "Piegāde un saņemšana",
    "Доставка и самовывоз",
    "Delivery & pickup",
  ],
  "/cart": ["Grozs", "Корзина", "Your bag"],
  "/checkout": ["Demo noformēšana", "Демо-оформление", "Demo checkout"],
  "/reminders": ["Svarīgi datumi", "Важные даты", "Important dates"],
  "/subscriptions": ["Abonementi", "Подписки", "Subscriptions"],
  "/wishlist": ["Vēlmju saraksts", "Избранное", "Wishlist"],
  "/account": ["Mans demo profils", "Мой демо-кабинет", "My demo dashboard"],
  "/admin": [
    "Biznesa studija · Demo",
    "Бизнес-студия · Демо",
    "Business studio · Demo",
  ],
  "/about": [
    "Par Flower Paradise",
    "О Flower Paradise",
    "About Flower Paradise",
  ],
  "/faq": ["Jautājumi", "Вопросы", "FAQ"],
  "/contact": ["Saziņa", "Контакты", "Contact"],
  "/privacy": ["Privātums", "Конфиденциальность", "Privacy"],
  "/terms": ["Demo noteikumi", "Условия демо", "Demo terms"],
};
export function PageContext() {
  const { s } = useStore();
  const t = useT();
  const { pathname } = useLocation();
  const label =
    pathname === "/"
      ? "Daugavpils"
      : pathname.startsWith("/product/")
        ? pick(
            s.catalog.find((p) => p.id === pathname.split("/")[2])?.name ?? [
              "Produkts",
              "Товар",
              "Product",
            ],
            s.lang,
          )
        : pathname.startsWith("/passport/")
          ? t("Pušķa pase", "Паспорт букета", "Bouquet passport")
          : labels[pathname]
            ? pick(labels[pathname], s.lang)
            : "404";
  useEffect(() => {
    document.title = `${label} · Flower Paradise`;
    const desc = pick(
      [
        "Flower Paradise — ziedu un dāvanu demonstrācija Daugavpilij. Izvēlies pušķi, ieplāno dāvanu vai izmēģini saņemšanu 24/7.",
        "Flower Paradise — демонстрация цветов и подарков для Даугавпилса. Выберите букет, запланируйте подарок или попробуйте получение 24/7.",
        "Flower Paradise — a flower and gifting demonstration for Daugavpils. Choose a bouquet, plan a thoughtful gift or try 24/7 collection.",
      ],
      s.lang,
    );
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", desc);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", `${label} · Flower Paradise`);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", desc);
  }, [label, s.lang]);
  if (
    pathname === "/" ||
    pathname === "/admin" ||
    pathname.startsWith("/product/")
  )
    return null;
  return (
    <nav
      className="global-breadcrumb"
      aria-label={t("Ceļš uz lapu", "Путь к странице", "Breadcrumb")}
    >
      <Link to="/">{t("Sākums", "Главная", "Home")}</Link>
      <ChevronRight size={12} />
      <span aria-current="page">{label}</span>
    </nav>
  );
}
export function MobileNavigation() {
  const { s } = useStore();
  const t = useT();
  const { pathname } = useLocation();
  return (
    <>
      <nav
        className="mobile-bottom-nav"
        aria-label={t(
          "Mobilā navigācija",
          "Мобильная навигация",
          "Mobile navigation",
        )}
      >
        {[
          {
            url: "/shop",
            icon: <Flower2 size={20} />,
            label: t("Ziedi", "Цветы", "Flowers"),
          },
          {
            url: "/available",
            icon: <Clock3 size={20} />,
            label: t("Pieejams", "В наличии", "Ready now"),
          },
          {
            url: "/cart",
            icon: <ShoppingBag size={20} />,
            label: `${t("Grozs", "Корзина", "Bag")} (${s.cart.reduce((n, x) => n + x.qty, 0)})`,
          },
          {
            url: "/discover",
            icon: <Compass size={20} />,
            label: t("Atklāj", "Обзор", "Explore"),
          },
        ].map((x) => (
          <Link
            key={x.url}
            to={x.url}
            className={pathname === x.url ? "selected" : ""}
            aria-current={pathname === x.url ? "page" : undefined}
          >
            {x.icon}
            <span>{x.label}</span>
          </Link>
        ))}
      </nav>
      {s.comparison.length > 0 && pathname !== "/compare" && (
        <Link className="comparison-dock" to="/compare">
          <GitCompareArrows size={17} />
          {t("Salīdzināt", "Сравнить", "Compare")} ({s.comparison.length}/3)
          <ChevronRight size={14} />
        </Link>
      )}
    </>
  );
}
interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export function PWAControls() {
  const t = useT();
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [error, setError] = useState(false);
  const wantsUpdate = useRef(false);
  useEffect(() => {
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPrompt);
    };
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    let active = true;
    let reloading = false;
    const controller = () => {
      if (wantsUpdate.current && !reloading) {
        reloading = true;
        window.location.reload();
      }
    };
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`, {
          scope: import.meta.env.BASE_URL,
        })
        .then((reg) => {
          if (!active) return;
          if (reg.waiting) setWaiting(reg.waiting);
          reg.addEventListener("updatefound", () => {
            const worker = reg.installing;
            worker?.addEventListener("statechange", () => {
              if (
                worker.state === "installed" &&
                navigator.serviceWorker.controller &&
                active
              )
                setWaiting(worker);
            });
          });
        })
        .catch(() => {
          if (active) setError(true);
        });
      navigator.serviceWorker.addEventListener("controllerchange", controller);
    }
    return () => {
      active = false;
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      navigator.serviceWorker?.removeEventListener(
        "controllerchange",
        controller,
      );
    };
  }, []);
  return (
    <>
      {offline && (
        <div role="status" className="offline-status">
          <WifiOff size={14} />
          {t(
            "Bezsaistē · saglabātā demo pieredze",
            "Офлайн · сохранённая демо-версия",
            "Offline · cached demo experience",
          )}
        </div>
      )}
      {waiting ? (
        <div className="pwa-notice" role="status">
          <RefreshCw size={20} />
          <span>
            {t(
              "Pieejama jauna vietnes versija.",
              "Доступна новая версия сайта.",
              "A fresh version of the site is ready.",
            )}
          </span>
          <button
            className="btn"
            onClick={() => {
              wantsUpdate.current = true;
              waiting.postMessage({ type: "SKIP_WAITING" });
            }}
          >
            {t("Atjaunināt", "Обновить", "Refresh")}
          </button>
          <button
            className="icon-btn"
            aria-label={t("Vēlāk", "Позже", "Later")}
            onClick={() => setWaiting(null)}
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        install && (
          <div className="pwa-notice">
            <Download size={20} />
            <span>
              {t(
                "Flower Paradise tavā sākuma ekrānā.",
                "Flower Paradise на главном экране.",
                "A little paradise on your home screen.",
              )}
            </span>
            <button
              className="btn"
              onClick={async () => {
                await install.prompt();
                await install.userChoice;
                setInstall(null);
              }}
            >
              {t("Pievienot", "Добавить", "Install")}
            </button>
            <button
              className="icon-btn"
              aria-label={t("Vēlāk", "Позже", "Later")}
              onClick={() => setInstall(null)}
            >
              <X size={15} />
            </button>
          </div>
        )
      )}
      {error && (
        <div className="offline-status">
          {t(
            "Bezsaistes režīmu neizdevās sagatavot; tiešsaistes demo darbojas.",
            "Не удалось подготовить офлайн-режим; онлайн-демо работает.",
            "Offline mode could not be prepared; the online demo is available.",
          )}
        </div>
      )}
    </>
  );
}
