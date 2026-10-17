import { describe, it, expect } from 'vitest';
import { generateId, formatRelativeTime, formatExpiresIn, formatFileSize } from './utils';

describe('utils', () => {
  describe('generateId', () => {
    it('generates a valid UUID string', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('formatRelativeTime', () => {
    it('formats recent timestamps as "just now"', () => {
      const nowIso = new Date().toISOString();
      expect(formatRelativeTime(nowIso)).toBe('just now');
    });
  });

  describe('formatExpiresIn', () => {
    it('handles view once', () => {
      expect(formatExpiresIn(new Date().toISOString(), true)).toBe('View once');
    });

    it('handles expired timestamps', () => {
      const pastIso = new Date(Date.now() - 60000).toISOString();
      expect(formatExpiresIn(pastIso)).toBe('Expired');
    });
  });

  describe('formatFileSize', () => {
    it('formats 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('formats kilobytes and megabytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1048576)).toBe('1.0 MB');
    });
  });
});

