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
  WhisperReel,
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
  INITIAL_WHISPERS,
  computeMomentumScore,
} from './data/initialData';
import { MaskedMortarboardLogo } from './components/MaskedMortarboardLogo';
import { FloatingGhostDock, MainTabType } from './components/FloatingGhostDock';
import { TheQuadView } from './components/TheQuadView';
import { TheWhispersView } from './components/TheWhispersView';
import { TheLibraryView } from './components/TheLibraryView';
import { TheRadarView } from './components/TheRadarView';
import { ShadowDMsView } from './components/ShadowDMsView';
import { UniversityScannerModal } from './components/UniversityScannerModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { SnapMessageGateModal } from './components/SnapMessageGateModal';
import { IdentityModal } from './components/IdentityModal';
import { AdminSafetyModal } from './components/AdminSafetyModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CreateWhisperModal } from './components/CreateWhisperModal';
import { UploadResourceModal } from './components/UploadResourceModal';
import { ReportIssueModal } from './components/ReportIssueModal';
import { PostCommentsModal } from './components/PostCommentsModal';
import { playHapticSound } from './utils/sound';
import { Shield, Building2, Search, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation tab state (5 main modules)
  const [activeTab, setActiveTab] = useState<MainTabType>('quad');

  // Application Data States (persisted via localStorage where available)
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('quadanon_user_v3');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('quadanon_posts_v3');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [whispers, setWhispers] = useState<WhisperReel[]>(() => {
    const saved = localStorage.getItem('quadanon_whispers_v3');
    return saved ? JSON.parse(saved) : INITIAL_WHISPERS;
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('quadanon_resources_v3');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  const [issues, setIssues] = useState<CampusIssue[]>(() => {
    const saved = localStorage.getItem('quadanon_issues_v3');
    return saved ? JSON.parse(saved) : INITIAL_ISSUES;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('quadanon_convs_v3');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Active Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isIdentityOpen, setIsIdentityOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateWhisperOpen, setIsCreateWhisperOpen] = useState(false);
  const [isUploadResourceOpen, setIsUploadResourceOpen] = useState(false);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);

  // Target item modals
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [activeSnapMessage, setActiveSnapMessage] = useState<DirectMessage | null>(null);
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('quadanon_user_v3', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('quadanon_posts_v3', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('quadanon_whispers_v3', JSON.stringify(whispers));
  }, [whispers]);

  useEffect(() => {
    localStorage.setItem('quadanon_resources_v3', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('quadanon_issues_v3', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('quadanon_convs_v3', JSON.stringify(conversations));
  }, [conversations]);

  const currentUniversity =
    UNIVERSITIES.find((u) => u.id === user.universityId) || UNIVERSITIES[0];

  // Unread DM messages count
  const unreadDMsCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Handlers for The Quad
  const handleTogglePostReaction = (postId: string, key: 'fire' | 'skull' | 'cap' | 'clown' | 'fax') => {
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

  const handleAddPostComment = (
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

  // Handlers for Whispers Reels
  const handleToggleWhisperReaction = (whisperId: string, key: 'fire' | 'skull' | 'cap' | 'clown' | 'fax') => {
    setWhispers((prev) =>
      prev.map((w) => {
        if (w.id !== whisperId) return w;
        const hasReacted = w.userReactions.includes(key);
        const nextUserReactions = hasReacted
          ? w.userReactions.filter((k) => k !== key)
          : [...w.userReactions, key];
        const nextReactions = {
          ...w.reactions,
          [key]: hasReacted ? Math.max(0, w.reactions[key] - 1) : w.reactions[key] + 1,
        };
        return {
          ...w,
          reactions: nextReactions,
          userReactions: nextUserReactions,
        };
      })
    );
  };

  const handleUnlockGatedWhisper = (whisperId: string) => {
    setWhispers((prev) =>
      prev.map((w) => (w.id === whisperId ? { ...w, isUnlocked: true } : w))
    );
  };

  const handleAddWhisperComment = (whisperId: string, content: string) => {
    const newComment = {
      id: `wc_${Date.now()}`,
      authorHandle: user.anonHandle,
      content,
      createdAt: 'Just now',
    };

    setWhispers((prev) =>
      prev.map((w) => {
        if (w.id !== whisperId) return w;
        return {
          ...w,
          commentsCount: w.commentsCount + 1,
          comments: [...w.comments, newComment],
        };
      })
    );
  };

  const handleCreateWhisper = (whisperData: Omit<WhisperReel, 'id' | 'createdAt' | 'viewsCount' | 'isUnlocked' | 'reactions' | 'userReactions' | 'commentsCount' | 'comments'>) => {
    const newWhisper: WhisperReel = {
      ...whisperData,
      id: `w_${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      isUnlocked: !whisperData.isViewGated,
      reactions: { fire: 1, skull: 0, cap: 0, clown: 0, fax: 0 },
      userReactions: ['fire'],
      commentsCount: 0,
      comments: [],
    };
    setWhispers([newWhisper, ...whispers]);
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
    setWhispers((prev) => prev.filter((w) => new Date(w.expiresAt).getTime() > now));
    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        action: 'MANUAL_PURGE_RUN',
        entityType: 'ephemeral_store',
        details: 'Admin triggered immediate TTL purge across feeds and whispers',
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-[#F0EEFF] flex flex-col font-sans selection:bg-[#FF6FD8]/30 selection:text-white pb-28">
      {/* Top Header: Brand Zone — Kenya University Scanner — Anonymous Identity */}
      <header className="sticky top-0 z-40 bg-[#090C14]/90 backdrop-blur-2xl border-b border-[rgba(255,255,255,0.08)] shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Wordmark & Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <MaskedMortarboardLogo size={36} />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-[#F0EEFF] font-mono leading-none">
                QuadAnon
              </span>
              <span className="text-[10px] font-mono text-[#6FFFE0] tracking-wider uppercase mt-0.5">
                Glasshouse v3.0
              </span>
            </div>
          </div>

          {/* Zone 2: Kenya-Wide University Scanner Trigger Button */}
          <button
            onClick={() => {
              playHapticSound('click');
              setIsScannerOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#0E1320] border border-[rgba(255,255,255,0.12)] hover:border-[#6FFFE0]/50 transition-all text-left group max-w-[220px] sm:max-w-sm"
            title="Scan & Switch University (All Kenyan Campuses)"
          >
            <div className="w-7 h-7 rounded-xl bg-[#6FFFE0]/10 border border-[#6FFFE0]/30 flex items-center justify-center text-[#6FFFE0] shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>

            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-[#6FFFE0] truncate">
                  {currentUniversity.shortCode}
                </span>
                <span className="text-[10px] text-[#F0EEFF]/40 hidden sm:inline font-mono">
                  · {currentUniversity.county}
                </span>
              </div>
              <div className="text-[10px] text-[#F0EEFF]/60 truncate font-mono">
                {currentUniversity.name}
              </div>
            </div>

            <Search className="w-3.5 h-3.5 text-[#F0EEFF]/40 ml-auto shrink-0 group-hover:text-[#6FFFE0] transition-colors" />
          </button>

          {/* Zone 3: Moderation & User Keypair Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                playHapticSound('click');
                setIsAdminOpen(true);
              }}
              className="p-2.5 rounded-2xl bg-[#0E1320] border border-white/10 text-[#F0EEFF]/60 hover:text-[#FF6FD8] hover:border-[#FF6FD8]/40 transition-colors"
              title="Refine Safety & Kenya ODPC Compliance Ops"
              aria-label="Moderation Ops"
            >
              <Shield className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                playHapticSound('click');
                setIsIdentityOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#0E1320] border border-[rgba(255,255,255,0.12)] hover:border-[#6FFFE0]/50 text-xs font-mono transition-all text-[#6FFFE0]"
            >
              <div className="w-2 h-2 rounded-full bg-[#6FFFE0] animate-pulse" />
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
            onToggleReaction={handleTogglePostReaction}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
            onOpenComments={(p) => setActiveCommentPost(p)}
            onVotePoll={handleVotePoll}
            onReportPost={handleReportContent}
          />
        )}

        {/* Module 2: Whispers (Media & Ephemeral Reels) */}
        {activeTab === 'whispers' && (
          <TheWhispersView
            whispers={whispers}
            currentUniversity={currentUniversity}
            onToggleReaction={handleToggleWhisperReaction}
            onUnlockGatedWhisper={handleUnlockGatedWhisper}
            onAddComment={handleAddWhisperComment}
            onOpenCreateWhisper={() => setIsCreateWhisperOpen(true)}
          />
        )}

        {/* Module 3: The Library (Academic Resource Hub) */}
        {activeTab === 'library' && (
          <TheLibraryView
            resources={resources}
            currentUniversity={currentUniversity}
            onSelectResourceForPreview={(res) => setPreviewResource(res)}
            onUpvoteResource={handleUpvoteResource}
            onOpenUpload={() => setIsUploadResourceOpen(true)}
          />
        )}

        {/* Module 4: The Radar (Public Issues + Polygraph Analytics Engine) */}
        {activeTab === 'radar' && (
          <TheRadarView
            issues={issues}
            currentUniversity={currentUniversity}
            onUpvoteIssue={handleUpvoteIssue}
            onOpenReportIssue={() => setIsReportIssueOpen(true)}
          />
        )}

        {/* Module 5: Shadow DMs (Disappearing Direct Chat) */}
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

      {/* 3D Floating Ghost Dock Navigation */}
      <FloatingGhostDock
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadDMsCount={unreadDMsCount}
      />

      {/* Kenya-Wide University Scanner Modal */}
      <UniversityScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        universities={UNIVERSITIES}
        currentUniversityId={user.universityId}
        onSelectUniversity={(selected) => {
          setUser((prev) => ({
            ...prev,
            universityId: selected.id,
            universityName: selected.name,
          }));
        }}
      />

      {/* Anonymous Identity & Device Keypair Modal */}
      <IdentityModal
        user={user}
        universities={UNIVERSITIES}
        isOpen={isIdentityOpen}
        onClose={() => setIsIdentityOpen(false)}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
      />

      {/* Admin, Moderation & Crisis Safety Console */}
      <AdminSafetyModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        reports={reports}
        auditLogs={auditLogs}
        onResolveReport={handleResolveReport}
        onPurgeExpired={handlePurgeExpired}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmitPost={handleCreatePost}
        currentUniversityId={currentUniversity.id}
        currentUniversityName={currentUniversity.name}
        authorHandle={user.anonHandle}
        authorAvatar={user.avatarStyle}
      />

      {/* Create Whisper Reel Modal */}
      <CreateWhisperModal
        isOpen={isCreateWhisperOpen}
        onClose={() => setIsCreateWhisperOpen(false)}
        onSubmitWhisper={handleCreateWhisper}
        currentUniversityId={currentUniversity.id}
        currentUniversityName={currentUniversity.name}
        authorHandle={user.anonHandle}
        authorAvatar={user.avatarStyle}
      />

      {/* Upload Resource Modal */}
      <UploadResourceModal
        isOpen={isUploadResourceOpen}
        onClose={() => setIsUploadResourceOpen(false)}
        onUploadResource={handleUploadResource}
        currentUniversityId={currentUniversity.id}
        currentUniversityName={currentUniversity.name}
        uploaderHandle={user.anonHandle}
      />

      {/* Report Campus Issue Modal */}
      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        onSubmitIssue={handleReportIssue}
        currentUniversityId={currentUniversity.id}
        currentUniversityName={currentUniversity.name}
        authorHandle={user.anonHandle}
      />

      {/* Document Reader Preview Modal */}
      <DocumentPreviewModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
        onUpvote={handleUpvoteResource}
      />

      {/* Snap Gate Reveal Modal */}
      <SnapMessageGateModal
        message={activeSnapMessage}
        onCloseAndBurn={handleBurnSnapMessage}
      />

      {/* Post Discussion Comments Modal */}
      <PostCommentsModal
        post={activeCommentPost}
        onClose={() => setActiveCommentPost(null)}
        onAddComment={handleAddPostComment}
        currentUserHandle={user.anonHandle}
        currentUserAvatar={user.avatarStyle}
      />
    </div>
  );
}
