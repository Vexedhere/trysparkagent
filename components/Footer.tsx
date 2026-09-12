export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] px-6 py-10">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-spark-gradient" aria-hidden="true" />
          <span className="font-body text-[13.5px] text-ink-faint">
            &copy; {new Date().getFullYear()} SparkAgent
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <a href="https://sparkagent.in.net" className="font-body text-[13.5px] text-ink-faint transition-colors hover:text-ink">About</a>
          <a href="#workflow" className="font-body text-[13.5px] text-ink-faint transition-colors hover:text-ink">Workflow</a>
          <a href="#auth" className="font-body text-[13.5px] text-ink-faint transition-colors hover:text-ink">Sign in</a>
        </nav>
      </div>
    </footer>
  );
}
