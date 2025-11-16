'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, Package, Star, MessageSquare } from 'lucide-react'
import RatingStars from '@/components/reviews/RatingStars'
import ReviewCard from '@/components/reviews/ReviewCard'
import ListingCard from '@/components/listings/ListingCard'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: Profile
}
type Review = Database['public']['Tables']['reviews']['Row'] & {
  reviewer: Profile
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserProfile() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user?.id || null)

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // Get user's active listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select(`
            *,
            profiles (*)
          `)
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(6)

        if (listingsError) throw listingsError
        setListings(listingsData as Listing[])

        // Get reviews for this user
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            reviewer:profiles!reviews_reviewer_id_fkey (*)
          `)
          .eq('reviewee_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)

        if (reviewsError) throw reviewsError
        setReviews(reviewsData as Review[])
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadUserProfile()
    }
  }, [userId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'long',
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Gebruiker niet gevonden</h1>
        <p className="text-gray-600 mb-8">Deze gebruiker bestaat niet of is niet meer actief.</p>
        <Link
          href="/advertenties"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Terug naar advertenties
        </Link>
      </div>
    )
  }

  const isOwnProfile = currentUser === userId

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || 'Gebruiker'}
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-bold text-4xl">
                  {profile.full_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.full_name || 'Anonieme gebruiker'}
                </h1>
                {profile.username && (
                  <p className="text-gray-600 mb-2">@{profile.username}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Lid sinds {formatDate(profile.member_since || profile.created_at)}
                  </div>
                </div>
              </div>

              {!isOwnProfile && (
                <Link
                  href={`/dashboard/berichten?userId=${userId}`}
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Stuur bericht
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">Beoordeling</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {profile.rating?.toFixed(1) || '0.0'}
                  </span>
                  <RatingStars rating={profile.rating || 0} size="sm" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {profile.total_reviews || 0} beoordelingen
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">Advertenties</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
                <p className="text-xs text-gray-500 mt-1">Actief</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">Verkocht</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.total_sales || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Items</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Over</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'listings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Advertenties ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reviews'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Beoordelingen ({reviews.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'listings' && (
        <div>
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Geen advertenties
              </h3>
              <p className="text-gray-600">
                Deze gebruiker heeft momenteel geen actieve advertenties.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Geen beoordelingen
              </h3>
              <p className="text-gray-600">
                Deze gebruiker heeft nog geen beoordelingen ontvangen.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
