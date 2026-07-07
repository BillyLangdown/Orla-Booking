import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { tenantService } from '@/services/tenantService'
import { availabilityService } from '@/services/availabilityService'
import BookingPageClient from '@/components/booking/BookingPageClient'
import OpenBookChat from '@/components/booking/OpenBookChat'

interface Props {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params
  const tenant = await tenantService.getTenantBySlug(slug)
  if (!tenant) return {}
  return {
    title: `Book - ${tenant.name}`,
    description: tenant.description,
  }
}

export default async function BookingPage({ params }: Props) {
  const { tenant: slug } = await params

  const tenant = await tenantService.getTenantBySlug(slug)
  if (!tenant) notFound()

  if (tenant.bookingMode === 'open') {
    return <OpenBookChat tenant={tenant} />
  }

  const allSlots = await availabilityService.getSlots(tenant.id)
  const configuredTypes = tenant.sessionTypes ?? []
  // Slots with no sessionType ("All services") are always shown.
  // Slots with a sessionType are only shown if it matches a configured type.
  const slots = configuredTypes.length > 0
    ? allSlots.filter((s) => !s.sessionType || configuredTypes.includes(s.sessionType))
    : allSlots

  return <BookingPageClient tenant={tenant} slots={slots} />
}
