"use client";

import Link from "next/link";
import { ArrowRight, Bot, Code2, BriefcaseBusiness, Search, Sparkles, CreditCard, Settings } from "lucide-react";

const destinations = [
  { title: "SparkAgent", description: "Open your AI workspace and run your agents.", href: "https://agent.sparkagent.in.net", icon: Sparkles },
  { title: "Create an Agent", description: "Build a custom AI agent for a specific job.", href: "https://agent.sparkagent.in.net/new", icon: Bot },
  { title: "Coding Agent", description: "Connect GitHub and let an agent work on your codebase.", href: "https://agent.sparkagent.in.net/new?type=coding", icon: Code2 },
  { title: "Business Agent", description: "Plan, research and automate business workflows.", href: "https://agent.sparkagent.in.net/new?type=business", icon: BriefcaseBusiness },
  { title: "Research Agent", description: "Research topics and organize sourced findings.", href: "https://agent.sparkagent.in.net/new?type=research", icon: Search },
  { title: "Other Agents", description: "Explore the available agent types and configurations.", href: "https://agent.sparkagent.in.net/agents", icon: Bot },
  { title: "Plans", description: "Compare Free, Plus, Pro and Premium access.", href: "https://tiers.sparkagent.in.net", icon: CreditCard },
  { title: "Settings", description: "Manage your account and SparkAgent preferences.", href: "https://agent.sparkagent.in.net/settings", icon: Settings },
];

export default function AuthenticatedHomePage() {
  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,.18),transparent_40%)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <header className="mb-12 flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-semibold tracking-tight">Spark<span className="bg-spark-gradient bg-clip-text text-transparent">Agent</span></Link>
          <Link href="https://agent.sparkagent.in.net" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2 text-sm text-white transition hover:bg-white/[.08]">Open workspace <ArrowRight className="h-4 w-4" /></Link>
        </header>

        <section className="mb-10">
          <p className="mb-3 text-sm font-medium text-indigo-300">Your SparkAgent home</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">What do you want to build?</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">Create and run specialized AI agents, work with code, research topics, and manage your SparkAgent workspace from one place.</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map(({ title, description, href, icon: Icon }) => (
            <a key={title} href={href} className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-white/[.06]">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300"><Icon className="h-5 w-5" /></div>
              <h2 className="font-heading text-lg font-semibold">{title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-white/50">{description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition group-hover:text-white">Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
