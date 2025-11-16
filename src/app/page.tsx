import { createClient } from '@/lib/supabase/server'
import ListingGrid from '@/components/listings/ListingGrid'
import SearchBar from '@/components/layout/SearchBar'
import CategoryNav from '@/components/layout/CategoryNav'

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select('*, profiles(*), categories(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(24)

  if (searchParams.q) {
    query = query.textSearch('title', searchParams.q)
  }

  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }

  const { data: listings, error } = await query

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Koop en verkoop 2e hands spullen
          </h1>
          <p className="text-xl mb-8 text-center text-primary-100">
            Duurzaam en voordelig
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Categories */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-4">
          <CategoryNav />
        </div>
      </section>

      {/* Listings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">
            {searchParams.q ? `Zoekresultaten voor "${searchParams.q}"` : 'Nieuwste advertenties'}
          </h2>
          {listings && listings.length > 0 ? (
            <ListingGrid listings={listings} />
          ) : (
            <p className="text-gray-500 text-center py-12">
              Geen advertenties gevonden.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
