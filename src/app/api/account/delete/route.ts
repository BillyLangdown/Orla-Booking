import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { deleteBusinessAction } from '@/app/platform/actions'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const accessToken = authHeader.replace(/^bearer /i, '').trim()
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // TEMP DEBUG - remove before deploying anything else
  if (req.headers.get('x-debug-config') === '1') {
    const clientWithHeader = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { global: { headers: { authorization: `Bearer ${accessToken}` } } },
    )
    const withHeaderResult = await clientWithHeader.auth.getUser(accessToken)

    const plainClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    )
    const plainResult = await plainClient.auth.getUser(accessToken)

    return NextResponse.json({
      withGlobalHeader: {
        hasUser: !!withHeaderResult.data.user,
        error: withHeaderResult.error?.message ?? null,
      },
      plainClientNoHeader: {
        hasUser: !!plainResult.data.user,
        error: plainResult.error?.message ?? null,
      },
    })
  }

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { authorization: `Bearer ${accessToken}` } } },
  )
  const { data: { user } } = await userClient.auth.getUser(accessToken)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: tenantId, error: tidErr } = await userClient.rpc('get_my_tenant_id')
  if (tidErr || !tenantId) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const { error } = await deleteBusinessAction(tenantId as string)
  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ success: true })
}
