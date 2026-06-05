import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type') as EmailOtpType | null
  const next       = searchParams.get('next') ?? '/setup'

  // Collect cookies set during auth so we can attach them to the redirect response.
  // Using NextResponse.redirect() creates a new response object - cookies written to
  // the request cookie store don't carry over, so we must set them explicitly here.
  const cookiesToForward: { name: string; value: string; options: CookieOptions }[] = []

  type CookieOptions = Parameters<typeof NextResponse.prototype.cookies.set>[2]

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
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (error) console.error('[auth/callback] verifyOtp:', error.message)
    else success = true
  }

  const destination = success ? new URL(next, origin) : new URL('/login', origin)
  const response = NextResponse.redirect(destination)

  cookiesToForward.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options)
  )

  return response
}
