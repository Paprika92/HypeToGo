import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, ActivityIndicator,
  Linking, Alert,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { Event, formatPrice, formatDistance, formatEventDate } from '../../hooks/useEvents'
import { useFavorites } from '../../hooks/useFavorites'
import { CATEGORIES } from '../../constants/categories'
import { Colors } from '../../constants/theme'

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { profile } = useAuthStore()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [reserving, setReserving] = useState(false)

  const { isFavorite, toggleFavorite } = useFavorites()
  const isFav = event ? isFavorite(event.id) : false

  // Charge l'event + incrémente les vues uniques
  useEffect(() => {
    if (!id) return
    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setEvent(data as Event)
          // Vue unique par user
          if (profile) {
            supabase
              .from('event_views')
              .insert({ event_id: id, user_id: profile.id })
              .then(() => {
                supabase
                  .rpc('increment_event_views', { event_id_param: id })
                  .then(() => {})
              })
          }
        }
        setLoading(false)
      })
  }, [id])

  const handleReserve = async () => {
    if (!profile || !event) return
    setReserving(true)
    try {
      const ref = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      const { error } = await supabase
        .from('reservations')
        .insert({
          user_id: profile.id,
          event_id: event.id,
          quantity: qty,
          ref,
          total_price: event.price * qty,
        })
      if (error) throw error
      router.push(`/confirmation?ref=${ref}`)
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de réserver')
    } finally {
      setReserving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.purpleLight} size="large" />
      </View>
    )
  }

  if (!event) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: Colors.text2 }}>Évènement introuvable</Text>
      </View>
    )
  }

  const config = CATEGORIES[event.category]
  const totalPrice = event.price * qty

  return (
    <View style={styles.container}>
      {/* Hero */}
      <LinearGradient
        colors={config?.colors ?? ['#1a1730', '#2d2850']}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.heroTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={{ color: Colors.text, fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.photoBtn}>
              <Text style={styles.photoBtnTxt}>📷 3</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.favBtn, isFav && styles.favBtnActive]}
              onPress={() => toggleFavorite(event.id, event)}
            >
              <Text style={{ fontSize: 18 }}>{isFav ? '♥' : '♡'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <Text style={styles.heroEmoji}>{config?.emoji ?? '📍'}</Text>
        <View style={[styles.catBadge, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
          <Text style={{ fontSize: 20 }}>{config?.emoji}</Text>
        </View>
      </LinearGradient>

      {/* Contenu */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sup}>{config?.label?.toUpperCase()}</Text>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.loc}>📍 {event.location_name}</Text>

        <View style={styles.grid}>
          <InfoBox label="📅 Date" value={formatEventDate(event.date)} />
          <InfoBox label="📍 Distance" value={formatDistance(event.distance_km)} />
          <InfoBox label="Prix / Place" value={formatPrice(event.price)} green={event.price === 0} />
          <InfoBox label="Places Dispo" value={event.capacity ? `${event.capacity} Places` : 'Illimités'} />
        </View>

        {event.description && (
          <Text style={styles.desc}>{event.description}</Text>
        )}

        {event.ticket_url && (
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL(event.ticket_url!)}
          >
            <Text style={styles.linkTxt}>🔗 Site Officiel & Billeterie externe</Text>
            <Text style={{ color: Colors.text2 }}>→</Text>
          </TouchableOpacity>
        )}

        <View style={styles.orderBox}>
          <Text style={styles.orderTitle}>🎟️ Commander mes places</Text>
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Nombre de places</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
                <Text style={styles.qtyBtnTxt}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.min(20, q + 1))}>
                <Text style={styles.qtyBtnTxt}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.priceUnit}>
            Prix unitaire{' '}
            <Text style={{ color: Colors.green, fontWeight: '700' }}>
              {formatPrice(event.price)}
            </Text>
            {qty > 1 && (
              <Text style={{ color: Colors.text2 }}>
                {'  '}Total : {formatPrice(totalPrice)}
              </Text>
            )}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton sticky */}
      <View style={styles.stickyBtn}>
        <TouchableOpacity
          style={styles.reserveBtn}
          onPress={handleReserve}
          disabled={reserving}
          activeOpacity={0.85}
        >
          {reserving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.reserveBtnTxt}>Réserver ma place →</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  )
}

function InfoBox({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoVal, green && { color: Colors.green }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.bg },
  loader:        { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  hero:          { height: 220, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  heroTop:       { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  backBtn:       { width: 40, height: 40, backgroundColor: 'rgba(18,15,32,0.85)', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  photoBtn:      { backgroundColor: 'rgba(18,15,32,0.85)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border },
  photoBtnTxt:   { color: Colors.text, fontSize: 12 },
  favBtn:        { width: 40, height: 40, backgroundColor: 'rgba(18,15,32,0.85)', borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  favBtnActive:  { backgroundColor: 'rgba(239,68,68,0.3)', borderColor: Colors.red },
  heroEmoji:     { fontSize: 72 },
  catBadge:      { position: 'absolute', bottom: 16, left: 20, width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body:          { padding: 20 },
  sup:           { fontSize: 11, fontWeight: '700', color: Colors.text3, letterSpacing: 1.5, textTransform: 'uppercase' },
  eventTitle:    { fontWeight: '800', fontSize: 26, color: Colors.text, marginTop: 6, marginBottom: 4, lineHeight: 30 },
  loc:           { fontSize: 14, color: Colors.purpleLight, marginBottom: 16 },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  infoBox:       { flex: 1, minWidth: '45%', backgroundColor: Colors.bg3, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  infoLabel:     { fontSize: 12, color: Colors.text3 },
  infoVal:       { fontSize: 18, fontWeight: '700', color: Colors.purpleLight, marginTop: 4 },
  desc:          { fontSize: 14, color: Colors.text2, lineHeight: 22, marginBottom: 16 },
  linkRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bg3, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  linkTxt:       { fontSize: 14, color: Colors.text2 },
  orderBox:      { backgroundColor: Colors.bg3, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
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
  reserveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
