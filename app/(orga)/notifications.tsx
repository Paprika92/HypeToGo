// Notifications orga — même logique que user, navbar orga différente
import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { BottomNavbarOrga } from '../../components/BottomNavbarOrga'
import { Colors } from '../../constants/theme'

type NotifType = 'Concert' | 'Réservation' | 'Près de toi' | 'Alerte' | 'Avis' | 'Info'

interface Notif {
  id: string
  title: string
  subtitle: string
  time: string
  type: NotifType
  read: boolean
  emoji: string
  emoji_bg: string
}

const TYPE_STYLE: Record<NotifType, { badge_bg: string; badge_text: string; card_bg: string; border: string }> = {
  'Concert':      { badge_bg: '#3A2870', badge_text: '#C4A8FF', card_bg: '#1A1240', border: '#3A2870' },
  'Réservation':  { badge_bg: '#0F3D2A', badge_text: '#52D68A', card_bg: '#0A2018', border: '#1A5C3A' },
  'Près de toi':  { badge_bg: '#2A1A60', badge_text: '#A78BFF', card_bg: '#180D40', border: '#3A2870' },
  'Alerte':       { badge_bg: '#5C1A1A', badge_text: '#FF6B6B', card_bg: '#2A0808', border: '#7A2020' },
  'Avis':         { badge_bg: '#4A3800', badge_text: '#FFD166', card_bg: '#201800', border: '#6A5200' },
  'Info':         { badge_bg: '#1A1A35', badge_text: '#8888BB', card_bg: '#111128', border: '#2A2A45' },
}

const MOCK_NOTIFS: Notif[] = [
  { id: '1', title: 'Rappel — Ce soir !',       subtitle: "Daft Punk Tribute Night · L'Olympia",  time: 'Il y a 1h',  type: 'Concert',     read: false, emoji: '🎵', emoji_bg: '#3A2870' },
  { id: '2', title: 'Réservation confirmée',    subtitle: 'PSG vs OM · Réf. HTG-D8E4C2',         time: 'Il y a 5h',  type: 'Réservation', read: false, emoji: '✅', emoji_bg: '#0F3D2A' },
  { id: '3', title: 'Nouvel event près de toi', subtitle: "Bars Stand'art Café · Ménilmontant",  time: 'Il y a 3h',  type: 'Près de toi', read: false, emoji: '🔥', emoji_bg: '#2A1A60' },
  { id: '4', title: 'Plus que 5 places !',      subtitle: 'Carmen — Bizet · Opéra Garnier',      time: 'Hier',       type: 'Alerte',      read: true,  emoji: '⚡', emoji_bg: '#5C1A1A' },
  { id: '5', title: 'Donnez votre avis',        subtitle: 'Monet & Lumière — votre expérience ?',time: 'Hier',       type: 'Avis',        read: true,  emoji: '⭐', emoji_bg: '#4A3800' },
  { id: '6', title: 'Concert près de toi',      subtitle: 'Networking tech · Paris 9e · Ce soir',time: 'Il y a 2 jours', type: 'Concert', read: true, emoji: '🎵', emoji_bg: '#3A2870' },
]

export default function NotificationsOrgaScreen() {
  const { profile } = useAuthStore()
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [useMock, setUseMock] = useState(false)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setNotifs(MOCK_NOTIFS)
          setUseMock(true)
        } else {
          setNotifs(data as Notif[])
        }
        setLoading(false)
      })
  }, [profile?.id])

  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    if (!useMock) await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    if (!useMock && profile) await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id)
  }

  const unreadCount  = notifs.filter(n => !n.read).length
  const aujourd_hui  = notifs.filter(n => !n.read || n.time.includes('h'))
  const hier         = notifs.filter(n => n.read && n.time === 'Hier')
  const ancien       = notifs.filter(n => n.read && n.time.includes('jours'))

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={s.toutLireBtn} onPress={markAllRead}>
            <Text style={s.toutLireTxt}>Tout lire</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={s.divider} />

      {loading ? (
        <View style={s.loader}><ActivityIndicator color={Colors.purpleLight} size="large" /></View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {aujourd_hui.length > 0 && <>
            <Text style={s.sectionLabel}>AUJOURD'HUI{unreadCount > 0 ? ` · ${unreadCount} NON LUE${unreadCount > 1 ? 'S' : ''}` : ''}</Text>
            {aujourd_hui.map(n => <NotifCard key={n.id} notif={n} onPress={() => markRead(n.id)} />)}
          </>}
          {hier.length > 0 && <>
            <Text style={s.sectionLabel}>HIER</Text>
            {hier.map(n => <NotifCard key={n.id} notif={n} onPress={() => markRead(n.id)} />)}
          </>}
          {ancien.length > 0 && <>
            <Text style={s.sectionLabel}>PLUS ANCIEN</Text>
            {ancien.map(n => <NotifCard key={n.id} notif={n} onPress={() => markRead(n.id)} />)}
          </>}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <BottomNavbarOrga />
    </SafeAreaView>
  )
}

function NotifCard({ notif, onPress }: { notif: Notif; onPress: () => void }) {
  const style = TYPE_STYLE[notif.type] ?? TYPE_STYLE['Info']
  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: notif.read ? '#111125' : style.card_bg }, !notif.read && { borderColor: style.border, borderWidth: 1 }]}
      onPress={onPress} activeOpacity={0.8}
    >
      {!notif.read && <View style={s.unreadDot} />}
      <View style={[s.iconBox, { backgroundColor: notif.emoji_bg }]}>
        <Text style={{ fontSize: 22 }}>{notif.emoji}</Text>
      </View>
      <View style={s.content}>
        <Text style={s.cardTitle}>{notif.title}</Text>
        <Text style={s.cardSub} numberOfLines={1}>{notif.subtitle}</Text>
        <View style={s.cardMeta}>
          <Text style={s.cardTime}>{notif.time}</Text>
          <View style={[s.typeBadge, { backgroundColor: style.badge_bg }]}>
            <Text style={[s.typeBadgeTxt, { color: style.badge_text }]}>{notif.type}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#0d0b1a' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, position: 'relative' },
  backBtn:      { position: 'absolute', left: 20, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon:     { color: '#fff', fontSize: 18 },
  title:        { color: '#fff', fontSize: 20, fontWeight: '700' },
  toutLireBtn:  { position: 'absolute', right: 20 },
  toutLireTxt:  { color: Colors.purpleLight, fontSize: 13, fontWeight: '600' },
  divider:      { height: 1, backgroundColor: '#6C63FF', marginHorizontal: 20, marginBottom: 18, opacity: 0.4 },
  loader:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:       { paddingHorizontal: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: 8, marginBottom: 10 },
  card:         { flexDirection: 'row', borderRadius: 16, padding: 14, marginBottom: 8, alignItems: 'center', position: 'relative', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.06)' },
  unreadDot:    { position: 'absolute', left: -5, top: '50%', marginTop: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.purpleLight },
  iconBox:      { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 },
  content:      { flex: 1 },
  cardTitle:    { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  cardSub:      { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 6 },
  cardMeta:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTime:     { fontSize: 11, color: 'rgba(255,255,255,0.25)' },
  typeBadge:    { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  typeBadgeTxt: { fontSize: 10, fontWeight: '700' },
})
