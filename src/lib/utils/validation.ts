import { z } from 'zod'

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

export const profileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  full_name: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
  location: z.string().min(2).optional(),
  phone: z.string().regex(/^(\+31|0)[1-9][0-9]{8}$/).optional(),
})
