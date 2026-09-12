import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles both:
 *  - OAuth redirects (Google / GitHub) after the provider authenticates the user
 *  - Email verification links sent by Supabase during sign-up
 *
 * Exchanges the one-time `code` for a session, then sends the user on to
 * the SparkAgent app.
 *
 * SECURITY: the destination is a hardcoded constant, never derived from a
 * query parameter or header, so this endpoint cannot be used as an open
 * redirect.
 */
const APP_DESTINATION = "https://agent.sparkagent.in.net";
const SIGN_IN_ERROR_DESTINATION = "https://try.sparkagent.in.net/?auth_error=1";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(SIGN_IN_ERROR_DESTINATION);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(SIGN_IN_ERROR_DESTINATION);
  }

  return NextResponse.redirect(APP_DESTINATION);
}
