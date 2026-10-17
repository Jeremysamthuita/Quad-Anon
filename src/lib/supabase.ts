import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../supabase/database.types';

// Only the PUBLIC anon key is allowed client-side.
// The service-role key MUST NEVER appear here or in any frontend bundle.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True when both env vars are present and non-placeholder.
 * Pages that require a live backend render a "configure Supabase" prompt when false.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('demo-placeholder') &&
    !supabaseAnonKey.includes('demo-placeholder')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[QuadAnon] Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      'in your .env file. See .env.example for the required variables.'
  );
}

/**
 * Typed Supabase client.
 * All queries through this client are type-checked against the Database schema
 * defined in supabase/database.types.ts.
 *
 * Auth is session-based (HTTP-only cookie managed by Supabase).
 * detectSessionInUrl: true supports the OTP redirect flow for email verification.
 */
export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://demo-placeholder.supabase.co',
  supabaseAnonKey ?? 'demo-placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      // Use the campus university_id in subscriptions to scope realtime traffic
      params: { eventsPerSecond: 10 },
    },
  }
);
