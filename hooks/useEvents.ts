import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export type Category = 'concerts' | 'standup' | 'sport' | 'expos' | 'bars' | 'esport' | 'theatre'

export interface Event {
  id: string
  organizer_id: string
  title: string
  category: Category
  description?: string
  location_name: string
  lat: number
  lng: number
  date: string
  price: number
  capacity?: number
  ticket_url?: string
  cover_url?: string
  status: 'published' | 'draft'
  created_at: string
  distance_km?: number
}

interface UseEventsOptions {
  lat: number
  lng: number
  category?: Category | null
  onlyFree?: boolean
  radiusKm?: number
  enabled?: boolean
}

export function useEvents({
  lat,
  lng,
  category = null,
  onlyFree = false,
  radiusKm = 12,
  enabled = true,
}: UseEventsOptions) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc('events_near', {
        user_lat: lat,
        user_lng: lng,
        radius_km: radiusKm,
        cat: category ?? null,
        only_free: onlyFree,
      })
      if (rpcError) throw rpcError
      setEvents((data as Event[]) ?? [])
    } catch (e: any) {
      setError(e.message ?? 'Erreur de chargement')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [lat, lng, category, onlyFree, radiusKm, enabled])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { events, loading, error, refetch: fetch }
}

// ── Favoris ───────────────────────────────────────────────────
export function useFavorites(userId: string | undefined) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('favorites')
      .select('event_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        setFavoriteIds(new Set(data?.map((f) => f.event_id) ?? []))
        setLoading(false)
      })
  }, [userId])

  const toggle = async (eventId: string) => {
    if (!userId) return
    const isFav = favoriteIds.has(eventId)

    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      isFav ? next.delete(eventId) : next.add(eventId)
      return next
    })

    if (isFav) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('event_id', eventId)
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, event_id: eventId })
    }
  }

  return { favoriteIds, loading, toggle }
}

// ── Helpers ───────────────────────────────────────────────────
export function formatPrice(price: number): string {
  return price === 0 ? 'Gratuit' : `${price}€`
}

export function formatDistance(km: number | undefined): string {
  if (km === undefined) return ''
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)} km`
}

export function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffH = (date.getTime() - now.getTime()) / 3600000

  if (diffH < 0) return 'Passé'
  if (diffH < 6) return `Ce soir - ${date.getHours()}h${String(date.getMinutes()).padStart(2, '0')}`
  if (diffH < 24) return `Aujourd'hui - ${date.getHours()}h${String(date.getMinutes()).padStart(2, '0')}`
  if (diffH < 48) return `Demain - ${date.getHours()}h${String(date.getMinutes()).padStart(2, '0')}`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function isTonight(dateStr: string): boolean {
  const diffH = (new Date(dateStr).getTime() - Date.now()) / 3600000
  return diffH >= 0 && diffH < 12
}

export function isTomorrow(dateStr: string): boolean {
  const diffH = (new Date(dateStr).getTime() - Date.now()) / 3600000
  return diffH >= 12 && diffH < 36
}
