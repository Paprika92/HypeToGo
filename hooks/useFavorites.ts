import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'

export function useFavorites() {
  const profile = useAuthStore(state => state.profile)
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) {
      setFavorites([])
      setLoading(false)
      return
    }
    supabase
      .from('favorites')
      .select('event_id')
      .eq('user_id', profile.id)
      .then(({ data }) => {
        setFavorites(data?.map(f => f.event_id) ?? [])
        setLoading(false)
      })
  }, [profile?.id])

  const toggleFavorite = useCallback(async (eventId: string, eventData?: object) => {
    if (!profile) return
    const isFav = favorites.includes(eventId)

    // Optimistic update — UI réagit immédiatement
    setFavorites(prev =>
      isFav ? prev.filter(id => id !== eventId) : [...prev, eventId]
    )

    if (isFav) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', profile.id)
        .eq('event_id', eventId)
    } else {
      await supabase
        .from('favorites')
        .insert({
          user_id: profile.id,
          event_id: eventId,
          event_data: eventData ?? null,
        })
    }
  }, [profile, favorites])

  const isFavorite = (eventId: string) => favorites.includes(eventId)

  return { favorites, isFavorite, toggleFavorite, loading }
}