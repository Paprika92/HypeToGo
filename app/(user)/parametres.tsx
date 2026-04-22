import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { BottomNavbar } from '../../components/BottomNavbar'
import { Colors } from '../../constants/theme'

export default function ParametresUserScreen() {
  const { profile, setProfile } = useAuthStore()

  const [name, setName]           = useState(profile?.name ?? '')
  const [phone, setPhone]         = useState('')
  const [city, setCity]           = useState('Paris, 20ème')
  const [notifNear, setNotifNear] = useState(true)
  const [notifResa, setNotifResa] = useState(true)
  const [saving, setSaving]       = useState(false)
  const [newPwd, setNewPwd]       = useState('')
  const [savingPwd, setSavingPwd] = useState(false)

  const handleSaveInfos = async () => {
    if (!profile) return
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide.')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim() })
      .eq('id', profile.id)
    if (error) {
      Alert.alert('Erreur', error.message)
    } else {
      setProfile({ ...profile, name: name.trim() })
      Alert.alert('✅ Sauvegardé', 'Tes informations ont été mises à jour.')
    }
    setSaving(false)
  }

  const handleChangePwd = async () => {
    if (!newPwd || newPwd.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères.')
      return
    }
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    if (error) {
      Alert.alert('Erreur', error.message)
    } else {
      Alert.alert('✅ Mot de passe modifié', 'Ton mot de passe a bien été changé.')
      setNewPwd('')
    }
    setSavingPwd(false)
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irréversible. Toutes tes données seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut()
            router.replace('/(auth)/login' as any)
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Paramètres</Text>
      </View>
      <View style={s.divider} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Informations ── */}
        <Text style={s.sectionLbl}>INFORMATIONS</Text>
        <View style={s.card}>
          <View style={s.fieldRow}>
            <View style={[s.fieldIcon, { backgroundColor: 'rgba(108,99,255,0.12)' }]}>
              <Text style={s.fieldEmoji}>👤</Text>
            </View>
            <View style={s.fieldContent}>
              <Text style={s.fieldLabel}>Nom complet</Text>
              <TextInput
                style={s.fieldInput}
                value={name}
                onChangeText={setName}
                placeholder="Ton nom"
                placeholderTextColor="rgba(255,255,255,0.2)"
              />
            </View>
            <Text style={s.checkmark}>✓</Text>
          </View>

          <View style={s.separator} />

          <View style={s.fieldRow}>
            <View style={[s.fieldIcon, { backgroundColor: 'rgba(108,99,255,0.12)' }]}>
              <Text style={s.fieldEmoji}>✉️</Text>
            </View>
            <View style={s.fieldContent}>
              <Text style={s.fieldLabel}>Email</Text>
              <Text style={s.fieldValue}>{profile?.email ?? '—'}</Text>
            </View>
            <Text style={s.checkmark}>✓</Text>
          </View>

          <View style={s.separator} />

          <View style={s.fieldRow}>
            <View style={[s.fieldIcon, { backgroundColor: 'rgba(108,99,255,0.12)' }]}>
              <Text style={s.fieldEmoji}>📞</Text>
            </View>
            <View style={s.fieldContent}>
              <Text style={s.fieldLabel}>Téléphone</Text>
              <TextInput
                style={s.fieldInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+33 6 00 00 00 00"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="phone-pad"
              />
            </View>
            <Text style={s.checkmark}>✓</Text>
          </View>

          <View style={s.separator} />

          <View style={s.fieldRow}>
            <View style={[s.fieldIcon, { backgroundColor: 'rgba(108,99,255,0.12)' }]}>
              <Text style={s.fieldEmoji}>📍</Text>
            </View>
            <View style={s.fieldContent}>
              <Text style={s.fieldLabel}>Localisation</Text>
              <TextInput
                style={s.fieldInput}
                value={city}
                onChangeText={setCity}
                placeholder="Paris, 20ème"
                placeholderTextColor="rgba(255,255,255,0.2)"
              />
            </View>
            <Text style={s.checkmark}>✓</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSaveInfos}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.saveBtnTxt}>Sauvegarder les informations</Text>
          }
        </TouchableOpacity>

        {/* ── Notifications ── */}
        <Text style={s.sectionLbl}>NOTIFICATIONS</Text>
        <View style={s.card}>
          <View style={s.switchRow}>
            <View style={[s.fieldIcon, { backgroundColor: 'rgba(108,99,255,0.12)' }]}>
              <Text style={s.fieldEmoji}>🔔</Text>
            </View>
            <Text style={s.switchLabel}>Notifications</Text>
            <Switch
              value={notifNear}
              onValueChange={setNotifNear}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.purple }}
              thumbColor="#fff"
            />
          </View>

          <View style={s.separator} />

          <View style={s.switchRow}>
            <View style={[s.fieldIcon, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
              <Text style={s.fieldEmoji}>🎟️</Text>
            </View>
            <Text style={s.switchLabel}>Rappels réservations</Text>
            <Switch
              value={notifResa}
              onValueChange={setNotifResa}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.purple }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ── Sécurité ── */}
        <Text style={s.sectionLbl}>SÉCURITÉ</Text>
        <View style={s.card}>
          <View style={s.fieldRow}>
            <View style={[s.fieldIcon, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
              <Text style={s.fieldEmoji}>🔒</Text>
            </View>
            <View style={s.fieldContent}>
              <Text style={s.fieldLabel}>Nouveau mot de passe</Text>
              <TextInput
                style={s.fieldInput}
                value={newPwd}
                onChangeText={setNewPwd}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.2)"
                secureTextEntry
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[s.saveBtn, savingPwd && { opacity: 0.7 }]}
          onPress={handleChangePwd}
          disabled={savingPwd}
          activeOpacity={0.85}
        >
          {savingPwd
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.saveBtnTxt}>Modifier le mot de passe</Text>
          }
        </TouchableOpacity>

        <View style={s.card}>
          <TouchableOpacity style={s.deleteRow} onPress={handleDeleteAccount} activeOpacity={0.8}>
            <View style={[s.fieldIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Text style={s.fieldEmoji}>🗑️</Text>
            </View>
            <Text style={s.deleteTxt}>Supprimer mon compte</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavbar active="profil" />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#0d0b1a' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, position: 'relative' },
  backBtn:      { position: 'absolute', left: 20, width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon:     { color: '#fff', fontSize: 18 },
  title:        { color: '#fff', fontSize: 20, fontWeight: '700' },
  divider:      { height: 1, backgroundColor: '#6C63FF', marginHorizontal: 20, marginBottom: 18, opacity: 0.4 },
  scroll:       { paddingHorizontal: 20 },
  sectionLbl:   { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },
  card:         { backgroundColor: '#13112a', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 10 },
  fieldRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  fieldIcon:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  fieldEmoji:   { fontSize: 17 },
  fieldContent: { flex: 1 },
  fieldLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 3 },
  fieldInput:   { fontSize: 14, fontWeight: '600', color: '#fff', padding: 0 },
  fieldValue:   { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  checkmark:    { color: '#22c55e', fontSize: 16 },
  separator:    { height: 0.5, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 },
  switchRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  switchLabel:  { flex: 1, fontSize: 14, fontWeight: '600', color: '#fff' },
  saveBtn:      { backgroundColor: Colors.purple, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  saveBtnTxt:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  deleteRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  deleteTxt:    { flex: 1, fontSize: 14, fontWeight: '600', color: '#ef4444' },
  chevron:      { fontSize: 20, color: 'rgba(255,255,255,0.25)' },
})