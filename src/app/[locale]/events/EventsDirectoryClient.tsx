'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { EventItem, EventCategory, Country, City } from '@/types/database';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { CalendarX } from 'lucide-react';

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

  const [category, setCategory] = useState('all');
  const [country, setCountry] = useState('all');
  const [city, setCity] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('upcoming');

  const filteredEvents = useMemo(() => {
    let list = [...initialEvents];

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
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.organizer_name && e.organizer_name.toLowerCase().includes(q)) ||
          (e.full_address && e.full_address.toLowerCase().includes(q))
      );
    }

    if (sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'date') {
      list.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      // upcoming
      list.sort((a, b) => a.date.localeCompare(b.date));
    }

    return list;
  }, [initialEvents, category, country, city, status, search, sort, categories, countries]);

  const handleReset = () => {
    setCategory('all');
    setCountry('all');
    setCity('all');
    setStatus('all');
    setSearch('');
    setSort('upcoming');
  };

  return (
    <div className="space-y-6">
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

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white font-mono">{filteredEvents.length}</strong> published events
        </span>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-slate-800">
          <CalendarX className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Events Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {t('noEventsFound')}
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Reset All Filters
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
