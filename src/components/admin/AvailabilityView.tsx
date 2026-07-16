'use client'

import { useState } from 'react'
import type { AvailabilitySlot, BookingMode, Resource } from '@/types'
import { saveGeneralAvailabilityAction } from '@/app/actions'
import AvailabilityList from './AvailabilityList'
import SlotCreateForm from './SlotCreateForm'
import Button from '@/components/ui/Button'

interface Props {
  slots: AvailabilitySlot[]
  tenantId: string
  resources: Resource[]
  sessionTypes?: string[]
  bookingMode?: BookingMode
  generalAvailability?: string
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
        active
          ? 'bg-accent text-white'
          : 'bg-card border border-border text-secondary hover:text-ink hover:border-secondary/40',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

export default function AvailabilityView({ slots, tenantId, resources, sessionTypes, bookingMode, generalAvailability }: Props) {
  const [filterService,  setFilterService]  = useState('')
  const [filterResource, setFilterResource] = useState('')
  const [hoursText, setHoursText]           = useState(generalAvailability ?? '')
  const [saving, setSaving]                 = useState(false)
  const [saved, setSaved]                   = useState(false)

  async function saveHours() {
    setSaving(true); setSaved(false)
    await saveGeneralAvailabilityAction(tenantId, hoursText)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (bookingMode === 'open') {
    return (
      <div className="flex flex-col gap-6 max-w-xl">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Working hours</h1>
          <p className="text-sm text-secondary mt-0.5">
            Describe when you&apos;re available. Orla shares this with customers during their enquiry chat.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Your availability</label>
            <textarea
              value={hoursText}
              onChange={e => setHoursText(e.target.value)}
              rows={6}
              placeholder={`e.g. We work Monday to Friday, 7:30am – 5:00pm. We do not take bookings on bank holidays or weekends. Lead time is typically 2–3 weeks for new projects.`}
              className="w-full bg-card border border-border px-3 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 transition rounded-md resize-none"
            />
            <p className="text-xs text-secondary">
              Orla will use this to guide customers when they suggest a date or time in the chat.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" onClick={saveHours} loading={saving}>Save</Button>
            {saved && <span className="text-sm text-accent font-medium">Saved</span>}
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl px-5 py-4">
          <p className="text-xs font-medium text-secondary uppercase tracking-widest mb-2">Why no time slots?</p>
          <p className="text-sm text-secondary leading-relaxed">
            You&apos;re using Open Enquiry mode. Customers chat with Orla to describe what they need, then you confirm or decline the enquiry manually. There are no fixed time slots to manage.
          </p>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const upcomingSlots = slots.filter(s => s.date >= today)

  const serviceOptions  = [...new Set(upcomingSlots.map(s => s.sessionType).filter(Boolean))].sort() as string[]
  const resourceOptions = resources.map(r => r.name)

  const allResources = (slot: typeof upcomingSlots[0]) =>
    [slot.staff, slot.location, slot.equipment, slot.resource].filter(Boolean)

  const filtered = upcomingSlots.filter(s =>
    (!filterService  || s.sessionType === filterService) &&
    (!filterResource || allResources(s).some(r => r!.name === filterResource))
  )

  const slotCount = filtered.length

  return (
    <div className="flex flex-col gap-6 max-w-xl">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Availability</h1>
          <p className="text-sm text-secondary mt-0.5">
            {upcomingSlots.length === 0
              ? 'No slots scheduled yet.'
              : `${slotCount} slot${slotCount !== 1 ? 's' : ''}${filterService || filterResource ? ' matching' : ' scheduled'}`}
          </p>
        </div>
        <div className="shrink-0 pt-0.5">
          <SlotCreateForm tenantId={tenantId} resources={resources} sessionTypes={sessionTypes} />
        </div>
      </div>

      {/* Filters — only shown when there's something to filter */}
      {(serviceOptions.length > 1 || resourceOptions.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {serviceOptions.length > 1 && serviceOptions.map(s => (
            <FilterChip
              key={s}
              label={s}
              active={filterService === s}
              onClick={() => setFilterService(v => v === s ? '' : s)}
            />
          ))}
          {resourceOptions.map(r => (
            <FilterChip
              key={r}
              label={r}
              active={filterResource === r}
              onClick={() => setFilterResource(v => v === r ? '' : r)}
            />
          ))}
          {(filterService || filterResource) && (
            <button
              type="button"
              onClick={() => { setFilterService(''); setFilterResource('') }}
              className="px-3 py-1.5 text-xs font-medium text-muted hover:text-secondary transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      <AvailabilityList slots={filtered} />
    </div>
  )
}
