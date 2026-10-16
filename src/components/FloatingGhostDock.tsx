import React from 'react';
import { GhostIcon } from './GhostIcons';
import { playHapticSound } from '../utils/sound';

export type MainTabType = 'whispers' | 'quad' | 'dms' | 'radar' | 'library';

interface Props {
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  unreadDMsCount?: number;
}

interface DockItem {
  id: MainTabType;
  label: string;
  color: string;
  activeBg: string;
  activeBorder: string;
}

// App Navigation Sequence: 1. Whispers -> 2. The Quad -> 3. Shadow DMs -> 4. The Radar -> 5. The Library
const DOCK_ITEMS: DockItem[] = [
  {
    id: 'whispers',
    label: 'Whispers',
    color: '#FFB27A', // Neon Peach
    activeBg: 'bg-[#FFB27A]/20',
    activeBorder: 'border-[#FFB27A]/80',
  },
  {
    id: 'quad',
    label: 'The Quad',
    color: '#FF6FD8', // Bubblegum
    activeBg: 'bg-[#FF6FD8]/20',
    activeBorder: 'border-[#FF6FD8]/80',
  },
  {
    id: 'dms',
    label: 'Shadow DMs',
    color: '#B794F6', // Electric Lavender
    activeBg: 'bg-[#B794F6]/20',
    activeBorder: 'border-[#B794F6]/80',
  },
  {
    id: 'radar',
    label: 'The Radar',
    color: '#5EEAD4', // Plasma Cyan
    activeBg: 'bg-[#5EEAD4]/20',
    activeBorder: 'border-[#5EEAD4]/80',
  },
  {
    id: 'library',
    label: 'Library',
    color: '#6FFFE0', // Cyber Mint
    activeBg: 'bg-[#6FFFE0]/20',
    activeBorder: 'border-[#6FFFE0]/80',
  },
];

export const FloatingGhostDock: React.FC<Props> = ({ activeTab, onSelectTab, unreadDMsCount = 0 }) => {
  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full floating-ghost-dock flex items-center gap-1.5 sm:gap-2.5 transition-all duration-300">
      {DOCK_ITEMS.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              playHapticSound('pop');
              onSelectTab(item.id);
            }}
            className={`group relative flex flex-col items-center justify-center px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all duration-300 active:scale-95 ${
              isActive
                ? `${item.activeBg} border ${item.activeBorder} shadow-lg scale-105`
                : 'hover:bg-white/[0.08] border border-transparent'
            }`}
            title={item.label}
          >
            {/* Top Micro-Cutout Pill Dot for 3D depth */}
            {isActive && (
              <span
                className="absolute -top-1 w-3 h-1 rounded-full shadow-sm animate-pulse"
                style={{ backgroundColor: item.color }}
              />
            )}

            {/* 3D Animated Ghost Icon */}
            <GhostIcon type={item.id} isActive={isActive} size={26} />

            {/* Micro Text Label */}
            <span
              className={`text-[9px] sm:text-[10px] font-mono tracking-tight transition-colors duration-200 mt-0.5 whitespace-nowrap ${
                isActive ? 'font-bold' : 'text-neutral-500 dark:text-[#F0EEFF]/50 group-hover:text-neutral-900 dark:group-hover:text-[#F0EEFF]/90'
              }`}
              style={{ color: isActive ? item.color : undefined }}
            >
              {item.label}
            </span>

            {/* Unread badge for Shadow DMs */}
            {item.id === 'dms' && unreadDMsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6FD8] text-[#070A10] font-mono text-[9px] font-bold flex items-center justify-center border border-[#070A10] shadow-sm">
                {unreadDMsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
