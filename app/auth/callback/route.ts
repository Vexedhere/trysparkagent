import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const HOME_DESTINATION = "https://agent.sparkagent.in.net/";
const SIGN_IN_ERROR_DESTINATION = "https://try.sparkagent.in.net/?auth_error=1";
const ALLOWED_HOSTS = ["try.sparkagent.in.net", "agent.sparkagent.in.net", "tiers.sparkagent.in.net"];

function safeNext(_value: string | null): string {
  // Authentication now always lands in the real SparkAgent workspace.
  // Do not send users back to the legacy /home selection screen.
  return HOME_DESTINATION;
}

function redirectToDestination(destination: string) {
  return NextResponse.redirect(new URL(destination));
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const supabase = await createClient();

  if (!code) return NextResponse.redirect(SIGN_IN_ERROR_DESTINATION);

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(SIGN_IN_ERROR_DESTINATION);

  return redirectToDestination(safeNext(requestUrl.searchParams.get("next")));
}
