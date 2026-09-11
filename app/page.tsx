'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Loader2, Mail, ShieldCheck, Sparkles, Zap } from 'lucide-react'
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
    <main className="auth-shell min-h-screen overflow-hidden px-5 text-white sm:px-8">
      <div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" /><div className="auth-grid" />

      <header className="relative z-10 mx-auto flex h-20 w-full max-w-6xl items-center justify-between">
        <a href="https://sparkagent.in.net" className="flex items-center gap-3" aria-label="SparkAgent home">
          <span className="brand-mark"><Sparkles size={17} strokeWidth={2.5}/></span>
          <span className="text-[17px] font-semibold tracking-tight">SparkAgent</span>
        </a>
        <a href="https://sparkagent.in.net" className="auth-nav-link">Back to SparkAgent</a>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center pb-20 pt-10 sm:pt-14">
        <div className="auth-badge"><span /> Next-Gen AI Platform</div>
        <h1 className="mt-6 max-w-4xl text-center text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
          {mode === 'signin' ? 'Welcome back to ' : 'Start building with '}
          <span className="auth-gradient-text">SparkAgent.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-center text-sm leading-6 text-white/45 sm:text-base">
          {mode === 'signin' ? 'Sign in to continue to your intelligent AI workspace.' : 'Create your account and bring smarter conversations and workflows into your day.'}
        </p>

        <div className="mt-10 w-full max-w-[500px]">
          <section className="auth-card rounded-[28px] border border-white/[0.12] p-5 sm:p-7">
            <div className="auth-card-shine" />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/60">Account</p><p className="mt-1 text-sm text-white/45">Secure access to SparkAgent</p></div>
                <span className="auth-secure"><ShieldCheck size={14}/> Secure</span>
              </div>

              <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/[0.08] bg-black/25 p-1">
                <button type="button" onClick={() => switchMode('signin')} className={`rounded-xl py-2.5 text-sm font-medium transition ${mode === 'signin' ? 'bg-white/[0.10] text-white shadow-lg' : 'text-white/38 hover:text-white/70'}`}>Sign In</button>
                <button type="button" onClick={() => switchMode('signup')} className={`rounded-xl py-2.5 text-sm font-medium transition ${mode === 'signup' ? 'bg-white/[0.10] text-white shadow-lg' : 'text-white/38 hover:text-white/70'}`}>Create Account</button>
              </div>

              {(error || message) && <div role="alert" className={`mb-5 rounded-2xl border px-4 py-3 text-sm leading-5 ${error ? 'border-red-400/15 bg-red-500/[0.07] text-red-200' : 'border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-100'}`}>{error || message}</div>}

              <div className="grid grid-cols-2 gap-3">
                <button type="button" disabled={loading} onClick={() => oauth('google')} className="auth-provider"><GoogleIcon/> Google</button>
                <button type="button" disabled={loading} onClick={() => oauth('github')} className="auth-provider"><GitHubIcon/> GitHub</button>
              </div>

              <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-white/[0.08]"/><span className="text-[10px] font-semibold tracking-[0.16em] text-white/25">OR CONTINUE WITH EMAIL</span><div className="h-px flex-1 bg-white/[0.08]"/></div>

              <form onSubmit={submit} className="space-y-4">
                <label className="block"><span className="mb-2 block text-xs font-medium text-white/60">Email</span><div className="auth-input-wrap"><Mail size={17} className="auth-input-icon"/><input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input pl-11 pr-3" placeholder="you@example.com"/></div></label>
                <label className="block"><span className="mb-2 block text-xs font-medium text-white/60">Password</span><div className="auth-input-wrap"><input required minLength={6} type={show ? 'text' : 'password'} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} className="auth-input pl-3 pr-12" placeholder="Enter your password"/><button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="auth-eye">{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
                <button disabled={loading} className="auth-submit group">{loading && <Loader2 size={17} className="animate-spin"/>}<span>{mode === 'signin' ? 'Continue to SparkAgent' : 'Create SparkAgent Account'}</span>{!loading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5"/>}</button>
              </form>
              <p className="mt-5 text-center text-[11px] leading-5 text-white/25">{mode === 'signup' ? 'A verification email will be sent after registration.' : 'Protected authentication for your SparkAgent workspace.'}</p>
            </div>
          </section>
        </div>

        <div className="mt-14 grid w-full max-w-5xl gap-4 md:grid-cols-3">
          <article className="landing-card"><span className="landing-icon"><Zap size={17}/></span><h3>Built for momentum</h3><p>Fast, focused conversations that keep ideas moving.</p></article>
          <article className="landing-card"><span className="landing-icon"><ShieldCheck size={17}/></span><h3>Privacy by design</h3><p>Focused sessions designed for sensitive work.</p></article>
          <article className="landing-card"><span className="landing-icon"><Sparkles size={17}/></span><h3>Work smarter</h3><p>Bring AI into the flow of your everyday work.</p></article>
        </div>

        <p className="mt-10 text-center text-[11px] text-white/20">© 2026 SparkAgent · Intelligent AI for modern work</p>
      </section>
    </main>
  )
}
