import React, { useState } from 'react';
import { WhisperReel, ReactionType } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { formatRelativeTime, formatExpiresIn, generateId } from '../../lib/utils';
import { playHapticSound } from '../../utils/sound';
import {
  Film,
  Plus,
  Flame,
  Skull,
  GraduationCap,
  Sparkles,
  MessageCircle,
  Eye,
  Lock,
  Clock,
  Send,
  AlertTriangle,
} from 'lucide-react';

const REACTION_CONFIG: { type: ReactionType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { type: 'fire', label: 'Fire', icon: Flame, color: 'text-peach' },
  { type: 'skull', label: 'Skull', icon: Skull, color: 'text-text-secondary' },
  { type: 'cap', label: 'Cap', icon: GraduationCap, color: 'text-mint' },
  { type: 'clown', label: 'Clown', icon: Sparkles, color: 'text-lemon' },
  { type: 'fax', label: 'Spitting Fax', icon: Sparkles, color: 'text-lavender' },
];

export const WhispersFeed: React.FC = () => {
  const { profile, campus } = useAuth();
  const [whispers, setWhispers] = useState<WhisperReel[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<'snap' | '1h' | '24h' | '1w'>('24h');
  const [activeCommentsWhisperId, setActiveCommentsWhisperId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Handle single reaction constraint per user
  const handleToggleReaction = (whisperId: string, reactionType: ReactionType) => {
    playHapticSound('vote');
    setWhispers((prev) =>
      prev.map((w) => {
        if (w.id !== whisperId) return w;
        const current = w.userReaction;
        const nextReactions = { ...w.reactions };
        let nextUserReaction: ReactionType | null = null;

        if (current === reactionType) {
          // Unselect
          nextReactions[reactionType] = Math.max(0, (nextReactions[reactionType] || 1) - 1);
          nextUserReaction = null;
        } else {
          // Decrement previous if any
          if (current) {
            nextReactions[current] = Math.max(0, (nextReactions[current] || 1) - 1);
          }
          // Increment new
          nextReactions[reactionType] = (nextReactions[reactionType] || 0) + 1;
          nextUserReaction = reactionType;
        }

        return {
          ...w,
          reactions: nextReactions,
          userReaction: nextUserReaction,
        };
      })
    );
  };

  const handleCreateWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    playHapticSound('whisper');

    const durationMs = {
      snap: 60 * 1000,
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
    }[selectedDuration];

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newWhisper: WhisperReel = {
      id: generateId(),
      universityId: campus.id,
      universityName: campus.name,
      authorId: profile?.id || 'anon',
      authorHandle: profile?.handle || 'CampusStudent',
      authorAvatar: profile?.avatarStyle || 'phantom_ghostling',
      caption: caption.trim(),
      mediaUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      mediaType: 'image',
      tags: tags.length > 0 ? tags : ['campus'],
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
      createdAt: new Date().toISOString(),
      reactions: { fire: 1, skull: 0, cap: 0, clown: 0, fax: 0 },
      userReaction: 'fire',
      commentsCount: 0,
      viewsCount: 1,
    };

    setWhispers([newWhisper, ...whispers]);
    setCaption('');
    setTagInput('');
    setIsCreateOpen(false);
  };

  const handleAddComment = (whisperId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    playHapticSound('whisper');
    setWhispers((prev) =>
      prev.map((w) => {
        if (w.id !== whisperId) return w;
        return {
          ...w,
          commentsCount: w.commentsCount + 1,
        };
      })
    );
    setCommentText('');
    setActiveCommentsWhisperId(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header bar */}
      <div className="p-4 rounded-3xl water-glass-card flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-peach/15 text-peach flex items-center justify-center">
            <Film className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-bold font-mono text-text-primary">
              Whispers Media Timeline
            </h1>
            <p className="text-xs text-text-secondary font-mono">
              Short-lived media with captions · {campus.shortCode} Campus
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-peach text-neutral-900 font-mono text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New Whisper</span>
        </button>
      </div>

      {/* Feed list or empty state */}
      {whispers.length === 0 ? (
        <EmptyState
          icon={<Film className="w-6 h-6" aria-hidden="true" />}
          title="No active whispers on campus"
          description="Every whisper expires and deletes automatically after its timer. Post the first reel or photo to start the campus feed."
          actionLabel="Drop a Whisper"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {whispers.map((whisper) => (
            <article
              key={whisper.id}
              className="rounded-3xl water-glass-card overflow-hidden shadow-lg border border-border-glass"
            >
              {/* Card Header */}
              <div className="px-5 py-3 border-b border-border-glass bg-surface flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">
                    @{whisper.authorHandle}
                  </span>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-secondary">{formatRelativeTime(whisper.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 text-peach text-[11px]">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{formatExpiresIn(whisper.expiresAt)}</span>
                </div>
              </div>

              {/* Media image */}
              <div className="relative aspect-[16/10] bg-black/90 overflow-hidden flex items-center justify-center">
                <img
                  src={whisper.mediaUrl}
                  alt={whisper.caption}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content and reactions */}
              <div className="p-5 space-y-3">
                <p className="text-sm text-text-primary leading-relaxed">
                  {whisper.caption}
                </p>

                {whisper.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {whisper.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-mono text-peach px-2 py-0.5 rounded-md bg-peach/10"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reactions bar with strict 1-reaction rule and accessible labels */}
                <div className="pt-3 border-t border-border-glass flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {REACTION_CONFIG.map(({ type, label, icon: Icon, color }) => {
                      const isSelected = whisper.userReaction === type;
                      const count = whisper.reactions[type] || 0;

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleToggleReaction(whisper.id, type)}
                          aria-label={`${label} reaction (${count})`}
                          aria-pressed={isSelected}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono min-h-[36px] transition-all ${
                            isSelected
                              ? 'bg-white/20 border border-white/40 font-bold scale-105'
                              : 'bg-surface border border-border-glass text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${color}`} aria-hidden="true" />
                          <span>{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setActiveCommentsWhisperId(whisper.id)}
                    aria-label={`View ${whisper.commentsCount} replies`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-glass text-xs font-mono text-text-secondary hover:text-text-primary min-h-[36px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-bubblegum" aria-hidden="true" />
                    <span>{whisper.commentsCount}</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create Whisper Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Drop a Campus Whisper Reel"
        description="Share a short-lived photo or reel with an automatic expiration timer."
      >
        <form onSubmit={handleCreateWhisper} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-text-primary mb-1">
              Caption
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's happening right now on campus?"
              className="w-full p-3 rounded-2xl bg-canvas border border-border-glass text-text-primary text-xs font-mono outline-none focus:border-peach"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-text-primary mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Midterms, Courtyard, Engineering"
              className="w-full p-2.5 rounded-xl bg-canvas border border-border-glass text-text-primary text-xs font-mono outline-none focus:border-peach"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-text-primary mb-1">
              Server Expiration Timer
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'snap', label: '1 Min' },
                { id: '1h', label: '1 Hour' },
                { id: '24h', label: '24 Hours' },
                { id: '1w', label: '1 Week' },
              ].map((dur) => (
                <button
                  key={dur.id}
                  type="button"
                  onClick={() => setSelectedDuration(dur.id as any)}
                  className={`p-2 rounded-xl text-xs font-mono border min-h-[44px] transition-all ${
                    selectedDuration === dur.id
                      ? 'bg-peach text-neutral-900 border-peach font-bold'
                      : 'bg-canvas border-border-glass text-text-secondary'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted font-mono mt-1">
              This reel will be purged from the server when this duration lapses.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-text-secondary hover:text-text-primary min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!caption.trim()}
              className="px-5 py-2 rounded-full bg-peach text-neutral-900 font-mono text-xs font-bold disabled:opacity-40 min-h-[44px]"
            >
              Broadcast Whisper
            </button>
          </div>
        </form>
      </Modal>

      {/* Comments Modal */}
      <Modal
        isOpen={!!activeCommentsWhisperId}
        onClose={() => setActiveCommentsWhisperId(null)}
        title="Whisper Discussion"
        description="Pseudonymous replies to this campus reel."
      >
        <form onSubmit={(e) => activeCommentsWhisperId && handleAddComment(activeCommentsWhisperId, e)} className="space-y-3">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Reply pseudonymously..."
            className="w-full p-3 rounded-xl bg-canvas border border-border-glass text-text-primary text-xs font-mono outline-none focus:border-peach"
          />
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-2 rounded-full bg-peach text-neutral-900 font-mono text-xs font-bold disabled:opacity-40 min-h-[44px]"
            >
              Reply
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
