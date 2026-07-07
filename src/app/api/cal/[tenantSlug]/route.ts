import { NextRequest, NextResponse } from 'next/server'
import { tenantService } from '@/services/tenantService'
import { bookingService } from '@/services/bookingService'
import { generateCalendarFeed, type FeedEvent } from '@/lib/ics'
import type { Booking } from '@/types'

function dtUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function dtFloat(date: string, time: string): string {
  // Floating time (no Z) — calendar apps show it at this local time
  return `${date.replace(/-/g, '')}T${time.replace(/:/g, '').padEnd(6, '0')}`
}

function bookingToFeedEvent(b: Booking): FeedEvent | null {
  let dtStart: string
  let dtEnd: string

  if (b.startTimeIso && b.endTimeIso) {
    dtStart = dtUtc(b.startTimeIso)
    dtEnd   = dtUtc(b.endTimeIso)
  } else if (b.proposedDate && b.proposedTime) {
    dtStart = dtFloat(b.proposedDate, b.proposedTime)
    // Default 1-hour duration for open-book enquiries
    const ms = new Date(`${b.proposedDate}T${b.proposedTime}:00`).getTime() + 60 * 60 * 1000
    const end = new Date(ms)
    dtEnd = dtFloat(
      end.toISOString().slice(0, 10),
      end.toISOString().slice(11, 16),
    )
  } else if (b.proposedDate) {
    dtStart = dtFloat(b.proposedDate, '09:00')
    dtEnd   = dtFloat(b.proposedDate, '10:00')
  } else {
    return null
  }

  const summary = b.sessionType ? `${b.sessionType} - ${b.name}` : b.name
  const description = [
    b.email,
    b.phone,
    b.chatSummary ? `Notes: ${b.chatSummary}` : b.notes,
  ].filter(Boolean).join('\n')

  return {
    uid: b.id,
    summary,
    description,
    dtStart,
    dtEnd,
    status: b.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE',
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params

  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return new NextResponse('Not found', { status: 404 })

  const allBookings = await bookingService.getBookings(tenant.id)

  const events = allBookings
    .filter(b => b.status === 'confirmed' || b.status === 'pending')
    .map(bookingToFeedEvent)
    .filter((e): e is FeedEvent => e !== null)

  const ics = generateCalendarFeed(`${tenant.name} - Orla Bookings`, events)

  return new NextResponse(ics, {
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${tenantSlug}-bookings.ics"`,
      'Cache-Control':       'no-cache, must-revalidate',
    },
  })
}
