'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const loadFavorites = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', userId)

      if (data) {
        setFavorites(new Set(data.map(f => f.listing_id)))
      }
    }

    loadFavorites()
  }, [userId])

  const toggleFavorite = async (listingId: string) => {
    if (!userId) return

    const isFavorited = favorites.has(listingId)

    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId, listing_id: listingId })

      setFavorites(prev => {
        const next = new Set(prev)
        next.delete(listingId)
        return next
      })
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, listing_id: listingId })

      setFavorites(prev => new Set(prev).add(listingId))
    }
  }

  return { favorites, toggleFavorite }
}
