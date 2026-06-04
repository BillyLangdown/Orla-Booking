import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { tenantService } from '@/services/tenantService'
import { generateICS } from '@/lib/ics'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const { data: booking } = await adminSupabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (!booking) return new NextResponse('Not found', { status: 404 })

  let startIso = booking.start_time as string | null
  let endIso   = booking.end_time   as string | null

  // Fall back to the linked slot if times weren't saved on the booking
  if (!startIso || !endIso) {
    const { data: slot } = await adminSupabase
      .from('availability_slots')
      .select('start_time, end_time')
      .eq('id', booking.slot_id)
      .single()
    startIso = slot?.start_time ?? null
    endIso   = slot?.end_time   ?? null
  }

  if (!startIso || !endIso) {
    return new NextResponse('Booking times unavailable', { status: 404 })
  }

  const tenant = await tenantService.getTenantById(booking.tenant_id)

  const summary = booking.session_type
    ? `${booking.session_type} – ${tenant?.name ?? 'Booking'}`
    : (tenant?.name ?? 'Booking')

  const icsContent = generateICS({
    uid:           booking.id,
    summary,
    description:   tenant ? `Booking with ${tenant.name}. Ref: ${booking.id}` : `Ref: ${booking.id}`,
    location:      tenant?.address || undefined,
    startIso,
    endIso,
    organizerName:  tenant?.name  ?? 'Booking',
    organizerEmail: tenant?.email ?? 'noreply@example.com',
  })

  return new NextResponse(icsContent, {
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="booking.ics"',
      'Cache-Control':       'no-store',
    },
  })
}
