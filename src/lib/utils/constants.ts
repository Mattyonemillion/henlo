export const CATEGORIES = [
  { id: 'electronics', name: 'Elektronica', icon: '💻' },
  { id: 'clothing', name: 'Kleding', icon: '👕' },
  { id: 'home', name: 'Huis & Tuin', icon: '🏠' },
  { id: 'sports', name: 'Sport & Hobby', icon: '⚽' },
  { id: 'books', name: 'Boeken & Media', icon: '📚' },
  { id: 'toys', name: 'Speelgoed', icon: '🧸' },
  { id: 'vehicles', name: 'Auto & Motor', icon: '🚗' },
  { id: 'other', name: 'Overig', icon: '📦' },
] as const

export const CONDITION_TYPES = [
  { value: 'nieuw', label: 'Nieuw', description: 'Ongebruikt in originele verpakking' },
  { value: 'als_nieuw', label: 'Als nieuw', description: 'Nauwelijks gebruikt, geen zichtbare schade' },
  { value: 'goed', label: 'Goed', description: 'Lichte gebruikssporen, volledig functioneel' },
  { value: 'redelijk', label: 'Redelijk', description: 'Duidelijke gebruikssporen, volledig functioneel' },
  { value: 'matig', label: 'Matig', description: 'Zichtbare schade of defecten' },
] as const

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Nieuwste eerst' },
  { value: 'oldest', label: 'Oudste eerst' },
  { value: 'price_asc', label: 'Prijs: laag naar hoog' },
  { value: 'price_desc', label: 'Prijs: hoog naar laag' },
] as const

export const LISTINGS_PER_PAGE = 20

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_IMAGES_PER_LISTING = 8
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
