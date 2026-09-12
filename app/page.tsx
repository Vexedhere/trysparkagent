'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.22a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.93-4.18 2.93-7.42Z"/><path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.04H3.27v2.53A9.74 9.74 0 0 0 12 21.6Z"/><path fill="#FBBC05" d="M6.51 13.67A5.86 5.86 0 0 1 6.2 12c0-.58.1-1.15.31-1.67V7.8H3.27A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.02 4.2l3.24-2.53Z"/><path fill="#EA4335" d="M12 6.29c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.38 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.73 5.4l3.24 2.53C7.29 8.01 9.45 6.29 12 6.29Z"/></svg>
}

function GitHubIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.81 1.3 3.5.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z"/></svg>
}

const AGENT_URL = 'https://agent.sparkagent.in.net'

export default function AuthPage() {
  const supabase = createClient()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const callbackUrl = () => `${window.location.origin}/auth/callback`

  async function oauth(provider: 'google' | 'github') {
    setError(''); setMessage(''); setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: callbackUrl() } })
    if (error) { setError(error.message); setLoading(false) }
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setMessage(''); setLoading(true)
    if (mode === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message.toLowerCase().includes('invalid') ? 'Invalid email or password.' : error.message)
      else if (!data.user?.email_confirmed_at) setError('Please verify your email before signing in.')
      else { window.location.href = AGENT_URL; return }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: callbackUrl() } })
      if (error) setError(error.message)
      else if (data.user && !data.session) setMessage('Account created. Check your email to verify your account.')
      else { window.location.href = AGENT_URL; return }
    }
    setLoading(false)
  }

  function switchMode(next: 'signin' | 'signup') { setMode(next); setError(''); setMessage(''); setPassword('') }

  return (
    <main className="spark-page min-h-screen overflow-x-hidden bg-neutral-950 text-slate-100 antialiased">
      <div className="spark-background" aria-hidden="true"><div className="spark-grid"/><div className="spark-glow spark-glow-main"/><div className="spark-glow spark-glow-right"/><div className="spark-noise"/></div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="https://sparkagent.in.net" className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-white"><span className="spark-logo"><Zap className="h-5 w-5 fill-white"/></span> Spark<span className="text-indigo-300">Agent</span></a>
        <a href="https://sparkagent.in.net" className="spark-nav-button">Back to site <ArrowRight className="ml-1 inline h-4 w-4"/></a>
      </header>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-20 pt-12 text-center lg:px-8 lg:pt-20">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm font-medium text-indigo-200"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-300"/> Next-Gen AI Platform</div>
          <h1 className="spark-heading mx-auto max-w-4xl text-5xl font-bold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">Meet SparkAgent, your<br className="hidden sm:block"/> <span className="font-extrabold spark-heading-gradient">intelligent AI assistant.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Powering smarter conversations, document analysis, and automated workflows for modern teams.</p>
        </div>

        <div className="relative mx-auto mt-14 w-full max-w-5xl text-left sm:mt-16">
          <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-indigo-500/15 blur-3xl"/>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#101118]/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-3.5"><div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400/70"/><span className="h-2.5 w-2.5 rounded-full bg-amber-300/70"/><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70"/></div><div className="hidden items-center gap-2 rounded-lg bg-white/[.04] px-3 py-1.5 text-[11px] font-medium text-slate-500 sm:flex"><ShieldCheck className="h-3.5 w-3.5 text-indigo-300"/> Secure authentication</div><span className="text-slate-600">•••</span></div>
            <div className="grid md:grid-cols-[220px_1fr]">
              <aside className="hidden border-r border-white/[.07] bg-black/15 p-5 md:block"><div className="flex items-center gap-2 text-sm font-bold text-white"><span className="spark-mini-logo"><Zap className="h-3.5 w-3.5 fill-white"/></span> SparkAgent</div><p className="mb-3 mt-9 text-[10px] font-bold uppercase tracking-[.2em] text-slate-600">Workspace</p><div className="space-y-1 text-xs text-slate-500"><div className="rounded-lg bg-white/[.06] px-3 py-2.5 font-semibold text-slate-200">AI Assistant</div><div className="px-3 py-2.5">Documents</div><div className="px-3 py-2.5">Automations</div></div><div className="mt-10 rounded-2xl border border-indigo-400/10 bg-indigo-500/[.06] p-4"><Sparkles className="h-4 w-4 text-indigo-300"/><p className="mt-3 text-xs font-semibold text-slate-300">Your AI workspace</p><p className="mt-1 text-[11px] leading-5 text-slate-600">Sign in and continue where your ideas become action.</p></div></aside>

              <div className="flex items-center p-5 sm:p-9 lg:p-12">
                <div className="mx-auto w-full max-w-lg">
                  <div className="mb-7 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-xl shadow-indigo-500/20"><Zap className="h-6 w-6 fill-white text-white"/></div><p className="mt-5 text-xs font-bold uppercase tracking-[.22em] text-indigo-300">Welcome back</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Sign in to SparkAgent</h2><p className="mt-2 text-sm leading-6 text-slate-400">Your intelligent workspace is one step away.</p></div>

                  <div className="rounded-2xl border border-white/[.08] bg-white/[.025] p-5 shadow-xl shadow-black/20 sm:p-6">
                    <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/[.08] bg-black/20 p-1"><button type="button" onClick={()=>switchMode('signin')} className={`rounded-lg py-2.5 text-sm font-bold transition ${mode==='signin'?'bg-white/[.10] text-white shadow-lg':'text-slate-500 hover:text-slate-200'}`}>Sign In</button><button type="button" onClick={()=>switchMode('signup')} className={`rounded-lg py-2.5 text-sm font-bold transition ${mode==='signup'?'bg-white/[.10] text-white shadow-lg':'text-slate-500 hover:text-slate-200'}`}>Create Account</button></div>
                    {(error||message)&&<div role="alert" className={`mb-4 rounded-xl border px-4 py-3 text-sm ${error?'border-red-400/15 bg-red-500/[.07] text-red-200':'border-indigo-300/15 bg-indigo-300/[.06] text-indigo-100'}`}>{error||message}</div>}
                    <div className="grid gap-3 sm:grid-cols-2"><button type="button" disabled={loading} onClick={()=>oauth('google')} className="spark-provider"><GoogleIcon/> Continue with Google</button><button type="button" disabled={loading} onClick={()=>oauth('github')} className="spark-provider"><GitHubIcon/> Continue with GitHub</button></div>
                    <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-white/[.08]"/><span className="whitespace-nowrap text-[10px] font-bold tracking-[.16em] text-slate-600">OR CONTINUE WITH EMAIL</span><div className="h-px flex-1 bg-white/[.08]"/></div>
                    <form onSubmit={submit} className="space-y-4">
                      <label className="block"><span className="mb-2 block text-xs font-bold text-slate-300">Email address</span><div className="spark-input-wrap"><Mail className="spark-input-icon h-4 w-4"/><input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="spark-input pl-10 pr-3" placeholder="you@example.com"/></div></label>
                      <label className="block"><span className="mb-2 block text-xs font-bold text-slate-300">Password</span><div className="spark-input-wrap"><LockKeyhole className="spark-input-icon h-4 w-4"/><input required minLength={6} type={show?'text':'password'} autoComplete={mode==='signin'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} className="spark-input pl-10 pr-11" placeholder="Enter your password"/><button type="button" aria-label={show?'Hide password':'Show password'} onClick={()=>setShow(!show)} className="spark-eye">{show?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div></label>
                      <button disabled={loading} className="spark-submit group">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>}<span>{mode==='signin'?'Continue to SparkAgent':'Create my account'}</span>{!loading&&<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5"/>}</button>
                    </form>
                    <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-600"><ShieldCheck className="h-3.5 w-3.5 text-indigo-300/70"/> Secure authentication</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl items-center justify-center border-t border-white/[.07] px-6 py-8 text-xs text-slate-600 lg:px-8"><span>© 2026 SparkAgent</span><span className="mx-3">•</span><a className="hover:text-slate-300" href="https://sparkagent.in.net">sparkagent.in.net</a></footer>
    </main>
  )
}
