'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteSlotAction } from '@/app/actions'

interface Props {
  slotId: string
  hasBookings: boolean
}

export default function DeleteSlotButton({ slotId, hasBookings }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handleClick() {
    if (hasBookings && !confirming) {
      setConfirming(true)
      return
    }
    startTransition(async () => {
      await deleteSlotAction(slotId)
      router.refresh()
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-secondary">Remove slot?</span>
        <button
          onClick={handleClick}
          disabled={pending}
          className="text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
        >
          Yes, remove
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-secondary hover:text-ink"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="ml-auto text-secondary hover:text-rose-500 transition-colors disabled:opacity-50"
      aria-label="Delete slot"
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <path d="M5 5.5V11M7.5 5.5V11M10 5.5V11M2 3.5h11M6 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M13 3.5l-.8 9a1 1 0 01-1 .9H3.8a1 1 0 01-1-.9L2 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
