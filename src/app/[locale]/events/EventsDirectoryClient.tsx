'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { EventItem, EventCategory, Country, City } from '@/types/database';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { CalendarX, Sparkles } from 'lucide-react';

interface EventsDirectoryClientProps {
  initialEvents: EventItem[];
  categories: EventCategory[];
  countries: Country[];
  cities: City[];
}

export function EventsDirectoryClient({
  initialEvents,
  categories,
  countries,
  cities,
}: EventsDirectoryClientProps) {
  const t = useTranslations('events');
  const [allEvents, setAllEvents] = useState<EventItem[]>(initialEvents);

  const [category, setCategory] = useState('all');
  const [country, setCountry] = useState('all');
  const [city, setCity] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest'); // Default to newest to show newly created events first!

  // Client-side instant synchronization with submitted events & API
  useEffect(() => {
    // 1. Sync from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('ezidi_submitted_events') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        setAllEvents((prev) => {
          const map = new Map<string, EventItem>();
          stored.forEach((e: EventItem) => {
            if (e && e.id) {
              map.set(e.id, { ...e, status: 'published', visibility: 'public' });
            }
          });
          prev.forEach((e) => {
            if (e && e.id && !map.has(e.id)) {
              map.set(e.id, e);
            }
          });
          return Array.from(map.values());
        });
      }
    } catch {}

    // 2. Fetch fresh events from /api/events
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        const eventsList = Array.isArray(data) ? data : data?.events || [];
        if (Array.isArray(eventsList) && eventsList.length > 0) {
          setAllEvents((prev) => {
            const map = new Map<string, EventItem>();
            eventsList.forEach((e: EventItem) => {
              if (e && e.id && (e.status === 'published' || e.visibility === 'public')) {
                map.set(e.id, e);
              }
            });
            prev.forEach((e) => {
              if (e && e.id && !map.has(e.id)) {
                map.set(e.id, e);
              }
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  const filteredEvents = useMemo(() => {
    let list = [...allEvents];

    if (category !== 'all') {
      const catObj = categories.find((c) => c.slug === category);
      if (catObj) list = list.filter((e) => e.category_id === catObj.id);
    }

    if (country !== 'all') {
      const cntObj = countries.find((c) => c.code === country);
      if (cntObj) list = list.filter((e) => e.country_id === cntObj.id);
    }

    if (city !== 'all') {
      list = list.filter((e) => e.city_id === city);
    }

    if (status !== 'all') {
      list = list.filter((e) => e.status === status);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.organizer_name?.toLowerCase().includes(q) ||
          e.full_address?.toLowerCase().includes(q) ||
          e.city_id?.toLowerCase().includes(q) ||
          e.country_id?.toLowerCase().includes(q)
      );
    }

    if (sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
    } else if (sort === 'date') {
      list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    } else {
      // upcoming
      list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    }

    return list;
  }, [allEvents, category, country, city, status, search, sort, categories, countries]);

  const handleReset = () => {
    setCategory('all');
    setCountry('all');
    setCity('all');
    setStatus('all');
    setSearch('');
    setSort('newest');
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <EventFilters
        categories={categories}
        countries={countries}
        cities={cities}
        selectedCategory={category}
        selectedCountry={country}
        selectedCity={city}
        selectedStatus={status}
        searchQuery={search}
        sortBy={sort}
        onCategoryChange={setCategory}
        onCountryChange={setCountry}
        onCityChange={setCity}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
        onSortChange={setSort}
        onReset={handleReset}
      />

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <CalendarX className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">{t('noEventsFound')}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">{t('noEventsSubtitle')}</p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition-colors"
          >
            {t('resetFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
