import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. The auth cookie is scoped to the SparkAgent parent
 * domain so an authenticated user can move between try.sparkagent.in.net and
 * agent.sparkagent.in.net without putting tokens in URLs.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return createBrowserClient(url, anonKey, {
    cookieOptions: {
      domain: ".sparkagent.in.net",
      sameSite: "lax",
      secure: true,
      path: "/",
    },
  });
}
