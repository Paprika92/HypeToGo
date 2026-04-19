import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Event, formatPrice, formatDistance, isTonight, isTomorrow } from '../hooks/useEvents'
import { CATEGORIES } from '../constants/categories'
import { Colors } from '../constants/theme'
import { useFavorites } from '../hooks/useFavorites'

interface EventCardProps {
  event: Event
  onPress: () => void
}

export function EventCard({ event, onPress }: EventCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const liked = isFavorite(event.id)
  const config = CATEGORIES[event.category]
  const tonight = isTonight(event.date)
  const tomorrow = isTomorrow(event.date)

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={s.card}>
      <LinearGradient
        colors={config?.colors ?? ['#1a1730', '#2d2850']}
        style={s.cardInner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.cardTop}>
          <View style={s.cardIcon}>
            <Text style={{ fontSize: 20 }}>{config?.emoji}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {tonight && (
              <View style={[s.badge, { backgroundColor: Colors.red }]}>
                <Text style={s.badgeTxt}>Ce soir</Text>
              </View>
            )}
            {tomorrow && (
              <View style={[s.badge, { backgroundColor: Colors.green }]}>
                <Text style={s.badgeTxt}>Demain</Text>
              </View>
            )}
            <TouchableOpacity
              style={[s.heart, liked && s.heartLiked]}
              onPress={() => toggleFavorite(event.id, event)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ color: liked ? Colors.red : '#fff', fontSize: 16 }}>
                {liked ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.cardTitle} numberOfLines={1}>{event.title}</Text>

        <View style={s.cardBottom}>
          <View>
            <Text style={s.cardMeta}>
              {event.location_name} · {formatDistance(event.distance_km)}
            </Text>
            <View style={s.catPill}>
              <Text style={s.catPillTxt}>{config?.label}</Text>
            </View>
          </View>
          <Text style={s.price}>{formatPrice(event.price)}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card:       { borderRadius: 18, overflow: 'hidden' },
  cardInner:  { padding: 16, minHeight: 110, justifyContent: 'space-between', gap: 8 },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardIcon:   { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  badge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeTxt:   { color: '#fff', fontSize: 10, fontWeight: '700' },
  heart:      { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heartLiked: { backgroundColor: 'rgba(239,68,68,0.35)' },
  cardTitle:  { fontWeight: '700', fontSize: 18, color: '#fff' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardMeta:   { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  catPill:    { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  catPillTxt: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },
  price:      { fontSize: 18, fontWeight: '700', color: '#fff' },
})