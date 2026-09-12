export function BrowserMockup() {
  return (
    <section id="product" className="relative px-6 pb-24">
      <div className="mx-auto max-w-[1040px]">
        <div className="relative rounded-2xl border border-white/10 bg-surface shadow-card">
          <div className="flex items-center gap-2 rounded-t-2xl border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="ml-3 flex-1 truncate rounded-md bg-white/[0.03] px-3 py-1 text-center font-body text-[12px] text-ink-faint">agent.sparkagent.in.net</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[190px_1fr]">
            <div className="hidden border-r border-white/[0.06] p-4 sm:block">
              <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-body text-[12px] text-ink-muted">Private session</div>
              <div className="mb-4 rounded-lg bg-spark-gradient px-3 py-2 text-center font-body text-[12.5px] font-medium text-white">New chat</div>
              <p className="mb-2 font-body text-[11px] uppercase tracking-wide text-ink-faint/70">Recent</p>
              <ul className="space-y-1.5 font-body text-[12.5px] text-ink-faint"><li className="truncate rounded-md px-2 py-1.5 hover:bg-white/[0.03]">Q3 product strategy</li><li className="truncate rounded-md px-2 py-1.5 hover:bg-white/[0.03]">Research notes</li><li className="truncate rounded-md px-2 py-1.5 hover:bg-white/[0.03]">Customer insights</li></ul>
            </div>
            <div className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-spark-gradient" /><span className="font-body text-[13px] font-medium text-ink">SparkAgent</span><span className="ml-auto flex items-center gap-1.5 font-body text-[11.5px] text-ink-faint"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Ready to help</span></div>
              <div className="mb-4 ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-white/[0.06] px-4 py-3 font-body text-[13.5px] text-ink/90">Can you summarize the key opportunities from this customer research?</div>
              <div className="mb-6 max-w-[90%] rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.02] px-4 py-3 font-body text-[13.5px] leading-relaxed text-ink-muted">I found three clear opportunities: faster onboarding, proactive insights, and a more collaborative workspace. Want the detailed breakdown?</div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 font-body text-[13px] text-ink-faint">Ask anything, attach a document&hellip;</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
