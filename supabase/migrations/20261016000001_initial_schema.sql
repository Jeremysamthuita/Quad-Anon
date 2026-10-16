-- Migration: 20261016000001_initial_schema.sql
-- Description: Core Schema for QuadAnon (Pseudonymous Campus Network)
-- Principles: No fake data, strict database constraints, server-enforced TTLs, immutable audit logs.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'moderator', 'admin');
CREATE TYPE reaction_type AS ENUM ('fire', 'skull', 'cap', 'clown', 'fax');
CREATE TYPE media_type AS ENUM ('text', 'image', 'document', 'video', 'poll', 'code');
CREATE TYPE issue_category AS ENUM ('Facilities', 'Academics', 'Finance', 'Security', 'Administration');
CREATE TYPE issue_status AS ENUM ('open', 'under_review', 'resolved');
CREATE TYPE resource_category AS ENUM ('Past Papers', 'Lecture Notes', 'Lab Reports', 'Revision Guides');
CREATE TYPE report_target_type AS ENUM ('post', 'whisper', 'comment', 'whisper_comment', 'message', 'resource', 'issue');
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
CREATE TYPE takedown_status AS ENUM ('pending', 'actioned', 'rejected');

-- 1. Universities (Verified launch campus only, no invented domains)
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_code TEXT NOT NULL UNIQUE,
    county TEXT NOT NULL,
    allowed_email_domains TEXT[] NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Launch Campus (The Co-operative University of Kenya - verified domains)
INSERT INTO universities (id, name, short_code, county, allowed_email_domains, is_active)
VALUES (
    'e5b7c844-3c66-41f2-95f3-7033cb21a4f1',
    'The Co-operative University of Kenya',
    'CUK',
    'Nairobi',
    ARRAY['cuk.ac.ke', 'student.cuk.ac.ke'],
    true
) ON CONFLICT (short_code) DO NOTHING;

-- 2. Profiles (Pseudonymous profile, strictly NO plaintext email, real name, or phone number)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
    handle TEXT NOT NULL,
    avatar_style TEXT NOT NULL DEFAULT 'phantom_ghostling',
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    banned_at TIMESTAMPTZ DEFAULT NULL,
    CONSTRAINT handle_format CHECK (handle ~ '^[A-Za-z0-9_]{3,24}$'),
    CONSTRAINT uq_university_handle UNIQUE (university_id, handle)
);

-- 3. Email Hashes (Keyed hash preventing duplicate accounts without storing plaintext email)
CREATE TABLE email_hashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hashed_email TEXT NOT NULL UNIQUE,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Posts (The Quad)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_text TEXT NOT NULL CHECK (char_length(content_text) <= 3000),
    media_type media_type NOT NULL DEFAULT 'text',
    media_url TEXT,
    file_name TEXT,
    file_size_bytes BIGINT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Post Reactions (Strictly ONE reaction per user per post enforced by UNIQUE constraint)
CREATE TABLE post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reaction reaction_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_post_user_reaction UNIQUE (post_id, user_id)
);

-- 6. Polls & Poll Votes
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    question TEXT NOT NULL CHECK (char_length(question) <= 280),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    label TEXT NOT NULL CHECK (char_length(label) <= 120),
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_poll_user_vote UNIQUE (poll_id, user_id)
);

-- 7. Post Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Whispers (Short-lived media reels)
CREATE TABLE whispers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    caption TEXT NOT NULL CHECK (char_length(caption) <= 500),
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    tags TEXT[] DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Whisper Reactions (Strictly ONE reaction per user per whisper enforced by UNIQUE constraint)
CREATE TABLE whisper_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whisper_id UUID NOT NULL REFERENCES whispers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reaction reaction_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_whisper_user_reaction UNIQUE (whisper_id, user_id)
);

-- 10. Whisper Comments
CREATE TABLE whisper_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whisper_id UUID NOT NULL REFERENCES whispers(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Conversations & Members (Shadow DMs)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    ttl_duration TEXT NOT NULL CHECK (ttl_duration IN ('snap', '1h', '24h', '1w')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_conversation_member UNIQUE (conversation_id, user_id)
);

-- 12. Messages (Shadow DMs messages with real server-enforced expiration)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    media_type TEXT NOT NULL DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'voice')),
    media_url TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    view_once BOOLEAN NOT NULL DEFAULT false,
    viewed_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Issues (The Radar)
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) <= 150),
    description TEXT NOT NULL CHECK (char_length(description) <= 3000),
    category issue_category NOT NULL,
    status issue_status NOT NULL DEFAULT 'open',
    status_note TEXT,
    status_updated_at TIMESTAMPTZ,
    status_updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Issue Upvotes (Strictly ONE upvote per user per issue)
CREATE TABLE issue_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_issue_user_upvote UNIQUE (issue_id, user_id)
);

-- 15. Issue Comments
CREATE TABLE issue_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Resources (The Library - Verified academic materials)
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_code TEXT NOT NULL CHECK (char_length(course_code) <= 20),
    faculty TEXT NOT NULL CHECK (char_length(faculty) <= 100),
    title TEXT NOT NULL CHECK (char_length(title) <= 200),
    description TEXT CHECK (char_length(description) <= 2000),
    category resource_category NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes <= 52428800), -- 50MB limit
    mime_type TEXT NOT NULL CHECK (mime_type IN (
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png'
    )),
    page_count INT NOT NULL DEFAULT 1,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Resource Votes (Strictly ONE vote per user per resource)
CREATE TABLE resource_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_resource_user_vote UNIQUE (resource_id, user_id)
);

-- 18. Resource Downloads Tracker
CREATE TABLE resource_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Content Reports (Abuse & safety reports)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type report_target_type NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (char_length(reason) <= 500),
    status report_status NOT NULL DEFAULT 'pending',
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notes TEXT,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. Copyright Takedown Requests
CREATE TABLE takedown_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    claimant_name TEXT NOT NULL CHECK (char_length(claimant_name) <= 100),
    claimant_email TEXT NOT NULL CHECK (char_length(claimant_email) <= 255),
    reason TEXT NOT NULL CHECK (char_length(reason) <= 2000),
    status takedown_status NOT NULL DEFAULT 'pending',
    actioned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actioned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. Audit Logs (Immutable, append-only security log)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_handle TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 22. Rate Limits (Server-enforced action limits per user)
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    count INT NOT NULL DEFAULT 1,
    CONSTRAINT uq_user_action_window UNIQUE (user_id, action_type, window_start)
);
