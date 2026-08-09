'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

interface OrgAddEventClientFormProps {
  categories: EventCategory[];
  countries: Country[];
  cities: City[];
  organizations: Organization[];
}

export function OrgAddEventClientForm({
  categories,
  countries,
  cities,
  organizations,
}: OrgAddEventClientFormProps) {
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
    organization_id: organizations[0]?.id || '',
    organizer_name: organizations[0]?.name || '',
    poster_url: '',
    source_url: '',
    contact_email: organizations[0]?.email || '',
    contact_phone: '',
    official_website: organizations[0]?.website || '',
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

    const userContext = {
      id: 'user-org-owner',
      role: 'organization_owner' as any,
      email: formData.contact_email || 'berlin@demo-yazidi.org',
    };

    const res = await createEventAction(formData, userContext);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to publish event.');
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
            {isDirect ? 'Event Published Directly Live!' : 'Event Submitted for Verification'}
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            {isDirect
              ? 'Your verified organization has published this event live to the global directory and world map.'
              : 'Your event has been submitted to the administrative moderation queue.'}
          </p>
        </div>

        {duplicateWarning && (
          <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2 max-w-md mx-auto text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Similar event notice: {duplicateWarning}</span>
          </div>
        )}

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => router.push('/organization/events')}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md"
          >
            Manage Organization Events →
          </button>
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

      {/* 1. Title & Category */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>1. Event Title & Category</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Yazidi Solidarity March"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Arabic Title (Optional)
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
              Event Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Date, Time & Timezone */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>2. Schedule & Timezone</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Event Date *
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
              Start Time *
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
              End Time (Optional)
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
              IANA Timezone *
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

      {/* 3. Venue & Coordinates */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>3. Venue & Map Location</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Country *
            </label>
            <select
              value={formData.country_id}
              onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              City *
            </label>
            <select
              value={formData.city_id}
              onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {filteredCities.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Complete Venue Address *
            </label>
            <input
              type="text"
              required
              value={formData.full_address}
              onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Interactive Map Pin
            </label>
            <LocationPicker
              initialLatitude={formData.latitude}
              initialLongitude={formData.longitude}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>
      </div>

      {/* 4. Description & Details */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>4. Description & Evidence</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Event Description & Program *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline the schedule, speakers, and goals of this event..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Poster Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                placeholder="https://example.org/poster.jpg"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Press Release / Source URL
              </label>
              <input
                type="url"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                placeholder="https://organization.org/press-release"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={loading || formData.title.length < 3 || formData.description.length < 10}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish Event'}
        </button>
      </div>
    </form>
  );
}
