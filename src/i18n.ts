import { pick } from "./data";
import { useStore } from "./store";
export const useT = () => {
  const { s } = useStore();
  return (lv: string, ru: string, en: string) => pick([lv, ru, en], s.lang);
};
