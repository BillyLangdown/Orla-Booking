import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'

// Invite/reset links are one-time-use tokens hit via a plain GET. Many email
// clients (Gmail's link scanner in particular) prefetch every link in an
// email server-side before the user ever opens it, which silently burns the
// token - the real user then taps the link and lands on /login with no error
// shown. To avoid that, GET no longer auto-verifies: it renders a page that
// requires a real tap, and only the resulting POST (which scanners never
// trigger, since they don't execute JS or submit forms) performs verifyOtp.

type CookieOptions = Parameters<typeof NextResponse.prototype.cookies.set>[2]

// Query params are attacker-controllable - escape before interpolating into HTML.
function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Only allow same-site relative paths for `next` - blocks open-redirect via
// e.g. next=https://evil.example.
function safeNext(next: string) {
  return next.startsWith('/') && !next.startsWith('//') ? next : '/setup'
}

function confirmPage(tokenHash: string, type: string, next: string) {
  const safeTokenHash = escapeHtml(tokenHash)
  const safeType = escapeHtml(type)
  const safeNextPath = escapeHtml(safeNext(next))
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Confirm your invite - Orla</title>
</head>
<body style="margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:16px;background:#0B1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="width:100%;max-width:380px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:32px 28px;text-align:center;">
    <img src="/images/orla_booking_logo_light.png" alt="Orla" style="height:32px;width:auto;margin-bottom:24px;" />
    <h1 style="color:#fff;font-size:18px;font-weight:600;margin:0 0 8px;">You've been invited to Orla</h1>
    <p style="color:#94a3b8;font-size:14px;line-height:1.5;margin:0 0 24px;">Tap below to confirm and finish setting up your account.</p>
    <form method="POST" action="/auth/callback">
      <input type="hidden" name="token_hash" value="${safeTokenHash}" />
      <input type="hidden" name="type" value="${safeType}" />
      <input type="hidden" name="next" value="${safeNextPath}" />
      <button type="submit" style="width:100%;background:#2563EB;color:#fff;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;">Accept invite &amp; continue</button>
    </form>
  </div>
</body>
</html>`
}

async function verifyAndRedirect(
  request: NextRequest,
  origin: string,
  code: string | null,
  tokenHash: string | null,
  type: EmailOtpType | null,
  next: string,
) {
  const cookiesToForward: { name: string; value: string; options: CookieOptions }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(incoming) {
          incoming.forEach(c => cookiesToForward.push(c))
        },
      },
    },
  )

  let success = false

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) console.error('[auth/callback] exchangeCodeForSession:', error.message)
    else success = true
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (error) console.error('[auth/callback] verifyOtp:', error.message)
    else success = true
  }

  const destination = success ? new URL(safeNext(next), origin) : new URL('/login', origin)
  const response = NextResponse.redirect(destination, { status: 303 })

  cookiesToForward.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options)
  )

  return response
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type') as EmailOtpType | null
  const next       = searchParams.get('next') ?? '/setup'

  // PKCE code exchange requires a code_verifier cookie set on the same
  // device/session that started the flow, so it can't be completed by a
  // passive prefetch from a different machine - safe to verify immediately.
  if (code) {
    return verifyAndRedirect(request, origin, code, null, null, next)
  }

  if (token_hash && type) {
    return new NextResponse(confirmPage(token_hash, type, next), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return NextResponse.redirect(new URL('/login', origin))
}

export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url)
  const form = await request.formData()
  const token_hash = form.get('token_hash') as string | null
  const type       = form.get('type') as EmailOtpType | null
  const next       = (form.get('next') as string | null) ?? '/setup'

  return verifyAndRedirect(request, origin, null, token_hash, type, next)
}
