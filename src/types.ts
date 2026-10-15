export type UniversityType = 'public_chartered' | 'private_chartered' | 'constituent_college';

export interface University {
  id: number;
  name: string;
  shortCode: string;
  location: string;
  county: string;
  type: UniversityType;
  faculties: string[];
  activeAnonsCount: number;
  resourcesCount: number;
  activeIssuesCount: number;
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

export interface WhisperComment {
  id: string;
  authorHandle: string;
  content: string;
  createdAt: string;
}

export interface WhisperReel {
  id: string;
  authorId: string;
  authorHandle: string;
  authorAvatar: string;
  universityId: number;
  universityName: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  thumbnailUrl?: string;
  tags: string[];
  ephemeralMode: EphemeralDuration;
  expiresAt: string;
  createdAt: string;
  viewsCount: number;
  isViewGated: boolean; // Ephemeral blur gate until tapped
  isUnlocked: boolean;
  durationSeconds?: number;
  reactions: {
    fire: number;
    skull: number;
    cap: number;
    clown: number;
    fax: number;
  };
  userReactions: string[];
  commentsCount: number;
  comments: WhisperComment[];
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
  samplePreview: string;
  createdAt: string;
}

export type IssueCategory = 'Academics' | 'Facilities' | 'Security' | 'Administration' | 'Finance/Portal';
export type IssueStatus = 'open' | 'trending' | 'under_review' | 'resolved';

export interface CampusIssue {
  id: string;
  authorId: string;
  authorHandle: string;
  isDeepAnon: boolean;
  deepAnonPseudonym?: string;
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
  contentType: 'post' | 'resource' | 'issue' | 'message' | 'whisper';
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

export type TimeframePeriod = '24h' | '7d' | '30d' | 'semester';

export interface PolygraphCategoryMetrics {
  category: IssueCategory;
  incidentCount: number;
  percentage: number;
  velocityScore: number; // rate of growth
  trendingKeyword: string;
}

export interface UniversityGrievanceRank {
  rank: number;
  universityId: number;
  shortCode: string;
  universityName: string;
  topCategory: IssueCategory;
  grievancesCount: number;
  momentumIndex: number;
  resolvedRatePercent: number;
}
