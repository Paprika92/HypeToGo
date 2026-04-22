import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
  Modal,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../stores/useAuthStore'
import { BottomNavbar } from '../../components/BottomNavbar'
import { Colors } from '../../constants/theme'
import { supabase } from '../../lib/supabase'
import { ALL_CATEGORIES, CATEGORIES } from '../../constants/categories'

type Theme = 'sombre' | 'clair'

export default function ProfilUserScreen() {
  const { profile, signOut, setProfile } = useAuthStore()
  const [theme, setTheme] = useState<Theme>('sombre')
  const [stats, setStats] = useState({ reservations: 0, favoris: 0, avis: 0 })
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [favCats, setFavCats] = useState<string[]>((profile as any)?.favorite_categories ?? [])
  const [showCatModal, setShowCatModal] = useState(false)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      supabase.from('reservations').select('id', { count: 'exact' }).eq('user_id', profile.id),
      supabase.from('favorites').select('id', { count: 'exact' }).eq('user_id', profile.id),
      supabase.from('notifications').select('id', { count: 'exact' }).eq('user_id', profile.id).eq('read', false),
    ]).then(([resa, favs, notifs]) => {
      setStats({
        reservations: resa.count ?? 0,
        favoris: favs.count ?? 0,
        avis: 0,
      })
      setUnreadCount(notifs.count ?? 0)
      setLoading(false)
    })
  }, [profile?.id])

  const toggleCat = (cat: string) => {
    setFavCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const saveFavCats = async () => {
    if (!profile) return
    const { error } = await supabase
      .from('profiles')
      .update({ favorite_categories: favCats })
      .eq('id', profile.id)
    
    if (error) {
      Alert.alert('Erreur', error.message)
      return
    }
    setProfile({ ...profile, favorite_categories: favCats } as any)
setShowCatModal(false)
Alert.alert('✅ Sauvegardé', 'Tes catégories favorites ont été mises à jour.')
}

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

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.headerBg}>
          <View style={s.profileRow}>
            <View style={s.avatarWrapper}>
              <View style={s.avatar}>
                <Text style={s.avatarInitials}>{initials}</Text>
              </View>
              <View style={s.onlineDot} />
            </View>
            <View style={s.profileInfo}>
              <Text style={s.profileName}>{profile?.name ?? '—'}</Text>
              <Text style={s.profileEmail}>{profile?.email ?? '—'}</Text>
            </View>
            <TouchableOpacity
              style={s.modifierBtn}
              onPress={() => router.push('/(user)/parametres' as any)}
              activeOpacity={0.8}
            >
              <Text style={s.modifierTxt}>✏️ Modifier</Text>
            </TouchableOpacity>
          </View>
          <View style={s.roleBadge}>
            <Text style={s.roleBadgeTxt}>👤 Utilisateur · Paris 20e</Text>
          </View>
        </View>

        {/* ── Stats ── */}
        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color={Colors.purpleLight} />
          </View>
        ) : (
          <View style={s.statsRow}>
            <View style={[s.statCard, { backgroundColor: '#6C47FF' }]}>
              <Text style={s.statNum}>{stats.reservations}</Text>
              <Text style={s.statLbl}>Réservations</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: '#8B2020' }]}>
              <Text style={s.statNum}>{stats.favoris}</Text>
              <Text style={s.statLbl}>Favoris</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: '#1A6B3A' }]}>
              <Text style={s.statNum}>{stats.avis}</Text>
              <Text style={s.statLbl}>Avis</Text>
            </View>
          </View>
        )}

        {/* ── Mon Compte ── */}
        <Text style={s.sectionLbl}>MON COMPTE</Text>
        <View style={s.menuSection}>
          <TouchableOpacity
            style={s.menuItem}
            onPress={() => router.push('/(user)/reservations' as any)}
            activeOpacity={0.8}
          >
            <View style={s.menuLeft}>
              <View style={[s.menuIconBox, { backgroundColor: 'rgba(108,71,255,0.15)' }]}>
                <Text style={s.menuEmoji}>🎟️</Text>
              </View>
              <Text style={s.menuTxt}>Mes réservations</Text>
            </View>
            <View style={s.menuRight}>
              <Text style={s.menuCount}>{stats.reservations}</Text>
              <Text style={s.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={s.separator} />

          <TouchableOpacity
            style={s.menuItem}
            onPress={() => router.push('/(user)/favoris' as any)}
            activeOpacity={0.8}
          >
            <View style={s.menuLeft}>
              <View style={[s.menuIconBox, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                <Text style={s.menuEmoji}>❤️</Text>
              </View>
              <Text style={s.menuTxt}>Mes favoris</Text>
            </View>
            <View style={s.menuRight}>
              <Text style={s.menuCount}>{stats.favoris}</Text>
              <Text style={s.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={s.separator} />

          <TouchableOpacity
            style={s.menuItem}
            onPress={() => router.push('/(user)/notifications' as any)}
            activeOpacity={0.8}
          >
            <View style={s.menuLeft}>
              <View style={[s.menuIconBox, { backgroundColor: 'rgba(108,99,255,0.12)' }]}>
                <Text style={s.menuEmoji}>🔔</Text>
              </View>
              <Text style={s.menuTxt}>Notifications</Text>
            </View>
            <View style={s.menuRight}>
              {unreadCount > 0 && (
                <View style={s.notifBadge}>
                  <Text style={s.notifBadgeTxt}>{unreadCount}</Text>
                </View>
              )}
              <Text style={s.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Préférences ── */}
        <Text style={s.sectionLbl}>PRÉFÉRENCES</Text>
        <View style={s.menuSection}>
          <TouchableOpacity
            style={s.menuItem}
            onPress={() => setShowCatModal(true)}
            activeOpacity={0.8}
          >
            <View style={s.menuLeft}>
              <View style={[s.menuIconBox, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Text style={s.menuEmoji}>🏷️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.menuTxt}>Catégories favorites</Text>
                {favCats.length > 0 && (
                  <Text style={{ fontSize: 11, color: Colors.purpleLight, marginTop: 2 }}>
                    {favCats.length} sélectionnée{favCats.length > 1 ? 's' : ''}
                  </Text>
                )}
              </View>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>

          <View style={s.separator} />

          <View style={s.menuItem}>
            <View style={s.menuLeft}>
              <View style={[s.menuIconBox, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Text style={s.menuEmoji}>🎨</Text>
              </View>
              <Text style={s.menuTxt}>Thème de l'app</Text>
            </View>
          </View>
          <View style={s.themeToggle}>
            <TouchableOpacity
              style={[s.themeBtn, theme === 'clair' && s.themeBtnActive]}
              onPress={() => setTheme('clair')}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 16 }}>☀️</Text>
              <Text style={[s.themeTxt, theme === 'clair' && s.themeTxtActive]}>Clair</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.themeBtn, theme === 'sombre' && s.themeBtnActive]}
              onPress={() => setTheme('sombre')}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 16 }}>🌙</Text>
              <Text style={[s.themeTxt, theme === 'sombre' && s.themeTxtActive]}>Sombre</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Réglages ── */}
        <Text style={s.sectionLbl}>RÉGLAGES</Text>
        <View style={s.menuSection}>
          <TouchableOpacity
            style={s.menuItem}
            onPress={() => router.push('/(user)/parametres' as any)}
            activeOpacity={0.8}
          >
            <View style={s.menuLeft}>
              <View style={[s.menuIconBox, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Text style={s.menuEmoji}>⚙️</Text>
              </View>
              <Text style={s.menuTxt}>Paramètres</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Autre ── */}
        <Text style={s.sectionLbl}>AUTRE</Text>
        <View style={s.menuSection}>
          <TouchableOpacity style={s.menuItem} activeOpacity={0.8}>
            <View style={s.menuLeft}>
              <View style={[s.menuIconBox, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Text style={s.menuEmoji}>⭐</Text>
              </View>
              <Text style={s.menuTxt}>À propos</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Déconnexion ── */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={handleDeconnexion}
          activeOpacity={0.85}
        >
          <Text style={s.logoutTxt}>Se Déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavbar active="profil" />

      {/* ── Modal catégories ── */}
      <Modal visible={showCatModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Catégories favorites</Text>
            <Text style={s.modalSub}>Tes events préférés apparaîtront en premier</Text>
            <View style={s.catGrid}>
              {ALL_CATEGORIES.map(cat => {
                const cfg = CATEGORIES[cat]
                const selected = favCats.includes(cat)
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[s.catChip, selected && s.catChipActive]}
                    onPress={() => toggleCat(cat)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.catChipEmoji}>{cfg.emoji}</Text>
                    <Text style={[s.catChipTxt, selected && { color: '#fff' }]}>{cfg.label}</Text>
                    {selected && <Text style={s.catCheckmark}>✓</Text>}
                  </TouchableOpacity>
                )
              })}
            </View>
            <TouchableOpacity style={s.modalSaveBtn} onPress={saveFavCats} activeOpacity={0.85}>
              <Text style={s.modalSaveTxt}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowCatModal(false)}>
              <Text style={s.modalCancelTxt}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#0d0b1a' },
  headerBg:       { backgroundColor: '#3A1A8A', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  profileRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatarWrapper:  { position: 'relative' },
  avatar:         { width: 68, height: 68, borderRadius: 34, backgroundColor: '#1A1240', borderWidth: 2, borderColor: '#6C47FF', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 24, fontWeight: '800', color: '#a78bfa' },
  onlineDot:      { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#2ECC71', borderWidth: 2, borderColor: '#3A1A8A' },
  profileInfo:    { flex: 1 },
  profileName:    { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 2 },
  profileEmail:   { fontSize: 12, color: '#CCAAFF' },
  modifierBtn:    { backgroundColor: '#5533BB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  modifierTxt:    { fontSize: 12, fontWeight: '600', color: '#fff' },
  roleBadge:      { backgroundColor: '#2A0F6A', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleBadgeTxt:   { fontSize: 12, fontWeight: '600', color: '#C4A8FF' },
  statsRow:       { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  statCard:       { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  statNum:        { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 2 },
  statLbl:        { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  sectionLbl:     { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  menuSection:    { marginHorizontal: 20, backgroundColor: '#13112a', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  menuItem:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  menuLeft:       { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuIconBox:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuEmoji:      { fontSize: 17 },
  menuTxt:        { fontSize: 15, fontWeight: '600', color: '#fff' },
  menuRight:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuCount:      { fontSize: 14, fontWeight: '700', color: Colors.purpleLight },
  chevron:        { fontSize: 20, color: 'rgba(255,255,255,0.25)' },
  separator:      { height: 0.5, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 },
  notifBadge:     { backgroundColor: '#FF3355', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notifBadgeTxt:  { fontSize: 10, fontWeight: '700', color: '#fff' },
  themeToggle:    { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 14 },
  themeBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12, backgroundColor: '#0d0b1a' },
  themeBtnActive: { backgroundColor: '#2A1A60', borderWidth: 1.5, borderColor: '#6C47FF' },
  themeTxt:       { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },
  themeTxtActive: { color: Colors.purpleLight },
  logoutBtn:      { marginHorizontal: 20, marginTop: 16, backgroundColor: '#7A1A1A', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  logoutTxt:      { fontSize: 15, fontWeight: '700', color: '#fff' },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox:       { backgroundColor: '#13112a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle:     { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6 },
  modalSub:       { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 },
  catGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catChip:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  catChipActive:  { backgroundColor: Colors.purple, borderColor: Colors.purple },
  catChipEmoji:   { fontSize: 16 },
  catChipTxt:     { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  catCheckmark:   { fontSize: 12, color: '#fff' },
  modalSaveBtn:   { backgroundColor: Colors.purple, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  modalSaveTxt:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalCancelBtn: { alignItems: 'center', paddingVertical: 10 },
  modalCancelTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
})