'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Loader2, Mail, ShieldCheck, Sparkles, Zap, LockKeyhole, Gauge, MonitorSmartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.22a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.93-4.18 2.93-7.42Z"/><path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.04H3.27v2.53A9.74 9.74 0 0 0 12 21.6Z"/><path fill="#FBBC05" d="M6.51 13.67A5.86 5.86 0 0 1 6.2 12c0-.58.1-1.15.31-1.67V7.8H3.27A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.02 4.2l3.24-2.53Z"/><path fill="#EA4335" d="M12 6.29c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.38 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.73 5.4l3.24 2.53C7.29 8.01 9.45 6.29 12 6.29Z"/></svg>
}

function GitHubIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.81 1.3 3.5.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z"/></svg>
}

export default function AuthPage() {
  const supabase = createClient()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const destination = () => `${window.location.origin}/auth/callback?next=/continue`

  async function oauth(provider: 'google' | 'github') {
    setError(''); setMessage(''); setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: destination() } })
    if (error) { setError(error.message); setLoading(false) }
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setMessage(''); setLoading(true)
    if (mode === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message.toLowerCase().includes('invalid') ? 'Invalid email or password.' : error.message)
      else if (!data.user?.email_confirmed_at) setError('Please verify your email before signing in.')
      else { window.location.href = '/continue'; return }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: destination() } })
      if (error) setError(error.message)
      else if (data.user && !data.session) setMessage('Account created. Check your email to verify your account.')
      else { window.location.href = '/continue'; return }
    }
    setLoading(false)
  }

  const switchMode = (next: 'signin' | 'signup') => { setMode(next); setError(''); setMessage(''); setPassword('') }

  return (
    <main className="spark-page min-h-screen overflow-hidden bg-neutral-950 text-slate-100 antialiased">
      <div className="spark-background" aria-hidden="true"><div className="spark-grid"/><div className="spark-glow spark-glow-main"/><div className="spark-glow spark-glow-right"/><div className="spark-noise"/></div>

      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <a href="https://sparkagent.in.net" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white">
          <span className="spark-logo"><Zap className="h-5 w-5 fill-white text-white"/></span>
          Spark<span className="text-indigo-300">Agent</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
          <a className="transition hover:text-white" href="https://sparkagent.in.net/#home">Home</a>
          <a className="transition hover:text-white" href="https://sparkagent.in.net/#about">About</a>
          <a className="transition hover:text-white" href="https://sparkagent.in.net/#team">Team</a>
          <a className="transition hover:text-white" href="https://sparkagent.in.net/#testimonials">Testimonials</a>
        </nav>
        <a href="https://sparkagent.in.net" className="spark-nav-button">Back to site <ArrowRight className="ml-1 inline h-3.5 w-3.5"/></a>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-20 text-center lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-4xl">
          <div className="spark-badge"><span/> Next-Gen AI Platform</div>
          <h1 className="spark-heading mt-7 text-4xl font-extrabold tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
            Meet SparkAgent, your<br className="hidden sm:block"/> <span className="spark-heading-gradient">intelligent AI assistant.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Powering smarter conversations, document analysis, and native automated desktop workflows for modern teams.</p>
        </div>

        <div className="relative mx-auto mt-14 max-w-6xl text-left sm:mt-16">
          <div className="spark-card-glow"/>
          <div className="spark-window rounded-2xl border border-white/10 bg-[#11121b]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[.07] px-4 py-3 sm:px-5">
              <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400/70"/><span className="h-2.5 w-2.5 rounded-full bg-amber-300/70"/><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70"/></div>
              <div className="hidden items-center gap-2 rounded-md bg-white/[.04] px-3 py-1 text-[11px] text-slate-500 sm:flex"><ShieldCheck className="h-3 w-3 text-indigo-300"/> Private session</div>
              <span className="text-slate-500">•••</span>
            </div>

            <div className="grid md:grid-cols-[190px_1fr]">
              <aside className="hidden border-r border-white/[.07] bg-black/10 p-4 md:block">
                <div className="mb-5 flex items-center gap-2 px-1 text-sm font-bold text-white"><span className="spark-mini-logo"><Zap className="h-3.5 w-3.5 fill-white"/></span> SparkAgent</div>
                <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-3 text-xs text-indigo-100">Your AI workspace</div>
                <p className="mb-2 mt-6 text-[10px] font-bold uppercase tracking-widest text-slate-600">Workspace</p>
                <div className="space-y-1 text-xs text-slate-400"><div className="rounded-md bg-white/[.06] px-2.5 py-2 text-slate-200">New conversation</div><div className="px-2.5 py-2">Documents</div><div className="px-2.5 py-2">Workflows</div></div>
              </aside>

              <div className="p-5 sm:p-8">
                <div className="mb-7 flex items-start justify-between gap-6">
                  <div><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-300">Get started</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Sign in to SparkAgent.</h2><p className="mt-2 text-sm text-slate-500">Your intelligent workspace is waiting.</p></div>
                  <span className="hidden rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-[11px] font-medium text-indigo-200 sm:inline-flex">Secure access</span>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
                  <div className="hidden rounded-2xl border border-white/[.08] bg-white/[.025] p-6 lg:block">
                    <span className="spark-feature-icon"><Sparkles className="h-5 w-5"/></span>
                    <h3 className="mt-5 text-xl font-bold text-white">One workspace for smarter work.</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-400">Stream answers, analyze documents, and move between focused AI sessions without leaving your workflow.</p>
                    <div className="mt-6 space-y-3 text-sm text-slate-400"><div className="flex items-center gap-3"><Zap className="h-4 w-4 text-indigo-300"/> Fast AI conversations</div><div className="flex items-center gap-3"><LockKeyhole className="h-4 w-4 text-violet-300"/> Privacy-focused sessions</div><div className="flex items-center gap-3"><MonitorSmartphone className="h-4 w-4 text-cyan-300"/> Web and desktop workflows</div></div>
                  </div>

                  <div>
                    <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/[.08] bg-black/20 p-1">
                      <button type="button" onClick={() => switchMode('signin')} className={`rounded-lg py-2.5 text-sm font-semibold transition ${mode === 'signin' ? 'bg-white/[.10] text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}>Sign In</button>
                      <button type="button" onClick={() => switchMode('signup')} className={`rounded-lg py-2.5 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white/[.10] text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}>Create Account</button>
                    </div>
                    {(error || message) && <div role="alert" className={`mb-4 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-400/15 bg-red-500/[.07] text-red-200' : 'border-indigo-300/15 bg-indigo-300/[.06] text-indigo-100'}`}>{error || message}</div>}
                    <div className="grid grid-cols-2 gap-3"><button type="button" disabled={loading} onClick={() => oauth('google')} className="spark-provider"><GoogleIcon/> Google</button><button type="button" disabled={loading} onClick={() => oauth('github')} className="spark-provider"><GitHubIcon/> GitHub</button></div>
                    <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-white/[.08]"/><span className="text-[10px] font-bold tracking-[.16em] text-slate-600">OR CONTINUE WITH EMAIL</span><div className="h-px flex-1 bg-white/[.08]"/></div>
                    <form onSubmit={submit} className="space-y-4">
                      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-400">Email</span><div className="spark-input-wrap"><Mail className="spark-input-icon h-4 w-4"/><input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="spark-input pl-10 pr-3" placeholder="you@example.com"/></div></label>
                      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-400">Password</span><div className="spark-input-wrap"><input required minLength={6} type={show ? 'text' : 'password'} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} className="spark-input pl-3 pr-11" placeholder="Enter your password"/><button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="spark-eye">{show ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button></div></label>
                      <button disabled={loading} className="spark-submit group">{loading && <Loader2 className="h-4 w-4 animate-spin"/>}<span>{mode === 'signin' ? 'Continue to SparkAgent' : 'Create SparkAgent Account'}</span>{!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5"/>}</button>
                    </form>
                    <p className="mt-4 text-center text-[11px] leading-5 text-slate-600">{mode === 'signup' ? 'A verification email will be sent after registration.' : 'Secure authentication for your SparkAgent workspace.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[.07] bg-white/[.025] px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-indigo-300">Built for momentum</p><h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">More signal.<br/>Less busywork.</h2></div><p className="max-w-2xl text-lg leading-8 text-slate-400">SparkAgent brings powerful AI into the flow of work. Stream answers at lightning speed, work in privacy-focused isolated sessions, and stay productive across native desktop and web.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <article className="spark-feature-card"><span className="spark-feature-icon"><Gauge className="h-5 w-5"/></span><h3 className="mt-5 text-lg font-bold text-white">Speed that flows</h3><p className="mt-2 text-sm leading-6 text-slate-400">Fast token streaming makes every conversation feel immediate and natural.</p></article>
            <article className="spark-feature-card"><span className="spark-feature-icon violet"><LockKeyhole className="h-5 w-5"/></span><h3 className="mt-5 text-lg font-bold text-white">Privacy by design</h3><p className="mt-2 text-sm leading-6 text-slate-400">Focused, isolated sessions help keep sensitive work where it belongs.</p></article>
            <article className="spark-feature-card"><span className="spark-feature-icon cyan"><MonitorSmartphone className="h-5 w-5"/></span><h3 className="mt-5 text-lg font-bold text-white">Everywhere in sync</h3><p className="mt-2 text-sm leading-6 text-slate-400">Move effortlessly between the browser and native desktop workflows.</p></article>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-10 text-sm text-slate-500 sm:flex-row lg:px-8"><p>© 2026 sparkagent.in</p><div className="flex flex-wrap justify-center gap-x-5 gap-y-2"><a className="hover:text-white" href="https://sparkagent.in.net/#about">About</a><a className="hover:text-white" href="https://sparkagent.in.net/#team">Team</a><a className="hover:text-white" href="https://sparkagent.in.net/#testimonials">Testimonials</a><a className="hover:text-white" href="https://sparkagent.in.net">SparkAgent</a></div></footer>
    </main>
  )
}
