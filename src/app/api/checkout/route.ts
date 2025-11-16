import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mollieClient } from '@/lib/mollie'

/**
 * Checkout API Route
 *
 * Creates a Mollie payment for a listing and returns the checkout URL.
 * This endpoint is called when a buyer wants to purchase a listing.
 *
 * Flow:
 * 1. Verify user authentication
 * 2. Fetch the listing details from the database
 * 3. Create a Mollie payment with the listing price
 * 4. Store the payment record in the database
 * 5. Return the Mollie checkout URL to redirect the buyer
 *
 * @param request - Contains the listingId in the request body
 * @returns JSON with checkoutUrl or error message
 */
export async function POST(request: NextRequest) {
  // Create authenticated Supabase client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Ensure user is authenticated before proceeding
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { listingId } = await request.json()

  // Fetch the listing to get price and details
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single()

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  // Create a payment via Mollie API
  // Mollie supports iDEAL, credit cards, and other payment methods
  const payment = await mollieClient.payments.create({
    amount: {
      currency: 'EUR',
      value: listing.price.toFixed(2), // Mollie requires 2 decimal places
    },
    description: `Aankoop: ${listing.title}`,
    // After payment, user is redirected to this URL
    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/betaling/success?id=${listingId}`,
    // Mollie will POST to this webhook when payment status changes
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`,
    // Store transaction metadata for webhook processing
    metadata: {
      listingId: listing.id,
      buyerId: user.id,
      sellerId: listing.user_id,
    },
  })

  // Store payment record in database for tracking
  // This will be updated by the Mollie webhook when status changes
  await supabase.from('payments').insert({
    id: payment.id,
    listing_id: listingId,
    buyer_id: user.id,
    seller_id: listing.user_id,
    amount: listing.price,
    status: payment.status, // Initially 'pending'
  })

  // Return the checkout URL where buyer completes payment
  return NextResponse.json({ checkoutUrl: payment.getCheckoutUrl() })
}
