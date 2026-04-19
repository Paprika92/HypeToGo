import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { BottomNavbarOrga } from '../../components/BottomNavbarOrga'
import { Colors } from '../../constants/theme'
import { ALL_CATEGORIES, CATEGORIES } from '../../constants/categories'
import { Category } from '../../hooks/useEvents'

// Coordonnées Paris centre par défaut (fallback)
const PARIS_LAT = 48.8566
const PARIS_LNG = 2.3522

// Géocode une adresse via Nominatim (OpenStreetMap, gratuit, sans clé API)
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, Paris, France`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'User-Agent': 'HypeToGo/1.0' } }
    )
    const data = await res.json()
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      }
    }
    return null
  } catch {
    return null
  }
}

export default function PublierScreen() {
  const { profile } = useAuthStore()

  const [title, setTitle]         = useState('')
  const [date, setDate]           = useState('')
  const [heure, setHeure]         = useState('')
  const [lieu, setLieu]           = useState('')
  const [category, setCategory]   = useState<Category | null>(null)
  const [description, setDesc]    = useState('')
  const [ticketUrl, setTicketUrl] = useState('')
  const [price, setPrice]         = useState('0')
  const [loading, setLoading]     = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  const handlePublish = async () => {
    if (!profile) return
    if (!title.trim() || !date.trim() || !heure.trim() || !lieu.trim() || !category) {
      Alert.alert('Champs manquants', 'Titre, date, heure, lieu et catégorie sont obligatoires.')
      return
    }

    setLoading(true)
    try {
      // 1. Géocodage de l'adresse
      setGeocoding(true)
      const coords = await geocodeAddress(lieu.trim())
      setGeocoding(false)

      const lat = coords?.lat ?? PARIS_LAT
      const lng = coords?.lng ?? PARIS_LNG

      if (!coords) {
        // Adresse non trouvée → on prévient mais on publie quand même au centre Paris
        console.warn('Adresse non trouvée, fallback Paris centre')
      }

      // Construire la date ISO — supporte jj/mm/aaaa et jj-mm-aaaa
      const parts = date.split(/[\/\-]/)
      const day = parts[0]?.padStart(2, '0')
      const month = parts[1]?.padStart(2, '0')
      const year = parts[2]
      const isoDate = `${year}-${month}-${day}T${heure}:00+02:00`

      // 3. Insérer dans Supabase
      const { error } = await supabase.from('events').insert({
        organizer_id:  profile.id,
        title:         title.trim(),
        category,
        description:   description.trim() || null,
        location_name: lieu.trim(),
        lat,
        lng,
        date:          isoDate,
        price:         parseFloat(price) || 0,
        ticket_url:    ticketUrl.trim() || null,
        status:        'published',
      })

      if (error) throw error

      Alert.alert(
        '✅ Publié !',
        coords
          ? `Ton évènement est visible sur la carte à ${lieu.trim()}.`
          : `Publié ! Adresse introuvable, positionné au centre de Paris.`,
        [{ text: 'Voir mes events', onPress: () => router.push('/(orga)/events' as any) }]
      )
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de publier')
    } finally {
      setLoading(false)
      setGeocoding(false)
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Publier un évènement</Text>
      </View>
      <View style={s.divider} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Titre */}
        <Text style={s.label}>Titre de l'évènement *</Text>
        <TextInput
          style={s.input}
          placeholder="Ex: Soirée Jazz au Sunset Club"
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={title}
          onChangeText={setTitle}
        />

        {/* Date + Heure */}
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

        {/* Lieu */}
        <Text style={s.label}>Lieu *</Text>
        <TextInput
          style={s.input}
          placeholder="Ex: L'Olympia, 28 Bd des Capucines"
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={lieu}
          onChangeText={setLieu}
        />

        {/* Prix */}
        <Text style={s.label}>Prix (€) — 0 pour Gratuit</Text>
        <TextInput
          style={s.input}
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />

        {/* Catégorie */}
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

        {/* Description */}
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

        {/* Lien billeterie */}
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

        {/* Photos placeholder */}
        <Text style={s.label}>Photos de l'évènement</Text>
        <TouchableOpacity style={s.photoBox} activeOpacity={0.8}>
          <Text style={s.photoIcon}>📷</Text>
          <Text style={s.photoTxt}>Clique pour ajouter des photos</Text>
          <Text style={s.photoSub}>JPG, PNG · Max 3 photos · 10 Mo chacune</Text>
        </TouchableOpacity>

        {/* Bouton publier */}
        <TouchableOpacity
          style={[s.publishBtn, loading && { opacity: 0.7 }]}
          onPress={handlePublish}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <ActivityIndicator color="#fff" />
                <Text style={s.publishBtnTxt}>
                  {geocoding ? 'Géolocalisation...' : 'Publication...'}
                </Text>
              </View>
            : <Text style={s.publishBtnTxt}>Publier l'évènement →</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>

      <BottomNavbarOrga />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#0d0b1a' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, position: 'relative' },
  backBtn:       { position: 'absolute', left: 20, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon:      { color: '#fff', fontSize: 18 },
  title:         { color: '#fff', fontSize: 20, fontWeight: '700' },
  divider:       { height: 1, backgroundColor: '#6C63FF', marginHorizontal: 20, marginBottom: 18, opacity: 0.4 },
  scroll:        { paddingHorizontal: 20 },
  label:         { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 8, marginTop: 4 },
  input:         { backgroundColor: '#13112a', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 14, marginBottom: 14 },
  textarea:      { height: 100, paddingTop: 14 },
  row:           { flexDirection: 'row', gap: 12 },
  catGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  catChip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#13112a', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)' },
  catChipActive: { backgroundColor: Colors.purple, borderColor: Colors.purple },
  catChipTxt:    { color: '#fff', fontSize: 13, fontWeight: '600' },
  photoBox:      { backgroundColor: '#13112a', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', alignItems: 'center', paddingVertical: 32, marginBottom: 20, gap: 8 },
  photoIcon:     { fontSize: 32 },
  photoTxt:      { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  photoSub:      { color: 'rgba(255,255,255,0.25)', fontSize: 11 },
  publishBtn:    { backgroundColor: Colors.purple, borderRadius: 50, paddingVertical: 18, alignItems: 'center', marginBottom: 8 },
  publishBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
})

