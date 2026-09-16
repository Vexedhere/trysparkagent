"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const next = search.get("next");
    const target = next && /^https:\/\/agent\.sparkagent\.in\.net\//.test(next)
      ? next
      : "https://agent.sparkagent.in.net/";
    router.replace(`/?auth=signin&next=${encodeURIComponent(target)}`);
  }, [router, search]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050507] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
        <p className="text-sm text-white/50">Opening SparkAgent sign in…</p>
      </div>
    </main>
  );
}
