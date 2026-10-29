import {
  ArrowUpRight,
  Check,
  Clock3,
  Copy,
  Flower2,
  Gift,
  Leaf,
  Mail,
  MapPin,
  Printer,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { categories, colors, img, pick } from "./data";
import { dateKey, freshness, statusLabels } from "./domain";
import { PhotoPreview } from "./feature-ui";
import { useStore } from "./store";
import { Demo, Empty, Title, useT } from "./ui";
export default function Info() {
  const path = useLocation().pathname;
  return path.startsWith("/passport/") ? (
    <Passport />
  ) : path === "/about" ? (
    <About />
  ) : path === "/delivery" ? (
    <Delivery />
  ) : path === "/faq" ? (
    <FAQ />
  ) : path === "/contact" ? (
    <Contact />
  ) : (
    <Policy />
  );
}
function About() {
  const t = useT();
  return (
    <div className="page">
      <Title
        kicker={t(
          "ZIEDI. SAJŪTAS. VIENMĒR.",
          "ЦВЕТЫ. ЧУВСТВА. ВСЕГДА.",
          "FLOWERS. FEELINGS. ALWAYS.",
        )}
        title={t(
          "Saknes Daugavpilī. Sirds ziedos.",
          "Корни в Даугавпилсе. Сердце в цветах.",
          "Rooted in Daugavpils. Gathered with heart.",
        )}
        description={t(
          "Flower Paradise ir iecere padarīt sirsnīgu žestu pieejamāku — no rūpīgi veidota pušķa līdz diennakts saņemšanai.",
          "Flower Paradise — идея сделать тёплый жест доступнее: от продуманного букета до круглосуточного получения.",
          "Flower Paradise is a concept for making a thoughtful gesture a little easier — from a considered bouquet to around-the-clock collection.",
        )}
      />
      <div className="about-editorial">
        <img
          src={img("1487530811176-3780de880c2d", 1200)}
          alt={t(
            "Sezonas pušķis ar dabiskām faktūrām",
            "Сезонный букет с природными фактурами",
            "Seasonal bouquet with natural textures",
          )}
        />
        <div>
          <Flower2 size={38} strokeWidth={1} />
          <h2>
            {t(
              "Maziem mirkļiem ir liela nozīme.",
              "Маленькие моменты имеют большое значение.",
              "Little moments mean a lot.",
            )}
          </h2>
          <p>
            {t(
              "Dzīve ne vienmēr iekļaujas darba laikā. Mēs pētām ziedu automātu, iepriekšēju rezervāciju, dāvanu un atgādinājumu pieredzi, lai palīdzētu atcerēties svarīgo.",
              "Жизнь не всегда укладывается в часы работы. Мы исследуем цветочные автоматы, предварительную бронь, подарки и напоминания, чтобы помогать помнить о важном.",
              "Life doesn’t always fit opening hours. We’re exploring flower vending, planned collection, personal gifting and reminders that help you remember what matters.",
            )}
          </p>
          <p>
            {t(
              "Šī vietne ir pilnībā interaktīva demonstrācija, nevis strādājošs veikals. Cenas, krājumi, pasūtījumi un finanšu skaitļi ir paraugi. Precīza adrese un atklāšanas laiks vēl nav paziņots.",
              "Этот сайт — интерактивная демонстрация, а не действующий магазин. Цены, остатки, заказы и финансовые показатели — примеры. Точный адрес и дата открытия пока не объявлены.",
              "This website is an interactive demonstration, rather than an operating shop. Prices, inventory, orders and financial figures are samples. An address and opening date have not been announced.",
            )}
          </p>
          <Link className="btn" to="/discover">
            {t(
              "Iepazīt pieredzi",
              "Открыть возможности",
              "Explore the experience",
            )}
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
      <div className="service-grid section slim">
        {[
          [
            <Leaf key="l" />,
            t("Rūpīgi izvēlēts", "Выбрано с заботой", "Thoughtfully selected"),
            t(
              "Dabiskas faktūras un sezonas skaistums.",
              "Природные фактуры и красота сезона.",
              "Natural textures and the beauty of the season.",
            ),
          ],
          [
            <HeartIcon key="h" />,
            t(
              "Personiski no sirds",
              "Лично, от души",
              "Personal, from the heart",
            ),
            t(
              "Mazs žests, kas pasaka vairāk.",
              "Маленький жест, который говорит больше.",
              "A little gesture that says a little more.",
            ),
          ],
          [
            <Clock3 key="c" />,
            t("Tavā ritmā", "В вашем ритме", "Around your moments"),
            t(
              "Saņemšanas koncepts, kas pielāgojas dzīvei.",
              "Концепт получения в ритме вашей жизни.",
              "A collection concept that fits around life.",
            ),
          ],
        ].map(([icon, title, desc], i) => (
          <div className="service-card" key={i}>
            {icon}
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
      <Demo />
    </div>
  );
}
function HeartIcon() {
  return <Flower2 />;
}
function Delivery() {
  const t = useT();
  return (
    <div className="page">
      <Title
        kicker={t(
          "ZIEDI TAVĀ RITMĀ",
          "ЦВЕТЫ В ВАШЕМ РИТМЕ",
          "FLOWERS, ON YOUR TERMS",
        )}
        title={t(
          "No mūsu rokām tavējās.",
          "Из наших рук в ваши.",
          "From our hands to yours.",
        )}
        description={t(
          "Saņemšanas un piegādes iespēju demonstrācija Daugavpilij. Reāli piegādes rajoni, adrese un laiki vēl nav apstiprināti.",
          "Демонстрация самовывоза и доставки для Даугавпилса. Реальные зоны, адрес и график пока не подтверждены.",
          "A collection and delivery demonstration for Daugavpils. Real delivery areas, an address and opening hours are not confirmed.",
        )}
      />
      <Demo />
      <div className="service-grid delivery-options">
        {[
          {
            icon: <Clock3 />,
            title: t("Automāts 24/7", "Автомат 24/7", "24/7 vending"),
            price: t(
              "Saņemšana bez maksas",
              "Получение бесплатно",
              "Complimentary collection",
            ),
            body: t(
              "Izvēlies pieejamu demo nodalījumu. Rezervācija der 30 minūtes; vienreizējs kods atver nodalījumu pārlūkā.",
              "Выберите доступную демо-ячейку. Бронь действует 30 минут; одноразовый код открывает её в браузере.",
              "Choose an available demo compartment. Reservations last 30 minutes; a one-time code opens it in the browser.",
            ),
            url: "/vending",
          },
          {
            icon: <MapPin />,
            title: t(
              "Ieplānota saņemšana",
              "Запланированный самовывоз",
              "Planned collection",
            ),
            price: t(
              "Demo: bez maksas",
              "Демо: бесплатно",
              "Demo: complimentary",
            ),
            body: t(
              "Rezervē nākotnes datumu un izvēlies laiku. Adrese vēl nav paziņota; apstiprinājums ir tikai lokāla demonstrācija.",
              "Забронируйте будущую дату и время. Адрес пока не объявлен; подтверждение — локальная демонстрация.",
              "Reserve a future date and time. The address is not announced; confirmation is a local demo only.",
            ),
            url: "/reserve",
          },
          {
            icon: <Truck />,
            title: t("Dāvanu piegāde", "Доставка подарков", "Gift delivery"),
            price: "€5 · DEMO",
            body: t(
              "Izvēlies piegādi demo noformēšanā un izmanto izdomātu adresi. Nekas netiks nosūtīts vai piegādāts.",
              "Выберите доставку при демо-оформлении и укажите вымышленный адрес. Ничего не будет отправлено или доставлено.",
              "Select delivery in demo checkout and use a fictional address. Nothing will be dispatched or delivered.",
            ),
            url: "/shop",
          },
        ].map((x) => (
          <div className="service-card" key={x.url}>
            {x.icon}
            <h2>{x.title}</h2>
            <strong>{x.price}</strong>
            <p>{x.body}</p>
            <Link className="text-link" to={x.url}>
              {t("Izmēģināt", "Попробовать", "Try the demo")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        ))}
      </div>
      <div className="corporate-banner">
        <div>
          <h2>
            {t(
              "Skaistums ieplānotam mirklim.",
              "Красота к запланированному моменту.",
              "A little beauty, planned ahead.",
            )}
          </h2>
          <p>
            {t(
              "Personisks sveiciens un dāvanu noformējums pieejams pušķa lapā vai dāvanu konstruktorā.",
              "Личное поздравление и подарочное оформление доступны на странице букета или в конструкторе подарка.",
              "Add a personal greeting and gift finishing on the bouquet page or in the gift builder.",
            )}
          </p>
        </div>
        <Link className="btn outline" to="/gift-builder">
          {t("Izveidot dāvanu", "Собрать подарок", "Build a gift")}
          <Gift size={17} />
        </Link>
      </div>
    </div>
  );
}
function FAQ() {
  const { s } = useStore();
  const t = useT();
  const rows = [
    [
      t(
        "Vai var veikt īstu pasūtījumu?",
        "Можно оформить настоящий заказ?",
        "Can I place a real order?",
      ),
      t(
        "Nē. Visa iepirkšanās, maksājumi un rezervācijas ir demonstrācija šajā pārlūkā. Kartes dati netiek prasīti.",
        "Нет. Покупки, платежи и бронирования — демонстрация в этом браузере. Данные карты не запрашиваются.",
        "No. Shopping, payments and reservations are demonstrations in this browser. No card details are requested.",
      ),
    ],
    [
      t(
        "Vai automāts ir savienots ar īstu ierīci?",
        "Автомат подключён к реальному устройству?",
        "Is the vending machine connected to hardware?",
      ),
      t(
        "Nē. Četri nodalījumi un to atvēršana tiek simulēti. Kodam nav vērtības ārpus šīs vietnes.",
        "Нет. Четыре ячейки и их открытие имитируются. Код не действует вне этого сайта.",
        "No. Four compartments and their opening are simulated. Codes have no use outside this site.",
      ),
    ],
    [
      t(
        "Kur atrodas veikals?",
        "Где находится магазин?",
        "Where is the boutique?",
      ),
      t(
        "Koncepts tiek veidots Daugavpilij, Latvijā. Precīza darbības adrese un atklāšanas datums vēl nav apstiprināts.",
        "Концепт разрабатывается для Даугавпилса, Латвия. Точный адрес и дата открытия ещё не подтверждены.",
        "The concept is for Daugavpils, Latvia. An operating address and opening date are not confirmed.",
      ),
    ],
    [
      t(
        "Cik ilgi der demo saņemšanas kods?",
        "Сколько действует демо-код получения?",
        "How long does a demo pickup code last?",
      ),
      t(
        "Automāta rezervācija der 30 minūtes. Kodu var izmantot tikai vienreiz. Nākotnes rezervācijas ir atsevišķs simulēts plāns.",
        "Бронь автомата действует 30 минут. Код одноразовый. Будущие бронирования — отдельный имитируемый план.",
        "Vending reservations last 30 minutes and codes are single use. Future reservations are a separate simulated plan.",
      ),
    ],
    [
      t(
        "Vai Secret Gift ir privāts?",
        "Secret Gift защищён?",
        "Is Secret Gift private?",
      ),
      t(
        "Tā ir lokāla demonstrācija bez kontiem vai servera. Saite darbojas tikai ar datiem šajā pārlūkā un nenodrošina drošu kopīgošanu.",
        "Это локальная демонстрация без аккаунтов и сервера. Ссылка работает только с данными этого браузера и не обеспечивает защищённую передачу.",
        "It is a local demonstration without accounts or a server. Links work with this browser’s data only and do not provide secure sharing.",
      ),
    ],
    [
      t(
        "Vai tiek sūtīti atgādinājumi?",
        "Напоминания отправляются?",
        "Are reminder messages sent?",
      ),
      t(
        "Nē. E-pasts, Telegram un WhatsApp ir tikai priekšskatījumi. Abonementiem nav reālas periodiskas apmaksas.",
        "Нет. E-mail, Telegram и WhatsApp — только предпросмотр. У подписок нет реальных регулярных платежей.",
        "No. Email, Telegram and WhatsApp are previews only. Subscriptions have no real recurring billing.",
      ),
    ],
    [
      t(
        "Kā izdzēst savus demo datus?",
        "Как удалить мои демо-данные?",
        "How do I clear my demo data?",
      ),
      t(
        "Atver profila iestatījumus un izvēlies pilnu demo datu atiestatīšanu. Tas atjauno arī katalogu, partijas, izmaksas un nodalījumus.",
        "Откройте настройки кабинета и выберите полный сброс демо-данных. Он также восстанавливает каталог, партии, расходы и ячейки.",
        "Open dashboard preferences and use the complete demo reset. It also restores the catalog, inventory batches, costs and compartments.",
      ),
    ],
    [
      t(
        "Vai prognozētais svaigums ir garantija?",
        "Оценка свежести — гарантия?",
        "Is estimated freshness guaranteed?",
      ),
      t(
        "Nē. Svaiguma noteikumi ir konfigurējami paraugi, nevis kvalitātes garantija. Dzīvu ziedu stāvoklis jāvērtē floristam.",
        "Нет. Правила свежести — настраиваемые примеры, а не гарантия качества. Реальное состояние цветов должен оценивать флорист.",
        "No. Freshness rules are configurable examples, not a quality guarantee. A florist must assess real flowers.",
      ),
    ],
  ];
  return (
    <div className="page info-narrow">
      <Title
        kicker={t(
          "VISS, KAS JĀZINA",
          "ВСЁ, ЧТО НУЖНО ЗНАТЬ",
          "A LITTLE CLARITY",
        )}
        title={t(
          "Jautājumi, atbildes un ziedi.",
          "Вопросы, ответы и цветы.",
          "Questions, answers & flowers.",
        )}
      />
      <div className="faq-full">
        <details>
          <summary>
            {t(
              "Vai pakalpojums jau darbojas?",
              "Сервис уже работает?",
              "Is the service already operating?",
            )}
          </summary>
          <p>
            {s.seasonal.discovery.faqAnswer
              ? pick(s.seasonal.discovery.faqAnswer, s.lang)
              : t(
                  "Vēl ne. Nav uzstādīta automāta vai apstiprinātas adreses. Šis ir pārlūka demo.",
                  "Пока нет. Автомат не установлен, адрес не подтверждён. Это браузерное демо.",
                  "Not yet. There is no installed machine or confirmed address. This is a browser demo.",
                )}
          </p>
          <Link to="/how-it-works">
            {t("Kā tas darbojas", "Как это работает", "How it works")} →
          </Link>
        </details>
        {rows.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span>+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <Link className="btn outline" to="/contact">
        {t("Cits jautājums?", "Другой вопрос?", "Something else on your mind?")}
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}
function Contact() {
  const t = useT();
  const [prepared, setPrepared] = useState(false);
  return (
    <div className="page">
      <Title
        kicker={t(
          "SARUNA SĀKAS AR MAZU SVEICIENU",
          "РАЗГОВОР НАЧИНАЕТСЯ С ПРИВЕТА",
          "A CONVERSATION STARTS WITH A LITTLE HELLO",
        )}
        title={t("Sazināsimies.", "Давайте поговорим.", "Let’s say hello.")}
        description={t(
          "Saziņas formas demonstrācija. Izmanto izdomātus datus; ziņas netiek sūtītas vai saglabātas.",
          "Демонстрация контактной формы. Используйте вымышленные данные; сообщения не отправляются и не сохраняются.",
          "A contact-form demonstration. Use fictional details; messages are neither sent nor persisted.",
        )}
      />
      <Demo />
      <div className="checkout-layout">
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            setPrepared(true);
          }}
        >
          <label>
            {t("Izdomāts vārds", "Вымышленное имя", "Fictional name")}
            <input required maxLength={80} placeholder="Alex Demo" />
          </label>
          <label>
            {t("Tēma", "Тема", "Topic")}
            <select>
              <option>
                {t("Vispārīgs jautājums", "Общий вопрос", "A little question")}
              </option>
              <option>
                {t("Ziedi uzņēmumam", "Цветы для бизнеса", "Corporate flowers")}
              </option>
              <option>
                {t("Sadarbība", "Сотрудничество", "A collaboration")}
              </option>
            </select>
          </label>
          <label>
            {t("Ziņa", "Сообщение", "Your message")}
            <textarea required maxLength={1000} />
          </label>
          <button className="btn">
            <Mail size={16} />
            {t(
              "Sagatavot demo ziņu",
              "Подготовить демо-сообщение",
              "Prepare demo message",
            )}
          </button>
          {prepared && (
            <p role="status" className="success">
              <Check size={17} />
              {t(
                "Demo ziņa sagatavota. Tā nav nosūtīta.",
                "Демо-сообщение подготовлено. Оно не отправлено.",
                "Demo message prepared. It has not been sent.",
              )}
            </p>
          )}
        </form>
        <aside className="panel contact-aside">
          <MapPin size={30} strokeWidth={1} />
          <h2>Daugavpils, Latvia</h2>
          <p>
            {t(
              "Precīza adrese, tālrunis un uzņēmuma e-pasts tiks pievienots pēc pakalpojuma izveides. Mēs neizdomājam kontaktinformāciju.",
              "Точный адрес, телефон и e-mail компании будут добавлены после запуска сервиса. Контактные данные не выдумываются.",
              "An operating address, phone number and business email will be added when the service is established. Contact details are not invented.",
            )}
          </p>
          <Link className="text-link" to="/about">
            {t(
              "Par Flower Paradise",
              "О Flower Paradise",
              "About Flower Paradise",
            )}
            <ArrowUpRight size={16} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
function Policy() {
  const path = useLocation().pathname;
  const t = useT();
  const privacy = path === "/privacy";
  const rows = privacy
    ? [
        [
          t(
            "Tikai šajā pārlūkā",
            "Только в этом браузере",
            "Only in this browser",
          ),
          t(
            "Grozs, vēlmes, demo pasūtījumi, atgādinājumi un iestatījumi glabājas LocalStorage. Nav klientu servera, autentifikācijas vai analītikas izsekošanas.",
            "Корзина, избранное, демо-заказы, напоминания и настройки хранятся в LocalStorage. Нет клиентского сервера, авторизации и аналитических трекеров.",
            "Your bag, favourites, demo orders, reminders and preferences are stored in LocalStorage. There is no customer backend, authentication or analytics tracking.",
          ),
        ],
        [
          t("Izdomāti dati", "Вымышленные данные", "Fictional details"),
          t(
            "Izmanto izdomātus vārdus un ziņas. Maksājumu kartes, paroles un citi sensitīvi dati netiek prasīti. Kontaktformas saturs netiek saglabāts.",
            "Используйте вымышленные имена и сообщения. Карты, пароли и другие конфиденциальные данные не запрашиваются. Содержание контактной формы не сохраняется.",
            "Use fictional names and messages. Cards, passwords and sensitive information are not requested. Contact-form contents are not persisted.",
          ),
        ],
        [
          t(
            "Foto un bezsaistes dati",
            "Фото и офлайн-данные",
            "Photos & offline assets",
          ),
          t(
            "Pievienotie demo foto paliek operatīvajā atmiņā līdz lapas pārlādei. PWA saglabā tikai vietnes statiskos failus. GitHub Pages uzturētāja tehniskā datu apstrāde ir atsevišķa.",
            "Добавленные демо-фото остаются в памяти до обновления страницы. PWA кэширует только статические файлы сайта. Техническая обработка данных хостингом GitHub Pages — отдельный процесс.",
            "Uploaded demo photos remain in memory until refresh. The PWA caches only static site files. Technical data processing by the GitHub Pages host is separate.",
          ),
        ],
        [
          t("Datu atiestatīšana", "Сброс данных", "Reset your data"),
          t(
            "Visus lokālos demo ierakstus var atiestatīt profila iestatījumos. Pārlūka vietnes datu tīrīšana noņem arī statisko bezsaistes kešatmiņu.",
            "Все локальные демо-записи можно сбросить в настройках кабинета. Очистка данных сайта в браузере также удаляет статический офлайн-кэш.",
            "Reset all local demo records in dashboard preferences. Clearing site data in your browser also removes the static offline cache.",
          ),
        ],
      ]
    : [
        [
          t(
            "Demonstrācijas mērķis",
            "Цель демонстрации",
            "Demonstration purpose",
          ),
          t(
            "Vietne demonstrē nākotnes ziedu un dāvanu pakalpojuma pieredzi. Tā nepieņem komerciālus pasūtījumus un neveido pirkuma līgumu.",
            "Сайт демонстрирует будущий сервис цветов и подарков. Он не принимает коммерческие заказы и не заключает договор покупки.",
            "The site demonstrates a future flower and gifting service. It does not accept commercial orders or form a purchase contract.",
          ),
        ],
        [
          t(
            "Cenas un pieejamība",
            "Цены и доступность",
            "Prices & availability",
          ),
          t(
            "Visas cenas, atlaides, krājumi, rezervācijas un dāvanu kodi ir paraugi bez naudas vērtības. Foto ilustrē stilu, nevis konkrētu gatavu pasūtījumu.",
            "Все цены, скидки, остатки, брони и подарочные коды — примеры без денежной стоимости. Фото иллюстрируют стиль, а не конкретный готовый заказ.",
            "Prices, discounts, inventory, reservations and gift codes are samples without monetary value. Photography illustrates a style rather than a specific prepared order.",
          ),
        ],
        [
          t(
            "Prognozes un kvalitāte",
            "Прогнозы и качество",
            "Estimates & quality",
          ),
          t(
            "Finanšu simulators izmanto lietotāja pieņēmumus. Tas negarantē peļņu. Svaiguma aprēķini nav ziedu dzīves ilguma garantija.",
            "Финансовый симулятор использует допущения пользователя и не гарантирует прибыль. Расчёт свежести не гарантирует срок жизни цветов.",
            "The financial simulator uses user assumptions and does not guarantee profit. Freshness calculations do not guarantee flower lifespan.",
          ),
        ],
        [
          t("Nākotnes pakalpojums", "Будущий сервис", "A future service"),
          t(
            "Pirms reālu pirkumu sākšanas būs vajadzīgi apstiprināti uzņēmuma rekvizīti, komerciālie noteikumi, datu aizsardzības informācija un droša servera integrācija.",
            "До запуска реальных покупок потребуются подтверждённые реквизиты, коммерческие условия, информация о защите данных и безопасная серверная интеграция.",
            "Real purchases require confirmed business details, commercial terms, data-protection information and secure backend integrations before launch.",
          ),
        ],
      ];
  return (
    <div className="page info-narrow">
      <Title
        title={
          privacy
            ? t(
                "Privātums demo vidē",
                "Конфиденциальность в демо",
                "Privacy in the demo",
              )
            : t(
                "Demonstrācijas noteikumi",
                "Условия демонстрации",
                "Demonstration terms",
              )
        }
      />
      <Demo />
      {rows.map(([h, p]) => (
        <section className="policy-section" key={h}>
          <h2>{h}</h2>
          <p>{p}</p>
        </section>
      ))}
      {privacy && (
        <Link className="btn outline" to="/account?tab=settings">
          {t(
            "Atvērt datu iestatījumus",
            "Открыть настройки данных",
            "Open data preferences",
          )}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
function Passport() {
  const { s, toast } = useStore();
  const t = useT();
  const { id } = useParams();
  const p = s.catalog.find((p) => p.id === id);
  if (!p)
    return (
      <Empty
        text={t(
          "Pušķa pase nav atrasta",
          "Паспорт букета не найден",
          "Bouquet passport not found",
        )}
      />
    );
  const batches = s.batches.filter(
    (b) => b.productId === p.id && b.quantity > 0,
  );
  const link = `${window.location.origin}${import.meta.env.BASE_URL}#/passport/${p.id}`;
  return (
    <div className="page passport-page">
      <Title
        kicker={t(
          "MAZĀS DETAĻAS PAR TAVIEM ZIEDIEM",
          "МАЛЕНЬКИЕ ДЕТАЛИ О ВАШИХ ЦВЕТАХ",
          "THE LITTLE STORY OF YOUR STEMS",
        )}
        title={t("Pušķa pase", "Паспорт букета", "Bouquet passport")}
      >
        <button className="btn outline no-print" onClick={() => window.print()}>
          <Printer size={17} />
          {t("Drukāt pasi", "Распечатать паспорт", "Print passport")}
        </button>
      </Title>
      <Demo />
      <article className="passport-document">
        <div className="passport-cover">
          <img src={img(p.photo, 1000)} alt={pick(p.name, s.lang)} />
          <div>
            <Flower2 size={30} strokeWidth={1} />
            <span className="eyebrow">
              FLOWER PARADISE · {p.id.toUpperCase()}
            </span>
            <h1>{pick(p.name, s.lang)}</h1>
            <p>
              {pick(categories[p.category], s.lang)} ·{" "}
              {pick(colors[p.color], s.lang)}
            </p>
          </div>
        </div>
        <div className="passport-body">
          <div>
            <h2>
              {t(
                "Kas zied tavā pušķī",
                "Что цветёт в вашем букете",
                "What’s gathered in your bouquet",
              )}
            </h2>
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
                <dt>{t("Ziedu skaits", "Количество цветов", "Stem count")}</dt>
                <dd>
                  {p.flowerCount ??
                    t(
                      "Nav apstiprināts; atkarīgs no izpildījuma",
                      "Не подтверждено; зависит от исполнения",
                      "Not confirmed; varies with arrangement",
                    )}
                </dd>
              </div>
              <div>
                <dt>{t("Iesaiņojums", "Упаковка", "Packaging")}</dt>
                <dd>
                  {t(
                    "Papīrs un lente; izvēles demo konfiguratorā",
                    "Бумага и лента; варианты в демо-конструкторе",
                    "Paper & ribbon; choices in demo configurator",
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h2>
              {t(
                "Mazliet rūpju katru dienu",
                "Немного заботы каждый день",
                "A little care, every day",
              )}
            </h2>
            <p>{pick(p.care, s.lang)}</p>
            <p>
              {p.category < 7
                ? t(
                    "Izmanto tīru vāzi. Regulāri pārbaudi ūdeni un ziedu stāvokli. Novieto vēsā telpā, prom no siltuma avotiem; konkrētas temperatūras vajadzības atkarīgas no ziedu veida.",
                    "Используйте чистую вазу. Регулярно проверяйте воду и состояние цветов. Держите в прохладном помещении вдали от тепла; нужная температура зависит от вида цветов.",
                    "Use a clean vase and check water and flower condition regularly. Keep in a cool room away from heat; temperature needs depend on the stems.",
                  )
                : t(
                    "Sargā kompozīciju no mitruma, putekļiem un tiešas saules.",
                    "Защищайте композицию от влаги, пыли и прямого солнца.",
                    "Protect the arrangement from moisture, dust and direct sunlight.",
                  )}
            </p>
          </div>
          <div className="passport-batches">
            <h2>
              {t(
                "Demo partiju izcelsme",
                "Происхождение демо-партий",
                "The demo batch story",
              )}
            </h2>
            <p>
              {t(
                "Šie nav reālas florista sagatavošanas vai sensoru dati. Svaiguma novērtējums nav ziedu dzīves ilguma garantija.",
                "Это не реальные данные подготовки флористом или датчиков. Оценка свежести не гарантирует срок жизни цветов.",
                "These are not real florist preparation or sensor records. Estimated freshness does not guarantee lifespan.",
              )}
            </p>
            {batches.length ? (
              batches.map((b) => (
                <div className="batch-passport-row" key={b.id}>
                  <span>{b.id}</span>
                  <span>
                    {t("Sagatavots", "Собран", "Assembled")}:{" "}
                    {new Date(b.assemblyDate + "T12:00:00").toLocaleDateString(
                      s.lang,
                    )}
                  </span>
                  <span>
                    {pick(statusLabels[freshness(b, s.freshnessRules)], s.lang)}
                  </span>
                  <small>
                    {t(
                      "Ieteicamā demo pārdošana līdz",
                      "Пример рекомендуемой продажи до",
                      "Demo recommended sale by",
                    )}
                    : {b.sellBy}
                  </small>
                </div>
              ))
            ) : (
              <p>
                {t(
                  "Nav aktīvu demo partiju.",
                  "Активных демо-партий нет.",
                  "No active demo batches.",
                )}
              </p>
            )}
          </div>
          <div className="passport-link">
            <span className="eyebrow">
              {t("QR SADERĪGA SAITE", "ССЫЛКА ДЛЯ QR", "QR-COMPATIBLE LINK")}
            </span>
            <a href={link}>{link}</a>
            <button
              className="text-link no-print"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(link)
                  .then(() =>
                    toast(
                      t(
                        "Pases saite nokopēta",
                        "Ссылка на паспорт скопирована",
                        "Passport link copied",
                      ),
                    ),
                  )
                  .catch(() => toast(link));
              }}
            >
              <Copy size={14} />
              {t("Kopēt saiti", "Копировать ссылку", "Copy link")}
            </button>
            <small>
              {t("Pases skatījums", "Просмотр паспорта", "Passport view")} ·{" "}
              {dateKey()}
            </small>
          </div>
        </div>
      </article>
      <div className="no-print">
        <PhotoPreview p={p} />
      </div>
    </div>
  );
}
