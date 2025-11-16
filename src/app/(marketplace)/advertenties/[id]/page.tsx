'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  MapPin,
  Calendar,
  Package,
  Truck,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  User,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchListing()
  }, [params.id])

  const fetchListing = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles(*), categories(*)')
      .eq('id', params.id)
      .single()

    if (!error && data) {
      setListing(data)
    }

    setLoading(false)
  }

  const handleContactSeller = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Create or get conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('listing_id', listing.id)
      .eq('buyer_id', user.id)
      .single()

    if (conversation) {
      router.push(`/dashboard/berichten/${conversation.id}`)
    } else {
      const { data: newConversation } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          seller_id: listing.user_id,
          buyer_id: user.id,
        })
        .select()
        .single()

      if (newConversation) {
        router.push(`/dashboard/berichten/${newConversation.id}`)
      }
    }
  }

  const handleToggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listing.id)
      setIsFavorite(false)
    } else {
      await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          listing_id: listing.id,
        })
      setIsFavorite(true)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
    }
  }

  const nextImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) =>
        prev === listing.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.images.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Advertentie niet gevonden</h1>
          <Link href="/advertenties">
            <Button>Terug naar advertenties</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = listing.images || []
  const hasImages = images.length > 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/advertenties" className="hover:text-primary-600">
            Advertenties
          </Link>
          {listing.categories && (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/categorieen/${listing.categories.slug}`}
                className="hover:text-primary-600"
              >
                {listing.categories.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-900">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  {hasImages ? (
                    <>
                      <Image
                        src={images[currentImageIndex]}
                        alt={listing.title}
                        fill
                        className="object-contain"
                        priority
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                            aria-label="Vorige afbeelding"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                            aria-label="Volgende afbeelding"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex
                            ? 'border-primary-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${listing.title} - foto ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Beschrijving</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Staat</p>
                      <p className="font-medium capitalize">
                        {listing.condition?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Locatie</p>
                      <p className="font-medium">{listing.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Geplaatst</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(listing.created_at), {
                          addSuffix: true,
                          locale: nl,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Verzenden</p>
                      <p className="font-medium">
                        {listing.shipping_available ? 'Mogelijk' : 'Alleen ophalen'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Price Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary-600 mb-6">
                    €{listing.price.toFixed(2)}
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleContactSeller}
                      className="w-full"
                      size="lg"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contact met verkoper
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleToggleFavorite}
                        variant="outline"
                        className="w-full"
                      >
                        <Heart
                          className={`w-5 h-5 mr-2 ${
                            isFavorite ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                        Bewaren
                      </Button>

                      <Button onClick={handleShare} variant="outline" className="w-full">
                        <Share2 className="w-5 h-5 mr-2" />
                        Delen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Card */}
              {listing.profiles && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Verkoper</h3>
                    <div className="flex items-center gap-3 mb-4">
                      {listing.profiles.avatar_url ? (
                        <Image
                          src={listing.profiles.avatar_url}
                          alt={listing.profiles.full_name || 'Verkoper'}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {listing.profiles.full_name || 'Anonieme gebruiker'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Lid sinds{' '}
                          {new Date(listing.profiles.created_at).toLocaleDateString(
                            'nl-NL',
                            {
                              year: 'numeric',
                              month: 'long',
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <Link href={`/gebruikers/${listing.user_id}`}>
                      <Button variant="outline" className="w-full">
                        Bekijk profiel
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Safety Tips */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2 text-blue-900">Veilig handelen</h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Ontmoet op een openbare plaats</li>
                    <li>• Controleer het product voor betaling</li>
                    <li>• Betaal nooit vooraf via een link</li>
                    <li>• Vertrouw op je gevoel</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
