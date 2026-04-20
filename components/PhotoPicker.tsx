import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, ActivityIndicator, ScrollView,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'
import { Colors } from '../constants/theme'

const MAX_PHOTOS = 3
const MAX_SIZE_MB = 5

interface PhotoPickerProps {
  photos: string[]           // URLs des photos déjà uploadées
  onChange: (urls: string[]) => void
  organizerId: string
  eventId?: string           // optionnel — pour organiser dans le bucket
}

export function PhotoPicker({ photos, onChange, organizerId, eventId }: PhotoPickerProps) {
  const [uploading, setUploading] = useState(false)

  const pickAndUpload = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Maximum atteint', `Tu peux ajouter au maximum ${MAX_PHOTOS} photos.`)
      return
    }

    // Demander la permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Active l\'accès à la galerie dans les réglages.')
      return
    }

    // Ouvrir le picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.8, // compression légère
      allowsEditing: false,
    })

    if (result.canceled) return

    setUploading(true)
    const newUrls: string[] = []

    for (const asset of result.assets) {
      // Vérifier le poids
      if (asset.fileSize && asset.fileSize > MAX_SIZE_MB * 1024 * 1024) {
        Alert.alert('Photo trop lourde', `"${asset.fileName}" dépasse ${MAX_SIZE_MB} Mo. Elle a été ignorée.`)
        continue
      }

      // Vérifier le format
      const ext = asset.uri.split('.').pop()?.toLowerCase()
      const allowed = ['jpg', 'jpeg', 'png', 'heic', 'heif']
      if (ext && !allowed.includes(ext)) {
        Alert.alert('Format non supporté', `Seuls JPG, PNG et HEIC sont acceptés.`)
        continue
      }

      try {
        // Lire le fichier en base64
        const response = await fetch(asset.uri)
        const blob = await response.blob()

        // Nom de fichier unique
        const timestamp = Date.now()
        const fileName = `${organizerId}/${eventId ?? 'new'}/${timestamp}_${Math.random().toString(36).substring(2, 7)}.${ext ?? 'jpg'}`

        // Upload vers Supabase Storage
        const { error } = await supabase.storage
          .from('event_photos')
          .upload(fileName, blob, {
            contentType: asset.mimeType ?? 'image/jpeg',
            upsert: false,
          })

        if (error) {
          Alert.alert('Erreur upload', error.message)
          continue
        }

        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from('event_photos')
          .getPublicUrl(fileName)

        if (urlData?.publicUrl) {
          newUrls.push(urlData.publicUrl)
        }
      } catch (e: any) {
        Alert.alert('Erreur', e.message ?? 'Impossible d\'uploader cette photo')
      }
    }

    onChange([...photos, ...newUrls])
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    Alert.alert('Supprimer', 'Retirer cette photo ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          const updated = photos.filter((_, i) => i !== index)
          onChange(updated)
        },
      },
    ])
  }

  return (
    <View style={s.container}>
      {/* Photos existantes */}
      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoRow}>
          {photos.map((url, i) => (
            <View key={i} style={s.photoThumb}>
              <Image source={{ uri: url }} style={s.photoImg} />
              <TouchableOpacity
                style={s.removeBtn}
                onPress={() => removePhoto(i)}
              >
                <Text style={s.removeBtnTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Bouton ajouter */}
      {photos.length < MAX_PHOTOS && (
        <TouchableOpacity
          style={[s.addBtn, uploading && { opacity: 0.6 }]}
          onPress={pickAndUpload}
          disabled={uploading}
          activeOpacity={0.8}
        >
          {uploading ? (
            <View style={s.addBtnInner}>
              <ActivityIndicator color={Colors.purpleLight} size="small" />
              <Text style={s.addBtnTxt}>Upload en cours...</Text>
            </View>
          ) : (
            <View style={s.addBtnInner}>
              <Text style={s.addBtnIcon}>📷</Text>
              <Text style={s.addBtnTxt}>
                {photos.length === 0
                  ? 'Clique pour ajouter des photos'
                  : `Ajouter une photo (${photos.length}/${MAX_PHOTOS})`}
              </Text>
              <Text style={s.addBtnSub}>JPG, PNG, HEIC · Max {MAX_SIZE_MB} Mo chacune</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Compteur */}
      {photos.length === MAX_PHOTOS && (
        <View style={s.maxReached}>
          <Text style={s.maxReachedTxt}>✅ {MAX_PHOTOS} photos ajoutées — maximum atteint</Text>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container:    { marginBottom: 20 },
  photoRow:     { marginBottom: 10 },
  photoThumb:   { position: 'relative', marginRight: 10 },
  photoImg:     { width: 100, height: 100, borderRadius: 12 },
  removeBtn:    { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  removeBtnTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  addBtn:       { backgroundColor: '#13112a', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', paddingVertical: 28 },
  addBtnInner:  { alignItems: 'center', gap: 6 },
  addBtnIcon:   { fontSize: 32 },
  addBtnTxt:    { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  addBtnSub:    { color: 'rgba(255,255,255,0.25)', fontSize: 11 },
  maxReached:   { backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 12, padding: 12, alignItems: 'center' },
  maxReachedTxt:{ color: '#22c55e', fontSize: 13, fontWeight: '600' },
})