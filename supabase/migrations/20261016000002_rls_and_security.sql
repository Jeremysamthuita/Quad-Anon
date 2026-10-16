-- Migration: 20261016000002_rls_and_security.sql
-- Description: Complete Row Level Security (RLS) policies, helper functions, and role enforcement

-- 1. Helper Security Functions (STABLE, SECURITY DEFINER, search_path = public)
CREATE OR REPLACE FUNCTION public.get_auth_university_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT university_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_user_banned()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (banned_at IS NOT NULL) FROM profiles WHERE id = auth.uid();
$$;

-- Role change server function: Client CANNOT modify profile.role directly.
CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id UUID, new_role user_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT public.get_auth_role()) != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can update user roles';
  END IF;

  UPDATE profiles
  SET role = new_role
  WHERE id = target_user_id;

  INSERT INTO audit_logs (actor_id, actor_handle, action, target_type, target_id, details)
  SELECT auth.uid(), p.handle, 'UPDATE_ROLE', 'profile', target_user_id::text, format('Role changed to %s', new_role)
  FROM profiles p WHERE p.id = auth.uid();
END;
$$;

-- Protect role and banned_at from client modifications on profiles table
CREATE OR REPLACE FUNCTION public.protect_profile_system_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If invoked by normal user session (not service_role or admin function)
  IF (NEW.role IS DISTINCT FROM OLD.role) THEN
    IF current_setting('request.jwt.claim.role', true) != 'service_role' AND (SELECT public.get_auth_role()) != 'admin' THEN
      RAISE EXCEPTION 'Users cannot modify their own role';
    END IF;
  END IF;

  IF (NEW.banned_at IS DISTINCT FROM OLD.banned_at) THEN
    IF current_setting('request.jwt.claim.role', true) != 'service_role' AND (SELECT public.get_auth_role()) != 'admin' THEN
      RAISE EXCEPTION 'Users cannot modify ban status';
    END IF;
  END IF;

  IF (NEW.university_id IS DISTINCT FROM OLD.university_id) THEN
    RAISE EXCEPTION 'University assignment is immutable';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile ON profiles;
CREATE TRIGGER trg_protect_profile
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_system_columns();

-- 2. ENABLE ROW LEVEL SECURITY ON ALL 22 TABLES
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whispers ENABLE ROW LEVEL SECURITY;
ALTER TABLE whisper_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whisper_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE takedown_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES PER TABLE

-- universities: Read active universities; only admin can insert/update
CREATE POLICY universities_read_active ON universities
FOR SELECT USING (is_active = true OR public.get_auth_role() = 'admin');

CREATE POLICY universities_admin_write ON universities
FOR ALL USING (public.get_auth_role() = 'admin');

-- profiles: Read profiles in the same university. Update only own handle & avatar.
CREATE POLICY profiles_read_campus ON profiles
FOR SELECT USING (
  university_id = public.get_auth_university_id()
  OR public.get_auth_role() IN ('moderator', 'admin')
);

CREATE POLICY profiles_insert_self ON profiles
FOR INSERT WITH CHECK (
  id = auth.uid()
  AND role = 'student'
  AND banned_at IS NULL
);

CREATE POLICY profiles_update_self ON profiles
FOR UPDATE USING (
  id = auth.uid()
  AND public.is_user_banned() IS NOT TRUE
) WITH CHECK (
  id = auth.uid()
);

-- email_hashes: Only accessible by service role or internal auth trigger
CREATE POLICY email_hashes_admin_only ON email_hashes
FOR ALL USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- posts: Expired content filtered in policy (expires_at > now())
CREATE POLICY posts_read_active_campus ON posts
FOR SELECT USING (
  university_id = public.get_auth_university_id()
  AND expires_at > now()
);

CREATE POLICY posts_insert_self ON posts
FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND university_id = public.get_auth_university_id()
  AND public.is_user_banned() IS NOT TRUE
  AND expires_at > now()
);

CREATE POLICY posts_update_author_or_mod ON posts
FOR UPDATE USING (
  (author_id = auth.uid() AND expires_at > now() AND public.is_user_banned() IS NOT TRUE)
  OR public.get_auth_role() IN ('moderator', 'admin')
);

CREATE POLICY posts_delete_author_or_mod ON posts
FOR DELETE USING (
  author_id = auth.uid()
  OR public.get_auth_role() IN ('moderator', 'admin')
);

-- post_reactions: Only 1 per user (enforced by DB unique index), same campus, unexpired post
CREATE POLICY post_reactions_read_campus ON post_reactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM posts p
    WHERE p.id = post_reactions.post_id
      AND p.university_id = public.get_auth_university_id()
      AND p.expires_at > now()
  )
);

CREATE POLICY post_reactions_insert_self ON post_reactions
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND public.is_user_banned() IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM posts p
    WHERE p.id = post_reactions.post_id
      AND p.university_id = public.get_auth_university_id()
      AND p.expires_at > now()
  )
);

CREATE POLICY post_reactions_delete_self ON post_reactions
FOR DELETE USING (
  user_id = auth.uid()
);

-- polls & options: Linked to unexpired post
CREATE POLICY polls_read_active ON polls
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM posts p
    WHERE p.id = polls.post_id
      AND p.university_id = public.get_auth_university_id()
      AND p.expires_at > now()
  )
);

CREATE POLICY polls_insert_post_author ON polls
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM posts p
    WHERE p.id = polls.post_id
      AND p.author_id = auth.uid()
      AND p.expires_at > now()
  )
);

CREATE POLICY poll_options_read_active ON poll_options
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polls pol
    JOIN posts p ON p.id = pol.post_id
    WHERE pol.id = poll_options.poll_id
      AND p.university_id = public.get_auth_university_id()
      AND p.expires_at > now()
  )
);

CREATE POLICY poll_options_insert_post_author ON poll_options
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM polls pol
    JOIN posts p ON p.id = pol.post_id
    WHERE pol.id = poll_options.poll_id
      AND p.author_id = auth.uid()
  )
);

CREATE POLICY poll_votes_read ON poll_votes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM polls pol
    JOIN posts p ON p.id = pol.post_id
    WHERE pol.id = poll_votes.poll_id
      AND p.university_id = public.get_auth_university_id()
      AND p.expires_at > now()
  )
);

CREATE POLICY poll_votes_insert_self ON poll_votes
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND public.is_user_banned() IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM polls pol
    JOIN posts p ON p.id = pol.post_id
    WHERE pol.id = poll_votes.poll_id
      AND p.university_id = public.get_auth_university_id()
      AND p.expires_at > now()
  )
);

-- comments: unexpired posts in campus
CREATE POLICY comments_read_active ON comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM posts p
    WHERE p.id = comments.post_id
      AND p.university_id = public.get_auth_university_id()
      AND p.expires_at > now()
  )
);

CREATE POLICY comments_insert_self ON comments
FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND public.is_user_banned() IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM posts p
    WHERE p.id = comments.post_id
      AND p.university_id = public.get_auth_university_id()
      AND p.expires_at > now()
  )
);

CREATE POLICY comments_delete_author_or_mod ON comments
FOR DELETE USING (
  author_id = auth.uid()
  OR public.get_auth_role() IN ('moderator', 'admin')
);

-- whispers: Expired content filtered in policy (expires_at > now())
CREATE POLICY whispers_read_active_campus ON whispers
FOR SELECT USING (
  university_id = public.get_auth_university_id()
  AND expires_at > now()
);

CREATE POLICY whispers_insert_self ON whispers
FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND university_id = public.get_auth_university_id()
  AND public.is_user_banned() IS NOT TRUE
  AND expires_at > now()
);

CREATE POLICY whispers_delete_author_or_mod ON whispers
FOR DELETE USING (
  author_id = auth.uid()
  OR public.get_auth_role() IN ('moderator', 'admin')
);

-- whisper_reactions: Strictly 1 per user, unexpired whisper
CREATE POLICY whisper_reactions_read_campus ON whisper_reactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM whispers w
    WHERE w.id = whisper_reactions.whisper_id
      AND w.university_id = public.get_auth_university_id()
      AND w.expires_at > now()
  )
);

CREATE POLICY whisper_reactions_insert_self ON whisper_reactions
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND public.is_user_banned() IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM whispers w
    WHERE w.id = whisper_reactions.whisper_id
      AND w.university_id = public.get_auth_university_id()
      AND w.expires_at > now()
  )
);

CREATE POLICY whisper_reactions_delete_self ON whisper_reactions
FOR DELETE USING (
  user_id = auth.uid()
);

-- whisper_comments: Unexpired whisper
CREATE POLICY whisper_comments_read_active ON whisper_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM whispers w
    WHERE w.id = whisper_comments.whisper_id
      AND w.university_id = public.get_auth_university_id()
      AND w.expires_at > now()
  )
);

CREATE POLICY whisper_comments_insert_self ON whisper_comments
FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND public.is_user_banned() IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM whispers w
    WHERE w.id = whisper_comments.whisper_id
      AND w.university_id = public.get_auth_university_id()
      AND w.expires_at > now()
  )
);

CREATE POLICY whisper_comments_delete_author_or_mod ON whisper_comments
FOR DELETE USING (
  author_id = auth.uid()
  OR public.get_auth_role() IN ('moderator', 'admin')
);

-- conversations: Only conversation members can see conversation
CREATE POLICY conversations_read_members ON conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_members cm
    WHERE cm.conversation_id = conversations.id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY conversations_insert_members ON conversations
FOR INSERT WITH CHECK (
  university_id = public.get_auth_university_id()
  AND public.is_user_banned() IS NOT TRUE
);

-- conversation_members:
CREATE POLICY conversation_members_read ON conversation_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_members cm2
    WHERE cm2.conversation_id = conversation_members.conversation_id
      AND cm2.user_id = auth.uid()
  )
);

CREATE POLICY conversation_members_insert ON conversation_members
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM conversation_members cm2
    WHERE cm2.conversation_id = conversation_members.conversation_id
      AND cm2.user_id = auth.uid()
  )
);

-- messages: Only conversation members, expires_at > now(), view_once enforcement
CREATE POLICY messages_read_members_unexpired ON messages
FOR SELECT USING (
  expires_at > now()
  AND (view_once IS FALSE OR viewed_at IS NULL OR sender_id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY messages_insert_member ON messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND public.is_user_banned() IS NOT TRUE
  AND expires_at > now()
  AND EXISTS (
    SELECT 1 FROM conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY messages_update_viewed_read ON messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id
      AND cm.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id
      AND cm.user_id = auth.uid()
  )
);

-- issues (The Radar): Campus-scoped
CREATE POLICY issues_read_campus ON issues
FOR SELECT USING (
  university_id = public.get_auth_university_id()
  OR public.get_auth_role() IN ('moderator', 'admin')
);

CREATE POLICY issues_insert_self ON issues
FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND university_id = public.get_auth_university_id()
  AND public.is_user_banned() IS NOT TRUE
);

CREATE POLICY issues_update_author_or_mod ON issues
FOR UPDATE USING (
  author_id = auth.uid()
  OR public.get_auth_role() IN ('moderator', 'admin')
);

CREATE POLICY issues_delete_mod_or_admin ON issues
FOR DELETE USING (
  public.get_auth_role() IN ('moderator', 'admin')
);

-- issue_upvotes: 1 per user per issue, same campus
CREATE POLICY issue_upvotes_read_campus ON issue_upvotes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM issues i
    WHERE i.id = issue_upvotes.issue_id
      AND i.university_id = public.get_auth_university_id()
  )
);

CREATE POLICY issue_upvotes_insert_self ON issue_upvotes
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND public.is_user_banned() IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM issues i
    WHERE i.id = issue_upvotes.issue_id
      AND i.university_id = public.get_auth_university_id()
  )
);

CREATE POLICY issue_upvotes_delete_self ON issue_upvotes
FOR DELETE USING (
  user_id = auth.uid()
);

-- issue_comments:
CREATE POLICY issue_comments_read_campus ON issue_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM issues i
    WHERE i.id = issue_comments.issue_id
      AND i.university_id = public.get_auth_university_id()
  )
);

CREATE POLICY issue_comments_insert_self ON issue_comments
FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND public.is_user_banned() IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM issues i
    WHERE i.id = issue_comments.issue_id
      AND i.university_id = public.get_auth_university_id()
  )
);

CREATE POLICY issue_comments_delete_author_or_mod ON issue_comments
FOR DELETE USING (
  author_id = auth.uid()
  OR public.get_auth_role() IN ('moderator', 'admin')
);

-- resources (The Library):
CREATE POLICY resources_read_campus ON resources
FOR SELECT USING (
  university_id = public.get_auth_university_id()
  AND (is_approved = true OR uploader_id = auth.uid() OR public.get_auth_role() IN ('moderator', 'admin'))
);

CREATE POLICY resources_insert_self ON resources
FOR INSERT WITH CHECK (
  uploader_id = auth.uid()
  AND university_id = public.get_auth_university_id()
  AND is_approved = false
  AND public.is_user_banned() IS NOT TRUE
);

CREATE POLICY resources_update_mod_or_uploader ON resources
FOR UPDATE USING (
  (uploader_id = auth.uid() AND is_approved = false)
  OR public.get_auth_role() IN ('moderator', 'admin')
);

CREATE POLICY resources_delete_uploader_or_mod ON resources
FOR DELETE USING (
  (uploader_id = auth.uid() AND is_approved = false)
  OR public.get_auth_role() IN ('moderator', 'admin')
);

-- resource_votes: 1 vote per user
CREATE POLICY resource_votes_read_campus ON resource_votes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM resources r
    WHERE r.id = resource_votes.resource_id
      AND r.university_id = public.get_auth_university_id()
  )
);

CREATE POLICY resource_votes_insert_self ON resource_votes
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND public.is_user_banned() IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM resources r
    WHERE r.id = resource_votes.resource_id
      AND r.university_id = public.get_auth_university_id()
      AND r.is_approved = true
  )
);

CREATE POLICY resource_votes_delete_self ON resource_votes
FOR DELETE USING (
  user_id = auth.uid()
);

-- resource_downloads:
CREATE POLICY resource_downloads_read ON resource_downloads
FOR SELECT USING (
  user_id = auth.uid()
  OR public.get_auth_role() IN ('moderator', 'admin')
  OR EXISTS (
    SELECT 1 FROM resources r
    WHERE r.id = resource_downloads.resource_id
      AND r.uploader_id = auth.uid()
  )
);

CREATE POLICY resource_downloads_insert_self ON resource_downloads
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND public.is_user_banned() IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM resources r
    WHERE r.id = resource_downloads.resource_id
      AND r.university_id = public.get_auth_university_id()
      AND r.is_approved = true
  )
);

-- reports:
CREATE POLICY reports_read_reporter_or_staff ON reports
FOR SELECT USING (
  reporter_id = auth.uid()
  OR public.get_auth_role() IN ('moderator', 'admin')
);

CREATE POLICY reports_insert_self ON reports
FOR INSERT WITH CHECK (
  reporter_id = auth.uid()
  AND status = 'pending'
);

CREATE POLICY reports_update_staff ON reports
FOR UPDATE USING (
  public.get_auth_role() IN ('moderator', 'admin')
);

-- takedown_requests:
CREATE POLICY takedown_requests_read_staff ON takedown_requests
FOR SELECT USING (
  public.get_auth_role() IN ('moderator', 'admin')
);

CREATE POLICY takedown_requests_insert_public ON takedown_requests
FOR INSERT WITH CHECK (
  status = 'pending'
);

CREATE POLICY takedown_requests_update_admin ON takedown_requests
FOR UPDATE USING (
  public.get_auth_role() = 'admin'
);

-- audit_logs: Read only by admin. Inserts only through security definer functions/triggers.
CREATE POLICY audit_logs_read_admin ON audit_logs
FOR SELECT USING (
  public.get_auth_role() = 'admin'
);

-- rate_limits: Users can read and insert their own rate counter entries
CREATE POLICY rate_limits_self ON rate_limits
FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);
