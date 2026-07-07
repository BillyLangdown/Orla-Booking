import { NextRequest, NextResponse } from 'next/server'
import { connectGoogleAccount } from '@/lib/google'

export async function GET(req: NextRequest) {
  const code  = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state') ?? ''

  // state is either "tenantId" or "tenantId|encodedReturnTo"
  const pipeIdx  = state.indexOf('|')
  const tenantId = pipeIdx === -1 ? state : state.slice(0, pipeIdx)
  const returnTo = pipeIdx === -1 ? null : decodeURIComponent(state.slice(pipeIdx + 1))

  const fallback  = new URL('/dashboard/settings?tab=Integrations', req.url)
  const finalDest = returnTo ? new URL(returnTo, req.url) : fallback

  if (!code || !tenantId) return NextResponse.redirect(finalDest)

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    const redirectUri = `${appUrl}/api/auth/google/callback`
    await connectGoogleAccount(tenantId, code, redirectUri)
  } catch (err) {
    console.error('[auth/google/callback]', err)
  }

  return NextResponse.redirect(finalDest)
}
