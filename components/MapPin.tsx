import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Marker, Callout } from 'react-native-maps'
import { Event, formatPrice } from '../hooks/useEvents'
import { CATEGORIES } from '../constants/categories'
import { Colors } from '../constants/theme'

interface MapPinProps {
  event: Event
  onPress: (event: Event) => void
  selected?: boolean
}

export function MapPin({ event, onPress, selected }: MapPinProps) {
  const config = CATEGORIES[event.category]
  const pinColor = config?.pinColor ?? Colors.purple

  return (
    <Marker
      coordinate={{ latitude: event.lat, longitude: event.lng }}
      onPress={() => onPress(event)}
      tracksViewChanges={false}
    >
      {/* Label flottant au-dessus du pin */}
      <View style={styles.container}>
        <View style={[
          styles.bubble,
          { borderColor: pinColor },
          selected && styles.bubbleSelected,
        ]}>
          <Text style={styles.bubbleText}>
            {config?.emoji} {formatPrice(event.price)}
          </Text>
        </View>

        {/* Dot coloré */}
        <View style={[
          styles.dot,
          {
            backgroundColor: pinColor,
            shadowColor: pinColor,
            transform: [{ scale: selected ? 1.3 : 1 }],
          },
        ]} />

        {/* Tige du pin */}
        <View style={[styles.stem, { backgroundColor: pinColor }]} />
      </View>
    </Marker>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: 'rgba(18,15,32,0.95)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  bubbleSelected: {
    backgroundColor: 'rgba(124,58,237,0.3)',
  },
  bubbleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  stem: {
    width: 2,
    height: 6,
    borderRadius: 1,
    marginTop: 1,
  },
})
