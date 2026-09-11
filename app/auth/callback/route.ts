import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextParam = url.searchParams.get('next') || '/continue'
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/continue'
  const supabase = await createClient()

  if (!code) {
    return NextResponse.redirect(new URL('/?error=oauth_callback_failed', url.origin))
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/?error=oauth_callback_failed', url.origin))
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
