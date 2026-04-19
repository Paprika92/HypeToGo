import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../stores/useAuthStore'
import { BottomNavbarOrga } from '../../components/BottomNavbarOrga'
import { Colors } from '../../constants/theme'

type Theme = 'sombre' | 'clair'

export default function ProfilOrgaScreen() {
  const { profile, signOut } = useAuthStore()
  const [theme, setTheme] = useState<Theme>('sombre')

  const handleDeconnexion = () => {
    Alert.alert(
      'Se déconnecter',
      'Es-tu sûr de vouloir te déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: signOut },
      ]
    )
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header violet */}
        <View style={s.headerBg}>
          <View style={s.profileRow}>
            <View style={s.avatarWrapper}>
              <View style={s.avatar}>
                <Text style={s.avatarIcon}>👤</Text>
              </View>
              <View style={s.onlineDot} />
            </View>
            <View style={s.profileInfo}>
              <Text style={s.profileName}>{profile?.name ?? '—'}</Text>
              <Text style={s.profileEmail}>{profile?.email ?? '—'}</Text>
            </View>
            <TouchableOpacity style={s.modifierBtn} activeOpacity={0.8}>
              <Text style={s.modifierTxt}>✏️ Modifier</Text>
            </TouchableOpacity>
          </View>
          <View style={s.roleBadge}>
            <Text style={s.roleBadgeTxt}>👤 Organisateur · Paris 20e</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: '#6C47FF' }]}>
            <Text style={s.statNum}>12</Text>
            <Text style={s.statLbl}>Réservations</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#8B2020' }]}>
            <Text style={s.statNum}>8</Text>
            <Text style={s.statLbl}>Évènements</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#1A6B3A' }]}>
            <Text style={s.statNum}>6</Text>
            <Text style={s.statLbl}>Avis</Text>
          </View>
        </View>

        {/* Mon Compte */}
        <Text style={s.sectionLbl}>MON COMPTE</Text>
        <View style={s.menuSection}>
          <TouchableOpacity style={s.menuItem} activeOpacity={0.8}>
            <View style={s.menuLeft}>
              <Text style={s.menuEmoji}>🎫</Text>
              <Text style={s.menuTxt}>Mes réservations</Text>
            </View>
            <View style={s.menuRight}>
              <Text style={s.menuCount}>45</Text>
              <Text style={s.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={s.separator} />

          <TouchableOpacity
            style={s.menuItem}
            onPress={() => router.push('/(orga)/events' as any)}
            activeOpacity={0.8}
          >
            <View style={s.menuLeft}>
              <Text style={s.menuEmoji}>📅</Text>
              <Text style={s.menuTxt}>Mes Évènements</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>

          <View style={s.separator} />

          <TouchableOpacity
            style={s.menuItem}
            onPress={() => router.push('/(orga)/notifications' as any)}
            activeOpacity={0.8}
          >
            <View style={s.menuLeft}>
              <Text style={s.menuEmoji}>🔔</Text>
              <Text style={s.menuTxt}>Notifications</Text>
            </View>
            <View style={s.menuRight}>
              <View style={s.notifBadge}>
                <Text style={s.notifBadgeTxt}>3</Text>
              </View>
              <Text style={s.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Préférences */}
        <Text style={s.sectionLbl}>PRÉFÉRENCES</Text>
        <View style={s.menuSection}>
          <View style={s.menuItem}>
            <View style={s.menuLeft}>
              <Text style={s.menuEmoji}>🎨</Text>
              <Text style={s.menuTxt}>Thème de l'app</Text>
            </View>
          </View>
          <View style={s.themeToggle}>
            <TouchableOpacity
              style={[s.themeBtn, theme === 'clair' && s.themeBtnActive]}
              onPress={() => setTheme('clair')}
            >
              <Text>☀️</Text>
              <Text style={[s.themeTxt, theme === 'clair' && s.themeTxtActive]}>Clair</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.themeBtn, theme === 'sombre' && s.themeBtnActive]}
              onPress={() => setTheme('sombre')}
            >
              <Text>🌙</Text>
              <Text style={[s.themeTxt, theme === 'sombre' && s.themeTxtActive]}>Sombre</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* À propos */}
        <View style={[s.menuSection, { marginBottom: 12, marginTop: 8 }]}>
          <TouchableOpacity
            style={s.menuItem}
            onPress={() => router.push('/(orga)/infos' as any)}
            activeOpacity={0.8}
          >
            <View style={s.menuLeft}>
              <Text style={s.menuEmoji}>⭐</Text>
              <Text style={s.menuTxt}>À propos</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={handleDeconnexion}
          activeOpacity={0.85}
        >
          <Text style={s.logoutTxt}>Se Déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavbarOrga />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#0d0b1a' },
  headerBg:      { backgroundColor: '#3A1A8A', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  profileRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatarWrapper: { position: 'relative' },
  avatar:        { width: 68, height: 68, borderRadius: 34, backgroundColor: '#1A1240', borderWidth: 2, borderColor: '#6C47FF', alignItems: 'center', justifyContent: 'center' },
  avatarIcon:    { fontSize: 28 },
  onlineDot:     { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#2ECC71', borderWidth: 2, borderColor: '#3A1A8A' },
  profileInfo:   { flex: 1 },
  profileName:   { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 2 },
  profileEmail:  { fontSize: 12, color: '#CCAAFF' },
  modifierBtn:   { backgroundColor: '#5533BB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  modifierTxt:   { fontSize: 12, fontWeight: '600', color: '#fff' },
  roleBadge:     { backgroundColor: '#2A0F6A', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleBadgeTxt:  { fontSize: 12, fontWeight: '600', color: '#C4A8FF' },
  statsRow:      { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  statCard:      { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  statNum:       { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 2 },
  statLbl:       { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  sectionLbl:    { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  menuSection:   { marginHorizontal: 20, backgroundColor: '#13112a', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  menuItem:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  menuLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuEmoji:     { fontSize: 18 },
  menuTxt:       { fontSize: 15, fontWeight: '600', color: '#fff' },
  menuRight:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuCount:     { fontSize: 14, fontWeight: '700', color: Colors.purpleLight },
  chevron:       { fontSize: 20, color: 'rgba(255,255,255,0.25)' },
  separator:     { height: 0.5, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 },
  notifBadge:    { backgroundColor: '#FF3355', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notifBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#fff' },
  themeToggle:   { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 14 },
  themeBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12, backgroundColor: '#0d0b1a' },
  themeBtnActive:{ backgroundColor: '#2A1A60', borderWidth: 1.5, borderColor: '#6C47FF' },
  themeTxt:      { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },
  themeTxtActive:{ color: Colors.purpleLight },
  logoutBtn:     { marginHorizontal: 20, marginTop: 8, backgroundColor: '#7A1A1A', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  logoutTxt:     { fontSize: 15, fontWeight: '700', color: '#fff' },
})
