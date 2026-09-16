import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const SHARED_COOKIE_OPTIONS: Partial<CookieOptions> = {
  domain: ".sparkagent.in.net",
  sameSite: "lax",
  secure: true,
  path: "/",
};

/** Server Supabase client with auth shared across SparkAgent subdomains. */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options: CookieOptions) {
        try { cookieStore.set({ name, value, ...options, ...SHARED_COOKIE_OPTIONS }); } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try { cookieStore.set({ name, value: "", ...options, ...SHARED_COOKIE_OPTIONS, maxAge: 0 }); } catch {}
      },
    },
  });
}
