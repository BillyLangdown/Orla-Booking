import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY is not set - Stripe features will not work')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
})

export async function createConnectAccountLink(
  accountId: string,
  tenantId: string,
  appUrl: string,
): Promise<string> {
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/api/stripe/connect/refresh?tenant_id=${tenantId}`,
    return_url:  `${appUrl}/api/stripe/connect/return?tenant_id=${tenantId}`,
    type: 'account_onboarding',
  })
  return link.url
}

export async function createCheckoutSession(opts: {
  bookingId?:       string
  tenantId:         string
  tenantSlug?:      string
  stripeAccountId:  string
  amountInSmallest: number
  currency:         string
  label:            string
  customerEmail:    string
  cancelUrl:        string
  appUrl:           string
  captureMethod:    'automatic' | 'manual'
  pendingBooking?: {
    slotId:        string
    resourceId:    string
    name:          string
    email:         string
    phone:         string
    sessionType:   string
    startTime:     string
    endTime:       string
    intakeAnswers: Record<string, string>
  }
}): Promise<string> {
  // Success URL: include booking_id when we have one (pre-created booking flows),
  // or slug+capture for the deposit flow where booking is created after payment.
  const successUrl = opts.bookingId
    ? `${opts.appUrl}/payment/success?booking_id=${opts.bookingId}&capture=${opts.captureMethod}`
    : `${opts.appUrl}/payment/success?capture=${opts.captureMethod}${opts.tenantSlug ? `&slug=${opts.tenantSlug}` : ''}`

  // Booking details for the deposit flow (stored in Stripe metadata, used by webhook)
  const pendingMeta: Record<string, string> = {}
  if (opts.pendingBooking) {
    const pb = opts.pendingBooking
    pendingMeta.slot_id        = pb.slotId
    pendingMeta.resource_id    = pb.resourceId
    pendingMeta.customer_name  = pb.name
    pendingMeta.customer_email = pb.email
    if (pb.phone) pendingMeta.customer_phone = pb.phone
    pendingMeta.session_type   = pb.sessionType
    pendingMeta.start_time     = pb.startTime
    pendingMeta.end_time       = pb.endTime

    // Intake answers: JSON-encode and include only if it fits in Stripe's 500-char value limit.
    // Individual answers are capped at 100 chars on the form, so this should always fit
    // for typical booking forms.
    const intakeJson = JSON.stringify(pb.intakeAnswers)
    if (intakeJson.length <= 490) {
      pendingMeta.intake_json = intakeJson
    }
  }

  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency:     opts.currency,
          product_data: { name: opts.label },
          unit_amount:  opts.amountInSmallest,
        },
        quantity: 1,
      }],
      mode:           'payment',
      customer_email: opts.customerEmail,
      success_url:    successUrl,
      cancel_url:     opts.cancelUrl,
      payment_intent_data: {
        capture_method: opts.captureMethod,
      },
      metadata: {
        ...(opts.bookingId ? { booking_id: opts.bookingId } : {}),
        tenant_id:    opts.tenantId,
        capture_mode: opts.captureMethod,
        ...pendingMeta,
      },
    },
    { stripeAccount: opts.stripeAccountId },
  )
  if (!session.url) throw new Error('No checkout URL returned from Stripe')
  return session.url
}

export async function capturePaymentIntent(
  paymentIntentId: string,
  stripeAccountId: string,
): Promise<number> {
  const pi = await stripe.paymentIntents.capture(
    paymentIntentId,
    {},
    { stripeAccount: stripeAccountId },
  )
  return pi.amount_received
}

export async function cancelPaymentIntent(
  paymentIntentId: string,
  stripeAccountId: string,
): Promise<void> {
  await stripe.paymentIntents.cancel(
    paymentIntentId,
    {},
    { stripeAccount: stripeAccountId },
  )
}
