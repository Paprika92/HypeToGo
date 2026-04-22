import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, TextInput, ScrollView,
  ActivityIndicator, Keyboard,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { CATEGORIES } from '../../constants/categories'
import { Colors } from '../../constants/theme'
import { formatPrice, formatDistance, formatEventDate } from '../../hooks/useEvents'

interface SearchEvent {
  id: string
  title: string
  category: string
  location_name: string
  date: string
  price: number
  distance_km?: number
  lat: number
  lng: number
}

const SUGGESTIONS = ['Concerts', 'Sport', 'Stand-up', 'Exposition', 'Bars & Soirées', 'Théâtre', 'E-Sport']

export default function SearchScreen() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchEvent[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<TextInput>(null)

  // Focus automatique sur le champ de recherche
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // Recherche en temps réel avec debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
  
    const timer = setTimeout(async () => {
      setLoading(true)
  
      // Vérifie si la query correspond à une catégorie
      const catMap: Record<string, string> = {
        'concert': 'concerts', 'concerts': 'concerts',
        'sport': 'sport',
        'stand-up': 'standup', 'standup': 'standup', 'stand up': 'standup',
        'expo': 'expos', 'exposition': 'expos', 'expos': 'expos',
        'bar': 'bars', 'bars': 'bars', 'soirée': 'bars', 'soiree': 'bars',
        'bars & soirées': 'bars', 'bars & soirees': 'bars',
        'bar & soirée': 'bars', 'bar & soiree': 'bars',
        'esport': 'esport', 'e-sport': 'esport',
        'théâtre': 'theatre', 'theatre': 'theatre',
        'jazz': 'concerts',
      }
      const normalized = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const catKey = catMap[normalized]
  
      let queryBuilder = supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: true })
        .limit(20)
  
      if (catKey) {
        // Recherche par catégorie
        queryBuilder = queryBuilder.eq('category', catKey)
      } else {
        // Recherche par titre
        queryBuilder = queryBuilder.ilike('title', `%${query.trim()}%`)
      }
  
      const { data } = await queryBuilder
      setResults((data ?? []) as SearchEvent[])
      setLoading(false)
    }, 300)
  
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (event: SearchEvent) => {
    Keyboard.dismiss()
    router.push(`/event/${event.id}` as any)
  }

  const handleSuggestion = (s: string) => {
    setQuery(s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header avec champ de recherche */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={s.inputWrapper}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={s.input}
            placeholder="Rechercher un évènement..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={s.clearBtn}>
              <Text style={s.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Suggestions rapides */}
        {query.length === 0 && (
          <View style={s.suggestionsSection}>
            <Text style={s.sectionLabel}>RECHERCHES POPULAIRES</Text>
            <View style={s.suggestions}>
              {SUGGESTIONS.map(sug => (
                <TouchableOpacity
                  key={sug}
                  style={s.suggestionChip}
                  onPress={() => handleSuggestion(sug)}
                  activeOpacity={0.8}
                >
                  <Text style={s.suggestionTxt}>{sug}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={s.loader}>
            <ActivityIndicator color={Colors.purpleLight} size="small" />
          </View>
        )}

        {/* Résultats */}
        {!loading && results.length > 0 && (
          <View style={s.resultsSection}>
            <Text style={s.sectionLabel}>{results.length} RÉSULTAT{results.length > 1 ? 'S' : ''}</Text>
            {results.map(event => {
              const cat = CATEGORIES[event.category as keyof typeof CATEGORIES]
              return (
                <TouchableOpacity
                  key={event.id}
                  style={s.resultCard}
                  onPress={() => handleSelect(event)}
                  activeOpacity={0.8}
                >
                  <View style={[s.resultIcon, { backgroundColor: cat?.colors[0] ?? '#1E1B33' }]}>
                    <Text style={{ fontSize: 22 }}>{cat?.emoji ?? '📍'}</Text>
                  </View>
                  <View style={s.resultInfo}>
                    <Text style={s.resultTitle} numberOfLines={1}>{event.title}</Text>
                    <Text style={s.resultMeta} numberOfLines={1}>
                      {event.location_name} · {formatEventDate(event.date)}
                    </Text>
                    <View style={s.resultBottom}>
                      <View style={[s.catTag, { backgroundColor: (cat?.colors[0] ?? '#1E1B33') + '44' }]}>
                        <Text style={s.catTagTxt}>{cat?.label ?? event.category}</Text>
                      </View>
                      <Text style={s.resultPrice}>{formatPrice(event.price)}</Text>
                    </View>
                  </View>
                  <Text style={s.arrow}>›</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Aucun résultat */}
        {!loading && query.length >= 2 && results.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={s.emptyTitle}>Aucun résultat pour "{query}"</Text>
            <Text style={s.emptySub}>Essaie un autre mot-clé</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#0d0b1a' },
  header:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 10 },
  backBtn:           { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon:          { color: '#fff', fontSize: 18 },
  inputWrapper:      { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#13112a', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, height: 46, gap: 8 },
  searchIcon:        { fontSize: 16 },
  input:             { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 0 },
  clearBtn:          { padding: 4 },
  clearIcon:         { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  suggestionsSection:{ paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel:      { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.3)', marginBottom: 12 },
  suggestions:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip:    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#13112a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  suggestionTxt:     { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  loader:            { paddingTop: 30, alignItems: 'center' },
  resultsSection:    { paddingHorizontal: 20, paddingTop: 16 },
  resultCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13112a', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 10, padding: 12, gap: 12 },
  resultIcon:        { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resultInfo:        { flex: 1 },
  resultTitle:       { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  resultMeta:        { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 6 },
  resultBottom:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catTag:            { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catTagTxt:         { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700' },
  resultPrice:       { fontSize: 13, fontWeight: '700', color: Colors.purpleLight },
  arrow:             { color: 'rgba(255,255,255,0.25)', fontSize: 22 },
  empty:             { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon:         { fontSize: 40 },
  emptyTitle:        { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptySub:          { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
})