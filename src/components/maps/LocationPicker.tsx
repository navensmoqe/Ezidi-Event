'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

interface LocationPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect: (lat: number, lon: number, address?: string) => void;
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
        onLocationSelect(position.lat, position.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
        onLocationSelect(e.latlng.lat, e.latlng.lng);
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

  // Quick geocoding query using OpenStreetMap Nominatim
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressSearch.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        const newLat = parseFloat(first.lat);
        const newLon = parseFloat(first.lon);

        setCoords({ lat: newLat, lon: newLon });
        onLocationSelect(newLat, newLon, first.display_name);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLon], 15);
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
          placeholder="Search place, street, or city (e.g. Pariser Platz Berlin)..."
          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs sm:text-sm border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{isSearching ? 'Searching...' : 'Locate'}</span>
        </button>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-slate-700 relative z-10"
      />

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Click on map or drag pin to position venue.</span>
        <span className="font-mono text-amber-400">
          {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
        </span>
      </div>
    </div>
  );
}
