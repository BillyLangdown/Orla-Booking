import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { adminSupabase } from '@/lib/supabase/admin'
import type { Booking, AvailabilitySlot } from '@/types'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  // Auth via Bearer token from iOS
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = auth.slice(7)

  // Validate token and get user
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser()
  if (authError || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get tenant
  const { data: userRow } = await adminSupabase
    .from('users')
    .select('tenant_id')
    .eq('email', user.email)
    .single()
  if (!userRow?.tenant_id) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 403 })
  }

  const { data: tenant } = await adminSupabase
    .from('tenants')
    .select('*')
    .eq('id', userRow.tenant_id)
    .single()

  try {
    const body = await req.json() as { query: string; bookings: Booking[]; slots: AvailabilitySlot[] }
    const { query, bookings = [], slots = [] } = body

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const bookingLines = bookings.map(b => {
      const parts: string[] = [`• [ID:${b.id}] ${b.name}`]
      if (b.sessionType) parts.push(`(${b.sessionType})`)
      if (b.status !== 'confirmed') parts.push(`[${b.status}]`)
      if (b.email) parts.push(`email: ${b.email}`)
      if (b.phone) parts.push(`phone: ${b.phone}`)
      if (b.notes) parts.push(`notes: ${b.notes}`)
      return parts.join(' ')
    })

    const slotLines = slots.map(s =>
      `• [SLOT:${s.id}] ${s.sessionType} · ${s.startTime}–${s.endTime} · spaces: ${s.capacity - s.booked}`
    )

    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: `You are Orla, a friendly assistant for ${tenant?.name ?? 'a booking business'}. Today is ${today}.

Reply in plain conversational text — no JSON, no markdown, no bullet symbols. Write as if texting a colleague. Keep it short and direct.

If asked for a daily rundown, summarise: today's bookings, any pending ones needing action, and anything else worth knowing. Be brief.`,
      messages: [
        {
          role: 'user',
          content: [
            `Bookings:\n${bookingLines.length ? bookingLines.join('\n') : 'No bookings yet.'}`,
            slotLines.length ? `\nSlots:\n${slotLines.join('\n')}` : '',
            `\nQuestion: ${query}`,
          ].join(''),
        },
      ],
    })

    const answer = message.content[0].type === 'text' ? message.content[0].text : 'No response.'
    return NextResponse.json({ answer })
  } catch (err) {
    console.error('[orla-mobile]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
