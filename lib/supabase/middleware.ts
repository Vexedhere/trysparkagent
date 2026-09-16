import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SHARED_COOKIE_OPTIONS: Partial<CookieOptions> = {
  domain: ".sparkagent.in.net",
  sameSite: "lax",
  secure: true,
  path: "/",
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) { return request.cookies.get(name)?.value; },
      set(name: string, value: string, options: CookieOptions) {
        const merged = { ...options, ...SHARED_COOKIE_OPTIONS };
        request.cookies.set({ name, value, ...merged });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...merged });
      },
      remove(name: string, options: CookieOptions) {
        const merged = { ...options, ...SHARED_COOKIE_OPTIONS, maxAge: 0 };
        request.cookies.set({ name, value: "", ...merged });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...merged });
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}
