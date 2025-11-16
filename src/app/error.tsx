'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Er is iets misgegaan
          </h1>

          <p className="text-gray-600 mb-6">
            Sorry, er is een onverwachte fout opgetreden. Probeer het opnieuw of ga terug naar de homepage.
          </p>

          {error.digest && (
            <p className="text-sm text-gray-500 mb-6">
              Foutcode: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} variant="default">
              Opnieuw proberen
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Ga naar homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
