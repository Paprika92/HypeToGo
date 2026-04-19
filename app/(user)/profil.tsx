import { View, Text, TouchableOpacity } from 'react-native'
import { useAuthStore } from '../../stores/useAuthStore'

export default function ProfilScreen() {
  const { signOut, profile } = useAuthStore()

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0912', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <Text style={{ color: '#fff', fontSize: 18 }}>👤 {profile?.name}</Text>
      <Text style={{ color: '#888' }}>{profile?.email}</Text>
      <TouchableOpacity 
        onPress={signOut} 
        style={{ marginTop: 20, padding: 14, backgroundColor: '#6B21A8', borderRadius: 12, paddingHorizontal: 32 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  )
}