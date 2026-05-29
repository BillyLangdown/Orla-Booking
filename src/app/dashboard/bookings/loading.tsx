function SkeletonRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-4 border-b border-border last:border-b-0">
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-3.5 w-32 rounded bg-border animate-pulse" />
        <div className="h-3 w-44 rounded bg-border animate-pulse" />
      </div>
      <div className="h-5 w-16 rounded-full bg-border animate-pulse" />
      <div className="h-5 w-20 rounded-full bg-border animate-pulse" />
    </div>
  )
}

export default function BookingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="h-5 w-24 rounded bg-border animate-pulse" />
        <div className="h-3.5 w-16 rounded bg-border animate-pulse mt-1.5" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  )
}
