'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import type { Database } from '@/types/database'
import { toast } from '@/components/ui/toast'
import { useState } from 'react'

type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const [isFavorited, setIsFavorited] = useState(false)
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()

    try {
      // TODO: Implement actual favorite toggle with API
      setIsFavorited(!isFavorited)

      if (!isFavorited) {
        toast.success('Toegevoegd aan favorieten')
      } else {
        toast.success('Verwijderd uit favorieten')
      }
    } catch (error) {
      toast.error('Er ging iets mis. Probeer het opnieuw.')
    }
  }

  return (
    <Link
      href={`/advertenties/${listing.slug}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 hover:border-primary-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {listing.primary_image ? (
          <Image
            src={listing.primary_image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm sm:text-base">
            Geen foto
          </div>
        )}
        {/* Favorite button */}
        <button
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          onClick={handleFavoriteToggle}
          aria-label={isFavorited ? 'Verwijder uit favorieten' : 'Toevoegen aan favorieten'}
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
              isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {listing.title}
        </h3>

        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-xl sm:text-2xl font-bold text-primary-600">
            €{listing.price.toFixed(2)}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 capitalize">
            {listing.condition.replace('_', ' ')}
          </span>
        </div>
      </div>
    </Link>
  )
}
