function SkeletonField() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-3 w-20 rounded bg-border animate-pulse" />
      <div className="h-9 w-full rounded-md bg-border animate-pulse" />
    </div>
  )
}

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <div className="h-5 w-20 rounded bg-border animate-pulse" />
        <div className="h-3.5 w-48 rounded bg-border animate-pulse mt-1.5" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonField key={i} />)}
      </div>
      <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
        <SkeletonField />
        <SkeletonField />
      </div>
    </div>
  )
}
