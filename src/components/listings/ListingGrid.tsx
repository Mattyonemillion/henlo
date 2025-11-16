import type { Database } from '@/types/database'
import ListingCard from './ListingCard'
import { ListingGridSkeleton } from '@/components/skeletons/ListingSkeleton'
import { Package } from 'lucide-react'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

interface ListingGridProps {
  listings: Listing[]
  emptyMessage?: string
  isLoading?: boolean
  skeletonCount?: number
}

export default function ListingGrid({
  listings,
  emptyMessage = 'Geen advertenties gevonden',
  isLoading = false,
  skeletonCount = 6
}: ListingGridProps) {
  if (isLoading) {
    return <ListingGridSkeleton count={skeletonCount} />
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
        <div className="bg-gray-100 rounded-full p-4 sm:p-6 mb-4">
          <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
        </div>
        <p className="text-gray-600 text-base sm:text-lg font-medium mb-2">
          {emptyMessage}
        </p>
        <p className="text-gray-500 text-sm sm:text-base text-center max-w-md">
          Probeer je zoekopdracht aan te passen of kom later terug voor nieuwe advertenties.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
