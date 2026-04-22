import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { BottomNavbar } from '../../components/BottomNavbar'
import { Colors } from '../../constants/theme'
import { useLocation } from '../../hooks/useLocation'
import { useEvents, Category, formatPrice, formatDistance, formatEventDate } from '../../hooks/useEvents'
import { useAuthStore } from '../../stores/useAuthStore'

// ─── Config catégories ────────────────────────────────────────────────────────

const CATEGORIES: { label: string; icon: string; color: string; cat: Category | 'Tout' }[] = [
  { label: 'Concerts',       icon: '🎵', color: '#7B52D3', cat: 'concerts' },
  { label: 'Stand-Up',       icon: '🎤', color: '#C0284A', cat: 'standup' },
  { label: 'Sport',          icon: '⚽', color: '#1D4ED8', cat: 'sport' },
  { label: 'Expositions',    icon: '🎨', color: '#166534', cat: 'expos' },
  { label: 'Bars & Soirées', icon: '🍺', color: '#B45309', cat: 'bars' },
  { label: 'E-Sport',        icon: '🎮', color: '#0369A1', cat: 'esport' },
  { label: 'Théâtre',        icon: '🎭', color: '#7C2020', cat: 'theatre' },
  { label: 'Tout',           icon: '✦',  color: '#1E1B33', cat: 'Tout' },
]

const CAT_COLORS: Record<string, string> = {
  concerts: '#7B52D3',
  standup:  '#C0284A',
  sport:    '#1D4ED8',
  expos:    '#166534',
  bars:     '#B45309',
  esport:   '#0369A1',
  theatre:  '#7C2020',
}

const CAT_ICONS: Record<string, string> = {
  concerts: '🎵',
  standup:  '🎤',
  sport:    '⚽',
  expos:    '🎨',
  bars:     '🍺',
  esport:   '🎮',
  theatre:  '🎭',
}

const PRIX = ['Tous', 'Gratuit', 'Payant']
const QUAND = ['Aujd', 'Demain', 'Week-end', 'Cette semaine']

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ExplorerScreen() {
  const [selCat, setSelCat]     = useState<Category | null>(null)
  const [selPrix, setSelPrix]   = useState('Tous')
  const [selQuand, setSelQuand] = useState('Aujd')

  const { location } = useLocation()
  const { profile } = useAuthStore()
const favoriteCats: string[] = (profile as any)?.favorite_categories ?? []

const { events, loading, error, refetch } = useEvents({
  lat:      location.lat,
  lng:      location.lng,
  category: selCat,
  onlyFree: selPrix === 'Gratuit',
  radiusKm: 12,
  enabled:  true,
  favoriteCats,
})

  // Filtre côté client pour Payant et Quand
  // (onlyFree est géré côté Supabase, Payant et Quand on filtre ici)
  const filtered = events.filter(e => {
    if (selPrix === 'Payant' && e.price === 0) return false

    const diffH = (new Date(e.date).getTime() - Date.now()) / 3600000
    if (selQuand === 'Aujd'         && !(diffH >= 0 && diffH < 24))  return false
    if (selQuand === 'Demain'       && !(diffH >= 24 && diffH < 48)) return false
    if (selQuand === 'Week-end'     && !(diffH >= 0 && diffH <= 96)) return false
    if (selQuand === 'Cette semaine'&& !(diffH >= 0 && diffH <= 168))return false

    return true
  })

  const handleCat = (cat: Category | 'Tout') => {
    setSelCat(cat === 'Tout' ? null : cat)
  }

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Explorer</Text>
        {!location.isRealGPS && (
          <View style={s.gpsBadge}>
            <Text style={s.gpsTxt}>📍 Paris</Text>
          </View>
        )}
      </View>
      <View style={s.divider} />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Catégories */}
        <Text style={s.sectionLbl}>Catégorie</Text>
        <View style={s.catGrid}>
          {CATEGORIES.map(c => {
            const isActive = c.cat === 'Tout' ? selCat === null : selCat === c.cat
            const isDimmed = selCat !== null && !isActive
            return (
              <TouchableOpacity
                key={c.cat}
                style={[
                  s.catBtn,
                  { backgroundColor: c.color },
                  isActive && s.catSelected,
                  isDimmed && s.catDim,
                ]}
                onPress={() => handleCat(c.cat)}
                activeOpacity={0.8}
              >
                <Text style={s.catIcon}>{c.icon}</Text>
                <Text style={s.catLabel}>{c.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Prix */}
        <Text style={s.sectionLbl}>Prix</Text>
        <View style={s.pillRow}>
          {PRIX.map(p => (
            <TouchableOpacity
              key={p}
              style={[s.pill, selPrix === p && s.pillActive]}
              onPress={() => setSelPrix(p)}
            >
              {p === 'Gratuit' && <Text style={s.greenDot}>●</Text>}
              <Text style={[s.pillTxt, selPrix === p && s.pillTxtActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quand */}
        <Text style={s.sectionLbl}>Quand</Text>
        <View style={s.pillRow}>
          {QUAND.map(q => (
            <TouchableOpacity
              key={q}
              style={[s.pill, selQuand === q && s.pillActive]}
              onPress={() => setSelQuand(q)}
            >
              <Text style={[s.pillTxt, selQuand === q && s.pillTxtActive]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Résultats */}
        {loading ? (
          <View style={s.loader}>
            <ActivityIndicator color={Colors.purpleLight} size="large" />
            <Text style={s.loaderTxt}>Chargement des events…</Text>
          </View>
        ) : error ? (
          <View style={s.errorBox}>
            <Text style={s.errorIcon}>⚠️</Text>
            <Text style={s.errorTxt}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={refetch}>
              <Text style={s.retryTxt}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={s.resultsLbl}>
              <Text style={s.resultsCount}>{filtered.length}</Text> événement{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
            </Text>

            {filtered.length === 0 && (
              <Text style={s.empty}>Aucun événement pour ces filtres</Text>
            )}

            {filtered.map(e => (
              <TouchableOpacity
                key={e.id}
                style={s.eventCard}
                onPress={() => router.push(`/event/${e.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={[s.eventIcon, { backgroundColor: CAT_COLORS[e.category] ?? '#1E1B33' }]}>
                  <Text style={{ fontSize: 22 }}>{CAT_ICONS[e.category] ?? '✦'}</Text>
                </View>
                <View style={s.eventInfo}>
                  <Text style={s.eventName}>{e.title}</Text>
                  <Text style={s.eventMeta}>
                    📍 {formatDistance(e.distance_km)} · {formatEventDate(e.date)}
                  </Text>
                </View>
                <View style={[
                  s.priceTag,
                  e.price === 0 ? s.priceTagFree : s.priceTagPaid,
                ]}>
                  <Text style={[
                    s.priceTagTxt,
                    e.price === 0 ? s.priceTagTxtFree : s.priceTagTxtPaid,
                  ]}>
                    {formatPrice(e.price)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <BottomNavbar active="explorer" />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#0d0b1a' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, position: 'relative' },
  backBtn:      { position: 'absolute', left: 20, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon:     { color: '#fff', fontSize: 18 },
  title:        { color: '#fff', fontSize: 20, fontWeight: '700' },
  gpsBadge:     { position: 'absolute', right: 20, backgroundColor: 'rgba(108,99,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(108,99,255,0.4)' },
  gpsTxt:       { color: Colors.purpleLight, fontSize: 11, fontWeight: '600' },
  divider:      { height: 1, backgroundColor: '#6C63FF', marginHorizontal: 20, marginBottom: 18, opacity: 0.4 },
  scroll:       { flex: 1, paddingHorizontal: 20 },
  sectionLbl:   { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 10 },
  catGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  catBtn:       { width: '47%', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  catSelected:  { borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.7)' },
  catDim:       { opacity: 0.35 },
  catIcon:      { fontSize: 20 },
  catLabel:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  pillRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  pill:         { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.06)', flexDirection: 'row', alignItems: 'center', gap: 5 },
  pillActive:   { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  pillTxt:      { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
  pillTxtActive:{ color: '#fff' },
  greenDot:     { color: '#22c55e', fontSize: 8 },
  loader:       { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loaderTxt:    { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  errorBox:     { alignItems: 'center', paddingVertical: 40, gap: 10 },
  errorIcon:    { fontSize: 32 },
  errorTxt:     { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' },
  retryBtn:     { backgroundColor: Colors.purple, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 8 },
  retryTxt:     { color: '#fff', fontSize: 13, fontWeight: '700' },
  resultsLbl:   { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '500', marginBottom: 12 },
  resultsCount: { color: '#6C63FF', fontWeight: '700' },
  empty:        { textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, paddingVertical: 32 },
  eventCard:    { backgroundColor: '#13112a', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 18, padding: 13, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  eventIcon:    { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  eventInfo:    { flex: 1 },
  eventName:    { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  eventMeta:    { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
  priceTag:     { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  priceTagFree: { backgroundColor: 'rgba(34,197,94,0.15)' },
  priceTagPaid: { backgroundColor: 'rgba(167,139,255,0.15)' },
  priceTagTxt:      { fontSize: 10, fontWeight: '700' },
  priceTagTxtFree:  { color: '#22c55e' },
  priceTagTxtPaid:  { color: Colors.purpleLight },
})