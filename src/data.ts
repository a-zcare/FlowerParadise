export type Lang = "lv" | "ru" | "en";
export type Text = [string, string, string];
export const pick = (v: Text, l: Lang) =>
  v[l === "lv" ? 0 : l === "ru" ? 1 : 2];
export const categories: Text[] = [
  ["Rozes", "Розы", "Roses"],
  ["Jauktie pušķi", "Смешанные букеты", "Mixed bouquets"],
  ["Mini pušķi", "Мини-букеты", "Mini bouquets"],
  ["Romantiski ziedi", "Романтика", "Romantic flowers"],
  ["Dzimšanas dienai", "На день рождения", "Birthday flowers"],
  ["Sezonas ziedi", "Сезонные цветы", "Seasonal flowers"],
  ["Premium pušķi", "Премиальные букеты", "Premium bouquets"],
  ["Stabilizētās rozes", "Стабилизированные розы", "Preserved roses"],
  ["Kaltēti ziedi", "Сухоцветы", "Dried flowers"],
  ["Dāvanu kastes", "Подарочные наборы", "Gift boxes"],
  ["Apsveikuma kartītes", "Открытки", "Greeting cards"],
  ["Ziedu piederumi", "Аксессуары", "Flower accessories"],
];
export const occasions: Text[] = [
  ["Dzimšanas diena", "День рождения", "Birthday"],
  ["Mīlestība", "Любовь", "Love"],
  ["Paldies", "Благодарность", "Thank you"],
  ["Vienkārši tāpat", "Просто так", "Just because"],
];
export const photos = [
  "1680563899402-26c3a712831f",
  "1615911285752-adf21310705a",
  "1719462678828-b449cab47140",
  "1519657603751-38e2d6e37f09",
  "1563241527-3004b7be0ffd",
  "1659011927436-689c0354e690",
  "1525310072745-f49212b5ac6d",
  "1773746407652-2a6de252231a",
  "1561181286-d3fee7d55364",
  "1710505235775-fe00c617d95a",
  "1518895949257-7621c3c786d7",
  "1662552367140-7de649542aa5",
  "1667489024245-7beb09ac43c5",
  "1579198314865-955573957799",
  "1652346064068-1ae0d97502c3",
  "1457089328109-e5d9bd499191",
  "1588169126439-bf9cba5b0e69",
  "1468327768560-75b778cbb551",
  "1487530811176-3780de880c2d",
  "1544249804-78bcb97b5e65",
  "1665419102810-fb934ad8c624",
  "1744954787969-a3398e2dbbb1",
  "1767986012135-25b7c94201c3",
  "1767986012134-5a93f8428d56",
  "1682518427318-0a2c509d14c4",
  "1610790924694-3986867c1967",
  "1646913506425-a7ff9d89033d",
  "1513201099705-a9746e1e201f",
  "1513885535751-8b9238bd345a",
  "1549465220-1a8b9238cd48",
  "1764385827792-0d3682a416de",
  "1764385828126-56b5ec728083",
  "1764385827388-2560c0cdc1e9",
  "1487700160041-babef9c3cb55",
  "1752567068743-d17a7b33b74e",
  "1416879595882-3373a0480b5b",
];
export const img = (id: string, w = 700) =>
  `${import.meta.env.BASE_URL}images/${id}${w > 700 ? "-large" : ""}.webp`;
const names: Text[] = [
  ["Rozā sapnis", "Розовая мечта", "Blush reverie"],
  ["Samta rozes", "Бархатные розы", "Velvet roses"],
  ["Baltais stāsts", "Белая история", "Ivory story"],
  ["Dārza mūza", "Муза сада", "Garden muse"],
  ["Maigais rīts", "Нежное утро", "Soft morning"],
  ["Lauku romantika", "Луговая романтика", "Meadow romance"],
  ["Mazais prieks", "Маленькая радость", "Little joy"],
  ["Saules skūpsts", "Поцелуй солнца", "Sunshine kiss"],
  ["Mini mīlestība", "Мини-любовь", "Pocket love"],
  ["Mīlas vēstule", "Любовное письмо", "Love letter"],
  ["Sirds čuksti", "Шёпот сердца", "Heart whispers"],
  ["Pirmais randiņš", "Первое свидание", "First date"],
  ["Svinību ziedi", "Цветочный праздник", "Birthday bloom"],
  ["Persiku prieks", "Персиковая радость", "Peach delight"],
  ["Krāsainais mirklis", "Яркое мгновение", "Colourful moment"],
  ["Rudens dzeja", "Осенняя поэзия", "Autumn poetry"],
  ["Sezonas noskaņa", "Настроение сезона", "Seasonal notes"],
  ["Vasaras atmiņas", "Воспоминания о лете", "Summer memories"],
  ["Paradīzes pušķis", "Райский букет", "Paradise signature"],
  ["Grandiozā mīla", "Великая любовь", "Grand amour"],
  ["Florista meistardarbs", "Шедевр флориста", "Florist masterpiece"],
  ["Mūžīgā roze", "Вечная роза", "Everlasting rose"],
  ["Roze stiklā", "Роза под стеклом", "Rose under glass"],
  ["Ilgstošais skaistums", "Долгая красота", "Lasting beauty"],
  ["Bohēmas sapnis", "Богемная мечта", "Bohemian dream"],
  ["Dabiskā harmonija", "Природная гармония", "Natural harmony"],
  ["Smilšu toņi", "Песочные оттенки", "Desert tones"],
  ["Saldais pārsteigums", "Сладкий сюрприз", "Sweet surprise"],
  ["Miera mirklis", "Мгновение покоя", "A moment of calm"],
  ["Dāvana no sirds", "Подарок от сердца", "From the heart"],
  ["Sirsnīgs paldies", "Спасибо от души", "Heartfelt thanks"],
  ["Ar mīlestību", "С любовью", "With love"],
  ["Tava diena", "Твой день", "Your special day"],
  ["Keramikas vāze", "Керамическая ваза", "Ceramic vase"],
  ["Ziedu šķēres", "Цветочные ножницы", "Floral scissors"],
  ["Ziedu kopšanas komplekts", "Набор для ухода", "Flower care kit"],
];
export interface Product {
  id: string;
  name: Text;
  category: number;
  price: number;
  photo: string;
  color: number;
  occasion: number;
  composition: Text;
  size: string;
  stock: number;
}
const compositions: Text[] = [
  ["Rozes, eikalipts", "Розы, эвкалипт", "Roses, eucalyptus"],
  [
    "Rozes, lisianthus, sezonas ziedi",
    "Розы, эустомы, сезонные цветы",
    "Roses, lisianthus, seasonal stems",
  ],
  [
    "Sezonas ziedi un zaļumi",
    "Сезонные цветы и зелень",
    "Seasonal stems and foliage",
  ],
  [
    "Rozes un dekoratīvie zaļumi",
    "Розы и декоративная зелень",
    "Roses and decorative foliage",
  ],
  ["Jaukti sezonas ziedi", "Сезонный микс", "Mixed seasonal flowers"],
  [
    "Sezonā pieejamie ziedi",
    "Доступные сезонные цветы",
    "Flowers available in season",
  ],
  [
    "Premium rozes un sezonas ziedi",
    "Премиальные розы и сезонные цветы",
    "Premium roses and seasonal flowers",
  ],
  ["Stabilizēta roze", "Стабилизированная роза", "Preserved rose"],
  [
    "Kaltēti ziedi un graudzāles",
    "Сухоцветы и злаки",
    "Dried flowers and grasses",
  ],
  [
    "Dāvanu izlase ar kartīti",
    "Подарочный набор с открыткой",
    "Gift selection with a card",
  ],
  ["Papīra apsveikuma kartīte", "Бумажная открытка", "Paper greeting card"],
  ["Ziedu kopšanas piederums", "Аксессуар для цветов", "Flower care accessory"],
];
export const products: Product[] = names.map((name, i) => ({
  id: `fp-${i + 1}`,
  name,
  category: Math.floor(i / 3),
  price: [
    32, 38, 35, 29, 26, 34, 12, 15, 18, 39, 42, 28, 30, 32, 25, 28, 35, 30, 65,
    85, 100, 25, 35, 45, 28, 32, 22, 45, 39, 65, 5, 6, 5, 18, 14, 10,
  ][i],
  photo: photos[i],
  color: i % 4,
  occasion: i % 4,
  composition: compositions[Math.floor(i / 3)],
  size: i < 21 ? "35–45 cm" : i < 27 ? "20–30 cm" : "15–25 cm",
  stock: i % 7 === 0 ? 2 : 5 + (i % 8),
}));
export const money = (v: number) =>
  new Intl.NumberFormat("lv-LV", { style: "currency", currency: "EUR" }).format(
    v,
  );
export const colors: Text[] = [
  ["Rozā", "Розовый", "Pink"],
  ["Sarkans", "Красный", "Red"],
  ["Balts", "Белый", "White"],
  ["Jaukts", "Разноцветный", "Mixed"],
];
export const today = () => new Date().toISOString().slice(0, 10);
export const future = (days = 1) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
export function estimate(
  size: number,
  card: boolean,
  gift: boolean,
  variety: number,
) {
  return size + (card ? 5 : 0) + (gift ? 12 : 0) + variety;
}
export function discounted(total: number, code: string) {
  return code.trim().toUpperCase() === "BLOOM10"
    ? Math.round(total * 90) / 100
    : total;
}
export function conflict(
  items: { date: string; time: string; method: string }[],
  date: string,
  time: string,
  method: string,
) {
  return items.some(
    (r) => r.date === date && r.time === time && r.method === method,
  );
}
export function nextEvent(date: string, annual: boolean, now = new Date()) {
  const d = new Date(date + "T12:00:00");
  if (annual) {
    d.setFullYear(now.getFullYear());
    if (
      d.getTime() <
      new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    )
      d.setFullYear(now.getFullYear() + 1);
  }
  return d;
}
