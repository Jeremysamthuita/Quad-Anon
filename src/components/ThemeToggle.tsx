import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { safeStorage } from '../lib/storage';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = safeStorage.getItem<'dark' | 'light'>('quadanon_theme', 'dark');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    safeStorage.setItem('quadanon_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#070A10');
    } else {
      document.documentElement.classList.remove('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#F4F7FC');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={theme === 'dark'}
      className="p-2 sm:p-2.5 rounded-2xl bg-surface border border-border-glass text-text-secondary hover:text-text-primary transition-all shadow-sm active:scale-95"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-lemon" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 text-lavender" aria-hidden="true" />
      )}
    </button>
  );
};
