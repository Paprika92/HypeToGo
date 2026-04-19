import React, { useState, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useFavorites } from '../../hooks/useFavorites'
import { useLocation } from '../../hooks/useLocation'
import { useEvents, Event, formatPrice, formatDistance, isTonight, isTomorrow } from '../../hooks/useEvents'
import { CATEGORIES } from '../../constants/categories'
import { BottomNavbar } from '../../components/BottomNavbar'
import { Colors } from '../../constants/theme'

type SortKey = 'distance' | 'date' | 'tendance' | 'prix'

const SORT_OPTIONS: { key: SortKey; label: string; emoji: string; desc: string }[] = [
  { key: 'distance', label: 'Distance',  emoji: '📍', desc: 'Le plus proche en premier' },
  { key: 'date',     label: 'Date',      emoji: '📅', desc: 'Du plus récent au plus ancien' },
  { key: 'tendance', label: 'Tendance',  emoji: '🔥', desc: 'Les plus populaires du moment' },
  { key: 'prix',     label: 'Prix',      emoji: '💰', desc: 'Du moins cher au plus cher' },
]

export default function ListeScreen() {
  const { location } = useLocation()
  const { events, loading } = useEvents({ lat: location.lat, lng: location.lng })
  const [sort, setSort] = useState<SortKey>('distance')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const sorted = useMemo(() => {
    const copy = [...events]
    if (sort === 'prix')     return copy.sort((a, b) => a.price - b.price)
    if (sort === 'date')     return copy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    if (sort === 'tendance') return copy.sort(() => Math.random() - 0.5) // à remplacer par vraies stats
    return copy // distance déjà triée par Supabase
  }, [events, sort])

  const currentSort = SORT_OPTIONS.find((s) => s.key === sort)!

  return (
    <View style={styles.container}>
      <SafeAreaView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={{ color: Colors.text, fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Liste</Text>
          <TouchableOpacity style={styles.toutVoir}>
            <Text style={styles.toutVoirTxt}>Tout voir</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.accentLine} />

        {/* Barre tri */}
        <View style={styles.metaBar}>
          <Text style={styles.count}>
            {loading ? '...' : `${events.length} évènements`}
          </Text>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={styles.sortPill}
              onPress={() => setDropdownOpen((v) => !v)}
            >
              <Text style={styles.sortPillTxt}>
                {currentSort.emoji} {currentSort.label} ▾
              </Text>
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdown}>
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.dropItem, sort === opt.key && styles.dropItemActive]}
                    onPress={() => { setSort(opt.key); setDropdownOpen(false) }}
                  >
                    <View style={styles.dropLeft}>
                      <Text style={{ fontSize: 18 }}>{opt.emoji}</Text>
                      <View>
                        <Text style={styles.dropLabel}>{opt.label}</Text>
                        <Text style={styles.dropDesc}>{opt.desc}</Text>
                      </View>
                    </View>
                    {sort === opt.key && (
                      <Text style={{ color: Colors.purple }}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Liste */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.purpleLight} size="large" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {sorted.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun évènement trouvé près de toi</Text>
            </View>
          )}
          {sorted.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/event/${event.id}`)}
            />
          ))}
        </ScrollView>
      )}

      <BottomNavbar active="listes" />
    </View>
  )
}

// ── EventCard ────────────────────────────────────────────────────
function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const liked = isFavorite(event.id)
  const config = CATEGORIES[event.category]
  const tonight = isTonight(event.date)
  const tomorrow = isTomorrow(event.date)

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <LinearGradient
        colors={config?.colors ?? ['#1a1730', '#2d2850']}
        style={styles.cardInner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}>
            <Text style={{ fontSize: 20 }}>{config?.emoji}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {tonight && <View style={[styles.badge, { backgroundColor: Colors.red }]}><Text style={styles.badgeTxt}>Ce soir</Text></View>}
            {tomorrow && <View style={[styles.badge, { backgroundColor: Colors.green }]}><Text style={styles.badgeTxt}>Demain</Text></View>}
            <TouchableOpacity
              style={[styles.heart, liked && styles.heartLiked]}
              onPress={() => toggleFavorite(event.id, event)}
            >
              <Text style={{ color: liked ? Colors.red : '#fff', fontSize: 16 }}>
                {liked ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Titre */}
        <Text style={styles.cardTitle} numberOfLines={1}>{event.title}</Text>

        {/* Bottom row */}
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.cardMeta}>
              {event.location_name} · {formatDistance(event.distance_km)}
            </Text>
            <View style={styles.catPill}>
              <Text style={styles.catPillTxt}>{config?.label}</Text>
            </View>
          </View>
          <Text style={styles.price}>{formatPrice(event.price)}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, backgroundColor: Colors.bg3, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Syne', fontWeight: '700', fontSize: 22, color: Colors.text },
  toutVoir: { backgroundColor: Colors.purple, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  toutVoirTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  accentLine: { height: 2, marginHorizontal: 20, backgroundColor: Colors.purple, opacity: 0.6, borderRadius: 1 },
  metaBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  count: { fontSize: 14, fontWeight: '600', color: Colors.text2 },
  sortPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.purple, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  sortPillTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  dropdown: { position: 'absolute', top: 42, right: 0, zIndex: 50, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, overflow: 'hidden', minWidth: 220, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  dropItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  dropItemActive: { backgroundColor: 'rgba(124,58,237,0.15)' },
  dropLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dropLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  dropDesc: { fontSize: 11, color: Colors.text3, marginTop: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.text2, fontSize: 15, textAlign: 'center' },
  card: { borderRadius: 18, overflow: 'hidden' },
  cardInner: { padding: 16, minHeight: 110, justifyContent: 'space-between', gap: 8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  heart: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heartLiked: { backgroundColor: 'rgba(239,68,68,0.35)' },
  cardTitle: { fontWeight: '700', fontSize: 18, color: '#fff' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardMeta: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  catPill: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  catPillTxt: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },
  price: { fontSize: 18, fontWeight: '700', color: '#fff' },
})
