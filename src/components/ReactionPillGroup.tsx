import React from 'react';
import { playHapticSound } from '../utils/sound';

interface ReactionItem {
  key: 'fire' | 'skull' | 'cap' | 'clown' | 'fax';
  emoji: string;
  label: string;
  color: string; // solid accent color
  activeBg: string;
  activeText: string;
  activeBorder: string;
}

const REACTIONS: ReactionItem[] = [
  {
    key: 'fire',
    emoji: '🔥',
    label: 'Fire',
    color: '#FFB27A', // Peach
    activeBg: 'bg-[#FFB27A]/15',
    activeText: 'text-[#FFB27A]',
    activeBorder: 'border-[#FFB27A]',
  },
  {
    key: 'skull',
    emoji: '💀',
    label: 'Dead',
    color: '#B794F6', // Lavender
    activeBg: 'bg-[#B794F6]/15',
    activeText: 'text-[#B794F6]',
    activeBorder: 'border-[#B794F6]',
  },
  {
    key: 'cap',
    emoji: '🧢',
    label: 'Cap',
    color: '#FFE66D', // Lemon
    activeBg: 'bg-[#FFE66D]/15',
    activeText: 'text-[#FFE66D]',
    activeBorder: 'border-[#FFE66D]',
  },
  {
    key: 'clown',
    emoji: '🤡',
    label: 'Clown',
    color: '#FF6FD8', // Bubblegum
    activeBg: 'bg-[#FF6FD8]/15',
    activeText: 'text-[#FF6FD8]',
    activeBorder: 'border-[#FF6FD8]',
  },
  {
    key: 'fax',
    emoji: '🗣️',
    label: 'Fax',
    color: '#6FFFE0', // Cyber Mint
    activeBg: 'bg-[#6FFFE0]/15',
    activeText: 'text-[#6FFFE0]',
    activeBorder: 'border-[#6FFFE0]',
  },
];

interface Props {
  reactions: {
    fire: number;
    skull: number;
    cap: number;
    clown: number;
    fax: number;
  };
  userReactions: string[];
  onToggleReaction: (key: 'fire' | 'skull' | 'cap' | 'clown' | 'fax') => void;
}

export const ReactionPillGroup: React.FC<Props> = ({ reactions, userReactions, onToggleReaction }) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Vibe reactions">
      {REACTIONS.map((r) => {
        const isSelected = userReactions.includes(r.key);
        const count = reactions[r.key] || 0;

        return (
          <button
            key={r.key}
            type="button"
            onClick={() => {
              playHapticSound(isSelected ? 'click' : 'pop');
              onToggleReaction(r.key);
            }}
            className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all active:scale-95 ${
              isSelected
                ? `${r.activeBg} ${r.activeText} ${r.activeBorder} shadow-sm`
                : 'border-[rgba(255,255,255,0.08)] bg-[#141224]/80 text-[#F0EEFF]/70 hover:border-[rgba(255,255,255,0.2)] hover:text-[#F0EEFF]'
            }`}
            title={`${r.label} reaction (${count})`}
          >
            <span className="text-sm leading-none transition-transform group-hover:scale-110">{r.emoji}</span>
            <span className="tabular-nums text-[11px]">{count}</span>
          </button>
        );
      })}
    </div>
  );
};
