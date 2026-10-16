import React, { useState } from 'react';
import { Post, ReactionType, Poll } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { formatRelativeTime, formatExpiresIn, generateId } from '../../lib/utils';
import { playHapticSound } from '../../utils/sound';
import {
  MessageSquare,
  Plus,
  BarChart2,
  FileText,
  Clock,
  Send,
  Flame,
  Skull,
  GraduationCap,
  Sparkles,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';

const REACTION_CONFIG: { type: ReactionType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { type: 'fire', label: 'Fire', icon: Flame, color: 'text-peach' },
  { type: 'skull', label: 'Skull', icon: Skull, color: 'text-text-secondary' },
  { type: 'cap', label: 'Cap', icon: GraduationCap, color: 'text-mint' },
  { type: 'clown', label: 'Clown', icon: Sparkles, color: 'text-lemon' },
  { type: 'fax', label: 'Spitting Fax', icon: Sparkles, color: 'text-lavender' },
];

export const QuadFeed: React.FC = () => {
  const { profile, campus } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'polls' | 'documents'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);

  // Create post state
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'poll' | 'document'>('text');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [documentName, setDocumentName] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<'1h' | '24h' | '3d' | '1w'>('24h');
  const [commentInput, setCommentInput] = useState('');

  const filteredPosts = posts.filter((p) => {
    if (filterType === 'polls' && !p.poll) return false;
    if (filterType === 'documents' && p.mediaType !== 'document') return false;
    return true;
  });

  const handleToggleReaction = (postId: string, reactionType: ReactionType) => {
    playHapticSound('vote');
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const current = p.userReaction;
        const nextReactions = { ...p.reactions };
        let nextUserReaction: ReactionType | null = null;

        if (current === reactionType) {
          nextReactions[reactionType] = Math.max(0, (nextReactions[reactionType] || 1) - 1);
          nextUserReaction = null;
        } else {
          if (current) {
            nextReactions[current] = Math.max(0, (nextReactions[current] || 1) - 1);
          }
          nextReactions[reactionType] = (nextReactions[reactionType] || 0) + 1;
          nextUserReaction = reactionType;
        }

        return {
          ...p,
          reactions: nextReactions,
          userReaction: nextUserReaction,
        };
      })
    );
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    playHapticSound('vote');
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.poll) return p;
        if (p.poll.userVotedOptionId) return p; // Strictly one vote per poll

        const updatedOptions = p.poll.options.map((opt) => {
          if (opt.id === optionId) {
            return { ...opt, votesCount: opt.votesCount + 1, hasVoted: true };
          }
          return opt;
        });

        return {
          ...p,
          poll: {
            ...p.poll,
            options: updatedOptions,
            totalVotes: p.poll.totalVotes + 1,
            userVotedOptionId: optionId,
          },
        };
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && postType === 'text') return;

    playHapticSound('send');

    const durationMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
    }[selectedDuration];

    let pollPayload: Poll | undefined = undefined;
    if (postType === 'poll') {
      const validOpts = pollOptions.filter((o) => o.trim().length > 0);
      if (validOpts.length >= 2) {
        pollPayload = {
          id: generateId(),
          question: pollQuestion.trim() || postContent.trim(),
          options: validOpts.map((label) => ({
            id: generateId(),
            label: label.trim(),
            votesCount: 0,
          })),
          totalVotes: 0,
          userVotedOptionId: null,
        };
      }
    }

    const newPost: Post = {
      id: generateId(),
      universityId: campus.id,
      universityName: campus.name,
      authorId: profile?.id || 'anon',
      authorHandle: profile?.handle || 'CampusStudent',
      authorAvatar: profile?.avatarStyle || 'phantom_ghostling',
      contentText: postContent.trim(),
      mediaType: postType === 'poll' ? 'poll' : postType === 'document' ? 'document' : 'text',
      fileName: postType === 'document' ? documentName.trim() || 'campus_doc.pdf' : undefined,
      poll: pollPayload,
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
      createdAt: new Date().toISOString(),
      reactions: { fire: 0, skull: 0, cap: 0, clown: 0, fax: 0 },
      commentsCount: 0,
    };

    setPosts([newPost, ...posts]);
    setPostContent('');
    setPollQuestion('');
    setPollOptions(['', '']);
    setDocumentName('');
    setIsCreateOpen(false);
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    playHapticSound('send');
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
        };
      })
    );
    setCommentInput('');
    setActiveCommentsPostId(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Controls */}
      <div className="p-4 rounded-3xl water-glass-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-bubblegum/15 text-bubblegum flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-bold font-mono text-text-primary">
              The Quad Feed
            </h1>
            <p className="text-xs text-text-secondary font-mono">
              Open discussions, polls, and student documents · {campus.shortCode}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-bubblegum text-neutral-900 font-mono text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Post to Quad</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter Quad posts"
        className="flex items-center gap-2 p-1 rounded-2xl bg-surface border border-border-glass max-w-fit"
      >
        {(['all', 'polls', 'documents'] as const).map((ft) => (
          <button
            key={ft}
            role="tab"
            aria-selected={filterType === ft}
            onClick={() => {
              playHapticSound('click');
              setFilterType(ft);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all min-h-[36px] ${
              filterType === ft
                ? 'bg-bubblegum text-neutral-900 font-bold shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {ft === 'all' ? 'All Posts' : ft}
          </button>
        ))}
      </div>

      {/* Posts list or empty state */}
      {filteredPosts.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-6 h-6" aria-hidden="true" />}
          title="The Quad is quiet"
          description="No posts yet on your campus feed. Broadcast the first discussion, question, poll, or study document."
          actionLabel="Start a Discussion"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="p-5 rounded-3xl water-glass-card border border-border-glass space-y-3 shadow-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">@{post.authorHandle}</span>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-secondary">{formatRelativeTime(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 text-peach text-[11px]">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{formatExpiresIn(post.expiresAt)}</span>
                </div>
              </div>

              {/* Text content */}
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {post.contentText}
              </p>

              {/* Document attachment if present */}
              {post.fileName && (
                <div className="p-3 rounded-2xl bg-surface border border-border-glass flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-mint" aria-hidden="true" />
                    <span className="text-text-primary font-bold">{post.fileName}</span>
                  </div>
                  <span className="text-[10px] text-text-muted">Attachment</span>
                </div>
              )}

              {/* Poll if present */}
              {post.poll && (
                <div className="p-4 rounded-2xl bg-surface border border-border-glass space-y-2.5">
                  <div className="text-xs font-bold font-mono text-text-primary flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-bubblegum" aria-hidden="true" />
                    <span>{post.poll.question}</span>
                  </div>
                  <div className="space-y-1.5">
                    {post.poll.options.map((opt) => {
                      const pct = post.poll!.totalVotes > 0 ? Math.round((opt.votesCount / post.poll!.totalVotes) * 100) : 0;
                      const hasVotedThis = post.poll!.userVotedOptionId === opt.id;
                      const hasVotedAny = !!post.poll!.userVotedOptionId;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={hasVotedAny}
                          onClick={() => handleVotePoll(post.id, opt.id)}
                          className={`w-full p-2.5 rounded-xl border text-xs font-mono text-left relative overflow-hidden transition-all min-h-[44px] flex items-center justify-between ${
                            hasVotedThis
                              ? 'border-bubblegum bg-bubblegum/15 font-bold'
                              : 'border-border-glass hover:border-text-muted'
                          }`}
                        >
                          {/* Vote progress fill */}
                          {hasVotedAny && (
                            <div
                              className="absolute inset-y-0 left-0 bg-bubblegum/20 transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-1.5">
                            {hasVotedThis && <CheckCircle2 className="w-3.5 h-3.5 text-bubblegum" aria-hidden="true" />}
                            <span>{opt.label}</span>
                          </span>
                          {hasVotedAny && (
                            <span className="relative z-10 font-bold text-text-secondary">{pct}%</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[10px] font-mono text-text-muted text-right">
                    {post.poll.totalVotes} {post.poll.totalVotes === 1 ? 'vote' : 'votes'} · One vote per student
                  </div>
                </div>
              )}

              {/* Reactions Bar */}
              <div className="pt-3 border-t border-border-glass flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {REACTION_CONFIG.map(({ type, label, icon: Icon, color }) => {
                    const isSelected = post.userReaction === type;
                    const count = post.reactions[type] || 0;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleToggleReaction(post.id, type)}
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
                  onClick={() => setActiveCommentsPostId(post.id)}
                  aria-label={`View ${post.commentsCount} comments`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-glass text-xs font-mono text-text-secondary hover:text-text-primary min-h-[36px]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-bubblegum" aria-hidden="true" />
                  <span>{post.commentsCount}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Post to The Quad"
        description="Share a discussion, document, or poll to your verified campus community."
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="flex items-center gap-2">
            {(['text', 'poll', 'document'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPostType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize border min-h-[36px] ${
                  postType === t
                    ? 'bg-bubblegum text-neutral-900 border-bubblegum font-bold'
                    : 'bg-canvas border-border-glass text-text-secondary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-text-primary mb-1">
              {postType === 'poll' ? 'Discussion Context / Description' : 'Post Content'}
            </label>
            <textarea
              rows={3}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What would you like to discuss with fellow students?"
              className="w-full p-3 rounded-2xl bg-canvas border border-border-glass text-text-primary text-xs font-mono outline-none focus:border-bubblegum"
              required={postType === 'text'}
            />
          </div>

          {postType === 'poll' && (
            <div className="space-y-2 p-3 rounded-2xl bg-canvas border border-border-glass">
              <label className="block text-xs font-mono font-bold text-text-primary">
                Poll Question
              </label>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="e.g. Should the library open 24/7 during midterms?"
                className="w-full p-2.5 rounded-xl bg-surface border border-border-glass text-text-primary text-xs font-mono outline-none focus:border-bubblegum"
                required
              />
              <label className="block text-[11px] font-mono text-text-secondary pt-1">
                Poll Options (min 2)
              </label>
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const next = [...pollOptions];
                    next[idx] = e.target.value;
                    setPollOptions(next);
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="w-full p-2 rounded-xl bg-surface border border-border-glass text-text-primary text-xs font-mono outline-none focus:border-bubblegum"
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="text-xs font-mono text-bubblegum hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          {postType === 'document' && (
            <div className="p-3 rounded-2xl bg-canvas border border-border-glass space-y-2">
              <label className="block text-xs font-mono font-bold text-text-primary">
                Document File Name
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g. COMP310_Midterm_Study_Guide.pdf"
                className="w-full p-2.5 rounded-xl bg-surface border border-border-glass text-text-primary text-xs font-mono outline-none focus:border-bubblegum"
                required
              />
              <p className="text-[11px] text-text-muted font-mono">
                Only educational documents, lecture notes, and non-confidential materials allowed.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-text-primary mb-1">
              Expiration Lifespan
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '1h', label: '1 Hour' },
                { id: '24h', label: '24 Hours' },
                { id: '3d', label: '3 Days' },
                { id: '1w', label: '1 Week' },
              ].map((dur) => (
                <button
                  key={dur.id}
                  type="button"
                  onClick={() => setSelectedDuration(dur.id as any)}
                  className={`p-2 rounded-xl text-xs font-mono border min-h-[44px] transition-all ${
                    selectedDuration === dur.id
                      ? 'bg-bubblegum text-neutral-900 border-bubblegum font-bold'
                      : 'bg-canvas border-border-glass text-text-secondary'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
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
              className="px-5 py-2 rounded-full bg-bubblegum text-neutral-900 font-mono text-xs font-bold min-h-[44px]"
            >
              Publish to Quad
            </button>
          </div>
        </form>
      </Modal>

      {/* Post Comments Modal */}
      <Modal
        isOpen={!!activeCommentsPostId}
        onClose={() => setActiveCommentsPostId(null)}
        title="Post Replies"
        description="Pseudonymous campus thread."
      >
        <form onSubmit={(e) => activeCommentsPostId && handleAddComment(activeCommentsPostId, e)} className="space-y-3">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Reply to this thread..."
            className="w-full p-3 rounded-xl bg-canvas border border-border-glass text-text-primary text-xs font-mono outline-none focus:border-bubblegum"
          />
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-4 py-2 rounded-full bg-bubblegum text-neutral-900 font-mono text-xs font-bold disabled:opacity-40 min-h-[44px]"
            >
              Reply
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
