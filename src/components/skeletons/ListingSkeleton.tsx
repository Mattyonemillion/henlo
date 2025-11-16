import { Skeleton } from '@/components/ui/skeleton'

export function ListingCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <Skeleton className="h-48 sm:h-56 md:h-64 w-full rounded-none" />
      <div className="p-3 sm:p-4 space-y-3">
        <Skeleton className="h-5 sm:h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 pt-2">
          <Skeleton className="h-6 sm:h-7 w-20 sm:w-24" />
          <Skeleton className="h-8 sm:h-9 w-20 sm:w-24" />
        </div>
      </div>
    </div>
  )
}

export function ListingDetailSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Image Gallery */}
      <Skeleton className="h-64 sm:h-80 md:h-96 w-full rounded-lg" />

      {/* Title and Price */}
      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-7 sm:h-8 md:h-9 w-full md:w-3/4" />
        <Skeleton className="h-8 sm:h-10 w-28 sm:w-32" />
      </div>

      {/* Details */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32 sm:w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 sm:h-14" />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32 sm:w-40" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Seller Info */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32 sm:w-40" />
            <Skeleton className="h-4 w-24 sm:w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  )
}
