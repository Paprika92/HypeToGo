import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { BottomNavbar } from '../../components/BottomNavbar'
import { Colors } from '../../constants/theme'

// Types
type NotifType = 'Concert' | 'Réservation' | 'Près de toi' | 'Alerte' | 'Avis' | 'Info'

interface Notif {
  id: string
  title: string
  subtitle: string
  time?: string
  type: NotifType
  read: boolean
  emoji: string
  emoji_bg: string
  created_at: string
}

// Couleurs par type de notif
const TYPE_STYLE: Record<string, { badge_bg: string; badge_text: string; card_bg: string; border: string }> = {
  'event':       { badge_bg: '#3A2870', badge_text: '#C4A8FF', card_bg: '#1A1240', border: '#3A2870' },
  'reservation': { badge_bg: '#0F3D2A', badge_text: '#52D68A', card_bg: '#0A2018', border: '#1A5C3A' },
  'alert':       { badge_bg: '#5C1A1A', badge_text: '#FF6B6B', card_bg: '#2A0808', border: '#7A2020' },
  'info':        { badge_bg: '#1A1A35', badge_text: '#8888BB', card_bg: '#111128', border: '#2A2A45' },
}
const TYPE_LABEL: Record<string, string> = {
  'event':       'Concert',
  'reservation': 'Réservation',
  'alert':       'Alerte',
  'info':        'Info',
};

// Données de fallback si pas encore de table Supabase
const MOCK_NOTIFS: Notif[] = []

export default function NotificationsScreen() {
  const { profile } = useAuthStore()
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [useMock, setUseMock] = useState(false)

  // Charge les notifs depuis Supabase
  // Si la table n'existe pas encore → fallback sur mock
  useEffect(() => {
    if (!profile) return
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          // Table pas encore créée ou vide → mock
          setNotifs(MOCK_NOTIFS)
          setUseMock(true)
        } else {
          setNotifs(data as Notif[])
        }
        setLoading(false)
      })
  }, [profile?.id])

  // Marquer une notif comme lue
  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    if (!useMock) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
    }
  }

  // Marquer toutes comme lues
  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    if (!useMock && profile) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', profile.id)
    }
  }

  // Grouper par section (Aujourd'hui / Hier / Plus ancien)
  const aujourd_hui = notifs.filter(n => {
    if (!n.read) return true
    const h = (Date.now() - new Date(n.created_at).getTime()) / 3600000
    return h < 24
  })
  const hier = notifs.filter(n => {
    if (!n.read) return false
    const h = (Date.now() - new Date(n.created_at).getTime()) / 3600000
    return h >= 24 && h < 48
  })
  const ancien = notifs.filter(n => {
    if (!n.read) return false
    const h = (Date.now() - new Date(n.created_at).getTime()) / 3600000
    return h >= 48
  })

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
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
        <View style={s.loader}>
          <ActivityIndicator color={Colors.purpleLight} size="large" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Aujourd'hui */}
          {aujourd_hui.length > 0 && (
            <>
              <Text style={s.sectionLabel}>
                AUJOURD'HUI{unreadCount > 0 ? ` · ${unreadCount} NON LUE${unreadCount > 1 ? 'S' : ''}` : ''}
              </Text>
              {aujourd_hui.map(n => (
                <NotifCard key={n.id} notif={n} onPress={() => markRead(n.id)} />
              ))}
            </>
          )}

          {/* Section Hier */}
          {hier.length > 0 && (
            <>
              <Text style={s.sectionLabel}>HIER</Text>
              {hier.map(n => (
                <NotifCard key={n.id} notif={n} onPress={() => markRead(n.id)} />
              ))}
            </>
          )}

          {/* Section Plus ancien */}
          {ancien.length > 0 && (
            <>
              <Text style={s.sectionLabel}>PLUS ANCIEN</Text>
              {ancien.map(n => (
                <NotifCard key={n.id} notif={n} onPress={() => markRead(n.id)} />
              ))}
            </>
          )}

          {notifs.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🔔</Text>
              <Text style={s.emptyTitle}>Aucune notification</Text>
              <Text style={s.emptySub}>Tu seras notifié des events près de toi</Text>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <BottomNavbar active="profil" />
    </SafeAreaView>
  )
}

// ─── Composant carte notif ───────────────────────────────────────────────────

function NotifCard({ notif, onPress }: { notif: Notif; onPress: () => void }) {
  const style = TYPE_STYLE[notif.type] ?? TYPE_STYLE['Info']

  return (
    <TouchableOpacity
      style={[
        s.card,
        { backgroundColor: notif.read ? '#111125' : style.card_bg },
        !notif.read && { borderColor: style.border, borderWidth: 1 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Dot non lu */}
      {!notif.read && <View style={s.unreadDot} />}

      {/* Icône */}
      <View style={[s.iconBox, { backgroundColor: notif.emoji_bg }]}>
        <Text style={{ fontSize: 22 }}>{notif.emoji}</Text>
      </View>

      {/* Contenu */}
      <View style={s.content}>
        <Text style={s.cardTitle}>{notif.title}</Text>
        <Text style={s.cardSub} numberOfLines={1}>{notif.subtitle}</Text>
        <View style={s.cardMeta}>
          <Text style={s.cardTime}>{notif.created_at 
  ? (() => {
      const h = (Date.now() - new Date(notif.created_at).getTime()) / 3600000
      if (h < 1) return 'Il y a moins d\'1h'
      if (h < 24) return `Il y a ${Math.round(h)}h`
      if (h < 48) return 'Hier'
      return `Il y a ${Math.round(h/24)} jours`
    })()
  : notif.time ?? ''
}</Text>
          <View style={[s.typeBadge, { backgroundColor: style.badge_bg }]}>
            <Text style={[s.typeBadgeTxt, { color: style.badge_text }]}>{TYPE_LABEL[notif.type] ?? notif.type}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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

  // Card
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

  // Empty
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon:    { fontSize: 48, marginBottom: 16 },
  emptyTitle:   { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub:     { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center' },
})
