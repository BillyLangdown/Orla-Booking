import { availabilityService } from '@/services/availabilityService'
import { resourceService } from '@/services/resourceService'
import AvailabilityList from '@/components/admin/AvailabilityList'
import SlotCreateForm from '@/components/admin/SlotCreateForm'

const DEMO_TENANT_ID = '7e72666f-53ac-4080-b27b-14073217bab4'

export default async function AvailabilityPage() {
  const [slots, resources] = await Promise.all([
    availabilityService.getAllSlots(DEMO_TENANT_ID),
    resourceService.getResources(DEMO_TENANT_ID),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-ink">Availability</h1>
          <p className="text-sm text-secondary mt-0.5">{slots.length} slots configured</p>
        </div>
        <SlotCreateForm tenantId={DEMO_TENANT_ID} resources={resources} />
      </div>
      <AvailabilityList slots={slots} />
    </div>
  )
}
