"use client";

import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const target = next && /^https:\/\/agent\.sparkagent\.in\.net\//.test(next)
      ? next
      : "https://agent.sparkagent.in.net/";

    window.location.replace(
      `/?auth=signin&next=${encodeURIComponent(target)}`
    );
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050507] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
        <p className="text-sm text-white/50">Opening SparkAgent sign in…</p>
      </div>
    </main>
  );
}
