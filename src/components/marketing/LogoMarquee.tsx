const BUSINESSES = [
  'Salons', 'Trades & callouts', 'Studios', 'Clinics', 'Instructors',
  'Photographers', 'Mobile mechanics', 'Consultants', 'Barbers', 'Therapists',
]

export default function LogoMarquee() {
  const items = [...BUSINESSES, ...BUSINESSES]

  return (
    <section className="border-y border-border py-12">
      <p className="mb-7 text-center text-sm text-muted">
        Built for businesses that take bookings
      </p>
      <div
        className="group overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div className="animate-marquee flex w-max items-center gap-12 whitespace-nowrap py-3 group-hover:[animation-play-state:paused]">
          {items.map((b, i) => (
            <span key={i} className="flex items-center gap-12">
              <span
                className={`font-display text-xl tracking-tight ${
                  i % 2 === 0 ? 'font-bold text-ink' : 'font-medium text-secondary'
                }`}
              >
                {b}
              </span>
              <span className="text-lg font-semibold text-accent">+</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
