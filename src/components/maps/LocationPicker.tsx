'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Loader2, ExternalLink, Sparkles } from 'lucide-react';

export interface LocationDetails {
  lat: number;
  lon: number;
  address?: string;
  cityName?: string;
  countryName?: string;
  countryCode?: string;
}

interface LocationPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect: (lat: number, lon: number, address?: string, details?: LocationDetails) => void;
}

export function LocationPicker({
  initialLatitude = 52.5200,
  initialLongitude = 13.4050,
  onLocationSelect,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: initialLatitude,
    lon: initialLongitude,
  });
  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Reverse geocoding helper to extract city, country, postal code
  const fetchLocationDetails = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        { headers: { 'Accept-Language': 'ar,en,ku,de,fr' } }
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
        const countryName = addr.country || '';
        const countryCode = (addr.country_code || '').toUpperCase();
        const fullAddr = data.display_name || '';

        onLocationSelect(lat, lon, fullAddr, {
          lat,
          lon,
          address: fullAddr,
          cityName,
          countryName,
          countryCode,
        });
      } else {
        onLocationSelect(lat, lon);
      }
    } catch {
      onLocationSelect(lat, lon);
    }
  };

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
        center: [coords.lat, coords.lon],
        zoom: 13,
      });

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #F59E0B;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          ">
            <span style="font-size: 16px;">📍</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([coords.lat, coords.lon], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setCoords({ lat: position.lat, lon: position.lng });
        fetchLocationDetails(position.lat, position.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
        fetchLocationDetails(e.latlng.lat, e.latlng.lng);
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

  // Sync coords from props if changed externally
  useEffect(() => {
    if (
      initialLatitude !== coords.lat ||
      initialLongitude !== coords.lon
    ) {
      setCoords({ lat: initialLatitude, lon: initialLongitude });
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([initialLatitude, initialLongitude], 13);
        markerRef.current.setLatLng([initialLatitude, initialLongitude]);
      }
    }
  }, [initialLatitude, initialLongitude]);

  // Live Debounced Search Query for anywhere in the world
  useEffect(() => {
    if (!addressSearch.trim() || addressSearch.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(
            addressSearch.trim()
          )}`,
          { headers: { 'Accept-Language': 'ar,en,ku,de,fr' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
          }
        }
      } catch {
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [addressSearch]);

  const selectSuggestion = (item: any) => {
    const newLat = parseFloat(item.lat);
    const newLon = parseFloat(item.lon);
    const addr = item.address || {};
    const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || item.name || addressSearch;
    const countryName = addr.country || '';
    const countryCode = (addr.country_code || '').toUpperCase();

    setCoords({ lat: newLat, lon: newLon });
    setAddressSearch(item.display_name);
    setShowSuggestions(false);

    onLocationSelect(newLat, newLon, item.display_name, {
      lat: newLat,
      lon: newLon,
      address: item.display_name,
      cityName,
      countryName,
      countryCode,
    });

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([newLat, newLon], 14);
      markerRef.current.setLatLng([newLat, newLon]);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`;

  return (
    <div className="space-y-3">
      {/* Live Search Input with Instant Dropdown */}
      <div ref={searchDropdownRef} className="relative">
        <div className="relative">
          <input
            type="text"
            value={addressSearch}
            onChange={(e) => {
              setAddressSearch(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="ابحث عن أي مدينة أو منطقة أو معلم بالعالم (e.g. Lalish, Hannover, Duhok, Sinjar, Berlin, Paris)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </div>
        </div>

        {/* Floating Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-slate-900/98 backdrop-blur-md border border-amber-500/80 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-800">
            <div className="p-2 bg-slate-950 text-[11px] font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>نتائج البحث التلقائي حول العالم:</span>
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectSuggestion(item)}
                className="w-full p-2.5 text-right hover:bg-amber-500/10 text-xs text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Element */}
      <div
        ref={mapContainerRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-slate-700 relative z-10 shadow-inner"
      />

      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-1 gap-2">
        <span className="text-[11px]">
          📍 انقر على أي نقطة في الخريطة أو اسحب المؤشر لتحديد المدينة والإحداثيات تلقائياً.
        </span>

        <div className="flex items-center gap-3">
          <span className="font-mono text-amber-400 font-bold">
            {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
          </span>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
          >
            <span>عرض على Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
