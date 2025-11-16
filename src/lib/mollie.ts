import { createMollieClient } from '@mollie/api-client'

/**
 * Mollie Payment Client
 *
 * Initializes and exports the Mollie API client for payment processing.
 * Mollie is a European payment service provider that supports iDEAL, credit cards,
 * and other payment methods popular in the Netherlands.
 *
 * Environment Variables:
 * - MOLLIE_API_KEY: Your Mollie API key (test or live)
 *   - Test keys start with 'test_' and are used for development
 *   - Live keys start with 'live_' and are used in production
 *
 * Usage:
 * This client is used in:
 * - /api/checkout/route.ts - Creating payment checkouts
 * - /api/webhooks/mollie/route.ts - Processing payment status updates
 *
 * Supported Payment Methods (in Netherlands):
 * - iDEAL (most popular in NL)
 * - Credit/Debit cards (Visa, Mastercard, Amex)
 * - PayPal
 * - Bancontact
 * - And more...
 *
 * Documentation: https://docs.mollie.com
 *
 * @example
 * // Creating a payment
 * const payment = await mollieClient.payments.create({
 *   amount: { currency: 'EUR', value: '10.00' },
 *   description: 'Order #12345',
 *   redirectUrl: 'https://yoursite.com/success',
 *   webhookUrl: 'https://yoursite.com/api/webhooks/mollie'
 * })
 *
 * @example
 * // Getting payment status
 * const payment = await mollieClient.payments.get('tr_WDqYK6vllg')
 * console.log(payment.status) // 'paid', 'pending', 'failed', etc.
 */
export const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
})
