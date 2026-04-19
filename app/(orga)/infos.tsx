import React from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Linking, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { BottomNavbarOrga } from '../../components/BottomNavbarOrga'
import { Colors } from '../../constants/theme'

export default function InfosScreen() {
  const open = (url: string) => Linking.openURL(url).catch(() =>
    Alert.alert('Erreur', 'Impossible d\'ouvrir ce lien')
  )

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>À propos</Text>
      </View>
      <View style={s.divider} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Logo + version */}
        <View style={s.logoBlock}>
          <Text style={s.logoTxt}>HypeToGo</Text>
          <Text style={s.version}>Version 1.0.0</Text>
        </View>

        {/* Informations légales */}
        <Text style={s.sectionLbl}>INFORMATION LÉGALES</Text>
        <View style={s.menuSection}>
          <MenuItem emoji="🔒" label="Politique de confidalité" onPress={() => open('https://hypetogo.com/privacy')} />
          <View style={s.sep} />
          <MenuItem emoji="📄" label="Condition d'utilisation" onPress={() => open('https://hypetogo.com/terms')} />
          <View style={s.sep} />
          <MenuItem emoji="🍪" label="Gestion des cookies" onPress={() => Alert.alert('Cookies', 'Gestion des cookies à venir.')} />
        </View>

        {/* Contact & Support */}
        <Text style={s.sectionLbl}>CONTACT & SUPPORT</Text>
        <View style={s.menuSection}>
          <MenuItem emoji="✉️" label="Nous contacter" onPress={() => open('mailto:contact@hypetogo.com')} />
          <View style={s.sep} />
          <MenuItem emoji="🐛" label="Signaler un bug" onPress={() => open('mailto:bugs@hypetogo.com')} />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <BottomNavbarOrga />
    </SafeAreaView>
  )
}

function MenuItem({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.8}>
      <Text style={s.menuEmoji}>{emoji}</Text>
      <Text style={s.menuTxt}>{label}</Text>
      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#0d0b1a' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, position: 'relative' },
  backBtn:     { position: 'absolute', left: 20, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon:    { color: '#fff', fontSize: 18 },
  title:       { color: '#fff', fontSize: 20, fontWeight: '700' },
  divider:     { height: 1, backgroundColor: '#6C63FF', marginHorizontal: 20, marginBottom: 18, opacity: 0.4 },
  scroll:      { paddingHorizontal: 20 },
  logoBlock:   { alignItems: 'center', paddingVertical: 32, gap: 8 },
  logoTxt:     { fontSize: 32, fontWeight: '800', color: Colors.purpleLight, letterSpacing: -0.5 },
  version:     { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  sectionLbl:  { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  menuSection: { backgroundColor: '#13112a', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 16 },
  menuItem:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  menuEmoji:   { fontSize: 20 },
  menuTxt:     { flex: 1, fontSize: 15, fontWeight: '600', color: '#fff' },
  chevron:     { fontSize: 20, color: 'rgba(255,255,255,0.25)' },
  sep:         { height: 0.5, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 },
})
