import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  Linking, Alert, Dimensions,
} from 'react-native'
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { useLocation } from '../../hooks/useLocation'
import { Event, formatPrice } from '../../hooks/useEvents'
import { Colors } from '../../constants/theme'
import { EventHero } from '../../components/EventHero'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function EventDetailScreen() {
  const { id, orga } = useLocalSearchParams<{ id: string; orga?: string }>()
  const isOrga = orga === 'true'
  const { profile } = useAuthStore()
  const { location } = useLocation()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [reserving, setReserving] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (!id) return
      setLoading(true)
      supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setEvent(data as Event)
            if (profile && !isOrga) {
              supabase.from('event_views')
                .insert({ event_id: id, user_id: profile.id })
                .then(() => {
                  supabase.rpc('increment_event_views', { event_id_param: id }).then(() => {})
                })
            }
          }
          setLoading(false)
        })
    }, [id])
  )

  const handleReserve = async () => {
    if (!profile || !event) return
    setReserving(true)
    try {
      const ref = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      const { error } = await supabase.from('reservations').insert({
        user_id: profile.id,
        event_id: event.id,
        quantity: qty,
        ref,
        total_price: event.price * qty,
      })
      if (error) throw error
      await supabase.from('notifications').insert({
        user_id: profile.id,
        title: 'Réservation confirmée',
        subtitle: `${event.title} · Réf. ${ref}`,
        type: 'reservation',
        emoji: '✅',
        emoji_bg: '#0F3D2A',
        read: false,
        event_id: event.id,
      })
      Alert.alert(
        '✅ Réservation confirmée !',
        `Ta réservation est enregistrée.\nRéf. ${ref}`,
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de réserver')
    } finally {
      setReserving(false)
    }
  }

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator color={Colors.purpleLight} size="large" />
      </View>
    )
  }

  if (!event) {
    return (
      <View style={s.loader}>
        <Text style={{ color: Colors.text2 }}>Évènement introuvable</Text>
      </View>
    )
  }

  const distanceKm = event.lat && event.lng && location.lat && location.lng
    ? calcDistance(location.lat, location.lng, event.lat, event.lng)
    : undefined

  return (
    <View style={s.container}>

      <View style={s.backWrap}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={{ color: Colors.text, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <EventHero
          event={event}
          onReserve={handleReserve}
          distanceKm={distanceKm}
        />

        {event.description && (
          <Text style={s.desc}>{event.description}</Text>
        )}

        {!isOrga && (
          <TouchableOpacity
            style={s.linkRow}
            onPress={() => event.ticket_url && Linking.openURL(event.ticket_url)}
          >
            <View style={s.linkLeft}>
              <Text style={s.linkIcon}>🔗</Text>
              <View>
                <Text style={s.linkTitle}>Site Officiel & Billetterie</Text>
                <Text style={s.linkSub}>Acheter vos billets en externe</Text>
              </View>
            </View>
            <Text style={s.linkArrow}>→</Text>
          </TouchableOpacity>
        )}

        {!isOrga && (
          <View style={s.orderBox}>
            <Text style={s.orderTitle}>🎟️ Commander mes places</Text>
            <View style={s.qtyRow}>
              <Text style={s.qtyLabel}>Nombre de places</Text>
              <View style={s.qtyControls}>
                <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
                  <Text style={s.qtyBtnTxt}>−</Text>
                </TouchableOpacity>
                <Text style={s.qtyNum}>{qty}</Text>
                <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(q => Math.min(20, q + 1))}>
                  <Text style={s.qtyBtnTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={s.priceUnit}>
              Prix unitaire{' '}
              <Text style={{ color: Colors.green, fontWeight: '700' }}>
                {formatPrice(event.price)}
              </Text>
              {qty > 1 && (
                <Text style={{ color: Colors.text2 }}>
                  {'  '}Total : {formatPrice(event.price * qty)}
                </Text>
              )}
            </Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={s.stickyBtn}>
        {isOrga ? (
          <TouchableOpacity
            style={s.modifyBtn}
            onPress={() => router.push(`/(orga)/edit-event/${id}` as any)}
            activeOpacity={0.85}
          >
            <Text style={s.reserveBtnTxt}>✏️ Modifier cet évènement</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={s.reserveBtn}
            onPress={handleReserve}
            disabled={reserving}
            activeOpacity={0.85}
          >
            {reserving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.reserveBtnTxt}>Réserver ma place →</Text>
            }
          </TouchableOpacity>
        )}
      </View>

    </View>
  )
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.bg },
  loader:        { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  backWrap:      { position: 'absolute', top: 48, left: 16, zIndex: 20 },
  backBtn:       { width: 40, height: 40, backgroundColor: 'rgba(18,15,32,0.85)', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  scroll:        { gap: 16 },
  desc:          { fontSize: 14, color: Colors.text2, lineHeight: 22, paddingHorizontal: 16 },
  linkRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bg3, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16 },
  linkLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkIcon:      { fontSize: 20 },
  linkTitle:     { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  linkSub:       { fontSize: 11, color: Colors.text3 },
  linkArrow:     { fontSize: 18, color: Colors.text3 },
  orderBox:      { backgroundColor: Colors.bg3, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginHorizontal: 16 },
  orderTitle:    { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  qtyRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  qtyLabel:      { fontSize: 14, color: Colors.text },
  qtyControls:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn:        { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border2, alignItems: 'center', justifyContent: 'center' },
  qtyBtnTxt:     { color: Colors.text, fontSize: 18, lineHeight: 20 },
  qtyNum:        { fontSize: 20, fontWeight: '700', color: Colors.text, width: 24, textAlign: 'center' },
  priceUnit:     { fontSize: 12, color: Colors.text3 },
  stickyBtn:     { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 32, backgroundColor: 'transparent' },
  reserveBtn:    { backgroundColor: Colors.purple, borderRadius: 50, padding: 18, alignItems: 'center', shadowColor: Colors.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  modifyBtn:     { backgroundColor: Colors.purple, borderRadius: 50, padding: 18, alignItems: 'center', shadowColor: Colors.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  reserveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
})