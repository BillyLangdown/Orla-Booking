'use client'

import { useState } from 'react'
import type { Tenant } from '@/types'

interface Props { tenant: Tenant }

export default function CalendarFeedLink({ tenant }: Props) {
  const [copied, setCopied] = useState(false)

  const icalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/cal/${tenant.slug}?token=${tenant.icalToken}`
    : `/api/cal/${tenant.slug}?token=${tenant.icalToken}`

  return (
    <div className="bg-card shadow-sm p-4 sm:p-5 flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-ink">Apple Calendar, Outlook, and others</p>
        <p className="text-xs text-secondary mt-0.5">
          Subscribe to your booking feed. Any calendar app that supports iCal can use this link. Keep it private — anyone with this link can see your bookings.
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={icalUrl}
          className="flex-1 border border-border bg-subtle px-3 py-2 text-xs font-mono text-secondary focus:outline-none"
          onFocus={e => e.target.select()}
        />
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(icalUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="shrink-0 px-3 py-2 bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-xs text-muted">
        In Apple Calendar: File &gt; New Calendar Subscription and paste this link. In Outlook: Add calendar &gt; From internet.
      </p>
    </div>
  )
}
