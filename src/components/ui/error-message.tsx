import { AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ErrorMessageProps {
  title?: string
  message: string
  variant?: 'inline' | 'banner' | 'card'
  className?: string
}

export function ErrorMessage({
  title = 'Er is iets misgegaan',
  message,
  variant = 'banner',
  className
}: ErrorMessageProps) {
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-start gap-2 text-sm text-red-600', className)}>
        <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>{message}</span>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        'bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3',
        className
      )}>
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <p className="text-sm">{message}</p>
        </div>
      </div>
    )
  }

  // card variant
  return (
    <div className={cn(
      'bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center',
      className
    )}>
      <div className="flex justify-center mb-3">
        <div className="bg-red-100 rounded-full p-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
      <p className="text-sm text-red-700">{message}</p>
    </div>
  )
}

interface FormErrorProps {
  message?: string
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return (
    <p className="flex items-center gap-1.5 text-sm text-red-600 mt-1.5">
      <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{message}</span>
    </p>
  )
}
