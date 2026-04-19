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

type Step = 'role' | 'user' | 'orga'

export default function RegisterScreen() {
  const { signUpUser, signUpOrga, loadProfile } = useAuthStore()
  const [step, setStep] = useState<Step>('role')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // User fields
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Orga fields
  const [company, setCompany] = useState('')
  const [siret, setSiret] = useState('')
  const [emailOrga, setEmailOrga] = useState('')
  const [passwordOrga, setPasswordOrga] = useState('')

  const handleSignUpUser = async () => {
    if (!nom || !prenom || !email || !password) { setError('Remplis tous les champs'); return }
    setLoading(true); setError('')
    const { error: err } = await signUpUser({ name: nom, prenom, email, password })
    if (err) {
      setError(err)
      setLoading(false)
      return
    }
    await loadProfile()
    setLoading(false)
  }

  const handleSignUpOrga = async () => {
    if (!emailOrga || !passwordOrga || !company || !siret) { setError('Remplis tous les champs'); return }
    setLoading(true); setError('')
    const { error: err } = await signUpOrga({ email: emailOrga, password: passwordOrga, company_name: company, siret })
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
      <LinearGradient
        colors={['transparent', 'rgba(88,28,235,0.2)', 'rgba(88,28,235,0.1)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => step === 'role' ? router.back() : setStep('role')}>
              <Text style={{ color: Colors.text, fontSize: 18 }}>←</Text>
            </TouchableOpacity>
            <Logo size={26} />
          </View>
          <Text style={styles.subtitle}>Découvre les meilleurs évènements{'\n'}autour de toi.</Text>

          <TabToggle
            tabs={['Connexion', 'Inscription']}
            active={1}
            onChange={(i) => { if (i === 0) router.replace('/(auth)/login') }}
          />

          {/* STEP: ROLE CHOICE */}
          {step === 'role' && (
            <View style={{ marginTop: 32 }}>
              <TouchableOpacity style={styles.roleCard} onPress={() => setStep('user')} activeOpacity={0.85}>
                <Text style={styles.roleEmoji}>🙋</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleTitle}>Je cherche des events</Text>
                  <Text style={styles.roleDesc}>Découvre des concerts, soirées, expos, sports et bien plus près de toi</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.roleCard} onPress={() => setStep('orga')} activeOpacity={0.85}>
                <Text style={styles.roleEmoji}>🎪</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleTitle}>Je publie des events</Text>
                  <Text style={styles.roleDesc}>Crée et gère tes évènements, touche des milliers de personnes à Paris</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.footer}>
                <Text style={styles.footerText}>Déjà un compte ? </Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                  <Text style={styles.footerLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP: USER FORM */}
          {step === 'user' && (
            <View style={{ marginTop: 24 }}>
              <ErrorBox message={error} />
              <View style={{ gap: 12 }}>
                <Input placeholder="Nom" value={nom} onChangeText={setNom} />
                <Input placeholder="Prénom" value={prenom} onChangeText={setPrenom} />
                <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                <Input placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
              </View>
              <Button label="S'inscrire →" onPress={handleSignUpUser} loading={loading} style={{ marginTop: 24 }} />
              <Divider label="Ou" />
              <Button label="Continuer avec Google" onPress={() => {}} variant="secondary" />
            </View>
          )}

          {/* STEP: ORGA FORM */}
          {step === 'orga' && (
            <View style={{ marginTop: 24 }}>
              <ErrorBox message={error} />
              <View style={{ gap: 12 }}>
                <Input placeholder="Email" value={emailOrga} onChangeText={setEmailOrga} keyboardType="email-address" />
                <Input placeholder="Mot de passe" value={passwordOrga} onChangeText={setPasswordOrga} secureTextEntry />
                <Input placeholder="Nom entreprise*" value={company} onChangeText={setCompany} />
                <Input placeholder="Numéro de Siret*" value={siret} onChangeText={setSiret} keyboardType="numeric" />
              </View>
              <Button label="Créer mon compte →" onPress={handleSignUpOrga} loading={loading} style={{ marginTop: 24 }} />
              <Divider label="Ou" />
              <Button label="Continuer avec Google" onPress={() => {}} variant="secondary" />
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  backBtn: { width: 40, height: 40, backgroundColor: Colors.bg3, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  subtitle: { color: Colors.text2, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 18, backgroundColor: Colors.bg3, borderWidth: 1.5, borderColor: Colors.border, marginBottom: 14 },
  roleEmoji: { fontSize: 48 },
  roleTitle: { fontWeight: '700', fontSize: 18, color: Colors.text, marginBottom: 4 },
  roleDesc: { fontSize: 13, color: Colors.text3, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: Colors.text3, fontSize: 14 },
  footerLink: { color: Colors.text, fontWeight: '700', fontSize: 14 },
})
