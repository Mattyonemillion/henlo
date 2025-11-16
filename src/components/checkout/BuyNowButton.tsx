'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BuyNowButtonProps {
  listingId: string
  listingTitle: string
  price: number
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  fullWidth?: boolean
}

export function BuyNowButton({
  listingId,
  listingTitle,
  price,
  className,
  size = 'lg',
  variant = 'default',
  fullWidth = false,
}: BuyNowButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleBuyNow = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login with return URL
        router.push(`/login?redirect=/advertenties/${listingId}`)
        return
      }

      // Call checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Mollie checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan')
      setIsProcessing(false)
    }
  }

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <Button
        onClick={handleBuyNow}
        disabled={isProcessing}
        size={size}
        variant={variant}
        className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Verwerken...
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5 mr-2" />
            Koop nu - €{price.toFixed(2)}
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
