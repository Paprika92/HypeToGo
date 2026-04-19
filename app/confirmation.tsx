import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { supabase } from '../lib/supabase'
import { Colors } from '../constants/theme'

interface ReservationData {
  ref: string
  quantity: number
  total_price: number
  events: { title: string }
}

export default function ConfirmationScreen() {
  const { ref } = useLocalSearchParams<{ ref: string }>()
  const [data, setData] = useState<ReservationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ref) return
    supabase
      .from('reservations')
      .select('ref, quantity, total_price, events(title)')
      .eq('ref', ref)
      .single()
      .then(({ data: d }) => {
        setData(d as any)
        setLoading(false)
      })
  }, [ref])

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.purpleLight} size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Check icon */}
        <View style={styles.checkIcon}>
          <Text style={{ fontSize: 36, color: '#fff' }}>✓</Text>
        </View>

        <Text style={styles.title}>Réservation confirmée</Text>

        <Text style={styles.subtitle}>
          {data?.quantity ?? 1} place(s) pour{' '}
          <Text style={{ fontWeight: '700' }}>
            {(data?.events as any)?.title ?? 'votre évènement'}
          </Text>
          {'\n'}Total :{' '}
          <Text style={{ color: Colors.green, fontWeight: '700' }}>
            {data?.total_price === 0 ? 'Gratuit' : `${data?.total_price}€`}
          </Text>
        </Text>

        {/* Référence */}
        <View style={styles.refBox}>
          <Text style={styles.refTxt}>{data?.ref ?? ref}</Text>
        </View>

        <Text style={styles.email}>
          Un email de confirmation vous a été envoyé avec votre billet éléctronique
        </Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.replace('/(user)/')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnTxt}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(10,9,18,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  checkIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text3,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  refBox: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  refTxt: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 1,
  },
  email: {
    fontSize: 13,
    color: Colors.text3,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: Colors.purple,
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  btnTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
