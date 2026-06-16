import { getAuthTenant } from '@/lib/auth'
import { bookingService } from '@/services/bookingService'
import AskOrla from '@/components/admin/AskOrla'

export default async function AskOrlaPage() {
  const tenant = await getAuthTenant()
  const bookings = await bookingService.getBookings(tenant.id)

  return <AskOrla bookings={bookings} />
}
