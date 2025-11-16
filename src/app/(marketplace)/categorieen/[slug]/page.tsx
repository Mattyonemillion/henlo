'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ListingGrid from '@/components/listings/ListingGrid'
import ListingFilters, { FilterValues } from '@/components/listings/ListingFilters'
import SearchBar from '@/components/layout/SearchBar'
import { Loader2, ChevronRight } from 'lucide-react'

export default function CategoryPage() {
  const params = useParams()
  const [category, setCategory] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterValues>({})
  const supabase = createClient()

  useEffect(() => {
    fetchCategoryAndListings()
  }, [params.slug, filters])

  const fetchCategoryAndListings = async () => {
    setLoading(true)

    // Fetch category
    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (categoryData) {
      setCategory(categoryData)

      // Fetch listings for this category
      let query = supabase
        .from('listings')
        .select('*, profiles(*), categories(*)')
        .eq('status', 'active')
        .eq('category_id', categoryData.id)
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
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      const { data: listingsData } = await query

      if (listingsData) {
        setListings(listingsData)
      }
    }

    setLoading(false)
  }

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Categorie niet gevonden</h1>
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 underline"
          >
            Terug naar home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-600">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 inline mx-2" />
            <Link href="/advertenties" className="hover:text-primary-600">
              Advertenties
            </Link>
            <ChevronRight className="w-4 h-4 inline mx-2" />
            <span className="text-gray-900">{category.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
            </div>
          </div>

          <SearchBar />
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
                    {listings.length} advertentie{listings.length !== 1 ? 's' : ''}{' '}
                    gevonden in {category.name}
                  </div>
                  <ListingGrid listings={listings} />
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-500 text-lg mb-2">
                    Geen advertenties gevonden in deze categorie.
                  </p>
                  <p className="text-gray-400">
                    Probeer je zoekcriteria aan te passen of kijk later nog eens.
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
