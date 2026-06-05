import type { SessionType, BookingStatus } from '@/types'

const SESSION_PALETTE = [
  'bg-blue-50 text-blue-700 ring-blue-200',
  'bg-violet-50 text-violet-700 ring-violet-200',
  'bg-teal-50 text-teal-700 ring-teal-200',
  'bg-rose-50 text-rose-700 ring-rose-200',
  'bg-amber-50 text-amber-700 ring-amber-200',
  'bg-emerald-50 text-emerald-700 ring-emerald-200',
]

const STATUS_COLOURS: Record<BookingStatus, string> = {
  confirmed:        'bg-green-50 text-green-700 ring-green-200',
  pending:          'bg-amber-50 text-amber-700 ring-amber-200',
  cancelled:        'bg-slate-50 text-slate-500 ring-slate-200',
  awaiting_payment: 'bg-blue-50 text-blue-700 ring-blue-200',
}

function sessionColour(type: string): string {
  let hash = 0
  for (let i = 0; i < type.length; i++) hash = type.charCodeAt(i) + ((hash << 5) - hash)
  return SESSION_PALETTE[Math.abs(hash) % SESSION_PALETTE.length]
}

interface Props {
  variant: 'session' | 'status'
  value: SessionType | BookingStatus
}

export default function Badge({ variant, value }: Props) {
  const colour =
    variant === 'session'
      ? sessionColour(value)
      : STATUS_COLOURS[value as BookingStatus]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colour}`}>
      {value}
    </span>
  )
}
