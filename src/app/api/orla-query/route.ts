import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { Booking } from '@/types'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { query: string; bookings: Booking[] }
    const { query, bookings } = body

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const bookingLines = bookings.map(b => {
      const parts: string[] = [`• ${b.name}`]
      if (b.slot?.date) parts.push(`on ${b.slot.date}`)
      if (b.slot?.startTime) parts.push(`at ${b.slot.startTime}`)
      if (b.slot?.endTime) parts.push(`– ${b.slot.endTime}`)
      if (b.sessionType) parts.push(`(${b.sessionType})`)
      if (b.status !== 'confirmed') parts.push(`[${b.status}]`)
      if (b.email) parts.push(`email: ${b.email}`)
      if (b.phone) parts.push(`phone: ${b.phone}`)
      if (b.resourceName) parts.push(`resource: ${b.resourceName}`)
      return parts.join(' ')
    })

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are Orla, a friendly and concise assistant for a booking business. Answer the user's question based on the booking data below. Be helpful and specific. If no bookings match, say so clearly. Keep your answer short and easy to read.

Bookings:
${bookingLines.length ? bookingLines.join('\n') : 'No bookings in the system yet.'}

Question: ${query}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ answer: text })
  } catch (err) {
    console.error('[orla-query]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
