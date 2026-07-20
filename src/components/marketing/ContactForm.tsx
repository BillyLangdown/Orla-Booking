'use client'

import { useState } from 'react'

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [company, setCompany] = useState('') // honeypot
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, company }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMessage(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-base font-semibold text-ink">Message sent</p>
        <p className="mt-1.5 text-sm text-secondary">Thanks, we will get back to you shortly.</p>
        <button
          type="button"
          onClick={() => { setStatus('idle'); setName(''); setEmail(''); setMessage('') }}
          className="mt-6 text-sm text-secondary underline underline-offset-2 hover:text-ink"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={company}
        onChange={e => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium text-secondary">Name</label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className={inputClass}
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium text-secondary">Email</label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@business.com"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-secondary">Message</label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="Tell us a bit about your business and what you need."
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending...' : 'Send message'}
      </button>
    </form>
  )
}
