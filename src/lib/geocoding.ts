/**
 * Geocoding utility using Nominatim (OpenStreetMap's geocoding service)
 * 
 * This is a free service that doesn't require API keys.
 * Rate limit: 1 request per second (be respectful!)
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Geocode an address to get latitude and longitude coordinates
 * 
 * @param address - Full address string (e.g., "123 Main St, New York, NY 10001, USA")
 * @returns Promise with latitude, longitude, and display name
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  try {
    // Use Nominatim API (free, no API key required)
    // Rate limit: 1 request per second
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "CommunityManagementApp/1.0", // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    
    // Parse latitude and longitude, ensuring they're valid numbers
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    // Validate that both coordinates are valid numbers
    if (isNaN(lat) || isNaN(lon)) {
      console.error("Invalid coordinates from geocoding API:", { lat: result.lat, lon: result.lon });
      return null;
    }
    
    console.log("Geocoding parsed values:", { latitude: lat, longitude: lon, raw: { lat: result.lat, lon: result.lon } });
    
    return {
      latitude: lat,
      longitude: lon,
      displayName: result.display_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Build a full address string from address components
 */
export function buildAddressString(
  addressLine1?: string,
  addressLine2?: string,
  city?: string,
  state?: string,
  postalCode?: string,
  country?: string
): string {
  const parts: string[] = [];

  if (addressLine1) parts.push(addressLine1);
  if (addressLine2) parts.push(addressLine2);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (postalCode) parts.push(postalCode);
  if (country) parts.push(country);

  return parts.join(", ");
}

