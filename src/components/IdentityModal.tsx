import React, { useState } from 'react';
import { UserProfile, University } from '../types';
import { AVATAR_STICKER_LIBRARY } from '../data/avatarLibrary';
import { X, Key, ShieldCheck, RefreshCw, QrCode, Copy, Check, Eye, EyeOff, Sparkles, User } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  user: UserProfile;
  universities: University[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

const RANDOM_ADJECTIVES = ['Glitch', 'Phantom', 'Null', 'Vector', 'Cyber', 'Stealth', 'Hyper', 'Neon', 'Echo', 'Async'];
const RANDOM_NOUNS = ['Panda', 'Raven', 'Architect', 'Nomad', 'Ninja', 'Daemon', 'Falcon', 'Kernel', 'Cipher', 'Vibe'];

export const IdentityModal: React.FC<Props> = ({ user, universities, isOpen, onClose, onUpdateUser }) => {
  const [showSeedWords, setShowSeedWords] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [personalNameInput, setPersonalNameInput] = useState(user.publicName || 'Shadow Walker');

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

  const handleSaveName = () => {
    onUpdateUser({ publicName: personalNameInput.trim() || 'Anonymous Student' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0E1320] border border-[rgba(255,255,255,0.14)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#131929]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#6FFFE0]/15 text-[#6FFFE0] border border-[#6FFFE0]/30 shadow-sm">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F0EEFF]">Anonymous Device Identity & Sticker Avatar</h2>
              <p className="text-xs text-[#F0EEFF]/60 font-mono">Zero-Knowledge Keystore · Anime/Chibi Avatar Library</p>
            </div>
          </div>

          <button
            onClick={() => {
              playHapticSound('click');
              handleSaveName();
              onClose();
            }}
            className="p-1.5 rounded-xl text-[#F0EEFF]/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Preferred Personal Username & Handle */}
          <div className="p-4 rounded-2xl bg-[#090D17] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-[#6FFFE0] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Preferred Personal Name & Anon Handle</span>
              </label>
              <button
                type="button"
                onClick={handleRegenerateHandle}
                className="inline-flex items-center gap-1 text-[11px] text-[#FF6FD8] hover:underline font-mono"
              >
                <RefreshCw className="w-3 h-3" />
                Randomize
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-[#F0EEFF]/50 block mb-1">Personal Display Name</label>
                <input
                  type="text"
                  value={personalNameInput}
                  onChange={(e) => setPersonalNameInput(e.target.value)}
                  onBlur={handleSaveName}
                  placeholder="e.g. Jeremy K., ShadowWalker"
                  className="w-full px-3 py-2 rounded-xl bg-[#0E1320] border border-white/10 text-xs font-mono text-white outline-none focus:border-[#6FFFE0]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#F0EEFF]/50 block mb-1">Decentralized Anon Tag</label>
                <div className="px-3 py-2 rounded-xl bg-[#0E1320] border border-[#6FFFE0]/30 text-xs font-mono text-[#6FFFE0] flex items-center justify-between">
                  <span>@{user.anonHandle}</span>
                  <span className="text-[9px] text-[#F0EEFF]/40">Ed25519</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Chibi/Anime Sticker Avatar Library */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#F0EEFF] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB27A]" />
                <span>Avatar Sticker Pack (Anime/Chibi Pack)</span>
              </label>
              <span className="text-[10px] font-mono text-[#F0EEFF]/40">
                {AVATAR_STICKER_LIBRARY.length} Collectibles
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVATAR_STICKER_LIBRARY.map((st) => {
                const isSelected = user.avatarStyle === st.id;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      playHapticSound('pop');
                      onUpdateUser({ avatarStyle: st.id });
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between space-y-1.5 ${
                      isSelected
                        ? `bg-white/15 ${st.borderColor} border-2 shadow-lg scale-105`
                        : 'bg-[#090D17] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner bg-black/20">
                      {st.emoji}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-[#F0EEFF] leading-tight">
                        {st.name}
                      </div>
                      <div className="text-[9px] font-mono text-[#F0EEFF]/50 line-clamp-1 mt-0.5">
                        {st.tagline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. University Affiliation */}
          <div>
            <label className="block text-xs font-bold text-[#F0EEFF] mb-1.5 font-mono uppercase tracking-wider">
              Affiliated University Campus
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
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#090D17] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] text-xs focus:border-[#6FFFE0] outline-none font-mono"
            >
              {universities.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#0E1320] text-[#F0EEFF]">
                  {u.name} ({u.shortCode})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Public Display Toggle */}
          <div className="p-4 rounded-2xl bg-[#090D17] border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#F0EEFF] font-mono">Display Personal Name</div>
              <p className="text-[11px] text-[#F0EEFF]/60 font-mono mt-0.5">
                {user.isProfilePublic ? `Showing "${personalNameInput}" on campus boards` : '100% Zero-Knowledge Anonymous'}
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

          {/* 5. Cryptographic Device Keypair & 12-Word Recovery Vault */}
          <div className="p-4 rounded-2xl bg-[#090D17] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F0EEFF]">
                <ShieldCheck className="w-4 h-4 text-[#6FFFE0]" />
                <span>Device Keypair Hash (Ed25519)</span>
              </div>
              <span className="text-[10px] font-mono text-[#6FFFE0] bg-[#6FFFE0]/10 px-2 py-0.5 rounded-full font-bold">
                ENCRYPTED
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#05080E] font-mono text-[11px] text-[#F0EEFF]/70 truncate border border-white/5">
              {user.deviceKeypairHash}
            </div>

            {/* 12-Word Seed */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-[#F0EEFF]/80">12-Word Seed Recovery Phrase</span>
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
                <div className="p-3 rounded-2xl bg-[#05080E] border border-white/10 space-y-2.5">
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                    {user.recoveryWords.map((word, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-center">
                        <span className="text-[#F0EEFF]/40 text-[10px] mr-1">{idx + 1}.</span>
                        <span className="text-[#6FFFE0] font-bold">{word}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleCopyPhrase}
                    className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-[#F0EEFF] flex items-center justify-center gap-1.5"
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
                <div className="mt-3 p-4 rounded-2xl bg-white text-black flex flex-col items-center justify-center text-center">
                  <div className="w-28 h-28 border-4 border-black p-2 flex items-center justify-center font-mono text-[10px] font-bold leading-none break-all">
                    [QUADANON_SEED_TOKEN_QR]
                  </div>
                  <div className="text-[10px] font-mono text-neutral-800 mt-2">
                    Scan with second device to export credentials
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#131929] border-t border-[rgba(255,255,255,0.08)] flex justify-end">
          <button
            onClick={() => {
              playHapticSound('click');
              handleSaveName();
              onClose();
            }}
            className="px-6 py-2 rounded-full bg-[#FF6FD8] text-[#0A0912] font-bold text-xs font-mono transition-transform active:scale-95 shadow-md shadow-[#FF6FD8]/20"
          >
            Save Profile & Return
          </button>
        </div>
      </div>
    </div>
  );
};
