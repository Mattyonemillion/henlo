'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import ImageUpload from '@/components/listings/ImageUpload'
import { CATEGORIES } from '@/lib/utils/constants'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  condition: string
  category: string
  location: string
  shipping_available: boolean
  images: string[]
}

export default function EditListingPage() {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [listing, setListing] = useState<Listing | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    loadListing()
  }, [])

  async function loadListing() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', params.id)
      .eq('seller_id', user.id)
      .single()

    if (!error && data) {
      setListing(data)
      setExistingImages(data.images || [])
    }

    setFetchLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)

    try {
      // Upload new images
      const imageUrls: string[] = [...existingImages]
      for (const image of images) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${image.name}`
        const { data, error } = await supabase.storage
          .from('listings')
          .upload(fileName, image)

        if (error) {
          console.error('Image upload error:', error)
          setErrors({ images: `Fout bij uploaden van afbeelding: ${error.message}` })
          setLoading(false)
          return
        }

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(data.path)
          imageUrls.push(publicUrl)
        }
      }

      // Update listing
      const { error } = await supabase
        .from('listings')
        .update({
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          price: parseFloat(formData.get('price') as string),
          condition: formData.get('condition') as string,
          category: formData.get('category') as string,
          location: formData.get('location') as string,
          shipping_available: formData.get('shipping') === 'on',
          images: imageUrls,
          primary_image: imageUrls[0] || null,
        })
        .eq('id', params.id)

      if (error) {
        console.error('Update error:', error)
        setErrors({ form: `Fout bij bijwerken advertentie: ${error.message}` })
        setLoading(false)
        return
      }

      router.push('/dashboard/advertenties')
    } catch (error) {
      console.error('Unexpected error:', error)
      setErrors({ form: 'Er ging iets mis. Probeer het opnieuw.' })
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Advertentie niet gevonden</h2>
          <p className="text-red-600">Deze advertentie bestaat niet of je hebt geen toegang.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Advertentie bewerken</h1>

      {/* General form error */}
      {errors.form && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Titel <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            defaultValue={listing.title}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Bijv. iPhone 12 Pro 128GB"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Beschrijving <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={6}
            defaultValue={listing.description}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Beschrijf je product zo gedetailleerd mogelijk..."
          />
        </div>

        {/* Price & Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Prijs (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              required
              step="0.01"
              min="0"
              defaultValue={listing.price}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Staat <span className="text-red-500">*</span>
            </label>
            <select
              name="condition"
              required
              defaultValue={listing.condition}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecteer staat</option>
              <option value="new">Nieuw</option>
              <option value="like_new">Als nieuw</option>
              <option value="good">Goed</option>
              <option value="fair">Redelijk</option>
              <option value="poor">Matig</option>
            </select>
          </div>
        </div>

        {/* Category & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Categorie <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              required
              defaultValue={listing.category}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecteer categorie</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Locatie <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              required
              defaultValue={listing.location}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Bijv. Amsterdam"
            />
          </div>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Huidige foto&apos;s</label>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {existingImages.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setExistingImages(existingImages.filter((_, i) => i !== index))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Nieuwe foto&apos;s toevoegen (max {10 - existingImages.length})
          </label>
          <ImageUpload
            onImagesChange={setImages}
            maxImages={10 - existingImages.length}
          />
          {errors.images && (
            <p className="mt-1 text-sm text-red-600">{errors.images}</p>
          )}
        </div>

        {/* Shipping */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="shipping"
            id="shipping"
            defaultChecked={listing.shipping_available}
            className="mr-2"
          />
          <label htmlFor="shipping" className="text-sm">
            Verzenden mogelijk
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Bezig met opslaan...' : 'Wijzigingen opslaan'}
          </button>
        </div>
      </form>
    </div>
  )
}
