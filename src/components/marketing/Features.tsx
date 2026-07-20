import Reveal from './Reveal'

const FEATURES = [
  {
    title: 'Takes the enquiries that do not fit a slot',
    body: 'Custom jobs and odd requests go straight to Ask Orla instead of your DMs, so nothing falls through the cracks.',
    icon: (
      <path d="M9 2h6a3 3 0 013 3v10a3 3 0 01-3 3H9a3 3 0 01-3-3V5a3 3 0 013-3z M12 18v3 M9 21h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
  {
    title: 'Works out the timing, not you',
    body: 'Ask Orla checks your availability and agrees a time with the customer directly. No back-and-forth, you just confirm.',
    icon: (
      <path d="M12 6v6l4 2 M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
  {
    title: 'No more double-booked Saturdays',
    body: 'Run fixed appointment slots, or switch to Open Enquiry for custom work. Either way, nothing gets booked twice.',
    icon: (
      <path d="M4 4h16v16H4z M4 9h16 M9 4v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
  {
    title: 'Your calendar, always right',
    body: 'Connects to Google, Apple or Outlook. Confirmed bookings show up automatically, so you stop copying appointments by hand.',
    icon: (
      <path d="M8 2v4 M16 2v4 M3 9h18 M4 4h16a1 1 0 011 1v15a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
  {
    title: 'Get paid before you turn up',
    body: 'Take a deposit or full payment by card at the time of booking. Fewer no-shows, and no invoices to chase afterwards.',
    icon: (
      <text x="12" y="12" textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="700" fill="currentColor">£</text>
    ),
  },
  {
    title: 'Run your whole day from your pocket',
    body: 'Confirm bookings, message customers, and see what is next, all from the Orla app, wherever the job takes you.',
    icon: (
      <path d="M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1z M11 18h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
]

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-28">
      <Reveal className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Stop chasing customers to find a time
        </h2>
        <p className="mt-4 text-secondary">
          Ask Orla handles the back-and-forth for you, so admin stops eating your evenings.
        </p>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.06}>
            <div className="h-full rounded-2xl border border-border bg-card p-7 transition-colors hover:border-accent/40">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <svg width="20" height="20" viewBox="0 0 24 24">{f.icon}</svg>
              </div>
              <h3 className="text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{f.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
