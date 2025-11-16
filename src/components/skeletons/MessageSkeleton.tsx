import { Skeleton } from '@/components/ui/skeleton'

export function ConversationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 sm:p-4 flex items-start gap-3">
          <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-24 sm:w-32" />
              <Skeleton className="h-3 w-12 sm:w-16" />
            </div>
            <Skeleton className="h-3 w-full max-w-[200px] sm:max-w-xs" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MessageListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-3 sm:space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => {
        const isOwn = i % 3 === 0
        return (
          <div
            key={i}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] sm:max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isOwn && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
              <div className="space-y-1">
                <Skeleton className="h-16 sm:h-20 w-32 sm:w-48 rounded-lg" />
                <Skeleton className="h-3 w-16 sm:w-20" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
