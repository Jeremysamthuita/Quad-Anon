import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const MaskedMortarboardLogo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl bg-[#17142A] border border-[rgba(255,255,255,0.12)] p-1.5 shadow-sm ${className}`}
      style={{ width: size, height: size }}
      aria-label="QuadAnon Masked Mortarboard Logo"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Mortarboard Cap Top Diamond */}
        <path
          d="M20 6L35 13L20 20L5 13L20 6Z"
          fill="#1C1835"
          stroke="#F0EEFF"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Tassel */}
        <path
          d="M31 15V24C31 25.5 29.8 26.5 28.5 26.5"
          stroke="#FF6FD8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="28.5" cy="27" r="1.5" fill="#FF6FD8" />

        {/* Shield / Incognito Hood Silhouette */}
        <path
          d="M10 16.5V26C10 32.5 20 36 20 36C20 36 30 32.5 30 26V16.5"
          fill="#110F22"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cyber Mint Glowing Incognito Eyes */}
        <circle cx="16" cy="23.5" r="1.8" fill="#6FFFE0" />
        <circle cx="24" cy="23.5" r="1.8" fill="#6FFFE0" />
      </svg>
    </div>
  );
};
