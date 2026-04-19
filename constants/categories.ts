import { Category } from '../hooks/useEvents'

export interface CategoryConfig {
  label: string
  emoji: string
  colors: [string, string]   // gradient start → end
  pinColor: string
  chipLabel: string
}

export const CATEGORIES: Record<Category, CategoryConfig> = {
  concerts: {
    label: 'Concert',
    emoji: '🎵',
    colors: ['#5b21b6', '#7c3aed'],
    pinColor: '#7c3aed',
    chipLabel: '🎵 Concerts',
  },
  standup: {
    label: 'Stand-Up',
    emoji: '🎤',
    colors: ['#7f1d1d', '#dc2626'],
    pinColor: '#dc2626',
    chipLabel: '🎤 Stand-Up',
  },
  sport: {
    label: 'Sport',
    emoji: '⚽',
    colors: ['#1e3a8a', '#3b82f6'],
    pinColor: '#3b82f6',
    chipLabel: '⚽ Sport',
  },
  expos: {
    label: 'Exposition',
    emoji: '🎨',
    colors: ['#134e4a', '#0d9488'],
    pinColor: '#0d9488',
    chipLabel: '🎨 Expos',
  },
  bars: {
    label: 'Bar & Soirée',
    emoji: '🍺',
    colors: ['#78350f', '#d97706'],
    pinColor: '#d97706',
    chipLabel: '🍺 Bars',
  },
  esport: {
    label: 'E-Sport',
    emoji: '🎮',
    colors: ['#0e7490', '#06b6d4'],
    pinColor: '#06b6d4',
    chipLabel: '🎮 E-Sport',
  },
  theatre: {
    label: 'Théâtre',
    emoji: '🎭',
    colors: ['#581c87', '#a855f7'],
    pinColor: '#a855f7',
    chipLabel: '🎭 Théâtre',
  },
}

export const ALL_CATEGORIES: Category[] = [
  'concerts', 'standup', 'sport', 'expos', 'bars', 'esport', 'theatre',
]
