-- Migration: 20261016000003_triggers_and_counters.sql
-- Description: Trigger-maintained atomic counters, timestamps, and server-side TTL purge logic

-- 1. Counter Columns on Target Tables
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS reactions_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INT NOT NULL DEFAULT 0;

ALTER TABLE whispers
  ADD COLUMN IF NOT EXISTS reactions_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INT NOT NULL DEFAULT 0;

ALTER TABLE polls
  ADD COLUMN IF NOT EXISTS total_votes INT NOT NULL DEFAULT 0;

ALTER TABLE poll_options
  ADD COLUMN IF NOT EXISTS vote_count INT NOT NULL DEFAULT 0;

ALTER TABLE issues
  ADD COLUMN IF NOT EXISTS upvotes_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INT NOT NULL DEFAULT 0;

ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS upvotes_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downloads_count INT NOT NULL DEFAULT 0;

-- 2. Generic Increment/Decrement Helper Functions
CREATE OR REPLACE FUNCTION public.maintain_post_reaction_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET reactions_count = reactions_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET reactions_count = GREATEST(0, reactions_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_reaction_count ON post_reactions;
CREATE TRIGGER trg_post_reaction_count
AFTER INSERT OR DELETE ON post_reactions
FOR EACH ROW EXECUTE FUNCTION public.maintain_post_reaction_count();

CREATE OR REPLACE FUNCTION public.maintain_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_comment_count ON comments;
CREATE TRIGGER trg_post_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION public.maintain_post_comment_count();

CREATE OR REPLACE FUNCTION public.maintain_whisper_reaction_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE whispers SET reactions_count = reactions_count + 1 WHERE id = NEW.whisper_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE whispers SET reactions_count = GREATEST(0, reactions_count - 1) WHERE id = OLD.whisper_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_whisper_reaction_count ON whisper_reactions;
CREATE TRIGGER trg_whisper_reaction_count
AFTER INSERT OR DELETE ON whisper_reactions
FOR EACH ROW EXECUTE FUNCTION public.maintain_whisper_reaction_count();

CREATE OR REPLACE FUNCTION public.maintain_whisper_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE whispers SET comments_count = comments_count + 1 WHERE id = NEW.whisper_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE whispers SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.whisper_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_whisper_comment_count ON whisper_comments;
CREATE TRIGGER trg_whisper_comment_count
AFTER INSERT OR DELETE ON whisper_comments
FOR EACH ROW EXECUTE FUNCTION public.maintain_whisper_comment_count();

CREATE OR REPLACE FUNCTION public.maintain_poll_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE polls SET total_votes = total_votes + 1 WHERE id = NEW.poll_id;
    UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = NEW.option_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE polls SET total_votes = GREATEST(0, total_votes - 1) WHERE id = OLD.poll_id;
    UPDATE poll_options SET vote_count = GREATEST(0, vote_count - 1) WHERE id = OLD.option_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_poll_vote_count ON poll_votes;
CREATE TRIGGER trg_poll_vote_count
AFTER INSERT OR DELETE ON poll_votes
FOR EACH ROW EXECUTE FUNCTION public.maintain_poll_vote_count();

CREATE OR REPLACE FUNCTION public.maintain_issue_upvotes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE issues SET upvotes_count = upvotes_count + 1 WHERE id = NEW.issue_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE issues SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = OLD.issue_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_issue_upvotes_count ON issue_upvotes;
CREATE TRIGGER trg_issue_upvotes_count
AFTER INSERT OR DELETE ON issue_upvotes
FOR EACH ROW EXECUTE FUNCTION public.maintain_issue_upvotes_count();

CREATE OR REPLACE FUNCTION public.maintain_issue_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE issues SET comments_count = comments_count + 1 WHERE id = NEW.issue_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE issues SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.issue_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_issue_comments_count ON issue_comments;
CREATE TRIGGER trg_issue_comments_count
AFTER INSERT OR DELETE ON issue_comments
FOR EACH ROW EXECUTE FUNCTION public.maintain_issue_comments_count();

CREATE OR REPLACE FUNCTION public.maintain_resource_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE resources SET upvotes_count = upvotes_count + 1 WHERE id = NEW.resource_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE resources SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = OLD.resource_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_resource_votes_count ON resource_votes;
CREATE TRIGGER trg_resource_votes_count
AFTER INSERT OR DELETE ON resource_votes
FOR EACH ROW EXECUTE FUNCTION public.maintain_resource_counters();

CREATE OR REPLACE FUNCTION public.maintain_resource_downloads_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE resources SET downloads_count = downloads_count + 1 WHERE id = NEW.resource_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_resource_downloads_count ON resource_downloads;
CREATE TRIGGER trg_resource_downloads_count
AFTER INSERT ON resource_downloads
FOR EACH ROW EXECUTE FUNCTION public.maintain_resource_downloads_count();

-- 3. Conversation Timestamp Updater
CREATE OR REPLACE FUNCTION public.update_conversation_on_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_conversation_timestamp ON messages;
CREATE TRIGGER trg_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_new_message();

-- 4. Server-Side TTL Purge Function (Can be scheduled via pg_cron or Edge Function webhook)
CREATE OR REPLACE FUNCTION public.purge_expired_content()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_messages INT;
  deleted_posts INT;
  deleted_whispers INT;
BEGIN
  DELETE FROM messages WHERE expires_at <= now() OR (view_once = true AND viewed_at IS NOT NULL AND viewed_at < now() - INTERVAL '10 seconds');
  GET DIAGNOSTICS deleted_messages = ROW_COUNT;

  DELETE FROM posts WHERE expires_at <= now();
  GET DIAGNOSTICS deleted_posts = ROW_COUNT;

  DELETE FROM whispers WHERE expires_at <= now();
  GET DIAGNOSTICS deleted_whispers = ROW_COUNT;

  RETURN jsonb_build_object(
    'purged_at', now(),
    'deleted_messages', deleted_messages,
    'deleted_posts', deleted_posts,
    'deleted_whispers', deleted_whispers
  );
END;
$$;
