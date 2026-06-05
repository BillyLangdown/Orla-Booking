import { NextRequest, NextResponse } from 'next/server'
import { createConnectAccountLink } from '@/lib/stripe'
import { tenantService } from '@/services/tenantService'

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenant_id')
  if (!tenantId) return NextResponse.redirect(new URL('/dashboard/settings', req.url))

  const tenant = await tenantService.getTenantById(tenantId)
  if (!tenant?.stripeAccountId) {
    return NextResponse.redirect(new URL('/dashboard/settings', req.url))
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
  const url = await createConnectAccountLink(tenant.stripeAccountId, tenantId, appUrl)
  return NextResponse.redirect(url)
}
