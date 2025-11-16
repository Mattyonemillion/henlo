import { Skeleton } from '@/components/ui/skeleton'

export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white border rounded-lg p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left w-full">
          <Skeleton className="h-6 sm:h-7 md:h-8 w-40 sm:w-48 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-32 sm:w-40 mx-auto sm:mx-0" />
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
            <Skeleton className="h-5 w-20 sm:w-24" />
            <Skeleton className="h-5 w-20 sm:w-24" />
            <Skeleton className="h-5 w-24 sm:w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReviewCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 sm:p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 sm:w-32" />
            <Skeleton className="h-3 w-16 sm:w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-20 sm:w-24" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}

export function ReviewListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  )
}
