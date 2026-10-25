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

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== "https://try.sparkagent.in.net") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const body = await request.json();
    const access_token = typeof body?.access_token === "string" ? body.access_token : "";
    const refresh_token = typeof body?.refresh_token === "string" ? body.refresh_token : "";
    if (!access_token || !refresh_token) {
      return cors(NextResponse.json({ authenticated: false }, { status: 400 }));
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) {
      return cors(NextResponse.json({ authenticated: false }, { status: 401 }));
    }

    return cors(NextResponse.json({ authenticated: true }));
  } catch {
    return cors(NextResponse.json({ authenticated: false }, { status: 400 }));
  }
}

export async function GET(request: NextRequest) {
  if (request.headers.get("origin") !== ALLOWED_ORIGIN) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return cors(NextResponse.json({ authenticated: false }, { status: 401 }));
  }

  const user = userData.user;
  return cors(NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email ?? null,
      username: user.user_metadata?.user_name ?? user.user_metadata?.preferred_username ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Guest",
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
      provider: user.app_metadata?.provider ?? null
    }
  }));
}


export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== ALLOWED_ORIGIN) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return cors(NextResponse.json({ authenticated: false }));
  } catch {
    return cors(NextResponse.json({ authenticated: false }, { status: 500 }));
  }
}
