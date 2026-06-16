import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@/lib/google'

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenant_id')
  if (!tenantId) return NextResponse.redirect(new URL('/dashboard/settings', req.url))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
  const redirectUri = `${appUrl}/api/auth/google/callback`

  return NextResponse.redirect(getGoogleAuthUrl(tenantId, redirectUri))
}
