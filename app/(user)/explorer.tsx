import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native'
import { router } from 'expo-router'
import { BottomNavbar } from '../../components/BottomNavbar'
import { Colors } from '../../constants/theme'

const CATEGORIES = [
  { label: 'Concerts',    icon: '🎵', color: '#7B52D3', cat: 'Concerts' },
  { label: 'Stand-Up',    icon: '🎤', color: '#C0284A', cat: 'Stand-Up' },
  { label: 'Sport',       icon: '⚽', color: '#1D4ED8', cat: 'Sport' },
  { label: 'Expositions', icon: '🎨', color: '#166534', cat: 'Expositions' },
  { label: 'Bars & Soirées', icon: '🍺', color: '#B45309', cat: 'Bars' },
  { label: 'E-Sport',     icon: '🎮', color: '#0369A1', cat: 'E-Sport' },
  { label: 'Théâtre',     icon: '🎭', color: '#7C2020', cat: 'Théâtre' },
  { label: 'Tout',        icon: '✦',  color: '#1E1B33', cat: 'Tout' },
]

const PRIX = ['Tous', 'Gratuit', 'Payant']
const QUAND = ['Aujd', 'Demain', 'Week-end', 'Cette semaine']

const ALL_EVENTS = [
  { id: '1', cat: 'Concerts',    icon: '🎵', bg: '#2D1F5E', name: 'Open Mic Belleville',        meta: '📍 1.2km · Ce soir 21h',       price: 'Gratuit', quand: 'Aujd' },
  { id: '2', cat: 'Concerts',    icon: '🎵', bg: '#2D1F5E', name: 'Jazz au Parc Floral',         meta: '📍 3.1km · Ce soir 19h30',     price: 'Gratuit', quand: 'Aujd' },
  { id: '3', cat: 'Stand-Up',    icon: '🎤', bg: '#4A1020', name: 'Stand-Up Nation',             meta: '📍 0.8km · Ce soir 20h',       price: 'Gratuit', quand: 'Aujd' },
  { id: '4', cat: 'Stand-Up',    icon: '🎤', bg: '#4A1020', name: 'Open Mic Comedy Club',        meta: '📍 2.3km · Demain 21h',        price: 'Gratuit', quand: 'Demain' },
  { id: '5', cat: 'Sport',       icon: '⚽', bg: '#0C2A6E', name: 'Run collectif Père-Lachaise', meta: '📍 0.3km · Demain 8h',         price: 'Gratuit', quand: 'Demain' },
  { id: '6', cat: 'Sport',       icon: '⚽', bg: '#0C2A6E', name: 'Basket 3x3 République',       meta: '📍 1.5km · Ce soir 18h',       price: 'Gratuit', quand: 'Aujd' },
  { id: '7', cat: 'Expositions', icon: '🎨', bg: '#0A3020', name: 'Vernissage Oberkampf',        meta: '📍 0.5km · Ce soir 19h30',     price: 'Gratuit', quand: 'Aujd' },
  { id: '8', cat: 'Bars',        icon: '🍺', bg: '#3D2000', name: 'Pop-up Bar Rooftop',          meta: '📍 0.8km · Ce soir 18h',       price: 'Gratuit', quand: 'Aujd' },
  { id: '9', cat: 'Bars',        icon: '🍺', bg: '#3D2000', name: 'Soirée vinyle Ménilmontant',  meta: '📍 0.4km · Ce soir 22h',       price: 'Gratuit', quand: 'Aujd' },
  { id:'10', cat: 'E-Sport',     icon: '🎮', bg: '#062A40', name: 'Tournoi FIFA Oberkampf',      meta: '📍 0.7km · Ce soir 20h',       price: 'Gratuit', quand: 'Aujd' },
  { id:'11', cat: 'Théâtre',     icon: '🎭', bg: '#2E0A0A', name: 'Impro théâtrale libre',       meta: '📍 1.1km · Ce soir 20h30',     price: 'Gratuit', quand: 'Aujd' },
  { id:'12', cat: 'Théâtre',     icon: '🎭', bg: '#2E0A0A', name: 'Lecture de pièce Bastille',   meta: '📍 2.8km · Demain 19h',        price: 'Gratuit', quand: 'Demain' },
]

export default function ExplorerScreen() {
  const [selCat, setSelCat]   = useState('Tout')
  const [selPrix, setSelPrix] = useState('Tous')
  const [selQuand, setSelQuand] = useState('Aujd')

  const filtered = ALL_EVENTS.filter(e => {
    if (selCat !== 'Tout' && e.cat !== selCat) return false
    if (selPrix === 'Gratuit' && e.price !== 'Gratuit') return false
    if (selPrix === 'Payant' && e.price === 'Gratuit') return false
    if (selQuand !== 'Aujd' && e.quand !== selQuand) return false
    return true
  })

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Explorer</Text>
      </View>
      <View style={s.divider} />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLbl}>Catégorie</Text>
        <View style={s.catGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.cat}
              style={[s.catBtn, { backgroundColor: c.color },
                selCat === c.cat && s.catSelected,
                selCat !== 'Tout' && selCat !== c.cat && s.catDim,
              ]}
              onPress={() => setSelCat(c.cat)}
              activeOpacity={0.8}
            >
              <Text style={s.catIcon}>{c.icon}</Text>
              <Text style={s.catLabel}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLbl}>Prix</Text>
        <View style={s.pillRow}>
          {PRIX.map(p => (
            <TouchableOpacity
              key={p}
              style={[s.pill, selPrix === p && s.pillActive]}
              onPress={() => setSelPrix(p)}
            >
              {p === 'Gratuit' && <Text style={s.greenDot}>●</Text>}
              <Text style={[s.pillTxt, selPrix === p && s.pillTxtActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLbl}>Quand</Text>
        <View style={s.pillRow}>
          {QUAND.map(q => (
            <TouchableOpacity
              key={q}
              style={[s.pill, selQuand === q && s.pillActive]}
              onPress={() => setSelQuand(q)}
            >
              <Text style={[s.pillTxt, selQuand === q && s.pillTxtActive]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.resultsLbl}>
          <Text style={s.resultsCount}>{filtered.length}</Text> événements trouvés
        </Text>

        {filtered.length === 0 && (
          <Text style={s.empty}>Aucun événement pour ces filtres</Text>
        )}

        {filtered.map(e => (
          <TouchableOpacity
            key={e.id}
            style={s.eventCard}
            onPress={() => router.push(`/event/${e.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={[s.eventIcon, { backgroundColor: e.bg }]}>
              <Text style={{ fontSize: 22 }}>{e.icon}</Text>
            </View>
            <View style={s.eventInfo}>
              <Text style={s.eventName}>{e.name}</Text>
              <Text style={s.eventMeta}>{e.meta}</Text>
            </View>
            <View style={s.freeTag}>
              <Text style={s.freeTagTxt}>{e.price}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      <BottomNavbar active="explorer" />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#0d0b1a' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, position: 'relative' },
  backBtn:     { position: 'absolute', left: 20, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon:    { color: '#fff', fontSize: 18 },
  title:       { color: '#fff', fontSize: 20, fontWeight: '700' },
  divider:     { height: 1, backgroundColor: '#6C63FF', marginHorizontal: 20, marginBottom: 18, opacity: 0.4 },
  scroll:      { flex: 1, paddingHorizontal: 20 },
  sectionLbl:  { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 10 },
  catGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  catBtn:      { width: '47%', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  catSelected: { borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.7)' },
  catDim:      { opacity: 0.35 },
  catIcon:     { fontSize: 20 },
  catLabel:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  pillRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  pill:        { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.06)', flexDirection: 'row', alignItems: 'center', gap: 5 },
  pillActive:  { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  pillTxt:     { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
  pillTxtActive: { color: '#fff' },
  greenDot:    { color: '#22c55e', fontSize: 8 },
  resultsLbl:  { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '500', marginBottom: 12 },
  resultsCount: { color: '#6C63FF', fontWeight: '700' },
  empty:       { textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, paddingVertical: 32 },
  eventCard:   { backgroundColor: '#13112a', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 18, padding: 13, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  eventIcon:   { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  eventInfo:   { flex: 1 },
  eventName:   { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  eventMeta:   { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
  freeTag:     { backgroundColor: 'rgba(34,197,94,0.15)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  freeTagTxt:  { color: '#22c55e', fontSize: 10, fontWeight: '700' },
})