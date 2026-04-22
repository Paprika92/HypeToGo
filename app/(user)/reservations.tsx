import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { BottomNavbar } from '../../components/BottomNavbar'
import { Colors } from '../../constants/theme'
import { CATEGORIES } from '../../constants/categories'
import { formatPrice, formatEventDate } from '../../hooks/useEvents'

interface Reservation {
  id: string
  ref: string
  quantity: number
  total_price: number
  created_at: string
  event: {
    id: string
    title: string
    category: string
    location_name: string
    date: string
    price: number
  }
}

export default function ReservationsScreen() {
  const { profile } = useAuthStore()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('reservations')
      .select(`
        id, ref, quantity, total_price, created_at,
        event:events(id, title, category, location_name, date, price)
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReservations((data ?? []) as any)
        setLoading(false)
      })
  }, [profile?.id])

  const upcoming = reservations.filter(r => new Date(r.event.date) > new Date())
  const past = reservations.filter(r => new Date(r.event.date) <= new Date())

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Mes réservations</Text>
      </View>
      <View style={s.divider} />

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator color={Colors.purpleLight} size="large" />
        </View>
      ) : reservations.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🎟️</Text>
          <Text style={s.emptyTitle}>Aucune réservation</Text>
          <Text style={s.emptySub}>Tes billets apparaîtront ici</Text>
          <TouchableOpacity
            style={s.exploreBtn}
            onPress={() => router.push('/(user)/explorer' as any)}
            activeOpacity={0.85}
          >
            <Text style={s.exploreBtnTxt}>Explorer les events →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {upcoming.length > 0 && (
            <>
              <Text style={s.sectionLbl}>À VENIR · {upcoming.length}</Text>
              {upcoming.map(r => <ReservationCard key={r.id} resa={r} upcoming />)}
            </>
          )}

          {past.length > 0 && (
            <>
              <Text style={s.sectionLbl}>PASSÉS · {past.length}</Text>
              {past.map(r => <ReservationCard key={r.id} resa={r} upcoming={false} />)}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      <BottomNavbar active="profil" />
    </SafeAreaView>
  )
}

function ReservationCard({ resa, upcoming }: { resa: Reservation; upcoming: boolean }) {
  const cat = CATEGORIES[resa.event.category as keyof typeof CATEGORIES]

  return (
    <TouchableOpacity
      style={[s.card, !upcoming && s.cardPast]}
      onPress={() => router.push(`/event/${resa.event.id}` as any)}
      activeOpacity={0.85}
    >
      {/* Icône catégorie */}
      <View style={[s.cardIcon, { backgroundColor: cat?.colors?.[0] ?? '#1E1B33' }]}>
        <Text style={{ fontSize: 22 }}>{cat?.emoji ?? '🎟️'}</Text>
      </View>

      <View style={s.cardContent}>
        <View style={s.cardTop}>
          <Text style={s.cardTitle} numberOfLines={1}>{resa.event.title}</Text>
          {upcoming ? (
            <View style={s.badgeUpcoming}>
              <Text style={s.badgeUpcomingTxt}>À venir</Text>
            </View>
          ) : (
            <View style={s.badgePast}>
              <Text style={s.badgePastTxt}>Passé</Text>
            </View>
          )}
        </View>

        <Text style={s.cardMeta}>
          📍 {resa.event.location_name}
        </Text>
        <Text style={s.cardMeta}>
          📅 {formatEventDate(resa.event.date)}
        </Text>

        <View style={s.cardBottom}>
          <View style={s.refBox}>
            <Text style={s.refLabel}>Réf.</Text>
            <Text style={s.refValue}>{resa.ref}</Text>
          </View>
          <View style={s.priceBox}>
            <Text style={s.qtyTxt}>{resa.quantity} place{resa.quantity > 1 ? 's' : ''}</Text>
            <Text style={s.priceTxt}>{formatPrice(resa.total_price)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#0d0b1a' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, position: 'relative' },
  backBtn:          { position: 'absolute', left: 20, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon:         { color: '#fff', fontSize: 18 },
  title:            { color: '#fff', fontSize: 20, fontWeight: '700' },
  divider:          { height: 1, backgroundColor: '#6C63FF', marginHorizontal: 20, marginBottom: 18, opacity: 0.4 },
  loader:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:           { paddingHorizontal: 20 },
  sectionLbl:       { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12, marginTop: 8 },
  card:             { flexDirection: 'row', backgroundColor: '#13112a', borderRadius: 18, borderWidth: 0.5, borderColor: 'rgba(108,99,255,0.3)', padding: 14, marginBottom: 12, gap: 14 },
  cardPast:         { opacity: 0.6, borderColor: 'rgba(255,255,255,0.07)' },
  cardIcon:         { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardContent:      { flex: 1 },
  cardTop:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle:        { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700', marginRight: 8 },
  badgeUpcoming:    { backgroundColor: 'rgba(108,99,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeUpcomingTxt: { color: Colors.purpleLight, fontSize: 10, fontWeight: '700' },
  badgePast:        { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgePastTxt:     { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700' },
  cardMeta:         { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 2 },
  cardBottom:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  refBox:           { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  refLabel:         { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 1 },
  refValue:         { fontSize: 12, fontWeight: '700', color: Colors.purpleLight },
  priceBox:         { alignItems: 'flex-end' },
  qtyTxt:           { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  priceTxt:         { fontSize: 16, fontWeight: '800', color: '#fff' },
  empty:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIcon:        { fontSize: 52, marginBottom: 8 },
  emptyTitle:       { color: '#fff', fontSize: 18, fontWeight: '700' },
  emptySub:         { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  exploreBtn:       { marginTop: 16, backgroundColor: Colors.purple, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 12 },
  exploreBtnTxt:    { color: '#fff', fontSize: 14, fontWeight: '700' },
})