import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const HOME_DESTINATION = "https://try.sparkagent.in.net/home";
const SIGN_IN_ERROR_DESTINATION = "https://try.sparkagent.in.net/?auth_error=1";
const ALLOWED_HOSTS = ["try.sparkagent.in.net", "agent.sparkagent.in.net", "tiers.sparkagent.in.net"];

function safeNext(value: string | null): string {
  if (!value) return HOME_DESTINATION;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && ALLOWED_HOSTS.includes(url.hostname)) return url.toString();
  } catch {}
  return HOME_DESTINATION;
}

function redirectWithSession(destination: string, accessToken: string, refreshToken: string) {
  const target = new URL(destination);
  target.hash = new URLSearchParams({
    access_token: accessToken,
    refresh_token: refreshToken,
  }).toString();
  return NextResponse.redirect(target);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const supabase = await createClient();

  if (!code) return NextResponse.redirect(SIGN_IN_ERROR_DESTINATION);

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(SIGN_IN_ERROR_DESTINATION);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.redirect(SIGN_IN_ERROR_DESTINATION);

  return redirectWithSession(
    safeNext(requestUrl.searchParams.get("next")),
    session.access_token,
    session.refresh_token
  );
}
