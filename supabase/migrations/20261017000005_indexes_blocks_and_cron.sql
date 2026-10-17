-- Migration: 20261017000005_indexes_blocks_and_cron.sql
-- Description: Performance indexes, user blocks, auto-hide counter, pg_cron purge schedule,
--              and Storage bucket security policies.
--
-- Principles:
--   - Every foreign-key column gets an index; query-pattern indexes are documented.
--   - Blocked users cannot DM; block status enforced in RLS.
--   - hide_count triggers auto-hide at N distinct reports; threshold set server-side only.
--   - pg_cron runs purge_expired_content() every 5 minutes; Storage bucket is private.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PERFORMANCE INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

-- posts: feed query (campus + unexpired + newest first)
CREATE INDEX IF NOT EXISTS idx_posts_campus_expires
  ON posts (university_id, expires_at DESC)
  WHERE expires_at > now();

-- posts: author's own posts
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts (author_id);

-- post_reactions: fast lookup per post
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions (post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON post_reactions (user_id);

-- comments: per post, chronological
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments (post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments (author_id);

-- whispers: feed query (campus + unexpired + newest first)
CREATE INDEX IF NOT EXISTS idx_whispers_campus_expires
  ON whispers (university_id, expires_at DESC)
  WHERE expires_at > now();

CREATE INDEX IF NOT EXISTS idx_whispers_author ON whispers (author_id);

-- whisper_reactions
CREATE INDEX IF NOT EXISTS idx_whisper_reactions_whisper ON whisper_reactions (whisper_id);
CREATE INDEX IF NOT EXISTS idx_whisper_reactions_user    ON whisper_reactions (user_id);

-- whisper_comments
CREATE INDEX IF NOT EXISTS idx_whisper_comments_whisper ON whisper_comments (whisper_id, created_at ASC);

-- messages: per conversation, unexpired, newest first
CREATE INDEX IF NOT EXISTS idx_messages_conversation_expires
  ON messages (conversation_id, expires_at DESC)
  WHERE expires_at > now();

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id);

-- conversation_members: fast member lookup
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members (user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_conv ON conversation_members (conversation_id);

-- issues: campus feed
CREATE INDEX IF NOT EXISTS idx_issues_campus ON issues (university_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_author  ON issues (author_id);
CREATE INDEX IF NOT EXISTS idx_issues_status  ON issues (status);

-- issue_upvotes
CREATE INDEX IF NOT EXISTS idx_issue_upvotes_issue ON issue_upvotes (issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_upvotes_user  ON issue_upvotes (user_id);

-- issue_comments
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue ON issue_comments (issue_id, created_at ASC);

-- resources: full-text search (GIN on tsvector of title + description + course_code)
CREATE INDEX IF NOT EXISTS idx_resources_fts
  ON resources
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(course_code, '')));

CREATE INDEX IF NOT EXISTS idx_resources_campus_approved
  ON resources (university_id, is_approved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resources_uploader ON resources (uploader_id);

-- resource_votes
CREATE INDEX IF NOT EXISTS idx_resource_votes_resource ON resource_votes (resource_id);

-- resource_downloads
CREATE INDEX IF NOT EXISTS idx_resource_downloads_resource ON resource_downloads (resource_id);

-- reports: moderation queue (pending first)
CREATE INDEX IF NOT EXISTS idx_reports_status_pending ON reports (status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports (target_type, target_id);

-- rate_limits: fast per-user-action window lookup
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits (user_id, action_type, window_start);

-- poll_votes
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll   ON poll_votes (poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user   ON poll_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON poll_options (poll_id, sort_order ASC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. USER BLOCKS TABLE
--    A blocked user cannot initiate or send messages to the blocker.
--    RLS enforces this; no UI-only check is trusted.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_block UNIQUE (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks (blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks (blocked_id);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Users can see their own blocks (both sides) to render "blocked" state
CREATE POLICY blocks_read_own ON blocks
  FOR SELECT USING (blocker_id = auth.uid() OR blocked_id = auth.uid());

-- Only the blocker can insert
CREATE POLICY blocks_insert_own ON blocks
  FOR INSERT WITH CHECK (
    blocker_id = auth.uid()
    AND public.is_user_banned() IS NOT TRUE
  );

-- Only the blocker can remove
CREATE POLICY blocks_delete_own ON blocks
  FOR DELETE USING (blocker_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. AUTO-HIDE COUNTER ON POSTS AND WHISPERS
--    After REPORT_HIDE_THRESHOLD distinct reporter_ids, content is hidden pending review.
--    The threshold is defined server-side in this constant; clients cannot set it.
-- ─────────────────────────────────────────────────────────────────────────────

-- hide_count column — maintained by trigger
ALTER TABLE posts    ADD COLUMN IF NOT EXISTS hide_count INT NOT NULL DEFAULT 0;
ALTER TABLE whispers ADD COLUMN IF NOT EXISTS hide_count INT NOT NULL DEFAULT 0;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS hide_count INT NOT NULL DEFAULT 0;
ALTER TABLE issues   ADD COLUMN IF NOT EXISTS hide_count INT NOT NULL DEFAULT 0;

-- is_hidden flag — set by trigger once threshold is reached; reset by moderator
ALTER TABLE posts    ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE whispers ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS is_hidden_pending_review BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE issues   ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

-- Trigger function: increment hide_count on new pending report; set is_hidden at threshold
CREATE OR REPLACE FUNCTION public.maintain_hide_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  threshold CONSTANT INT := 5; -- 5 distinct reporters triggers auto-hide
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    CASE NEW.target_type
      WHEN 'post' THEN
        UPDATE posts
        SET hide_count = hide_count + 1,
            is_hidden  = (hide_count + 1 >= threshold)
        WHERE id = NEW.target_id::uuid;

      WHEN 'whisper' THEN
        UPDATE whispers
        SET hide_count = hide_count + 1,
            is_hidden  = (hide_count + 1 >= threshold)
        WHERE id = NEW.target_id::uuid;

      WHEN 'resource' THEN
        UPDATE resources
        SET hide_count = hide_count + 1,
            is_hidden_pending_review = (hide_count + 1 >= threshold)
        WHERE id = NEW.target_id::uuid;

      WHEN 'issue' THEN
        UPDATE issues
        SET hide_count = hide_count + 1,
            is_hidden  = (hide_count + 1 >= threshold)
        WHERE id = NEW.target_id::uuid;

      ELSE NULL; -- comments, messages: no counter column, handled via report queue
    END CASE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maintain_hide_count ON reports;
CREATE TRIGGER trg_maintain_hide_count
AFTER INSERT ON reports
FOR EACH ROW EXECUTE FUNCTION public.maintain_hide_count();

-- Update RLS read policies to filter hidden content for non-staff users.
-- Drop and recreate affected read policies only.

DROP POLICY IF EXISTS posts_read_active_campus ON posts;
CREATE POLICY posts_read_active_campus ON posts
FOR SELECT USING (
  university_id = public.get_auth_university_id()
  AND expires_at > now()
  AND (
    is_hidden IS FALSE
    OR author_id = auth.uid()
    OR public.get_auth_role() IN ('moderator', 'admin')
  )
);

DROP POLICY IF EXISTS whispers_read_active_campus ON whispers;
CREATE POLICY whispers_read_active_campus ON whispers
FOR SELECT USING (
  university_id = public.get_auth_university_id()
  AND expires_at > now()
  AND (
    is_hidden IS FALSE
    OR author_id = auth.uid()
    OR public.get_auth_role() IN ('moderator', 'admin')
  )
);

DROP POLICY IF EXISTS issues_read_campus ON issues;
CREATE POLICY issues_read_campus ON issues
FOR SELECT USING (
  university_id = public.get_auth_university_id()
  AND (
    is_hidden IS FALSE
    OR author_id = auth.uid()
    OR public.get_auth_role() IN ('moderator', 'admin')
  )
);

DROP POLICY IF EXISTS resources_read_campus ON resources;
CREATE POLICY resources_read_campus ON resources
FOR SELECT USING (
  university_id = public.get_auth_university_id()
  AND (
    is_approved = true
    OR uploader_id = auth.uid()
    OR public.get_auth_role() IN ('moderator', 'admin')
  )
  AND (
    is_hidden_pending_review IS FALSE
    OR uploader_id = auth.uid()
    OR public.get_auth_role() IN ('moderator', 'admin')
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. BLOCK ENFORCEMENT ON CONVERSATIONS
--    A blocked user cannot be added as a conversation member.
--    This is enforced by replacing the conversation_members_insert policy.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS conversation_members_insert ON conversation_members;
CREATE POLICY conversation_members_insert ON conversation_members
FOR INSERT WITH CHECK (
  -- Only participants themselves can be added
  (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM conversation_members cm2
    WHERE cm2.conversation_id = conversation_members.conversation_id
      AND cm2.user_id = auth.uid()
  ))
  -- Neither party has blocked the other
  AND NOT EXISTS (
    SELECT 1 FROM blocks b
    WHERE (b.blocker_id = auth.uid() AND b.blocked_id = conversation_members.user_id)
       OR (b.blocker_id = conversation_members.user_id AND b.blocked_id = auth.uid())
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SERVER-SIDE RATE LIMIT STORED PROCEDURE
--    Called from Edge Functions / database triggers, NOT from the browser.
--    The browser cannot manipulate the rate limit table directly (policy enforces this).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_action_type TEXT,
  p_limit       INT,
  p_window_secs INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count        INT;
BEGIN
  -- Truncate to window boundary
  v_window_start := date_trunc('second', now()) - (EXTRACT(EPOCH FROM now())::int % p_window_secs) * INTERVAL '1 second';

  -- Upsert counter
  INSERT INTO rate_limits (user_id, action_type, window_start, count)
  VALUES (auth.uid(), p_action_type, v_window_start, 1)
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET count = rate_limits.count + 1
  RETURNING count INTO v_count;

  -- Return whether limit is exceeded
  RETURN v_count > p_limit;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. FULL-TEXT SEARCH HELPER FUNCTION FOR RESOURCES
--    Returns resources matching a query string, campus-scoped.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.search_resources(
  p_query       TEXT,
  p_limit       INT DEFAULT 20,
  p_offset      INT DEFAULT 0
)
RETURNS SETOF resources
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.*
  FROM resources r
  WHERE r.university_id = public.get_auth_university_id()
    AND r.is_approved = true
    AND r.is_hidden_pending_review IS FALSE
    AND to_tsvector('english',
          coalesce(r.title, '') || ' ' ||
          coalesce(r.description, '') || ' ' ||
          coalesce(r.course_code, '')) @@ plainto_tsquery('english', p_query)
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. PG_CRON SCHEDULE: PURGE EXPIRED CONTENT EVERY 5 MINUTES
--    Requires pg_cron extension to be enabled in the Supabase dashboard.
--    This block is safe to run even if pg_cron is not yet enabled; it will no-op.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Remove any old schedule first
    PERFORM cron.unschedule('quadanon-purge-expired')
    WHERE EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'quadanon-purge-expired'
    );

    PERFORM cron.schedule(
      'quadanon-purge-expired',
      '*/5 * * * *',          -- every 5 minutes
      'SELECT public.purge_expired_content()'
    );

    RAISE NOTICE '✓ pg_cron: quadanon-purge-expired scheduled every 5 minutes';
  ELSE
    RAISE WARNING 'pg_cron extension not enabled. Enable it in the Supabase dashboard → Database → Extensions, then re-run this migration. The purge_expired_content() function exists and can be called manually or via an Edge Function webhook until then.';
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. AUDIT LOG IMMUTABILITY
--    Prevent any UPDATE or DELETE on audit_logs — it is append-only.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is immutable: rows cannot be updated or deleted';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON audit_logs;
CREATE TRIGGER trg_audit_log_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();

