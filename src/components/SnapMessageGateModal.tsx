import React, { useState } from 'react';
import { DirectMessage } from '../types';
import { Eye, Flame, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  message: DirectMessage | null;
  onCloseAndBurn: (messageId: string) => void;
}

export const SnapMessageGateModal: React.FC<Props> = ({ message, onCloseAndBurn }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15);

  if (!message) return null;

  const handleReveal = () => {
    setIsRevealed(true);
    playHapticSound('snap');

    // Start 15s self-destruct timer once opened
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCloseAndBurn(message.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleManualBurn = () => {
    playHapticSound('snap');
    onCloseAndBurn(message.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="relative w-full max-w-md rounded-2xl bg-[#100E21] border border-[rgba(255,255,255,0.15)] p-6 shadow-2xl flex flex-col items-center text-center">
        {!isRevealed ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-[#6FFFE0]/10 border border-[#6FFFE0]/40 flex items-center justify-center text-[#6FFFE0] mb-4">
              <Eye className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-0.5 rounded bg-[#6FFFE0]/15 text-[#6FFFE0] border border-[#6FFFE0]/30 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              SHADOW DM // VIEW-ONCE SNAP
            </div>

            <h3 className="text-lg font-semibold text-[#F0EEFF] mb-2">
              Encrypted Self-Destructing Message
            </h3>

            <p className="text-xs text-[#F0EEFF]/70 mb-6 font-mono leading-relaxed">
              From @{message.senderHandle} · Once tapped, this message will be permanently decrypted for 15 seconds, then irreversibly purged from all nodes.
            </p>

            <div className="w-full space-y-2.5">
              <button
                onClick={handleReveal}
                className="w-full py-3 rounded-xl bg-[#6FFFE0] text-[#0A0912] font-semibold text-sm transition-transform active:scale-95 shadow-md font-mono"
              >
                Tap to Reveal Message
              </button>

              <button
                onClick={() => onCloseAndBurn(message.id)}
                className="w-full py-2.5 rounded-xl border border-[rgba(255,255,255,0.12)] text-[#F0EEFF]/60 hover:text-white hover:bg-white/5 text-xs font-mono"
              >
                Decline & Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#FF5C7A]">
                <Flame className="w-4 h-4 animate-bounce" />
                <span>BURNING IN {secondsRemaining}s</span>
              </div>

              <button
                onClick={handleManualBurn}
                className="text-[#F0EEFF]/50 hover:text-white p-1"
                aria-label="Close and burn now"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full p-4 rounded-xl bg-[#191630] border border-[rgba(255,255,255,0.12)] text-left mb-6">
              <div className="text-[11px] font-mono text-[#F0EEFF]/40 mb-2">
                ORIGIN: @{message.senderHandle} · {message.createdAt}
              </div>
              <p className="text-sm font-mono text-[#F0EEFF] leading-relaxed select-none">
                {message.content}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-[#FFB27A] mb-4">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Screenshots prohibited. In-memory state only.</span>
            </div>

            <button
              onClick={handleManualBurn}
              className="w-full py-2.5 rounded-xl bg-[#FF5C7A] text-white font-mono text-xs font-semibold transition-transform active:scale-95"
            >
              Burn & Erase Now
            </button>
          </>
        )}
      </div>
    </div>
  );
};
