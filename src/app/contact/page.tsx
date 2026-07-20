import Link from 'next/link'
import type { Metadata } from 'next'
import ContactForm from '@/components/marketing/ContactForm'

export const metadata: Metadata = {
  title: 'Contact - Orla',
  description: 'Get in touch to set your business up with Orla.',
}

export default function ContactPage() {
  return (
    <div className="min-h-dvh px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-secondary hover:text-ink">← Orla</Link>

        <h1 className="font-display mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-4 text-secondary">
          Tell us about your business and we will set you up with a booking
          page, your own login, and Ask Orla ready to go.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-ink">William Langdown</p>
          <p className="mt-1.5 text-sm text-secondary">
            <a href="mailto:orla@williamlangdown.com" className="text-accent hover:underline">
              orla@williamlangdown.com
            </a>
            {' '}or{' '}
            <a href="tel:+447446856927" className="text-accent hover:underline">
              07446 856927
            </a>
            . We typically reply within one working day.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-7">
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
