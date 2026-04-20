import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { BottomNavbarOrga } from '../../components/BottomNavbarOrga'
import { Colors } from '../../constants/theme'
import { CATEGORIES } from '../../constants/categories'
import { formatEventDate } from '../../hooks/useEvents'

interface OrgaEvent {
  id: string
  title: string
  category: string
  date: string
  location_name: string
  status: 'published' | 'draft'
  views?: number
  reservations_count?: number
}

export default function MesEventsScreen() {
  const { profile } = useAuthStore()
  const [events, setEvents] = useState<OrgaEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase
    .from('events')
    .select('*, reservations(count)')
    .eq('organizer_id', profile.id)
    .order('created_at', { ascending: false })
      .then(({ data }) => {
        const mapped = (data ?? []).map((e: any) => ({
          ...e,
          reservations_count: e.reservations?.[0]?.count ?? 0,
        }))
        setEvents(mapped as OrgaEvent[])
        setLoading(false)
      })
  }, [profile?.id])

  const published = events.filter(e => e.status === 'published')
  const drafts    = events.filter(e => e.status === 'draft')
  const totalVues = events.reduce((acc, e) => acc + (e.views ?? 0), 0)
  const totalResa = events.reduce((acc, e) => acc + (e.reservations_count ?? 0), 0)

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Mes évènements</Text>
      </View>
      <View style={s.divider} />

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator color={Colors.purpleLight} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Stats globales */}
          <View style={s.statsRow}>
            <StatCard value={published.length} label="En cours"    color="#22c55e" />
            <StatCard value={drafts.length}    label="Brouillon"   color="#ef4444" />
            <StatCard value={totalVues}        label="Vues"        color={Colors.purpleLight} />
            <StatCard value={totalResa}        label="Réservations" color="#f59e0b" />
          </View>

          <View style={s.listHeader}>
            <Text style={s.listLabel}>MES EVENTS · {events.length} TOTAL</Text>
          </View>

          {events.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📭</Text>
              <Text style={s.emptyTitle}>Aucun évènement publié</Text>
              <TouchableOpacity
                style={s.createBtn}
                onPress={() => router.push('/(orga)/publier' as any)}
              >
                <Text style={s.createBtnTxt}>+ Publier mon premier event</Text>
              </TouchableOpacity>
            </View>
          )}

          {events.map(e => {
            const cat = CATEGORIES[e.category as keyof typeof CATEGORIES]
            const isDraft = e.status === 'draft'
            const convRate = e.views && e.views > 0
              ? Math.round(((e.reservations_count ?? 0) / e.views) * 100)
              : 0

            return (
              <TouchableOpacity
                key={e.id}
                style={[s.eventCard, isDraft && s.eventCardDraft]}
                activeOpacity={0.8}
              >
                {/* Barre latérale colorée */}
                <View style={[s.colorBar, { backgroundColor: isDraft ? '#f59e0b' : '#22c55e' }]} />

                {/* Icône */}
                <View style={[s.eventIcon, { backgroundColor: cat?.colors[0] ?? '#1E1B33' }]}>
                  <Text style={{ fontSize: 22 }}>{cat?.emoji ?? '📍'}</Text>
                </View>

                {/* Infos */}
                <View style={s.eventInfo}>
                  <View style={s.eventTitleRow}>
                    <Text style={s.eventName} numberOfLines={1}>{e.title}</Text>
                    <View style={[s.statusBadge, isDraft ? s.badgeDraft : s.badgeLive]}>
                      <Text style={[s.statusTxt, isDraft ? s.statusTxtDraft : s.statusTxtLive]}>
                        {isDraft ? 'Brouillon' : '● Live'}
                      </Text>
                    </View>
                  </View>

                  {isDraft ? (
                    <>
                      <Text style={s.eventMeta}>Pas encore publié</Text>
                      <TouchableOpacity onPress={() => router.push('/(orga)/publier' as any)}>
                        <Text style={s.finaliserTxt}>Finaliser et publier →</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={s.eventMeta}>
                        {formatEventDate(e.date)} · {e.location_name}
                      </Text>
                      <Text style={s.eventStats}>
                        👁 {e.views ?? 0} vues · 🎫 {e.reservations_count ?? 0} réservations
                      </Text>
                      <Text style={s.convRate}>Taux de conversion · {convRate}%</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            )
          })}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <BottomNavbarOrga />
    </SafeAreaView>
  )
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statNum, { color }]}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#0d0b1a' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, position: 'relative' },
  backBtn:        { position: 'absolute', left: 20, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon:       { color: '#fff', fontSize: 18 },
  title:          { color: '#fff', fontSize: 20, fontWeight: '700' },
  divider:        { height: 1, backgroundColor: '#6C63FF', marginHorizontal: 20, marginBottom: 18, opacity: 0.4 },
  loader:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:         { paddingHorizontal: 20 },
  statsRow:       { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard:       { flex: 1, backgroundColor: '#13112a', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', paddingVertical: 14, alignItems: 'center' },
  statNum:        { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statLbl:        { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '500', textAlign: 'center' },
  listHeader:     { marginBottom: 12 },
  listLabel:      { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: 'rgba(255,255,255,0.3)' },
  empty:          { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyIcon:      { fontSize: 48 },
  emptyTitle:     { color: 'rgba(255,255,255,0.5)', fontSize: 15 },
  createBtn:      { backgroundColor: Colors.purple, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  createBtnTxt:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  eventCard:      { flexDirection: 'row', backgroundColor: '#13112a', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 10, overflow: 'hidden', alignItems: 'center' },
  eventCardDraft: { borderColor: 'rgba(245,158,11,0.3)' },
  colorBar:       { width: 4, alignSelf: 'stretch' },
  eventIcon:      { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', margin: 12, borderRadius: 14 },
  eventInfo:      { flex: 1, paddingVertical: 12, paddingRight: 12 },
  eventTitleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  eventName:      { fontSize: 14, fontWeight: '700', color: '#fff', flex: 1, marginRight: 8 },
  statusBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeLive:      { backgroundColor: 'rgba(34,197,94,0.2)' },
  badgeDraft:     { backgroundColor: 'rgba(245,158,11,0.2)' },
  statusTxt:      { fontSize: 10, fontWeight: '700' },
  statusTxtLive:  { color: '#22c55e' },
  statusTxtDraft: { color: '#f59e0b' },
  eventMeta:      { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  eventStats:     { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 },
  convRate:       { fontSize: 11, color: Colors.purpleLight },
  finaliserTxt:   { fontSize: 12, color: '#f59e0b', fontWeight: '600', marginTop: 4 },
})
