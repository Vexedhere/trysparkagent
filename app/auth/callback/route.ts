import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const AGENT_URL = 'https://agent.sparkagent.in.net'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const supabase = await createClient()

  if (!code) return NextResponse.redirect(`${AGENT_URL}?auth=failed`)

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(`${AGENT_URL}?auth=failed`)

  return NextResponse.redirect(AGENT_URL)
}
