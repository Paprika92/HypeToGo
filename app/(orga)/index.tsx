import React from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../stores/useAuthStore'
import { BottomNavbarOrga } from '../../components/BottomNavbarOrga'
import { Colors } from '../../constants/theme'

export default function OrgaHome() {
  return (
    <View style={s.container}>

      {/* Header */}
      <SafeAreaView style={s.header}>
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
            style={s.notifBtn}
            onPress={() => router.push('/(orga)/notifications' as any)}
            activeOpacity={0.8}
          >
            <Text style={s.notifIcon}>🔔</Text>
            <View style={s.notifDot} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Barre recherche events */}
      <TouchableOpacity
        style={s.searchBar}
        onPress={() => router.push('/(orga)/events' as any)}
        activeOpacity={0.8}
      >
        <Text style={s.searchPlaceholder}>Voir mes évènements ...</Text>
      </TouchableOpacity>

      {/* Carte (placeholder — même MapView que le screen user) */}
      <View style={s.mapPlaceholder}>
        <Text style={s.mapTxt}>🗺️</Text>
        <Text style={s.mapSub}>Carte de tes events publiés</Text>
      </View>

      {/* Bottom navbar */}
      <BottomNavbarOrga />
    </View>
  )
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0a0912' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  logo:             { fontSize: 28, fontWeight: '800', color: Colors.purpleLight, letterSpacing: -0.5 },
  headerRight:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  publishBtn:       { backgroundColor: Colors.purple, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 50, flexDirection: 'row', alignItems: 'center', gap: 6 },
  publishBtnTxt:    { color: '#fff', fontSize: 14, fontWeight: '700' },
  notifBtn:         { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifIcon:        { fontSize: 20 },
  notifDot:         { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3355', borderWidth: 1.5, borderColor: '#0a0912' },
  searchBar:        { marginHorizontal: 20, marginBottom: 12, backgroundColor: '#13112a', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 18, paddingVertical: 16 },
  searchPlaceholder:{ color: 'rgba(255,255,255,0.3)', fontSize: 15 },
  mapPlaceholder:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mapTxt:           { fontSize: 64 },
  mapSub:           { color: 'rgba(255,255,255,0.3)', fontSize: 14 },
})
