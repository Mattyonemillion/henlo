'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import ListingGrid from '@/components/listings/ListingGrid'
import ListingFilters, { FilterValues } from '@/components/listings/ListingFilters'
import SearchBar from '@/components/layout/SearchBar'
import { Loader2 } from 'lucide-react'

function SearchBarFallback() {
  return (
    <div className="flex w-full gap-2">
      <div className="flex-1 h-10 bg-gray-100 rounded-md animate-pulse" />
      <div className="h-10 w-20 bg-gray-100 rounded-md animate-pulse" />
    </div>
  )
}

export default function AdvertentiesPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterValues>({})
  const supabase = createClient()

  useEffect(() => {
    fetchListings()
  }, [filters])

  const fetchListings = async () => {
    setLoading(true)

    let query = supabase
      .from('listings')
      .select('*, profiles(*), categories(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin)
    }
    if (filters.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax)
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition)
    }
    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }

    const { data, error } = await query

    if (!error && data) {
      setListings(data)
    }

    setLoading(false)
  }

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Alle advertenties</h1>
          <Suspense fallback={<SearchBarFallback />}>
            <SearchBar />
          </Suspense>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4">
                <ListingFilters
                  onFilterChange={handleFilterChange}
                  initialFilters={filters}
                />
              </div>
            </aside>

            {/* Listings Grid */}
            <main className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : listings.length > 0 ? (
                <>
                  <div className="mb-4 text-gray-600">
                    {listings.length} advertentie{listings.length !== 1 ? 's' : ''} gevonden
                  </div>
                  <ListingGrid listings={listings} />
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-500 text-lg">
                    Geen advertenties gevonden met de huidige filters.
                  </p>
                  <p className="text-gray-400 mt-2">
                    Probeer je zoekcriteria aan te passen.
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}
