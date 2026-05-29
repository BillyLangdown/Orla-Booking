import { tenantService } from '@/services/tenantService'
import SettingsForm from '@/components/admin/SettingsForm'

const DEMO_TENANT_ID = '7e72666f-53ac-4080-b27b-14073217bab4'

export default async function SettingsPage() {
  const tenant = await tenantService.getTenantById(DEMO_TENANT_ID)
  if (!tenant) return <p className="text-sm text-secondary">Tenant not found.</p>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Settings</h1>
        <p className="text-sm text-secondary mt-0.5">Manage your business details and branding.</p>
      </div>
      <SettingsForm tenant={tenant} />
    </div>
  )
}
