import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mollieClient } from '@/lib/mollie'

export async function POST(request: NextRequest) {
  const { id } = await request.json()

  // Get payment status from Mollie
  const payment = await mollieClient.payments.get(id)

  // Update database
  const supabase = await createClient()

  await supabase
    .from('payments')
    .update({ status: payment.status })
    .eq('id', id)

  // Als betaling geslaagd, markeer listing als verkocht
  if (payment.status === 'paid') {
    const metadata = payment.metadata as any
    await supabase
      .from('listings')
      .update({ status: 'sold', sold_at: new Date().toISOString() })
      .eq('id', metadata.listingId)
  }

  return NextResponse.json({ received: true })
}
