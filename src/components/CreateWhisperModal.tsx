import React, { useState } from 'react';
import { WhisperReel, EphemeralDuration } from '../types';
import { X, Film, Image as ImageIcon, Lock, Clock, Send, Sparkles } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitWhisper: (whisper: Omit<WhisperReel, 'id' | 'createdAt' | 'viewsCount' | 'isUnlocked' | 'reactions' | 'userReactions' | 'commentsCount' | 'comments'>) => void;
  currentUniversityId: number;
  currentUniversityName: string;
  authorHandle: string;
  authorAvatar: string;
}

const SAMPLE_MEDIA_PRESETS = [
  {
    name: 'Campus Library Night',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
    tag: 'LibrarySession',
  },
  {
    name: 'Engineering Tech Lab',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    tag: 'CircuitLab',
  },
  {
    name: 'Student Center Courtyard',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    tag: 'CampusWalk',
  },
  {
    name: 'Lecture Hall Blackout',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    tag: 'MidtermsGrind',
  },
];

const LIFESPANS: { id: EphemeralDuration; label: string; ms: number }[] = [
  { id: 'snap', label: 'Snap (1-view)', ms: 60000 },
  { id: '1h', label: '1 Hour', ms: 3600000 },
  { id: '24h', label: '24 Hours', ms: 86400000 },
  { id: '3d', label: '3 Days', ms: 86400000 * 3 },
  { id: '1w', label: '1 Week', ms: 86400000 * 7 },
];

export const CreateWhisperModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmitWhisper,
  currentUniversityId,
  currentUniversityName,
  authorHandle,
  authorAvatar,
}) => {
  const [caption, setCaption] = useState('');
  const [selectedMediaUrl, setSelectedMediaUrl] = useState(SAMPLE_MEDIA_PRESETS[0].url);
  const [tagsInput, setTagsInput] = useState('CampusMoments, FinalsWeek');
  const [lifespan, setLifespan] = useState<EphemeralDuration>('24h');
  const [isViewGated, setIsViewGated] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    // Requirement: Play subtle customized hissing/whisper sound effect on post
    playHapticSound('whisper');

    const lifespanObj = LIFESPANS.find((l) => l.id === lifespan) || LIFESPANS[2];
    const expiresAt = new Date(Date.now() + lifespanObj.ms).toISOString();

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onSubmitWhisper({
      authorId: `usr_${Date.now()}`,
      authorHandle,
      authorAvatar,
      universityId: currentUniversityId,
      universityName: currentUniversityName,
      caption: caption.trim(),
      mediaUrl: selectedMediaUrl,
      mediaType: 'image',
      tags: tags.length ? tags : ['QuadWhisper'],
      ephemeralMode: lifespan,
      expiresAt,
      isViewGated,
    });

    setCaption('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#090C14] border border-[rgba(255,255,255,0.12)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#0E121D]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#FFB27A]/15 text-[#FFB27A] border border-[#FFB27A]/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F0EEFF]">Drop a Whisper Reel</h2>
              <p className="text-xs text-[#F0EEFF]/60 font-mono">
                Posting as @{authorHandle} · {currentUniversityName}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playHapticSound('click');
              onClose();
            }}
            className="p-1 rounded-lg text-[#F0EEFF]/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Caption */}
          <div>
            <label className="text-xs font-mono font-semibold text-[#F0EEFF] block mb-1">
              Reel Caption *
            </label>
            <textarea
              required
              rows={3}
              placeholder="What did you capture on campus? Describe the moment..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-[#0E1320] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] text-xs font-mono focus:border-[#FFB27A] outline-none resize-none"
            />
          </div>

          {/* Media Presets */}
          <div>
            <label className="text-xs font-mono font-semibold text-[#FFB27A] block mb-2">
              Select Campus Reel Snapshot / Video
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_MEDIA_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    playHapticSound('click');
                    setSelectedMediaUrl(preset.url);
                  }}
                  className={`p-2 rounded-2xl border text-left flex items-center gap-2 transition-all overflow-hidden ${
                    selectedMediaUrl === preset.url
                      ? 'border-[#FFB27A] bg-[#FFB27A]/15 text-white shadow-md'
                      : 'border-white/5 bg-[#0E1320] text-[#F0EEFF]/60 hover:border-white/20'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-semibold truncate">{preset.name}</div>
                    <div className="text-[10px] text-[#FFB27A] font-mono">#{preset.tag}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-mono text-[#F0EEFF]/70 block mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0E1320] border border-white/10 text-xs font-mono text-[#B794F6] focus:border-[#B794F6] outline-none"
            />
          </div>

          {/* Lifespan Selector */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-mono text-[#F0EEFF]">
              <Clock className="w-3.5 h-3.5 text-[#5EEAD4]" />
              <span className="font-semibold uppercase tracking-wider">Self-Destruct TTL</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {LIFESPANS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    playHapticSound('click');
                    setLifespan(l.id);
                  }}
                  className={`py-2 px-1 rounded-xl border text-center transition-all font-mono text-xs ${
                    lifespan === l.id
                      ? 'bg-[#FFB27A] text-[#070A10] font-bold border-[#FFB27A]'
                      : 'bg-[#0E1320] border-white/10 text-[#F0EEFF]/70 hover:border-white/20'
                  }`}
                >
                  <div className="text-[11px]">{l.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* View-Gated Switch */}
          <div className="p-3.5 rounded-2xl bg-[#0E1320] border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#F0EEFF] font-mono flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#FFB27A]" />
                <span>View-Gated Confidential Whisper</span>
              </div>
              <p className="text-[11px] text-[#F0EEFF]/50 font-mono mt-0.5">
                Blurs media until tapped. Burns after viewer leaves.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                setIsViewGated(!isViewGated);
              }}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                isViewGated ? 'bg-[#FFB27A]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isViewGated ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-mono text-[#F0EEFF]/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#FFB27A] text-[#070A10] font-bold text-xs font-mono transition-transform active:scale-95 shadow-lg shadow-[#FFB27A]/20"
            >
              Broadcast Whisper Reel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
