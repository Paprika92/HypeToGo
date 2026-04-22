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

interface Notif {
  id: string
  title: string
  subtitle: string
  type: string
  read: boolean
  emoji: string
  emoji_bg: string
  created_at: string
  event_id?: string
}

const TYPE_STYLE: Record<string, { badge_bg: string; badge_text: string; card_bg: string; border: string }> = {
  'event':       { badge_bg: '#3A2870', badge_text: '#C4A8FF', card_bg: '#1A1240', border: '#3A2870' },
  'reservation': { badge_bg: '#0F3D2A', badge_text: '#52D68A', card_bg: '#0A2018', border: '#1A5C3A' },
  'alert':       { badge_bg: '#5C1A1A', badge_text: '#FF6B6B', card_bg: '#2A0808', border: '#7A2020' },
  'near':        { badge_bg: '#1A3050', badge_text: '#60A8FF', card_bg: '#0A1828', border: '#1A4070' },
  'reminder':    { badge_bg: '#3A2020', badge_text: '#FFB060', card_bg: '#1A0E08', border: '#5A3010' },
  'info':        { badge_bg: '#1A1A35', badge_text: '#8888BB', card_bg: '#111128', border: '#2A2A45' },
}

const TYPE_LABEL: Record<string, string> = {
  'event':       '🎵 Event',
  'reservation': '🎟️ Réservation',
  'alert':       '⚡ Alerte',
  'near':        '📍 Près de toi',
  'reminder':    '🔔 Rappel',
  'info':        'ℹ️ Info',
}

export default function NotificationsScreen() {
  const { profile } = useAuthStore()
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        setNotifs(error || !data ? [] : data as Notif[])
        setLoading(false)
      })
  }, [profile?.id])

  const markRead = async (notif: Notif) => {
    if (!notif.read) {
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
      await supabase.from('notifications').update({ read: true }).eq('id', notif.id)
    }
    if (notif.event_id) {
      router.push(`/event/${notif.event_id}` as any)
    }
  }

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    if (profile) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id)
    }
  }

  const unreadCount = notifs.filter(n => !n.read).length

  const getSection = (n: Notif) => {
    const h = (Date.now() - new Date(n.created_at).getTime()) / 3600000
    if (h < 24) return 'today'
    if (h < 48) return 'yesterday'
    return 'older'
  }

  const today     = notifs.filter(n => getSection(n) === 'today')
  const yesterday = notifs.filter(n => getSection(n) === 'yesterday')
  const older     = notifs.filter(n => getSection(n) === 'older')

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
        <View style={s.loader}>
          <ActivityIndicator color={Colors.purpleLight} size="large" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {today.length > 0 && (
            <>
              <Text style={s.sectionLabel}>
                AUJOURD'HUI{unreadCount > 0 ? ` · ${unreadCount} NON LUE${unreadCount > 1 ? 'S' : ''}` : ''}
              </Text>
              {today.map(n => <NotifCard key={n.id} notif={n} onPress={() => markRead(n)} />)}
            </>
          )}

          {yesterday.length > 0 && (
            <>
              <Text style={s.sectionLabel}>HIER</Text>
              {yesterday.map(n => <NotifCard key={n.id} notif={n} onPress={() => markRead(n)} />)}
            </>
          )}

          {older.length > 0 && (
            <>
              <Text style={s.sectionLabel}>PLUS ANCIEN</Text>
              {older.map(n => <NotifCard key={n.id} notif={n} onPress={() => markRead(n)} />)}
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

function NotifCard({ notif, onPress }: { notif: Notif; onPress: () => void }) {
  const style = TYPE_STYLE[notif.type] ?? TYPE_STYLE['info']
  const h = (Date.now() - new Date(notif.created_at).getTime()) / 3600000
  const timeAgo = h < 1 ? "Il y a moins d'1h" : h < 24 ? `Il y a ${Math.round(h)}h` : h < 48 ? 'Hier' : `Il y a ${Math.round(h / 24)}j`

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
      {!notif.read && <View style={s.unreadDot} />}

      <View style={[s.iconBox, { backgroundColor: notif.emoji_bg }]}>
        <Text style={{ fontSize: 22 }}>{notif.emoji}</Text>
      </View>

      <View style={s.content}>
        <Text style={s.cardTitle}>{notif.title}</Text>
        <Text style={s.cardSub} numberOfLines={1}>{notif.subtitle}</Text>
        <View style={s.cardMeta}>
          <Text style={s.cardTime}>{timeAgo}</Text>
          <View style={[s.typeBadge, { backgroundColor: style.badge_bg }]}>
            <Text style={[s.typeBadgeTxt, { color: style.badge_text }]}>
              {TYPE_LABEL[notif.type] ?? notif.type}
            </Text>
          </View>
          {notif.event_id && (
            <Text style={s.chevron}>→</Text>
          )}
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
  chevron:      { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginLeft: 'auto' },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon:    { fontSize: 48, marginBottom: 16 },
  emptyTitle:   { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub:     { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center' },
})
