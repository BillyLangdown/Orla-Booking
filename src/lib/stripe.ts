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
  bookingId:       string
  tenantId:        string
  stripeAccountId: string
  amountInSmallest: number
  currency:        string
  label:           string
  customerEmail:   string
  cancelUrl:       string
  appUrl:          string
}): Promise<string> {
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
      success_url:    `${opts.appUrl}/payment/success?booking_id=${opts.bookingId}`,
      cancel_url:     opts.cancelUrl,
      metadata: {
        booking_id: opts.bookingId,
        tenant_id:  opts.tenantId,
      },
    },
    { stripeAccount: opts.stripeAccountId },
  )
  if (!session.url) throw new Error('No checkout URL returned from Stripe')
  return session.url
}
