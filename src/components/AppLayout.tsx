import React from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { MaskedMortarboardLogo } from './MaskedMortarboardLogo';
import { ThemeToggle } from './ThemeToggle';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuth } from '../features/auth/AuthContext';
import {
  Film,
  MessageSquare,
  Send,
  Radio,
  BookOpen,
  Shield,
  Building2,
  Info,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  ariaLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/whispers',
    label: 'Whispers',
    icon: Film,
    ariaLabel: 'Whispers: media reels',
  },
  {
    to: '/quad',
    label: 'The Quad',
    icon: MessageSquare,
    ariaLabel: 'The Quad: campus discussion feed and polls',
  },
  {
    to: '/dms',
    label: 'Shadow DMs',
    icon: Send,
    ariaLabel: 'Shadow DMs: disappearing direct messages',
  },
  {
    to: '/radar',
    label: 'The Radar',
    icon: Radio,
    ariaLabel: 'The Radar: campus issue tracker',
  },
  {
    to: '/library',
    label: 'The Library',
    icon: BookOpen,
    ariaLabel: 'The Library: shared academic resources',
  },
];

export const AppLayout: React.FC = () => {
  const { profile, campus, openModal } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans transition-colors duration-300 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-border-glass shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <Link
            to="/whispers"
            className="flex items-center gap-2.5 shrink-0 focus-visible:outline-2 focus-visible:outline-mint rounded-xl p-1"
            aria-label="QuadAnon Home"
          >
            <MaskedMortarboardLogo size={34} />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight font-mono leading-none text-text-primary">
                QuadAnon
              </span>
              <span className="text-[10px] font-mono text-mint tracking-wider uppercase mt-0.5 font-semibold">
                Pseudonymous Campus Net
              </span>
            </div>
          </Link>

          {/* Active Verified Campus */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-surface border border-border-glass max-w-[200px] sm:max-w-xs">
            <div className="w-6 h-6 rounded-lg bg-mint/15 text-mint flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-mint truncate">
                  {campus.shortCode}
                </span>
                <span className="text-[10px] text-text-muted hidden sm:inline font-mono">
                  · {campus.county}
                </span>
              </div>
              <div className="text-[10px] text-text-secondary truncate font-mono">
                {campus.name}
              </div>
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Transparency / What we can and cannot see */}
            <Link
              to="/privacy"
              title="What we can and cannot see (Transparency)"
              className="p-2 sm:p-2.5 rounded-2xl bg-surface border border-border-glass text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center"
              aria-label="What we can and cannot see"
            >
              <Info className="w-4 h-4" aria-hidden="true" />
            </Link>

            {/* Install PWA */}
            <PWAInstallButton />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Admin link if moderator or admin */}
            {(profile?.role === 'admin' || profile?.role === 'moderator') && (
              <Link
                to="/admin"
                className="p-2 sm:p-2.5 rounded-2xl bg-surface border border-border-glass text-text-secondary hover:text-peach transition-colors"
                title="Moderation Console"
                aria-label="Moderation Console"
              >
                <Shield className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}

            {/* Pseudonymous Handle Badge */}
            {profile && (
              <button
                onClick={() => openModal('profile')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-surface border border-border-glass text-xs font-mono transition-all text-text-primary hover:border-mint min-h-[36px]"
                aria-label={`Profile settings for @${profile.handle}`}
              >
                <div className="w-2 h-2 rounded-full bg-mint" aria-hidden="true" />
                <span className="max-w-[100px] truncate">@{profile.handle}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 focus:outline-none">
        <Outlet />
      </main>

      {/* Bottom Floating Navigation Dock */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full floating-ghost-dock flex items-center gap-1 sm:gap-2 shadow-2xl"
      >
        <div role="tablist" aria-label="Campus modules" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                role="tab"
                aria-selected={isActive}
                aria-label={item.ariaLabel}
                className={({ isActive: active }) =>
                  `group relative flex flex-col items-center justify-center min-w-[54px] sm:min-w-[68px] min-h-[44px] px-2 py-1.5 rounded-full transition-all duration-200 active:scale-95 ${
                    active
                      ? 'bg-white/15 dark:bg-white/10 font-bold shadow-md scale-105'
                      : 'hover:bg-white/5 text-text-secondary'
                  }`
                }
              >
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110 text-mint' : 'text-text-muted group-hover:text-text-primary'}`} aria-hidden="true" />
                <span
                  className={`text-[10px] font-mono tracking-tight ${
                    isActive ? 'text-text-primary font-bold' : 'text-text-muted'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
