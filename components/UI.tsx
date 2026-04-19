import React from 'react'
import {
  TouchableOpacity,
  TextInput,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { Colors } from '../constants/theme'

// ─── BUTTON ───────────────────────────────────────────────────
interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  loading?: boolean
  style?: ViewStyle
}

export function Button({ label, onPress, variant = 'primary', loading, style }: ButtonProps) {
  const bg = {
    primary:   Colors.purple,
    secondary: Colors.bg3,
    danger:    '#7f1d1d',
    outline:   'transparent',
  }[variant]

  const color = variant === 'secondary' ? Colors.text : '#fff'
  const border = variant === 'outline' ? Colors.purple : 'transparent'

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.btn, { backgroundColor: bg, borderColor: border, borderWidth: variant === 'outline' ? 1.5 : 0 }, style]}
    >
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={[styles.btnText, { color }]}>{label}</Text>
      }
    </TouchableOpacity>
  )
}

// ─── INPUT ────────────────────────────────────────────────────
interface InputProps {
  placeholder: string
  value: string
  onChangeText: (t: string) => void
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'numeric'
  style?: ViewStyle
}

export function Input({ placeholder, value, onChangeText, secureTextEntry, keyboardType, style }: InputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={Colors.text3}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={[styles.input, style]}
      autoCapitalize="none"
    />
  )
}

// ─── TAB TOGGLE ───────────────────────────────────────────────
interface TabToggleProps {
  tabs: string[]
  active: number
  onChange: (i: number) => void
}

export function TabToggle({ tabs, active, onChange }: TabToggleProps) {
  return (
    <View style={styles.tabWrap}>
      {tabs.map((tab, i) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onChange(i)}
          style={[styles.tabBtn, i === active && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, i === active && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

// ─── LOGO ─────────────────────────────────────────────────────
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <Text style={[styles.logo, { fontSize: size }]}>
      <Text style={{ color: '#a78bfa' }}>Hype</Text>
      <Text style={{ color: '#7c3aed' }}>To</Text>
      <Text style={{ color: '#c084fc' }}>Go</Text>
    </Text>
  )
}

// ─── ERROR BOX ────────────────────────────────────────────────
export function ErrorBox({ message }: { message: string }) {
  if (!message) return null
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  )
}

// ─── DIVIDER ──────────────────────────────────────────────────
export function Divider({ label }: { label: string }) {
  return (
    <View style={styles.divRow}>
      <View style={styles.divLine} />
      <Text style={styles.divText}>{label}</Text>
      <View style={styles.divLine} />
    </View>
  )
}

// ─── SECTION LABEL ────────────────────────────────────────────
export function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>
}

// ─── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  btn: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 18,
    backgroundColor: Colors.bg3,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    color: Colors.text,
    fontSize: 15,
  },
  tabWrap: {
    flexDirection: 'row',
    backgroundColor: Colors.bg3,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.purple,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text2,
  },
  tabTextActive: {
    color: '#fff',
  },
  logo: {
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: Colors.red,
    fontSize: 14,
    textAlign: 'center',
  },
  divRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  divText: {
    color: Colors.text3,
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text3,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
})
