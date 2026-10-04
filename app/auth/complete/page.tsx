"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const HOME_DESTINATION = "https://agent.sparkagent.in.net/";

export default function AuthCompletePage() {
  useEffect(() => {
    let cancelled = false;

    async function complete() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        window.location.replace("https://try.sparkagent.in.net/?auth_error=1");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (cancelled) return;

      if (error) {
        console.error("OAuth code exchange failed:", error);
        window.location.replace("https://try.sparkagent.in.net/?auth_error=1");
        return;
      }

      window.location.replace(HOME_DESTINATION);
    }

    complete();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#08080d] text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />
        <p className="text-sm text-white/60">Signing you in to SparkAgent…</p>
      </div>
    </main>
  );
}
