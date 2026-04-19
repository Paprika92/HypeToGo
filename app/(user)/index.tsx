import React, { useState, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator,
  Dimensions,
} from 'react-native'
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

import { useLocation } from '../../hooks/useLocation'
import { useEvents, Event } from '../../hooks/useEvents'
import { useAuthStore } from '../../stores/useAuthStore'
import { Category } from '../../hooks/useEvents'

import { MapPin } from '../../components/MapPin'
import { EventBottomSheet } from '../../components/EventBottomSheet'
import { CategoryChips } from '../../components/CategoryChips'
import { BottomNavbar } from '../../components/BottomNavbar'
import { Colors, PARIS_BOUNDS } from '../../constants/theme'

const { height } = Dimensions.get('window')

const INITIAL_REGION: Region = {
  latitude: PARIS_BOUNDS.centerLat,
  longitude: PARIS_BOUNDS.centerLng,
  latitudeDelta: 0.06,
  longitudeDelta: 0.04,
}

export default function HomeScreen() {
  const { profile } = useAuthStore()
  const { location, loading: locLoading } = useLocation()
  const [category, setCategory] = useState<Category | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const mapRef = useRef<MapView>(null)

  const { events, loading: eventsLoading } = useEvents({
    lat: location.lat,
    lng: location.lng,
    category,
    enabled: !locLoading,
  })

  const handlePinPress = useCallback((event: Event) => {
    setSelectedEventId(event.id)
    // Centre la carte sur le pin sélectionné
    mapRef.current?.animateToRegion({
      latitude: event.lat - 0.008,
      longitude: event.lng,
      latitudeDelta: 0.04,
      longitudeDelta: 0.03,
    }, 350)
  }, [])

  const handleCategoryChange = useCallback((cat: Category | null) => {
    setCategory(cat)
    setSelectedEventId(null)
  }, [])

  const isLoading = locLoading || eventsLoading

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ─────────────────────────────────────── */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerRow}>
          {/* Logo */}
          <Text style={styles.logo}>
            <Text style={{ color: '#a78bfa' }}>Hype</Text>
            <Text style={{ color: '#7c3aed' }}>To</Text>
            <Text style={{ color: '#c084fc' }}>Go</Text>
          </Text>

          {/* Cloche notif */}
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/(user)/notifications')}
          >
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(user)/search')}
          activeOpacity={0.85}
        >
          <Text style={styles.searchPlaceholder}>
            Rechercher un évènement...
          </Text>
          <View style={styles.filtresBtn}>
            <Text style={styles.filtresTxt}>Filtres</Text>
          </View>
        </TouchableOpacity>

        {/* Chips catégories */}
        <CategoryChips
          selected={category}
          onChange={handleCategoryChange}
        />
      </SafeAreaView>

      {/* ── Carte ──────────────────────────────────────── */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          initialRegion={INITIAL_REGION}
          customMapStyle={DARK_MAP_STYLE}
          showsUserLocation={location.isRealGPS}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
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

        {/* Spinner overlay pendant le chargement */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={Colors.purpleLight} size="large" />
            <Text style={styles.loadingText}>
              {locLoading ? 'Localisation...' : 'Chargement des events...'}
            </Text>
          </View>
        )}

        {/* Badge position réelle ou Paris par défaut */}
        {!isLoading && !location.isRealGPS && (
          <TouchableOpacity style={styles.locBadge}>
            <Text style={styles.locBadgeText}>📍 Paris (par défaut)</Text>
          </TouchableOpacity>
        )}

        {/* Bottom sheet avec les events */}
        {!isLoading && (
          <EventBottomSheet
            events={events.slice(0, 8)}
            selectedId={selectedEventId}
            onCardPress={handlePinPress}
          />
        )}

        {/* Aucun event */}
        {!isLoading && events.length === 0 && (
          <View style={styles.emptyMap}>
            <Text style={styles.emptyText}>
              Aucun évènement trouvé{category ? ` en "${category}"` : ''} près de toi
            </Text>
          </View>
        )}
      </View>

      {/* ── Bottom Navbar ───────────────────────────────── */}
      <BottomNavbar active="carte" />
    </View>
  )
}

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    backgroundColor: Colors.bg,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
  },
  bellBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.bg3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: Colors.red,
    borderRadius: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg3,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 50,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingLeft: 18,
    paddingRight: 6,
    height: 48,
  },
  searchPlaceholder: {
    flex: 1,
    color: Colors.text3,
    fontSize: 15,
  },
  filtresBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filtresTxt: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,9,18,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.text2,
    fontSize: 14,
  },
  locBadge: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(18,15,32,0.9)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  locBadgeText: {
    color: Colors.text2,
    fontSize: 12,
  },
  emptyMap: {
    position: 'absolute',
    top: '40%',
    left: 24,
    right: 24,
    backgroundColor: 'rgba(18,15,32,0.9)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.text2,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
})

// ── Style carte sombre (compatible MapView) ──────────────────────
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
