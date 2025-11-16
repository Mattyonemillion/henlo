import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/advertenties/${listing.slug}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {listing.primary_image ? (
          <Image
            src={listing.primary_image}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Geen foto
          </div>
        )}
        {/* Favorite button */}
        <button
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          onClick={(e) => {
            e.preventDefault()
            // TODO: Toggle favorite
          }}
        >
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {listing.title}
        </h3>

        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {listing.location}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">
            €{listing.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 capitalize">
            {listing.condition.replace('_', ' ')}
          </span>
        </div>
      </div>
    </Link>
  )
}
