import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
  Keyboard,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../stores/useAuthStore'
import { BottomNavbarOrga } from '../../../components/BottomNavbarOrga'
import { Colors } from '../../../constants/theme'
import { ALL_CATEGORIES, CATEGORIES } from '../../../constants/categories'
import { Category } from '../../../hooks/useEvents'
import { PhotoPicker } from '../../../components/PhotoPicker'


const PARIS_LAT = 48.8566
const PARIS_LNG = 2.3522


interface AddressSuggestion {
  display_name: string
  lat: string
  lon: string
  short: string
}

async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  try {
    const q = encodeURIComponent(`${query}, Paris, France`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&addressdetails=1&countrycodes=fr`,
      { headers: { 'User-Agent': 'HypeToGo/1.0' } }
    )
    const data = await res.json()
    return (data ?? []).map((item: any) => ({
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
      short: [
        item.address?.road,
        item.address?.house_number,
        item.address?.suburb ?? item.address?.city_district,
      ].filter(Boolean).join(' ') || item.display_name.split(',').slice(0, 2).join(','),
    }))
  } catch { return [] }
}

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { profile } = useAuthStore()

  const [loadingEvent, setLoadingEvent] = useState(true)
  const [title, setTitle]               = useState('')
  const [date, setDate]                 = useState('')
  const [heure, setHeure]               = useState('')
  const [lieu, setLieu]                 = useState('')
  const [selectedLat, setSelectedLat]   = useState<number | null>(null)
  const [selectedLng, setSelectedLng]   = useState<number | null>(null)
  const [suggestions, setSuggestions]   = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions]     = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [category, setCategory]         = useState<Category | null>(null)
  const [description, setDesc]          = useState('')
  const [ticketUrl, setTicketUrl]       = useState('')
  const [price, setPrice]               = useState('0')
  const [photos, setPhotos]             = useState<string[]>([])
  const [loading, setLoading]           = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!id) return
    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title ?? '')
          setLieu(data.location_name ?? '')
          setSelectedLat(data.lat)
          setSelectedLng(data.lng)
          setCategory(data.category as Category)
          setDesc(data.description ?? '')
          setTicketUrl(data.ticket_url ?? '')
          setPrice(String(data.price ?? 0))
          setPhotos(data.photos ?? [])
          if (data.date) {
            const d    = new Date(data.date)
            const dd   = String(d.getDate()).padStart(2, '0')
            const mm   = String(d.getMonth() + 1).padStart(2, '0')
            const yyyy = d.getFullYear()
            const hh   = String(d.getHours()).padStart(2, '0')
            const min  = String(d.getMinutes()).padStart(2, '0')
            setDate(`${dd}/${mm}/${yyyy}`)
            setHeure(`${hh}:${min}`)
          }
        }
        setLoadingEvent(false)
      })
  }, [id])

  useEffect(() => {
    if (lieu.trim().length < 3 || selectedLat !== null) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true)
      const results = await searchAddresses(lieu)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
      setLoadingSuggestions(false)
    }, 400)
  }, [lieu])

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    setLieu(suggestion.short || suggestion.display_name.split(',')[0])
    setSelectedLat(parseFloat(suggestion.lat))
    setSelectedLng(parseFloat(suggestion.lon))
    setSuggestions([])
    setShowSuggestions(false)
    Keyboard.dismiss()
  }

  const handleLieuChange = (text: string) => {
    setLieu(text)
    setSelectedLat(null)
    setSelectedLng(null)
  }

  const handleUpdate = async () => {
    if (!profile || !id) return
    if (!title.trim() || !date.trim() || !heure.trim() || !lieu.trim() || !category) {
      Alert.alert('Champs manquants', 'Titre, date, heure, lieu et catégorie sont obligatoires.')
      return
    }
    setLoading(true)
    try {
      const lat   = selectedLat ?? PARIS_LAT
      const lng   = selectedLng ?? PARIS_LNG
      const parts = date.split(/[\/\-]/)
      const day   = parts[0]?.padStart(2, '0')
      const month = parts[1]?.padStart(2, '0')
      const year  = parts[2]
      const isoDate = `${year}-${month}-${day}T${heure}:00+02:00`

      const { error } = await supabase
        .from('events')
        .update({
          title:         title.trim(),
          category,
          description:   description.trim() || null,
          location_name: lieu.trim(),
          lat, lng,
          date:          isoDate,
          price:         parseFloat(price) || 0,
          ticket_url:    ticketUrl.trim() || null,
          photos,
        })
        .eq('id', id)
        .eq('organizer_id', profile.id)

      if (error) throw error
      Alert.alert('✅ Mis à jour !', 'Ton évènement a bien été modifié.', [
        { text: 'Voir mes events', onPress: () => router.push('/(orga)/events' as any) },
      ])
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de modifier')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Supprimer l\'évènement',
      'Cette action est irréversible. Es-tu sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('events').delete().eq('id', id).eq('organizer_id', profile!.id)
            router.push('/(orga)/events' as any)
          },
        },
      ]
    )
  }

  if (loadingEvent) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0d0b1a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.purpleLight} size="large" />
      </View>
    )
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Modifier l'évènement</Text>
      </View>
      <View style={s.divider} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.label}>Titre de l'évènement *</Text>
        <TextInput
          style={s.input}
          placeholder="Ex: Soirée Jazz au Sunset Club"
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={title}
          onChangeText={setTitle}
        />

        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Date *</Text>
            <TextInput
              style={s.input}
              placeholder="jj/mm/aaaa"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={date}
              onChangeText={setDate}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Heure *</Text>
            <TextInput
              style={s.input}
              placeholder="--:--"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={heure}
              onChangeText={setHeure}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        <Text style={s.label}>Lieu *</Text>
        <View style={s.lieuWrapper}>
          <View style={[s.input, s.lieuInput, selectedLat ? s.lieuConfirmed : null]}>
            <TextInput
              style={s.lieuTextInput}
              placeholder="Ex: L'Olympia, 28 Bd des Capucines"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={lieu}
              onChangeText={handleLieuChange}
              autoCorrect={false}
            />
            {loadingSuggestions && (
              <ActivityIndicator size="small" color={Colors.purpleLight} style={{ marginLeft: 8 }} />
            )}
            {selectedLat && <Text style={s.confirmedIcon}>✅</Text>}
          </View>
          {showSuggestions && suggestions.length > 0 && (
            <View style={s.suggestionsBox}>
              {suggestions.map((sug, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.suggestionItem, i < suggestions.length - 1 && s.suggestionBorder]}
                  onPress={() => handleSelectAddress(sug)}
                  activeOpacity={0.8}
                >
                  <Text style={s.suggestionIcon}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.suggestionShort} numberOfLines={1}>
                      {sug.short || sug.display_name.split(',')[0]}
                    </Text>
                    <Text style={s.suggestionFull} numberOfLines={1}>
                      {sug.display_name.split(',').slice(0, 3).join(',')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Text style={s.label}>Prix (€) — 0 pour Gratuit</Text>
        <TextInput
          style={s.input}
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />

        <Text style={s.label}>Catégorie *</Text>
        <View style={s.catGrid}>
          {ALL_CATEGORIES.map(cat => {
            const cfg = CATEGORIES[cat]
            return (
              <TouchableOpacity
                key={cat}
                style={[s.catChip, category === cat && s.catChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={s.catChipTxt}>{cfg.emoji} {cfg.chipLabel.split(' ').slice(1).join(' ')}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={s.label}>Description</Text>
        <TextInput
          style={[s.input, s.textarea]}
          placeholder="Décris l'évènement en quelques lignes..."
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={description}
          onChangeText={setDesc}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={s.label}>Lien billeterie / Site</Text>
        <TextInput
          style={s.input}
          placeholder="http://..."
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={ticketUrl}
          onChangeText={setTicketUrl}
          keyboardType="url"
          autoCapitalize="none"
        />

        <Text style={s.label}>Photos de l'évènement</Text>
        <PhotoPicker
          photos={photos}
          onChange={setPhotos}
          organizerId={profile?.id ?? ''}
          eventId={id}
        />

        <TouchableOpacity
          style={[s.updateBtn, loading && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.updateBtnTxt}>Mettre à jour →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={s.deleteBtn}
          onPress={handleDelete}
          activeOpacity={0.85}
        >
          <Text style={s.deleteBtnTxt}>🗑 Supprimer l'évènement</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomNavbarOrga />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#0d0b1a' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, position: 'relative' },
  backBtn:          { position: 'absolute', left: 20, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon:         { color: '#fff', fontSize: 18 },
  title:            { color: '#fff', fontSize: 20, fontWeight: '700' },
  divider:          { height: 1, backgroundColor: '#6C63FF', marginHorizontal: 20, marginBottom: 18, opacity: 0.4 },
  scroll:           { paddingHorizontal: 20 },
  label:            { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 8, marginTop: 4 },
  input:            { backgroundColor: '#13112a', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 14, marginBottom: 14 },
  textarea:         { height: 100, paddingTop: 14 },
  row:              { flexDirection: 'row', gap: 12 },
  lieuWrapper:      { marginBottom: 14, position: 'relative', zIndex: 10 },
  lieuInput:        { flexDirection: 'row', alignItems: 'center', marginBottom: 0, paddingVertical: 0 },
  lieuConfirmed:    { borderColor: '#22c55e' },
  lieuTextInput:    { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 14 },
  confirmedIcon:    { fontSize: 16, marginLeft: 8 },
  suggestionsBox:   { backgroundColor: '#1E1B35', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginTop: 4 },
  suggestionItem:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  suggestionBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.08)' },
  suggestionIcon:   { fontSize: 16 },
  suggestionShort:  { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  suggestionFull:   { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  catGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  catChip:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#13112a', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)' },
  catChipActive:    { backgroundColor: Colors.purple, borderColor: Colors.purple },
  catChipTxt:       { color: '#fff', fontSize: 13, fontWeight: '600' },
  updateBtn:        { backgroundColor: Colors.purple, borderRadius: 50, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  updateBtnTxt:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  deleteBtn:        { backgroundColor: '#7A1A1A', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  deleteBtnTxt:     { color: '#fff', fontSize: 14, fontWeight: '600' },
})