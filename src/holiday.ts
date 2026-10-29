import imagery from "./holiday-imagery.json";
import names from "./holiday-names.json";
import extra from "./holiday-extra.json";
import type { Product, Text } from "./data";
export const holidayCategories: Text[] = [
  [
    "Skuju dzīvnieki un skulptūras",
    "Хвойные животные и скульптуры",
    "Evergreen animals & sculptures",
  ],
  [
    "Adventes vainagi un sveces",
    "Адвентские венки и свечи",
    "Advent wreaths & candles",
  ],
  [
    "Ziemassvētku rūķi un rotaļlietas",
    "Рождественские гномы и игрушки",
    "Christmas gnomes & decorative toys",
  ],
  [
    "Ziemas skujas un kompozīcijas",
    "Зимняя хвоя и композиции",
    "Evergreen & winter arrangements",
  ],
  [
    "Ziemassvētku mājas dekori",
    "Рождественский декор для дома",
    "Christmas home decorations",
  ],
  [
    "Ziemassvētku dāvanu kastes",
    "Рождественские подарочные коробки",
    "Christmas gift boxes",
  ],
  [
    "Mini Ziemassvētku eglītes",
    "Миниатюрные рождественские ёлочки",
    "Mini Christmas trees",
  ],
  [
    "Ekskluzīvas personalizētas dāvanas",
    "Эксклюзивные персональные подарки",
    "Exclusive & personalized gifts",
  ],
  ["Adventes kalendāri", "Адвент-календари", "Advent calendars"],
];
const materials: Text[] = [
  [
    "Egļu un priežu skujas, florista karkass, koka pamatne, lente",
    "Еловая и сосновая хвоя, флористический каркас, деревянная основа, лента",
    "Fir and pine sprigs, florist frame, wooden base, ribbon",
  ],
  [
    "Egļu zari, metāla sveču turētāji, vaska sveces, čiekuri",
    "Еловые ветки, металлические держатели, восковые свечи, шишки",
    "Fir branches, metal candle holders, wax candles, pinecones",
  ],
  [
    "Filcs, kokvilna, tekstila pildījums, koka detaļas",
    "Фетр, хлопок, текстильный наполнитель, деревянные детали",
    "Felt, cotton, textile filling, wooden details",
  ],
  [
    "Sezonas skujas, svaigi ziedi, floristikas pamatne, dekoratīvās ogas",
    "Сезонная хвоя, свежие цветы, флористическая основа, декоративные ягоды",
    "Seasonal evergreens, fresh flowers, florist base, decorative berries",
  ],
  [
    "Koks, stikls vai metāls, lente, dekoratīvās skujas",
    "Дерево, стекло или металл, лента, декоративная хвоя",
    "Wood, glass or metal, ribbon, decorative greenery",
  ],
  [
    "Papīra dāvanu kaste, tekstils, svece, iepakoti gardumi atbilstoši izvēlei",
    "Бумажная подарочная коробка, текстиль, свеча, упакованные угощения по выбору",
    "Paper gift box, textile, candle, wrapped treats according to selection",
  ],
  [
    "Egļu zari vai mini egle, koka pamatne vai pods, rotājumi",
    "Еловые ветки или мини-ель, деревянная основа или горшок, украшения",
    "Fir sprigs or miniature spruce, wooden base or pot, ornaments",
  ],
  [
    "Koks, skujas, tekstils, papīrs atbilstoši personalizācijai",
    "Дерево, хвоя, текстиль, бумага согласно персонализации",
    "Wood, greenery, textile and paper according to personalization",
  ],
  [
    "Papīra un koka 24 atvilktnes, lentes, kartītes; pildījums nav iekļauts",
    "24 бумажных и деревянных ящичка, ленты, карточки; без наполнения",
    "24 paper and wood drawers, ribbons and cards; contents not included",
  ],
];
const safety: Text[] = [
  [
    "Dekoratīvs priekšmets, nevis rotaļlieta. Sīkas detaļas; glabāt bērniem un mājdzīvniekiem nepieejami. Netuvināt liesmai vai siltuma avotam.",
    "Декор, а не игрушка. Мелкие детали; держать вне доступа детей и животных. Беречь от огня и нагрева.",
    "Decorative object, not a toy. Small parts; keep away from children and pets. Keep away from flames and heat.",
  ],
  [
    "Nekad neatstāt degošas sveces bez uzraudzības. Skujas ir degošas. Priekšroka LED svecēm; pirms lietošanas jāapstiprina ugunsdroša konstrukcija.",
    "Никогда не оставляйте горящие свечи без присмотра. Хвоя горюча. Предпочтительны LED-свечи; конструкция требует проверки пожарной безопасности.",
    "Never leave lit candles unattended. Greenery is flammable. Prefer LED candles; fire-safe construction must be verified before use.",
  ],
  [
    "Tikai dekorācija. Nav sertificēta bērnu rotaļlieta. Var saturēt sīkas detaļas. Turēt prom no uguns.",
    "Только декор. Не сертифицированная детская игрушка. Возможны мелкие детали. Беречь от огня.",
    "Decoration only. Not a certified children’s toy. May contain small parts. Keep away from fire.",
  ],
  [
    "Dekoratīvās ogas nav ēdamas. Daži augi var kaitēt mājdzīvniekiem. Sargāt virsmas no ūdens un turēt prom no liesmas.",
    "Декоративные ягоды несъедобны. Некоторые растения могут быть вредны для животных. Беречь поверхности от воды и держать вдали от огня.",
    "Decorative berries are not edible. Some plants may harm pets. Protect surfaces from water and keep away from flames.",
  ],
  [
    "Trauslas un sīkas detaļas. LED gaismiņas tikai pēc piegādātāja norādēm; baterijas glabāt bērniem nepieejami.",
    "Хрупкие и мелкие детали. LED-подсветка по инструкции поставщика; батарейки хранить вне доступа детей.",
    "Fragile and small parts. Use LED lights only to supplier instructions; keep batteries away from children.",
  ],
  [
    "Demo sastāvs. Pirms īstas iegādes jāpārbauda pārtikas alergēni, sastāvs, derīguma termiņš un kosmētikas marķējums.",
    "Демо-состав. До реальной покупки необходимо проверить аллергены, ингредиенты, сроки годности и маркировку косметики.",
    "Demo contents. Before a real purchase, check food allergens, ingredients, expiry dates and cosmetic labeling.",
  ],
];
export interface SeasonalDetails {
  campaign: "christmas-2026";
  materials: Text;
  materialTags: string[];
  dimensions: string;
  variants: Text[];
  personalization: boolean;
  handmadeStyle: boolean;
  recipients: string[];
  safety: Text;
  related: string[];
  imageKind: "concept" | "inspiration";
  perishable: boolean;
  giftReady: boolean;
}
const records = [
  ...names.map((name, i) => ({
    name,
    group: i < 90 ? Math.floor(i / 15) : i < 100 ? 6 : i < 110 ? 7 : 8,
  })),
  ...extra,
];
export const holidayProducts: Product[] = records.map(({ name, group }, i) => {
  const title = name[2];
  const mini = /Mini|Ornament|Custom Name/.test(title);
  const large = /Luxury|Premium|Signature|Family|Collection|Tall/.test(title);
  const sizes =
    group === 4 && /Garland/.test(title)
      ? "120 × 15 cm"
      : mini
        ? "18 × 15 cm"
        : large
          ? "45 × 35 cm"
          : "30 × 25 cm";
  const prices = [49, 39, 22, 35, 24, 29, 26, 45, 35];
  const price = Math.max(
    9,
    prices[group] + (large ? 25 : mini ? -12 : 0) + (i % 3) * 5,
  );
  const detail: SeasonalDetails = {
    campaign: "christmas-2026",
    materials: materials[group],
    materialTags: [
      ["greenery", "wood", "textile"],
      ["greenery", "wax", "metal"],
      ["textile", "wood"],
      ["greenery"],
      ["wood", "glass", "metal"],
      ["food", "wax", "textile"],
      ["greenery", "wood"],
      ["wood", "textile", "greenery"],
      ["wood", "paper"],
    ][group],
    dimensions: sizes,
    variants: [
      ["Dabisks", "Натуральный", "Natural"],
      ["Bordo lente", "Бордовая лента", "Burgundy ribbon"],
      ["Šampanieša detaļas", "Детали шампань", "Champagne details"],
    ],
    personalization: group === 7 || /Personalized|Greeting|Name/.test(title),
    handmadeStyle: [0, 1, 2, 3, 6, 7].includes(group),
    recipients:
      group === 5
        ? ["parents", "colleagues", "teachers", "corporate"]
        : group === 2
          ? ["children", "parents", "her"]
          : group === 7
            ? ["couples", "her", "corporate"]
            : ["her", "him", "parents", "colleagues"],
    safety: safety[group === 6 ? 4 : group >= 7 ? 0 : group],
    related: [
      `xm-${String(((i + 1) % records.length) + 1).padStart(3, "0")}`,
      `xm-${String(((i + 2) % records.length) + 1).padStart(3, "0")}`,
    ],
    imageKind: imagery[
      `xm-${String(i + 1).padStart(3, "0")}` as keyof typeof imagery
    ].kind as "concept" | "inspiration",
    perishable:
      [0, 1, 3, 6].includes(group) ||
      (group === 7 && /Evergreen|Advent Wreath/.test(title)),
    giftReady: true,
  };
  return {
    id: `xm-${String(i + 1).padStart(3, "0")}`,
    name: name as Text,
    category: 12 + group,
    price,
    photo:
      imagery[`xm-${String(i + 1).padStart(3, "0")}` as keyof typeof imagery]
        .photo,
    color: /White|Snowy|Nordic/.test(title)
      ? 2
      : /Burgundy|Red|Romantic/.test(title)
        ? 1
        : 3,
    occasion: 4,
    size: sizes,
    stock: 5,
    composition: materials[group],
    description: [
      `${name[0]} — pārdomāts Ziemassvētku 2026 un Jaungada 2027 dāvanas koncepts. ${materials[group][0]}. Aptuvenais izmērs: ${sizes}. Attēls ir stila iedvesma vai koncepta vizualizācija, nevis precīza prece vai reālu krājumu foto.`,
      `${name[1]} — продуманный подарочный концепт к Рождеству 2026 и Новому году 2027. ${materials[group][1]}. Примерный размер: ${sizes}. Изображение — пример стиля или визуализация концепта, а не точный товар или фото реального запаса.`,
      `${title} — a thoughtful Christmas 2026 and New Year 2027 gift concept. ${materials[group][2]}. Approximate dimensions: ${sizes}. Style inspiration or concept visualization, not the exact item or physical stock.`,
    ],
    care: detail.perishable
      ? [
          "Turēt vēsumā, prom no apkures. Regulāri pārbaudīt mitrumu un skuju stāvokli. Ilgmūžība nav garantēta.",
          "Держать в прохладе, вдали от отопления. Проверять влажность и состояние хвои. Срок жизни не гарантирован.",
          "Keep cool, away from heating. Check moisture and greenery regularly. Lifespan is not guaranteed.",
        ]
      : [
          "Turēt sausumā. Saudzīgi notīrīt ar mīkstu drānu. Neiegremdēt ūdenī.",
          "Хранить в сухом месте. Аккуратно очищать мягкой тканью. Не погружать в воду.",
          "Store dry. Clean gently with a soft cloth. Do not immerse in water.",
        ],
    availabilityType: "preorder",
    customizable: detail.personalization,
    seasonal: detail,
  };
});
