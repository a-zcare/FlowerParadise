import type { CountdownSettings } from "./countdown";
import type { Product, Text } from "./data";
export type Lifecycle =
  | "concept"
  | "research"
  | "handmade"
  | "made-to-order"
  | "ready"
  | "unavailable"
  | "archived";
export interface WrappingConfig {
  size: "small" | "medium" | "large";
  color: string;
  paper: string;
  ribbon: string;
  ribbonStyle: "satin" | "velvet" | "twine";
  bow: boolean;
  tag: boolean;
  recipient: string;
  message: string;
  seal: boolean;
  accessories: boolean;
}
export interface WreathConfig {
  type: number;
  greenery: number;
  candles: number;
  decorations: number[];
  color: number;
  accentColor?: number;
}
export interface CalendarDay {
  content: string;
  message: string;
}
export interface DesignConfig {
  kind: "gift" | "wrapping" | "wreath" | "calendar";
  recipient: string;
  budget: number;
  message?: string;
  card?: boolean;
  draftSize?: "S" | "M" | "L";
  draftDate?: string;
  packaging: "box" | "basket";
  wrapping?: WrappingConfig;
  wreath?: WreathConfig;
  days?: CalendarDay[];
  extras: { id: string; qty: number }[];
  lines?: { id: string; qty: number }[];
}
export interface WishList {
  id: string;
  name: string;
  items: string[];
}
export interface CorporateInquiry {
  id: string;
  company: string;
  contact: string;
  productId: string;
  quantity: number;
  budget: number;
  date: string;
  method: string;
  branding: string;
  configuration: DesignConfig;
  total: number;
  status: "draft" | "review" | "prepared";
}
export interface ProductMeta {
  status: Lifecycle;
  visible: boolean;
  seasonal: boolean;
}
export interface MediaRecord {
  id: string;
  photo: string;
  alt: Text;
  source: string;
  license: string;
}
export interface CommerceState {
  drafts: Record<string, DesignConfig>;
  wishlists: WishList[];
  corporate: CorporateInquiry[];
  productMeta: Record<string, ProductMeta>;
  customProducts: Product[];
  edits: Record<string, Product>;
  deleted: string[];
  media: MediaRecord[];
  slots: {
    capacity: number;
    cutoffHour: number;
    leadDays: number;
    closed: string[];
  };
  materialPrices: Record<string, number>;
  materialStock: Record<string, number>;
  events: { kind: string; product: string; date: string }[];
  orderStages: Record<string, string>;
  banner: Text;
  countdown: "christmas" | "new-year";
  countdownSettings: CountdownSettings;
}
