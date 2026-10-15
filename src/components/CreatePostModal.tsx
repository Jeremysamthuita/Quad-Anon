import React, { useState } from 'react';
import { EphemeralDuration, Post } from '../types';
import { X, Clock, Code2, BarChart2, MessageSquare, Send, Sparkles } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (post: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'userReactions' | 'commentsCount' | 'comments'>) => void;
  currentUniversityId: number;
  currentUniversityName: string;
  authorHandle: string;
  authorAvatar: string;
}

const LIFESPANS: { id: EphemeralDuration; label: string; desc: string; ms: number }[] = [
  { id: 'snap', label: 'Snap', desc: 'Self-destructs after single read', ms: 1000 * 60 },
  { id: '1h', label: '1 Hour', desc: 'Fast drop, burns in 60 min', ms: 1000 * 3600 },
  { id: '24h', label: '24 Hours', desc: 'Daily campus rhythm', ms: 1000 * 3600 * 24 },
  { id: '3d', label: '3 Days', desc: 'Mid-term discussion window', ms: 1000 * 3600 * 72 },
  { id: '1w', label: '1 Week', desc: 'Default maximum retention', ms: 1000 * 3600 * 168 },
];

export const CreatePostModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmitPost,
  currentUniversityId,
  currentUniversityName,
  authorHandle,
  authorAvatar,
}) => {
  const [content, setContent] = useState('');
  const [lifespan, setLifespan] = useState<EphemeralDuration>('1w');
  const [postType, setPostType] = useState<'text' | 'poll' | 'code'>('text');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    playHapticSound('send');

    const selectedLifespan = LIFESPANS.find((l) => l.id === lifespan) || LIFESPANS[4];
    const expiresAt = new Date(Date.now() + selectedLifespan.ms).toISOString();

    const postPayload: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'userReactions' | 'commentsCount' | 'comments'> = {
      authorId: `usr_${Date.now()}`,
      authorHandle,
      authorAvatar,
      universityId: currentUniversityId,
      universityName: currentUniversityName,
      contentText: content.trim(),
      ephemeralMode: lifespan,
      expiresAt,
    };

    if (postType === 'code' && codeSnippet.trim()) {
      postPayload.mediaType = 'code';
      postPayload.mediaUrl = codeSnippet.trim();
    } else if (postType === 'poll' && pollOptions.filter((o) => o.trim()).length >= 2) {
      postPayload.mediaType = 'poll';
      postPayload.pollOptions = pollOptions.filter((o) => o.trim()).map((o) => ({ label: o.trim(), votes: 0 }));
    }

    onSubmitPost(postPayload);
    setContent('');
    setCodeSnippet('');
    setPollOptions(['', '']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F0D1E] border border-[rgba(255,255,255,0.14)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#141226]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6FD8]" />
            <h2 className="text-base font-semibold text-[#F0EEFF]">Broadcast to The Quad</h2>
            <span className="text-xs font-mono text-[#F0EEFF]/50">(@{authorHandle})</span>
          </div>

          <button
            onClick={() => {
              playHapticSound('click');
              onClose();
            }}
            className="p-1 rounded text-[#F0EEFF]/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Post Type Selector */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                setPostType('text');
              }}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                postType === 'text'
                  ? 'bg-white/10 text-white border-white/30'
                  : 'bg-transparent text-[#F0EEFF]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Standard Whisper
            </button>

            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                setPostType('poll');
              }}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                postType === 'poll'
                  ? 'bg-white/10 text-[#FF6FD8] border-[#FF6FD8]'
                  : 'bg-transparent text-[#F0EEFF]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Campus Poll
            </button>

            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                setPostType('code');
              }}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                postType === 'code'
                  ? 'bg-white/10 text-[#6FFFE0] border-[#6FFFE0]'
                  : 'bg-transparent text-[#F0EEFF]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Code Block
            </button>
          </div>

          {/* Main Content Area */}
          <div>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening on campus? Spilling tea, asking for exam leaks, or dropping wisdom..."
              className="w-full p-3.5 rounded-xl bg-[#151328] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] placeholder-[#F0EEFF]/35 text-sm outline-none focus:border-[#FF6FD8] resize-none"
            />
            <div className="flex justify-between items-center text-[11px] font-mono text-[#F0EEFF]/40 mt-1">
              <span>Zero-knowledge: No IP logs attached</span>
              <span>{content.length} chars</span>
            </div>
          </div>

          {/* Conditional: Poll Editor */}
          {postType === 'poll' && (
            <div className="space-y-2 p-3 rounded-xl bg-[#141224] border border-white/10">
              <span className="text-xs font-mono font-semibold text-[#FF6FD8] block">Poll Choices</span>
              {pollOptions.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const next = [...pollOptions];
                    next[i] = e.target.value;
                    setPollOptions(next);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0C0B18] border border-white/10 text-xs font-mono text-[#F0EEFF] focus:border-[#FF6FD8] outline-none"
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="text-[11px] font-mono text-[#6FFFE0] hover:underline"
                >
                  + Add another choice
                </button>
              )}
            </div>
          )}

          {/* Conditional: Code Snippet Editor */}
          {postType === 'code' && (
            <div>
              <label className="text-xs font-mono text-[#6FFFE0] block mb-1">Code Snippet (Mono)</label>
              <textarea
                rows={3}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="// Paste code or formula here&#10;def quicksort(arr):..."
                className="w-full p-2.5 rounded-xl bg-[#0B0A16] border border-white/10 text-xs font-mono text-[#6FFFE0] placeholder-emerald-900/50 outline-none focus:border-[#6FFFE0]"
              />
            </div>
          )}

          {/* Ghost Post Lifespan Selector */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-mono text-[#F0EEFF]">
              <Clock className="w-3.5 h-3.5 text-[#5EEAD4]" />
              <span className="font-semibold uppercase tracking-wider">Self-Destruct Lifespan</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {LIFESPANS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playHapticSound('click');
                    setLifespan(item.id);
                  }}
                  className={`py-2 px-1 rounded-lg border text-center transition-all font-mono text-xs ${
                    lifespan === item.id
                      ? 'bg-[#FF6FD8] text-[#0A0912] font-bold border-[#FF6FD8]'
                      : 'bg-[#151328] border-white/10 text-[#F0EEFF]/70 hover:border-white/20'
                  }`}
                  title={item.desc}
                >
                  <div className="text-[11px]">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#F0EEFF]/50 truncate max-w-[200px]">
              {currentUniversityName}
            </span>

            <div className="flex items-center gap-2">
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
                disabled={!content.trim()}
                className="px-5 py-2 rounded-xl bg-[#FF6FD8] text-[#0A0912] font-semibold text-xs font-mono flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Whisper</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
