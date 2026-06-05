import { adminSupabase } from '@/lib/supabase/admin'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ booking_id?: string }>
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { booking_id } = await searchParams

  let tenantSlug = ''
  if (booking_id) {
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
    <div className="min-h-dvh flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="max-w-sm w-full bg-white shadow-sm p-8 flex flex-col items-center text-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center bg-emerald-100">
          <svg
            className="h-7 w-7 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-ink">Payment received</h1>
          <p className="text-sm text-secondary leading-relaxed">
            Your booking is confirmed. A confirmation email with all the details is on its way to you.
          </p>
        </div>
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
