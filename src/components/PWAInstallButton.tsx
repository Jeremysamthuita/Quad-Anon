import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';
import { playHapticSound } from '../utils/sound';
import { Modal } from './Modal';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Show "Install App" only when installable or on iOS where manual install is required
  if (isInstalled || (!isInstallable && !isIOS)) {
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-mint/15 hover:bg-mint/25 border border-mint/40 text-mint text-xs font-mono transition-all active:scale-95 shadow-sm min-h-[36px]"
        title="Install QuadAnon Application"
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">App</span>
      </button>

      {/* Installation Guide Modal (for iOS Safari) */}
      <Modal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        title="Install QuadAnon"
        description="Add to your device home screen for app shell caching."
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-mint/15 border border-mint/30 flex items-center justify-center text-mint mx-auto">
            <Smartphone className="w-6 h-6" aria-hidden="true" />
          </div>

          <div className="text-left p-4 rounded-2xl bg-canvas border border-border-glass space-y-2 text-xs font-mono text-text-secondary">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-mint text-neutral-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                1
              </span>
              <span>
                Tap the <strong>Share</strong> button in Safari.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-mint text-neutral-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                2
              </span>
              <span>
                Select <strong>"Add to Home Screen"</strong>.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-mint text-neutral-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                3
              </span>
              <span>Launch QuadAnon from your home screen with zero browser bars.</span>
            </div>
          </div>

          <button
            onClick={() => setShowGuide(false)}
            className="w-full py-2.5 rounded-xl bg-surface hover:bg-surface-elevated text-xs font-mono text-text-primary min-h-[44px]"
          >
            Understood
          </button>
        </div>
      </Modal>
    </>
  );
};
