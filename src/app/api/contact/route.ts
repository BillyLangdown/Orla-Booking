import { NextRequest, NextResponse } from 'next/server'
import { sendContactMessage } from '@/lib/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; message?: string; company?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Honeypot: real visitors never fill this hidden field in.
  if (body.company) return NextResponse.json({ ok: true })

  const name = body.name?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  const message = body.message?.trim() ?? ''

  if (!name || name.length > 200) return NextResponse.json({ error: 'Please enter your name' }, { status: 400 })
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 })
  if (!message || message.length > 5000) return NextResponse.json({ error: 'Please enter a message' }, { status: 400 })

  const result = await sendContactMessage(name, email, message)
  if (!result.ok) return NextResponse.json({ error: result.error ?? 'Failed to send message' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
