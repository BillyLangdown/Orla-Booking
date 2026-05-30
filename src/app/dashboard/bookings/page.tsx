import { bookingService } from '@/services/bookingService'
import { getAuthTenant } from '@/lib/auth'
import BookingsView from '@/components/admin/BookingsView'

export default async function BookingsPage() {
  const tenant   = await getAuthTenant()
  const bookings = await bookingService.getBookings(tenant.id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Bookings</h1>
        <p className="text-sm text-secondary mt-0.5">
          {bookings.length > 0 ? `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} total` : 'No bookings yet — share your booking link to get started.'}
        </p>
      </div>
      <BookingsView bookings={bookings} />
    </div>
  )
}
