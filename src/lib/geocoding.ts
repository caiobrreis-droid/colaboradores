export async function geocodeAddress(
  address: string,
  city: string,
  state: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, ${city}, ${state}, Brazil`);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
      {
        headers: {
          'User-Agent': 'VESSEL_Gestao_Colaboradores',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to geocode address');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon), // Nominatim uses 'lon', we map to 'lng'
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}
