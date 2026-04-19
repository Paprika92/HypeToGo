import { View, Text, TouchableOpacity } from 'react-native'
import { useAuthStore } from '../../stores/useAuthStore'

export default function OrgaHome() {
  const { signOut } = useAuthStore()

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0912', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff' }}>Dashboard Orga</Text>
      <TouchableOpacity onPress={signOut} style={{ marginTop: 20, padding: 12, backgroundColor: '#6B21A8', borderRadius: 8 }}>
        <Text style={{ color: '#fff' }}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  )
}
