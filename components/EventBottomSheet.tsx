import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Event, formatPrice, formatDistance, isTonight, isTomorrow } from '../hooks/useEvents'
import { CATEGORIES } from '../constants/categories'
import { Colors } from '../constants/theme'

const { width } = Dimensions.get('window')
const CARD_W = Math.min(182, width * 0.44)

interface EventBottomSheetProps {
  events: Event[]
  selectedId?: string | null
  onCardPress?: (event: Event) => void
}

export function EventBottomSheet({
  events,
  selectedId,
  onCardPress,
}: EventBottomSheetProps) {
  const [collapsed, setCollapsed] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (!selectedId || collapsed) return
    const index = events.findIndex(e => e.id === selectedId)
    if (index === -1) return
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: index * (CARD_W + 12),
        animated: true,
      })
    }, 100)
  }, [selectedId])

  if (events.length === 0) return null

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.handleWrapper}
        onPress={() => setCollapsed(v => !v)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 40, right: 40 }}
      >
        <View style={styles.handle} />
      </TouchableOpacity>

      {!collapsed && (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          decelerationRate="fast"
          snapToInterval={CARD_W + 12}
        >
          {events.map((event) => {
            const config = CATEGORIES[event.category]
            const tonight = isTonight(event.date)
            const tomorrow = isTomorrow(event.date)

            return (
              <TouchableOpacity
                key={event.id}
                activeOpacity={0.88}
                onPress={() => {
                  onCardPress?.(event)
                }}
                style={[
                  styles.card,
                  { width: CARD_W },
                  selectedId === event.id && styles.cardSelected,
                ]}
              >
                <LinearGradient
                  colors={config?.colors ?? ['#1a1730', '#2d2850']}
                  style={styles.cardInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.badgeRow}>
                    {tonight && (
                      <View style={[styles.badge, { backgroundColor: Colors.red }]}>
                        <Text style={styles.badgeText}>Ce soir</Text>
                      </View>
                    )}
                    {tomorrow && (
                      <View style={[styles.badge, { backgroundColor: Colors.green }]}>
                        <Text style={styles.badgeText}>Demain</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.emoji}>{config?.emoji ?? '📍'}</Text>
                  <View>
                    <Text style={styles.cat}>{config?.label?.toUpperCase()}</Text>
                    <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
                    <View style={styles.bottom}>
                      <Text style={styles.dist}>{formatDistance(event.distance_km)}</Text>
                      <Text style={styles.price}>{formatPrice(event.price)}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper:       { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 16 },
  handleWrapper: { alignItems: 'center', paddingVertical: 8 },
  handle:        { width: 40, height: 4, backgroundColor: Colors.border2, borderRadius: 2 },
  scroll:        { paddingHorizontal: 16, gap: 12 },
  card:          { borderRadius: 16, overflow: 'hidden' },
  cardSelected:  { transform: [{ scale: 1.02 }] },
  cardInner:     { padding: 12, height: 160, justifyContent: 'space-between' },
  badgeRow:      { flexDirection: 'row', justifyContent: 'flex-end' },
  badge:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText:     { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  emoji:         { fontSize: 36, textAlign: 'center', marginVertical: 4 },
  cat:           { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5, textTransform: 'uppercase' },
  title:         { fontWeight: '700', fontSize: 14, color: '#fff', lineHeight: 18, marginTop: 2 },
  bottom:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  dist:          { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  price:         { fontSize: 14, fontWeight: '700', color: '#fff' },
})
