import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const APP_DESTINATION = "https://agent.sparkagent.in.net";
const SIGN_IN_ERROR_DESTINATION = "https://try.sparkagent.in.net/?auth_error=1";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const supabase = await createClient();

  if (!code) {
    return NextResponse.redirect(SIGN_IN_ERROR_DESTINATION);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(SIGN_IN_ERROR_DESTINATION);
  }

  return NextResponse.redirect(APP_DESTINATION);
}
