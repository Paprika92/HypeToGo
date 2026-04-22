import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, ActivityIndicator, ScrollView,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { supabase } from '../lib/supabase'
import { Colors } from '../constants/theme'

const MAX_PHOTOS = 3
const MAX_SIZE_MB = 5

interface PhotoPickerProps {
  photos: string[]
  onChange: (urls: string[]) => void
  organizerId: string
  eventId?: string
}

export function PhotoPicker({ photos, onChange, organizerId, eventId }: PhotoPickerProps) {
  const [uploading, setUploading] = useState(false)

  const uploadAsset = async (uri: string): Promise<string | null> => {
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri, [], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      )
  
      const timestamp = Date.now()
      const fileName = `${organizerId}/${eventId ?? 'new'}/${timestamp}_${Math.random().toString(36).substring(2, 7)}.jpg`
  
      const formData = new FormData()
      formData.append('file', {
        uri: manipulated.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any)
  
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
  
      const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/event_photos/${fileName}`
  
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          'x-upsert': 'false',
        },
        body: formData,
      })
  
      if (!response.ok) {
        const err = await response.text()
        Alert.alert('Erreur upload', err)
        return null
      }
  
      const { data: urlData } = supabase.storage.from('event_photos').getPublicUrl(fileName)
      return urlData?.publicUrl ?? null
  
    } catch (e: any) {
      Alert.alert('Erreur', e.message)
      return null
    }
  }

  const pickAndUpload = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Maximum atteint', `Max ${MAX_PHOTOS} photos.`)
      return
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Active l'accès à la galerie dans les réglages.")
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.8,
      allowsEditing: false,
    })
    if (result.canceled) return
    setUploading(true)
    const newUrls: string[] = []
    for (const asset of result.assets) {
      if (asset.fileSize && asset.fileSize > MAX_SIZE_MB * 1024 * 1024) {
        Alert.alert('Photo trop lourde', `Dépasse ${MAX_SIZE_MB} Mo.`)
        continue
      }
      const url = await uploadAsset(asset.uri)
      if (url) newUrls.push(url)
    }
    onChange([...photos, ...newUrls])
    setUploading(false)
  }

  const takePhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Maximum atteint', `Max ${MAX_PHOTOS} photos.`)
      return
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Active l'accès à la caméra dans les réglages.")
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    })
    if (result.canceled) return
    setUploading(true)
    const url = await uploadAsset(result.assets[0].uri)
    if (url) onChange([...photos, url])
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    Alert.alert('Supprimer', 'Retirer cette photo ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => onChange(photos.filter((_, i) => i !== index)),
      },
    ])
  }

  return (
    <View style={s.container}>
      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoRow}>
          {photos.map((url, i) => (
            <View key={i} style={s.photoThumb}>
              <Image source={{ uri: url }} style={s.photoImg} resizeMode="cover" />
              <TouchableOpacity style={s.removeBtn} onPress={() => removePhoto(i)}>
                <Text style={s.removeBtnTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {photos.length < MAX_PHOTOS && (
        <View style={s.addBtnsRow}>
          <TouchableOpacity
            style={[s.addBtn, s.addBtnHalf, uploading && { opacity: 0.6 }]}
            onPress={pickAndUpload}
            disabled={uploading}
            activeOpacity={0.8}
          >
            {uploading ? (
              <View style={s.addBtnInner}>
                <ActivityIndicator color={Colors.purpleLight} size="small" />
                <Text style={s.addBtnTxt}>Upload...</Text>
              </View>
            ) : (
              <View style={s.addBtnInner}>
                <Text style={s.addBtnIcon}>🖼️</Text>
                <Text style={s.addBtnTxt}>Galerie</Text>
                <Text style={s.addBtnSub}>{photos.length}/{MAX_PHOTOS}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.addBtn, s.addBtnHalf, uploading && { opacity: 0.6 }]}
            onPress={takePhoto}
            disabled={uploading}
            activeOpacity={0.8}
          >
            <View style={s.addBtnInner}>
              <Text style={s.addBtnIcon}>📷</Text>
              <Text style={s.addBtnTxt}>Caméra</Text>
              <Text style={s.addBtnSub}>Prendre une photo</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {photos.length === MAX_PHOTOS && (
        <View style={s.maxReached}>
          <Text style={s.maxReachedTxt}>✅ {MAX_PHOTOS} photos — maximum atteint</Text>
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
  addBtnsRow:   { flexDirection: 'row', gap: 10 },
  addBtnHalf:   { flex: 1 },
  addBtn:       { backgroundColor: '#13112a', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', paddingVertical: 28 },
  addBtnInner:  { alignItems: 'center', gap: 6 },
  addBtnIcon:   { fontSize: 32 },
  addBtnTxt:    { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  addBtnSub:    { color: 'rgba(255,255,255,0.25)', fontSize: 11 },
  maxReached:   { backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 12, padding: 12, alignItems: 'center' },
  maxReachedTxt:{ color: '#22c55e', fontSize: 13, fontWeight: '600' },
})