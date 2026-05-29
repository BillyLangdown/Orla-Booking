import { getAuthTenant } from '@/lib/auth'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function SettingsPage() {
  const tenant = await getAuthTenant()

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
