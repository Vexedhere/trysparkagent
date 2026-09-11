'use client'

import { FormEvent, useState } from 'react'
import { Eye, EyeOff, Loader2, Mail, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function GitHubIcon() {
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.81 1.3 3.5.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z"/></svg>
}

export default function AuthPage() {
  const supabase = createClient()
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [show, setShow] = useState(false); const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(''); const [error, setError] = useState('')

  const destination = () => `${window.location.origin}/auth/callback?next=/continue`
  async function oauth(provider: 'google'|'github') {
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: destination() } })
    if (error) { setError(error.message); setLoading(false) }
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setMessage(''); setLoading(true)
    if (mode === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message.toLowerCase().includes('invalid') ? 'Invalid credentials' : error.message)
      else if (!data.user?.email_confirmed_at) setError('Check your email to verify your account')
      else window.location.href = '/continue'
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: destination() } })
      if (error) setError(error.message)
      else if (data.user && !data.session) setMessage('Account created. Check your email to verify your account.')
      else window.location.href = '/continue'
    }
    setLoading(false)
  }
  return <main className="auth-bg min-h-screen flex items-center justify-center px-5 py-10">
    <div className="w-full max-w-[430px]">
      <div className="flex justify-center mb-7"><div className="flex items-center gap-2 text-xl font-semibold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-indigo-500/20"><Sparkles size={18}/></span> SparkAgent</div></div>
      <section className="glow rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6 sm:p-8 backdrop-blur-xl">
        <div className="mb-7 text-center"><h1 className="text-2xl font-semibold tracking-tight">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1><p className="mt-2 text-sm text-neutral-500">{mode === 'signin' ? 'Sign in to continue to SparkAgent.' : 'Create an account to get started.'}</p></div>
        <div className="grid grid-cols-2 rounded-xl border border-neutral-800 bg-neutral-900/70 p-1 mb-6"><button onClick={()=>{setMode('signin');setError('');setMessage('')}} className={`rounded-lg py-2 text-sm transition ${mode==='signin'?'bg-neutral-800 text-white shadow':'text-neutral-500 hover:text-neutral-300'}`}>Sign In</button><button onClick={()=>{setMode('signup');setError('');setMessage('')}} className={`rounded-lg py-2 text-sm transition ${mode==='signup'?'bg-neutral-800 text-white shadow':'text-neutral-500 hover:text-neutral-300'}`}>Create Account</button></div>
        {(error || message) && <div role="alert" className={`mb-4 rounded-xl border px-3 py-2.5 text-sm ${error?'border-red-900/60 bg-red-950/30 text-red-300':'border-indigo-900/60 bg-indigo-950/30 text-indigo-300'}`}>{error || message}</div>}
        <div className="grid grid-cols-2 gap-3 mb-5"><button disabled={loading} onClick={()=>oauth('google')} className="flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 text-sm hover:bg-neutral-800 disabled:opacity-50"><span className="font-bold text-base">G</span> Google</button><button disabled={loading} onClick={()=>oauth('github')} className="flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 text-sm hover:bg-neutral-800 disabled:opacity-50"><GitHubIcon/> GitHub</button></div>
        <div className="relative my-5"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-800"/></div><div className="relative flex justify-center"><span className="bg-neutral-950 px-3 text-xs text-neutral-600">OR CONTINUE WITH EMAIL</span></div></div>
        <form onSubmit={submit} className="space-y-4"><label className="block"><span className="mb-1.5 block text-sm text-neutral-300">Email</span><div className="relative"><Mail className="absolute left-3 top-3.5 text-neutral-600" size={17}/><input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" placeholder="you@example.com"/></div></label><label className="block"><span className="mb-1.5 block text-sm text-neutral-300">Password</span><div className="relative"><input required minLength={6} type={show?'text':'password'} autoComplete={mode==='signin'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pl-3 pr-11 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" placeholder="••••••••"/><button type="button" aria-label={show?'Hide password':'Show password'} onClick={()=>setShow(!show)} className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-300">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label><button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-medium shadow-lg shadow-indigo-600/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{loading&&<Loader2 size={17} className="animate-spin"/>}{mode==='signin'?'Sign In':'Create Account'}</button></form>
        {mode==='signup' && <p className="mt-4 text-center text-xs leading-5 text-neutral-600">By creating an account, you agree to use SparkAgent responsibly.</p>}
      </section><p className="mt-6 text-center text-xs text-neutral-600">Secure authentication powered by Supabase</p>
    </div>
  </main>
}
