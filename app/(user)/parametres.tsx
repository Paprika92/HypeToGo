import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { Colors } from '../../constants/theme'

export default function ParametresUserScreen() {
  const { profile, setProfile } = useAuthStore()

  const [name, setName]           = useState(profile?.name ?? '')
  const [phone, setPhone]         = useState((profile as any)?.phone ?? '')
  const [notifNear, setNotifNear] = useState(true)
  const [notifResa, setNotifResa] = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [oldPwd, setOldPwd]       = useState('')
  const [newPwd, setNewPwd]       = useState('')
  const [savingPwd, setSavingPwd] = useState(false)
  const [savedPwd, setSavedPwd]   = useState(false)

  const handleSaveInfos = async () => {
    if (!profile) return
    if (!name.trim()) {
      Alert.alert('Champ manquant', '✏️ Le nom ne peut pas être vide.')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), phone: phone.trim() })
      .eq('id', profile.id)
    setSaving(false)
    if (error) {
      Alert.alert('Erreur', error.message)
      return
    }
    setProfile({ ...profile, name: name.trim(), phone: phone.trim() } as any)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleChangePwd = async () => {
    if (!oldPwd || oldPwd.length < 6) {
      Alert.alert('Erreur', '🔒 Saisis ton ancien mot de passe.')
      return
    }
    if (!newPwd || newPwd.length < 6) {
      Alert.alert('Erreur', '🔒 Le nouveau mot de passe doit faire au moins 6 caractères.')
      return
    }
    if (oldPwd === newPwd) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit être différent de l\'ancien.')
      return
    }
    setSavingPwd(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile?.email ?? '',
      password: oldPwd,
    })
    if (signInError) {
      setSavingPwd(false)
      Alert.alert('Erreur', '🔒 Ancien mot de passe incorrect.')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSavingPwd(false)
    if (error) {
      Alert.alert('Erreur', error.message)
      return
    }
    setOldPwd('')
    setNewPwd('')
    setSavedPwd(true)
    setTimeout(() => setSavedPwd(false), 2500)
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
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
          </View>

          <View style={s.separator} />

          <View style={s.fieldRow}>
            <View style={[s.fieldIcon, { backgroundColor: 'rgba(108,99,255,0.12)' }]}>
              <Text style={s.fieldEmoji}>✉️</Text>
            </View>
            <View style={s.fieldContent}>
              <Text style={s.fieldLabel}>Email — non modifiable</Text>
              <Text style={s.fieldValueLocked}>{profile?.email ?? '—'}</Text>
            </View>
            <Text style={s.lockIcon}>🔒</Text>
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
          </View>

          <View style={s.separator} />

          <View style={s.fieldRow}>
            <View style={[s.fieldIcon, { backgroundColor: 'rgba(108,99,255,0.12)' }]}>
              <Text style={s.fieldEmoji}>📍</Text>
            </View>
            <View style={s.fieldContent}>
              <Text style={s.fieldLabel}>Localisation — détectée automatiquement</Text>
              <Text style={s.fieldValueLocked}>Basée sur ton GPS 🗺️</Text>
            </View>
            <Text style={s.lockIcon}>🔒</Text>
          </View>

        </View>

        <TouchableOpacity
          style={[s.saveBtn, (saving || saved) && { opacity: saved ? 1 : 0.7 }, saved && { backgroundColor: '#22c55e' }]}
          onPress={handleSaveInfos}
          disabled={saving || saved}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.saveBtnTxt}>{saved ? '✅ Informations sauvegardées !' : 'Sauvegarder les informations'}</Text>
          }
        </TouchableOpacity>

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

        <Text style={s.sectionLbl}>SÉCURITÉ</Text>
        <View style={s.card}>
          <View style={s.fieldRow}>
            <View style={[s.fieldIcon, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
              <Text style={s.fieldEmoji}>🔓</Text>
            </View>
            <View style={s.fieldContent}>
              <Text style={s.fieldLabel}>Ancien mot de passe</Text>
              <TextInput
                style={s.fieldInput}
                value={oldPwd}
                onChangeText={setOldPwd}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.2)"
                secureTextEntry
              />
            </View>
          </View>
          <View style={s.separator} />
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
          style={[s.saveBtn, (savingPwd || savedPwd) && { opacity: savedPwd ? 1 : 0.7 }, savedPwd && { backgroundColor: '#22c55e' }]}
          onPress={handleChangePwd}
          disabled={savingPwd || savedPwd}
          activeOpacity={0.85}
        >
          {savingPwd
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.saveBtnTxt}>{savedPwd ? '✅ Mot de passe modifié !' : 'Modifier le mot de passe'}</Text>
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

        <View style={{ height: 60 }} />
      </ScrollView>
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
  sectionLbl:       { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },
  card:             { backgroundColor: '#13112a', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 10 },
  fieldRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  fieldIcon:        { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  fieldEmoji:       { fontSize: 17 },
  fieldContent:     { flex: 1 },
  fieldLabel:       { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 3 },
  fieldInput:       { fontSize: 14, fontWeight: '600', color: '#fff', padding: 0 },
  fieldValueLocked: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.3)' },
  lockIcon:         { fontSize: 14, color: 'rgba(255,255,255,0.2)' },
  separator:        { height: 0.5, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 },
  switchRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  switchLabel:      { flex: 1, fontSize: 14, fontWeight: '600', color: '#fff' },
  saveBtn:          { backgroundColor: Colors.purple, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  saveBtnTxt:       { color: '#fff', fontSize: 15, fontWeight: '700' },
  deleteRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  deleteTxt:        { flex: 1, fontSize: 14, fontWeight: '600', color: '#ef4444' },
  chevron:          { fontSize: 20, color: 'rgba(255,255,255,0.25)' },
})