/**
 * Formatting Utilities
 *
 * This file contains helper functions for formatting dates, prices, and other data
 * for display in the Dutch marketplace application.
 *
 * All functions use Dutch locale (nl-NL) for proper formatting.
 */

/**
 * Format Price in Euro
 *
 * Converts a numeric price to a formatted Euro currency string.
 * Uses Dutch locale formatting with proper thousand separators and decimal points.
 *
 * @param price - Numeric price value (e.g., 49.99)
 * @returns Formatted currency string (e.g., "€ 49,99")
 *
 * @example
 * formatPrice(1234.56) // Returns "€ 1.234,56"
 * formatPrice(9.99)    // Returns "€ 9,99"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

/**
 * Format Date (Full)
 *
 * Converts a date to a human-readable Dutch format.
 *
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "15 maart 2024")
 *
 * @example
 * formatDate('2024-03-15') // Returns "15 maart 2024"
 * formatDate(new Date())   // Returns current date in Dutch format
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Format Relative Time
 *
 * Converts a date to a human-friendly relative time string in Dutch.
 * Shows relative time for recent dates, falls back to full date for older dates.
 *
 * Time Ranges:
 * - < 1 minute: "zojuist" (just now)
 * - < 1 hour: "X minuten geleden" (X minutes ago)
 * - < 1 day: "X uur geleden" (X hours ago)
 * - < 1 week: "X dagen geleden" (X days ago)
 * - >= 1 week: Full date format (e.g., "15 maart 2024")
 *
 * @param date - Date string or Date object to format
 * @returns Relative time string in Dutch
 *
 * @example
 * formatRelativeTime('2024-03-15T10:30:00') // "2 uur geleden" (if current time is 12:30)
 * formatRelativeTime('2024-02-01')          // "1 februari 2024" (if more than a week ago)
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  // Less than 1 minute
  if (diffInSeconds < 60) return 'zojuist'

  // Less than 1 hour (60 seconds * 60 = 3600)
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minuten geleden`

  // Less than 1 day (60 * 60 * 24 = 86400)
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} uur geleden`

  // Less than 1 week (60 * 60 * 24 * 7 = 604800)
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dagen geleden`

  // More than 1 week: show full date
  return formatDate(date)
}
