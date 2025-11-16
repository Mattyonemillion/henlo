'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
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
  const router = useRouter()
  const supabase = createClient()

  const handleBuyNow = async () => {
    setIsProcessing(true)

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Log eerst in om een aankoop te doen')
        router.push(`/login?redirect=/advertenties/${listingId}`)
        return
      }

      toast.loading('Checkout voorbereiden...', { duration: 2000 })

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
        toast.success('Doorverwijzen naar betaling...')
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Er is iets misgegaan bij het afrekenen'
      toast.error(errorMessage)
      setIsProcessing(false)
    }
  }

  return (
    <Button
      onClick={handleBuyNow}
      disabled={isProcessing}
      size={size}
      variant={variant}
      className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
          <span className="text-sm sm:text-base">Verwerken...</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span className="text-sm sm:text-base">Koop nu - €{price.toFixed(2)}</span>
        </>
      )}
    </Button>
  )
}
