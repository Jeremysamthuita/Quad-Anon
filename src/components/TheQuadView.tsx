import React, { useState } from 'react';
import { Post, University } from '../types';
import { CountdownChip } from './CountdownChip';
import { ReactionPillGroup } from './ReactionPillGroup';
import { MessageSquare, Plus, Flag, Copy, Check, BarChart2, FileText, Download, Film, Image as ImageIcon } from 'lucide-react';
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
  const [filterType, setFilterType] = useState<'all' | 'uploads' | 'polls' | 'code' | 'urgent'>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [downloadedDocId, setDownloadedDocId] = useState<string | null>(null);

  // Filter posts based on scope and filterType
  const filteredPosts = posts.filter((p) => {
    if (scope === 'campus' && p.universityId !== currentUniversity.id) {
      return false;
    }
    if (filterType === 'uploads' && !p.fileName && p.mediaType !== 'document' && p.mediaType !== 'image') return false;
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

  const handleDownloadDoc = (fileName: string, id: string) => {
    playHapticSound('click');
    setDownloadedDocId(id);
    const element = document.createElement('a');
    const file = new Blob([`CONFIDENTIAL CAMPUS DOCUMENT // ${fileName}\nVerified by QuadAnon Decentralized Vault.`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => setDownloadedDocId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Scope Controls */}
      <div className="p-3 rounded-3xl water-glass-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
        {/* Segmented Scope: My Campus vs All Universities */}
        <div className="flex items-center p-1 rounded-2xl bg-black/10 dark:bg-black/30 border border-white/5">
          <button
            onClick={() => {
              playHapticSound('click');
              setScope('campus');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
              scope === 'campus'
                ? 'bg-[#FF6FD8] text-[#0A0912] font-semibold shadow-sm'
                : 'text-neutral-600 dark:text-[#F0EEFF]/60 hover:text-black dark:hover:text-white'
            }`}
          >
            My Campus ({currentUniversity.shortCode})
          </button>
          <button
            onClick={() => {
              playHapticSound('click');
              setScope('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
              scope === 'all'
                ? 'bg-[#FF6FD8] text-[#0A0912] font-semibold shadow-sm'
                : 'text-neutral-600 dark:text-[#F0EEFF]/60 hover:text-black dark:hover:text-white'
            }`}
          >
            All Campuses
          </button>
        </div>

        {/* Media & Urgent Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => {
              playHapticSound('click');
              setFilterType('all');
            }}
            className={`px-2.5 py-1 rounded-xl border transition-colors whitespace-nowrap ${
              filterType === 'all'
                ? 'border-neutral-400 dark:border-white/40 bg-neutral-200/50 dark:bg-white/10 text-neutral-900 dark:text-white font-semibold'
                : 'border-transparent text-neutral-500 dark:text-[#F0EEFF]/50 hover:border-neutral-300 dark:hover:border-white/20'
            }`}
          >
            All Whispers
          </button>
          <button
            onClick={() => {
              playHapticSound('click');
              setFilterType('uploads');
            }}
            className={`px-2.5 py-1 rounded-xl border transition-colors whitespace-nowrap ${
              filterType === 'uploads'
                ? 'border-[#6FFFE0] bg-[#6FFFE0]/15 text-[#6FFFE0] font-semibold'
                : 'border-transparent text-neutral-500 dark:text-[#F0EEFF]/50 hover:border-neutral-300 dark:hover:border-white/20'
            }`}
          >
            Files & Docs
          </button>
          <button
            onClick={() => {
              playHapticSound('click');
              setFilterType('polls');
            }}
            className={`px-2.5 py-1 rounded-xl border transition-colors whitespace-nowrap ${
              filterType === 'polls'
                ? 'border-[#FF6FD8] bg-[#FF6FD8]/15 text-[#FF6FD8] font-semibold'
                : 'border-transparent text-neutral-500 dark:text-[#F0EEFF]/50 hover:border-neutral-300 dark:hover:border-white/20'
            }`}
          >
            Polls
          </button>
          <button
            onClick={() => {
              playHapticSound('click');
              setFilterType('code');
            }}
            className={`px-2.5 py-1 rounded-xl border transition-colors whitespace-nowrap ${
              filterType === 'code'
                ? 'border-[#B794F6] bg-[#B794F6]/15 text-[#B794F6] font-semibold'
                : 'border-transparent text-neutral-500 dark:text-[#F0EEFF]/50 hover:border-neutral-300 dark:hover:border-white/20'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => {
              playHapticSound('click');
              setFilterType('urgent');
            }}
            className={`px-2.5 py-1 rounded-xl border transition-colors whitespace-nowrap ${
              filterType === 'urgent'
                ? 'border-[#FFE66D] bg-[#FFE66D]/15 text-[#FFE66D] font-semibold'
                : 'border-transparent text-neutral-500 dark:text-[#F0EEFF]/50 hover:border-neutral-300 dark:hover:border-white/20'
            }`}
          >
            Expiring &lt; 2h
          </button>
        </div>
      </div>

      {/* Dedicated File & Media Upload Utility Component for The Quad */}
      <div className="p-4 rounded-3xl water-glass-card border border-[rgba(255,111,216,0.25)] space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6FD8]/15 border border-[#FF6FD8]/30 flex items-center justify-center text-[#FF6FD8] shrink-0">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#F0EEFF] font-mono">
                The Quad · Community Uploads Hub
              </h3>
              <p className="text-[11px] text-neutral-600 dark:text-[#F0EEFF]/60 font-mono">
                Post anything openly: secure leaks, past papers, lecture slides, memes, and campus audio
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playHapticSound('pop');
              onOpenCreatePost();
            }}
            className="self-start sm:self-auto px-4 py-1.5 rounded-full bg-[#FF6FD8] text-[#0A0912] font-mono font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
          >
            Create Post
          </button>
        </div>

        {/* Quick Upload Utility Buttons Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-black/5 dark:border-white/5">
          <button
            onClick={() => {
              playHapticSound('click');
              onOpenCreatePost();
            }}
            className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#6FFFE0]/15 border border-transparent hover:border-[#6FFFE0]/40 transition-all flex items-center gap-2 text-left group"
          >
            <div className="w-7 h-7 rounded-xl bg-[#6FFFE0]/15 text-[#6FFFE0] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono font-bold text-neutral-900 dark:text-white truncate">
                Upload Doc
              </div>
              <div className="text-[9px] font-mono text-neutral-500 dark:text-white/40 truncate">
                PDF, PPTX, Exam
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              playHapticSound('click');
              onOpenCreatePost();
            }}
            className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#FFB27A]/15 border border-transparent hover:border-[#FFB27A]/40 transition-all flex items-center gap-2 text-left group"
          >
            <div className="w-7 h-7 rounded-xl bg-[#FFB27A]/15 text-[#FFB27A] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono font-bold text-neutral-900 dark:text-white truncate">
                Attach Image
              </div>
              <div className="text-[9px] font-mono text-neutral-500 dark:text-white/40 truncate">
                Photo, Memo, Snap
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              playHapticSound('click');
              onOpenCreatePost();
            }}
            className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#FF6FD8]/15 border border-transparent hover:border-[#FF6FD8]/40 transition-all flex items-center gap-2 text-left group"
          >
            <div className="w-7 h-7 rounded-xl bg-[#FF6FD8]/15 text-[#FF6FD8] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Film className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono font-bold text-neutral-900 dark:text-white truncate">
                Video Clip
              </div>
              <div className="text-[9px] font-mono text-neutral-500 dark:text-white/40 truncate">
                MP4, Reel, Clip
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              playHapticSound('click');
              onOpenCreatePost();
            }}
            className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#B794F6]/15 border border-transparent hover:border-[#B794F6]/40 transition-all flex items-center gap-2 text-left group"
          >
            <div className="w-7 h-7 rounded-xl bg-[#B794F6]/15 text-[#B794F6] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono font-bold text-neutral-900 dark:text-white truncate">
                Campus Poll
              </div>
              <div className="text-[9px] font-mono text-neutral-500 dark:text-white/40 truncate">
                Real-time vote
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Posts Stream */}
      {filteredPosts.length === 0 ? (
        <div className="p-14 text-center rounded-3xl water-glass-card space-y-3">
          <div className="text-sm font-mono text-neutral-600 dark:text-[#F0EEFF]/60">
            No active whispers in this scope.
          </div>
          <p className="text-xs text-neutral-500 dark:text-[#F0EEFF]/40 max-w-sm mx-auto">
            Drop documents, past papers, notes, or leaks to the Quad feed!
          </p>
          <button
            onClick={() => {
              playHapticSound('pop');
              onOpenCreatePost();
            }}
            className="px-5 py-2.5 rounded-full bg-[#FF6FD8] text-[#0A0912] font-bold text-xs font-mono shadow-md"
          >
            Broadcast to The Quad
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-3xl water-glass-card water-glass-card-hover space-y-3.5"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-neutral-200 dark:bg-[#18152E] border border-[#6FFFE0]/40 flex items-center justify-center text-xs font-mono text-[#6FFFE0]">
                    Anon
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-[#F0EEFF]">
                        @{post.authorHandle}
                      </span>
                      <span className="text-xs text-neutral-400 dark:text-[#F0EEFF]/40">·</span>
                      <span className="text-xs font-mono text-neutral-600 dark:text-[#F0EEFF]/60 truncate max-w-[140px] sm:max-w-[240px]">
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
                    className="p-1 rounded text-neutral-400 dark:text-[#F0EEFF]/30 hover:text-[#FF5C7A] transition-colors"
                    title="Report content"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <p className="text-sm text-neutral-900 dark:text-[#F0EEFF] leading-relaxed whitespace-pre-wrap">
                {post.contentText}
              </p>

              {/* Attached Document or File Preview Component */}
              {(post.fileName || post.mediaType === 'document') && (
                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/30 border border-neutral-300 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#6FFFE0]/15 border border-[#6FFFE0]/30 flex items-center justify-center text-[#6FFFE0] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-neutral-900 dark:text-[#F0EEFF] truncate">
                        {post.fileName || 'Attached_Course_Material.pdf'}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 dark:text-[#F0EEFF]/50">
                        {post.fileSizeFormatted || '2.4 MB'} · Verified Campus File
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadDoc(post.fileName || 'Document.pdf', post.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6FFFE0] text-[#0A0912] font-bold text-xs font-mono transition-transform active:scale-95 shadow-sm shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadedDocId === post.id ? 'Saved' : 'Download'}</span>
                  </button>
                </div>
              )}

              {/* Attached Image or Media Clip */}
              {post.mediaType === 'image' && post.mediaUrl && (
                <div className="rounded-2xl overflow-hidden border border-neutral-300 dark:border-white/10 max-h-80">
                  <img
                    src={post.mediaUrl}
                    alt={post.fileName || 'Attached Image'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Conditional Poll Display */}
              {post.mediaType === 'poll' && post.pollOptions && (
                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/30 border border-neutral-300 dark:border-white/10 space-y-2">
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
                            className={`w-full relative overflow-hidden p-2.5 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between ${
                              isSelected
                                ? 'border-[#FF6FD8] text-neutral-900 dark:text-white bg-[#FF6FD8]/10'
                                : 'border-neutral-300 dark:border-white/5 bg-white/40 dark:bg-[#0D0C1A] text-neutral-800 dark:text-[#F0EEFF]/80 hover:border-neutral-400 dark:hover:border-white/20'
                            }`}
                          >
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-neutral-300/40 dark:bg-white/5 pointer-events-none transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                            <span className="relative z-10 flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#FF6FD8] bg-[#FF6FD8]' : 'border-neutral-400 dark:border-white/30'}`}>
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0A0912]" />}
                              </span>
                              <span>{opt.label}</span>
                            </span>
                            <span className="relative z-10 text-[11px] tabular-nums text-neutral-600 dark:text-[#F0EEFF]/50">
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
                <div className="rounded-2xl bg-neutral-900 text-neutral-100 border border-neutral-700 dark:border-white/10 overflow-hidden font-mono text-xs">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-800 border-b border-neutral-700 text-[11px] text-neutral-400">
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
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/5 dark:border-[rgba(255,255,255,0.06)]">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-[rgba(255,255,255,0.08)] bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-xs font-mono text-neutral-700 dark:text-[#F0EEFF]/70 hover:text-black dark:hover:text-white transition-colors"
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
      <div className="sticky bottom-24 flex justify-end">
        <button
          onClick={() => {
            playHapticSound('pop');
            onOpenCreatePost();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#FF6FD8] text-[#0A0912] font-bold text-xs font-mono shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Post Whisper / File</span>
        </button>
      </div>
    </div>
  );
};
