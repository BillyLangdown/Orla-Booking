import { availabilityService } from '@/services/availabilityService'
import { resourceService } from '@/services/resourceService'
import { getAuthTenant } from '@/lib/auth'
import AvailabilityList from '@/components/admin/AvailabilityList'
import SlotCreateForm from '@/components/admin/SlotCreateForm'

export default async function AvailabilityPage() {
  const tenant = await getAuthTenant()

  const [slots, resources] = await Promise.all([
    availabilityService.getAllSlots(tenant.id),
    resourceService.getResources(tenant.id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-ink">Availability</h1>
          <p className="text-sm text-secondary mt-0.5">{slots.length} slots configured</p>
        </div>
        <SlotCreateForm tenantId={tenant.id} resources={resources} />
      </div>
      <AvailabilityList slots={slots} />
    </div>
  )
}
