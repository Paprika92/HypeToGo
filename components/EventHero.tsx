import React, { useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ScrollView, Image, Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Event, formatPrice, formatDistance, formatEventDate, isTonight } from '../hooks/useEvents'
import { CATEGORIES } from '../constants/categories'
import { useFavorites } from '../hooks/useFavorites'
import { Colors } from '../constants/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface EventHeroProps {
  event: Event
  onReserve: () => void
  distanceKm?: number
}

export function EventHero({ event, onReserve, distanceKm }: EventHeroProps) {
  const config = CATEGORIES[event.category]
  const { isFavorite, toggleFavorite } = useFavorites()
  const isFav = isFavorite(event.id)
  const tonight = isTonight(event.date)
  const capacity = (event as any).capacity

  const photoUrls: string[] = ((event as any).photos ?? []).filter(
    (url: string) => !url.toLowerCase().endsWith('.heic') && !url.toLowerCase().endsWith('.heif')
  )

  const badgeOpacity = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (!tonight) return
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgeOpacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(badgeOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start()
  }, [tonight])

  const p1y = useRef(new Animated.Value(0)).current
  const p2y = useRef(new Animated.Value(0)).current
  const p3y = useRef(new Animated.Value(0)).current
  const p4y = useRef(new Animated.Value(0)).current
  const p5y = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const makeLoop = (val: Animated.Value, toVal: number, duration: number, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: toVal, duration, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration, useNativeDriver: true }),
        ])
      )
    makeLoop(p1y, -10, 1500).start()
    makeLoop(p2y, 8, 1200, 300).start()
    makeLoop(p3y, -8, 1800, 600).start()
    makeLoop(p4y, 6, 1400, 900).start()
    makeLoop(p5y, -12, 1100, 150).start()
  }, [])

  return (
    <View style={s.container}>
      <LinearGradient
        colors={config?.colors ?? ['#1a1730', '#2d2850']}
        style={s.top}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {photoUrls.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={StyleSheet.absoluteFillObject}
          >
            {photoUrls.map((url, i) => (
              <Image
                key={i}
                source={{ uri: url }}
                style={{ width: SCREEN_WIDTH, height: 220 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {photoUrls.length > 0 && (
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)']}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        {photoUrls.length === 0 && (
          <>
            <Animated.View style={[s.particle, { backgroundColor: config?.pinColor ?? '#c084fc', top: '20%', left: '20%', transform: [{ translateY: p1y }] }]} />
            <Animated.View style={[s.particle, { backgroundColor: '#fbbf24', top: '35%', right: '22%', width: 5, height: 5, transform: [{ translateY: p2y }] }]} />
            <Animated.View style={[s.particle, { backgroundColor: '#34d399', bottom: '30%', left: '30%', transform: [{ translateY: p3y }] }]} />
            <Animated.View style={[s.particle, { backgroundColor: config?.pinColor ?? '#c084fc', bottom: '25%', right: '35%', width: 6, height: 6, transform: [{ translateY: p4y }] }]} />
            <Animated.View style={[s.particle, { backgroundColor: '#fb923c', top: '15%', right: '40%', transform: [{ translateY: p5y }] }]} />
          </>
        )}

        {tonight && (
          <Animated.View style={[s.badgeBottomRight, { opacity: badgeOpacity }]}>
            <View style={s.pulseDot} />
            <Text style={s.badgeTxt}>CE SOIR</Text>
          </Animated.View>
        )}

        <TouchableOpacity
          style={[s.favBtn, isFav && s.favBtnActive]}
          onPress={() => toggleFavorite(event.id, event)}
        >
          <Text style={{ fontSize: 18, color: isFav ? Colors.red : 'rgba(255,255,255,0.7)' }}>
            {isFav ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>

        {photoUrls.length === 0 && (
          <Text style={s.emoji}>{config?.emoji ?? '🎉'}</Text>
        )}
      </LinearGradient>

      <View style={s.bottom}>
        <View style={s.catRow}>
          <View style={[s.catPill, {
            borderColor: (config?.pinColor ?? '#fff') + '55',
            backgroundColor: (config?.pinColor ?? '#fff') + '15',
          }]}>
            <Text style={[s.catPillTxt, { color: config?.pinColor }]}>
              {config?.label?.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={s.title} numberOfLines={2}>{event.title}</Text>
        <Text style={s.address}>📍 {event.location_name}</Text>

        <View style={s.grid}>
          <InfoBox label="📅 DATE" value={formatEventDate(event.date)} accent={config?.pinColor} />
          <InfoBox label="📍 DISTANCE" value={distanceKm !== undefined ? formatDistance(distanceKm) : '—'} accent={config?.pinColor} />
          <InfoBox
            label="PRIX / PLACE"
            value={formatPrice(event.price)}
            accent={event.price === 0 ? Colors.green : config?.pinColor}
            green={event.price === 0}
          />
          <InfoBox
            label="PLACES DISPO"
            value={capacity ? `${capacity} 🔥` : 'Illimités'}
            accent={config?.pinColor}
          />
        </View>
      </View>
    </View>
  )
}

function InfoBox({ label, value, accent, green }: {
  label: string
  value: string
  accent?: string
  green?: boolean
}) {
  return (
    <View style={s.infoBox}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoVal, { color: green ? Colors.green : (accent ?? Colors.purpleLight) }]}>
        {value}
      </Text>
    </View>
  )
}

const s = StyleSheet.create({
  container:        { borderRadius: 20, overflow: 'hidden', backgroundColor: '#0d0b1a', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' },
  top:              { height: 220, position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  particle:         { position: 'absolute', width: 4, height: 4, borderRadius: 2, opacity: 0.7 },
  emoji:            { fontSize: 76, zIndex: 2 },
  badgeBottomRight: { position: 'absolute', bottom: 14, right: 56, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(220,38,38,0.92)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, zIndex: 10 },
  pulseDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  badgeTxt:         { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  favBtn:           { position: 'absolute', top: 52, right: 16, width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(6,4,8,0.75)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  favBtnActive:     { borderColor: Colors.red },
  bottom:           { backgroundColor: '#0d0b1a', padding: 16, gap: 10 },
  catRow:           { flexDirection: 'row' },
  catPill:          { borderWidth: 0.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  catPillTxt:       { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title:            { fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 26, letterSpacing: -0.3 },
  address:          { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: -4 },
  grid:             { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoBox:          { flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.07)' },
  infoLabel:        { fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  infoVal:          { fontSize: 14, fontWeight: '700' },
})