import React, { useState } from 'react';
import { UserProfile, University } from '../types';
import { X, Key, ShieldCheck, RefreshCw, QrCode, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  user: UserProfile;
  universities: University[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

const AVATAR_OPTIONS = [
  { id: 'shadow_mint', name: 'Cyber Mint', ring: 'border-[#6FFFE0]', dot: 'bg-[#6FFFE0]' },
  { id: 'shadow_bubblegum', name: 'Bubblegum', ring: 'border-[#FF6FD8]', dot: 'bg-[#FF6FD8]' },
  { id: 'shadow_peach', name: 'Peach Glow', ring: 'border-[#FFB27A]', dot: 'bg-[#FFB27A]' },
  { id: 'shadow_lavender', name: 'Lavender Haze', ring: 'border-[#B794F6]', dot: 'bg-[#B794F6]' },
  { id: 'shadow_lemon', name: 'Electric Lemon', ring: 'border-[#FFE66D]', dot: 'bg-[#FFE66D]' },
  { id: 'shadow_cyan', name: 'Plasma Cyan', ring: 'border-[#5EEAD4]', dot: 'bg-[#5EEAD4]' },
];

const RANDOM_ADJECTIVES = ['Glitch', 'Phantom', 'Null', 'Vector', 'Cyber', 'Stealth', 'Hyper', 'Neon', 'Echo', 'Async'];
const RANDOM_NOUNS = ['Panda', 'Raven', 'Architect', 'Nomad', 'Ninja', 'Daemon', 'Falcon', 'Kernel', 'Cipher', 'Vibe'];

export const IdentityModal: React.FC<Props> = ({ user, universities, isOpen, onClose, onUpdateUser }) => {
  const [showSeedWords, setShowSeedWords] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleRegenerateHandle = () => {
    playHapticSound('pop');
    const adj = RANDOM_ADJECTIVES[Math.floor(Math.random() * RANDOM_ADJECTIVES.length)];
    const noun = RANDOM_NOUNS[Math.floor(Math.random() * RANDOM_NOUNS.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const newHandle = `${adj}${noun}_${num}`;
    onUpdateUser({ anonHandle: newHandle });
  };

  const handleCopyPhrase = () => {
    playHapticSound('click');
    navigator.clipboard.writeText(user.recoveryWords.join(' '));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0F0D1E] border border-[rgba(255,255,255,0.14)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#141226]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#6FFFE0]/10 text-[#6FFFE0] border border-[#6FFFE0]/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F0EEFF]">Anonymous Device Identity</h2>
              <p className="text-xs text-[#F0EEFF]/60 font-mono">Zero-Knowledge Keystore · Zero Real-World Identity</p>
            </div>
          </div>

          <button
            onClick={() => {
              playHapticSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#F0EEFF]/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* University Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#F0EEFF] mb-2 font-mono uppercase tracking-wider">
              1. Affiliated University
            </label>
            <select
              value={user.universityId}
              onChange={(e) => {
                const uId = Number(e.target.value);
                const selectedUni = universities.find((u) => u.id === uId);
                if (selectedUni) {
                  onUpdateUser({
                    universityId: selectedUni.id,
                    universityName: selectedUni.name,
                  });
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#16142A] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] text-sm focus:border-[#6FFFE0] outline-none font-mono"
            >
              {universities.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#121020] text-[#F0EEFF]">
                  {u.name} ({u.shortCode})
                </option>
              ))}
            </select>
          </div>

          {/* Anonymous Handle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#F0EEFF] font-mono uppercase tracking-wider">
                2. Ephemeral Handle
              </label>
              <button
                type="button"
                onClick={handleRegenerateHandle}
                className="inline-flex items-center gap-1.5 text-xs text-[#6FFFE0] hover:underline font-mono"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Randomize Handle
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#16142A] border border-[rgba(255,255,255,0.12)] font-mono text-sm text-[#6FFFE0] flex items-center justify-between">
                <span>@{user.anonHandle}</span>
                <span className="text-xs text-[#F0EEFF]/50">{user.universityName.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Shadow Avatar Style */}
          <div>
            <label className="block text-xs font-semibold text-[#F0EEFF] mb-2 font-mono uppercase tracking-wider">
              3. Shadow Avatar Ring
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    playHapticSound('click');
                    onUpdateUser({ avatarStyle: av.id });
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-mono transition-all ${
                    user.avatarStyle === av.id
                      ? `bg-white/10 ${av.ring} text-[#F0EEFF]`
                      : 'bg-[#141224] border-[rgba(255,255,255,0.08)] text-[#F0EEFF]/60 hover:border-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 ${av.ring} flex items-center justify-center`}>
                    <div className={`w-2 h-2 rounded-full ${av.dot}`} />
                  </div>
                  <span className="truncate">{av.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Public Profile Disclosure Switch */}
          <div className="p-4 rounded-xl bg-[#141226] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#F0EEFF] font-mono">Public Display Name</div>
              <p className="text-[11px] text-[#F0EEFF]/60 font-mono mt-0.5">
                {user.isProfilePublic ? 'Displaying public alias alongside anon handle' : 'Default: 100% Zero-Knowledge Anonymous'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                onUpdateUser({ isProfilePublic: !user.isProfilePublic });
              }}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                user.isProfilePublic ? 'bg-[#FF6FD8]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  user.isProfilePublic ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Cryptographic Device Keypair & 12-Word Recovery */}
          <div className="p-4 rounded-xl bg-[#141226] border border-[rgba(255,255,255,0.08)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F0EEFF]">
                <ShieldCheck className="w-4 h-4 text-[#6FFFE0]" />
                <span>Device Keypair Hash (Ed25519)</span>
              </div>
              <span className="text-[10px] font-mono text-[#6FFFE0] bg-[#6FFFE0]/10 px-2 py-0.5 rounded">
                SECURE
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0C0B18] font-mono text-[11px] text-[#F0EEFF]/70 truncate border border-white/5">
              {user.deviceKeypairHash}
            </div>

            {/* 12-Word Recovery Vault */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-medium text-[#F0EEFF]/80">12-Word Recovery Phrase</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSeedWords(!showSeedWords)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#B794F6] hover:underline"
                  >
                    {showSeedWords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showSeedWords ? 'Hide' : 'Reveal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#5EEAD4] hover:underline"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Export
                  </button>
                </div>
              </div>

              {showSeedWords ? (
                <div className="p-3 rounded-xl bg-[#0B0A16] border border-white/10">
                  <div className="grid grid-cols-3 gap-1.5 mb-3 font-mono text-xs">
                    {user.recoveryWords.map((word, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-white/5 border border-white/5 text-center">
                        <span className="text-[#F0EEFF]/40 text-[10px] mr-1">{idx + 1}.</span>
                        <span className="text-[#6FFFE0]">{word}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleCopyPhrase}
                    className="w-full py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs font-mono text-[#F0EEFF] flex items-center justify-center gap-1.5"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-[#6FFFE0]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Phrase Copied to Clipboard' : 'Copy 12-Word Phrase'}</span>
                  </button>
                </div>
              ) : (
                <p className="text-[11px] font-mono text-[#F0EEFF]/40 italic">
                  Tap "Reveal" to view and backup your 12-word cryptographic recovery phrase.
                </p>
              )}

              {showQr && (
                <div className="mt-3 p-4 rounded-xl bg-white text-black flex flex-col items-center justify-center text-center">
                  <div className="w-32 h-32 border-4 border-black p-2 flex items-center justify-center font-mono text-xs font-bold leading-none break-all">
                    [QR ENCRYPTED RECOVERY TOKEN // QUADANON]
                  </div>
                  <div className="text-[10px] font-mono text-neutral-800 mt-2">
                    Scan with any secondary browser device to link credentials
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#141226] border-t border-[rgba(255,255,255,0.08)] flex justify-end">
          <button
            onClick={() => {
              playHapticSound('click');
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#FF6FD8] text-[#0A0912] font-semibold text-xs font-mono transition-transform active:scale-95"
          >
            Save & Return
          </button>
        </div>
      </div>
    </div>
  );
};
