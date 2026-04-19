import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '../../stores/useAuthStore'
import { Colors } from '../../constants/theme'
import { Button, Input, TabToggle, Logo, ErrorBox, Divider } from '../../components/UI'

export default function LoginScreen() {
  const { signIn, loadProfile } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Remplis tous les champs'); return }
    setLoading(true)
    setError('')
    const { error: err } = await signIn(email, password)
    if (err) {
      setError(err)
      setLoading(false)
      return
    }
    await loadProfile()
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <LinearGradient
        colors={['transparent', 'rgba(88,28,235,0.2)', 'rgba(88,28,235,0.1)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Logo size={38} />
            <Text style={styles.subtitle}>
              Découvre les meilleurs évènements{'\n'}autour de toi.
            </Text>
          </View>

          {/* Tab toggle */}
          <TabToggle
            tabs={['Connexion', 'Inscription']}
            active={0}
            onChange={(i) => { if (i === 1) router.push('/(auth)/register') }}
          />

          {/* Form */}
          <View style={styles.form}>
            <ErrorBox message={error} />
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Input
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{ marginTop: 12 }}
            />
          </View>

          <Button
            label="Se connecter →"
            onPress={handleLogin}
            loading={loading}
            style={{ marginBottom: 16 }}
          />

          <Divider label="Ou" />

          <Button
            label="Continuer avec Google"
            onPress={() => {}}
            variant="secondary"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  subtitle: {
    color: Colors.text2,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  form: {
    marginTop: 24,
    marginBottom: 20,
    gap: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: Colors.text3,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
})
