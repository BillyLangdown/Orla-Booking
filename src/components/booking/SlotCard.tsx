import type { AvailabilitySlot, PaymentMode, SessionTypePrices } from '@/types'
import Badge from '@/components/ui/Badge'

export interface SlotPricing {
  show:     boolean
  mode:     PaymentMode
  prices:   SessionTypePrices
  currency: string
}

interface Props {
  slot:     AvailabilitySlot
  pricing?: SlotPricing
  onSelect: (slot: AvailabilitySlot) => void
}

const CURRENCY_SYMBOL: Record<string, string> = { gbp: '£', usd: '$', eur: '€' }

function fmt(pence: number, currency: string) {
  const symbol = CURRENCY_SYMBOL[currency] ?? '£'
  return `${symbol}${(pence / 100).toFixed(2).replace('.00', '')}`
}

function PriceTag({ pricing, sessionType }: { pricing: SlotPricing; sessionType: string }) {
  const p = pricing.prices[sessionType]
  if (!p) return null

  if (pricing.mode === 'full') {
    if (!p.price) return null
    return <span className="text-sm font-semibold text-ink">{fmt(p.price, pricing.currency)}</span>
  }

  if (pricing.mode === 'deposit') {
    if (!p.depositAmount && !p.price) return null
    return (
      <div className="flex flex-col items-end gap-0.5">
        {p.depositAmount > 0 && (
          <span className="text-sm font-semibold text-ink">{fmt(p.depositAmount, pricing.currency)} deposit</span>
        )}
        {p.price > 0 && (
          <span className="text-xs text-secondary">{fmt(p.price, pricing.currency)} total</span>
        )}
      </div>
    )
  }

  return null
}

export default function SlotCard({ slot, pricing, onSelect }: Props) {
  const available = slot.capacity - slot.booked
  const almostFull = available === 1
  const showPrice = pricing?.show && pricing.mode !== 'none'

  return (
    <button
      onClick={() => onSelect(slot)}
      className="w-full text-left bg-white shadow-sm px-4 py-4 hover:shadow transition-all duration-150 group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="session" value={slot.sessionType} />
            {almostFull && (
              <span className="text-xs font-medium text-amber-600">Last space</span>
            )}
          </div>
          <p className="text-base font-semibold text-ink leading-tight">
            {slot.startTime} - {slot.endTime}
          </p>
          {slot.resource && <p className="text-sm text-secondary truncate">{slot.resource.name}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {showPrice && <PriceTag pricing={pricing!} sessionType={slot.sessionType} />}
          <span className={`text-xs font-medium ${available === 0 ? 'text-rose-600' : 'text-secondary'}`}>
            {available > 0 ? `${available} space${available !== 1 ? 's' : ''} left` : 'Full'}
          </span>
          <span className="text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Book
          </span>
        </div>
      </div>
    </button>
  )
}
