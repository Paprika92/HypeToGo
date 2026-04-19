import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../stores/useAuthStore'

export default function RootLayout() {
  const router = useRouter()
  const { profile, loading, loadProfile } = useAuthStore()

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (loading) return
    if (!profile) {
      router.replace('/(auth)/login')
    } else if (profile.role === 'orga') {
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
