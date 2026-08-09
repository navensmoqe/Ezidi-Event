'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { EventCategory, Country, City, Organization } from '@/types/database';
import { POPULAR_TIMEZONES } from '@/lib/utils/timezone';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { createEventAction } from '@/lib/actions/events';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Building2,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

interface AddEventClientFormProps {
  categories: EventCategory[];
  countries: Country[];
  cities: City[];
  organizations: Organization[];
}

export function AddEventClientForm({
  categories,
  countries,
  cities,
  organizations,
}: AddEventClientFormProps) {
  const t = useTranslations('addEvent');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    category_id: categories[0]?.id || '',
    date: '',
    start_time: '16:00',
    end_time: '19:00',
    timezone: 'Europe/Berlin',
    country_id: countries[0]?.id || '',
    city_id: cities[0]?.id || '',
    full_address: 'Pariser Platz 1, 10117 Berlin, Germany',
    latitude: 52.5163,
    longitude: 13.3777,
    organization_id: '',
    organizer_name: '',
    poster_url: '',
    source_url: '',
    contact_email: '',
    contact_phone: '',
    official_website: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [resultEvent, setResultEvent] = useState<any>(null);

  const filteredCities = countries.find((c) => c.id === formData.country_id)
    ? cities.filter((c) => c.country_id === formData.country_id)
    : cities;

  const handleLocationSelect = (lat: number, lon: number, address?: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      full_address: address || prev.full_address,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDuplicateWarning(null);

    const res = await createEventAction(formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to submit event.');
    } else {
      setResultEvent(res);
      if (res.potentialDuplicateWarning) {
        setDuplicateWarning(res.potentialDuplicateWarning);
      }
    }
  };

  if (resultEvent) {
    const isDirect = resultEvent.isPublishedDirectly;
    return (
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 text-center space-y-6 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
          ✓
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {isDirect ? 'Event Published Successfully!' : 'Event Submitted for Review'}
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            {isDirect
              ? 'Your event was published directly by your verified organization and is now live on the public website and world map.'
              : 'Your submission has been received and entered into our moderation queue. Our team reviews all public submissions to ensure accurate details.'}
          </p>
        </div>

        {duplicateWarning && (
          <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2 max-w-md mx-auto text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Similar event notice: {duplicateWarning}</span>
          </div>
        )}

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          {isDirect ? (
            <button
              onClick={() => router.push(`/events/${resultEvent.event.slug}`)}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md"
            >
              View Live Event Page →
            </button>
          ) : (
            <button
              onClick={() => router.push('/events')}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md"
            >
              Back to Directory
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>1. Event Title & Category</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldTitle')} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Berlin Solidarity Rally for Yazidi Justice"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldTitleAr')}
            </label>
            <input
              type="text"
              dir="rtl"
              value={formData.title_ar}
              onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
              placeholder="عنوان الفعالية بالعربية..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldCategory')} *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === 'ar' ? cat.name_ar : cat.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Date, Time & IANA Timezone */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>2. Date, Time & Timezone</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldDate')} *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldStartTime')} *
            </label>
            <input
              type="time"
              required
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldEndTime')}
            </label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldTimezone')} *
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {POPULAR_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} ({tz.value})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Geographic Venue & Map Picker */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>3. Geographic Venue & Map Pin</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldCountry')} *
            </label>
            <select
              value={formData.country_id}
              onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === 'ar' ? c.name_ar : c.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldCity')} *
            </label>
            <select
              value={formData.city_id}
              onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {filteredCities.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {locale === 'ar' ? ct.name_ar : ct.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldAddress')} *
            </label>
            <input
              type="text"
              required
              value={formData.full_address}
              onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
              placeholder="e.g. Pariser Platz 1, 10117 Berlin"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Interactive Map Coordinate Pin
            </label>
            <LocationPicker
              initialLatitude={formData.latitude}
              initialLongitude={formData.longitude}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Details & Organizer */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>4. Organization, Description & Sources</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Verified Organization (Optional)
            </label>
            <select
              value={formData.organization_id}
              onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="">Independent Community Submission</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} {org.direct_publishing_enabled ? '(Direct Publish Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Organizer Name (If independent)
            </label>
            <input
              type="text"
              value={formData.organizer_name}
              onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
              placeholder="e.g. Diaspora Youth Coalition"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldDescription')} *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline the schedule, speakers, memorial moments, or purpose of the event..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldPoster')}
            </label>
            <input
              type="url"
              value={formData.poster_url}
              onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
              placeholder="https://example.org/poster.jpg"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldSource')}
            </label>
            <input
              type="url"
              value={formData.source_url}
              onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
              placeholder="https://example.org/press-release"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldContactEmail')}
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="organizer@community.org"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Official Website (Optional)
            </label>
            <input
              type="url"
              value={formData.official_website}
              onChange={(e) => setFormData({ ...formData, official_website: e.target.value })}
              placeholder="https://organization.org"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-4">
        <button
          type="submit"
          disabled={loading || formData.title.length < 3 || formData.description.length < 10}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Submitting & Validating...' : t('submitButton')}
        </button>
      </div>
    </form>
  );
}
