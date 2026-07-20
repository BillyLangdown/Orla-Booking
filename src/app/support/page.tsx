export default function SupportPage() {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4"
      style={{ background: '#0B1120' }}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-10">
          <img src="/images/orla_booking_logo_light.png" alt="Orla" className="h-8 w-auto object-contain" />
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 p-8 rounded-[10px]">
          <h1 className="text-lg font-semibold text-white mb-1">Support</h1>
          <p className="text-sm text-white/40 mb-6">
            Need help with your Orla account, the app, or a booking? Get in touch and we&apos;ll get back to you.
          </p>

          <a
            href="mailto:william@williamlangdown.com"
            className="block w-full text-center py-3 text-sm font-semibold text-white bg-accent hover:bg-accent-hover transition-colors rounded-md"
          >
            william@williamlangdown.com
          </a>
        </div>
      </div>
    </div>
  )
}
