import { adminSupabase } from '@/lib/supabase/admin'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ booking_id?: string; capture?: string; slug?: string }>
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { booking_id, capture, slug } = await searchParams
  const isDeposit = capture === 'manual'

  // `slug` is passed directly for deposit flows (no booking_id yet).
  // `booking_id` is used for pre-created booking flows to look up the slug.
  let tenantSlug = slug ?? ''
  if (!tenantSlug && booking_id) {
    const { data: booking } = await adminSupabase
      .from('bookings')
      .select('tenant_id')
      .eq('id', booking_id)
      .single()
    if (booking) {
      const { data: tenant } = await adminSupabase
        .from('tenants')
        .select('slug')
        .eq('id', (booking as { tenant_id: string }).tenant_id)
        .single()
      tenantSlug = (tenant as { slug: string } | null)?.slug ?? ''
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface px-4">
      <div className="max-w-sm w-full bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center gap-6">

        {/* Icon */}
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
          isDeposit ? 'bg-accent/15 border border-accent/25' : 'bg-emerald-500/15 border border-emerald-500/25'
        }`}>
          {isDeposit ? (
            <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-ink">
            {isDeposit ? 'Deposit received' : 'Booking confirmed'}
          </h1>
          <p className="text-sm text-secondary leading-relaxed">
            {isDeposit
              ? "Your deposit has been held securely. We'll review your booking and send a confirmation once it's approved — your card won't be charged until then."
              : 'Your booking is confirmed. A confirmation email with all the details is on its way to you.'}
          </p>
        </div>

        {/* Deposit status indicator */}
        {isDeposit && (
          <div className="w-full flex flex-col gap-2.5">
            {[
              { label: 'Deposit held',          done: true  },
              { label: 'Awaiting approval',      done: false },
              { label: 'Booking confirmed',      done: false },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                  done ? 'bg-accent/20 border border-accent/40' : 'border border-border'
                }`}>
                  {done && (
                    <svg className="h-3 w-3 text-accent" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6l2.5 2.5 4.5-5" />
                    </svg>
                  )}
                </div>
                <span className={`text-xs ${done ? 'text-ink font-medium' : 'text-muted'}`}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {tenantSlug && (
          <Link
            href={`/book/${tenantSlug}`}
            className="text-sm text-secondary hover:text-ink underline underline-offset-2 transition-colors"
          >
            Book another slot
          </Link>
        )}
      </div>
    </div>
  )
}
