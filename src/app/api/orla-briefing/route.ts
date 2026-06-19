import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { tenantService } from '@/services/tenantService'
import { bookingService } from '@/services/bookingService'
import type { Booking, Tenant } from '@/types'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM   = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!resend) {
    console.warn('[orla-briefing] RESEND_API_KEY not set — skipping')
    return NextResponse.json({ skipped: true })
  }

  const tenants = await tenantService.getAllTenants()
  const todayStr = new Date().toISOString().split('T')[0]
  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  let sent = 0

  for (const tenant of tenants) {
    if (!tenant.email || !tenant.onboardingCompleted) continue
    try {
      const allBookings = await bookingService.getBookings(tenant.id)
      const todayBookings = allBookings
        .filter(b => b.slot?.date === todayStr && b.status !== 'cancelled')
        .sort((a, b) => (a.slot?.startTime ?? '').localeCompare(b.slot?.startTime ?? ''))
      const pending = allBookings.filter(b => b.status === 'pending' || b.status === 'awaiting_payment')

      if (todayBookings.length === 0 && pending.length === 0) continue

      const html = buildBriefingHtml(tenant, dateLabel, todayBookings, pending)

      const subject = todayBookings.length > 0
        ? `${tenant.name} — ${todayBookings.length} session${todayBookings.length === 1 ? '' : 's'} today`
        : `${tenant.name} — ${pending.length} pending booking${pending.length === 1 ? '' : 's'}`

      await resend.emails.send({ from: FROM, to: tenant.email, subject, html })
      sent++
    } catch (err) {
      console.error(`[orla-briefing] Failed for tenant ${tenant.id}:`, err)
    }
  }

  return NextResponse.json({ ok: true, sent })
}

function buildBriefingHtml(tenant: Tenant, dateLabel: string, today: Booking[], pending: Booking[]): string {
  const accent = tenant.branding?.accentColor ?? '#0d9488'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://app.orla.to')

  const todayRows = today.map(b => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;color:#64748b;font-size:13px;width:80px;">${b.slot?.startTime ?? ''}</td>
      <td style="padding:10px 0;font-size:13px;font-weight:500;">${b.name}</td>
      <td style="padding:10px 0;font-size:13px;color:#64748b;text-align:right;">${b.sessionType}</td>
    </tr>`).join('')

  const pendingRows = pending.map(b => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 0;font-size:13px;font-weight:500;">${b.name}</td>
      <td style="padding:10px 0;font-size:13px;color:#64748b;">${b.sessionType}</td>
      <td style="padding:10px 0;text-align:right;">
        <span style="display:inline-block;padding:2px 8px;background:#fef9c3;color:#854d0e;border-radius:999px;font-size:11px;font-weight:600;">
          ${b.status === 'awaiting_payment' ? 'Awaiting payment' : 'Pending'}
        </span>
      </td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#0f172a;background:#f8fafc;margin:0;padding:32px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
    <div style="background:${accent};padding:24px 28px;">
      <p style="margin:0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.1em;">Daily Briefing</p>
      <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#ffffff;">${dateLabel}</p>
    </div>
    <div style="padding:28px;">

      ${today.length > 0 ? `
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">
        Today's sessions — ${today.length}
      </p>
      <table style="width:100%;border-collapse:collapse;">
        ${todayRows}
      </table>` : `
      <p style="margin:0 0 20px;font-size:14px;color:#94a3b8;">No sessions scheduled for today.</p>`}

      ${pending.length > 0 ? `
      <p style="margin:${today.length > 0 ? '24px' : '0'} 0 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">
        Needs attention — ${pending.length}
      </p>
      <table style="width:100%;border-collapse:collapse;">
        ${pendingRows}
      </table>` : ''}

      <div style="margin-top:28px;border-top:1px solid #e2e8f0;padding-top:20px;">
        <a href="${appUrl}/dashboard/ask-orla"
          style="display:inline-block;padding:11px 20px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;border-radius:8px;margin-right:10px;">
          Ask Orla
        </a>
        <a href="${appUrl}/dashboard/bookings"
          style="display:inline-block;padding:11px 20px;background:#ffffff;color:#0f172a;text-decoration:none;font-size:13px;font-weight:600;border-radius:8px;border:1.5px solid #e2e8f0;">
          View bookings
        </a>
      </div>
    </div>
  </div>
</body>
</html>`
}
