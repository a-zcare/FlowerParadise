import { categories, pick, type Lang, type Product } from "./data";
export interface CatalogFilters {
  scope: "flowers" | "holiday" | "all";
  query: string;
  category: string;
  occasion: string;
  color: string;
  max: number;
  recipient?: string;
  material?: string;
  personalizable?: boolean;
  handmade?: boolean;
  size?: string;
  giftReady?: boolean;
  method?: string;
}
export function filterCatalog(
  products: Product[],
  f: CatalogFilters,
  lang: Lang,
) {
  return products.filter(
    (p) =>
      (f.scope === "all" ||
        (f.scope === "holiday" ? !!p.seasonal : !p.seasonal)) &&
      (!f.query ||
        `${pick(p.name, lang)} ${pick(p.composition, lang)} ${pick(categories[p.category], lang)} ${pick(p.description, lang)}`
          .toLowerCase()
          .includes(f.query.toLowerCase())) &&
      (f.category === "" || p.category === Number(f.category)) &&
      p.price <= f.max &&
      (f.occasion === "" || p.occasion === Number(f.occasion)) &&
      (f.color === "" || p.color === Number(f.color)) &&
      (!f.recipient || p.seasonal?.recipients.includes(f.recipient)) &&
      (!f.material || p.seasonal?.materialTags.includes(f.material)) &&
      (!f.personalizable || p.customizable) &&
      (!f.handmade || p.seasonal?.handmadeStyle) &&
      (!f.giftReady || p.seasonal?.giftReady) &&
      (!f.size ||
        (f.size === "mini"
          ? p.size.startsWith("18")
          : f.size === "large"
            ? p.size.startsWith("45")
            : p.size.startsWith("30"))) &&
      (!f.method || ["pickup", "delivery"].includes(f.method)),
  );
}
