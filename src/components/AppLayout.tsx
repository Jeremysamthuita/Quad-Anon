import React from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { MaskedMortarboardLogo } from './MaskedMortarboardLogo';
import { AvatarMask } from './AvatarMask';
import { WhispersIcon, QuadIcon, DmIcon, RadarIcon, LibraryIcon } from './icons';
import { useAuth } from '../features/auth/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  ariaLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/whispers', label: 'Whispers', icon: WhispersIcon, ariaLabel: 'Whispers: media reels' },
  { to: '/quad', label: 'The Quad', icon: QuadIcon, ariaLabel: 'The Quad: campus discussion feed and polls' },
  { to: '/dms', label: 'Shadow DMs', icon: DmIcon, ariaLabel: 'Shadow DMs: disappearing direct messages' },
  { to: '/radar', label: 'The Radar', icon: RadarIcon, ariaLabel: 'The Radar: campus issue tracker' },
  { to: '/library', label: 'The Library', icon: LibraryIcon, ariaLabel: 'The Library: shared academic resources' },
];

export const AppLayout: React.FC = () => {
  const { profile, campus, openModal } = useAuth();
  const location = useLocation();
  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((item) => location.pathname.startsWith(item.to)),
  );
  const hideShell = !profile || location.pathname === '/create-profile' || location.pathname === '/delete-account';

  if (hideShell) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-canvas/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/whispers" aria-label="QuadAnon home" className="flex items-center gap-2">
              <MaskedMortarboardLogo size={28} />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              {campus.shortCode}
            </span>
            <span className="hidden text-[10px] text-[var(--muted)] sm:inline">{campus.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openModal('profile')}
              aria-label={`Profile settings for @${profile?.handle}`}
              className="flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-left"
            >
              <div className="flex flex-col items-center gap-1">
                <AvatarMask avatarStyle={profile.avatarStyle} size={28} />
                <span className="max-w-[90px] truncate text-[11px] leading-none text-[var(--muted)]">
                  @{profile.handle}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      <nav
        aria-label="Main Navigation"
        className="nav-beam fixed bottom-3 left-1/2 z-40 w-[calc(100%-24px)] max-w-[520px] -translate-x-1/2 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_10px_24px_rgba(0,0,0,0.55)]"
        style={{ ['--i' as string]: activeIndex }}
      >
        <div role="tablist" aria-label="Campus modules" className="relative flex items-stretch justify-between gap-1">
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
                  `relative z-10 flex min-h-[44px] flex-1 items-center justify-center rounded-[18px] px-2 py-2 transition hover:bg-[var(--surface-2)] ${active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} `
                }
              >
                <span className="relative flex items-center justify-center">
                  <Icon className={isActive ? 'scale-100 drop-shadow-[0_0_6px_rgba(196,181,253,0.55)]' : ''} size={22} />
                  {item.to === '/dms' && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                  )}
                </span>
                <span className={`ml-2 text-[11px] font-semibold ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
                <span className="sr-only">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
