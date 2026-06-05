'use client'

import { useState } from 'react'
import type { AvailabilitySlot } from '@/types'
import SlotCard, { type SlotPricing } from '@/components/booking/SlotCard'

interface Props {
  slots:    AvailabilitySlot[]
  pricing?: SlotPricing
  onSelect: (slot: AvailabilitySlot) => void
}

function formatDateHeading(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`)
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function SlotList({ slots, pricing, onSelect }: Props) {
  const [filter, setFilter] = useState<string>('All')

  const presentTypes = [...new Set(slots.map((s) => s.sessionType).filter(Boolean))].sort()
  const filtered = filter === 'All' ? slots : slots.filter((s) => s.sessionType === filter)

  const grouped = filtered.reduce<Record<string, AvailabilitySlot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      {presentTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(['All', ...presentTypes]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={[
                'px-3 py-1 text-xs font-medium transition-colors',
                filter === t
                  ? 'bg-ink text-white'
                  : 'bg-white border border-border text-secondary hover:text-ink',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-secondary py-8 text-center">
          {filter === 'All'
            ? 'No upcoming sessions available right now. Check back soon.'
            : `No available ${filter} sessions. Try a different type.`}
        </p>
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, dateSlots]) => (
            <div key={date} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary">
                {formatDateHeading(date)}
              </h3>
              <div className="flex flex-col gap-2">
                {dateSlots.map((slot) => (
                  <SlotCard key={slot.id} slot={slot} pricing={pricing} onSelect={onSelect} />
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  )
}
