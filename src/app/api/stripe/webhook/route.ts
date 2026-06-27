import { NextRequest, NextResponse } from 'next/server'
import { stripe, cancelPaymentIntent } from '@/lib/stripe'
import { adminSupabase } from '@/lib/supabase/admin'
import { bookingService } from '@/services/bookingService'
import { tenantService } from '@/services/tenantService'
import { sendBookingConfirmation, sendAdminNotification } from '@/lib/email'
import { createCalendarEvent } from '@/lib/google'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return new NextResponse('Missing stripe-signature', { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('[webhook] signature verification failed:', err)
    return new NextResponse(
      `Webhook error: ${err instanceof Error ? err.message : 'Unknown'}`,
      { status: 400 },
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session     = event.data.object as Stripe.Checkout.Session
    const bookingId   = session.metadata?.booking_id
    const captureMode = session.metadata?.capture_mode

    if (bookingId) {
      // ── Pre-created booking: just update it ──────────────────────────────────
      if (captureMode === 'manual') {
        // Card authorized, hold placed — keep pending, store PI, notify owner to confirm
        await adminSupabase
          .from('bookings')
          .update({
            stripe_payment_intent_id: session.payment_intent as string | null,
            payment_authorized_at:    new Date().toISOString(),
          })
          .eq('id', bookingId)

        const booking = await bookingService.getBookingById(bookingId)
        if (booking) {
          const tenant = await tenantService.getTenantById(booking.tenantId)
          if (tenant) {
            let startTime = booking.startTimeIso
            let endTime   = booking.endTimeIso
            if (!startTime || !endTime) {
              const { data: slot } = await adminSupabase
                .from('availability_slots')
                .select('start_time, end_time')
                .eq('id', booking.slotId)
                .single()
              startTime = (slot?.start_time as string) ?? undefined
              endTime   = (slot?.end_time   as string) ?? undefined
            }
            if (startTime && endTime) {
              await sendAdminNotification(booking, startTime, endTime, tenant)
            }
          }
        }
      } else {
        // Automatic capture — confirm booking and email customer
        await adminSupabase
          .from('bookings')
          .update({
            status:                   'confirmed',
            stripe_payment_intent_id: session.payment_intent as string | null,
            amount_paid:              session.amount_total,
          })
          .eq('id', bookingId)

        const booking = await bookingService.getBookingById(bookingId)
        if (booking) {
          const tenant = await tenantService.getTenantById(booking.tenantId)
          if (tenant) {
            let startTime = booking.startTimeIso
            let endTime   = booking.endTimeIso
            if (!startTime || !endTime) {
              const { data: slot } = await adminSupabase
                .from('availability_slots')
                .select('start_time, end_time')
                .eq('id', booking.slotId)
                .single()
              startTime = (slot?.start_time as string) ?? undefined
              endTime   = (slot?.end_time   as string) ?? undefined
            }
            if (startTime && endTime) {
              await sendBookingConfirmation(booking, startTime, endTime, tenant)
              if (tenant.googleConnected) {
                try {
                  await createCalendarEvent(tenant.id, booking, startTime, endTime)
                } catch {
                  // calendar sync failures are non-fatal
                }
              }
            }
          }
        }
      }

    } else if (session.metadata?.slot_id) {
      // ── Deposit flow: create booking now from Stripe metadata ─────────────────
      // The booking was not created before checkout — slot stays available until
      // payment is confirmed here.
      const tenantId    = session.metadata.tenant_id ?? ''
      const slotId      = session.metadata.slot_id
      const resourceId  = session.metadata.resource_id ?? ''
      const name        = session.metadata.customer_name ?? ''
      const email       = session.metadata.customer_email ?? ''
      const phone       = session.metadata.customer_phone || undefined
      const sessionType = session.metadata.session_type ?? ''
      const startTime   = session.metadata.start_time ?? ''
      const endTime     = session.metadata.end_time   ?? ''
      const intakeJson  = session.metadata.intake_json
      const intakeAnswers: Record<string, string> = intakeJson
        ? (JSON.parse(intakeJson) as Record<string, string>)
        : {}

      if (!tenantId || !slotId || !startTime || !endTime) {
        console.error('[webhook] deposit flow: missing required metadata fields', session.metadata)
        return new NextResponse('OK', { status: 200 })
      }

      const tenant = await tenantService.getTenantById(tenantId)

      try {
        const booking = await bookingService.createBooking({
          tenantId,
          slotId,
          resourceId,
          name,
          email,
          phone,
          sessionType,
          startTime,
          endTime,
          intakeAnswers,
          status: 'pending',
        })

        await adminSupabase
          .from('bookings')
          .update({
            stripe_payment_intent_id: session.payment_intent as string | null,
            payment_authorized_at:    new Date().toISOString(),
          })
          .eq('id', booking.id)

        if (tenant) {
          await sendAdminNotification(booking, startTime, endTime, tenant)
        }
      } catch (err) {
        // Slot filled up between checkout start and payment confirmation.
        // Cancel the hold so the customer is not charged.
        console.error('[webhook] deposit flow: failed to create booking (slot likely full):', err)
        if (session.payment_intent && tenant?.stripeAccountId) {
          try {
            await cancelPaymentIntent(session.payment_intent as string, tenant.stripeAccountId)
          } catch (cancelErr) {
            console.error('[webhook] deposit flow: failed to cancel payment intent:', cancelErr)
          }
        }
      }
    }
  }

  return new NextResponse('OK', { status: 200 })
}
