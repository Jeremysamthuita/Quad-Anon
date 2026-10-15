import React from 'react';
import { GhostIcon } from './GhostIcons';
import { playHapticSound } from '../utils/sound';

export type MainTabType = 'quad' | 'whispers' | 'library' | 'radar' | 'dms';

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

const DOCK_ITEMS: DockItem[] = [
  {
    id: 'quad',
    label: 'The Quad',
    color: '#FF6FD8', // Bubblegum
    activeBg: 'bg-[#FF6FD8]/15',
    activeBorder: 'border-[#FF6FD8]/60',
  },
  {
    id: 'whispers',
    label: 'Whispers',
    color: '#FFB27A', // Neon Peach
    activeBg: 'bg-[#FFB27A]/15',
    activeBorder: 'border-[#FFB27A]/60',
  },
  {
    id: 'library',
    label: 'Library',
    color: '#6FFFE0', // Cyber Mint
    activeBg: 'bg-[#6FFFE0]/15',
    activeBorder: 'border-[#6FFFE0]/60',
  },
  {
    id: 'radar',
    label: 'Radar',
    color: '#5EEAD4', // Plasma Cyan
    activeBg: 'bg-[#5EEAD4]/15',
    activeBorder: 'border-[#5EEAD4]/60',
  },
  {
    id: 'dms',
    label: 'Shadow DMs',
    color: '#B794F6', // Electric Lavender
    activeBg: 'bg-[#B794F6]/15',
    activeBorder: 'border-[#B794F6]/60',
  },
];

export const FloatingGhostDock: React.FC<Props> = ({ activeTab, onSelectTab, unreadDMsCount = 0 }) => {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-3 py-2 rounded-full floating-ghost-dock flex items-center gap-2 sm:gap-3 transition-all duration-300">
      {DOCK_ITEMS.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              playHapticSound('pop');
              onSelectTab(item.id);
            }}
            className={`group relative flex flex-col items-center justify-center p-2 sm:px-3 sm:py-2 rounded-full transition-all duration-300 active:scale-95 ${
              isActive
                ? `${item.activeBg} border ${item.activeBorder} shadow-lg shadow-black/40`
                : 'hover:bg-white/[0.06] border border-transparent'
            }`}
            title={item.label}
          >
            {/* Top Micro-Cutout Pill Dot for 3D depth */}
            {isActive && (
              <span
                className="absolute -top-1 w-2.5 h-1 rounded-full shadow-sm"
                style={{ backgroundColor: item.color }}
              />
            )}

            {/* 3D Animated Ghost Icon */}
            <GhostIcon type={item.id} isActive={isActive} size={28} />

            {/* Micro Text Label */}
            <span
              className={`text-[10px] font-mono tracking-tight transition-colors duration-200 mt-1 whitespace-nowrap ${
                isActive ? 'font-bold' : 'text-[#F0EEFF]/50 group-hover:text-[#F0EEFF]/80'
              }`}
              style={{ color: isActive ? item.color : undefined }}
            >
              {item.label}
            </span>

            {/* Unread badge for Shadow DMs */}
            {item.id === 'dms' && unreadDMsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6FD8] text-[#070A10] font-mono text-[9px] font-bold flex items-center justify-center border border-[#070A10]">
                {unreadDMsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
