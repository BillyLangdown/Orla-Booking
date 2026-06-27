import { getAuthTenant } from '@/lib/auth'
import { bookingService } from '@/services/bookingService'
import { availabilityService } from '@/services/availabilityService'
import AskOrla from '@/components/admin/AskOrla'

export default async function AskOrlaPage() {
  const tenant = await getAuthTenant()
  const [allBookings, slots] = await Promise.all([
    bookingService.getBookings(tenant.id),
    availabilityService.getAllSlots(tenant.id),
  ])

  // Future bookings: always include regardless of status
  // Past bookings: only include confirmed/cancelled — pending/awaiting_payment in the
  // past are irrelevant and skew Orla's answers
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const bookings = allBookings.filter(b => {
    if (!b.slot?.date) return true
    const slotDate = new Date(b.slot.date)
    return slotDate >= today
  })

  return (
    <div className="flex flex-col h-[calc(100dvh-10rem)] md:h-[calc(100dvh-4rem)]">
      <AskOrla bookings={bookings} slots={slots} />
    </div>
  )
}
