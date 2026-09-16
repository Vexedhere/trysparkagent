"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const TIERS_URL = "https://tiers.sparkagent.in.net/";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
  { label: "Plans", href: TIERS_URL },
  { label: "Sign in", href: "#auth" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-base/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-2"><span className="h-7 w-7 rounded-lg bg-spark-gradient" aria-hidden="true" /><span className="font-heading text-[17px] font-semibold tracking-tight text-ink">SparkAgent</span></a>
        <nav className="hidden items-center gap-8 md:flex">{NAV_LINKS.map((link) => <a key={link.href} href={link.href} className="font-body text-[14.5px] text-ink-muted transition-colors hover:text-ink">{link.label}</a>)}</nav>
        <div className="hidden md:block"><a href={TIERS_URL} className="rounded-full bg-spark-gradient px-5 py-2 font-body text-[14.5px] font-medium text-white shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset] transition-transform hover:scale-[1.03]">Plans</a></div>
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>{open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}</button>
      </div>
      {open && <div className="border-t border-white/[0.06] bg-base/95 px-6 py-4 md:hidden"><nav className="flex flex-col gap-1">{NAV_LINKS.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-body text-[15px] text-ink-muted hover:bg-white/[0.04] hover:text-ink">{link.label}</a>)}<a href={TIERS_URL} onClick={() => setOpen(false)} className="mt-2 rounded-full bg-spark-gradient px-4 py-2.5 text-center font-body text-[15px] font-medium text-white">View plans</a></nav></div>}
    </header>
  );
}
