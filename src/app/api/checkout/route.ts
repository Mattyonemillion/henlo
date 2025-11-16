import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mollieClient } from '@/lib/mollie'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { listingId } = await request.json()

  // Get listing
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single()

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  // Create Mollie payment
  const payment = await mollieClient.payments.create({
    amount: {
      currency: 'EUR',
      value: listing.price.toFixed(2),
    },
    description: `Aankoop: ${listing.title}`,
    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/betaling/success?id=${listingId}`,
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`,
    metadata: {
      listingId: listing.id,
      buyerId: user.id,
      sellerId: listing.user_id,
    },
  })

  // Store payment in database
  await supabase.from('payments').insert({
    id: payment.id,
    listing_id: listingId,
    buyer_id: user.id,
    seller_id: listing.user_id,
    amount: listing.price,
    status: payment.status,
  })

  return NextResponse.json({ checkoutUrl: payment.getCheckoutUrl() })
}
