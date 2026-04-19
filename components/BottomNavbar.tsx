import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router, usePathname } from 'expo-router'
import { Colors } from '../constants/theme'

const NAV_ITEMS = [
  { label: 'Carte',    route: '/(user)/',         icon: '⌂' },
  { label: 'Listes',   route: '/(user)/liste',    icon: '≡' },
  { label: 'Explorer', route: '/(user)/explorer', icon: '○' },
  { label: 'Favoris',  route: '/(user)/favoris',  icon: '♡' },
  { label: 'Profil',   route: '/(user)/profil',   icon: '○' },
]

interface BottomNavbarProps {
  active: 'carte' | 'listes' | 'explorer' | 'favoris' | 'profil'
}

export function BottomNavbar({ active }: BottomNavbarProps) {
  const activeIndex = NAV_ITEMS.findIndex(
    (i) => i.label.toLowerCase() === active
  )

  return (
    <View style={styles.bar}>
      {NAV_ITEMS.map((item, idx) => {
        const isActive = idx === activeIndex
        return (
          <TouchableOpacity
            key={item.label}
            style={styles.item}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <NavIcon name={item.label} active={isActive} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? Colors.purpleLight : Colors.text3
  const size = 22

  const icons: Record<string, string> = {
    Carte:    '⌂',
    Listes:   '≡',
    Explorer: '○',
    Favoris:  '♡',
    Profil:   '○',
  }

  return (
    <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>
      {icons[name] ?? '●'}
    </Text>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 72,
    backgroundColor: `rgba(18,15,32,0.97)`,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text3,
  },
  labelActive: {
    color: Colors.purpleLight,
  },
})
