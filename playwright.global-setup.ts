/**
 * Playwright global setup.
 * - Checks if NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
 * - If set: Supabase is configured; E2E can expect persisted data and auth flows.
 * - If not set: tests run but builder may show "Sign in to access" (acceptable for CI without Supabase).
 * - Optionally seeds test data when Supabase is configured (skipped if complex).
 */
export default async function globalSetup() {
  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  process.env.E2E_SUPABASE_CONFIGURED = hasSupabase ? "true" : "false"

  if (hasSupabase) {
    // Optional: create test user + workspace + workflow via Supabase.
    // Skipped for now - requires test credentials and admin setup.
    // Tests will run; builder shows canvas when authenticated, sign-in when not.
  }

  // Without Supabase: tests run; builder shows sign-in prompt (valid outcome).
}
