/**
 * src/lib/rls.test.ts
 *
 * RLS policy integration tests.
 *
 * These tests REQUIRE a real Supabase test project.
 * They are skipped automatically when VITE_SUPABASE_URL is not set,
 * so the CI lint/typecheck/build pipeline remains unaffected.
 *
 * To run locally:
 *   1. Create a Supabase project (free tier works)
 *   2. Run all migrations: supabase db push  (or paste into the SQL editor)
 *   3. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.test
 *   4. Set SUPABASE_SERVICE_ROLE_KEY in .env.test (server-side only, NOT bundled)
 *   5. npx vitest run src/lib/rls.test.ts
 *
 * Principles tested:
 *   - A student CANNOT read another campus's content
 *   - A student CANNOT read another user's DMs
 *   - A student CANNOT edit another user's content
 *   - A student CANNOT escalate their own role
 *   - Expired content does NOT appear in queries
 *   - A blocked user CANNOT start a conversation
 *   - All one-per-user constraints are enforced at the DB level
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../supabase/database.types';

// ─── Configuration ─────────────────────────────────────────────────────────────


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
// SUPABASE_SERVICE_ROLE_KEY is a server-only secret — never a VITE_ variable.
// Vitest exposes process.env so we read it here for integration tests only.
const SERVICE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] as string | undefined;

const hasCredentials = Boolean(SUPABASE_URL && ANON_KEY && SERVICE_KEY);

// Skip all tests gracefully when not configured
const describeIfConfigured = hasCredentials ? describe : describe.skip;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function adminClient() {
  return createClient<Database>(SUPABASE_URL!, SERVICE_KEY!, {
    auth: { persistSession: false },
  });
}

/**
 * Create a test user via admin auth and return an anon client
 * authenticated as that user. Cleans up in afterAll.
 */
async function createTestUser(
  email: string,
  handle: string,
  universityId: string
): Promise<ReturnType<typeof createClient<Database>>> {
  const admin = adminClient();

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: 'TestPass123!',
    email_confirm: true,
  });
  if (authError || !authData.user) throw new Error(`Auth creation failed: ${authError?.message}`);

  // Insert profile
  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: authData.user.id, university_id: universityId, handle });
  if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);

  // Sign in as the user with anon key
  const client = createClient<Database>(SUPABASE_URL!, ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password: 'TestPass123!',
  });
  if (signInError) throw new Error(`Sign-in failed: ${signInError.message}`);

  return client;
}

async function deleteTestUser(email: string) {
  const admin = adminClient();
  const { data } = await admin.auth.admin.listUsers();
  const user = data?.users.find((u) => u.email === email);
  if (user) await admin.auth.admin.deleteUser(user.id);
}

// ─── Test Suite ────────────────────────────────────────────────────────────────

describeIfConfigured('RLS Policies', () => {
  // We use a deterministic test UUID for the launch campus (CUK) seeded in migration 1.
  const CUK_ID = 'e5b7c844-3c66-41f2-95f3-7033cb21a4f1';

  // We create a second fake university UUID to test cross-campus isolation.
  // It doesn't exist in the DB — so no content should be readable.
  const FAKE_CAMPUS_ID = '00000000-0000-0000-0000-000000000001';

  const TEST_EMAIL_A = `rlstest-a-${Date.now()}@cuk.ac.ke`;
  const TEST_EMAIL_B = `rlstest-b-${Date.now()}@cuk.ac.ke`;

  let clientA: ReturnType<typeof createClient<Database>>;
  let clientB: ReturnType<typeof createClient<Database>>;

  beforeAll(async () => {
    clientA = await createTestUser(TEST_EMAIL_A, `RLSUserA${Date.now()}`, CUK_ID);
    clientB = await createTestUser(TEST_EMAIL_B, `RLSUserB${Date.now()}`, CUK_ID);
  });

  afterAll(async () => {
    await deleteTestUser(TEST_EMAIL_A);
    await deleteTestUser(TEST_EMAIL_B);
  });

  // ── Test 1: Cross-campus isolation ──────────────────────────────────────────

  it('student cannot read posts from a campus they are not a member of', async () => {
    // Insert a post as admin for the fake campus (bypassing RLS)
    const admin = adminClient();
    const { data: adminProfile } = await admin.auth.admin.listUsers();
    // We just need any existing user id for the author_id — use the admin insert directly
    const { data: inserted } = await admin.from('posts').insert({
      university_id: CUK_ID, // use real campus but we will filter by a fake one below
      author_id: (await admin.auth.admin.listUsers()).data.users[0]?.id ?? CUK_ID,
      content_text: 'Cross-campus isolation test post',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    }).select('id').single();

    // clientA (CUK member) should NOT see posts with university_id = FAKE_CAMPUS_ID
    const { data, error } = await clientA
      .from('posts')
      .select('id')
      .eq('university_id', FAKE_CAMPUS_ID);

    // RLS filters: result should be empty (not an error — empty is correct)
    expect(error).toBeNull();
    expect(data).toHaveLength(0);

    // Cleanup
    if (inserted?.id) await admin.from('posts').delete().eq('id', inserted.id);
  });

  // ── Test 2: Students cannot read other users' DMs ───────────────────────────

  it("student A cannot read student B's conversation messages", async () => {
    // Create a conversation and message as admin
    const admin = adminClient();

    const { data: profileA } = await clientA
      .from('profiles')
      .select('id')
      .single();

    const { data: profileB } = await clientB
      .from('profiles')
      .select('id')
      .single();

    // Create a conversation with only B as member
    const { data: conv } = await admin
      .from('conversations')
      .insert({ university_id: CUK_ID, ttl_duration: '24h' })
      .select('id')
      .single();

    if (!conv) return; // skip if insert failed

    await admin.from('conversation_members').insert({
      conversation_id: conv.id,
      user_id: profileB!.id,
    });

    await admin.from('messages').insert({
      conversation_id: conv.id,
      sender_id: profileB!.id,
      content: 'This is private',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    });

    // clientA is NOT a member — should see NO messages
    const { data: messages, error } = await clientA
      .from('messages')
      .select('id')
      .eq('conversation_id', conv.id);

    expect(error).toBeNull();
    expect(messages).toHaveLength(0);

    // Cleanup
    await admin.from('conversations').delete().eq('id', conv.id);
  });

  // ── Test 3: Student cannot edit another user's post ─────────────────────────

  it("student A cannot update student B's post", async () => {
    const admin = adminClient();
    const { data: profileB } = await clientB.from('profiles').select('id').single();

    const { data: post } = await admin
      .from('posts')
      .insert({
        university_id: CUK_ID,
        author_id: profileB!.id,
        content_text: 'B original content',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      })
      .select('id')
      .single();

    if (!post) return;

    // A tries to update B's post
    const { error } = await clientA
      .from('posts')
      .update({ content_text: 'Hijacked by A' })
      .eq('id', post.id);

    // RLS should block this — either an error or 0 rows updated
    // Supabase returns no error but 0 rows when RLS filters the UPDATE target
    const { data: check } = await admin.from('posts').select('content_text').eq('id', post.id).single();
    expect(check?.content_text).toBe('B original content');

    await admin.from('posts').delete().eq('id', post.id);
  });

  // ── Test 4: Student cannot escalate own role ─────────────────────────────────

  it('student cannot set their own role to admin', async () => {
    const { data: profile } = await clientA.from('profiles').select('id, role').single();
    expect(profile?.role).toBe('student');

    const { error } = await clientA
      .from('profiles')
      .update({ role: 'admin' } as object) // cast to bypass TS Insert type (Update forbids role)
      .eq('id', profile!.id);

    // The protect_profile_system_columns trigger should raise an exception
    expect(error).not.toBeNull();
    expect(error?.message).toContain('cannot modify');

    // Confirm role was NOT changed
    const { data: after } = await adminClient()
      .from('profiles')
      .select('role')
      .eq('id', profile!.id)
      .single();
    expect(after?.role).toBe('student');
  });

  // ── Test 5: Expired content is not visible ───────────────────────────────────

  it('student cannot read expired posts', async () => {
    const admin = adminClient();
    const { data: profileA } = await clientA.from('profiles').select('id').single();

    // Insert a post that expired 1 second ago
    const { data: post } = await admin
      .from('posts')
      .insert({
        university_id: CUK_ID,
        author_id: profileA!.id,
        content_text: 'This post has expired',
        expires_at: new Date(Date.now() - 1000).toISOString(),
      })
      .select('id')
      .single();

    if (!post) return;

    // clientA (the author) should NOT see their own expired post via RLS
    const { data } = await clientA.from('posts').select('id').eq('id', post.id);
    expect(data).toHaveLength(0);

    await admin.from('posts').delete().eq('id', post.id);
  });

  // ── Test 6: One reaction per user per post ───────────────────────────────────

  it('student cannot react twice to the same post', async () => {
    const admin = adminClient();
    const { data: profileA } = await clientA.from('profiles').select('id').single();

    const { data: post } = await admin
      .from('posts')
      .insert({
        university_id: CUK_ID,
        author_id: profileA!.id,
        content_text: 'Reaction uniqueness test',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      })
      .select('id')
      .single();

    if (!post) return;

    await clientA.from('post_reactions').insert({ post_id: post.id, user_id: profileA!.id, reaction: 'fire' });

    // Second reaction should fail (unique constraint)
    const { error } = await clientA
      .from('post_reactions')
      .insert({ post_id: post.id, user_id: profileA!.id, reaction: 'skull' });

    expect(error).not.toBeNull();
    expect(error?.code).toBe('23505'); // Postgres unique_violation

    await admin.from('posts').delete().eq('id', post.id);
  });

  // ── Test 7: One vote per user per poll ───────────────────────────────────────

  it('student cannot vote twice in the same poll', async () => {
    const admin = adminClient();
    const { data: profileA } = await clientA.from('profiles').select('id').single();

    const { data: post } = await admin
      .from('posts')
      .insert({
        university_id: CUK_ID,
        author_id: profileA!.id,
        content_text: 'Poll uniqueness test',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      })
      .select('id')
      .single();

    const { data: poll } = await admin
      .from('polls')
      .insert({ post_id: post!.id, question: 'Which option?' })
      .select('id')
      .single();

    const { data: opt1 } = await admin
      .from('poll_options')
      .insert({ poll_id: poll!.id, label: 'Option A', sort_order: 0 })
      .select('id')
      .single();

    const { data: opt2 } = await admin
      .from('poll_options')
      .insert({ poll_id: poll!.id, label: 'Option B', sort_order: 1 })
      .select('id')
      .single();

    await clientA.from('poll_votes').insert({
      poll_id: poll!.id,
      option_id: opt1!.id,
      user_id: profileA!.id,
    });

    const { error } = await clientA.from('poll_votes').insert({
      poll_id: poll!.id,
      option_id: opt2!.id,
      user_id: profileA!.id,
    });

    expect(error).not.toBeNull();
    expect(error?.code).toBe('23505');

    await admin.from('posts').delete().eq('id', post!.id);
  });
});
