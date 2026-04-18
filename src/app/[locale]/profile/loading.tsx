export default function ProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-3xl bg-muted/50 border border-border/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-2xl bg-muted shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <div className="h-7 w-48 bg-muted rounded-xl" />
          <div className="h-4 w-36 bg-muted rounded-lg" />
          <div className="h-6 w-24 bg-muted rounded-full" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 rounded-3xl bg-muted/50 border border-border/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40">
            <div className="h-5 w-40 bg-muted rounded-lg" />
          </div>
          <div className="px-6 divide-y divide-border/20">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 py-4">
                <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-4 w-48 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-3xl bg-muted/50 border border-border/40 overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-border/40">
            <div className="h-5 w-32 bg-muted rounded-lg" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-11 rounded-xl bg-muted" />
            <div className="h-11 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
