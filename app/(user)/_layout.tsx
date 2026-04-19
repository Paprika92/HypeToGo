import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { useAuthStore } from '../../stores/useAuthStore'

export default function UserLayout() {
  const { profile, loading } = useAuthStore()

  useEffect(() => {
    if (loading) return
    if (!profile) {
      router.replace('/(auth)/login')
    } else if (profile.role === 'orga') {
      router.replace('/(orga)/')
    }
  }, [profile, loading])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0912' },
      }}
    />
  )
}
