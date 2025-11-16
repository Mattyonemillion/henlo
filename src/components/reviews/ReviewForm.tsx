'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import RatingStars from './RatingStars'

interface ReviewFormProps {
  reviewedUserId: string
  listingId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReviewForm({
  reviewedUserId,
  listingId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Selecteer een beoordeling')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Je moet ingelogd zijn om een beoordeling te plaatsen')
        return
      }

      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          reviewee_id: reviewedUserId,
          listing_id: listingId,
          rating,
          comment: comment.trim() || null,
        })

      if (insertError) throw insertError

      // Reset form
      setRating(0)
      setComment('')

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error submitting review:', err)
      setError('Er is een fout opgetreden bij het plaatsen van je beoordeling')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Schrijf een beoordeling
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Beoordeling *
        </label>
        <RatingStars
          rating={rating}
          interactive
          onRatingChange={setRating}
          size="lg"
        />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Opmerking (optioneel)
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Deel je ervaring met deze gebruiker..."
          maxLength={500}
        />
        <p className="mt-1 text-xs text-gray-500 text-right">
          {comment.length}/500 karakters
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Bezig met plaatsen...' : 'Beoordeling plaatsen'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Annuleren
          </button>
        )}
      </div>
    </form>
  )
}
