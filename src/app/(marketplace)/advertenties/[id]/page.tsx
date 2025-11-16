'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { ErrorMessage } from '@/components/ui/error-message'
import { ListingDetailSkeleton } from '@/components/skeletons/ListingSkeleton'
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
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchListing()
  }, [params.id])

  const fetchListing = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*, profiles(*), categories(*)')
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (data) {
        setListing(data)
      } else {
        setError('Advertentie niet gevonden')
      }
    } catch (err: any) {
      console.error('Error fetching listing:', err)
      setError('Er ging iets mis bij het laden van de advertentie')
      toast.error('Kon de advertentie niet laden')
    } finally {
      setLoading(false)
    }
  }

  const handleContactSeller = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Log eerst in om contact op te nemen')
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
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            listing_id: listing.id,
            seller_id: listing.user_id,
            buyer_id: user.id,
          })
          .select()
          .single()

        if (error) throw error

        if (newConversation) {
          toast.success('Gesprek gestart!')
          router.push(`/dashboard/berichten/${newConversation.id}`)
        }
      }
    } catch (err) {
      console.error('Error contacting seller:', err)
      toast.error('Kon geen contact maken. Probeer het opnieuw.')
    }
  }

  const handleToggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Log eerst in om favorieten op te slaan')
        router.push('/login')
        return
      }

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id)

        if (error) throw error

        setIsFavorite(false)
        toast.success('Verwijderd uit favorieten')
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listing.id,
          })

        if (error) throw error

        setIsFavorite(true)
        toast.success('Toegevoegd aan favorieten')
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
      toast.error('Er ging iets mis. Probeer het opnieuw.')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: listing.description,
          url: window.location.href,
        })
        toast.success('Gedeeld!')
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link gekopieerd naar klembord')
      }
    } catch (err: any) {
      // User cancelled share dialog
      if (err.name !== 'AbortError') {
        toast.error('Kon niet delen')
      }
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
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <ListingDetailSkeleton />
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ErrorMessage
            title="Advertentie niet gevonden"
            message={error || 'Deze advertentie bestaat niet of is verwijderd.'}
            variant="card"
            className="mb-6"
          />
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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
                        sizes="(max-width: 1024px) 100vw, 66vw"
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
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Beschrijving</h2>
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Price Card */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-4 sm:mb-6">
                    €{listing.price.toFixed(2)}
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <Button
                      onClick={handleContactSeller}
                      className="w-full"
                      size="lg"
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="text-sm sm:text-base">Contact met verkoper</span>
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleToggleFavorite}
                        variant="outline"
                        className="w-full"
                      >
                        <Heart
                          className={`w-4 h-4 sm:w-5 sm:h-5 sm:mr-2 ${
                            isFavorite ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                        <span className="hidden sm:inline text-sm sm:text-base">Bewaren</span>
                      </Button>

                      <Button onClick={handleShare} variant="outline" className="w-full">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                        <span className="hidden sm:inline text-sm sm:text-base">Delen</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Card */}
              {listing.profiles && (
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Verkoper</h3>
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
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-blue-900">Veilig handelen</h3>
                  <ul className="text-xs sm:text-sm text-blue-800 space-y-1.5 sm:space-y-2">
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
