import { Zap, ShieldCheck, RefreshCw } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "Speed that flows", body: "Fast token streaming makes every conversation feel immediate and natural." },
  { icon: ShieldCheck, title: "Privacy by design", body: "Focused, isolated sessions help keep sensitive work where it belongs." },
  { icon: RefreshCw, title: "Everywhere in sync", body: "Move effortlessly between the browser and native desktop workflows." },
];

export function Features() {
  return (<section id="workflow" className="relative px-6 pb-24"><div className="mx-auto max-w-[1280px]"><div className="mx-auto mb-14 max-w-[560px] text-center"><p className="mb-3 font-body text-[13px] font-medium text-spark-indigo">Built for momentum</p><h2 className="font-heading text-[28px] font-medium leading-tight tracking-tight text-ink sm:text-[34px]">More signal. <span className="font-bold">Less busywork.</span></h2></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-3">{FEATURES.map((feature) => (<div key={feature.title} className="glass-surface rounded-2xl p-6 transition-colors hover:bg-white/[0.045]"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-spark-gradient-soft"><feature.icon className="h-5 w-5 text-spark-indigo" /></div><h3 className="mb-2 font-heading text-[16.5px] font-semibold text-ink">{feature.title}</h3><p className="font-body text-[14.5px] leading-relaxed text-ink-muted">{feature.body}</p></div>))}</div></div></section>);
}
