'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Booking, AvailabilitySlot } from '@/types'
import type { GmailSnippet } from '@/lib/google'
import type { OrlaAction } from '@/app/api/orla-action/route'

type OrlaCard = {
  type: 'email' | 'booking' | 'info'
  title: string
  meta?: string
  body: string
  bookingId?: string
  bookingName?: string
  bookingEmail?: string
  bookingStatus?: string
  emailId?: string
  emailThreadId?: string
  emailMessageId?: string
  emailFrom?: string
  emailSubject?: string
}

type ConfirmingState = {
  intent: OrlaAction
  preview: string
  cards: OrlaCard[]
}

type ChatMsg =
  | { role: 'user'; id: string; text: string }
  | { role: 'orla'; id: string; summary: string; cards: OrlaCard[]; suggestions: string[] }

const QUICK_PRESETS = [
  { label: 'Daily rundown',      query: "Give me my daily rundown — today's bookings and any recent emails that need a reply." },
  { label: "Who's in today?",    query: "Who are my bookings for today?" },
  { label: 'Emails to reply to?', query: "Are there any recent emails I should reply to?" },
  { label: 'Recent cancellations', query: "Have there been any recent cancellations or changes to bookings?" },
]

function uid() { return Math.random().toString(36).slice(2) }

export default function AskOrla({ bookings, slots }: { bookings: Booking[]; slots: AvailabilitySlot[] }) {
  const [msgs, setMsgs]                     = useState<ChatMsg[]>([])
  const [isThinking, setIsThinking]         = useState(false)
  const [confirming, setConfirming]         = useState<ConfirmingState | null>(null)
  const [draftBody, setDraftBody]           = useState('')
  const [lastEmails, setLastEmails]         = useState<GmailSnippet[]>([])
  const [replyCard, setReplyCard]           = useState<OrlaCard | null>(null)
  const [replyText, setReplyText]           = useState('')
  const [noteCard, setNoteCard]             = useState<OrlaCard | null>(null)
  const [noteText, setNoteText]             = useState('')
  const [rescheduleCard, setRescheduleCard] = useState<OrlaCard | null>(null)
  const [rescheduleText, setRescheduleText] = useState('')
  const [error, setError]                   = useState('')
  const [textInput, setTextInput]           = useState('')

  const router    = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const isIdle       = msgs.length === 0 && !isThinking
  const isConfirming = confirming !== null

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [msgs, isThinking, confirming, replyCard, noteCard, rescheduleCard, error])

  function clearActiveState() {
    setConfirming(null)
    setReplyCard(null); setReplyText('')
    setNoteCard(null);  setNoteText('')
    setRescheduleCard(null); setRescheduleText('')
    setError('')
  }

  async function submitQuery(query: string) {
    if (!query.trim() || isThinking) return
    const text = query.trim()
    clearActiveState()
    setMsgs(prev => [...prev, { role: 'user', id: uid(), text }])
    setIsThinking(true)

    try {
      const res = await fetch('/api/orla-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, bookings, slots, lastEmails }),
      })
      if (!res.ok) throw new Error('failed')

      const data = (await res.json()) as {
        type?: string
        summary?: string
        cards?: OrlaCard[]
        suggestions?: string[]
        intent?: OrlaAction
        preview?: string
        emails?: GmailSnippet[]
      }

      if (data.emails?.length) setLastEmails(data.emails)

      if (data.type === 'action' && data.intent && data.preview) {
        setConfirming({ intent: data.intent, preview: data.preview, cards: data.cards ?? [] })
        if (data.intent.action === 'reply_email') setDraftBody(data.intent.body)
      } else {
        setMsgs(prev => [...prev, {
          role: 'orla',
          id: uid(),
          summary: data.summary ?? '',
          cards: data.cards ?? [],
          suggestions: data.suggestions ?? [],
        }])
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setIsThinking(false)
  }

  async function executeAction() {
    if (!confirming) return
    const prev = confirming
    setConfirming(null)
    setIsThinking(true)
    setError('')
    try {
      let intent = prev.intent
      if (intent.action === 'reply_email') intent = { ...intent, body: draftBody }
      const res = await fetch('/api/orla-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent }),
      })
      const data = (await res.json()) as { summary?: string; cards?: OrlaCard[] }
      setMsgs(p => [...p, { role: 'orla', id: uid(), summary: data.summary ?? '', cards: data.cards ?? [], suggestions: [] }])
      router.refresh()
    } catch {
      setError('Action failed. Please try again.')
      setConfirming(prev)
    }
    setIsThinking(false)
  }

  function triggerBookingAction(card: OrlaCard, action: 'cancel_booking' | 'no_show' | 'add_note' | 'reschedule_booking') {
    if (!card.bookingId || !card.bookingName) return
    if (action === 'add_note')          { setNoteCard(card); return }
    if (action === 'reschedule_booking') { setRescheduleCard(card); return }
    const intent: OrlaAction = action === 'cancel_booking'
      ? { action: 'cancel_booking', bookingId: card.bookingId, bookingName: card.bookingName }
      : { action: 'no_show',        bookingId: card.bookingId, bookingName: card.bookingName }
    setConfirming({ intent, preview: action === 'cancel_booking' ? `Cancel ${card.bookingName}'s booking?` : `Mark ${card.bookingName} as a no-show?`, cards: [card] })
  }

  function submitNote() {
    if (!noteCard?.bookingId || !noteText.trim()) return
    setConfirming({ intent: { action: 'add_note', bookingId: noteCard.bookingId, bookingName: noteCard.bookingName ?? '', note: noteText.trim() }, preview: `Add note to ${noteCard.bookingName}'s booking?`, cards: [noteCard] })
    setNoteCard(null); setNoteText('')
  }

  function submitReschedule() {
    if (!rescheduleCard?.bookingId || !rescheduleText.trim()) return
    const q = `Reschedule [ID:${rescheduleCard.bookingId}] ${rescheduleCard.bookingName}'s booking to ${rescheduleText}`
    setRescheduleCard(null); setRescheduleText('')
    submitQuery(q)
  }

  function submitReplyDraft() {
    if (!replyCard || !replyText.trim()) return
    const q = `Draft a reply to ${replyCard.emailFrom ?? 'this person'} about "${replyCard.emailSubject ?? replyCard.title}": ${replyText}`
    setReplyCard(null); setReplyText('')
    submitQuery(q)
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = textInput.trim()
    if (!q || isThinking) return
    submitQuery(q)
    setTextInput('')
  }

  function reset() {
    setMsgs([])
    setIsThinking(false)
    clearActiveState()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="flex flex-col overflow-hidden h-full">

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent shrink-0">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span className="text-sm font-semibold text-ink">Ask Orla</span>
        </div>
        {msgs.length > 0 && (
          <button onClick={reset} className="text-xs text-secondary hover:text-ink transition-colors">
            New chat
          </button>
        )}
      </div>

      {/* Chat thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">

        {/* Idle: quick chips */}
        {isIdle && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-secondary uppercase tracking-wider">Quick questions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((p, i) => (
                <button key={i} onClick={() => submitQuery(p.query)}
                  className="px-3.5 py-2 text-xs font-medium text-ink border border-border bg-subtle rounded-full hover:border-accent/40 hover:text-accent transition-colors">
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {msgs.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[78%] bg-accent text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed">
                  {msg.text}
                </div>
              </div>
            )
          }

          // Orla message — show action controls only on the latest response
          const isLatest = i === msgs.length - 1 && !isThinking && !isConfirming
          return (
            <div key={msg.id} className="flex items-start gap-2.5">
              <OrlaAvatar />
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                {msg.summary && (
                  <p className="text-sm text-ink leading-relaxed">{msg.summary}</p>
                )}
                {msg.cards.map((card, ci) => (
                  <ResultCard
                    key={ci} card={card} index={ci}
                    onReply={isLatest ? c => { setReplyCard(c); setReplyText('') } : undefined}
                    onBookingAction={isLatest ? triggerBookingAction : undefined}
                  />
                ))}
                {isLatest && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.suggestions.map((s, si) => (
                      <button key={si} onClick={() => submitQuery(s)}
                        className="px-3.5 py-2 text-xs font-medium text-accent border border-accent/25 bg-accent/8 rounded-full hover:bg-accent/15 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {isThinking && (
          <div className="flex items-end gap-2.5">
            <OrlaAvatar />
            <div className="flex gap-1.5 px-4 py-3.5 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Confirmation panel — appears as Orla's next turn */}
        {isConfirming && confirming && !isThinking && (
          <div className="flex items-start gap-2.5">
            <OrlaAvatar />
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              <p className="text-sm text-ink font-medium">{confirming.preview}</p>
              {confirming.intent.action === 'reply_email' && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <p className="text-xs font-semibold text-secondary px-4 pt-3 pb-1">Draft reply — edit before sending</p>
                  <textarea value={draftBody} onChange={e => setDraftBody(e.target.value)} rows={5}
                    className="w-full bg-transparent px-4 pb-3 text-sm text-ink focus:outline-none resize-none" />
                </div>
              )}
              {confirming.cards.map((card, i) => (
                <ResultCard key={i} card={card} index={i} />
              ))}
              <div className="flex gap-2.5">
                <button onClick={executeAction}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent-hover transition-colors">
                  Confirm
                </button>
                <button onClick={() => setConfirming(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-secondary border border-border hover:bg-subtle transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reply input panel */}
        {replyCard && (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-border">
              <p className="text-xs text-secondary">Replying to</p>
              <p className="text-sm font-semibold text-ink truncate">{replyCard.title}</p>
              <p className="text-xs text-secondary truncate">{replyCard.meta}</p>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="What would you like to say? Orla will draft the reply." rows={3}
                className="w-full text-sm border border-border bg-card rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 resize-none placeholder:text-muted" />
              <div className="flex gap-2">
                <button onClick={submitReplyDraft} disabled={!replyText.trim()}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-accent hover:bg-accent-hover disabled:opacity-40 transition-colors">
                  Draft reply
                </button>
                <button onClick={() => { setReplyCard(null); setReplyText('') }}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-secondary border border-border hover:bg-subtle transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note input panel */}
        {noteCard && (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-border">
              <p className="text-xs text-secondary">Adding note to</p>
              <p className="text-sm font-semibold text-ink">{noteCard.bookingName}</p>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Type your note…" rows={2}
                className="w-full text-sm border border-border bg-card rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 resize-none placeholder:text-muted" />
              <div className="flex gap-2">
                <button onClick={submitNote} disabled={!noteText.trim()}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-accent hover:bg-accent-hover disabled:opacity-40 transition-colors">
                  Add note
                </button>
                <button onClick={() => { setNoteCard(null); setNoteText('') }}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-secondary border border-border hover:bg-subtle transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule input panel */}
        {rescheduleCard && (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-border">
              <p className="text-xs text-secondary">Rescheduling</p>
              <p className="text-sm font-semibold text-ink">{rescheduleCard.bookingName}</p>
              <p className="text-xs text-secondary">{rescheduleCard.meta}</p>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <textarea value={rescheduleText} onChange={e => setRescheduleText(e.target.value)}
                placeholder="When would you like to move this to? (e.g. next Friday at 9am)" rows={2}
                className="w-full text-sm border border-border bg-card rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 resize-none placeholder:text-muted" />
              <div className="flex gap-2">
                <button onClick={submitReschedule} disabled={!rescheduleText.trim()}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-accent hover:bg-accent-hover disabled:opacity-40 transition-colors">
                  Find slot
                </button>
                <button onClick={() => { setRescheduleCard(null); setRescheduleText('') }}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-secondary border border-border hover:bg-subtle transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-rose-400 px-1">{error}</p>}
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-4 py-3 border-t border-border">
        <form onSubmit={handleTextSubmit}>
          <div className="flex items-center gap-2.5">
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Ask something…"
              disabled={isThinking}
              className={[
                'flex-1 bg-subtle border border-border !rounded-full px-5 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent/40 transition-all',
                isThinking ? 'opacity-50' : '',
              ].join(' ')}
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isThinking}
              aria-label="Send"
              className="shrink-0 w-10 h-10 !rounded-full bg-accent flex items-center justify-center hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Orla avatar ─────────────────────────────────────────────────────────────

function OrlaAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0 mt-0.5">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    </div>
  )
}

// ─── Card component ──────────────────────────────────────────────────────────

const CARD_ACCENT: Record<string, string> = {
  email:   '#0d9488',
  booking: '#2563EB',
  info:    '#6b7280',
}

function EmailIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="14" height="11" rx="1.5"/><path d="M2 7l7 5 7-5"/>
    </svg>
  )
}

function BookingIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <rect x="2" y="4" width="14" height="11" rx="1.5"/><path d="M6 2v4M12 2v4M2 8h14"/>
    </svg>
  )
}

function InfoIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <circle cx="9" cy="9" r="7"/><path d="M9 8v5M9 6v.5"/>
    </svg>
  )
}

function ResultCard({
  card, index, onReply, onBookingAction,
}: {
  card: OrlaCard
  index: number
  onReply?: (card: OrlaCard) => void
  onBookingAction?: (card: OrlaCard, action: 'cancel_booking' | 'no_show' | 'add_note' | 'reschedule_booking') => void
}) {
  const accent = CARD_ACCENT[card.type] ?? CARD_ACCENT.info
  const icon = card.type === 'email'   ? <EmailIcon color={accent} />
             : card.type === 'booking' ? <BookingIcon color={accent} />
             : <InfoIcon color={accent} />

  const hasBookingActions = card.type === 'booking' && !!card.bookingId && !!onBookingAction
  const hasReply = card.type === 'email' && !!card.emailId && !!onReply

  return (
    <div
      className="w-full rounded-xl overflow-hidden animate-settle"
      style={{ background: 'rgba(255,255,255,0.07)', borderLeft: `3px solid ${accent}`, animationDelay: `${index * 80}ms` }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">{card.title}</p>
            {card.meta && <p className="text-xs text-secondary mt-0.5">{card.meta}</p>}
            <div className="mt-1.5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {card.body.split('\n').filter(Boolean).map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Email reply action */}
        {hasReply && (
          <div className="mt-3 pt-3 flex" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => onReply!(card)}
              className="px-3 py-1.5 text-xs font-semibold rounded-full text-accent bg-accent/10 hover:bg-accent/18 transition-colors">
              Reply
            </button>
          </div>
        )}

        {/* Booking quick actions — uniform 2×2 grid, filtered by status */}
        {hasBookingActions && (() => {
          const inactive = card.bookingStatus === 'cancelled' || card.bookingStatus === 'no_show'
          const actions = [
            !inactive && { action: 'cancel_booking' as const,     label: 'Cancel booking' },
            !inactive && { action: 'no_show' as const,            label: 'No-show' },
                         { action: 'add_note' as const,           label: 'Add note' },
                         { action: 'reschedule_booking' as const, label: 'Reschedule' },
          ].filter(Boolean) as { action: 'cancel_booking' | 'no_show' | 'add_note' | 'reschedule_booking'; label: string }[]
          return (
            <div className="mt-3 pt-3 grid grid-cols-2 gap-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {actions.map(({ action, label }) => (
                <button key={action} onClick={() => onBookingAction!(card, action)}
                  className="py-2 text-xs font-medium border border-border text-secondary hover:bg-subtle hover:text-ink transition-colors text-center">
                  {label}
                </button>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
