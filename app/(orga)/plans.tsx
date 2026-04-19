import React from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { BottomNavbarOrga } from '../../components/BottomNavbarOrga'
import { Colors } from '../../constants/theme'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    emoji: '🌱',
    price: '0€',
    period: 'mois',
    current: true,
    features: [
      '1 Évènement publié',
      'Visible sur la carte & liste',
      'Statistiques basiques (vues)',
      'Pas de mise en avant',
    ],
    cta: 'Plan Actuel',
    ctaActive: false,
    color: '#1E1B33',
    border: 'rgba(255,255,255,0.1)',
  },
  {
    id: 'boost',
    name: 'Boost',
    emoji: '🚀',
    price: '14,90€',
    period: 'mois',
    current: false,
    features: [
      "Jusqu'à 5 évènements actifs",
      'Badge "Boosté" sur la carte',
      'Statistiques avancées (clics, résa)',
      'Apparition en top des résultats',
      'Photo de couverture',
    ],
    cta: 'Passer à Boost',
    ctaActive: true,
    color: '#1A0F40',
    border: Colors.purpleLight,
  },
  {
    id: 'pro',
    name: 'Pro',
    emoji: '👑',
    price: '39€',
    period: 'mois',
    current: false,
    features: [
      'Évènements illimités',
      'Mise en avant homepage',
      'Notifications push aux utilisateurs',
      'Dashboard analytics complet',
      'Intégration billeterie externe',
      'Support prioritaire',
    ],
    cta: 'Passer à Pro',
    ctaActive: true,
    color: '#1A0F40',
    border: 'rgba(167,139,255,0.4)',
  },
]

export default function PlansScreen() {
  const handleUpgrade = (plan: string) => {
    Alert.alert(
      `Passer à ${plan}`,
      'La gestion des abonnements sera disponible prochainement.',
      [{ text: 'OK' }]
    )
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Choisir un plan</Text>
      </View>
      <View style={s.divider} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {PLANS.map(plan => (
          <View
            key={plan.id}
            style={[s.planCard, { backgroundColor: plan.color, borderColor: plan.border }]}
          >
            {/* En-tête plan */}
            <View style={s.planHeader}>
              <Text style={s.planEmoji}>{plan.emoji}</Text>
              <View style={s.planTitleBlock}>
                <Text style={s.planName}>{plan.name}</Text>
                <Text style={s.planPrice}>
                  <Text style={s.planPriceNum}>{plan.price}</Text>
                  {' '}/ {plan.period}
                </Text>
              </View>
            </View>

            {/* Features */}
            <View style={s.features}>
              {plan.features.map((f, i) => (
                <View key={i} style={s.featureRow}>
                  <Text style={s.checkmark}>✓</Text>
                  <Text style={s.featureTxt}>{f}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[s.cta, plan.ctaActive ? s.ctaActive : s.ctaInactive]}
              onPress={() => plan.ctaActive && handleUpgrade(plan.name)}
              activeOpacity={plan.ctaActive ? 0.85 : 1}
            >
              <Text style={[s.ctaTxt, !plan.ctaActive && s.ctaTxtInactive]}>
                {plan.cta}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

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
  scroll:        { paddingHorizontal: 20, gap: 16 },
  planCard:      { borderRadius: 20, borderWidth: 1.5, padding: 24 },
  planHeader:    { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  planEmoji:     { fontSize: 44 },
  planTitleBlock:{ gap: 2 },
  planName:      { fontSize: 22, fontWeight: '800', color: '#fff' },
  planPrice:     { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  planPriceNum:  { fontSize: 22, fontWeight: '800', color: Colors.purpleLight },
  features:      { gap: 10, marginBottom: 20 },
  featureRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkmark:     { color: '#22c55e', fontSize: 14, fontWeight: '700', marginTop: 1 },
  featureTxt:    { color: 'rgba(255,255,255,0.7)', fontSize: 14, flex: 1, lineHeight: 20 },
  cta:           { borderRadius: 50, paddingVertical: 14, alignItems: 'center' },
  ctaActive:     { backgroundColor: Colors.purple },
  ctaInactive:   { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  ctaTxt:        { color: '#fff', fontSize: 15, fontWeight: '700' },
  ctaTxtInactive:{ color: 'rgba(255,255,255,0.5)' },
})
