/**
 * Safe localStorage wrapper for UI preferences and pseudonymous profile metadata.
 * Do not persist credentials, private DMs, or other sensitive data here.
 */

export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return fallback;
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
