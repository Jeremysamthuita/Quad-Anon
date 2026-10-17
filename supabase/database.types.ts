/**
 * supabase/database.types.ts
 *
 * Hand-written Database type definitions mirroring the Postgres schema.
 * These types make `supabase.from(...)` fully type-safe without requiring
 * the Supabase CLI or a live database connection at build time.
 *
 * Source of truth: supabase/migrations/*.sql
 * When a migration changes a table, update this file in the same PR.
 *
 * Naming convention:
 *   Row    — shape returned by SELECT *
 *   Insert — columns required / optional for INSERT
 *   Update — all columns optional (used with .update())
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'moderator' | 'admin';
export type ReactionType = 'fire' | 'skull' | 'cap' | 'clown' | 'fax';
export type MediaType = 'text' | 'image' | 'document' | 'video' | 'poll' | 'code';
export type IssueCategory = 'Facilities' | 'Academics' | 'Finance' | 'Security' | 'Administration';
export type IssueStatus = 'open' | 'under_review' | 'resolved';
export type ResourceCategory = 'Past Papers' | 'Lecture Notes' | 'Lab Reports' | 'Revision Guides';
export type ReportTargetType =
  | 'post'
  | 'whisper'
  | 'comment'
  | 'whisper_comment'
  | 'message'
  | 'resource'
  | 'issue';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';
export type TakedownStatus = 'pending' | 'actioned' | 'rejected';
export type MessageMediaType = 'text' | 'image' | 'voice';
export type TTLDuration = 'snap' | '1h' | '24h' | '1w';

// ─── Table Rows ────────────────────────────────────────────────────────────────

export interface UniversityRow {
  id: string;
  name: string;
  short_code: string;
  county: string;
  allowed_email_domains: string[];
  is_active: boolean;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  university_id: string;
  handle: string;
  avatar_style: string;
  role: UserRole;
  created_at: string;
  banned_at: string | null;
}

export interface EmailHashRow {
  id: string;
  hashed_email: string;
  university_id: string;
  created_at: string;
}

export interface PostRow {
  id: string;
  university_id: string;
  author_id: string;
  content_text: string;
  media_type: MediaType;
  media_url: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  expires_at: string;
  created_at: string;
  reactions_count: number;
  comments_count: number;
  hide_count: number;
  is_hidden: boolean;
}

export interface PostReactionRow {
  id: string;
  post_id: string;
  user_id: string;
  reaction: ReactionType;
  created_at: string;
}

export interface PollRow {
  id: string;
  post_id: string;
  question: string;
  created_at: string;
  total_votes: number;
}

export interface PollOptionRow {
  id: string;
  poll_id: string;
  label: string;
  sort_order: number;
  vote_count: number;
}

export interface PollVoteRow {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface WhisperRow {
  id: string;
  university_id: string;
  author_id: string;
  caption: string;
  media_url: string;
  media_type: 'image' | 'video';
  tags: string[];
  expires_at: string;
  created_at: string;
  reactions_count: number;
  comments_count: number;
  hide_count: number;
  is_hidden: boolean;
}

export interface WhisperReactionRow {
  id: string;
  whisper_id: string;
  user_id: string;
  reaction: ReactionType;
  created_at: string;
}

export interface WhisperCommentRow {
  id: string;
  whisper_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface ConversationRow {
  id: string;
  university_id: string;
  ttl_duration: TTLDuration;
  created_at: string;
  updated_at: string;
}

export interface ConversationMemberRow {
  id: string;
  conversation_id: string;
  user_id: string;
  last_read_at: string | null;
  joined_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_type: MessageMediaType;
  media_url: string | null;
  expires_at: string;
  view_once: boolean;
  viewed_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface IssueRow {
  id: string;
  university_id: string;
  author_id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  status_note: string | null;
  status_updated_at: string | null;
  status_updated_by: string | null;
  created_at: string;
  updated_at: string;
  upvotes_count: number;
  comments_count: number;
  hide_count: number;
  is_hidden: boolean;
}

export interface IssueUpvoteRow {
  id: string;
  issue_id: string;
  user_id: string;
  created_at: string;
}

export interface IssueCommentRow {
  id: string;
  issue_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface ResourceRow {
  id: string;
  university_id: string;
  uploader_id: string;
  course_code: string;
  faculty: string;
  title: string;
  description: string | null;
  category: ResourceCategory;
  file_url: string;
  file_size_bytes: number;
  mime_type: string;
  page_count: number;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  upvotes_count: number;
  downloads_count: number;
  hide_count: number;
  is_hidden_pending_review: boolean;
}

export interface ResourceVoteRow {
  id: string;
  resource_id: string;
  user_id: string;
  created_at: string;
}

export interface ResourceDownloadRow {
  id: string;
  resource_id: string;
  user_id: string;
  downloaded_at: string;
}

export interface ReportRow {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  reporter_id: string;
  notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface TakedownRequestRow {
  id: string;
  resource_id: string;
  claimant_name: string;
  claimant_email: string;
  reason: string;
  status: TakedownStatus;
  actioned_by: string | null;
  actioned_at: string | null;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  actor_handle: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

export interface RateLimitRow {
  id: string;
  user_id: string;
  action_type: string;
  window_start: string;
  count: number;
}

export interface BlockRow {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

// ─── Insert Shapes ────────────────────────────────────────────────────────────

export type PostInsert = Pick<
  PostRow,
  'university_id' | 'author_id' | 'content_text' | 'expires_at'
> &
  Partial<Pick<PostRow, 'media_type' | 'media_url' | 'file_name' | 'file_size_bytes'>>;

export type WhisperInsert = Pick<
  WhisperRow,
  'university_id' | 'author_id' | 'caption' | 'media_url' | 'media_type' | 'expires_at'
> &
  Partial<Pick<WhisperRow, 'tags'>>;

export type MessageInsert = Pick<
  MessageRow,
  'conversation_id' | 'sender_id' | 'content' | 'expires_at'
> &
  Partial<Pick<MessageRow, 'media_type' | 'media_url' | 'view_once'>>;

export type IssueInsert = Pick<
  IssueRow,
  'university_id' | 'author_id' | 'title' | 'description' | 'category'
>;

export type ResourceInsert = Pick<
  ResourceRow,
  | 'university_id'
  | 'uploader_id'
  | 'course_code'
  | 'faculty'
  | 'title'
  | 'category'
  | 'file_url'
  | 'file_size_bytes'
  | 'mime_type'
> &
  Partial<Pick<ResourceRow, 'description' | 'page_count'>>;

export type ReportInsert = Pick<ReportRow, 'target_type' | 'target_id' | 'reason' | 'reporter_id'>;

export type TakedownRequestInsert = Pick<
  TakedownRequestRow,
  'resource_id' | 'claimant_name' | 'claimant_email' | 'reason'
>;

export type BlockInsert = Pick<BlockRow, 'blocker_id' | 'blocked_id'>;

// ─── Supabase Database Shape ───────────────────────────────────────────────────
// Used as the generic type parameter for createClient<Database>()

export interface Database {
  public: {
    Tables: {
      universities: {
        Row: UniversityRow;
        Insert: Partial<UniversityRow> & Pick<UniversityRow, 'name' | 'short_code' | 'county' | 'allowed_email_domains'>;
        Update: Partial<UniversityRow>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: Pick<ProfileRow, 'id' | 'university_id' | 'handle'> & Partial<Pick<ProfileRow, 'avatar_style'>>;
        Update: Partial<Pick<ProfileRow, 'handle' | 'avatar_style'>>;
      };
      email_hashes: {
        Row: EmailHashRow;
        Insert: Pick<EmailHashRow, 'hashed_email' | 'university_id'>;
        Update: never;
      };
      posts: {
        Row: PostRow;
        Insert: PostInsert;
        Update: Partial<Pick<PostRow, 'content_text' | 'is_hidden'>>;
      };
      post_reactions: {
        Row: PostReactionRow;
        Insert: Pick<PostReactionRow, 'post_id' | 'user_id' | 'reaction'>;
        Update: never;
      };
      polls: {
        Row: PollRow;
        Insert: Pick<PollRow, 'post_id' | 'question'>;
        Update: never;
      };
      poll_options: {
        Row: PollOptionRow;
        Insert: Pick<PollOptionRow, 'poll_id' | 'label'> & Partial<Pick<PollOptionRow, 'sort_order'>>;
        Update: never;
      };
      poll_votes: {
        Row: PollVoteRow;
        Insert: Pick<PollVoteRow, 'poll_id' | 'option_id' | 'user_id'>;
        Update: never;
      };
      comments: {
        Row: CommentRow;
        Insert: Pick<CommentRow, 'post_id' | 'author_id' | 'content'>;
        Update: never;
      };
      whispers: {
        Row: WhisperRow;
        Insert: WhisperInsert;
        Update: Partial<Pick<WhisperRow, 'is_hidden'>>;
      };
      whisper_reactions: {
        Row: WhisperReactionRow;
        Insert: Pick<WhisperReactionRow, 'whisper_id' | 'user_id' | 'reaction'>;
        Update: never;
      };
      whisper_comments: {
        Row: WhisperCommentRow;
        Insert: Pick<WhisperCommentRow, 'whisper_id' | 'author_id' | 'content'>;
        Update: never;
      };
      conversations: {
        Row: ConversationRow;
        Insert: Pick<ConversationRow, 'university_id' | 'ttl_duration'>;
        Update: Partial<Pick<ConversationRow, 'updated_at'>>;
      };
      conversation_members: {
        Row: ConversationMemberRow;
        Insert: Pick<ConversationMemberRow, 'conversation_id' | 'user_id'>;
        Update: Partial<Pick<ConversationMemberRow, 'last_read_at'>>;
      };
      messages: {
        Row: MessageRow;
        Insert: MessageInsert;
        Update: Partial<Pick<MessageRow, 'viewed_at' | 'read_at'>>;
      };
      issues: {
        Row: IssueRow;
        Insert: IssueInsert;
        Update: Partial<
          Pick<IssueRow, 'status' | 'status_note' | 'status_updated_at' | 'status_updated_by' | 'is_hidden'>
        >;
      };
      issue_upvotes: {
        Row: IssueUpvoteRow;
        Insert: Pick<IssueUpvoteRow, 'issue_id' | 'user_id'>;
        Update: never;
      };
      issue_comments: {
        Row: IssueCommentRow;
        Insert: Pick<IssueCommentRow, 'issue_id' | 'author_id' | 'content'>;
        Update: never;
      };
      resources: {
        Row: ResourceRow;
        Insert: ResourceInsert;
        Update: Partial<
          Pick<ResourceRow, 'is_approved' | 'approved_by' | 'approved_at' | 'is_hidden_pending_review'>
        >;
      };
      resource_votes: {
        Row: ResourceVoteRow;
        Insert: Pick<ResourceVoteRow, 'resource_id' | 'user_id'>;
        Update: never;
      };
      resource_downloads: {
        Row: ResourceDownloadRow;
        Insert: Pick<ResourceDownloadRow, 'resource_id' | 'user_id'>;
        Update: never;
      };
      reports: {
        Row: ReportRow;
        Insert: ReportInsert;
        Update: Partial<Pick<ReportRow, 'status' | 'notes' | 'resolved_by' | 'resolved_at'>>;
      };
      takedown_requests: {
        Row: TakedownRequestRow;
        Insert: TakedownRequestInsert;
        Update: Partial<Pick<TakedownRequestRow, 'status' | 'actioned_by' | 'actioned_at'>>;
      };
      audit_logs: {
        Row: AuditLogRow;
        Insert: Pick<AuditLogRow, 'actor_handle' | 'action' | 'target_type' | 'target_id' | 'details'> &
          Partial<Pick<AuditLogRow, 'actor_id'>>;
        Update: never; // Immutable — trigger prevents updates
      };
      rate_limits: {
        Row: RateLimitRow;
        Insert: Pick<RateLimitRow, 'user_id' | 'action_type' | 'window_start'> &
          Partial<Pick<RateLimitRow, 'count'>>;
        Update: Partial<Pick<RateLimitRow, 'count'>>;
      };
      blocks: {
        Row: BlockRow;
        Insert: BlockInsert;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_auth_university_id: { Args: Record<string, never>; Returns: string };
      get_auth_role: { Args: Record<string, never>; Returns: UserRole };
      is_user_banned: { Args: Record<string, never>; Returns: boolean };
      admin_set_user_role: { Args: { target_user_id: string; new_role: UserRole }; Returns: void };
      purge_expired_content: {
        Args: Record<string, never>;
        Returns: { purged_at: string; deleted_messages: number; deleted_posts: number; deleted_whispers: number };
      };
      check_and_increment_rate_limit: {
        Args: { p_action_type: string; p_limit: number; p_window_secs: number };
        Returns: boolean;
      };
      search_resources: {
        Args: { p_query: string; p_limit?: number; p_offset?: number };
        Returns: ResourceRow[];
      };
    };
    Enums: {
      user_role: UserRole;
      reaction_type: ReactionType;
      media_type: MediaType;
      issue_category: IssueCategory;
      issue_status: IssueStatus;
      resource_category: ResourceCategory;
      report_target_type: ReportTargetType;
      report_status: ReportStatus;
      takedown_status: TakedownStatus;
    };
  };
}

