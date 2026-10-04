import { NextResponse, type NextRequest } from "next/server";

const COMPLETE_PATH = "/auth/complete";
const SIGN_IN_ERROR_DESTINATION = "https://try.sparkagent.in.net/?auth_error=1";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) return NextResponse.redirect(SIGN_IN_ERROR_DESTINATION);

  const completeUrl = new URL(COMPLETE_PATH, requestUrl.origin);
  completeUrl.searchParams.set("code", code);
  return NextResponse.redirect(completeUrl);
}
