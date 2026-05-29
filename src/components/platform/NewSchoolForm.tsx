'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createSchoolAction } from '@/app/platform/actions'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const labelClass = 'text-xs font-medium uppercase tracking-wide text-secondary'
const selectClass = 'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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

export default function NewSchoolForm() {
  const router = useRouter()

  const [name, setName]               = useState('')
  const [slug, setSlug]               = useState('')
  const [email, setEmail]             = useState('')
  const [phone, setPhone]             = useState('')
  const [address, setAddress]         = useState('')
  const [description, setDescription] = useState('')
  const [primaryColor, setPrimary]    = useState('#1e293b')
  const [accentColor, setAccent]      = useState('#f97316')
  const [adminEmail, setAdminEmail]   = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  function handleNameChange(v: string) {
    setName(v)
    setSlug(slugify(v))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await createSchoolAction({
      name, slug, email, phone, address, description,
      primaryColor, accentColor, adminEmail, adminPassword,
    })
    if (result.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      router.push(`/platform/${result.tenantId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* School info */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-ink">School info</h2>
        <div className="rounded-xl border border-border bg-white p-5 flex flex-col gap-4">
          <Input
            label="School name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            placeholder="Southern Moto School"
          />
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Slug <span className="normal-case text-muted">(used in the booking URL)</span></label>
            <input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
              placeholder="southern-moto-school"
              className={selectClass}
            />
            {slug && (
              <p className="text-xs text-secondary">/book/{slug}</p>
            )}
          </div>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What students can expect…"
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

      {/* Admin login */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-ink">Admin login</h2>
        <div className="rounded-xl border border-border bg-white p-5 flex flex-col gap-4">
          <p className="text-xs text-secondary -mt-1">
            These credentials let the school owner log into their dashboard.
          </p>
          <Input
            label="Admin email"
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
            placeholder="owner@school.com"
          />
          <Input
            label="Password"
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
            placeholder="Min. 6 characters"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-600 rounded-md bg-rose-50 border border-rose-200 px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" loading={submitting}>Create school</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
      </div>

    </form>
  )
}
