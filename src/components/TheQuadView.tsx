import React, { useState } from 'react';
import { Post, University } from '../types';
import { CountdownChip } from './CountdownChip';
import { ReactionPillGroup } from './ReactionPillGroup';
import { MessageSquare, Plus, Flag, Copy, Check, BarChart2 } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  posts: Post[];
  currentUniversity: University;
  onToggleReaction: (postId: string, key: 'fire' | 'skull' | 'cap' | 'clown' | 'fax') => void;
  onOpenCreatePost: () => void;
  onOpenComments: (post: Post) => void;
  onVotePoll: (postId: string, optionIndex: number) => void;
  onReportPost: (post: Post) => void;
}

export const TheQuadView: React.FC<Props> = ({
  posts,
  currentUniversity,
  onToggleReaction,
  onOpenCreatePost,
  onOpenComments,
  onVotePoll,
  onReportPost,
}) => {
  const [scope, setScope] = useState<'campus' | 'all'>('campus');
  const [filterType, setFilterType] = useState<'all' | 'polls' | 'code' | 'urgent'>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Filter posts based on scope and filterType
  const filteredPosts = posts.filter((p) => {
    if (scope === 'campus' && p.universityId !== currentUniversity.id) {
      return false;
    }
    if (filterType === 'polls' && p.mediaType !== 'poll') return false;
    if (filterType === 'code' && p.mediaType !== 'code') return false;
    if (filterType === 'urgent') {
      const remainingMs = new Date(p.expiresAt).getTime() - Date.now();
      if (remainingMs > 2 * 3600000 || remainingMs <= 0) return false;
    }
    return true;
  });

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    playHapticSound('click');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Scope Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl bg-[#121020]/90 border border-[rgba(255,255,255,0.08)]">
        {/* Segmented Scope: My Campus vs All Universities */}
        <div className="flex items-center p-1 rounded-xl bg-[#0A0912] border border-white/5">
          <button
            onClick={() => {
              playHapticSound('click');
              setScope('campus');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              scope === 'campus'
                ? 'bg-[#FF6FD8] text-[#0A0912] font-semibold shadow-sm'
                : 'text-[#F0EEFF]/60 hover:text-white'
            }`}
          >
            My Campus ({currentUniversity.shortCode})
          </button>
          <button
            onClick={() => {
              playHapticSound('click');
              setScope('all');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              scope === 'all'
                ? 'bg-[#FF6FD8] text-[#0A0912] font-semibold shadow-sm'
                : 'text-[#F0EEFF]/60 hover:text-white'
            }`}
          >
            All Universities (Kenya Wide)
          </button>
        </div>

        {/* Media & Urgent Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => {
              playHapticSound('click');
              setFilterType('all');
            }}
            className={`px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
              filterType === 'all'
                ? 'border-white/40 bg-white/10 text-white'
                : 'border-white/5 text-[#F0EEFF]/50 hover:border-white/20'
            }`}
          >
            All Whispers
          </button>
          <button
            onClick={() => {
              playHapticSound('click');
              setFilterType('polls');
            }}
            className={`px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
              filterType === 'polls'
                ? 'border-[#FF6FD8] bg-[#FF6FD8]/10 text-[#FF6FD8]'
                : 'border-white/5 text-[#F0EEFF]/50 hover:border-white/20'
            }`}
          >
            Polls
          </button>
          <button
            onClick={() => {
              playHapticSound('click');
              setFilterType('code');
            }}
            className={`px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
              filterType === 'code'
                ? 'border-[#6FFFE0] bg-[#6FFFE0]/10 text-[#6FFFE0]'
                : 'border-white/5 text-[#F0EEFF]/50 hover:border-white/20'
            }`}
          >
            Code Blocks
          </button>
          <button
            onClick={() => {
              playHapticSound('click');
              setFilterType('urgent');
            }}
            className={`px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
              filterType === 'urgent'
                ? 'border-[#FFE66D] bg-[#FFE66D]/10 text-[#FFE66D]'
                : 'border-white/5 text-[#F0EEFF]/50 hover:border-white/20'
            }`}
          >
            Expiring &lt; 2h
          </button>
        </div>
      </div>

      {/* Posts Stream */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121020]/60 border border-[rgba(255,255,255,0.08)] space-y-3">
          <div className="text-sm font-mono text-[#F0EEFF]/60">
            No active whispers in this scope.
          </div>
          <p className="text-xs text-[#F0EEFF]/40 max-w-sm mx-auto">
            All whispers self-destruct once their timer runs out. Drop the first anonymous post for {currentUniversity.name}!
          </p>
          <button
            onClick={() => {
              playHapticSound('pop');
              onOpenCreatePost();
            }}
            className="px-4 py-2 rounded-xl bg-[#FF6FD8] text-[#0A0912] font-semibold text-xs font-mono"
          >
            Broadcast Whisper
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-2xl bg-[#121020]/80 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.18)] transition-all shadow-sm space-y-3.5"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#18152E] border border-[#6FFFE0]/40 flex items-center justify-center text-xs font-mono text-[#6FFFE0]">
                    Anon
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#F0EEFF]">
                        @{post.authorHandle}
                      </span>
                      <span className="text-xs text-[#F0EEFF]/40">·</span>
                      <span className="text-xs font-mono text-[#F0EEFF]/60 truncate max-w-[140px] sm:max-w-[240px]">
                        {post.universityName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CountdownChip expiresAt={post.expiresAt} mode={post.ephemeralMode} />
                  <button
                    onClick={() => {
                      playHapticSound('click');
                      onReportPost(post);
                    }}
                    className="p-1 rounded text-[#F0EEFF]/30 hover:text-[#FF5C7A] transition-colors"
                    title="Report content"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <p className="text-sm text-[#F0EEFF] leading-relaxed whitespace-pre-wrap">
                {post.contentText}
              </p>

              {/* Conditional Poll Display */}
              {post.mediaType === 'poll' && post.pollOptions && (
                <div className="p-3.5 rounded-xl bg-[#15132A] border border-white/5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#FF6FD8]">
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Campus Poll</span>
                  </div>

                  <div className="space-y-1.5">
                    {(() => {
                      const totalVotes = post.pollOptions.reduce((acc, curr) => acc + curr.votes, 0) || 1;
                      return post.pollOptions.map((opt, idx) => {
                        const percent = Math.round((opt.votes / totalVotes) * 100);
                        const isSelected = post.userVotedIndex === idx;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              playHapticSound('vote');
                              onVotePoll(post.id, idx);
                            }}
                            className={`w-full relative overflow-hidden p-2.5 rounded-lg border text-left text-xs font-mono transition-all flex items-center justify-between ${
                              isSelected
                                ? 'border-[#FF6FD8] text-white bg-[#FF6FD8]/10'
                                : 'border-white/5 bg-[#0D0C1A] text-[#F0EEFF]/80 hover:border-white/20'
                            }`}
                          >
                            {/* Percentage fill bar */}
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-white/5 pointer-events-none transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                            <span className="relative z-10 flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#FF6FD8] bg-[#FF6FD8]' : 'border-white/30'}`}>
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0A0912]" />}
                              </span>
                              <span>{opt.label}</span>
                            </span>
                            <span className="relative z-10 text-[11px] tabular-nums text-[#F0EEFF]/50">
                              {percent}% ({opt.votes})
                            </span>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Conditional Code Display */}
              {post.mediaType === 'code' && post.mediaUrl && (
                <div className="rounded-xl bg-[#090813] border border-white/10 overflow-hidden font-mono text-xs">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#141224] border-b border-white/5 text-[11px] text-[#F0EEFF]/50">
                    <span>CODE SNIPPET</span>
                    <button
                      onClick={() => handleCopyCode(post.mediaUrl!, post.id)}
                      className="inline-flex items-center gap-1 hover:text-white"
                    >
                      {copiedCodeId === post.id ? (
                        <Check className="w-3 h-3 text-[#6FFFE0]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedCodeId === post.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 text-[#6FFFE0] overflow-x-auto leading-relaxed">
                    <code>{post.mediaUrl}</code>
                  </pre>
                </div>
              )}

              {/* Card Footer: Reactions + Comments */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <ReactionPillGroup
                  reactions={post.reactions}
                  userReactions={post.userReactions}
                  onToggleReaction={(key) => onToggleReaction(post.id, key)}
                />

                <button
                  onClick={() => {
                    playHapticSound('click');
                    onOpenComments(post);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-white/5 hover:bg-white/10 text-xs font-mono text-[#F0EEFF]/70 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#FF6FD8]" />
                  <span>{post.commentsCount} replies</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={() => {
            playHapticSound('pop');
            onOpenCreatePost();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#FF6FD8] text-[#0A0912] font-semibold text-xs font-mono shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Post Whisper</span>
        </button>
      </div>
    </div>
  );
};
