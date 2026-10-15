export interface University {
  id: number;
  name: string;
  shortCode: string;
  location: string;
  faculties: string[];
}

export type EphemeralDuration = 'snap' | '1h' | '24h' | '3d' | '1w';

export interface PostComment {
  id: string;
  postId: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorHandle: string;
  authorAvatar: string;
  universityId: number;
  universityName: string;
  contentText: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'code' | 'poll';
  pollOptions?: { label: string; votes: number }[];
  userVotedIndex?: number;
  ephemeralMode: EphemeralDuration;
  expiresAt: string; // ISO string
  createdAt: string;
  reactions: {
    fire: number;
    skull: number;
    cap: number;
    clown: number;
    fax: number;
  };
  userReactions: string[];
  commentsCount: number;
  comments: PostComment[];
}

export type ResourceCategory = 'Past Papers' | 'Notes' | 'Textbooks' | 'Lab Reports' | 'Code & Cheatsheets';

export interface Resource {
  id: string;
  uploaderId: string;
  uploaderHandle: string;
  universityId: number;
  universityName: string;
  faculty: string;
  department: string;
  courseCode: string;
  title: string;
  description: string;
  category: ResourceCategory;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  pageCount: number;
  downloadsCount: number;
  upvotesCount: number;
  hasUpvoted: boolean;
  isVerifiedContributor: boolean;
  tags: string[];
  samplePreview: string; // text excerpt or simulated PDF pages
  createdAt: string;
}

export type IssueCategory = 'Academics' | 'Facilities' | 'Security' | 'Administration';
export type IssueStatus = 'open' | 'trending' | 'under_review' | 'resolved';

export interface CampusIssue {
  id: string;
  authorId: string;
  authorHandle: string;
  isDeepAnon: boolean;
  deepAnonPseudonym?: string; // e.g. "Ghost-49A2"
  universityId: number;
  universityName: string;
  title: string;
  description: string;
  category: IssueCategory;
  upvotesCount: number;
  commentsCount: number;
  status: IssueStatus;
  createdAt: string;
  hoursElapsed: number;
  momentumScore: number;
  hasUpvoted: boolean;
  officialResponse?: {
    by: string;
    text: string;
    updatedAt: string;
  };
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderHandle: string;
  content: string;
  mediaType?: 'text' | 'voice' | 'image';
  isSnap: boolean;
  isViewed: boolean;
  viewedAt?: string;
  destructionType: EphemeralDuration;
  expiresAt: string;
  createdAt: string;
  audioDurationSec?: number;
}

export interface Conversation {
  id: string;
  participantHandle: string;
  participantAvatar: string;
  universityName: string;
  destructionType: EphemeralDuration;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: DirectMessage[];
}

export interface UserProfile {
  id: string;
  anonHandle: string;
  publicName: string;
  universityId: number;
  universityName: string;
  isProfilePublic: boolean;
  avatarStyle: string;
  deviceKeypairHash: string;
  recoveryWords: string[];
  joinedAt: string;
}

export interface ReportItem {
  id: string;
  contentType: 'post' | 'resource' | 'issue' | 'message';
  contentId: string;
  snippet: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reportedAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  details: string;
  timestamp: string;
}
