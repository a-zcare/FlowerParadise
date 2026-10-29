import type { CSSProperties } from "react";
import type { Text } from "./data";
export type ThemeCategory =
  | "original"
  | "floral"
  | "botanical"
  | "minimal"
  | "luxury"
  | "colourful";
export interface VisualTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  description: Text;
  colors: [string, string, string, string, string];
  heading: string;
  radius: string;
  shadow: string;
  detail: "soft" | "line" | "organic" | "graphic" | "deco";
  dark?: boolean;
}
const serif = '"Cormorant Garamond", Georgia, serif';
const modern = '"Manrope", sans-serif';
export const themes: VisualTheme[] = [
  {
    id: "original",
    name: "Original / Current Design",
    category: "original",
    description: [
      "Sākotnējā Flower Paradise identitāte.",
      "Исходный дизайн Flower Paradise.",
      "The original Flower Paradise identity.",
    ],
    colors: ["#faf8f4", "#fffefa", "#30392f", "#344c3d", "#c58d92"],
    heading: serif,
    radius: "3px",
    shadow: "0 12px 45px #30392f08",
    detail: "soft",
  },
  {
    id: "floral-elegance",
    name: "Floral Elegance",
    category: "floral",
    description: [
      "Ziloņkauls, rozā un šampanietis.",
      "Слоновая кость, розовый и шампань.",
      "Ivory, blush and champagne.",
    ],
    colors: ["#fcf5ed", "#fffaf7", "#4c333d", "#784859", "#bc7886"],
    heading: serif,
    radius: "18px",
    shadow: "0 12px 35px #783f4812",
    detail: "soft",
  },
  {
    id: "midnight-bloom",
    name: "Midnight Bloom",
    category: "luxury",
    description: [
      "Tumšs fons, bordo un kluss zelts.",
      "Тёмный фон, бордо и приглушённое золото.",
      "Charcoal, burgundy and quiet gold.",
    ],
    colors: ["#202126", "#29292e", "#f4e9df", "#d3b887", "#a87d8c"],
    heading: serif,
    radius: "2px",
    shadow: "0 18px 40px #0003",
    detail: "line",
    dark: true,
  },
  {
    id: "botanical-calm",
    name: "Botanical Calm",
    category: "botanical",
    description: [
      "Salvija, krēms un dabiskas formas.",
      "Шалфей, кремовый и природные формы.",
      "Sage, cream and natural forms.",
    ],
    colors: ["#eef1e7", "#f9fbf4", "#303d2a", "#46623b", "#8a754d"],
    heading: serif,
    radius: "28px 5px 28px 5px",
    shadow: "0 10px 24px #364c3410",
    detail: "organic",
  },
  {
    id: "colorful-garden",
    name: "Colorful Garden",
    category: "colourful",
    description: [
      "Dzīvespriecīgs koraļļu dārzs.",
      "Жизнерадостный коралловый сад.",
      "A joyful coral garden.",
    ],
    colors: ["#fff6df", "#fffdfa", "#3e3742", "#934137", "#a63c65"],
    heading: serif,
    radius: "24px",
    shadow: "5px 6px 0 #e5bf6e",
    detail: "graphic",
  },
  {
    id: "pure-minimal",
    name: "Pure Minimal",
    category: "minimal",
    description: [
      "Tīras līnijas. Skaidrs ritms.",
      "Чистые линии. Чёткий ритм.",
      "Clean lines. Clear rhythm.",
    ],
    colors: ["#ffffff", "#f7f7f7", "#202020", "#292929", "#666666"],
    heading: modern,
    radius: "0px",
    shadow: "none",
    detail: "line",
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    category: "floral",
    description: [
      "Maigs ceriņu sapnis.",
      "Нежная сиреневая мечта.",
      "A soft lilac daydream.",
    ],
    colors: ["#f3effa", "#fdfaff", "#44334f", "#715283", "#a86f92"],
    heading: serif,
    radius: "30px",
    shadow: "0 14px 30px #70568b16",
    detail: "soft",
  },
  {
    id: "emerald-luxury",
    name: "Emerald Luxury",
    category: "luxury",
    description: [
      "Smaragds ar zelta detaļām.",
      "Изумруд с золотыми деталями.",
      "Emerald with golden details.",
    ],
    colors: ["#f5f2e7", "#fffdf5", "#193e34", "#145340", "#98793b"],
    heading: serif,
    radius: "3px",
    shadow: "0 20px 50px #164c3820",
    detail: "deco",
  },
  {
    id: "parisian-romance",
    name: "Parisian Romance",
    category: "floral",
    description: [
      "Antīks krēms un putekļaini rozā.",
      "Античный кремовый и пыльная роза.",
      "Antique cream and dusty rose.",
    ],
    colors: ["#f7ece5", "#fff8f0", "#51313d", "#754252", "#a56673"],
    heading: serif,
    radius: "65px 65px 4px 4px",
    shadow: "0 10px 28px #72384b15",
    detail: "line",
  },
  {
    id: "nordic-bloom",
    name: "Nordic Bloom",
    category: "minimal",
    description: [
      "Silts baltais un smilšu mierīgums.",
      "Тёплый белый и спокойствие песка.",
      "Warm white and sandy calm.",
    ],
    colors: ["#f5f2eb", "#fdfcf8", "#3d423a", "#57634e", "#9e7e60"],
    heading: modern,
    radius: "8px",
    shadow: "0 2px 6px #363c3510",
    detail: "soft",
  },
  {
    id: "sunset-blossom",
    name: "Sunset Blossom",
    category: "colourful",
    description: [
      "Persiks un silta terakota.",
      "Персик и тёплая терракота.",
      "Peach and warm terracotta.",
    ],
    colors: ["#fff0e7", "#fff9f3", "#613d32", "#a34d37", "#ae5d67"],
    heading: serif,
    radius: "24px 2px 24px 2px",
    shadow: "0 14px 30px #a34d3715",
    detail: "organic",
  },
  {
    id: "zen-garden",
    name: "Zen Garden",
    category: "botanical",
    description: [
      "Akmens, pelēks un zaļš līdzsvars.",
      "Камень, серый и зелёный баланс.",
      "Stone, grey and green balance.",
    ],
    colors: ["#eaeae2", "#f4f4ed", "#394038", "#4d6254", "#7c715d"],
    heading: serif,
    radius: "2px",
    shadow: "none",
    detail: "organic",
  },
  {
    id: "art-deco-bloom",
    name: "Art Deco Bloom",
    category: "luxury",
    description: [
      "Ģeometrija, plūme un šampanieša zelts.",
      "Геометрия, слива и золото шампань.",
      "Geometry, plum and champagne gold.",
    ],
    colors: ["#201e24", "#2d2730", "#f7eddf", "#dfc795", "#bc96b7"],
    heading: serif,
    radius: "0px",
    shadow: "4px 4px 0 #927a5355",
    detail: "deco",
    dark: true,
  },
  {
    id: "blue-serenity",
    name: "Blue Serenity",
    category: "minimal",
    description: [
      "Pūderzils un mierīgs slāneklis.",
      "Пудровый голубой и спокойный сланец.",
      "Powder blue and calm slate.",
    ],
    colors: ["#eef5fa", "#ffffff", "#304555", "#3e617b", "#6e849b"],
    heading: serif,
    radius: "16px",
    shadow: "0 10px 30px #416c8912",
    detail: "line",
  },
  {
    id: "modern-pop",
    name: "Modern Pop",
    category: "colourful",
    description: [
      "Košs rozā. Droša tipogrāfija.",
      "Яркий розовый. Смелая типографика.",
      "Vibrant pink. Confident typography.",
    ],
    colors: ["#fff6c9", "#fffcf0", "#302632", "#a51e65", "#ae316c"],
    heading: modern,
    radius: "15px",
    shadow: "5px 5px 0 #302632",
    detail: "graphic",
  },
];
export const themeById = (id: string) =>
  themes.find((t) => t.id === id) ?? themes[0];
export function themeTokens(theme: VisualTheme, dark = false): CSSProperties {
  const [paper, card, ink, green, rose] = theme.colors;
  const night = dark && !theme.dark;
  return {
    "--paper": night ? "#202822" : paper,
    "--card": night ? "#29342c" : card,
    "--ink": night ? "#f1eee6" : ink,
    "--green": night ? "#bad0ab" : green,
    "--rose": rose,
    "--muted": night || theme.dark ? "#bdbbb3" : "#62645e",
    "--sage":
      night || theme.dark
        ? "#354238"
        : `color-mix(in srgb, ${green} 9%, ${paper})`,
    "--line":
      night || theme.dark
        ? "#596052"
        : `color-mix(in srgb, ${ink} 18%, ${paper})`,
    "--blush": `color-mix(in srgb, ${rose} 12%, ${paper})`,
    "--theme-heading": theme.heading,
    "--theme-radius": theme.radius,
    "--shadow": theme.shadow,
    "--festive-bg": night || theme.dark ? "#263b32" : "#283f33",
    "--festive-ink": "#fff5e5",
    "--festive-muted": "#dfd4be",
    "--festive-accent": "#d9be8b",
    "--festive-line": "#b59d7059",
    "--hero-bg": "#183329",
    "--hero-shade": "#12251ed9",
    "--hero-shade-soft": "#14271b50",
    "--image-action-bg": "#fffaf0",
    "--image-action-ink": "#344b3c",
    "--mobile-nav-height": "72px",
  } as CSSProperties;
}
