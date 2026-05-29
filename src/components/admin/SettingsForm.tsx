'use client'

import { useState, FormEvent } from 'react'
import type { Tenant, UpdateTenantInput } from '@/types'
import { updateTenantAction } from '@/app/actions'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  tenant: Tenant
}

const labelClass = 'text-xs font-medium uppercase tracking-wide text-secondary'

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-14 cursor-pointer rounded-md border border-border bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          pattern="^#[0-9a-fA-F]{6}$"
          placeholder="#000000"
          className="w-28 rounded-md border border-border bg-white px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-accent transition"
        />
      </div>
    </div>
  )
}

export default function SettingsForm({ tenant }: Props) {
  const [name, setName]               = useState(tenant.name)
  const [email, setEmail]             = useState(tenant.email)
  const [phone, setPhone]             = useState(tenant.phone)
  const [address, setAddress]         = useState(tenant.address)
  const [description, setDescription] = useState(tenant.description)
  const [primaryColor, setPrimary]    = useState(tenant.branding.primaryColor)
  const [accentColor, setAccent]      = useState(tenant.branding.accentColor)

  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const input: UpdateTenantInput = {
        name, email, phone, address, description, primaryColor, accentColor,
      }
      await updateTenantAction(tenant.id, input)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-xl">

      {/* Business info */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-ink">Business info</h2>
        <div className="rounded-xl border border-border bg-white p-5 flex flex-col gap-4">
          <Input label="Business name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent transition resize-none"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-ink">Branding</h2>
        <div className="rounded-xl border border-border bg-white p-5 flex flex-col gap-4">
          <ColorField label="Primary colour" value={primaryColor} onChange={setPrimary} />
          <ColorField label="Accent colour"  value={accentColor}  onChange={setAccent} />
          <div className="flex items-center gap-3 pt-1">
            <div className="h-8 w-8 rounded" style={{ backgroundColor: primaryColor }} />
            <div className="h-8 w-8 rounded" style={{ backgroundColor: accentColor }} />
            <span className="text-xs text-secondary">Preview</span>
          </div>
        </div>
      </div>

      {/* Read-only info */}
      <div className="rounded-xl border border-border bg-white p-5 flex flex-col gap-2">
        <p className={`${labelClass} mb-1`}>Read only</p>
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Slug</span>
          <span className="font-mono text-ink">{tenant.slug}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Tenant ID</span>
          <span className="font-mono text-xs text-ink">{tenant.id}</span>
        </div>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex items-center gap-4">
        <Button type="submit" loading={saving}>Save changes</Button>
        {saved && <span className="text-sm text-green-600">Saved ✓</span>}
      </div>

    </form>
  )
}
