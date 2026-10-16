import React, { useEffect, useState } from 'react';
import { MaskedMortarboardLogo } from './MaskedMortarboardLogo';
import { Sparkles, Radio } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  onComplete: () => void;
}

export const LoadingSplashScreen: React.FC<Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing zero-knowledge device keystore...');

  useEffect(() => {
    // Initial sound
    setTimeout(() => {
      playHapticSound('whisper');
    }, 400);

    const timer1 = setTimeout(() => {
      setProgress(50);
      setStatusText('Syncing Kenya-wide university whisper nodes...');
    }, 600);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Decrypting ephemeral Quad feeds...');
    }, 1200);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Landing on Whispers...');
    }, 1700);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#070A10] text-[#F0EEFF] select-none">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(183,148,246,0.15),transparent)] pointer-events-none" />

      {/* Center 3D Water-Glass Pod */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full p-8 rounded-3xl bg-[#0D121E]/80 backdrop-blur-3xl border border-[rgba(255,255,255,0.12)] shadow-2xl text-center space-y-6">
        {/* Animated Icon with Whispering Rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Aura Rings */}
          <div className="absolute w-28 h-28 rounded-full border border-[#FFB27A]/20 animate-ping opacity-30" />
          <div className="absolute w-24 h-24 rounded-full border border-[#6FFFE0]/30 animate-whisper-aura" />
          <div className="absolute w-20 h-20 rounded-full bg-[#FF6FD8]/15 blur-lg" />

          {/* Core Official App Icon */}
          <div className="relative z-10 p-2 rounded-2xl bg-[#0A0E17] border border-[rgba(255,255,255,0.18)] shadow-xl">
            <MaskedMortarboardLogo size={56} />
          </div>
        </div>

        {/* Brand Lockup */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-mono tracking-tight text-[#F0EEFF]">
            QuadAnon
          </h1>
          <p className="text-xs font-mono text-[#6FFFE0] flex items-center justify-center gap-1.5">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Whispers Atmospheric Engine</span>
          </p>
        </div>

        {/* Progress Bar & Telemetry */}
        <div className="w-full space-y-2">
          <div className="w-full h-1.5 rounded-full bg-[#05080E] overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6FFFE0] via-[#FFB27A] to-[#FF6FD8] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] font-mono text-[#F0EEFF]/60 truncate">
            {statusText}
          </p>
        </div>

        {/* Skip Button */}
        <button
          onClick={() => {
            playHapticSound('click');
            onComplete();
          }}
          className="text-[11px] font-mono text-[#F0EEFF]/40 hover:text-white transition-colors underline underline-offset-4"
        >
          Skip to Whispers →
        </button>
      </div>
    </div>
  );
};
