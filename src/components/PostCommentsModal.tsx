import React, { useState } from 'react';
import { Post, PostComment } from '../types';
import { X, Send, MessageCircle } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  post: Post | null;
  onClose: () => void;
  onAddComment: (postId: string, comment: Omit<PostComment, 'id' | 'postId' | 'createdAt'>) => void;
  currentUserHandle: string;
  currentUserAvatar: string;
}

export const PostCommentsModal: React.FC<Props> = ({
  post,
  onClose,
  onAddComment,
  currentUserHandle,
  currentUserAvatar,
}) => {
  const [commentText, setCommentText] = useState('');

  if (!post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    playHapticSound('send');
    onAddComment(post.id, {
      authorHandle: currentUserHandle,
      authorAvatar: currentUserAvatar,
      content: commentText.trim(),
    });
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-[#0F0D1E] border border-[rgba(255,255,255,0.14)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#141226]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#FF6FD8]" />
            <h2 className="text-sm font-semibold text-[#F0EEFF]">Thread Discussion</h2>
            <span className="text-xs font-mono text-[#F0EEFF]/50">({post.comments.length} replies)</span>
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

        {/* Original Post Snippet */}
        <div className="p-4 bg-[#141224] border-b border-white/5 text-xs text-[#F0EEFF]/80 font-mono">
          <div className="text-[11px] text-[#FF6FD8] mb-1">@{post.authorHandle} said:</div>
          <p className="line-clamp-2 italic font-sans">{post.contentText}</p>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {post.comments.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#F0EEFF]/40">
              No replies yet. Be the first to drop an anonymous comment.
            </div>
          ) : (
            post.comments.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-[#16142A] border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#6FFFE0]">@{c.authorHandle}</span>
                  <span className="text-[#F0EEFF]/40">{c.createdAt}</span>
                </div>
                <p className="text-xs text-[#F0EEFF] leading-relaxed">{c.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-[#141226] border-t border-[rgba(255,255,255,0.08)] flex items-center gap-2">
          <input
            type="text"
            required
            placeholder="Reply anonymously..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#0F0D1E] border border-white/10 text-xs text-[#F0EEFF] focus:border-[#FF6FD8] outline-none font-mono"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2 rounded-xl bg-[#FF6FD8] text-[#0A0912] font-semibold transition-transform active:scale-95 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
