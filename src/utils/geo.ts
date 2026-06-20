import type { Region } from 'react-native-maps';

const MILES_PER_DEG_LAT = 69; // ~constant

/**
 * Builds a map Region centered on (lat,lng) whose vertical half-height is
 * roughly `radiusMiles` — i.e. the edge of the viewport is ~radiusMiles away.
 */
export function regionForRadius(lat: number, lng: number, radiusMiles: number): Region {
  const latitudeDelta = (radiusMiles * 2) / MILES_PER_DEG_LAT;
  // Longitude degrees shrink toward the poles; correct by latitude.
  const lngScale = Math.max(Math.cos((lat * Math.PI) / 180), 0.01);
  const longitudeDelta = latitudeDelta / lngScale;
  return { latitude: lat, longitude: lng, latitudeDelta, longitudeDelta };
}
