import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router, usePathname } from 'expo-router'
import { Colors } from '../constants/theme'

const NAV_ITEMS = [
  { label: 'Publier', route: '/(orga)/publier', icon: '+' },
  { label: 'Events',  route: '/(orga)/events',  icon: '▦' },
  { label: 'Plans',   route: '/(orga)/plans',   icon: '◈' },
  { label: 'Infos',   route: '/(orga)/infos',   icon: 'ⓘ' },
  { label: 'Profil',  route: '/(orga)/profil',  icon: '◯' },
]

export function BottomNavbarOrga() {
  const pathname = usePathname()

  return (
    <View style={s.bar}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.includes(item.label.toLowerCase()) ||
          (item.label === 'Publier' && pathname === '/(orga)/')
        return (
          <TouchableOpacity
            key={item.label}
            style={s.item}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Text style={[s.icon, isActive && s.iconActive]}>{item.icon}</Text>
            <Text style={[s.label, isActive && s.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
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
  icon: {
    fontSize: 22,
    color: Colors.text3,
    lineHeight: 24,
  },
  iconActive: {
    color: Colors.purpleLight,
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
