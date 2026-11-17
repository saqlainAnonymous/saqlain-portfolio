import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns an anon-key client, or null when Supabase env vars are missing.
 * The whole backend degrades to "demo mode" (logs + ok responses) until
 * you add your keys — perfect for the local-first build.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Service-role client for admin-only reads (bypasses RLS).
 * Null when the service key is not configured.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
