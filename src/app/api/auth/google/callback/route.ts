import { NextRequest, NextResponse } from 'next/server'
import { connectGoogleAccount } from '@/lib/google'

export async function GET(req: NextRequest) {
  const code     = req.nextUrl.searchParams.get('code')
  const tenantId = req.nextUrl.searchParams.get('state')
  const settingsUrl = new URL('/dashboard/settings?tab=Integrations', req.url)

  if (!code || !tenantId) return NextResponse.redirect(settingsUrl)

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    const redirectUri = `${appUrl}/api/auth/google/callback`
    await connectGoogleAccount(tenantId, code, redirectUri)
  } catch (err) {
    console.error('[auth/google/callback]', err)
  }

  // Always redirect back to settings - never 404
  return NextResponse.redirect(settingsUrl)
}
