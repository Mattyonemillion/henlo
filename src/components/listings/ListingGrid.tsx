import type { Database } from '@/types/database'
import ListingCard from './ListingCard'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

interface ListingGridProps {
  listings: Listing[]
  emptyMessage?: string
}

export default function ListingGrid({
  listings,
  emptyMessage = 'Geen advertenties gevonden'
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
