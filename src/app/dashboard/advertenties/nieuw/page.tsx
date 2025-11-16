'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/listings/ImageUpload'
import { CATEGORIES } from '@/lib/utils/constants'

export default function NewListingPage() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClient()

  const validateForm = (formData: FormData): boolean => {
    const newErrors: Record<string, string> = {}

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = formData.get('price') as string
    const condition = formData.get('condition') as string
    const category = formData.get('category') as string
    const location = formData.get('location') as string

    if (!title || title.length < 5) {
      newErrors.title = 'Titel moet minimaal 5 karakters zijn'
    }
    if (!description || description.length < 20) {
      newErrors.description = 'Beschrijving moet minimaal 20 karakters zijn'
    }
    if (!price || parseFloat(price) <= 0) {
      newErrors.price = 'Vul een geldige prijs in'
    }
    if (!condition) {
      newErrors.condition = 'Selecteer een conditie'
    }
    if (!category) {
      newErrors.category = 'Selecteer een categorie'
    }
    if (!location || location.length < 2) {
      newErrors.location = 'Vul een geldige locatie in'
    }
    if (images.length === 0) {
      newErrors.images = 'Voeg minimaal 1 foto toe'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    // Validate form
    if (!validateForm(formData)) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Upload images eerst
      const imageUrls: string[] = []
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

      // Create listing
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        setErrors({ form: 'Je moet ingelogd zijn om een advertentie te plaatsen' })
        setLoading(false)
        return
      }

      // Generate slug from title
      const title = formData.get('title') as string
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now()

      const { error } = await supabase.from('listings').insert({
        seller_id: userData.user.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        condition: formData.get('condition') as string,
        category: formData.get('category') as string,
        location: formData.get('location') as string,
        slug: slug,
        shipping_available: formData.get('shipping') === 'on',
        pickup_available: true,
        images: imageUrls,
        primary_image: imageUrls[0] || null,
        status: 'active',
      })

      if (error) {
        console.error('Listing creation error:', error)
        setErrors({ form: `Fout bij plaatsen advertentie: ${error.message}` })
        setLoading(false)
        return
      }

      // Success - redirect
      router.push('/dashboard/advertenties')
    } catch (error) {
      console.error('Unexpected error:', error)
      setErrors({ form: 'Er ging iets mis. Probeer het opnieuw.' })
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Nieuwe advertentie plaatsen</h1>

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
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.title ? 'border-red-500' : ''
            }`}
            placeholder="Bijv. iPhone 12 Pro 128GB"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
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
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.description ? 'border-red-500' : ''
            }`}
            placeholder="Beschrijf je product zo gedetailleerd mogelijk..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.price ? 'border-red-500' : ''
              }`}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Staat <span className="text-red-500">*</span>
            </label>
            <select
              name="condition"
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.condition ? 'border-red-500' : ''
              }`}
            >
              <option value="">Selecteer staat</option>
              <option value="new">Nieuw</option>
              <option value="like_new">Als nieuw</option>
              <option value="good">Goed</option>
              <option value="fair">Redelijk</option>
              <option value="poor">Matig</option>
            </select>
            {errors.condition && (
              <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
            )}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.category ? 'border-red-500' : ''
              }`}
            >
              <option value="">Selecteer categorie</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Locatie <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.location ? 'border-red-500' : ''
              }`}
              placeholder="Bijv. Amsterdam"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Foto&apos;s <span className="text-red-500">*</span>
          </label>
          <ImageUpload onImagesChange={setImages} maxImages={10} />
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
            className="mr-2"
          />
          <label htmlFor="shipping" className="text-sm">
            Verzenden mogelijk
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Bezig met plaatsen...' : 'Advertentie plaatsen'}
        </button>
      </form>
    </div>
  )
}
