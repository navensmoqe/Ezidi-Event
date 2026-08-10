'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Loader2,
  ExternalLink,
  Sparkles,
  Navigation,
  Globe,
  Building,
  Map,
  CheckCircle2,
} from 'lucide-react';

export interface LocationData {
  country: string;
  country_code: string;
  city: string;
  full_address: string;
  latitude: number;
  longitude: number;
}

interface SmartLocationManagerProps {
  initialLocation?: Partial<LocationData>;
  onChange: (location: LocationData) => void;
  isRtl?: boolean;
}

export function SmartLocationManager({
  initialLocation,
  onChange,
  isRtl = true,
}: SmartLocationManagerProps) {
  const [location, setLocation] = useState<LocationData>({
    country: initialLocation?.country || 'العراق (Iraq)',
    country_code: initialLocation?.country_code || 'IQ',
    city: initialLocation?.city || 'لالش (Lalish)',
    full_address: initialLocation?.full_address || 'Lalish Temple, Nineveh Governorate, Iraq',
    latitude: initialLocation?.latitude || 36.7712,
    longitude: initialLocation?.longitude || 43.2982,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notify parent on change
  const updateLocation = (newData: Partial<LocationData>) => {
    const updated = { ...location, ...newData };
    setLocation(updated);
    onChange(updated);
  };

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reverse geocoding from lat/lng -> Extracts country, city, and exact address
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        { headers: { 'Accept-Language': isRtl ? 'ar,en' : 'en,ar' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
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
          const fullAddress = data.display_name || `${city}, ${country}`;

          updateLocation({
            country: country || location.country,
            country_code: countryCode || location.country_code,
            city: city || location.city,
            full_address: fullAddress,
            latitude: lat,
            longitude: lon,
          });
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
      updateLocation({ latitude: lat, longitude: lon });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [location.latitude, location.longitude],
        zoom: 13,
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'smart-map-pin',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: #F59E0B;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #FFFFFF;
            box-shadow: 0 4px 14px rgba(0,0,0,0.6);
            transform: translate(-18px, -18px);
          ">
            <span style="font-size: 18px;">📍</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([location.latitude, location.longitude], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync map center if coordinates change externally
  const panToCoords = (lat: number, lon: number, zoom = 14) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lon], zoom);
      markerRef.current.setLatLng([lat, lon]);
    }
  };

  // Live Debounced Search Query for ANY location in the world
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(
            searchQuery.trim()
          )}`,
          { headers: { 'Accept-Language': isRtl ? 'ar,en,ku,de,fr' : 'en,ar,ku,de,fr' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
          }
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When user selects a suggestion
  const handleSelectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const addr = item.address || {};
    const country = addr.country || '';
    const countryCode = (addr.country_code || '').toUpperCase();
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      item.name ||
      '';
    const fullAddress = item.display_name || `${city}, ${country}`;

    setSearchQuery(item.display_name);
    setShowSuggestions(false);

    updateLocation({
      country,
      country_code: countryCode,
      city,
      full_address: fullAddress,
      latitude: lat,
      longitude: lon,
    });

    panToCoords(lat, lon, 14);
  };

  // Get current device GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(isRtl ? 'المتصفح لا يدعم تحديد الموقع الجغرافي' : 'Geolocation not supported');
      return;
    }
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        reverseGeocode(lat, lon);
        panToCoords(lat, lon, 15);
      },
      (err) => {
        setIsLocatingUser(false);
        console.warn('Geolocation error:', err);
      },
      { timeout: 10000 }
    );
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

  return (
    <div className="space-y-5">
      {/* 1. Universal Search Input with Live Dropdown */}
      <div ref={dropdownRef} className="relative space-y-1.5">
        <label className="block text-xs font-bold text-amber-300">
          {isRtl
            ? '🔍 ابحث عن أي مدينة، قرية، معبد، شارع أو عنوان بالعالم (بالعربي أو الإنجليزي):'
            : '🔍 Search any city, village, landmark, or street address worldwide:'}
        </label>

        <div className="relative">
          <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`}>
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-amber-400" />
            )}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder={
              isRtl
                ? 'اكتب اسم أي مكان بالعالم (مثل: لالش، هانوفر، دهوك، شنكال، برلين، باريس، بغداد، ستوكهولم)...'
                : 'Type any location (e.g. Lalish, Hannover, Duhok, Sinjar, Berlin, Paris, Stockholm)...'
            }
            className={`w-full py-3 rounded-2xl bg-slate-900 border-2 border-amber-500/70 text-white text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/20 shadow-xl ${
              isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
            }`}
          />
        </div>

        {/* Live Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900/98 backdrop-blur-xl border-2 border-amber-500 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-800 animate-in fade-in zoom-in-95">
            <div className="p-2.5 bg-slate-950 text-xs font-bold text-amber-400 flex items-center justify-between border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isRtl ? 'اختر الموقع ليتم تعبئة جميع الخانات تلقائياً:' : 'Select location to auto-fill all fields:'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Google Maps / OpenStreetMap</span>
            </div>

            {suggestions.map((item, idx) => {
              const addr = item.address || {};
              const cName =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.municipality ||
                addr.county ||
                item.name;
              const country = addr.country || '';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full p-3 text-right hover:bg-amber-500/15 transition-colors flex items-start gap-3 text-xs cursor-pointer group"
                >
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 overflow-hidden space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm group-hover:text-amber-300">
                        {cName}
                      </span>
                      {country && (
                        <span className="text-slate-400 text-xs font-semibold">
                          ({country})
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{item.display_name}</p>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0">
                    {isRtl ? 'تعبئة تلقائية ✓' : 'Auto-fill ✓'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Interactive Map Container & GPS Locate Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Map className="w-4 h-4 text-amber-400" />
            <span>{isRtl ? 'الخريطة التفاعلية (انقر أو اسحب الدبوس لتحديث الموقع تلقائياً):' : 'Interactive Map (Click or drag pin):'}</span>
          </span>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocatingUser}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocatingUser ? 'animate-spin' : ''}`} />
            <span>{isLocatingUser ? (isRtl ? 'جاري التحديد...' : 'Locating...') : (isRtl ? 'موقعي الحالي 📍' : 'My GPS Location')}</span>
          </button>
        </div>

        <div
          ref={mapContainerRef}
          className="w-full h-72 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner relative z-10"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-1 gap-2 pt-1">
          <span className="text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isRtl ? 'يمكنك تحريك الدبوس على أي نقطة وسيقوم بتحديث اسم الدولة والمدينة والعنوان فوراً.' : 'Moving the pin automatically updates country, city, and address.'}</span>
          </span>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1 shrink-0"
          >
            <span>{isRtl ? '🗺️ فتح وتأكيد الموقع على Google Maps' : 'Open in Google Maps'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 3. Fully Synchronized & Editable Auto-Filled Fields */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs border-b border-slate-800 pb-2">
          <Sparkles className="w-4 h-4" />
          <span>{isRtl ? 'البيانات المعبأة تلقائياً من الخريطة (يمكنك تعديلها يدوياً أيضاً):' : 'Auto-filled Location Fields (Fully Editable):'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Country (Fully flexible text input for ANY country worldwide) */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              {isRtl ? 'الدولة (أي دولة بالعالم) *' : 'Country (Any worldwide country) *'}
            </label>
            <div className="relative">
              <Globe className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type="text"
                required
                value={location.country}
                onChange={(e) => updateLocation({ country: e.target.value })}
                placeholder={isRtl ? 'العراق، ألمانيا، فرنسا، السويد، أمريكا...' : 'e.g. Iraq, Germany, USA, France...'}
                className={`w-full py-2.5 rounded-xl bg-slate-950 border border-amber-500/80 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                }`}
              />
            </div>
          </div>

          {/* City / Area (Fully flexible text input for ANY city worldwide) */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              {isRtl ? 'المدينة / المنطقة / البلدة *' : 'City / Region / Town *'}
            </label>
            <div className="relative">
              <Building className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type="text"
                required
                value={location.city}
                onChange={(e) => updateLocation({ city: e.target.value })}
                placeholder={isRtl ? 'لالش، شنكال، هانوفر، دهوك، برلين، باريس...' : 'e.g. Lalish, Sinjar, Hanover, Duhok...'}
                className={`w-full py-2.5 rounded-xl bg-slate-950 border border-amber-500/80 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                }`}
              />
            </div>
          </div>

          {/* Coordinates */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              {isRtl ? 'الإحداثيات الجغرافية (Lat / Lon)' : 'Coordinates (Lat / Lon)'}
            </label>
            <div className="py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 text-xs font-mono font-bold flex items-center justify-between">
              <span>{location.latitude.toFixed(5)}</span>
              <span className="text-slate-600">|</span>
              <span>{location.longitude.toFixed(5)}</span>
            </div>
          </div>

          {/* Full Detailed Address */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              {isRtl ? 'العنوان والمقر الدقيق كاملاً *' : 'Complete Detailed Address *'}
            </label>
            <div className="relative">
              <MapPin className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type="text"
                required
                value={location.full_address}
                onChange={(e) => updateLocation({ full_address: e.target.value })}
                placeholder={isRtl ? 'الشارع، رقم المبنى، الحي، الرمز البريدي، المدينة، الدولة...' : 'Street address, building, district, city, country...'}
                className={`w-full py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 ${
                  isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
