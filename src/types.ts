/**
 * QuadAnon Core Domain Types
 * Clean, production-ready types aligned with the Supabase Postgres schema.
 */

export type UserRole = 'student' | 'moderator' | 'admin';

export interface University {
  id: string;
  name: string;
  shortCode: string;
  county: string;
  allowedEmailDomains: string[];
  isActive: boolean;
}

export interface Profile {
  id: string;
  universityId: string;
  handle: string;
  avatarStyle: string;
  role: UserRole;
  createdAt: string;
  bannedAt: string | null;
}

export type ReactionType = 'fire' | 'skull' | 'cap' | 'clown' | 'fax';

export interface ReactionsCount {
  fire: number;
  skull: number;
  cap: number;
  clown: number;
  fax: number;
}

export interface PollOption {
  id: string;
  label: string;
  votesCount: number;
  hasVoted?: boolean;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string | null;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  universityId: string;
  universityName?: string;
  authorId: string;
  authorHandle: string;
  authorAvatar: string;
  contentText: string;
  mediaType?: 'text' | 'image' | 'document' | 'video' | 'poll' | 'code';
  mediaUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  poll?: Poll;
  codeSnippet?: string;
  codeLanguage?: string;
  expiresAt: string;
  createdAt: string;
  reactions: ReactionsCount;
  userReaction?: ReactionType | null;
  commentsCount: number;
}

export interface WhisperComment {
  id: string;
  whisperId: string;
  authorId: string;
  authorHandle: string;
  content: string;
  createdAt: string;
}

export interface WhisperReel {
  id: string;
  universityId: string;
  universityName?: string;
  authorId: string;
  authorHandle: string;
  authorAvatar: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  tags: string[];
  expiresAt: string;
  createdAt: string;
  reactions: ReactionsCount;
  userReaction?: ReactionType | null;
  commentsCount: number;
  viewsCount: number;
}

export type IssueCategory = 'Facilities' | 'Academics' | 'Finance' | 'Security' | 'Administration';
export type IssueStatus = 'open' | 'under_review' | 'resolved';

export interface CampusIssue {
  id: string;
  universityId: string;
  universityName?: string;
  authorId: string;
  authorHandle: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  upvotesCount: number;
  commentsCount: number;
  hasUpvoted: boolean;
  createdAt: string;
  statusNote?: string;
  statusUpdatedAt?: string;
}

export type ResourceCategory = 'Past Papers' | 'Lecture Notes' | 'Lab Reports' | 'Revision Guides';

export interface Resource {
  id: string;
  universityId: string;
  universityName?: string;
  uploaderId: string;
  uploaderHandle: string;
  courseCode: string;
  faculty: string;
  title: string;
  description: string;
  category: ResourceCategory;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  pageCount: number;
  downloadCount: number;
  votesCount: number;
  hasVoted: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderHandle: string;
  content: string;
  mediaType?: 'text' | 'image' | 'voice';
  mediaUrl?: string;
  expiresAt: string;
  viewOnce: boolean;
  viewedAt: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  universityId: string;
  participantId: string;
  participantHandle: string;
  participantAvatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  ttlDuration: 'snap' | '1h' | '24h' | '1w';
  createdAt: string;
}

export interface ContentReport {
  id: string;
  targetType: 'post' | 'whisper' | 'comment' | 'message' | 'resource' | 'issue';
  targetId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reporterId: string;
  createdAt: string;
  notes?: string;
}

export interface TakedownRequest {
  id: string;
  resourceId: string;
  resourceTitle?: string;
  claimantEmail: string;
  claimantName: string;
  reason: string;
  status: 'pending' | 'actioned' | 'rejected';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorHandle: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}
