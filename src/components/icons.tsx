import React from 'react';

export type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

const commonSvg = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const AppIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...commonSvg}>
    <path d="M4 6c4-2 12-2 16 0v6c0 4-4 7-8 8-4-1-8-4-8-8z" fill="currentColor" stroke="none" />
    <circle cx={9} cy={11} r={1.6} fill="#0B0814" stroke="none" />
    <circle cx={15} cy={11} r={1.6} fill="#0B0814" stroke="none" />
  </svg>
);

export const WhispersIcon: React.FC<IconProps> = ({ className = '', size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...commonSvg}>
    <path d="M6 20.5V11a6 6 0 0 1 12 0v9.5l-2-1.6-2 1.6-2-1.6-2 1.6-2-1.6z" />
    <circle cx={9.7} cy={11} r={1} fill="currentColor" stroke="none" />
    <circle cx={14.3} cy={11} r={1} fill="currentColor" stroke="none" />
  </svg>
);

export const QuadIcon: React.FC<IconProps> = ({ className = '', size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...commonSvg}>
    <path d="M4 6c4-2 12-2 16 0v6c0 4-4 7-8 8-4-1-8-4-8-8z" fill="currentColor" stroke="none" />
    <path d="M8 10.2l2.2 1M16 10.2l-2.2 1M9.5 15c1.6 1.2 3.4 1.2 5 0" />
    <circle cx={9} cy={11} r={1.6} fill="#0B0814" stroke="none" />
    <circle cx={15} cy={11} r={1.6} fill="#0B0814" stroke="none" />
  </svg>
);

export const DmIcon: React.FC<IconProps> = ({ className = '', size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...commonSvg}>
    <path d="M5 4.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-7l-4 3.5V17H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z" />
    <circle cx={9} cy={10.7} r={1} fill="currentColor" stroke="none" />
    <circle cx={15} cy={10.7} r={1} fill="currentColor" stroke="none" />
  </svg>
);

export const RadarIcon: React.FC<IconProps> = ({ className = '', size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...commonSvg}>
    <path d="M12 3.5c-3.3 0-5.5 2.4-5.5 5.7V12L4 20.5h16L17.5 12V9.2c0-3.3-2.2-5.7-5.5-5.7z" />
    <circle cx={10.3} cy={10} r={0.9} fill="currentColor" stroke="none" />
    <circle cx={13.7} cy={10} r={0.9} fill="currentColor" stroke="none" />
  </svg>
);

export const LibraryIcon: React.FC<IconProps> = ({ className = '', size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...commonSvg}>
    <path d="M6 3.5h12v17l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5z" />
    <path d="M9.2 8h5.6M9.2 11.5h5.6" />
  </svg>
);

export const BackIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" {...commonSvg}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
