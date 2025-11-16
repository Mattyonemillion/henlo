import { z } from 'zod'

/**
 * Validation Schemas
 *
 * This file contains Zod schemas for validating user input throughout the application.
 * Zod provides type-safe validation with detailed error messages.
 *
 * These schemas are used in:
 * - React Hook Form with @hookform/resolvers/zod
 * - API route validation
 * - TypeScript type inference
 */

/**
 * Listing Schema
 *
 * Validates listing creation and update forms.
 *
 * Rules:
 * - Title: 5-100 characters
 * - Description: Minimum 20 characters (ensures quality listings)
 * - Price: Minimum €0.01 (prevents zero or negative prices)
 * - Condition: One of 5 predefined values (Dutch language)
 * - Category: Must be a valid UUID
 * - Location: Minimum 2 characters
 * - Shipping/Pickup: At least one must be true (enforced in form logic)
 */
export const listingSchema = z.object({
  title: z.string().min(5, 'Titel moet minimaal 5 karakters zijn').max(100),
  description: z.string().min(20, 'Beschrijving moet minimaal 20 karakters zijn'),
  price: z.number().min(0.01, 'Prijs moet minimaal €0,01 zijn'),
  condition: z.enum(['nieuw', 'als_nieuw', 'goed', 'redelijk', 'matig']),
  category_id: z.string().uuid(),
  location: z.string().min(2),
  shipping_available: z.boolean(),
  pickup_available: z.boolean(),
})

/**
 * Profile Schema
 *
 * Validates user profile information.
 *
 * Rules:
 * - Username: 3-20 characters, alphanumeric and underscores only, no spaces
 * - Full Name: 2-50 characters
 * - Bio: Optional, max 500 characters
 * - Location: Optional, min 2 characters
 * - Phone: Optional, validates Dutch phone format (+31 or 0, followed by 9 digits)
 *
 * Phone Format Examples:
 * - Valid: +31612345678, 0612345678
 * - Invalid: 06-12345678, +31 6 12345678 (no spaces or dashes allowed)
 */
export const profileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  full_name: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
  location: z.string().min(2).optional(),
  phone: z.string().regex(/^(\+31|0)[1-9][0-9]{8}$/).optional(),
})
