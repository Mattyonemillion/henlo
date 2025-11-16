'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Clock } from 'lucide-react'
import Image from 'next/image'

interface Listing {
  id: string
  title: string
  price: number
  primary_image: string | null
  status: string
  view_count: number
  created_at: string
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadListings()
  }, [])

  async function loadListings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('listings')
      .select('id, title, price, primary_image, status, view_count, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setListings(data)
    }

    setLoading(false)
  }

  async function deleteListing(id: string) {
    if (!confirm('Weet je zeker dat je deze advertentie wilt verwijderen?')) {
      return
    }

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (!error) {
      setListings(listings.filter(l => l.id !== id))
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mijn advertenties</h1>
          <p className="mt-2 text-gray-600">Beheer je actieve en inactieve advertenties</p>
        </div>
        <Link
          href="/dashboard/advertenties/nieuw"
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nieuwe advertentie
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen advertenties</h3>
          <p className="text-gray-600 mb-6">Je hebt nog geen advertenties geplaatst</p>
          <Link
            href="/dashboard/advertenties/nieuw"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Plaats je eerste advertentie
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow p-6 flex gap-6">
              {/* Image */}
              <div className="w-32 h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                {listing.primary_image ? (
                  <Image
                    src={listing.primary_image}
                    alt={listing.title}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{listing.title}</h3>
                    <p className="text-2xl font-bold text-primary-600 mb-3">€{listing.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        listing.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : listing.status === 'sold'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {listing.status === 'active' ? 'Actief' : listing.status === 'sold' ? 'Verkocht' : 'Inactief'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {listing.view_count || 0} weergaven
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(listing.created_at)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/marketplace/${listing.id}`}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Bekijken
                  </Link>
                  <Link
                    href={`/dashboard/advertenties/bewerken/${listing.id}`}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Bewerken
                  </Link>
                  <button
                    onClick={() => deleteListing(listing.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Verwijderen
                  </button>
                </div>
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
