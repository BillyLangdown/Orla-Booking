'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { Resource, LicenceType, CreateSlotInput } from '@/types'
import { createSlotAction } from '@/app/actions'
import Button from '@/components/ui/Button'

const LICENCE_TYPES: LicenceType[] = ['CBT', 'A1', 'A2', 'DAS', 'Refresher']

const LICENCE_DURATIONS: Record<LicenceType, { start: string; end: string }> = {
  CBT:       { start: '08:00', end: '17:00' },
  A1:        { start: '09:00', end: '13:00' },
  A2:        { start: '09:00', end: '13:00' },
  DAS:       { start: '09:00', end: '17:00' },
  Refresher: { start: '13:00', end: '17:00' },
}

interface Props {
  tenantId: string
  resources: Resource[]
}

const tomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

const today = () => new Date().toISOString().split('T')[0]

const selectClass =
  'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition'

export default function SlotCreateForm({ tenantId, resources }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [resourceId, setResourceId]   = useState(resources[0]?.id ?? '')
  const [licenceType, setLicenceType] = useState<LicenceType>('CBT')
  const [date, setDate]               = useState(tomorrow())
  const [startTime, setStartTime]     = useState('08:00')
  const [endTime, setEndTime]         = useState('17:00')
  const [capacity, setCapacity]       = useState(1)

  function handleLicenceChange(lt: LicenceType) {
    setLicenceType(lt)
    setStartTime(LICENCE_DURATIONS[lt].start)
    setEndTime(LICENCE_DURATIONS[lt].end)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!resourceId) return
    setError(null)
    setSubmitting(true)
    try {
      const input: CreateSlotInput = {
        tenantId, resourceId, licenceType, date, startTime, endTime, capacity,
      }
      await createSlotAction(input)
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create slot.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm">
        + Add slot
      </Button>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink">New availability slot</h2>
        <button
          onClick={() => setOpen(false)}
          className="text-secondary hover:text-ink text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Resource */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink uppercase tracking-wide">Instructor / resource</label>
          <select value={resourceId} onChange={(e) => setResourceId(e.target.value)} className={selectClass} required>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
            ))}
          </select>
        </div>

        {/* Licence type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink uppercase tracking-wide">Course type</label>
          <select
            value={licenceType}
            onChange={(e) => handleLicenceChange(e.target.value as LicenceType)}
            className={selectClass}
          >
            {LICENCE_TYPES.map((lt) => (
              <option key={lt} value={lt}>{lt}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={date}
            min={today()}
            onChange={(e) => setDate(e.target.value)}
            className={selectClass}
            required
          />
        </div>

        {/* Capacity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink uppercase tracking-wide">Capacity</label>
          <input
            type="number"
            min={1}
            max={20}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className={selectClass}
            required
          />
        </div>

        {/* Start time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink uppercase tracking-wide">Start time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={selectClass}
            required
          />
        </div>

        {/* End time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink uppercase tracking-wide">End time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={selectClass}
            required
          />
        </div>

        {error && (
          <p className="sm:col-span-2 text-xs text-rose-600">{error}</p>
        )}

        <div className="sm:col-span-2 flex gap-3 pt-1">
          <Button type="submit" loading={submitting}>Create slot</Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
