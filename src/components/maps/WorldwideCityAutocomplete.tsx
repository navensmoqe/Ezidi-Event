'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Check, Globe, Sparkles, ExternalLink } from 'lucide-react';
import { Country, City } from '@/types/database';

export interface PlaceSuggestion {
  displayName: string;
  cityName: string;
  cityNameAr?: string;
  stateName?: string;
  countryName: string;
  countryCode: string;
  lat: number;
  lon: number;
  type: string;
}

interface WorldwideCityAutocompleteProps {
  countries: Country[];
  selectedCountryId?: string;
  selectedCityName?: string;
  onSelectPlace: (place: PlaceSuggestion) => void;
  placeholder?: string;
  isRtl?: boolean;
}

export function WorldwideCityAutocomplete({
  countries,
  selectedCountryId,
  selectedCityName = '',
  onSelectPlace,
  placeholder,
  isRtl = true,
}: WorldwideCityAutocompleteProps) {
  const [query, setQuery] = useState(selectedCityName);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCityName && selectedCityName !== query) {
      setQuery(selectedCityName);
    }
  }, [selectedCityName]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search as user types in Arabic or English
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const encoded = encodeURIComponent(query.trim());
        // Fetch both localized Arabic & English results with administrative/city priority
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encoded}`,
          {
            headers: {
              'Accept-Language': 'ar,en,ku,de,fr',
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const formatted: PlaceSuggestion[] = data.map((item: any) => {
              const addr = item.address || {};
              const cityName =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.municipality ||
                addr.county ||
                addr.state_district ||
                item.name ||
                query;

              const stateName = addr.state || addr.province || addr.region || '';
              const countryName = addr.country || '';
              const countryCode = (addr.country_code || '').toUpperCase();

              return {
                displayName: item.display_name,
                cityName: cityName,
                stateName: stateName,
                countryName: countryName,
                countryCode: countryCode,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                type: item.type || item.class || 'place',
              };
            });

            // Filter duplicates by city+country
            const unique = formatted.filter(
              (v, i, a) =>
                a.findIndex(
                  (t) => t.cityName === v.cityName && t.countryCode === v.countryCode
                ) === i
            );

            setSuggestions(unique);
            setIsOpen(unique.length > 0);
          }
        }
      } catch (err) {
        console.error('Location search failed', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (place: PlaceSuggestion) => {
    setQuery(place.cityName);
    setIsOpen(false);
    onSelectPlace(place);
  };

  const getCountryFlag = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div ref={dropdownRef} className="relative w-full space-y-1.5">
      <div className="relative">
        <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`}>
          {loading ? (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-amber-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={
            placeholder ||
            (isRtl
              ? 'اكتب اسم أي مدينة أو منطقة بالعالم (مثل: لالش، هانوفر، دهوك، شنكال، برلين، باريس)...'
              : 'Type any city or region worldwide (e.g. Lalish, Hanover, Duhok, Sinjar, Berlin)...')
          }
          className={`w-full py-2.5 rounded-xl bg-slate-900 border border-amber-500/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner ${
            isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
      </div>

      {/* Real-time Suggestions Floating Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900/98 backdrop-blur-md border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-800/80 animate-in fade-in zoom-in-95">
          <div className="p-2 bg-slate-950/80 text-[11px] font-bold text-amber-400 flex items-center justify-between border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRtl ? 'اقتراحات المدن والمناطق حول العالم تلقائياً:' : 'Worldwide Location Suggestions:'}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Google Maps / OpenStreetMap</span>
          </div>

          {suggestions.map((item, idx) => (
            <button
              key={`${item.cityName}-${item.countryCode}-${idx}`}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full p-3 text-left hover:bg-amber-500/10 transition-colors flex items-start gap-3 group text-xs cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base shrink-0 group-hover:border-amber-500/60">
                {getCountryFlag(item.countryCode)}
              </div>

              <div className="flex-1 overflow-hidden space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                    {item.cityName}
                  </span>
                  {item.stateName && item.stateName !== item.cityName && (
                    <span className="text-[11px] text-slate-400 truncate">
                      ({item.stateName})
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="font-semibold text-slate-300">{item.countryName}</span>
                  <span>•</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {item.lat.toFixed(3)}, {item.lon.toFixed(3)}
                  </span>
                </div>
              </div>

              <span className="text-[10px] text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0">
                {isRtl ? 'اختيار ✓' : 'Select ✓'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
