'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

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
  const [isSearching, setIsSearching] = useState(false);

  // Reverse geocoding helper to extract city, country, postal code
  const fetchLocationDetails = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
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

  // Worldwide geocoding search query using OpenStreetMap Nominatim
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressSearch.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(addressSearch)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        const newLat = parseFloat(first.lat);
        const newLon = parseFloat(first.lon);
        const addr = first.address || {};
        const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || addressSearch;
        const countryName = addr.country || '';
        const countryCode = (addr.country_code || '').toUpperCase();

        setCoords({ lat: newLat, lon: newLon });
        onLocationSelect(newLat, newLon, first.display_name, {
          lat: newLat,
          lon: newLon,
          address: first.display_name,
          cityName,
          countryName,
          countryCode,
        });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLon], 14);
          markerRef.current.setLatLng([newLat, newLon]);
        }
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={addressSearch}
          onChange={(e) => setAddressSearch(e.target.value)}
          placeholder="ابحث عن أي مدينة أو شارع أو موقع في العالم (e.g. Lalish, Berlin, Erbil, Paris, Lincoln)..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-all"
        >
          <Search className="w-4 h-4" />
          <span>{isSearching ? 'جاري البحث...' : 'تحديد الموقع'}</span>
        </button>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-slate-700 relative z-10"
      />

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>انقر على أي نقطة في الخريطة أو اسحب المؤشر لتحديد المدينة والعنوان تلقائياً.</span>
        <span className="font-mono text-amber-400">
          {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
        </span>
      </div>
    </div>
  );
}
