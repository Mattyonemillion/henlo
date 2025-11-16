'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ListingForm, { type ListingFormData } from '@/components/listings/ListingForm'
import { toast } from '@/components/ui/toast'

export default function NewListingPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (data: ListingFormData, images: File[]) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('You must be logged in to create a listing')
      }

      // Upload images to Supabase Storage
      const imageUrls: string[] = []
      for (const image of images) {
        const fileName = `${user.id}/${Date.now()}-${image.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listings')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Image upload error:', uploadError)
          throw new Error(`Failed to upload image: ${uploadError.message}`)
        }

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(uploadData.path)
          imageUrls.push(publicUrl)
        }
      }

      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now()

      // Create listing in database
      const { error: insertError } = await supabase.from('listings').insert({
        user_id: user.id,
        title: data.title,
        slug: slug,
        description: data.description,
        price: data.price,
        condition: data.condition,
        category: data.category,
        location: data.location,
        images: imageUrls,
        primary_image: imageUrls[0] || null,
        status: 'active',
        views: 0,
      })

      if (insertError) {
        console.error('Database insert error:', insertError)
        throw new Error(`Failed to create listing: ${insertError.message}`)
      }

      // Success - redirect to listings dashboard
      toast.success('Advertentie succesvol geplaatst!')
      router.push('/dashboard/advertenties')
      router.refresh()
    } catch (error) {
      console.error('Error creating listing:', error)
      throw error
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Nieuwe advertentie plaatsen
        </h1>
        <p className="text-gray-600 mt-2">
          Vul de onderstaande gegevens in om je advertentie te plaatsen
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <ListingForm onSubmit={handleSubmit} submitLabel="Advertentie plaatsen" />
      </div>
    </div>
  )
}
