import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Flower2,
  Gift,
  Heart,
  Instagram,
  Leaf,
  MapPin,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { img } from "./data";
import HomeExtras from "./HomeExtras";
import { MobileNavigation, PageContext, PWAControls } from "./Shell";
import { useStore } from "./store";
import { Demo, IconButton, ProductCard, useT } from "./ui";
const Shop = lazy(() => import("./Shop"));
const Experiences = lazy(() => import("./Experiences"));
const Dashboard = lazy(() => import("./Dashboard"));
const Discovery = lazy(() => import("./Discovery"));
const Personal = lazy(() => import("./Personal"));
const Info = lazy(() => import("./Info"));
export default function App() {
  const { s, set } = useStore();
  const t = useT();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    setMenu(false);
  }, [location.pathname]);
  const nav = [
    ["/shop", t("Ziedi un dāvanas", "Цветы и подарки", "Flowers & gifts")],
    ["/vending", t("Ziedi 24/7", "Цветы 24/7", "Flowers 24/7")],
    ["/subscriptions", t("Abonementi", "Подписки", "Subscriptions")],
    ["/discover", t("Atklāj", "Откройте", "Discover")],
  ];
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        {t("Uz saturu", "К содержимому", "Skip to content")}
      </a>
      <div className="announcement">
        <span>
          <MapPin size={12} /> Daugavpils, Latvia
        </span>
        <span>
          {t(
            "Skaisti mirkļi negaida. Ziedi — jebkurā laikā.",
            "Красивые моменты не ждут. Цветы — в любое время.",
            "Beautiful moments don’t wait. Flowers, around the clock.",
          )}
        </span>
        <Link to="/vending">
          {t("Iepazīsti 24/7", "Узнать о 24/7", "Discover 24/7")}{" "}
          <ArrowUpRight size={12} />
        </Link>
      </div>
      <header>
        <Link to="/" className="brand">
          <Flower2 strokeWidth={1} />
          <span>
            FLOWER PARADISE<small>FLOWERS. FEELINGS. ALWAYS.</small>
          </span>
        </Link>
        <nav className={menu ? "open" : ""}>
          {nav.map(([url, label]) => (
            <NavLink to={url} key={url}>
              {label}
            </NavLink>
          ))}
          <NavLink className="mobile-only" to="/reminders">
            {t("Svarīgi datumi", "Важные даты", "Important dates")}
          </NavLink>
          <button
            className="mobile-only menu-theme"
            onClick={() => set((o) => ({ ...o, dark: !o.dark }))}
          >
            {t("Mainīt tēmu", "Сменить тему", "Toggle colour mode")}
          </button>
          <NavLink className="mobile-only" to="/gifts">
            {t("Dāvanas", "Подарки", "Gifts")}
          </NavLink>
          <NavLink className="mobile-only" to="/admin">
            {t("Administrācija · Demo", "Администратор · Демо", "Admin · Demo")}
          </NavLink>
        </nav>
        <div className="header-actions">
          <select
            aria-label={t("Valoda", "Язык", "Language")}
            value={s.lang}
            onChange={(e) =>
              set((o) => ({ ...o, lang: e.target.value as typeof s.lang }))
            }
          >
            <option value="lv">LV</option>
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
          <IconButton
            label={t(
              "Mainīt krāsu režīmu",
              "Сменить тему",
              "Toggle colour mode",
            )}
            onClick={() => set((o) => ({ ...o, dark: !o.dark }))}
          >
            {s.dark ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          <Link
            className="icon-btn hide-small"
            aria-label={t("Meklēt", "Поиск", "Search")}
            to="/shop"
          >
            <Search size={19} />
          </Link>
          <Link
            className="icon-btn hide-small"
            aria-label={t("Vēlmju saraksts", "Избранное", "Wishlist")}
            to="/account?tab=wishlist"
          >
            <Heart size={19} />
          </Link>
          <Link
            className="icon-btn"
            aria-label={t("Mans profils", "Мой кабинет", "My dashboard")}
            to="/account"
          >
            <UserRound size={19} />
          </Link>
          <Link
            className="icon-btn bag"
            aria-label={t("Iepirkumu grozs", "Корзина", "Shopping bag")}
            to="/cart"
          >
            <ShoppingBag size={19} />
            <b>{s.cart.reduce((a, x) => a + x.qty, 0)}</b>
          </Link>
          <IconButton
            label={t("Izvēlne", "Меню", "Menu")}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu className="menu-icon" />}
          </IconButton>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <PageContext />
        <Suspense
          fallback={
            <div className="skeleton">
              <span />
              <span />
              <span />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            {[
              "/discover",
              "/match",
              "/available",
              "/compare",
              "/gift-builder",
            ].map((path) => (
              <Route key={path} path={path} element={<Discovery />} />
            ))}
            {["/secret-gift", "/planner"].map((path) => (
              <Route key={path} path={path} element={<Personal />} />
            ))}
            {[
              "/about",
              "/delivery",
              "/faq",
              "/contact",
              "/privacy",
              "/terms",
              "/passport/:id",
            ].map((path) => (
              <Route key={path} path={path} element={<Info />} />
            ))}
            <Route path="/wishlist" element={<Dashboard />} />
            <Route path="/product/:id" element={<Shop />} />
            <Route path="/cart" element={<Shop />} />
            <Route path="/checkout" element={<Shop />} />
            <Route path="/vending" element={<Experiences />} />
            <Route path="/reserve" element={<Experiences />} />
            <Route path="/customize" element={<Experiences />} />
            <Route path="/gifts" element={<Experiences />} />
            <Route path="/certificates" element={<Experiences />} />
            <Route path="/subscriptions" element={<Experiences />} />
            <Route path="/reminders" element={<Dashboard />} />
            <Route path="/account" element={<Dashboard />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>404</h1>
                  <Link className="btn" to="/">
                    Flower Paradise <ArrowRight />
                  </Link>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <MobileNavigation />
      <PWAControls />
    </>
  );
}
function Home() {
  const { s } = useStore();
  const t = useT();
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src={img("1561181286-d3fee7d55364", 1800)}
          alt={t(
            "Maigu rozā un krēmkrāsas ziedu kompozīcija",
            "Нежная композиция розовых и кремовых цветов",
            "Soft pink and cream floral arrangement",
          )}
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <span className="eyebrow light">
            <span />{" "}
            {t(
              "MAZIEM UN LIELIEM DZĪVES MIRKĻIEM",
              "ДЛЯ МАЛЕНЬКИХ И БОЛЬШИХ МГНОВЕНИЙ",
              "FOR LIFE’S LITTLE & EXTRAORDINARY MOMENTS",
            )}
          </span>
          <h1>
            {t("Ziedi, kas pasaka", "Цветы, которые говорят", "Some feelings")}
            <br />
            <em>{t("vairāk.", "больше.", "deserve flowers.")}</em>
          </h1>
          <p>
            {t(
              "Rūpīgi veidoti pušķi. Sirsnīgas dāvanas. Un iespēja iepriecināt — jebkurā diennakts stundā.",
              "Букеты, созданные с заботой. Подарки от души. Возможность порадовать — в любое время суток.",
              "Thoughtfully gathered bouquets. Gifts from the heart. A little beauty, whenever the moment finds you.",
            )}
          </p>
          <div className="hero-buttons">
            <Link className="btn ivory" to="/shop">
              {t("Izvēlēties ziedus", "Выбрать цветы", "Shop the flowers")}
              <ArrowUpRight size={18} />
            </Link>
            <Link className="text-link white" to="/vending">
              {t(
                "Iepazīt 24/7 saņemšanu",
                "Открыть получение 24/7",
                "Explore 24/7 pickup",
              )}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="hero-note">
            <Flower2 size={22} strokeWidth={1} />
            <span>
              {t(
                "Radīts ar mīlestību. Daugavpilī.",
                "Создано с любовью. В Даугавпилсе.",
                "Made with love. Rooted in Daugavpils.",
              )}
            </span>
          </div>
        </motion.div>
        <div className="hero-stamp">
          <Flower2 size={26} strokeWidth={1} />
          <span>
            {t("SKAISTUMS", "КРАСОТА", "BEAUTY")}
            <br />
            {t("JEBKURĀ LAIKĀ", "В ЛЮБОЕ ВРЕМЯ", "AROUND THE CLOCK")}
          </span>
          <b>24/7</b>
        </div>
        <div className="hero-count">
          <small>
            {t(
              "ZIEDI. SAJŪTAS. VIENMĒR.",
              "ЦВЕТЫ. ЧУВСТВА. ВСЕГДА.",
              "FLOWERS. FEELINGS. ALWAYS.",
            )}
          </small>
        </div>
      </section>
      <div className="benefits">
        <span>
          <Leaf />
          {t(
            "Rūpīgi izvēlēti ziedi",
            "Тщательно отобранные цветы",
            "Thoughtfully selected flowers",
          )}
        </span>
        <span>
          <Clock3 />
          {t(
            "24/7 saņemšanas koncepts",
            "Концепт получения 24/7",
            "24/7 pickup concept",
          )}
        </span>
        <span>
          <Gift />
          {t(
            "Katra dāvana — personiska",
            "Каждый подарок — личный",
            "Every gift, a little more personal",
          )}
        </span>
        <span>
          <MapPin />
          {t(
            "No sirds, Daugavpilī",
            "От души, в Даугавпилсе",
            "From the heart of Daugavpils",
          )}
        </span>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t("FLORISTA IZLASE", "ВЫБОР ФЛОРИСТА", "THE FLORIST’S EDIT")}
            </span>
            <h2>
              {t(
                "Mazliet skaistuma. Daudz sajūtu.",
                "Немного красоты. Много чувств.",
                "A little beauty. A lot of feeling.",
              )}
            </h2>
            <p>
              {t(
                "Atrodi pušķi, kas pasaka tieši to, ko vēlies.",
                "Найдите букет, который скажет именно то, что вы чувствуете.",
                "Find the bouquet that says what words sometimes can’t.",
              )}
            </p>
          </div>
          <Link className="text-link" to="/shop">
            {t("Visa kolekcija", "Вся коллекция", "Explore the collection")}{" "}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {s.catalog.slice(0, 4).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        <div className="price-links">
          <span>
            {t(
              "Skaisti žesti jebkuram budžetam",
              "Красивые жесты на любой бюджет",
              "Thoughtful gestures for every budget",
            )}
          </span>
          {[20, 40, 100].map((price) => (
            <Link key={price} to={`/shop?max=${price}`}>
              {t("Līdz", "До", "Under")} {moneyLocal(price)}{" "}
              <ArrowUpRight size={14} />
            </Link>
          ))}
        </div>
      </section>
      <HomeExtras />
      <section className="occasion-section section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t(
                "KATRAM STĀSTAM SAVI ZIEDI",
                "У КАЖДОЙ ИСТОРИИ СВОИ ЦВЕТЫ",
                "EVERY MOMENT HAS ITS FLOWERS",
              )}
            </span>
            <h2>
              {t(
                "Kāds ir tavs iemesls?",
                "Какой у вас повод?",
                "What’s your occasion?",
              )}
            </h2>
          </div>
          <Link className="text-link" to="/gifts">
            {t(
              "Dāvanu idejas",
              "Идеи подарков",
              "A little gifting inspiration",
            )}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="occasion-grid">
          {[
            [
              t("Dzimšanas dienai", "На день рождения", "Birthday wishes"),
              "1667489024245-7beb09ac43c5",
            ],
            [
              t("Ar mīlestību", "С любовью", "Just say, I love you"),
              "1518895949257-7621c3c786d7",
            ],
            [
              t("Vienkārši tāpat", "Просто так", "Just because"),
              "1519657603751-38e2d6e37f09",
            ],
          ].map(([label, photo], i) => (
            <Link
              to={`/shop?occasion=${i === 2 ? 3 : i}`}
              key={label}
              className="occasion-card"
            >
              <img src={img(photo)} alt={label} loading="lazy" />
              <div>
                <h3>{label}</h3>
                <ArrowUpRight size={22} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="vending-story">
        <div className="story-image">
          <img
            src={img("1680563899402-26c3a712831f", 1000)}
            alt={t(
              "Ziedi jebkurā laikā",
              "Цветы в любое время",
              "Flowers around the clock",
            )}
            loading="lazy"
          />
          <span className="round-label">
            24/7
            <br />
            <small>{t("AR MĪLESTĪBU", "С ЛЮБОВЬЮ", "WITH LOVE")}</small>
          </span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">
            {t(
              "ZIEDI NEGAIDA RĪTU",
              "ЦВЕТЫ НЕ ЖДУТ УТРА",
              "BEAUTY DOESN’T KEEP OFFICE HOURS",
            )}
          </span>
          <h2>
            {t("Vēls vakars?", "Поздний вечер?", "A late-night thought?")}
            <br />
            <em>
              {t(
                "Mīļš pārsteigums.",
                "Нежный сюрприз.",
                "An early-morning surprise.",
              )}
            </em>
          </h2>
          <p>
            {t(
              "Mūsu 24/7 ziedu automāta koncepts ļauj rezervēt pušķi un saņemt to sev ērtā laikā. Izmēģini četrus nodalījumus un atklāj, cik vienkārši var būt iepriecināt.",
              "Наш концепт цветочного автомата 24/7 позволяет зарезервировать букет и получить его в удобное время. Попробуйте четыре ячейки и узнайте, как легко дарить радость.",
              "Our 24/7 flower vending concept makes a thoughtful gesture wonderfully simple. Choose a bouquet, reserve your moment, and collect with your personal pickup code.",
            )}
          </p>
          <ol className="steps">
            {[
              t("Izvēlies savu pušķi", "Выберите букет", "Find your bouquet"),
              t(
                "Rezervē un saņem demo kodu",
                "Зарезервируйте и получите демо-код",
                "Reserve & receive a demo code",
              ),
              t(
                "Atver nodalījumu un pasmaidi",
                "Откройте ячейку и улыбнитесь",
                "Open your compartment. Make someone smile.",
              ),
            ].map((x, i) => (
              <li key={x}>
                <span>0{i + 1}</span>
                {x}
              </li>
            ))}
          </ol>
          <Link className="btn" to="/vending">
            {t(
              "Izmēģināt 24/7 pieredzi",
              "Попробовать получение 24/7",
              "Step inside the 24/7 experience",
            )}
            <ArrowUpRight size={18} />
          </Link>
          <small className="muted">
            {t(
              "Interaktīvs koncepts. Nav savienojuma ar īstu automātu.",
              "Интерактивный концепт. Не подключён к реальному автомату.",
              "An interactive concept. No connection to real hardware.",
            )}
          </small>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t("VAIRĀK NEKĀ ZIEDI", "БОЛЬШЕ, ЧЕМ ЦВЕТЫ", "MORE THAN FLOWERS")}
            </span>
            <h2>
              {t(
                "Rūpes ir detaļās.",
                "Забота — в деталях.",
                "Thoughtfulness, in every detail.",
              )}
            </h2>
          </div>
        </div>
        <div className="service-grid">
          {[
            {
              icon: <Flower2 />,
              title: t(
                "Tavs īpašais pušķis",
                "Ваш особенный букет",
                "A bouquet, uniquely yours",
              ),
              text: t(
                "Izvēlies ziedus, toņus un iesaiņojumu.",
                "Выберите цветы, оттенки и упаковку.",
                "Choose the stems, shades and finishing touches.",
              ),
              url: "/customize",
            },
            {
              icon: <Clock3 />,
              title: t(
                "Neaizmirsti svarīgo",
                "Помните о важном",
                "Never miss their moment",
              ),
              text: t(
                "Svarīgi datumi un sirsnīgi atgādinājumi.",
                "Важные даты и тёплые напоминания.",
                "Little reminders for the people who matter.",
              ),
              url: "/reminders",
            },
            {
              icon: <Leaf />,
              title: t(
                "Ziedi atkal un atkal",
                "Цветы снова и снова",
                "A regular dose of lovely",
              ),
              text: t(
                "Ziedu abonementi mājām un darbam.",
                "Цветочная подписка для дома и работы.",
                "Flower subscriptions for your home or workspace.",
              ),
              url: "/subscriptions",
            },
          ].map((x) => (
            <Link className="service-card" to={x.url} key={x.url}>
              {x.icon}
              <h3>{x.title}</h3>
              <p>{x.text}</p>
              <ArrowUpRight size={20} />
            </Link>
          ))}
        </div>
      </section>
      <section className="seasonal">
        <img
          src={img("1457089328109-e5d9bd499191", 1600)}
          alt={t("Sezonas ziedi", "Сезонные цветы", "Seasonal flowers")}
          loading="lazy"
        />
        <div>
          <span className="eyebrow">
            {t("SEZONAS MĪLESTĪBA", "ЛЮБОВЬ К СЕЗОНУ", "IN SEASON. IN LOVE.")}
          </span>
          <h2>{t("Dabas ritmā.", "В ритме природы.", "Let the season in.")}</h2>
          <p>
            {t(
              "Tekstūras, toņi un ziedi, kas padara šo brīdi īpašu.",
              "Фактуры, оттенки и цветы, которые делают этот момент особенным.",
              "Textures, tones and stems that make this moment feel a little more special.",
            )}
          </p>
          <Link to="/shop?category=5" className="btn ivory">
            {t(
              "Sezonas kolekcija",
              "Сезонная коллекция",
              "The seasonal collection",
            )}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="location-section">
        <div
          className="city-concept"
          aria-label={t(
            "Daugavpils atrašanās vietas koncepts",
            "Концепт расположения в Даугавпилсе",
            "Daugavpils location concept",
          )}
        >
          <div className="map-river" />
          <div className="map-grid" />
          <div className="map-label">
            <MapPin size={30} />
            <strong>Daugavpils</strong>
            <span>
              Flower Paradise · {t("Drīzumā", "Скоро", "Coming soon")}
            </span>
          </div>
        </div>
        <div className="city-copy">
          <span className="eyebrow">
            {t(
              "SAKNES DAUGAVPILĪ",
              "С КОРНЯМИ В ДАУГАВПИЛСЕ",
              "ROOTED IN DAUGAVPILS",
            )}
          </span>
          <h2>
            {t(
              "Tuvāk skaistiem mirkļiem.",
              "Ближе к прекрасным моментам.",
              "A little beauty, closer to you.",
            )}
          </h2>
          <p>
            {t(
              "Mēs veidojam jaunu ziedu saņemšanas konceptu Daugavpilij. Precīza adrese un atklāšanas datums tiks paziņots vēlāk. Šī karte ir ilustratīva vietas rezervācija.",
              "Мы создаём новый концепт получения цветов в Даугавпилсе. Точный адрес и дата открытия будут объявлены позже. Эта схема — иллюстрация будущей карты.",
              "We’re developing a new way to find flowers in Daugavpils. An operating address and launch date will be announced later. This illustration reserves a place for the future location map.",
            )}
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Daugavpils%2C%20Latvia"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            {t(
              "Daugavpils Google Maps",
              "Даугавпилс в Google Maps",
              "Explore Daugavpils on Google Maps",
            )}
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      <section className="section faq">
        <div>
          <span className="eyebrow">
            {t("MAZLIET SKAIDRĪBAS", "НЕМНОГО ЯСНОСТИ", "GOOD TO KNOW")}
          </span>
          <h2>
            {t("Jautājumi?", "Есть вопросы?", "A few things you might wonder.")}
          </h2>
          <p>
            {t(
              "Viss par mūsu demonstrācijas pieredzi.",
              "Всё о нашей демонстрации.",
              "A little clarity on our demonstration experience.",
            )}
          </p>
          <Link className="text-link" to="/reserve">
            {t(
              "Rezervēt nākotnes datumam",
              "Бронь на будущую дату",
              "Reserve a future moment",
            )}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div>
          {[
            [
              t(
                "Vai šeit var veikt īstu pasūtījumu?",
                "Можно оформить настоящий заказ?",
                "Can I place a real order?",
              ),
              t(
                "Šī ir pilnībā interaktīva demonstrācija. Pasūtījumi, cenas un maksājumi ir simulēti.",
                "Это интерактивная демонстрация. Заказы, цены и платежи имитируются.",
                "This is an interactive demonstration. Orders, prices and payments are simulated.",
              ),
            ],
            [
              t(
                "Kur atrodas Flower Paradise?",
                "Где находится Flower Paradise?",
                "Where is Flower Paradise?",
              ),
              t(
                "Koncepts tiek veidots Daugavpilij, Latvijā. Precīza darbības adrese vēl nav paziņota.",
                "Концепт разрабатывается для Даугавпилса, Латвия. Точный адрес пока не объявлен.",
                "The concept is being developed for Daugavpils, Latvia. An operating address has not been announced.",
              ),
            ],
            [
              t(
                "Kā darbojas saņemšana 24/7?",
                "Как работает получение 24/7?",
                "How does 24/7 collection work?",
              ),
              t(
                "Demonstrācijā izvēlies nodalījumu, rezervē pušķi un ievadi saņemšanas kodu. Īstais pakalpojums vēl tiek plānots.",
                "Выберите ячейку, зарезервируйте букет и введите код получения. Реальный сервис ещё планируется.",
                "Choose a compartment, reserve your bouquet and enter your demo pickup code. The real service is still being planned.",
              ),
            ],
            [
              t(
                "Kādi dati tiek saglabāti?",
                "Какие данные сохраняются?",
                "What information is saved?",
              ),
              t(
                "Tikai demo izvēles šajā pārlūkā. Nav īstu kontu, paziņojumu vai maksājumu. Ievadi tikai izdomātus datus.",
                "Только демо-настройки в этом браузере. Без реальных аккаунтов, уведомлений и платежей. Используйте вымышленные данные.",
                "Only demo preferences in this browser. No real accounts, notifications or payments. Please use fictional details.",
              ),
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <PlusSign />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <Demo />
    </>
  );
}
const moneyLocal = (n: number) => `€${n}`;
function PlusSign() {
  return <span className="plus-sign">+</span>;
}
function Footer() {
  const t = useT();
  const [done, setDone] = useState(false);
  return (
    <footer>
      <div className="newsletter">
        <div>
          <span className="eyebrow">
            {t(
              "VĒSTULES AR ZIEDIEM",
              "ПИСЬМА С ЦВЕТАМИ",
              "LET GOOD THINGS BLOOM",
            )}
          </span>
          <h2>
            {t(
              "Mazliet skaistuma tavā iesūtnē.",
              "Немного красоты в вашей почте.",
              "A little beauty in your inbox.",
            )}
          </h2>
          <p>
            {t(
              "Sezonas iedvesma un jaunumi. Pierakstīšanās demonstrācija.",
              "Сезонное вдохновение и новости. Демо-подписка.",
              "Seasonal inspiration & lovely things to come. Demo signup.",
            )}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          {done ? (
            <p className="success">
              <Check />
              {t(
                "Paldies! Demo pierakstīšanās pabeigta.",
                "Спасибо! Демо-подписка оформлена.",
                "Thank you! Your demo signup is complete.",
              )}
            </p>
          ) : (
            <>
              <label className="sr-only" htmlFor="newsletter">
                E-mail
              </label>
              <input
                id="newsletter"
                required
                type="email"
                placeholder={t(
                  "Tavs e-pasts (demo)",
                  "Ваш e-mail (демо)",
                  "Your email (demo)",
                )}
              />
              <button
                aria-label={t("Pierakstīties", "Подписаться", "Subscribe")}
              >
                <ArrowRight />
              </button>
            </>
          )}
        </form>
      </div>
      <div className="footer-grid">
        <div>
          <Link to="/" className="brand">
            <Flower2 strokeWidth={1} />
            <span>
              FLOWER PARADISE<small>FLOWERS. FEELINGS. ALWAYS.</small>
            </span>
          </Link>
          <p>
            {t(
              "Ziedi īpašiem mirkļiem. Un tiem, ko radām paši.",
              "Цветы для особых моментов. И тех, которые мы создаём сами.",
              "Flowers for special moments. And the ones we make special.",
            )}
          </p>
          <span className="location">
            <MapPin size={16} />
            Daugavpils, Latvia
          </span>
        </div>
        <div>
          <h4>{t("Atklāj", "Откройте", "Discover")}</h4>
          <Link to="/discover">
            {t("Visas iespējas", "Все возможности", "Explore the experience")}
          </Link>
          <Link to="/match">Flower Match</Link>
          <Link to="/available">
            {t("Pieejams tagad", "Доступно сейчас", "Available now")}
          </Link>
          <Link to="/compare">
            {t("Salīdzināšana", "Сравнение", "Comparison")}
          </Link>
          <Link to="/shop">
            {t("Ziedi un dāvanas", "Цветы и подарки", "Flowers & gifts")}
          </Link>
          <Link to="/customize">
            {t(
              "Izveido savu pušķi",
              "Создайте свой букет",
              "Create your bouquet",
            )}
          </Link>
          <Link to="/gifts">
            {t("Dāvanu kartes", "Подарочные карты", "Gift certificates")}
          </Link>
          <Link to="/subscriptions">
            {t("Abonementi", "Подписки", "Subscriptions")}
          </Link>
        </div>
        <div>
          <h4>{t("Tavi mirkļi", "Ваши моменты", "Your moments")}</h4>
          <Link to="/vending">
            {t("Ziedi 24/7", "Цветы 24/7", "Flowers 24/7")}
          </Link>
          <Link to="/reserve">
            {t("Rezervācija", "Бронирование", "Reservations")}
          </Link>
          <Link to="/planner">
            {t(
              "Gada dāvanu plāns",
              "План подарков на год",
              "Annual gift planner",
            )}
          </Link>
          <Link to="/secret-gift">
            {t("Slepenā dāvana", "Тайный подарок", "Secret gift")}
          </Link>
          <Link to="/reminders">
            {t("Atgādinājumi", "Напоминания", "Reminders")}
          </Link>
          <Link to="/account">
            {t("Mans demo profils", "Мой демо-кабинет", "My demo dashboard")}
          </Link>
        </div>
        <div>
          <h4>{t("Sadarbība", "Сотрудничество", "Let’s grow together")}</h4>
          <Link to="/about">
            {t("Mūsu stāsts", "Наша история", "Our story")}
          </Link>
          <Link to="/contact">{t("Saziņa", "Контакты", "Contact")}</Link>
          <Link to="/delivery">
            {t(
              "Piegāde un saņemšana",
              "Доставка и самовывоз",
              "Delivery & pickup",
            )}
          </Link>
          <Link to="/faq">{t("Jautājumi", "Вопросы", "FAQ")}</Link>
          <Link to="/gifts?corporate=1">
            {t("Ziedi uzņēmumiem", "Цветы для бизнеса", "Corporate flowers")}
          </Link>
          <Link to="/admin">
            {t(
              "Administrācija · Demo",
              "Администратор · Демо",
              "Administration · Demo",
            )}
          </Link>
          <Link to="/gifts?qr=1">
            {t(
              "QR saņemšanas koncepts",
              "Концепт получения по QR",
              "QR pickup concept",
            )}
          </Link>
          <span className="location">
            <Instagram size={16} />
            {t("Drīzumā", "Скоро", "Coming soon")}
          </span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Flower Paradise</span>
        <span>
          {t(
            "Demo koncepts · Visas cenas ir ilustratīvas",
            "Демо-концепт · Все цены иллюстративные",
            "Demo concept · All prices are illustrative",
          )}
        </span>
        <div className="footer-policy-links">
          <Link to="/privacy">
            {t("Privātums", "Конфиденциальность", "Privacy")}
          </Link>
          <Link to="/terms">
            {t("Demo noteikumi", "Условия демо", "Demo terms")}
          </Link>
        </div>
        <Link to="/account?tab=settings">
          {t(
            "Privātums un iestatījumi",
            "Конфиденциальность и настройки",
            "Privacy & preferences",
          )}
        </Link>
      </div>
    </footer>
  );
}
