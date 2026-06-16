'use client'

import { useState } from 'react'
import type { Tenant } from '@/types'
import { disconnectGoogleAction } from '@/app/actions'
import Button from '@/components/ui/Button'

interface Props { tenant: Tenant }

export default function GoogleConnect({ tenant }: Props) {
  const [connecting, setConnecting]       = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  function handleConnect() {
    setConnecting(true)
    window.location.href = `/api/auth/google?tenant_id=${tenant.id}`
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect Google? Calendar sync and Gmail search for Orla will stop working until you reconnect.')) return
    setDisconnecting(true)
    await disconnectGoogleAction(tenant.id)
    setDisconnecting(false)
  }

  if (tenant.googleConnected) {
    return (
      <div className="bg-white shadow-sm p-4 sm:p-5 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-sm font-semibold text-ink">Google</p>
          {tenant.googleConnectedEmail && (
            <p className="text-[11px] text-muted truncate">{tenant.googleConnectedEmail}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Connected
          </span>
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-xs text-secondary hover:text-rose-500 transition-colors disabled:opacity-50"
          >
            {disconnecting ? 'Disconnecting…' : 'Disconnect'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm p-4 sm:p-5 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-ink">Connect your Google account</p>
        <p className="text-xs text-secondary mt-1 leading-relaxed">
          Confirmed bookings appear automatically in your Google Calendar, and Orla can search your Gmail to answer questions about customer replies.
        </p>
      </div>
      <Button type="button" onClick={handleConnect} loading={connecting} className="self-start">
        Connect Google →
      </Button>
    </div>
  )
}
