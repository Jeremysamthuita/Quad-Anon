import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Share } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    playHapticSound('click');
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#6FFFE0]/15 hover:bg-[#6FFFE0]/25 border border-[#6FFFE0]/40 text-[#6FFFE0] text-xs font-mono transition-all active:scale-95 shadow-sm"
        title="Download / Install QuadAnon App"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">App</span>
      </button>

      {/* Installation Guide Modal (for iOS Safari or general browser instructions) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0E1320] border border-[rgba(255,255,255,0.15)] p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#6FFFE0]/15 border border-[#6FFFE0]/30 flex items-center justify-center text-[#6FFFE0] mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-[#F0EEFF]">
              Install QuadAnon on Your Device
            </h3>

            <div className="text-left p-3.5 rounded-2xl bg-[#070A10] border border-white/5 space-y-2 text-xs font-mono text-[#F0EEFF]/80">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#6FFFE0] text-[#070A10] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <span>Tap the <strong>Share</strong> or browser menu icon.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#6FFFE0] text-[#070A10] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <span>Select <strong>"Add to Home Screen"</strong> or <strong>"Install Application"</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#6FFFE0] text-[#070A10] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <span>Launch directly from your home screen with zero browser bars & offline caching!</span>
              </div>
            </div>

            <button
              onClick={() => {
                playHapticSound('click');
                setShowGuide(false);
              }}
              className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-mono text-[#F0EEFF]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
