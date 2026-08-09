/**
 * Generates dynamic Google Maps URLs based on precise latitude and longitude.
 * Format: https://www.google.com/maps/search/?api=1&query=LATITUDE,LONGITUDE
 */
export function generateGoogleMapsUrl(latitude: number, longitude: number): string {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return 'https://maps.google.com';
  }
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function generateGoogleMapsDirectionsUrl(
  destinationLat: number,
  destinationLon: number
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLon}`;
}
