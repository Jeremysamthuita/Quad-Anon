import React from 'react';

const AVATAR_TONES: Record<string, string> = {
  chibi_kitsune: 'var(--color-lavender)',
  cyber_neko: 'var(--color-bubblegum)',
  boba_bear: 'var(--color-mint)',
  mecha_bunny: 'var(--color-peach)',
  shadow_dragon: 'var(--color-cyan)',
  astroneko: 'var(--color-lemon)',
  sakura_finch: 'var(--color-lavender)',
  phantom_ghostling: 'var(--color-bubblegum)',
};

interface AvatarMaskProps {
  avatarStyle: string;
  size?: number;
  className?: string;
}

export const AvatarMask: React.FC<AvatarMaskProps> = ({
  avatarStyle,
  size = 28,
  className = '',
}) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
    style={{
      width: size,
      height: size,
      backgroundColor: AVATAR_TONES[avatarStyle] ?? 'var(--color-lavender)',
    }}
  >
    <svg
      viewBox="0 0 24 24"
      width={Math.round(size * 0.78)}
      height={Math.round(size * 0.78)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6c4-2 12-2 16 0v6c0 4-4 7-8 8-4-1-8-4-8-8z"
        fill="var(--text)"
      />
      <circle cx="9" cy="11" r="1.6" fill="var(--bg)" />
      <circle cx="15" cy="11" r="1.6" fill="var(--bg)" />
    </svg>
  </span>
);
