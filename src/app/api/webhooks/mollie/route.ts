import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mollieClient } from '@/lib/mollie'

/**
 * Mollie Webhook Handler
 *
 * This endpoint is called by Mollie whenever a payment status changes.
 * It's crucial for updating the database with the latest payment status
 * and marking listings as sold when payment is successful.
 *
 * Flow:
 * 1. Receive payment ID from Mollie webhook
 * 2. Fetch the latest payment status from Mollie API
 * 3. Update the payment record in the database
 * 4. If payment is successful ('paid'), mark the listing as sold
 *
 * Security Note: This endpoint is called by Mollie's servers, not the client.
 * Always verify payment status by fetching from Mollie API, never trust
 * the webhook payload alone to prevent spoofing.
 *
 * @param request - Contains the payment ID from Mollie
 * @returns JSON confirmation that webhook was received
 */
export async function POST(request: NextRequest) {
  const { id } = await request.json()

  // SECURITY: Always fetch payment status from Mollie API
  // Never trust the webhook payload alone - this prevents spoofing attacks
  const payment = await mollieClient.payments.get(id)

  // Create Supabase client for database operations
  const supabase = await createClient()

  // Update the payment status in our database
  // Possible statuses: 'pending', 'paid', 'failed', 'canceled', 'expired'
  await supabase
    .from('payments')
    .update({ status: payment.status })
    .eq('id', id)

  // If payment is successful, mark the listing as sold
  if (payment.status === 'paid') {
    // Extract metadata that was stored when payment was created
    const metadata = payment.metadata as any

    // Update listing status to 'sold' and record when it was sold
    await supabase
      .from('listings')
      .update({ status: 'sold', sold_at: new Date().toISOString() })
      .eq('id', metadata.listingId)

    // TODO: Consider adding notifications here:
    // - Notify seller that item was sold
    // - Notify buyer that payment was successful
    // - Send confirmation emails to both parties
  }

  // Mollie expects a 200 OK response to confirm webhook was received
  return NextResponse.json({ received: true })
}
