import Image from 'next/image'
import Link from 'next/link'
import RatingStars from './RatingStars'
import type { Database } from '@/types/database'

type Review = Database['public']['Tables']['reviews']['Row'] & {
  reviewer: Database['public']['Tables']['profiles']['Row']
}

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Reviewer Info */}
      <div className="flex items-start gap-4 mb-4">
        <Link href={`/gebruiker/${review.reviewer.id}`} className="flex-shrink-0">
          {review.reviewer.avatar_url ? (
            <Image
              src={review.reviewer.avatar_url}
              alt={review.reviewer.full_name || 'Gebruiker'}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-lg">
                {review.reviewer.full_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/gebruiker/${review.reviewer.id}`}
              className="font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate"
            >
              {review.reviewer.full_name || 'Anonieme gebruiker'}
            </Link>
            <span className="text-sm text-gray-500 flex-shrink-0">
              {formatDate(review.created_at)}
            </span>
          </div>

          <div className="mt-1">
            <RatingStars rating={review.rating} size="sm" />
          </div>
        </div>
      </div>

      {/* Review Content */}
      {review.comment && (
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {review.comment}
        </p>
      )}
    </div>
  )
}
