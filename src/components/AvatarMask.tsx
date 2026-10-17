import React from 'react';

const AVATAR_TONES: Record<string, string> = {
  chibi_kitsune: '#5B3FA8',
  cyber_neko: '#7A5CC4',
  boba_bear: '#4B3A86',
  mecha_bunny: '#8C6FD0',
  shadow_dragon: '#6A5A9E',
  astroneko: '#9A8BC0',
  sakura_finch: '#3F3370',
  phantom_ghostling: '#A58CD9',
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
    style={{ width: size, height: size, backgroundColor: AVATAR_TONES[avatarStyle] ?? '#5B3FA8' }}
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
