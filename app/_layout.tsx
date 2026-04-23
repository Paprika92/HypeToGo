import { Stack } from 'expo-router'
import { useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../stores/useAuthStore'

export default function RootLayout() {
  const router = useRouter()
  const { profile, loading, loadProfile } = useAuthStore()
  const hasNavigated = useRef(false)

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (loading) return

    // Si pas de profil (déconnexion) → toujours rediriger vers login
    if (!profile) {
      hasNavigated.current = false
      router.replace('/(auth)/login')
      return
    }

    // Navigation initiale seulement — pas à chaque setProfile
    if (hasNavigated.current) return
    hasNavigated.current = true

    if (profile.role === 'orga') {
      router.replace('/(orga)')
    } else {
      router.replace('/(user)')
    }
  }, [profile, loading])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(user)" />
      <Stack.Screen name="(orga)" />
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="confirmation" />
    </Stack>
  )
}
