import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const lang = searchParams.get('lang') || 'ar';

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'EzidiEventsWorldwide/1.0 (contact@ezidievents.org)',
        'Accept-Language': lang === 'ar' ? 'ar,en,ku,de,fr' : 'en,ar,ku,de,fr',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const country = addr.country || '';
      const countryCode = (addr.country_code || '').toUpperCase();
      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.county ||
        addr.state_district ||
        addr.state ||
        '';

      return NextResponse.json({
        display_name: data.display_name,
        country,
        country_code: countryCode,
        city,
        address: data.display_name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      });
    }
  } catch (err) {
    console.error('Reverse geocoding error:', err);
  }

  return NextResponse.json({
    latitude: parseFloat(lat),
    longitude: parseFloat(lon),
  });
}
