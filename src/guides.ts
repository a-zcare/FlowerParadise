import type { Text } from "./data";
export interface Guide {
  id: string;
  category: "flowers" | "christmas" | "service";
  title: Text;
  intro: Text;
  paragraphs: Text[];
  photo: string;
  link: string;
  sources?: string[];
}
export const guides: Guide[] = [
  {
    id: "fresh-flowers",
    category: "flowers",
    title: [
      "Kā saglabāt grieztu ziedu svaigumu",
      "Как сохранить свежесть срезанных цветов",
      "How to keep cut flowers fresh",
    ],
    intro: [
      "Mazs ikdienas rituāls skaistākam pušķim.",
      "Небольшой ежедневный ритуал для букета.",
      "A small daily ritual for a happier bouquet.",
    ],
    photo: "1680563899402-26c3a712831f",
    link: "/shop",
    paragraphs: [
      [
        "Sāc ar tīru vāzi. Noņem lapas zem ūdens līmeņa un ar tīru instrumentu atjauno kātu griezumus. Pievieno ziedu barību atbilstoši iepakojumam.",
        "Начните с чистой вазы. Уберите листья ниже воды и обновите срезы чистым инструментом. Добавляйте подкормку по инструкции.",
        "Start with a clean vase. Remove submerged leaves and refresh stem ends with a clean tool. Follow the flower-food label.",
      ],
      [
        "Pārbaudi ūdeni katru dienu. Maini to un atjauno griezumus regulāri. Turi pušķi vēsumā, prom no sildītājiem un augļiem. Ilgmūžība atkarīga no šķirnes un kopšanas.",
        "Проверяйте воду ежедневно, регулярно меняйте её и обновляйте срезы. Держите букет вдали от отопления и фруктов. Срок зависит от сорта и ухода.",
        "Check water daily; replace it and refresh stem ends regularly. Display away from heaters and fruit. Longevity varies with variety and care.",
      ],
    ],
    sources: [
      "https://www.rhs.org.uk/plants/for-places/cut-flowers-conditioning",
    ],
  },
  {
    id: "choose-bouquet",
    category: "flowers",
    title: [
      "Kā izvēlēties pušķi",
      "Как выбрать букет",
      "How to choose a bouquet",
    ],
    intro: [
      "Sāc ar cilvēku, nevis ziedu skaitu.",
      "Начните с человека, а не с количества цветов.",
      "Start with the person, rather than the stem count.",
    ],
    photo: "1519657603751-38e2d6e37f09",
    link: "/match",
    paragraphs: [
      [
        "Padomā, kādas krāsas saņēmējs izvēlas apģērbā vai mājās. Maigas krāsas rada mierīgu noskaņu, bet izteiksmīgs pušķis var kļūt par svētku akcentu. Vienota krāsu palete palīdz arī nelielam pušķim izskatīties pārdomātam.",
        "Вспомните цвета, которые получатель выбирает для одежды или дома. Нежная палитра создаёт спокойное настроение, выразительная — праздничный акцент. Даже небольшой букет выглядит продуманно, если цвета согласованы.",
        "Think about colours the recipient chooses at home or in their wardrobe. A gentle palette feels calm; a vivid bouquet adds a celebratory accent. A consistent palette gives even a small bouquet a considered character.",
      ],
      [
        "Pirms izvēles nosaki budžetu un vietu, kur pušķis nonāks. Ceļojumam piemērotāks var būt kompakts izmērs. Flower Match palīdz salīdzināt noskaņu, krāsas un cenu; ieteikumi ir noteikumos balstīta demonstrācija.",
        "Определите бюджет и место вручения. Для поездки может быть удобнее компактный букет. Flower Match помогает сопоставить стиль, цвета и цену; это демонстрация рекомендаций по понятным правилам.",
        "Set a budget and consider where the bouquet will be given. Compact arrangements may be easier to carry. Flower Match compares style, colours and price using transparent demonstration rules.",
      ],
    ],
  },
  {
    id: "christmas-budget",
    category: "christmas",
    title: [
      "Ziemassvētku dāvanas pēc budžeta",
      "Рождественские подарки по бюджету",
      "Christmas gifts by budget",
    ],
    intro: [
      "Atstāj vietu arī iesaiņojumam un saņemšanai.",
      "Учтите упаковку и способ получения.",
      "Leave room for wrapping and collection.",
    ],
    photo: "xm-076",
    link: "/christmas-builder",
    paragraphs: [
      [
        "Nosaki kopējo summu vienai dāvanai. Līdz €15 apskati nelielus dekorus; līdz €25 — personisku akcentu vai mini kompozīciju; līdz €50 — centrālo dāvanu ar kartīti. Tās ir demo cenu grupas, nevis apstiprināti piedāvājumi.",
        "Определите полную сумму на подарок. До €15 смотрите небольшие украшения, до €25 — персональный акцент или мини-композицию, до €50 — основной подарок с открыткой. Это группы демо-цен, а не подтверждённые предложения.",
        "Choose a complete per-gift budget. Explore small decorations under €15, a personal accent or mini arrangement under €25, or a main gift with a card under €50. These are demo price groups, rather than confirmed offers.",
      ],
      [
        "Konfiguratorā vispirms izvēlies vienu galveno priekšmetu. Pievieno tikai papildinājumus, kas saņēmējam noderēs. Kopējā summa ietver izvēlētos papildinājumus un demo piegādi; komplektu virs budžeta nevar pievienot.",
        "В конструкторе сначала выберите один главный предмет. Добавляйте только уместные дополнения. Итог учитывает выбранные опции и демо-доставку; набор сверх бюджета нельзя добавить.",
        "Choose one focal gift in the builder, then add only useful extras. The total includes chosen additions and demo delivery; bundles above the selected budget cannot be added.",
      ],
    ],
  },
  {
    id: "evergreen-care",
    category: "christmas",
    title: [
      "Skuju dekoru kopšana",
      "Уход за хвойным декором",
      "Caring for evergreen decorations",
    ],
    intro: [
      "Dabiskas faktūras mainās līdz ar telpu un laiku.",
      "Природные материалы меняются со временем.",
      "Natural textures change with their surroundings.",
    ],
    photo: "xm-001",
    link: "/christmas?category=12",
    paragraphs: [
      [
        "Pirms kopšanas noskaidro, vai dekors ir svaigs, žāvēts vai mākslīgs. Viena metode nav piemērota visiem. Nenovieto to pie radiatora vai atklātas liesmas. Skujas un ogu imitācijas nav pārtika; glabā bērniem un dzīvniekiem nepieejami.",
        "Сначала выясните, свежий декор, сухой или искусственный: одинаковый уход им не подходит. Не ставьте его у отопления или открытого огня. Хвоя и декоративные ягоды не предназначены для еды; держите их вне доступа детей и животных.",
        "First establish whether the decoration is fresh, dried or artificial: each needs different care. Keep it away from heaters and open flames. Greenery and decorative berries are not food; keep them out of reach of children and pets.",
      ],
      [
        "Neliec ūdenī koka pamatni, līmētas detaļas vai elektriskos elementus. Svaigai kompozīcijai ievēro konkrētā izstrādājuma norādījumus. Ja adatas birst vai materiāls izžūst, pārtrauc lietošanu pie siltuma avotiem. Demo attēls neapstiprina materiālu sastāvu.",
        "Не погружайте в воду деревянную основу, приклеенные детали или электрику. Для свежей композиции следуйте инструкции конкретного изделия. При высыхании и осыпании уберите её от источников тепла. Демо-фото не подтверждает состав материалов.",
        "Do not immerse wooden bases, glued details or electrical elements. Follow the specific maker’s care directions for fresh arrangements. Remove drying or shedding material from heat sources. A demo image does not verify the material composition.",
      ],
    ],
  },
  {
    id: "choose-advent",
    category: "christmas",
    title: [
      "Kā izvēlēties Adventes vainagu",
      "Как выбрать адвентский венок",
      "How to choose an Advent wreath",
    ],
    intro: [
      "Skaista kompozīcija sākas ar piemērotu vietu.",
      "Красивая композиция начинается с подходящего места.",
      "A considered arrangement begins with the right setting.",
    ],
    photo: "xm-016",
    link: "/christmas?category=13",
    paragraphs: [
      [
        "Izmēri galdu un atstāj vietu ikdienas lietošanai. Zemai kompozīcijai ir vieglāk redzēt pāri pie vakariņu galda. Izvēlies krāsas, kas sader ar esošajiem traukiem, nevis maini visu telpu viena dekora dēļ.",
        "Измерьте стол и оставьте место для повседневного использования. Низкая композиция меньше мешает общению за ужином. Подберите цвета к вашей посуде, чтобы не менять всю обстановку ради украшения.",
        "Measure the table and leave space for everyday use. A low arrangement keeps conversation across the table comfortable. Choose colours that work with your existing tableware.",
      ],
      [
        "Vainagā no degošiem materiāliem izvēlies LED sveces. Īstām svecēm vajadzīgi piemēroti turētāji un drošs attālums no dekoriem. Apskati izmērus un drošības sadaļu pirms pasūtījuma; demo varianti nav sertificēti izstrādājumi.",
        "В венке из горючих материалов выбирайте LED-свечи. Для настоящих нужны подходящие держатели и безопасное расстояние от декора. Проверьте размеры и раздел безопасности: демо-варианты не являются сертифицированными изделиями.",
        "Use LED candles in wreaths made from combustible materials. Real candles need suitable holders and safe separation from decoration. Check dimensions and safety information; demo concepts are not certified products.",
      ],
    ],
  },
  {
    id: "family-gifts",
    category: "christmas",
    title: [
      "Ziemassvētku idejas ģimenei",
      "Рождественские идеи для семьи",
      "Christmas gift ideas for family",
    ],
    intro: [
      "Viena kopīga noskaņa, katram sava detaļa.",
      "Общее настроение, личная деталь для каждого.",
      "One shared mood, a personal detail for everyone.",
    ],
    photo: "xm-083",
    link: "/christmas?recipient=parents",
    paragraphs: [
      [
        "Ģimenes dāvanai izvēlies kaut ko, ko iespējams baudīt kopā: galda dekoru vai atsevišķi iepakotu mazu dāvanu izlasi. Ja saņēmēja vēlmes nav zināmas, izvēlies neitrālu paleti un vietu nepārslogojošu izmēru.",
        "Для семейного подарка подойдёт общий декор стола или подборка небольших индивидуально упакованных подарков. Если вкусы неизвестны, выбирайте нейтральную палитру и компактный размер.",
        "For a family gift, consider a shared table decoration or individually wrapped small gifts. If preferences are unknown, a neutral palette and manageable size are useful starting points.",
      ],
      [
        "Ēdiena, kosmētikas un bērnu dāvanu faktiskā piemērotība jāpārbauda pēc ražotāja marķējuma. Dekoratīva rotaļlieta automātiski nav bērnu rotaļlieta. Pievieno personisku kartīti; šajā demo tā paliek tikai tavā pārlūkā.",
        "Пригодность еды, косметики и детских подарков проверяйте по маркировке производителя. Декоративная фигурка не обязательно является детской игрушкой. Добавьте личную открытку; в демо она остаётся в вашем браузере.",
        "Check manufacturer labels for food, cosmetics and children’s gifts. A decorative toy is not automatically a child-safe toy. Add a personal card; in this demo it stays in your browser.",
      ],
    ],
  },
  {
    id: "last-minute",
    category: "christmas",
    title: [
      "Dāvanas pēdējā brīdī",
      "Подарки в последний момент",
      "Last-minute Christmas gifts",
    ],
    intro: [
      "Vienkāršāka izvēle, mazāk steigas.",
      "Меньше вариантов — спокойнее выбор.",
      "A simpler choice makes room to breathe.",
    ],
    photo: "xm-031",
    link: "/available",
    paragraphs: [
      [
        "Sāc ar saņemšanas veidu un laiku, tad izvēlies dāvanu. Izveido īsu trīs variantu sarakstu vienā cenu grupā un salīdzini izmērus un iesaiņojumu. Ja personalizācijas termiņš nav apstiprināts, nepaļaujies uz to kā tūlītēju iespēju.",
        "Сначала определите способ и время получения, затем выбирайте подарок. Сравните три варианта одной ценовой группы по размеру и упаковке. Без подтверждённого срока не рассчитывайте на срочную персонализацию.",
        "Start with collection method and time, then choose the gift. Compare three options within one budget by size and wrapping. Without a confirmed production time, do not assume personalization can be immediate.",
      ],
      [
        "Sadaļa “Pieejams tagad” rāda tikai pārlūka demo krājumus. Tā nav solījums saņemt dāvanu šodien. Pirms īstās atklāšanas pieteikumi un dāvanu kodi ir lokāla simulācija.",
        "Раздел «Доступно сейчас» показывает только демо-запас браузера. Он не обещает получение сегодня. До реального запуска заявки и подарочные коды остаются локальной симуляцией.",
        "Available Now displays browser-local demo inventory only. It does not promise collection today. Before launch, requests and gift codes remain local simulations.",
      ],
    ],
  },
  {
    id: "candle-safety",
    category: "christmas",
    title: [
      "Sveču dekoru droša lietošana",
      "Безопасность свечных украшений",
      "Using candle decorations safely",
    ],
    intro: [
      "Silta noskaņa sākas ar piesardzību.",
      "Уют начинается с осторожности.",
      "A warm atmosphere starts with care.",
    ],
    photo: "xm-025",
    link: "/christmas?category=13",
    paragraphs: [
      [
        "Drošākai noskaņai izvēlies bezliesmas LED sveces. Atklātu liesmu turi vismaz 30 cm no degošiem materiāliem; ievēro arī ražotāja norādījumus.",
        "Для уюта выбирайте беспламенные LED-свечи. Открытый огонь держите минимум в 30 см от горючих материалов и соблюдайте инструкцию производителя.",
        "Consider flameless LED candles. Keep open flames at least 30 cm from combustible materials and follow the manufacturer’s directions.",
      ],
      [
        "Lieto stabilu turētāju uz izturīgas virsmas. Neatstāj liesmu bez uzraudzības; nodzēs pirms telpas atstāšanas vai miega. Glabā bērniem un dzīvniekiem nepieejami. Neaizdedzini sveci tieši skuju vainagā.",
        "Используйте устойчивый держатель на прочной поверхности. Не оставляйте огонь без присмотра; гасите перед уходом и сном. Держите вне доступа детей и животных. Не зажигайте свечу прямо среди хвои.",
        "Use sturdy holders on stable surfaces. Never leave flames unattended; extinguish before leaving or sleeping. Keep away from children and pets. Do not light a candle directly among greenery.",
      ],
    ],
    sources: [
      "https://www.nfpa.org/education-and-research/home-fire-safety/candles",
    ],
  },
  {
    id: "future-vending",
    category: "service",
    title: [
      "Kā darbosies ziedu automāts",
      "Как будет работать цветочный автомат",
      "How future flower vending will work",
    ],
    intro: [
      "Iecere Daugavpilij, ko vari izmēģināt jau šeit.",
      "Идея для Даугавпилса, которую можно попробовать здесь.",
      "A Daugavpils concept you can explore here.",
    ],
    photo: "1680563899402-26c3a712831f",
    link: "/vending",
    paragraphs: [
      [
        "Nākotnē pircējs izvēlētos saņemšanas punktu un konkrētu pušķi. Pirms apstiprinājuma būtu redzams pieejamības statuss un saņemšanas nosacījumi. Reāls maksājums un kodu piegāde prasīs drošu servera integrāciju.",
        "В будущем покупатель выберет точку и конкретный букет. До подтверждения будут показаны наличие и условия получения. Настоящие платежи и отправка кодов потребуют безопасной серверной интеграции.",
        "A future shopper would choose a location and a specific bouquet, then review availability and collection conditions. Real payments and code delivery will require secure server integration.",
      ],
      [
        "Šeit četri nodalījumi un vienreizēji kodi ir tikai demonstrācija. Rezervē demo pušķi, ievadi saņemto kodu un apskati animāciju. Automāts vēl nav uzstādīts; adrese, piekļuve un atklāšanas datums nav apstiprināti.",
        "Здесь четыре ячейки и одноразовые коды — только демонстрация. Забронируйте демо-букет, введите полученный код и посмотрите анимацию. Автомат ещё не установлен; адрес, доступ и дата запуска не подтверждены.",
        "Here, four compartments and one-time codes are demonstrations. Reserve a demo bouquet, enter the displayed code and explore the animation. No machine is installed; address, access and launch date are not confirmed.",
      ],
    ],
  },
  {
    id: "winter-storage",
    category: "christmas",
    title: [
      "Ziemas kompozīciju uzglabāšana",
      "Хранение зимних композиций",
      "Storing winter greenery arrangements",
    ],
    intro: [
      "Pirms novietošanas padomā par materiālu.",
      "Перед хранением подумайте о материалах.",
      "Think about materials before putting a piece away.",
    ],
    photo: "xm-046",
    link: "/christmas?category=15",
    paragraphs: [
      [
        "Svaigas kompozīcijas nav paredzētas glabāšanai līdz nākamajiem svētkiem. Žāvētas un mākslīgas detaļas glabā tikai tīras un sausas atbilstoši izstrādājuma norādījumiem. Neiesaiņo mitru dekoru cieši noslēgtā kastē.",
        "Свежие композиции не рассчитаны на хранение до следующих праздников. Сухие и искусственные детали храните чистыми и сухими по инструкции. Не закрывайте влажный декор в герметичной коробке.",
        "Fresh arrangements are not intended to be stored until next Christmas. Store dried and artificial pieces clean and dry according to their instructions. Do not seal damp decorations in an airtight box.",
      ],
      [
        "Noņem baterijas, ja gaismiņu ražotājs to iesaka ilgstošai uzglabāšanai. Trauslās detaļas nodali ar papīru un atzīmē kastes saturu. Pirms atkārtotas lietošanas pārbaudi bojājumus, vadus un stiprinājumus.",
        "Для длительного хранения следуйте указаниям производителя гирлянды о батарейках. Разделите хрупкие части бумагой и подпишите коробку. Перед повторным использованием проверьте повреждения, провода и крепления.",
        "Follow the light manufacturer’s battery instructions for long storage. Separate fragile pieces with paper and label the box. Inspect for damage, including wiring and fastenings, before reuse.",
      ],
    ],
  },
];
