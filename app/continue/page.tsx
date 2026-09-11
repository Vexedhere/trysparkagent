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
  redirect(`https://agent.sparkagent.in.net/c/${userCode}`)
}
