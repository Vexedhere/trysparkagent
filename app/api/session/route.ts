import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_ORIGIN = "https://agent.sparkagent.in.net";

function cors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Vary", "Origin");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin !== ALLOWED_ORIGIN) return new NextResponse(null, { status: 403 });
  return cors(new NextResponse(null, { status: 204 }));
}

export async function GET(request: NextRequest) {
  if (request.headers.get("origin") !== ALLOWED_ORIGIN) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return cors(NextResponse.json({ authenticated: false }, { status: 401 }));
  }

  return cors(NextResponse.json({
    authenticated: true,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at ?? null
  }));
}
