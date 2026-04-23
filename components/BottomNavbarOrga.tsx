import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router, usePathname } from 'expo-router'
import { Colors } from '../constants/theme'

const NAV_ITEMS = [
  { label: 'Carte',   route: '/(orga)/',        icon: '⌂' },
  { label: 'Publier', route: '/(orga)/publier', icon: '+' },
  { label: 'Plans',   route: '/(orga)/plans',   icon: '◈' },
  { label: 'Events',  route: '/(orga)/events',  icon: '▦' },
  { label: 'Profil',  route: '/(orga)/profil',  icon: '◯' },
]

export function BottomNavbarOrga() {
  const pathname = usePathname()

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.label === 'Carte') return pathname === '/(orga)/' || pathname === '/(orga)'
    return pathname.includes(item.label.toLowerCase())
  }

  const handlePress = (item: typeof NAV_ITEMS[0]) => {
    // Ne navigue pas si on est déjà sur cette route ou une sous-route
    if (isActive(item)) return
    // Ne navigue pas si on est sur parametres ou une page de détail
    if (pathname.includes('parametres') || pathname.includes('edit-event')) return
    router.push(item.route as any)
  }

  return (
    <View style={s.bar}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item)
        return (
          <TouchableOpacity
            key={item.label}
            style={s.item}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
          >
            <Text style={[s.icon, active && s.iconActive]}>{item.icon}</Text>
            <Text style={[s.label, active && s.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  bar:         { flexDirection: 'row', height: 72, backgroundColor: 'rgba(18,15,32,0.97)', borderTopWidth: 1, borderTopColor: Colors.border, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 8 },
  item:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 8 },
  icon:        { fontSize: 22, color: Colors.text3, lineHeight: 24 },
  iconActive:  { color: Colors.purpleLight },
  label:       { fontSize: 11, fontWeight: '500', color: Colors.text3 },
  labelActive: { color: Colors.purpleLight },
})
