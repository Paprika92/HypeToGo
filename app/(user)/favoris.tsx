import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, TouchableOpacity,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { useFavorites } from '../../hooks/useFavorites'
import { EventCard } from '../../components/EventCard'
import { BottomNavbar } from '../../components/BottomNavbar'
import { Colors } from '../../constants/theme'
import { Event } from '../../hooks/useEvents'

export default function FavorisScreen() {
  const { profile } = useAuthStore()
  const { favorites } = useFavorites()
  const [favEvents, setFavEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('favorites')
      .select('event_data, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const events = (data ?? [])
          .map((f: any) => f.event_data)
          .filter(Boolean)
        setFavEvents(events)
        setLoading(false)
      })
  }, [profile?.id, favorites.length])

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Favoris</Text>
        <View style={s.countBadge}>
          <Text style={s.countTxt}>{favEvents.length}</Text>
        </View>
      </View>
      <View style={s.divider} />

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator color={Colors.purpleLight} size="large" />
        </View>
      ) : favEvents.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>♡</Text>
          <Text style={s.emptyTitle}>Aucun favori pour l'instant</Text>
          <Text style={s.emptySub}>
            Appuie sur le cœur d'un événement pour le retrouver ici
          </Text>
          <TouchableOpacity
            style={s.exploreBtn}
            onPress={() => router.push('/(user)/explorer' as any)}
          >
            <Text style={s.exploreBtnTxt}>Explorer les events →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.sectionLbl}>
            {favEvents.length} event{favEvents.length > 1 ? 's' : ''} sauvegardé{favEvents.length > 1 ? 's' : ''}
          </Text>
          {favEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/event/${event.id}` as any)}
            />
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <BottomNavbar active="favoris" />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#0d0b1a' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, position: 'relative' },
  backBtn:       { position: 'absolute', left: 20, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon:      { color: '#fff', fontSize: 18 },
  title:         { color: '#fff', fontSize: 20, fontWeight: '700' },
  countBadge:    { position: 'absolute', right: 20, backgroundColor: Colors.purple, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countTxt:      { color: '#fff', fontSize: 13, fontWeight: '700' },
  divider:       { height: 1, backgroundColor: '#6C63FF', marginHorizontal: 20, marginBottom: 18, opacity: 0.4 },
  loader:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list:          { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  sectionLbl:    { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '600', marginBottom: 4 },
  empty:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon:     { fontSize: 56, marginBottom: 16, color: 'rgba(255,255,255,0.2)' },
  emptyTitle:    { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySub:      { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  exploreBtn:    { backgroundColor: Colors.purple, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  exploreBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
})