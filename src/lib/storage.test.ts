import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { safeStorage } from './storage';

describe('safeStorage', () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    for (const key in store) {
      delete store[key];
    }

    (globalThis as unknown as { window: unknown }).window = {
      localStorage: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
      },
    };
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('stores and retrieves items safely', () => {
    safeStorage.setItem('test_key', { theme: 'dark' });
    const result = safeStorage.getItem('test_key', { theme: 'light' });
    expect(result).toEqual({ theme: 'dark' });
  });

  it('returns fallback value on missing key', () => {
    const result = safeStorage.getItem('nonexistent', 'fallback');
    expect(result).toBe('fallback');
  });

  it('removes items safely', () => {
    safeStorage.setItem('key_to_remove', 'value');
    safeStorage.removeItem('key_to_remove');
    expect(safeStorage.getItem('key_to_remove', 'empty')).toBe('empty');
  });

  it('handles JSON parse errors gracefully by returning fallback', () => {
    store['bad_json'] = 'not-valid-json{';
    const result = safeStorage.getItem('bad_json', 'fallback');
    expect(result).toBe('fallback');
  });
});
