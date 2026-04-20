import React, { useState, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native'
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps'
import { router } from 'expo-router'

import { useLocation } from '../../hooks/useLocation'
import { useAuthStore } from '../../stores/useAuthStore'
import { supabase } from '../../lib/supabase'
import { Event } from '../../hooks/useEvents'

import { MapPin } from '../../components/MapPin'
import { BottomNavbarOrga } from '../../components/BottomNavbarOrga'
import { Colors, PARIS_BOUNDS } from '../../constants/theme'

const INITIAL_REGION: Region = {
  latitude: PARIS_BOUNDS.centerLat,
  longitude: PARIS_BOUNDS.centerLng,
  latitudeDelta: 0.06,
  longitudeDelta: 0.04,
}

export default function OrgaHome() {
  const { profile } = useAuthStore()
  const { location, loading: locLoading } = useLocation()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const mapRef = useRef<MapView>(null)

  // Charge les events de l'orga connecté
  React.useEffect(() => {
    if (!profile) return
    supabase
      .from('events')
      .select('*')
      .eq('organizer_id', profile.id)
      .eq('status', 'published')
      .then(({ data }) => {
        setEvents((data ?? []) as Event[])
        setLoading(false)
      })
  }, [profile?.id])

  const handlePinPress = useCallback((event: Event) => {
    setSelectedEventId(event.id)
    mapRef.current?.animateToRegion({
      latitude: event.lat - 0.008,
      longitude: event.lng,
      latitudeDelta: 0.04,
      longitudeDelta: 0.03,
    }, 350)
  }, [])

  const isLoading = locLoading || loading

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <SafeAreaView style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.logo}>HypeToGo</Text>
          <View style={s.headerRight}>
            <TouchableOpacity
              style={s.publishBtn}
              onPress={() => router.push('/(orga)/publier' as any)}
              activeOpacity={0.85}
            >
              <Text style={s.publishBtnTxt}>✏️ Publier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.bellBtn}
              onPress={() => router.push('/(orga)/notifications' as any)}
            >
              <Text style={{ fontSize: 20 }}>🔔</Text>
              <View style={s.bellDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Barre recherche events */}
        <TouchableOpacity
          style={s.searchBar}
          onPress={() => router.push('/(orga)/events' as any)}
          activeOpacity={0.85}
        >
          <Text style={s.searchPlaceholder}>Voir mes évènements ...</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* ── Carte ── */}
      <View style={s.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          initialRegion={INITIAL_REGION}
          customMapStyle={DARK_MAP_STYLE}
          showsUserLocation={location.isRealGPS}
          showsMyLocationButton={false}
          showsCompass={false}
          rotateEnabled={false}
          onPress={() => setSelectedEventId(null)}
        >
          {events.map((event) => (
            <MapPin
              key={event.id}
              event={event}
              onPress={handlePinPress}
              selected={selectedEventId === event.id}
            />
          ))}
        </MapView>

        {/* Spinner */}
        {isLoading && (
          <View style={s.loadingOverlay}>
            <ActivityIndicator color={Colors.purpleLight} size="large" />
            <Text style={s.loadingText}>Chargement de tes events...</Text>
          </View>
        )}

        {/* Badge Paris par défaut */}
        {!isLoading && !location.isRealGPS && (
          <View style={s.locBadge}>
            <Text style={s.locBadgeText}>📍 Paris (par défaut)</Text>
          </View>
        )}

        {/* Aucun event */}
        {!isLoading && events.length === 0 && (
          <View style={s.emptyMap}>
            <Text style={s.emptyText}>Aucun évènement publié pour l'instant</Text>
            <TouchableOpacity
              style={s.publishCta}
              onPress={() => router.push('/(orga)/publier' as any)}
            >
              <Text style={s.publishCtaTxt}>+ Publier mon premier event</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Compteur events sur la carte */}
        {!isLoading && events.length > 0 && (
          <View style={s.eventCount}>
            <Text style={s.eventCountTxt}>
              {events.length} event{events.length > 1 ? 's' : ''} sur la carte
            </Text>
          </View>
        )}
      </View>

      <BottomNavbarOrga />
    </View>
  )
}

// ── Styles ──
const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.bg },
  header:         { backgroundColor: Colors.bg, zIndex: 10 },
  headerRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  logo:           { fontSize: 28, fontWeight: '800', color: Colors.purpleLight },
  headerRight:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  publishBtn:     { backgroundColor: Colors.purple, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 50, flexDirection: 'row', alignItems: 'center', gap: 6 },
  publishBtnTxt:  { color: '#fff', fontSize: 14, fontWeight: '700' },
  bellBtn:        { width: 40, height: 40, backgroundColor: Colors.bg3, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellDot:        { position: 'absolute', top: 6, right: 6, width: 8, height: 8, backgroundColor: Colors.red, borderRadius: 4 },
  searchBar:      { marginHorizontal: 16, marginBottom: 10, backgroundColor: Colors.bg3, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 50, paddingHorizontal: 18, height: 48, justifyContent: 'center' },
  searchPlaceholder: { color: Colors.text3, fontSize: 15 },
  mapContainer:   { flex: 1, position: 'relative' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,9,18,0.7)', alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:    { color: Colors.text2, fontSize: 14 },
  locBadge:       { position: 'absolute', top: 12, alignSelf: 'center', backgroundColor: 'rgba(18,15,32,0.9)', borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  locBadgeText:   { color: Colors.text2, fontSize: 12 },
  emptyMap:       { position: 'absolute', top: '40%', left: 24, right: 24, backgroundColor: 'rgba(18,15,32,0.9)', borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 20, alignItems: 'center', gap: 12 },
  emptyText:      { color: Colors.text2, fontSize: 15, textAlign: 'center' },
  publishCta:     { backgroundColor: Colors.purple, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24 },
  publishCtaTxt:  { color: '#fff', fontSize: 13, fontWeight: '700' },
  eventCount:     { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: 'rgba(18,15,32,0.9)', borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  eventCountTxt:  { color: Colors.purpleLight, fontSize: 13, fontWeight: '600' },
})

// ── Style carte sombre ──
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d0b20' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b628a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0912' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1730' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2d2850' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2d2850' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#07061a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#a89fc8' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill', stylers: [{ color: '#4a4270' }] },
]