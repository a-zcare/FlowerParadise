import { STORAGE_KEY, initialState, migrate } from "./domain";
import type { DemoState } from "./models";
export interface KeyValueStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}
/** One local repository; replace this boundary for a future verified backend. */
export function demoRepository(storage: KeyValueStorage) {
  return {
    load(): DemoState {
      for (const key of [STORAGE_KEY, "flower-paradise-v1"]) {
        try {
          const value = storage.getItem(key);
          if (!value) continue;
          const parsed: unknown = JSON.parse(value);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
            return migrate(parsed);
        } catch {
          /* Try the previous schema before falling back to fresh demo data. */
        }
      }
      return initialState();
    },
    save(state: DemoState) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
        try {
          storage.removeItem("flower-paradise-v1");
        } catch {
          /* The new state is already saved. */
        }
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      for (const key of [STORAGE_KEY, "flower-paradise-v1"])
        try {
          storage.removeItem(key);
        } catch {
          /* Memory reset does not depend on storage access. */
        }
    },
  };
}
