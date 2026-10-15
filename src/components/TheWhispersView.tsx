import React, { useState } from 'react';
import { WhisperReel, University } from '../types';
import { CountdownChip } from './CountdownChip';
import { ReactionPillGroup } from './ReactionPillGroup';
import {
  Sparkles,
  Plus,
  Eye,
  Lock,
  Volume2,
  VolumeX,
  MessageCircle,
  Share2,
  Clock,
  Flame,
  Check,
  Send,
  X,
  Film,
} from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  whispers: WhisperReel[];
  currentUniversity: University;
  onToggleReaction: (whisperId: string, key: 'fire' | 'skull' | 'cap' | 'clown' | 'fax') => void;
  onUnlockGatedWhisper: (whisperId: string) => void;
  onAddComment: (whisperId: string, content: string) => void;
  onOpenCreateWhisper: () => void;
}

export const TheWhispersView: React.FC<Props> = ({
  whispers,
  currentUniversity,
  onToggleReaction,
  onUnlockGatedWhisper,
  onAddComment,
  onOpenCreateWhisper,
}) => {
  const [scope, setScope] = useState<'campus' | 'all'>('all');
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({});
  const [activeCommentDrawerId, setActiveCommentDrawerId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Chronological sort: newest upload timestamps first
  const sortedWhispers = [...whispers]
    .filter((w) => {
      if (scope === 'campus' && w.universityId !== currentUniversity.id) {
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleShare = (id: string) => {
    navigator.clipboard.writeText(`https://quadanon.campus/whispers/${id}`);
    setCopiedId(id);
    playHapticSound('click');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCommentSubmit = (whisperId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    playHapticSound('send');
    onAddComment(whisperId, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Whispers Stream Header & Scope Controls */}
      <div className="p-4 rounded-3xl bg-[#0D121E]/90 border border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFB27A]/10 border border-[#FFB27A]/30 flex items-center justify-center text-[#FFB27A]">
            <Film className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#F0EEFF]">Whispers Media Timeline</h2>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FFB27A]/15 text-[#FFB27A] border border-[#FFB27A]/30">
                CHRONOLOGICAL REELS
              </span>
            </div>
            <p className="text-xs text-[#F0EEFF]/60 font-mono">
              Ephemeral video & photo drops · Strictly ordered by sender upload time
            </p>
          </div>
        </div>

        {/* Scope Pill Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-[#070A10] border border-white/10 shrink-0">
          <button
            onClick={() => {
              playHapticSound('click');
              setScope('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
              scope === 'all'
                ? 'bg-[#FFB27A] text-[#070A10] font-bold shadow-md'
                : 'text-[#F0EEFF]/60 hover:text-white'
            }`}
          >
            All Campuses
          </button>
          <button
            onClick={() => {
              playHapticSound('click');
              setScope('campus');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
              scope === 'campus'
                ? 'bg-[#FFB27A] text-[#070A10] font-bold shadow-md'
                : 'text-[#F0EEFF]/60 hover:text-white'
            }`}
          >
            {currentUniversity.shortCode} Only
          </button>
        </div>
      </div>

      {/* Chronological Stream */}
      {sortedWhispers.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#0D121E]/60 border border-[rgba(255,255,255,0.08)] space-y-3">
          <div className="text-sm font-mono text-[#F0EEFF]/60">
            No active media whispers found in this scope.
          </div>
          <p className="text-xs text-[#F0EEFF]/40 max-w-sm mx-auto">
            Drop the first anonymous campus snap or video clip before finals start!
          </p>
          <button
            onClick={() => {
              playHapticSound('pop');
              onOpenCreateWhisper();
            }}
            className="px-5 py-2.5 rounded-full bg-[#FFB27A] text-[#070A10] font-bold text-xs font-mono shadow-lg hover:scale-105 transition-all"
          >
            Drop a Whisper
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedWhispers.map((whisper) => {
            const isMuted = mutedStates[whisper.id] ?? true;
            const isLocked = whisper.isViewGated && !whisper.isUnlocked;

            return (
              <div
                key={whisper.id}
                className="rounded-3xl bg-[#0D121E] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.18)] transition-all overflow-hidden shadow-2xl flex flex-col"
              >
                {/* Reel Top Bar */}
                <div className="px-5 py-3.5 bg-[#090D17] border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#151D2E] border border-[#FFB27A]/50 flex items-center justify-center text-xs font-mono text-[#FFB27A]">
                      Anon
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#F0EEFF]">
                          @{whisper.authorHandle}
                        </span>
                        <span className="text-xs text-[#F0EEFF]/30">·</span>
                        <span className="font-mono text-xs text-[#F0EEFF]/60">
                          {whisper.universityName}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#F0EEFF]/40">
                        Uploaded {new Date(whisper.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CountdownChip expiresAt={whisper.expiresAt} mode={whisper.ephemeralMode} />
                  </div>
                </div>

                {/* Media Container / TikTok Reel Frame */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#05070B] overflow-hidden flex items-center justify-center">
                  {isLocked ? (
                    // Ephemeral Blur Gate
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/80 backdrop-blur-2xl space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#FFB27A]/15 border border-[#FFB27A]/40 flex items-center justify-center text-[#FFB27A]">
                        <Lock className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-[#F0EEFF]">
                        View-Gated Confidential Whisper
                      </h4>
                      <p className="text-xs font-mono text-[#F0EEFF]/60 max-w-sm">
                        This reel is encrypted. Tapping unlock decrypts the media and triggers the self-destruct countdown timer.
                      </p>
                      <button
                        onClick={() => {
                          playHapticSound('snap');
                          onUnlockGatedWhisper(whisper.id);
                        }}
                        className="px-6 py-2.5 rounded-full bg-[#FFB27A] text-[#070A10] font-bold text-xs font-mono transition-transform active:scale-95 shadow-lg shadow-[#FFB27A]/20"
                      >
                        Tap to Unlock & View
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Media Image / Video Preview */}
                      <img
                        src={whisper.mediaUrl}
                        alt={whisper.caption}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />

                      {/* Ambient Gradient Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070A10] via-transparent to-black/30 pointer-events-none" />

                      {/* Audio / Volume Toggle */}
                      <button
                        onClick={() => {
                          playHapticSound('click');
                          setMutedStates((prev) => ({
                            ...prev,
                            [whisper.id]: !isMuted,
                          }));
                        }}
                        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all"
                        aria-label="Toggle audio"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-[#FF5C7A]" /> : <Volume2 className="w-4 h-4 text-[#6FFFE0]" />}
                      </button>

                      {/* Views Count Pill */}
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-[#F0EEFF]">
                        <Eye className="w-3.5 h-3.5 text-[#5EEAD4]" />
                        <span>{whisper.viewsCount} views</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Caption & Metadata Section */}
                <div className="p-5 space-y-3 bg-[#0D121E]">
                  <p className="text-sm text-[#F0EEFF] leading-relaxed">
                    {whisper.caption}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {whisper.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[11px] text-[#FFB27A] px-2 py-0.5 rounded-md bg-[#FFB27A]/10 border border-[#FFB27A]/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer Interaction Bar */}
                  <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between gap-3">
                    <ReactionPillGroup
                      reactions={whisper.reactions}
                      userReactions={whisper.userReactions}
                      onToggleReaction={(key) => onToggleReaction(whisper.id, key)}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          playHapticSound('click');
                          setActiveCommentDrawerId(
                            activeCommentDrawerId === whisper.id ? null : whisper.id
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-[#F0EEFF]/70 hover:text-white transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#FF6FD8]" />
                        <span>{whisper.commentsCount} replies</span>
                      </button>

                      <button
                        onClick={() => handleShare(whisper.id)}
                        className="p-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#F0EEFF]/60 hover:text-white transition-colors"
                        title="Share whisper link"
                      >
                        {copiedId === whisper.id ? (
                          <Check className="w-4 h-4 text-[#6FFFE0]" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Inline Comments Drawer */}
                  {activeCommentDrawerId === whisper.id && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-[#F0EEFF]/70">
                        <span>Anonymous Thread Discussion</span>
                        <button
                          onClick={() => setActiveCommentDrawerId(null)}
                          className="text-[#F0EEFF]/40 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {whisper.comments.length === 0 ? (
                          <div className="text-xs font-mono text-[#F0EEFF]/40 py-2">
                            No whispers yet. Drop the first reaction!
                          </div>
                        ) : (
                          whisper.comments.map((c) => (
                            <div
                              key={c.id}
                              className="p-2.5 rounded-xl bg-[#090D17] border border-white/5 text-xs font-mono space-y-1"
                            >
                              <div className="flex items-center justify-between text-[10px] text-[#6FFFE0]">
                                <span>@{c.authorHandle}</span>
                                <span className="text-[#F0EEFF]/40">{c.createdAt}</span>
                              </div>
                              <p className="text-[#F0EEFF]/90 font-sans">{c.content}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <form
                        onSubmit={(e) => handleCommentSubmit(whisper.id, e)}
                        className="flex items-center gap-2 pt-1"
                      >
                        <input
                          type="text"
                          placeholder="Reply anonymously to this whisper..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-[#070A10] border border-white/10 text-xs font-mono text-[#F0EEFF] focus:border-[#FFB27A] outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!commentInput.trim()}
                          className="p-2 rounded-xl bg-[#FFB27A] text-[#070A10] font-bold transition-transform active:scale-95 disabled:opacity-40"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <div className="sticky bottom-20 flex justify-end">
        <button
          onClick={() => {
            playHapticSound('pop');
            onOpenCreateWhisper();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#FFB27A] text-[#070A10] font-bold text-xs font-mono shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Drop Whisper Reel</span>
        </button>
      </div>
    </div>
  );
};
