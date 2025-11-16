'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormError } from '@/components/ui/error-message'
import { toast } from '@/components/ui/toast'
import ImageUpload from './ImageUpload'
import { Loader2 } from 'lucide-react'

// Validation schema
const listingSchema = z.object({
  title: z
    .string()
    .min(5, 'Titel moet minimaal 5 karakters zijn')
    .max(100, 'Titel mag maximaal 100 karakters zijn'),
  description: z
    .string()
    .min(20, 'Beschrijving moet minimaal 20 karakters zijn')
    .max(2000, 'Beschrijving mag maximaal 2000 karakters zijn'),
  price: z
    .number()
    .min(0, 'Prijs moet positief zijn')
    .max(1000000, 'Prijs mag niet meer dan €1.000.000 zijn'),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor'], 'Selecteer een staat'),
  category: z.string().min(1, 'Selecteer een categorie'),
  location: z
    .string()
    .min(2, 'Locatie moet minimaal 2 karakters zijn')
    .max(100, 'Locatie mag maximaal 100 karakters zijn'),
})

export type ListingFormData = z.infer<typeof listingSchema>

interface ListingFormProps {
  onSubmit: (data: ListingFormData, images: File[]) => Promise<void>
  initialData?: Partial<ListingFormData>
  existingImages?: string[]
  submitLabel?: string
}

const CONDITIONS = [
  { value: 'new', label: 'Nieuw' },
  { value: 'like_new', label: 'Als nieuw' },
  { value: 'good', label: 'Goed' },
  { value: 'fair', label: 'Redelijk' },
  { value: 'poor', label: 'Matig' },
]

const CATEGORIES = [
  { value: 'electronics', label: 'Elektronica' },
  { value: 'clothing', label: 'Kleding' },
  { value: 'home_garden', label: 'Huis & Tuin' },
  { value: 'sports', label: 'Sport' },
  { value: 'books', label: 'Boeken' },
  { value: 'toys', label: 'Speelgoed' },
  { value: 'vehicles', label: 'Voertuigen' },
  { value: 'other', label: 'Overig' },
]

export default function ListingForm({
  onSubmit,
  initialData,
  existingImages = [],
  submitLabel = 'Advertentie plaatsen',
}: ListingFormProps) {
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageError, setImageError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: initialData,
  })

  const condition = watch('condition')
  const category = watch('category')

  const handleFormSubmit = async (data: ListingFormData) => {
    // Validate images
    if (images.length === 0 && existingImages.length === 0) {
      setImageError('Voeg minimaal 1 afbeelding toe')
      toast.error('Voeg minimaal 1 afbeelding toe')
      return
    }

    setImageError('')
    setIsSubmitting(true)

    try {
      await onSubmit(data, images)
      toast.success(
        initialData
          ? 'Advertentie succesvol bijgewerkt!'
          : 'Advertentie succesvol geplaatst!'
      )
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Er ging iets mis bij het opslaan. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Titel <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Bijv. iPhone 13 Pro in perfecte staat"
          {...register('title')}
          className={errors.title ? 'border-red-500 focus:ring-red-500' : ''}
        />
        <FormError message={errors.title?.message} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Beschrijving <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Geef een gedetailleerde beschrijving van het artikel..."
          rows={6}
          {...register('description')}
          className={errors.description ? 'border-red-500 focus:ring-red-500' : ''}
        />
        <FormError message={errors.description?.message} />
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">
          Prijs (€) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('price', { valueAsNumber: true })}
          className={errors.price ? 'border-red-500 focus:ring-red-500' : ''}
        />
        <FormError message={errors.price?.message} />
      </div>

      {/* Condition and Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Condition */}
        <div className="space-y-2">
          <Label>
            Staat <span className="text-red-500">*</span>
          </Label>
          <Select
            value={condition}
            onValueChange={(value) =>
              setValue('condition', value as ListingFormData['condition'])
            }
          >
            <SelectTrigger className={errors.condition ? 'border-red-500 focus:ring-red-500' : ''}>
              <SelectValue placeholder="Selecteer staat" />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((cond) => (
                <SelectItem key={cond.value} value={cond.value}>
                  {cond.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormError message={errors.condition?.message} />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>
            Categorie <span className="text-red-500">*</span>
          </Label>
          <Select
            value={category}
            onValueChange={(value) => setValue('category', value)}
          >
            <SelectTrigger className={errors.category ? 'border-red-500 focus:ring-red-500' : ''}>
              <SelectValue placeholder="Selecteer categorie" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormError message={errors.category?.message} />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">
          Locatie <span className="text-red-500">*</span>
        </Label>
        <Input
          id="location"
          placeholder="Bijv. Amsterdam"
          {...register('location')}
          className={errors.location ? 'border-red-500 focus:ring-red-500' : ''}
        />
        <FormError message={errors.location?.message} />
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>
          Foto&apos;s <span className="text-red-500">*</span>
        </Label>
        <ImageUpload
          onImagesChange={setImages}
          existingImages={existingImages}
        />
        <FormError message={imageError} />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 sm:gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 sm:flex-none sm:min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Bezig met opslaan...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}
