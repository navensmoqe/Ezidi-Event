import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Curated instant Yazidi & Diaspora hubs for ultra-fast zero-latency offline fallback
const CURATED_PLACES = [
  {
    keywords: ['لالش', 'lalish', 'معبد لالش', 'lalish temple', 'lalis'],
    name: 'لالش (Lalish Temple)',
    city: 'لالش',
    state: 'محافظة نينوى',
    country: 'العراق (Iraq)',
    country_code: 'IQ',
    display_name: 'معبد لالش النوراني، قضاء الشيخان، محافظة نينوى، العراق',
    lat: 36.7712,
    lon: 43.2982,
  },
  {
    keywords: ['سنجار', 'شنكال', 'شنگال', 'sinjar', 'shingal', 'sengal', 'سنج'],
    name: 'سنجار / شنكال (Sinjar)',
    city: 'سنجار (شنكال)',
    state: 'محافظة نينوى',
    country: 'العراق (Iraq)',
    country_code: 'IQ',
    display_name: 'مدينة سنجار (شنكال)، قضاء سنجار، محافظة نينوى، العراق',
    lat: 36.3209,
    lon: 41.8754,
  },
  {
    keywords: ['بعشيقة', 'بحزاني', 'bashiqa', 'bahzani'],
    name: 'بعشيقة وبحزاني (Bashiqa)',
    city: 'بعشيقة',
    state: 'محافظة نينوى',
    country: 'العراق (Iraq)',
    country_code: 'IQ',
    display_name: 'ناحية بعشيقة وبحزاني، سهل نينوى، العراق',
    lat: 36.4528,
    lon: 43.3444,
  },
  {
    keywords: ['الشيخان', 'عين سفني', 'sheikhan', 'ain sifni'],
    name: 'الشيخان / عين سفني (Sheikhan)',
    city: 'الشيخان',
    state: 'محافظة نينوى',
    country: 'العراق (Iraq)',
    country_code: 'IQ',
    display_name: 'قضاء الشيخان (عين سفني)، محافظة نينوى، العراق',
    lat: 36.7022,
    lon: 43.3478,
  },
  {
    keywords: ['شاريا', 'shariya', 'sharia'],
    name: 'مجمع شاريا (Shariya)',
    city: 'شاريا',
    state: 'محافظة دهوك',
    country: 'العراق (Iraq)',
    country_code: 'IQ',
    display_name: 'مجمع شاريا، محافظة دهوك، إقليم كردستان، العراق',
    lat: 36.8042,
    lon: 42.9614,
  },
  {
    keywords: ['خانكي', 'khanke', 'khanik'],
    name: 'مجمع خانكي (Khanke)',
    city: 'خانكي',
    state: 'محافظة دهوك',
    country: 'العراق (Iraq)',
    country_code: 'IQ',
    display_name: 'ناحية خانكي، محافظة دهوك، إقليم كردستان، العراق',
    lat: 36.8589,
    lon: 42.7842,
  },
  {
    keywords: ['دهوك', 'duhok', 'dohuk'],
    name: 'دهوك (Duhok)',
    city: 'دهوك',
    state: 'محافظة دهوك',
    country: 'العراق (Iraq)',
    country_code: 'IQ',
    display_name: 'مدينة دهوك، إقليم كردستان، العراق',
    lat: 36.8679,
    lon: 42.9886,
  },
  {
    keywords: ['أربيل', 'اربيل', 'erbil', 'hewler', 'هولير'],
    name: 'أربيل (Erbil)',
    city: 'أربيل',
    state: 'محافظة أربيل',
    country: 'العراق (Iraq)',
    country_code: 'IQ',
    display_name: 'مدينة أربيل، عاصمة إقليم كردستان، العراق',
    lat: 36.1901,
    lon: 44.0091,
  },
  {
    keywords: ['بغداد', 'baghdad'],
    name: 'بغداد (Baghdad)',
    city: 'بغداد',
    state: 'محافظة بغداد',
    country: 'العراق (Iraq)',
    country_code: 'IQ',
    display_name: 'مدينة بغداد، العاصمة، العراق',
    lat: 33.3152,
    lon: 44.3661,
  },
  {
    keywords: ['هانوفر', 'hannover', 'hanover'],
    name: 'هانوفر (Hannover)',
    city: 'هانوفر',
    state: 'سكسونيا السفلى (Niedersachsen)',
    country: 'ألمانيا (Germany)',
    country_code: 'DE',
    display_name: 'Hannover, Niedersachsen, Deutschland',
    lat: 52.3759,
    lon: 9.732,
  },
  {
    keywords: ['تسيله', 'تسيلا', 'celle'],
    name: 'تسيله (Celle)',
    city: 'تسيله',
    state: 'سكسونيا السفلى',
    country: 'ألمانيا (Germany)',
    country_code: 'DE',
    display_name: 'Celle, Niedersachsen, Deutschland',
    lat: 52.6247,
    lon: 10.0811,
  },
  {
    keywords: ['أولدنبرغ', 'اولدنبرغ', 'oldenburg'],
    name: 'أولدنبرغ (Oldenburg)',
    city: 'أولدنبرغ',
    state: 'سكسونيا السفلى',
    country: 'ألمانيا (Germany)',
    country_code: 'DE',
    display_name: 'Oldenburg, Niedersachsen, Deutschland',
    lat: 53.1435,
    lon: 8.2146,
  },
  {
    keywords: ['بيلفيلد', 'bielefeld'],
    name: 'بيلفيلد (Bielefeld)',
    city: 'بيلفيلد',
    state: 'شمال الراين-وستفاليا',
    country: 'ألمانيا (Germany)',
    country_code: 'DE',
    display_name: 'Bielefeld, Nordrhein-Westfalen, Deutschland',
    lat: 52.0302,
    lon: 8.5325,
  },
  {
    keywords: ['برلين', 'berlin'],
    name: 'برلين (Berlin)',
    city: 'برلين',
    state: 'ولاية برلين',
    country: 'ألمانيا (Germany)',
    country_code: 'DE',
    display_name: 'Berlin, Deutschland',
    lat: 52.52,
    lon: 13.405,
  },
  {
    keywords: ['كولن', 'كولونيا', 'cologne', 'koln', 'köln'],
    name: 'كولن (Köln / Cologne)',
    city: 'كولن',
    state: 'شمال الراين-وستفاليا',
    country: 'ألمانيا (Germany)',
    country_code: 'DE',
    display_name: 'Köln, Nordrhein-Westfalen, Deutschland',
    lat: 50.9375,
    lon: 6.9603,
  },
  {
    keywords: ['باريس', 'paris'],
    name: 'باريس (Paris)',
    city: 'باريس',
    state: 'إيل دو فرانس',
    country: 'فرنسا (France)',
    country_code: 'FR',
    display_name: 'Paris, Île-de-France, France',
    lat: 48.8566,
    lon: 2.3522,
  },
  {
    keywords: ['ستوكهولم', 'stockholm'],
    name: 'ستوكهولم (Stockholm)',
    city: 'ستوكهولم',
    state: 'محافظة ستوكهولم',
    country: 'السويد (Sweden)',
    country_code: 'SE',
    display_name: 'Stockholm, Sverige',
    lat: 59.3293,
    lon: 18.0686,
  },
  {
    keywords: ['يريفان', 'yerevan', 'أرمينيا', 'armenia', 'أكناكليش', 'aknalich'],
    name: 'يريفان / أكناكليش (Yerevan)',
    city: 'يريفان',
    state: 'أرمافير',
    country: 'أرمينيا (Armenia)',
    country_code: 'AM',
    display_name: 'معبد قبة لالش في أكناكليش، يريفان، أرمينيا',
    lat: 40.1792,
    lon: 44.4991,
  },
  {
    keywords: ['تبليسي', 'تبيليسي', 'tbilisi', 'جورجيا', 'georgia'],
    name: 'تبليسي (Tbilisi)',
    city: 'تبليسي',
    state: 'تبليسي',
    country: 'جورجيا (Georgia)',
    country_code: 'GE',
    display_name: 'معبد إيزيدا في تبليسي، جورجيا',
    lat: 41.7151,
    lon: 44.8271,
  },
  {
    keywords: ['لنكولن', 'lincoln', 'نبراسكا', 'nebraska'],
    name: 'لنكولن، نبراسكا (Lincoln, NE)',
    city: 'لنكولن',
    state: 'ولاية نبراسكا',
    country: 'الولايات المتحدة (USA)',
    country_code: 'US',
    display_name: 'Lincoln, Nebraska, United States',
    lat: 40.8136,
    lon: -96.7026,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const lang = searchParams.get('lang') || 'ar';

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const results: any[] = [];

  // 1. Check curated matching entries first for instant Yazidi hubs
  for (const place of CURATED_PLACES) {
    if (place.keywords.some((k) => k.includes(query) || query.includes(k))) {
      results.push({
        display_name: place.display_name,
        name: place.name,
        city: place.city,
        state: place.state,
        country: place.country,
        country_code: place.country_code,
        lat: place.lat,
        lon: place.lon,
      });
    }
  }

  // 2. Query Live OpenStreetMap Nominatim with Node.js Server User-Agent (No CORS issues)
  try {
    const encoded = encodeURIComponent(query);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&q=${encoded}`;
    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'EzidiEventsWorldwide/1.0 (contact@ezidievents.org)',
        'Accept-Language': lang === 'ar' ? 'ar,en,ku,de,fr' : 'en,ar,ku,de,fr',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const addr = item.address || {};
          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            addr.county ||
            addr.state_district ||
            item.name ||
            '';
          const state = addr.state || addr.province || addr.region || '';
          const country = addr.country || '';
          const countryCode = (addr.country_code || '').toUpperCase();
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);

          // Avoid duplicates with curated results
          const isDup = results.some(
            (r) => Math.abs(r.lat - lat) < 0.05 && Math.abs(r.lon - lon) < 0.05
          );

          if (!isDup) {
            results.push({
              display_name: item.display_name,
              name: item.name || city,
              city: city || item.name,
              state: state,
              country: country,
              country_code: countryCode,
              lat,
              lon,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Nominatim server geocoding error:', err);
  }

  // 3. Photon Komoot Fallback if results are still sparse
  if (results.length < 3) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`;
      const pRes = await fetch(photonUrl, { next: { revalidate: 3600 } });
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData?.features && Array.isArray(pData.features)) {
          for (const feat of pData.features) {
            const props = feat.properties || {};
            const coords = feat.geometry?.coordinates || [];
            const lon = coords[0];
            const lat = coords[1];
            if (lat && lon) {
              const city = props.city || props.name || props.town || '';
              const state = props.state || '';
              const country = props.country || '';
              const countryCode = (props.countrycode || '').toUpperCase();
              const displayName = [props.name, props.city, props.state, props.country]
                .filter(Boolean)
                .join(', ');

              const isDup = results.some(
                (r) => Math.abs(r.lat - lat) < 0.05 && Math.abs(r.lon - lon) < 0.05
              );

              if (!isDup) {
                results.push({
                  display_name: displayName || props.name,
                  name: props.name || city,
                  city: city || props.name,
                  state,
                  country,
                  country_code: countryCode,
                  lat,
                  lon,
                });
              }
            }
          }
        }
      }
    } catch {}
  }

  return NextResponse.json({ results: results.slice(0, 10) });
}
