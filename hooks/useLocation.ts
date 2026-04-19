import { useState, useEffect } from 'react'
import * as Location from 'expo-location'
import { PARIS_BOUNDS } from '../constants/theme'

export interface UserLocation {
  lat: number
  lng: number
  isRealGPS: boolean
}

const PARIS_DEFAULT: UserLocation = {
  lat: PARIS_BOUNDS.centerLat,
  lng: PARIS_BOUNDS.centerLng,
  isRealGPS: false,
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation>(PARIS_DEFAULT)
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'pending'>('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    requestLocation()
  }, [])

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied')

      if (status !== 'granted') {
        setLocation(PARIS_DEFAULT)
        setLoading(false)
        return
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const { latitude, longitude } = pos.coords
      const inParis = isInParis(latitude, longitude)

      setLocation({
        lat: inParis ? latitude : PARIS_DEFAULT.lat,
        lng: inParis ? longitude : PARIS_DEFAULT.lng,
        isRealGPS: inParis,
      })
    } catch {
      setLocation(PARIS_DEFAULT)
    } finally {
      setLoading(false)
    }
  }

  return { location, permissionStatus, loading, retry: requestLocation }
}

export function isInParis(lat: number, lng: number): boolean {
  return (
    lat >= PARIS_BOUNDS.minLat &&
    lat <= PARIS_BOUNDS.maxLat &&
    lng >= PARIS_BOUNDS.minLng &&
    lng <= PARIS_BOUNDS.maxLng
  )
}
