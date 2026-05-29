function SkeletonSlot() {
  return (
    <div className="px-5 py-3.5 flex items-center gap-4 border-b border-border last:border-b-0">
      <div className="h-5 w-14 rounded-full bg-border animate-pulse" />
      <div className="h-3.5 w-28 rounded bg-border animate-pulse" />
      <div className="h-3 w-20 rounded bg-border animate-pulse" />
      <div className="ml-auto h-5 w-5 rounded bg-border animate-pulse" />
    </div>
  )
}

export default function AvailabilityLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-5 w-28 rounded bg-border animate-pulse" />
          <div className="h-3.5 w-20 rounded bg-border animate-pulse mt-1.5" />
        </div>
        <div className="h-8 w-24 rounded-md bg-border animate-pulse" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="border-b border-border bg-subtle px-5 py-3">
          <div className="h-3 w-24 rounded bg-border animate-pulse" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonSlot key={i} />)}
      </div>
    </div>
  )
}
