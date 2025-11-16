'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import Image from 'next/image'

interface Favorite {
  id: string
  listing_id: string
  created_at: string
  listing: {
    id: string
    title: string
    price: number
    primary_image: string | null
    location: string
    status: string
  }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadFavorites()
  }, [])

  async function loadFavorites() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        listing_id,
        created_at,
        listing:listings (
          id,
          title,
          price,
          primary_image,
          location,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setFavorites(data as any)
    }

    setLoading(false)
  }

  async function removeFavorite(favoriteId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId)

    if (!error) {
      setFavorites(favorites.filter(f => f.id !== favoriteId))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mijn favorieten</h1>
        <p className="mt-2 text-gray-600">Advertenties die je hebt opgeslagen</p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen favorieten</h3>
          <p className="text-gray-600 mb-6">Je hebt nog geen advertenties opgeslagen</p>
          <Link
            href="/marketplace"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Ontdek de marktplaats
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/marketplace/${favorite.listing.id}`}>
                <div className="aspect-square bg-gray-200 relative">
                  {favorite.listing.primary_image ? (
                    <Image
                      src={favorite.listing.primary_image}
                      alt={favorite.listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-16 h-16" />
                    </div>
                  )}
                  {favorite.listing.status === 'sold' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">
                        Verkocht
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/marketplace/${favorite.listing.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                    {favorite.listing.title}
                  </h3>
                </Link>
                <p className="text-2xl font-bold text-primary-600 mb-2">
                  €{favorite.listing.price.toFixed(2)}
                </p>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {favorite.listing.location}
                </div>

                <button
                  onClick={() => removeFavorite(favorite.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  Verwijder van favorieten
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  )
}
