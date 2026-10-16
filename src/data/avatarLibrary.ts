export interface StickerAvatar {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  badgeColor: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
}

export const AVATAR_STICKER_LIBRARY: StickerAvatar[] = [
  {
    id: 'chibi_kitsune',
    name: 'Chibi Kitsune',
    emoji: '🦊',
    tagline: 'Mystic fox spirit with neon flame',
    badgeColor: '#FFB27A',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-400',
    accentColor: '#FFB27A',
  },
  {
    id: 'cyber_neko',
    name: 'Cyber Neko',
    emoji: '🐱',
    tagline: 'Hacker kitten with cyber visor',
    badgeColor: '#6FFFE0',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-400',
    accentColor: '#6FFFE0',
  },
  {
    id: 'boba_bear',
    name: 'Boba Panda',
    emoji: '🐼',
    tagline: 'Always sipping brown sugar milk tea',
    badgeColor: '#FF6FD8',
    bgColor: 'bg-pink-500/15',
    borderColor: 'border-pink-400',
    accentColor: '#FF6FD8',
  },
  {
    id: 'mecha_bunny',
    name: 'Mecha Bunny',
    emoji: '🐰',
    tagline: 'High-speed data hopping unit',
    badgeColor: '#5EEAD4',
    bgColor: 'bg-teal-500/15',
    borderColor: 'border-teal-400',
    accentColor: '#5EEAD4',
  },
  {
    id: 'shadow_dragon',
    name: 'Shadow Dragon',
    emoji: '🐲',
    tagline: 'Tiny nocturnal guardian with wings',
    badgeColor: '#B794F6',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-400',
    accentColor: '#B794F6',
  },
  {
    id: 'astroneko',
    name: 'Astro Kitty',
    emoji: '🐈‍⬛',
    tagline: 'Zero-gravity star explorer',
    badgeColor: '#FFE66D',
    bgColor: 'bg-yellow-500/15',
    borderColor: 'border-yellow-400',
    accentColor: '#FFE66D',
  },
  {
    id: 'sakura_finch',
    name: 'Sakura Bird',
    emoji: '🌸',
    tagline: 'Spring blossom secret courier',
    badgeColor: '#FF6FD8',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-400',
    accentColor: '#FF6FD8',
  },
  {
    id: 'phantom_ghostling',
    name: 'Ghostling Cap',
    emoji: '👻',
    tagline: 'Original QuadAnon incognito spirit',
    badgeColor: '#6FFFE0',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-400',
    accentColor: '#6FFFE0',
  },
];
