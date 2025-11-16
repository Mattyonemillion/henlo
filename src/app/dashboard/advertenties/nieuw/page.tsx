'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/listings/ImageUpload'

export default function NewListingPage() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    // Upload images eerst
    const imageUrls: string[] = []
    for (const image of images) {
      const fileName = `${Date.now()}-${image.name}`
      const { data, error } = await supabase.storage
        .from('listings')
        .upload(fileName, image)

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(data.path)
        imageUrls.push(publicUrl)
      }
    }

    // Create listing
    const { data: user } = await supabase.auth.getUser()

    const { error } = await supabase.from('listings').insert({
      user_id: user.user!.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      condition: formData.get('condition') as string,
      category_id: formData.get('category_id') as string,
      location: formData.get('location') as string,
      shipping_available: formData.get('shipping') === 'on',
      pickup_available: true,
      images: imageUrls,
      primary_image: imageUrls[0] || null,
    })

    if (!error) {
      router.push('/dashboard/advertenties')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Nieuwe advertentie plaatsen</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Titel</label>
          <input
            type="text"
            name="title"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Bijv. iPhone 12 Pro 128GB"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Beschrijving</label>
          <textarea
            name="description"
            required
            rows={6}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Beschrijf je product zo gedetailleerd mogelijk..."
          />
        </div>

        {/* Price & Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prijs (€)</label>
            <input
              type="number"
              name="price"
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Conditie</label>
            <select
              name="condition"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="nieuw">Nieuw</option>
              <option value="als_nieuw">Als nieuw</option>
              <option value="goed">Goed</option>
              <option value="redelijk">Redelijk</option>
              <option value="matig">Matig</option>
            </select>
          </div>
        </div>

        {/* Category & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Categorie</label>
            <select
              name="category_id"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {/* TODO: Fetch categories dynamically */}
              <option value="">Selecteer categorie</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Locatie</label>
            <input
              type="text"
              name="location"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Bijv. Amsterdam"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-2">Foto&apos;s (max 10)</label>
          <ImageUpload onImagesChange={setImages} maxImages={10} />
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
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Bezig met plaatsen...' : 'Advertentie plaatsen'}
        </button>
      </form>
    </div>
  )
}
