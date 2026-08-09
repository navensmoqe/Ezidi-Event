'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { EventCategory, Country, City } from '@/types/database';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface EventFiltersProps {
  categories: EventCategory[];
  countries: Country[];
  cities: City[];
  selectedCategory: string;
  selectedCountry: string;
  selectedCity: string;
  selectedStatus: string;
  searchQuery: string;
  sortBy: string;
  onCategoryChange: (cat: string) => void;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

export function EventFilters({
  categories,
  countries,
  cities,
  selectedCategory,
  selectedCountry,
  selectedCity,
  selectedStatus,
  searchQuery,
  sortBy,
  onCategoryChange,
  onCountryChange,
  onCityChange,
  onStatusChange,
  onSearchChange,
  onSortChange,
  onReset,
}: EventFiltersProps) {
  const locale = useLocale();
  const t = useTranslations('events');
  const common = useTranslations('common');

  const filteredCities = selectedCountry && selectedCountry !== 'all'
    ? cities.filter((c) => {
        const matchingCountry = countries.find((cnt) => cnt.code === selectedCountry || cnt.id === selectedCountry);
        return matchingCountry ? c.country_id === matchingCountry.id : true;
      })
    : cities;

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-slate-800 mb-8 space-y-4">
      {/* Top row: Search Bar & Sort */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={common('searchPlaceholder')}
            className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium shrink-0">
            {t('sortBy')}:
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="upcoming">{t('sortUpcoming')}</option>
            <option value="newest">{t('sortNewest')}</option>
            <option value="date">{t('sortDate')}</option>
          </select>
        </div>
      </div>

      {/* Filter Row: Category, Country, City, Status, Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800/80">
        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            {t('filterByCategory')}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">{common('allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {locale === 'ar'
                  ? cat.name_ar
                  : locale === 'de'
                  ? cat.name_de
                  : locale === 'fr'
                  ? cat.name_fr
                  : cat.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            {t('filterByCountry')}
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              onCountryChange(e.target.value);
              onCityChange('all');
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">{common('allCountries')}</option>
            {countries.map((cnt) => (
              <option key={cnt.id} value={cnt.code}>
                {locale === 'ar'
                  ? cnt.name_ar
                  : locale === 'de'
                  ? cnt.name_de
                  : locale === 'fr'
                  ? cnt.name_fr
                  : cnt.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            {t('filterByCity')}
          </label>
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">{common('allCities')}</option>
            {filteredCities.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {locale === 'ar'
                  ? ct.name_ar
                  : locale === 'de'
                  ? ct.name_de
                  : locale === 'fr'
                  ? ct.name_fr
                  : ct.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            {t('filterByStatus')}
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">All Public Statuses</option>
            <option value="published">Published & Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="postponed">Postponed</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{common('reset')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
