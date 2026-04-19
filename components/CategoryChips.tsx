import React from 'react'
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { Category } from '../hooks/useEvents'
import { ALL_CATEGORIES, CATEGORIES } from '../constants/categories'
import { Colors } from '../constants/theme'

interface CategoryChipsProps {
  selected: Category | null
  onChange: (cat: Category | null) => void
}

export function CategoryChips({ selected, onChange }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {/* Chip "Tout" */}
      <TouchableOpacity
        onPress={() => onChange(null)}
        style={[styles.chip, selected === null && styles.chipActive]}
        activeOpacity={0.8}
      >
        <Text style={[styles.chipText, selected === null && styles.chipTextActive]}>
          ✦ Tout
        </Text>
      </TouchableOpacity>

      {/* Chips catégories */}
      {ALL_CATEGORIES.map((cat) => {
        const isActive = selected === cat
        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onChange(isActive ? null : cat)}
            style={[styles.chip, isActive && styles.chipActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {CATEGORIES[cat].chipLabel}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    backgroundColor: Colors.bg3,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.purple,
    borderColor: Colors.purple,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text2,
    whiteSpace: 'nowrap',
  },
  chipTextActive: {
    color: '#fff',
  },
})
