import React from 'react';

interface GhostIconProps {
  type: 'quad' | 'whispers' | 'library' | 'radar' | 'dms';
  isActive: boolean;
  size?: number;
}

export const GhostIcon: React.FC<GhostIconProps> = ({ type, isActive, size = 32 }) => {
  switch (type) {
    case 'quad':
      // The Quad: Fiery Ember Ghost with Gen Z horns & flame aura
      return (
        <div
          className={`relative flex items-center justify-center transition-transform duration-300 ${
            isActive ? 'scale-110 animate-ghost-float' : 'hover:scale-105'
          }`}
          style={{ width: size, height: size }}
        >
          {/* Glowing Aura Ring */}
          {isActive && (
            <div className="absolute inset-0 rounded-full bg-[#FF6FD8]/25 blur-md animate-pulse" />
          )}
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
            {/* 3D Ember Ghost Body */}
            <path
              d="M18 4C11.5 4 7 9 7 15.5V28C7 29.5 8.5 30.5 10 29.5L12.5 28L15.5 29.8C16.8 30.5 19.2 30.5 20.5 29.8L23.5 28L26 29.5C27.5 30.5 29 29.5 29 28V15.5C29 9 24.5 4 18 4Z"
              fill={isActive ? '#25152F' : '#141120'}
              stroke={isActive ? '#FF6FD8' : 'rgba(255,255,255,0.25)'}
              strokeWidth="1.6"
            />
            {/* Horns / Flames on Cap */}
            <path
              d="M13 3.5C13 2 15 1 15 3.5C15 6 13 5.5 13 3.5Z"
              fill={isActive ? '#FF6FD8' : '#B794F6'}
            />
            <path
              d="M23 3.5C23 2 21 1 21 3.5C21 6 23 5.5 23 3.5Z"
              fill={isActive ? '#FF6FD8' : '#B794F6'}
            />
            {/* Glowing Eyes */}
            <circle cx="14" cy="15" r="2" fill={isActive ? '#FF6FD8' : '#F0EEFF'} />
            <circle cx="22" cy="15" r="2" fill={isActive ? '#FF6FD8' : '#F0EEFF'} />
            {/* Mouth / Smile */}
            <path
              d="M15 20C16 21.5 20 21.5 21 20"
              stroke={isActive ? '#FF6FD8' : 'rgba(255,255,255,0.4)'}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case 'whispers':
      // Whispers: Lens / Reel Camera Ghost with neon shutter aura
      return (
        <div
          className={`relative flex items-center justify-center transition-transform duration-300 ${
            isActive ? 'scale-110 animate-ghost-float' : 'hover:scale-105'
          }`}
          style={{ width: size, height: size }}
        >
          {isActive && (
            <div className="absolute inset-0 rounded-full bg-[#FFB27A]/25 blur-md animate-pulse" />
          )}
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
            {/* Ghost Contour */}
            <path
              d="M18 4.5C11.5 4.5 7 9.5 7 16V28C7 29.5 8.5 30.5 10 29.5L13 28L18 30L23 28L26 29.5C27.5 30.5 29 29.5 29 28V16C29 9.5 24.5 4.5 18 4.5Z"
              fill={isActive ? '#2B1C1A' : '#141120'}
              stroke={isActive ? '#FFB27A' : 'rgba(255,255,255,0.25)'}
              strokeWidth="1.6"
            />
            {/* 3D Holographic Viewfinder Halo */}
            <circle
              cx="18"
              cy="16"
              r="6"
              stroke={isActive ? '#FFB27A' : '#5EEAD4'}
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            {/* Aperture Center Lens */}
            <circle cx="18" cy="16" r="2.5" fill={isActive ? '#FFB27A' : '#F0EEFF'} />
            {/* Reel Dot indicators */}
            <circle cx="10" cy="10" r="1.2" fill={isActive ? '#FFB27A' : 'rgba(255,255,255,0.3)'} />
            <circle cx="26" cy="10" r="1.2" fill={isActive ? '#FFB27A' : 'rgba(255,255,255,0.3)'} />
          </svg>
        </div>
      );

    case 'library':
      // The Library: Scholar Ghost with holographic cyber tome & visor
      return (
        <div
          className={`relative flex items-center justify-center transition-transform duration-300 ${
            isActive ? 'scale-110 animate-ghost-float' : 'hover:scale-105'
          }`}
          style={{ width: size, height: size }}
        >
          {isActive && (
            <div className="absolute inset-0 rounded-full bg-[#6FFFE0]/25 blur-md animate-pulse" />
          )}
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
            {/* Ghost with academic mortarboard crest */}
            <path
              d="M18 5C11.5 5 7 10 7 16V28C7 29.5 8.5 30.5 10 29.5L13 28L18 30L23 28L26 29.5C27.5 30.5 29 29.5 29 28V16C29 10 24.5 5 18 5Z"
              fill={isActive ? '#0E2726' : '#141120'}
              stroke={isActive ? '#6FFFE0' : 'rgba(255,255,255,0.25)'}
              strokeWidth="1.6"
            />
            {/* Cyber Visor Glasses */}
            <rect
              x="11"
              y="13"
              width="14"
              height="4.5"
              rx="2.2"
              fill={isActive ? '#6FFFE0' : 'rgba(111,255,224,0.3)'}
            />
            {/* Holographic Book at Bottom */}
            <path
              d="M13 22H17.5V26H13C12.5 26 12 25.5 12 25V23C12 22.5 12.5 22 13 22Z"
              stroke={isActive ? '#6FFFE0' : '#F0EEFF'}
              strokeWidth="1.2"
            />
            <path
              d="M23 22H18.5V26H23C23.5 26 24 25.5 24 25V23C24 22.5 23.5 22 23 22Z"
              stroke={isActive ? '#6FFFE0' : '#F0EEFF'}
              strokeWidth="1.2"
            />
          </svg>
        </div>
      );

    case 'radar':
      // The Radar: Sonar Ghost with concentric radar pulse waves
      return (
        <div
          className={`relative flex items-center justify-center transition-transform duration-300 ${
            isActive ? 'scale-110 animate-ghost-float' : 'hover:scale-105'
          }`}
          style={{ width: size, height: size }}
        >
          {isActive && (
            <div className="absolute inset-0 rounded-full bg-[#5EEAD4]/25 blur-md animate-pulse" />
          )}
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
            {/* Ghost Silhouette */}
            <path
              d="M18 4C11.5 4 7 9 7 15.5V28C7 29.5 8.5 30.5 10 29.5L13 28L18 30L23 28L26 29.5C27.5 30.5 29 29.5 29 28V15.5C29 9 24.5 4 18 4Z"
              fill={isActive ? '#112527' : '#141120'}
              stroke={isActive ? '#5EEAD4' : 'rgba(255,255,255,0.25)'}
              strokeWidth="1.6"
            />
            {/* Antenna Orb on Head */}
            <circle cx="18" cy="3.5" r="1.5" fill={isActive ? '#5EEAD4' : '#6FFFE0'} />
            {/* Concentric Radar Rings */}
            <path
              d="M12 17C12 13.5 14.5 11 18 11C21.5 11 24 13.5 24 17"
              stroke={isActive ? '#5EEAD4' : 'rgba(255,255,255,0.3)'}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M14.5 17C14.5 15 16 13.5 18 13.5C20 13.5 21.5 15 21.5 17"
              stroke={isActive ? '#5EEAD4' : 'rgba(255,255,255,0.3)'}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            {/* Scanner Center Ping */}
            <circle cx="18" cy="18" r="2" fill={isActive ? '#5EEAD4' : '#F0EEFF'} />
          </svg>
        </div>
      );

    case 'dms':
      // Shadow DMs: Ninja Incognito Ghost with hood & glowing visor
      return (
        <div
          className={`relative flex items-center justify-center transition-transform duration-300 ${
            isActive ? 'scale-110 animate-ghost-float' : 'hover:scale-105'
          }`}
          style={{ width: size, height: size }}
        >
          {isActive && (
            <div className="absolute inset-0 rounded-full bg-[#B794F6]/25 blur-md animate-pulse" />
          )}
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
            {/* Shadow Shroud Hood */}
            <path
              d="M18 4C11.5 4 7 9 7 15.5V28C7 29.5 8.5 30.5 10 29.5L13 28L18 30L23 28L26 29.5C27.5 30.5 29 29.5 29 28V15.5C29 9 24.5 4 18 4Z"
              fill={isActive ? '#211833' : '#141120'}
              stroke={isActive ? '#B794F6' : 'rgba(255,255,255,0.25)'}
              strokeWidth="1.6"
            />
            {/* Ninja Eye Slit Mask */}
            <path
              d="M11 15H25V18.5H11V15Z"
              fill="#070A10"
              stroke={isActive ? '#B794F6' : 'rgba(255,255,255,0.15)'}
              strokeWidth="1"
            />
            {/* Incognito Cyber Eyes */}
            <circle cx="15" cy="16.8" r="1.4" fill={isActive ? '#B794F6' : '#6FFFE0'} />
            <circle cx="21" cy="16.8" r="1.4" fill={isActive ? '#B794F6' : '#6FFFE0'} />
          </svg>
        </div>
      );
  }
};
