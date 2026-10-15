import React, { useState, useEffect } from 'react';
import {
  University,
  Post,
  Resource,
  CampusIssue,
  Conversation,
  UserProfile,
  ReportItem,
  AuditLogItem,
  DirectMessage,
  PostComment,
} from './types';
import {
  UNIVERSITIES,
  INITIAL_USER,
  INITIAL_POSTS,
  INITIAL_RESOURCES,
  INITIAL_ISSUES,
  INITIAL_CONVERSATIONS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
  computeMomentumScore,
} from './data/initialData';
import { MaskedMortarboardLogo } from './components/MaskedMortarboardLogo';
import { TheQuadView } from './components/TheQuadView';
import { TheLibraryView } from './components/TheLibraryView';
import { TheRadarView } from './components/TheRadarView';
import { ShadowDMsView } from './components/ShadowDMsView';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { SnapMessageGateModal } from './components/SnapMessageGateModal';
import { IdentityModal } from './components/IdentityModal';
import { AdminSafetyModal } from './components/AdminSafetyModal';
import { CreatePostModal } from './components/CreatePostModal';
import { UploadResourceModal } from './components/UploadResourceModal';
import { ReportIssueModal } from './components/ReportIssueModal';
import { PostCommentsModal } from './components/PostCommentsModal';
import { playHapticSound } from './utils/sound';
import {
  Flame,
  BookOpen,
  Radio,
  MessageSquare,
  Shield,
  Key,
  ChevronDown,
  PhoneCall,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'quad' | 'library' | 'radar' | 'dms'>('quad');

  // Application Data States (persisted via localStorage where available)
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('quadanon_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('quadanon_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('quadanon_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  const [issues, setIssues] = useState<CampusIssue[]>(() => {
    const saved = localStorage.getItem('quadanon_issues');
    return saved ? JSON.parse(saved) : INITIAL_ISSUES;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('quadanon_convs');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Active Modals state
  const [isIdentityOpen, setIsIdentityOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isUploadResourceOpen, setIsUploadResourceOpen] = useState(false);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);

  // Target item modals
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [activeSnapMessage, setActiveSnapMessage] = useState<DirectMessage | null>(null);
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);

  // University selector dropdown in header
  const [showUniDropdown, setShowUniDropdown] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('quadanon_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('quadanon_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('quadanon_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('quadanon_issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('quadanon_convs', JSON.stringify(conversations));
  }, [conversations]);

  const currentUniversity =
    UNIVERSITIES.find((u) => u.id === user.universityId) || UNIVERSITIES[0];

  // Handlers for The Quad
  const handleToggleReaction = (postId: string, key: 'fire' | 'skull' | 'cap' | 'clown' | 'fax') => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const hasReacted = p.userReactions.includes(key);
        const nextUserReactions = hasReacted
          ? p.userReactions.filter((k) => k !== key)
          : [...p.userReactions, key];
        const nextReactions = {
          ...p.reactions,
          [key]: hasReacted ? Math.max(0, p.reactions[key] - 1) : p.reactions[key] + 1,
        };
        return {
          ...p,
          reactions: nextReactions,
          userReactions: nextUserReactions,
        };
      })
    );
  };

  const handleVotePoll = (postId: string, optionIndex: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.pollOptions) return p;
        const currentVote = p.userVotedIndex;
        const updatedOptions = p.pollOptions.map((opt, idx) => {
          if (idx === optionIndex) {
            return { ...opt, votes: opt.votes + 1 };
          }
          if (currentVote === idx) {
            return { ...opt, votes: Math.max(0, opt.votes - 1) };
          }
          return opt;
        });
        return {
          ...p,
          pollOptions: updatedOptions,
          userVotedIndex: optionIndex,
        };
      })
    );
  };

  const handleCreatePost = (newPostData: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'userReactions' | 'commentsCount' | 'comments'>) => {
    const newPost: Post = {
      ...newPostData,
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
      reactions: { fire: 0, skull: 0, cap: 0, clown: 0, fax: 0 },
      userReactions: [],
      commentsCount: 0,
      comments: [],
    };
    setPosts([newPost, ...posts]);
  };

  const handleAddComment = (
    postId: string,
    commentData: Omit<PostComment, 'id' | 'postId' | 'createdAt'>
  ) => {
    const newComment: PostComment = {
      ...commentData,
      id: `c_${Date.now()}`,
      postId,
      createdAt: 'Just now',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, newComment],
        };
      })
    );

    if (activeCommentPost && activeCommentPost.id === postId) {
      setActiveCommentPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: prev.commentsCount + 1,
              comments: [...prev.comments, newComment],
            }
          : null
      );
    }
  };

  // Handlers for The Library
  const handleUpvoteResource = (id: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nextUpvoted = !r.hasUpvoted;
        return {
          ...r,
          hasUpvoted: nextUpvoted,
          upvotesCount: nextUpvoted ? r.upvotesCount + 1 : r.upvotesCount - 1,
        };
      })
    );
  };

  const handleUploadResource = (
    resData: Omit<Resource, 'id' | 'createdAt' | 'downloadsCount' | 'upvotesCount' | 'hasUpvoted'>
  ) => {
    const newResource: Resource = {
      ...resData,
      id: `res_${Date.now()}`,
      downloadsCount: 1,
      upvotesCount: 1,
      hasUpvoted: true,
      createdAt: new Date().toISOString(),
    };
    setResources([newResource, ...resources]);
  };

  // Handlers for The Radar
  const handleUpvoteIssue = (id: string) => {
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== id) return iss;
        const nextUpvoted = !iss.hasUpvoted;
        const nextUpvotes = nextUpvoted ? iss.upvotesCount + 1 : iss.upvotesCount - 1;
        const newScore = computeMomentumScore(nextUpvotes, iss.commentsCount, iss.hoursElapsed);
        const nextStatus = newScore >= 15 && iss.status === 'open' ? 'trending' : iss.status;
        return {
          ...iss,
          hasUpvoted: nextUpvoted,
          upvotesCount: nextUpvotes,
          momentumScore: newScore,
          status: nextStatus,
        };
      })
    );
  };

  const handleReportIssue = (
    issueData: Omit<CampusIssue, 'id' | 'createdAt' | 'hoursElapsed' | 'momentumScore' | 'upvotesCount' | 'commentsCount' | 'hasUpvoted'>
  ) => {
    const newIssue: CampusIssue = {
      ...issueData,
      id: `issue_${Date.now()}`,
      createdAt: new Date().toISOString(),
      hoursElapsed: 0.1,
      upvotesCount: 1,
      commentsCount: 0,
      hasUpvoted: true,
      momentumScore: computeMomentumScore(1, 0, 0.1),
    };
    setIssues([newIssue, ...issues]);
  };

  // Handlers for Shadow DMs
  const handleSendMessage = (
    conversationId: string,
    messageData: Omit<DirectMessage, 'id' | 'createdAt'>
  ) => {
    const newMsg: DirectMessage = {
      ...messageData,
      id: `msg_${Date.now()}`,
      createdAt: 'Just now',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          lastMessage: newMsg.isSnap ? '[Snap Message: View Once]' : newMsg.content,
          lastMessageTime: 'Just now',
          messages: [...c.messages, newMsg],
        };
      })
    );
  };

  const handleBurnSnapMessage = (messageId: string) => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        messages: conv.messages.filter((m) => m.id !== messageId),
      }))
    );
    setActiveSnapMessage(null);
  };

  // Moderation & safety handlers
  const handleReportContent = (post: Post) => {
    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      contentType: 'post',
      contentId: post.id,
      snippet: post.contentText.slice(0, 80),
      reason: 'Flagged by student peer for moderation review',
      status: 'pending',
      reportedAt: 'Just now',
    };
    setReports([newReport, ...reports]);
    playHapticSound('click');
    alert('Content submitted to Refine safety moderation queue for review.');
  };

  const handleResolveReport = (reportId: string, action: 'resolve' | 'dismiss') => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        return {
          ...r,
          status: action === 'resolve' ? 'resolved' : 'dismissed',
        };
      })
    );
  };

  const handlePurgeExpired = () => {
    const now = Date.now();
    setPosts((prev) => prev.filter((p) => new Date(p.expiresAt).getTime() > now));
    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        action: 'MANUAL_PURGE_RUN',
        entityType: 'ephemeral_store',
        details: 'Admin triggered immediate TTL purge across all active feeds',
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-[#0A0912] text-[#F0EEFF] flex flex-col font-sans selection:bg-[#FF6FD8]/30 selection:text-white pb-20 md:pb-10">
      {/* Top Bar Contract: 3 Zones: Brand Title — 4-5 Nav Links — 1 Primary Action */}
      <header className="sticky top-0 z-40 bg-[#0C0B18]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Single text element wordmark + Masked Mortarboard Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <MaskedMortarboardLogo size={34} />
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg tracking-tight text-[#F0EEFF] font-mono">
                QuadAnon
              </span>

              {/* University Selector Badge */}
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setShowUniDropdown(!showUniDropdown)}
                  className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#16142A] border border-[rgba(255,255,255,0.1)] text-[#6FFFE0] hover:border-[#6FFFE0]/40 transition-colors"
                >
                  <span>{currentUniversity.shortCode}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {showUniDropdown && (
                  <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-[#121020] border border-[rgba(255,255,255,0.15)] shadow-2xl p-1.5 z-50 divide-y divide-white/5">
                    {UNIVERSITIES.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          playHapticSound('click');
                          setUser((prev) => ({
                            ...prev,
                            universityId: u.id,
                            universityName: u.name,
                          }));
                          setShowUniDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                          user.universityId === u.id
                            ? 'bg-[#6FFFE0]/15 text-[#6FFFE0] font-bold'
                            : 'text-[#F0EEFF]/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        <span className="text-[10px] text-[#F0EEFF]/40 ml-2">{u.shortCode}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-line, 1-2 words) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
            <button
              onClick={() => {
                playHapticSound('click');
                setActiveTab('quad');
              }}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'quad'
                  ? 'text-[#FF6FD8] font-bold border-b border-[#FF6FD8] pb-1'
                  : 'text-[#F0EEFF]/60 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>The Quad</span>
            </button>

            <button
              onClick={() => {
                playHapticSound('click');
                setActiveTab('library');
              }}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'text-[#6FFFE0] font-bold border-b border-[#6FFFE0] pb-1'
                  : 'text-[#F0EEFF]/60 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>The Library</span>
            </button>

            <button
              onClick={() => {
                playHapticSound('click');
                setActiveTab('radar');
              }}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'radar'
                  ? 'text-[#FFB27A] font-bold border-b border-[#FFB27A] pb-1'
                  : 'text-[#F0EEFF]/60 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>The Radar</span>
            </button>

            <button
              onClick={() => {
                playHapticSound('click');
                setActiveTab('dms');
              }}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'dms'
                  ? 'text-[#B794F6] font-bold border-b border-[#B794F6] pb-1'
                  : 'text-[#F0EEFF]/60 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Shadow DMs</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Identity Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                playHapticSound('click');
                setIsAdminOpen(true);
              }}
              className="p-2 rounded-xl bg-[#141224] border border-white/10 text-[#F0EEFF]/60 hover:text-[#FF6FD8] transition-colors"
              title="Moderation & Kenya ODPC Compliance"
              aria-label="Moderation Console"
            >
              <Shield className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                playHapticSound('click');
                setIsIdentityOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#16142A] border border-[rgba(255,255,255,0.12)] hover:border-[#6FFFE0]/50 text-xs font-mono transition-all text-[#6FFFE0]"
            >
              <div className="w-2 h-2 rounded-full bg-[#6FFFE0]" />
              <span className="max-w-[120px] truncate">@{user.anonHandle}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Module 1: The Quad (Ephemeral Feed) */}
        {activeTab === 'quad' && (
          <TheQuadView
            posts={posts}
            currentUniversity={currentUniversity}
            onToggleReaction={handleToggleReaction}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
            onOpenComments={(p) => setActiveCommentPost(p)}
            onVotePoll={handleVotePoll}
            onReportPost={handleReportContent}
          />
        )}

        {/* Module 2: The Library (Academic Resource Hub) */}
        {activeTab === 'library' && (
          <TheLibraryView
            resources={resources}
            currentUniversity={currentUniversity}
            onSelectResourceForPreview={(res) => setPreviewResource(res)}
            onUpvoteResource={handleUpvoteResource}
            onOpenUpload={() => setIsUploadResourceOpen(true)}
          />
        )}

        {/* Module 3: The Radar (Public Campus Analytics Dashboard) */}
        {activeTab === 'radar' && (
          <TheRadarView
            issues={issues}
            currentUniversity={currentUniversity}
            onUpvoteIssue={handleUpvoteIssue}
            onOpenReportIssue={() => setIsReportIssueOpen(true)}
          />
        )}

        {/* Module 4: Shadow DMs (Disappearing Direct Chat) */}
        {activeTab === 'dms' && (
          <ShadowDMsView
            conversations={conversations}
            currentUserId={user.id}
            currentUserHandle={user.anonHandle}
            onSendMessage={handleSendMessage}
            onOpenSnapGate={(msg) => setActiveSnapMessage(msg)}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C0B18]/95 backdrop-blur-xl border-t border-[rgba(255,255,255,0.1)] grid grid-cols-4 h-16">
        <button
          onClick={() => {
            playHapticSound('click');
            setActiveTab('quad');
          }}
          className={`flex flex-col items-center justify-center transition-colors ${
            activeTab === 'quad' ? 'text-[#FF6FD8]' : 'text-[#F0EEFF]/50'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span className="text-[10px] font-mono mt-1 font-medium">The Quad</span>
        </button>

        <button
          onClick={() => {
            playHapticSound('click');
            setActiveTab('library');
          }}
          className={`flex flex-col items-center justify-center transition-colors ${
            activeTab === 'library' ? 'text-[#6FFFE0]' : 'text-[#F0EEFF]/50'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-mono mt-1 font-medium">Library</span>
        </button>

        <button
          onClick={() => {
            playHapticSound('click');
            setActiveTab('radar');
          }}
          className={`flex flex-col items-center justify-center transition-colors ${
            activeTab === 'radar' ? 'text-[#FFB27A]' : 'text-[#F0EEFF]/50'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] font-mono mt-1 font-medium">Radar</span>
        </button>

        <button
          onClick={() => {
            playHapticSound('click');
            setActiveTab('dms');
          }}
          className={`flex flex-col items-center justify-center transition-colors ${
            activeTab === 'dms' ? 'text-[#B794F6]' : 'text-[#F0EEFF]/50'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-mono mt-1 font-medium">DMs</span>
        </button>
      </nav>

      {/* Interactive Modals */}
      <IdentityModal
        user={user}
        universities={UNIVERSITIES}
        isOpen={isIdentityOpen}
        onClose={() => setIsIdentityOpen(false)}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
      />

      <AdminSafetyModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        reports={reports}
        auditLogs={auditLogs}
        onResolveReport={handleResolveReport}
        onPurgeExpired={handlePurgeExpired}
      />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmitPost={handleCreatePost}
        currentUniversityId={currentUniversity.id}
        currentUniversityName={currentUniversity.name}
        authorHandle={user.anonHandle}
        authorAvatar={user.avatarStyle}
      />

      <UploadResourceModal
        isOpen={isUploadResourceOpen}
        onClose={() => setIsUploadResourceOpen(false)}
        onUploadResource={handleUploadResource}
        currentUniversityId={currentUniversity.id}
        currentUniversityName={currentUniversity.name}
        uploaderHandle={user.anonHandle}
      />

      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        onSubmitIssue={handleReportIssue}
        currentUniversityId={currentUniversity.id}
        currentUniversityName={currentUniversity.name}
        authorHandle={user.anonHandle}
      />

      <DocumentPreviewModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
        onUpvote={handleUpvoteResource}
      />

      <SnapMessageGateModal
        message={activeSnapMessage}
        onCloseAndBurn={handleBurnSnapMessage}
      />

      <PostCommentsModal
        post={activeCommentPost}
        onClose={() => setActiveCommentPost(null)}
        onAddComment={handleAddComment}
        currentUserHandle={user.anonHandle}
        currentUserAvatar={user.avatarStyle}
      />
    </div>
  );
}
