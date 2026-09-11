import Link from 'next/link'
import { ArrowRight, LogOut, Sparkles, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ContinuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data, error } = await supabase.from('profiles').select('user_code').eq('id', user.id).maybeSingle()
  if (error) throw new Error(error.message)

  let userCode = data?.user_code
  if (!userCode) {
    const { data: created, error: insertError } = await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id' }).select('user_code').single()
    if (insertError) throw new Error(insertError.message)
    userCode = created.user_code
  }

  const agentUrl = `https://agent.sparkagent.in.net/c/${userCode}`

  return (
    <main className="spark-page">
      <div className="spark-background" aria-hidden="true">
        <div className="spark-grid" />
        <div className="spark-glow spark-glow-main" />
        <div className="spark-glow spark-glow-right" />
        <div className="spark-noise" />
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white">
          <span className="spark-logo"><Zap className="h-5 w-5 fill-white text-white" /></span>
          Spark<span className="text-indigo-300">Agent</span>
        </Link>
        <Link href="/" className="spark-nav-button">Home <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
      </header>

      <section className="spark-launch">
        <div className="spark-launch-card">
          <div className="spark-launch-icon"><Sparkles className="h-7 w-7 text-white" /></div>
          <h1 className="spark-launch-title">You’re <span>all set.</span></h1>
          <p className="spark-launch-subtitle">Your SparkAgent account is ready. Open your private AI workspace and start building.</p>
          <div className="spark-code">{userCode}</div>
          <div className="spark-launch-actions">
            <a href={agentUrl} className="spark-launch-primary">Open SparkAgent <ArrowRight className="h-4 w-4" /></a>
            <Link href="/" className="spark-launch-secondary">Back to home</Link>
          </div>
          <p className="mt-6 text-xs text-slate-600">Signed in as {user.email}</p>
        </div>
      </section>
    </main>
  )
}
